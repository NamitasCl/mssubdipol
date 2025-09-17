// src/hooks/useSessionTimer.js
import {useEffect, useMemo, useState} from "react";

export function useSessionTimer(expEpochSec) {
    const expMs = useMemo(() => (expEpochSec ? expEpochSec * 1000 : null), [expEpochSec]);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!expMs) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [expMs]);

    const remainingMs = expMs ? Math.max(0, expMs - now) : 0;
    const isExpired = expMs ? now >= expMs : true;
    const shouldProactiveRefresh = remainingMs > 0 && remainingMs <= 2 * 60 * 1000; // <= 2 min

    const totalSec = Math.floor(remainingMs / 1000);
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;

    const hhmmss =
        hh > 0
            ? `${String(hh)}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
            : `${String(mm)}:${String(ss).padStart(2, "0")}`;

    return {remainingMs, totalSec, hhmmss, isExpired, shouldProactiveRefresh, expMs};
}