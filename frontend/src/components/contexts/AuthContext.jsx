// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

const SS_USER = "user";
const SS_TOKEN = "token";
const SS_REFRESH = "refresh";

const normalizeToken = (t) => (t && t.startsWith("Bearer ")) ? t.slice(7) : t;
const decodeSafe = (t) => {
    try {
        return t ? jwtDecode(t) : null;
    } catch {
        return null;
    }
};
const isExpired = (expSec) => !Number.isFinite(expSec) || expSec * 1000 <= Date.now();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const rawUser = sessionStorage.getItem(SS_USER);
                const rawAccess = sessionStorage.getItem(SS_TOKEN);
                const rawRefresh = sessionStorage.getItem(SS_REFRESH);

                const access = normalizeToken(rawAccess);
                const refresh = normalizeToken(rawRefresh);

                // 1) Si ya hay user guardado, úsalo sin borrar storage
                if (rawUser) {
                    try {
                        const parsed = JSON.parse(rawUser);
                        const tok = normalizeToken(parsed?.token) || access;
                        const dec = decodeSafe(tok);
                        const exp = Number(parsed?.exp ?? dec?.exp);

                        if (tok && dec && !isExpired(exp)) {
                            const enriched = { ...parsed, ...dec, token: tok, exp };
                            if (!mounted) return;
                            setUser(enriched);
                            setIsAuth(true);
                            // normaliza persistencia sin borrar nada
                            sessionStorage.setItem(SS_USER, JSON.stringify(enriched));
                            if (tok) sessionStorage.setItem(SS_TOKEN, tok);
                            if (refresh) sessionStorage.setItem(SS_REFRESH, refresh);
                            return;
                        }
                    } catch { /* sigue con token */
                    }
                }

                // 2) Si no hay user pero sí access válido
                if (access) {
                    const dec = decodeSafe(access);
                    const exp = Number(dec?.exp);
                    if (dec && !isExpired(exp)) {
                        const enriched = { ...dec, token: access, exp };
                        if (!mounted) return;
                        setUser(enriched);
                        setIsAuth(true);
                        sessionStorage.setItem(SS_USER, JSON.stringify(enriched)); // ⚠️ no se borra nada
                        return;
                    }
                }

                // 3) Access expirado o ausente: intenta auto-refresh si hay refresh
                if (refresh) {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/refresh`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${refresh}` },
                        });
                        if (!res.ok) throw new Error(`Refresh ${res.status}`);
                        const data = await res.json();

                        const newAccess = normalizeToken(data.token);
                        const newRefresh = normalizeToken(data.refresh) || refresh;
                        const dec = decodeSafe(newAccess);
                        const exp = Number(data.exp ?? dec?.exp);

                        if (!dec || isExpired(exp)) throw new Error("Access inválido tras refresh");

                        const enriched = { ...dec, token: newAccess, exp };
                        if (!mounted) return;
                        setUser(enriched);
                        setIsAuth(true);
                        sessionStorage.setItem(SS_USER, JSON.stringify(enriched));  // ⚠️ escribimos, no borramos
                        sessionStorage.setItem(SS_TOKEN, newAccess);
                        sessionStorage.setItem(SS_REFRESH, newRefresh);
                        return;
                    } catch (e) {
                        // ⚠️ IMPORTANTE: NO borrar storage aquí en el arranque.
                        // Solo marcamos no autenticado; el usuario podrá reintentar manualmente.
                        if (!mounted) return;
                        setUser(null);
                        setIsAuth(false);
                        return;
                    }
                }

                // 4) No hay nada válido → solo estado, NO limpiar storage aquí
                if (!mounted) return;
                setUser(null);
                setIsAuth(false);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const fakeLogin = () => {
        const mockUser = {
            roles: ["ROLE_ADMINISTRADOR", "ROLE_JEFE", "ROLE_FUNCIONARIO"],
            isAuthenticated: true,
            nombreCargo: "",
            nombreUsuario: "ENZO ALEJANDRO RAMIREZ SILVA",
            nombreUnidad: "PLANA MAYOR DE LA SUBDIPOL",
            siglasUnidad: "PMSUBDIPOL",
            isAdmin: true,
            idFuncionario: 12254
        }
        setUser(mockUser);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(mockUser));

        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        const FAKE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOSVNUUkFET1IiLCJST0xFX0pFRkUiLCJST0xFX0ZVTkNJT05BUklPIl0sIm5vbWJyZVVzdWFyaW8iOiJFTlpPIEFMRUpBTkRSTyBSQU1JUkVaIFNJTFZBIiwibm9tYnJlVW5pZGFkIjoiUExBTkEgTUFZT1IgREUgTEEgU1VCRElQT0wiLCJzaWdsYXNVbmlkYWQiOiJQTVNVQkRJUE9MIiwiaXNBZG1pbiI6dHJ1ZSwic3ViIjoiRVJBTUlSRVpTIiwiaWF0IjoxNjc4ODg2NDAwLCJleHAiOjk5OTk5OTk5OTl9.Mz09GJfnGENN1GmoKfKTQfZUMGh51NQJeR7eEPRQnrs";
        sessionStorage.setItem(SS_TOKEN, FAKE_JWT);
    }

    const login = async (credentials) => {

        // if (import.meta.env.VITE_MODE_ACTUAL === "desarrollo") {
        //     fakeLogin();
        //     return;
        // }

        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const access = normalizeToken(data.token);
        const refresh = normalizeToken(data.refresh);
        const dec = decodeSafe(access);
        const exp = Number(data.exp ?? dec?.exp);
        const enriched = { ...(dec || {}), token: access, exp };

        setUser(enriched);
        console.log(enriched);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(enriched));
        sessionStorage.setItem(SS_TOKEN, access);
        if (refresh) sessionStorage.setItem(SS_REFRESH, refresh);
        return enriched;
    };

    const renewAccessToken = async () => {
        const refresh = normalizeToken(sessionStorage.getItem(SS_REFRESH));
        if (!refresh) throw new Error("No hay refresh token");
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/refresh`, {
            method: "POST",
            headers: { Authorization: `Bearer ${refresh}` },
        });
        if (!res.ok) throw new Error(`Refresh fallido (${res.status})`);
        const data = await res.json();

        const access = normalizeToken(data.token);
        const newRef = normalizeToken(data.refresh) || refresh;
        const dec = decodeSafe(access);
        const exp = Number(data.exp ?? dec?.exp);
        const enriched = { ...(user || {}), ...(dec || {}), token: access, exp };

        setUser(enriched);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(enriched));
        sessionStorage.setItem(SS_TOKEN, access);
        sessionStorage.setItem(SS_REFRESH, newRef);
        return enriched;
    };

    const refreshLocal = (newToken) => {
        const access = normalizeToken(newToken);
        const dec = decodeSafe(access);
        const exp = Number(dec?.exp);
        const enriched = { ...(user || {}), ...(dec || {}), token: access, exp };
        setUser(enriched);
        setIsAuth(true);
        sessionStorage.setItem(SS_USER, JSON.stringify(enriched));
        sessionStorage.setItem(SS_TOKEN, access);
    };

    const logout = () => {
        setUser(null);
        setIsAuth(false);
        // Limpieza SOLO aquí
        sessionStorage.removeItem(SS_USER);
        sessionStorage.removeItem(SS_TOKEN);
        sessionStorage.removeItem(SS_REFRESH);
    };

    const token = user?.token || null;

    return (
        <AuthContext.Provider
            value={{ user, isAuth, loading, token, login, renewAccessToken, refresh: refreshLocal, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);