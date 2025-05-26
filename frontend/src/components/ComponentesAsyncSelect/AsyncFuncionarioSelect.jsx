// AsyncFuncionarioSelect.jsx
import React from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

export default function AsyncFuncionarioSelect({ value, onChange, user }) {
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            // Si menos de 3 letras, muestra vacío
            callback([]);
            return;
        }
        axios.get(
            `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/search?term=${inputValue}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(resp => {
                // Ajusta según respuesta real de tu backend
                callback(
                    resp.data.map(f => ({
                        value: f.id,
                        label: f.nombreCompleto || f.nombre
                    }))
                );
            });
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            placeholder="Buscar funcionario..."
        />
    );
}
