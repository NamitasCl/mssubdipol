import React from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

export default function AsyncNacionalidadesSelect({ value, onChange, user, minChars = 3 }) {
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < minChars) {
            callback([]);
            return;
        }
        axios.get(
            `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/nacionalidades/buscar?nombre=${inputValue}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(resp => {
                callback(
                    resp.data.map(n => ({
                        value: n.id ?? n.idNacionalidad,
                        label: n.nombre ?? n.nacionalidad,
                    }))
                );
            })
            .catch(() => callback([]));
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions={false}
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            placeholder={`Buscar nacionalidad (mínimo ${minChars} letras)...`}
            noOptionsMessage={() => `Escribe al menos ${minChars} letras para buscar`}
        />
    );
}