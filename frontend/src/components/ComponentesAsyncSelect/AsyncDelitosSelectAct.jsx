import React, {useCallback, useMemo, useRef} from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import {useAuth} from "../contexts/AuthContext.jsx";

/**
 * props:
 * - value: [{label, value}]
 * - onChange: (arr) => void
 * - minChars?: number (default 2)
 * - debounceMs?: number (default 300)
 */
export default function DelitosAsyncMulti({
                                              value,
                                              onChange,
                                              minChars = 2,
                                              debounceMs = 300,
                                          }) {
    const {user} = useAuth();

    // Normaliza base sin barra final
    const BASE = useMemo(() => {
        const b = import.meta.env.VITE_NODOS_CONSULTA_API_URL || "";
        return b.endsWith("/") ? b.slice(0, -1) : b;
    }, []);

    // Cache simple en memoria: (input|region|comuna) -> options
    const cacheRef = useRef(new Map());
    // Control para cancelar llamadas previas en vuelo
    const abortRef = useRef(null);
    // Timer para debounce
    const timerRef = useRef(null);

    const fetchOptions = useCallback(
        async (input) => {
            const q = (input || "").trim();

            // Guardas: no llames si no hay suficientes caracteres
            if (q.length < minChars) return [];

            const cacheKey = q;
            if (cacheRef.current.has(cacheKey)) {
                return cacheRef.current.get(cacheKey);
            }

            // Cancela petición anterior si existe
            if (abortRef.current) {
                abortRef.current.abort();
            }
            abortRef.current = new AbortController();

            // Construye params
            const params = new URLSearchParams();
            params.set("nombre", q);

            const url = `${BASE}/api/nodos/listas/delitos?${params.toString()}`;

            try {
                const res = await axios.get(url, {
                    signal: abortRef.current.signal,
                    headers: user?.token ? {Authorization: `Bearer ${user.token}`} : undefined,
                });

                let raw = res?.data;

                // Si por algún proxy/login vino HTML, evita romper y retorna []
                if (typeof raw === "string") {
                    const s = raw.trim().toLowerCase();
                    if (s.startsWith("<!doctype html") || s.startsWith("<html")) {
                        console.warn("[DelitosAsyncMulti] La API devolvió HTML; revisa auth/proxy:", url);
                        return [];
                    }
                    try {
                        raw = JSON.parse(raw);
                    } catch {
                        return [];
                    }
                }

                const arr = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.items)
                        ? raw.items
                        : Array.isArray(raw?.content)
                            ? raw.content
                            : Array.isArray(raw?.data)
                                ? raw.data
                                : [];

                const options = arr.map((u) => ({
                    value: u?.id ?? "",
                    label: u?.delito,
                    raw: u,
                }));

                cacheRef.current.set(cacheKey, options);
                return options;
            } catch (err) {
                if (axios.isCancel?.(err)) {
                    // Cancelada: devuelve vacío para esta invocación
                    return [];
                }
                console.error("[DelitosAsyncMulti] Error consultando:", err);
                return [];
            }
        },
        [BASE, user?.token, minChars]
    );

    // loadOptions con debounce: react-select/async usa esta función y espera una Promise
    const loadOptions = useCallback(
        (inputValue) =>
            new Promise((resolve) => {
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(async () => {
                    const opts = await fetchOptions(inputValue);
                    resolve(opts);
                }, debounceMs);
            }),
        [fetchOptions, debounceMs]
    );

    return (
        <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions={false}     // 👈 NO cargar al montar
            loadOptions={loadOptions}  // 👈 Solo busca cuando el usuario escribe
            value={value}
            onChange={(opts) => onChange(opts || [])}
            placeholder="Selecciona los delitos que desea filtrar."
            noOptionsMessage={({inputValue}) =>
                (inputValue?.trim()?.length || 0) < minChars
                    ? `Escribe al menos ${minChars} caracteres`
                    : "Sin coincidencias"
            }
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuPlacement="auto"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            // Evita doble filtrado en cliente; dejamos que el backend decida
            filterOption={null}
            styles={{
                menuPortal: (base) => ({...base, zIndex: 2000}),
                menu: (base) => ({...base, zIndex: 2000}),
                menuList: (base) => ({...base, maxHeight: 240}),
            }}
        />
    );
}