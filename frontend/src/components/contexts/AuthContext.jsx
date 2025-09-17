// AuthContext.js
import React, {createContext, useContext, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext(null);

// Claves en sessionStorage (mantener compatibilidad)
const SS_USER = "user";
const SS_TOKEN = "token"; // access token
const SS_REFRESH = "refresh"; // refresh token (nuevo)

// Por si, por error, guardaste "Bearer <token>"
function normalizeToken(t) {
    if (!t || typeof t !== "string") return null;
    return t.startsWith("Bearer ") ? t.slice(7) : t;
}

function parseExpFromJwt(token) {
    if (!token || typeof token !== "string" || token.split(".").length !== 3) return null;
    try {
        const [, payload] = token.split(".");
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        const data = JSON.parse(decodeURIComponent(escape(json)));
        return typeof data.exp === "number" ? data.exp : null; // seconds epoch
    } catch {
        return null;
    }
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    // Rehidratación al montar con validación robusta
    useEffect(() => {
        try {
            const storedUserRaw = sessionStorage.getItem(SS_USER);
            const storedTokenRaw = sessionStorage.getItem(SS_TOKEN);
            const storedRefreshRaw = sessionStorage.getItem(SS_REFRESH);
            const token = normalizeToken(storedTokenRaw);
            const refresh = normalizeToken(storedRefreshRaw);

            const trySetFromDecoded = (tok) => {
                try {
                    const decoded = jwtDecode(tok);
                    const exp = Number(decoded?.exp);
                    if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) {
                        // expirado
                        sessionStorage.removeItem(SS_USER);
                        sessionStorage.removeItem(SS_TOKEN);
                        return false;
                    }
                    const enrichedUser = { ...decoded, token: tok, exp };
                    setUser(enrichedUser);
                    setIsAuth(true);
                    sessionStorage.setItem(SS_USER, JSON.stringify(enrichedUser));
                    if (refresh) sessionStorage.setItem(SS_REFRESH, refresh);
                    return true;
                } catch {
                    sessionStorage.removeItem(SS_USER);
                    sessionStorage.removeItem(SS_TOKEN);
                    return false;
                }
            };

            // 1) Preferir user guardado si válido
            if (storedUserRaw) {
                try {
                    const parsedUser = JSON.parse(storedUserRaw);
                    const tok = normalizeToken(parsedUser?.token) || token;
                    const exp = Number(parsedUser?.exp) || parseExpFromJwt(tok);
                    if (tok && Number.isFinite(exp) && exp * 1000 > Date.now()) {
                        const enrichedUser = { ...parsedUser, token: tok, exp };
                        setUser(enrichedUser);
                        setIsAuth(true);
                        // normalizar persistencia
                        sessionStorage.setItem(SS_USER, JSON.stringify(enrichedUser));
                        if (tok) sessionStorage.setItem(SS_TOKEN, tok);
                        if (refresh) sessionStorage.setItem(SS_REFRESH, refresh);
                        setLoading(false);
                        return;
                    }
                } catch {
                    // seguir a token
                }
            }

            // 2) Si no hay user válido, pero hay token válido → reconstruir user
            if (token) {
                const ok = trySetFromDecoded(token);
                if (ok) {
                    setLoading(false);
                    return;
                }
            }

            // 3) Nada válido → limpiar
            sessionStorage.removeItem(SS_USER);
            sessionStorage.removeItem(SS_TOKEN);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login
    const login = async (credentials) => {
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(credentials),
        });

        if (!res.ok) {
            const ct = res.headers.get("content-type") || "";
            const msg = ct.includes("application/json")
                ? (await res.json()).message || `Login fallido (${res.status})`
                : (await res.text()) || `Login fallido (${res.status})`;
            throw new Error(msg);
        }

        const data = await res.json();
        const token = normalizeToken(data.token);
        const refresh = normalizeToken(data.refresh);
        const decoded = jwtDecode(token);
        const exp = Number(data.exp) || Number(decoded?.exp);

        const enrichedUser = { ...decoded, token, exp };
        setUser(enrichedUser);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(enrichedUser));
        sessionStorage.setItem(SS_TOKEN, token);
        if (refresh) sessionStorage.setItem(SS_REFRESH, refresh);
        return enrichedUser;
    };

    // Renovar access token contra backend usando refresh almacenado
    const renewAccessToken = async () => {
        const refresh = normalizeToken(sessionStorage.getItem(SS_REFRESH));
        if (!refresh) throw new Error("No hay refresh token");
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refresh}`,
            },
        });
        if (!res.ok) {
            throw new Error(`Refresh fallido (${res.status})`);
        }
        const data = await res.json();
        const newToken = normalizeToken(data.token);
        const decoded = jwtDecode(newToken);
        const exp = Number(data.exp) || Number(decoded?.exp);
        const enrichedUser = { ...(user || {}), ...decoded, token: newToken, exp };
        setUser(enrichedUser);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(enrichedUser));
        sessionStorage.setItem(SS_TOKEN, newToken);
        // si el backend devuelve refresh rotado, lo aceptamos
        if (data.refresh) sessionStorage.setItem(SS_REFRESH, normalizeToken(data.refresh));
        return enrichedUser;
    };

    // Refresh local (si ya tienes el token nuevo por fuera)
    const refreshLocal = (newToken) => {
        const token = normalizeToken(newToken);
        const decoded = jwtDecode(token);
        const exp = Number(decoded?.exp);
        const enrichedUser = {...(user || {}), ...decoded, token, exp};
        setUser(enrichedUser);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(enrichedUser));
        sessionStorage.setItem(SS_TOKEN, token);
    };

    // Logout
    const logout = () => {
        setUser(null);
        setIsAuth(false);
        sessionStorage.removeItem(SS_USER);
        sessionStorage.removeItem(SS_TOKEN);
        sessionStorage.removeItem(SS_REFRESH);
    };

    const token = user?.token || null;

    return (
        <AuthContext.Provider value={{user, isAuth, loading, token, login, renewAccessToken, refresh: refreshLocal, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
