// AsyncUnidadesSelect.jsx
import React from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

export default function AsyncRegionesPolicialesSelect({ value, onChange, user }) {
    const loadRegionesPoliciales = async (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            callback([]);
            return;
        }
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/regiones-policiales`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
            const filtered = inputValue && inputValue.length > 0
                ? data.filter(region =>
                    region.toLowerCase().includes(inputValue.toLowerCase())
                )
                : data;
            const options = filtered.map(region => ({
                value: region,
                label: region,
            }));
            callback(options);
        } catch (e) {
            callback([]);
        }
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions={false}
            loadOptions={loadRegionesPoliciales}
            value={value}
            onChange={onChange}
            placeholder="Buscar Región Policial (mínimo 3 letras)..."
            noOptionsMessage={() => "Escribe al menos 3 letras para buscar"}
        />
    );
}