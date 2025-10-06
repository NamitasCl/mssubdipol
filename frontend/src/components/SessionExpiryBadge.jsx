import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./contexts/AuthContext.jsx";
import {useSessionTimer} from "../utils/useSessionTimer.js";
import {formatChile} from "../utils/formatChile.js";

const GRACE_MS = 120_000;
const STORAGE_PREFIX = "graceRedirectDeadline_";
const SS_USER = "user";
const SS_TOKEN = "token";

// Helper: decodifica exp del JWT (base64url)
function parseExpFromJwt(token) {
    if (!token || typeof token !== "string" || token.split(".").length !== 3) return null;
    try {
        const [, payload] = token.split(".");
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        const {exp} = JSON.parse(json);
        return Number.isFinite(exp) ? exp : null;
    } catch {
        return null;
    }
}

const normalizeToken = (t) => (t && t.startsWith("Bearer ") ? t.slice(7) : t);

export default function SessionExpiryBadge({onExpire, onRefresh}) {
    const {user, token: ctxToken, loading, logout} = useAuth();
    const navigate = useNavigate();

    // 1) exp desde contexto
    const expFromContext = useMemo(() => {
        const n = Number(user?.exp);
        return Number.isFinite(n) ? n : null;
    }, [user]);

    // 2) exp desde token del contexto
    const expFromCtxToken = useMemo(() => parseExpFromJwt(ctxToken), [ctxToken]);

    // 3) fallback: lee SOLO claves conocidas en sessionStorage (cuando Auth ya cargó)
    const [storageFallback, setStorageFallback] = useState(null);
    useEffect(() => {
        if (loading || expFromContext != null || expFromCtxToken != null) return;
        try {
            const rawUser = sessionStorage.getItem(SS_USER);
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                const asNum = Number(parsed?.exp);
                if (Number.isFinite(asNum)) {
                    setStorageFallback(asNum);
                    return;
                }
                const tok = normalizeToken(parsed?.token);
                const expFromTok = parseExpFromJwt(tok);
                if (Number.isFinite(expFromTok)) {
                    setStorageFallback(expFromTok);
                    return;
                }
            }
            const tok2 = normalizeToken(sessionStorage.getItem(SS_TOKEN));
            const exp2 = parseExpFromJwt(tok2);
            if (Number.isFinite(exp2)) setStorageFallback(exp2);
        } catch {
            // noop
        }
    }, [loading, expFromContext, expFromCtxToken]);

    // 4) exp efectivo
    const exp = useMemo(
        () => expFromContext ?? expFromCtxToken ?? storageFallback ?? null,
        [expFromContext, expFromCtxToken, storageFallback]
    );

    const {hhmmss, isExpired, shouldProactiveRefresh, expMs} = useSessionTimer(exp);

    // ===== Gracia persistente (sobrevive F5) =====
    const storageKey = useMemo(() => (exp ? `${STORAGE_PREFIX}${exp}` : null), [exp]);
    const [graceDeadline, setGraceDeadline] = useState(null);
    const [graceRemainingMs, setGraceRemainingMs] = useState(0);

    // No llamar onExpire mientras Auth carga, y espera expMs válido
    useEffect(() => {
        if (loading || !expMs) return;
        if (isExpired && typeof onExpire === "function") onExpire();
    }, [loading, isExpired, onExpire, expMs]);

    // Inicio/fin del periodo de gracia
    useEffect(() => {
        if (loading || !storageKey) return;

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
    }, [loading, shouldProactiveRefresh, storageKey]);

    // Ticker del grace y redirección
    useEffect(() => {
        if (!graceDeadline) return;
        const id = setInterval(() => {
            const remaining = Math.max(0, graceDeadline - Date.now());
            setGraceRemainingMs(remaining);
            if (remaining === 0) {
                if (storageKey) sessionStorage.removeItem(storageKey);
                logout();
                navigate("/login");
            }
        }, 250);
        return () => clearInterval(id);
    }, [graceDeadline, navigate, storageKey]);

    // Render compacto
    if (loading) return <span>Sesión: verificando…</span>;
    if (exp == null || !expMs) return <span>Sesión: información no disponible</span>;

    const expLocalChile = new Date(expMs);
    const handleRefreshClick = async () => {
        if (storageKey) sessionStorage.removeItem(storageKey);
        setGraceDeadline(null);
        setGraceRemainingMs(0);
        if (typeof onRefresh === "function") await onRefresh();
    };
    const graceSeconds = Math.ceil(graceRemainingMs / 1000);

    return (
        <div style={{display: "inline-flex", gap: 8, alignItems: "center"}}>
      <span title={`Expira: ${formatChile(expLocalChile)} (America/Santiago)`}>
        ⏳ Sesión: {isExpired ? "expirada" : hhmmss} restantes
      </span>
            {!isExpired && (
                <small style={{opacity: 0.7}}>(expira: {formatChile(expLocalChile)})</small>
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