import React from "react";
import AsyncSelect from "react-select/async";
import { buscarUnidadesPorNombre } from "../../api/unidadApi";

export default function UnidadSelect({ value, onChange }) {
    const loadOptions = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) return [];
        return buscarUnidadesPorNombre(inputValue);
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions={false}
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            placeholder="Buscar unidad..."
            isClearable
            styles={{
                control: (base) => ({
                    ...base,
                    borderRadius: 10,
                    minHeight: 36
                })
            }}
        />
    );
}