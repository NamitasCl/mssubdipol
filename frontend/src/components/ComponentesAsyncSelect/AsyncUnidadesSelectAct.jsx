import React from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import {useAuth} from "../contexts/AuthContext.jsx";

/**
 * props:
 *  - value: [{label, value}]  // opciones seleccionadas
 *  - onChange: (arr) => void  // devuelve array de opciones
 *  - regionSeleccionada, comunaSeleccionada (para acotar búsqueda, opcional)
 */
export default function UnidadesAsyncMulti({
                                               value,
                                               onChange,
                                               regionSeleccionada,
                                               comunaSeleccionada,
                                           }) {
    const {user} = useAuth();

    // Llama a tu API y devuelve [{label, value}, ...]
    const fetchOptions = async (input) => {
        const params = new URLSearchParams();
        if (input) params.set("nombre", input);
        if (regionSeleccionada) params.set("region", regionSeleccionada);
        if (comunaSeleccionada) params.set("comuna", comunaSeleccionada);

        const base = import.meta.env.VITE_COMMON_SERVICES_API_URL;
        const url = `${base}/unidades/buscar?${params.toString()}`;

        const res = await axios.get(url, {
            headers: user?.token ? {Authorization: `Bearer ${user.token}`} : undefined
            // responseType por defecto es 'json'; si el backend manda HTML, caerá en el block de abajo
        });

        let raw = res?.data;

        // Defensivo: si la API devolvió HTML (proxy/login/error), evita romper y retorna []
        if (typeof raw === "string") {
            const s = raw.trim();
            if (s.startsWith("<!doctype html") || s.startsWith("<html")) {
                console.warn("[UnidadesAsyncMulti] La API devolvió HTML; revisa el proxy/ruta/auth:", url);
                return [];
            }
            // si devolvieron string JSON por algún motivo
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

        // Mapea al formato de react-select
        return arr.map((u) => ({
            value: u.nombreUnidad,
            label: `${u.nombreUnidad}${u.nombreComuna ? ` — ${u.nombreComuna}` : ""}`,
            raw: u, // por si quieres guardar más datos
        }));
    };

    // React-Select acepta una función que devuelve promesa
    const loadOptions = (inputValue) => fetchOptions(inputValue);

    return (
        <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions // carga set inicial con input vacío
            loadOptions={loadOptions}
            value={value}
            onChange={(opts) => onChange(opts || [])}
            placeholder="Busca y selecciona unidades…"
            noOptionsMessage={({inputValue}) =>
                inputValue?.trim() ? "Sin coincidencias" : "Escribe para buscar"
            }
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuPlacement="auto"
            styles={{
                menuList: (base) => ({...base, maxHeight: 240}),
            }}
        />
    );
}