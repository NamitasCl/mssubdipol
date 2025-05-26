// AsyncUnidadesSelect.jsx
import React from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

export default function AsyncUnidadesSelect({ value, onChange, user }) {
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            callback([]);
            return;
        }
        axios.get(
            `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar?nombre=${inputValue}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(resp => {
                callback(
                    resp.data.map(f => ({
                        value: f.idUnidad ?? f.id, // ajusta el campo segun el dto
                        label: f.nombreUnidad ?? f.nombre
                    }))
                );
            })
            .catch(() => callback([])); // Si hay error, vacía opciones
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions={false}
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            placeholder="Buscar unidad (mínimo 3 letras)..."
            noOptionsMessage={() => "Escribe al menos 3 letras para buscar"}
        />
    );
}