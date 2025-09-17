import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./contexts/AuthContext.jsx";
import {useSessionTimer} from "../utils/useSessionTimer.js";
import {formatChile} from "../utils/formatChile.js";

const GRACE_MS = 10_000;
const STORAGE_PREFIX = "graceRedirectDeadline_";

// --- helpers robustos ---
function parseExpFromJwt(token) {
    if (!token || typeof token !== "string" || token.split(".").length !== 3) return null;
    try {
        const [, payload] = token.split(".");
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        const data = JSON.parse(decodeURIComponent(escape(json)));
        return typeof data.exp === "number" ? data.exp : null;
    } catch {
        return null;
    }
}

function tryGetExpFromKnownStorageKeys() {
    // Escanea sessionStorage buscando estructuras comunes { user: { exp }, token } o un token suelto
    try {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const raw = sessionStorage.getItem(key);
            if (!raw) continue;

            // 1) Si parece JWT directo
            if (typeof raw === "string" && raw.includes(".") && raw.length > 100) {
                const exp = parseExpFromJwt(raw);
                if (Number.isFinite(exp)) return {token: raw, exp};
            }

            // 2) Si es JSON con forma { token, user: { exp } } u otras variantes
            if (raw.startsWith("{") || raw.startsWith("[")) {
                try {
                    const parsed = JSON.parse(raw);

                    // user.exp
                    const expUser = Number(parsed?.user?.exp);
                    if (Number.isFinite(expUser)) {
                        const token = typeof parsed?.token === "string" ? parsed.token : null;
                        return {token, exp: expUser};
                    }

                    // token en JSON
                    const tokenJson = typeof parsed?.token === "string" ? parsed.token : null;
                    const expFromTokenJson = parseExpFromJwt(tokenJson);
                    if (Number.isFinite(expFromTokenJson)) {
                        return {token: tokenJson, exp: expFromTokenJson};
                    }

                    // otras claves típicas
                    const access = typeof parsed?.accessToken === "string" ? parsed.accessToken : null;
                    const expFromAccess = parseExpFromJwt(access);
                    if (Number.isFinite(expFromAccess)) {
                        return {token: access, exp: expFromAccess};
                    }
                } catch {
                    // ignore JSON parse errors
                }
            }
        }
    } catch {
        // ignore storage access errors
    }
    return {token: null, exp: null};
}

export default function SessionExpiryBadge({onExpire, onRefresh}) {
    const {user, token: ctxToken} = useAuth(); // si tu useAuth no expone token, no pasa nada, tenemos fallback
    const navigate = useNavigate();

    // 1) exp principal desde useAuth (forzado a number)
    const expFromContext = useMemo(() => {
        const n = Number(user?.exp);
        return Number.isFinite(n) ? n : null;
    }, [user]);

    // 2) fallback desde sessionStorage (genérico, sin asumir una key)
    const [storageFallback, setStorageFallback] = useState({token: null, exp: null});
    useEffect(() => {
        if (expFromContext == null) {
            setStorageFallback(tryGetExpFromKnownStorageKeys());
        }
        // si ya tenemos exp del contexto, no hace falta escanear
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expFromContext]);

    // 3) último fallback: decodificar el token del contexto
    const expFromCtxToken = useMemo(() => parseExpFromJwt(ctxToken), [ctxToken]);

    // 4) exp efectivo (el primero disponible)
    const exp = useMemo(
        () => expFromContext ?? storageFallback.exp ?? expFromCtxToken ?? null,
        [expFromContext, storageFallback.exp, expFromCtxToken]
    );

    const {hhmmss, isExpired, shouldProactiveRefresh, expMs} = useSessionTimer(exp);

    // ======= Gracia persistente (sobrevive F5) =======
    const storageKey = useMemo(() => (exp ? `${STORAGE_PREFIX}${exp}` : null), [exp]);
    const [graceDeadline, setGraceDeadline] = useState(null);
    const [graceRemainingMs, setGraceRemainingMs] = useState(0);

    // Expiración normal
    useEffect(() => {
        if (isExpired && typeof onExpire === "function") onExpire();
    }, [isExpired, onExpire]);

    // Arrancar/parar el periodo de gracia (persistente por exp)
    useEffect(() => {
        if (!storageKey) return;

        if (shouldProactiveRefresh) {
            const stored = sessionStorage.getItem(storageKey);
            let deadline = stored ? parseInt(stored, 10) : NaN;

            if (!stored || Number.isNaN(deadline) || deadline <= Date.now()) {
                deadline = Date.now() + GRACE_MS;
                sessionStorage.setItem(storageKey, String(deadline));
            }
            setGraceDeadline(deadline);
        } else {
            if (sessionStorage.getItem(storageKey)) sessionStorage.removeItem(storageKey);
            setGraceDeadline(null);
            setGraceRemainingMs(0);
        }
    }, [shouldProactiveRefresh, storageKey]);

    // Ticker del grace y redirección cuando vence
    useEffect(() => {
        if (!graceDeadline) return;
        const id = setInterval(() => {
            const remaining = Math.max(0, graceDeadline - Date.now());
            setGraceRemainingMs(remaining);
            if (remaining === 0) {
                if (storageKey) sessionStorage.removeItem(storageKey);
                navigate("/");
            }
        }, 250);
        return () => clearInterval(id);
    }, [graceDeadline, navigate, storageKey]);

    // Estados iniciales (ya con fallbacks aplicados)
    if (exp == null || !expMs) {
        return <span>Sesión: información no disponible</span>;
    }

    const expLocalChile = new Date(expMs);

    const handleRefreshClick = async () => {
        if (storageKey) sessionStorage.removeItem(storageKey);
        setGraceDeadline(null);
        setGraceRemainingMs(0);
        if (typeof onRefresh === "function") {
            await onRefresh(); // debe actualizar user.exp en AuthContext y/o storage
        }
    };

    const graceSeconds = Math.ceil(graceRemainingMs / 1000);

    return (
        <div style={{display: "inline-flex", gap: 8, alignItems: "center"}}>
      <span title={`Expira: ${formatChile(expLocalChile)} (America/Santiago)`}>
        ⏳ Sesión: {isExpired ? "expirada" : hhmmss} restantes
      </span>
            {!isExpired && (
                <small style={{opacity: 0.7}}>
                    (expira: {formatChile(expLocalChile)})
                </small>
            )}

            {shouldProactiveRefresh && (
                <>
                    <button onClick={handleRefreshClick} style={{marginLeft: 8}}>
                        Renovar sesión
                    </button>
                    {graceDeadline && (
                        <small style={{opacity: 0.8}}>&nbsp;— redirige en {graceSeconds}s</small>
                    )}
                </>
            )}
        </div>
    );
}