import React, {useMemo, useState} from "react";
import CreatableSelect from "react-select/creatable";

/**
 * props:
 *  - value: [{ label, value }]
 *  - onChange: (arr) => void
 *  - validateId?: (s: string) => boolean  // opcional (por defecto: no vacío)
 *  - placeholder?: string
 */
export default function AsyncMultiMemoIdsSelect({
                                                    value,
                                                    onChange,
                                                    validateId,
                                                    placeholder = "Escribe IDs… (pulsa ESPACIO para agregar, pega varios con coma/espacio/salto de línea)",
                                                }) {
    const [inputValue, setInputValue] = useState("");

    // Validador por defecto
    const isValid = useMemo(
        () => validateId || ((s) => !!s && s.trim().length > 0),
        [validateId]
    );

    // tokeniza una cadena (de input o pegado)
    const tokenize = (text) => {
        if (!text) return [];
        // separa por espacios, comas, punto y coma o saltos de línea
        const tokens = text
            .split(/[\s,;]+/g)
            .map((t) => t.trim())
            .filter(Boolean);

        const existing = new Set((value || []).map((o) => (o?.value ?? "").toString()));
        const unique = [];
        for (const t of tokens) {
            if (!existing.has(t) && isValid(t)) {
                unique.push(t);
                existing.add(t);
            }
        }
        return unique;
    };

    const createOptions = (ids) => ids.map((id) => ({value: id, label: id}));

    const addFromInput = () => {
        const ids = tokenize(inputValue);
        if (!ids.length) return;
        onChange([...(value || []), ...createOptions(ids)]);
        setInputValue("");
    };

    const handleKeyDown = (e) => {
        // Dispara con Espacio
        // e.key puede ser ' ' o 'Spacebar' en navegadores viejos; e.code: 'Space'
        const isSpace =
            e.key === " " || e.key === "Spacebar" || e.code === "Space";
        if (isSpace && inputValue.trim()) {
            e.preventDefault(); // evita insertar el espacio en el input
            addFromInput();
        }
    };

    const handleCreate = (val) => {
        // Enter del creatable (por si el usuario lo usa)
        const ids = tokenize(val);
        if (!ids.length) return;
        onChange([...(value || []), ...createOptions(ids)]);
        setInputValue("");
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData?.getData("text");
        if (!pasted) return;
        if (/[\s,;]/.test(pasted)) {
            e.preventDefault();
            const ids = tokenize(pasted);
            if (ids.length) {
                onChange([...(value || []), ...createOptions(ids)]);
            }
        }
    };

    return (
        <CreatableSelect
            isMulti
            value={value}
            onChange={(opts) => onChange(opts || [])}
            inputValue={inputValue}
            onInputChange={(v, meta) => {
                if (meta.action !== "set-value") setInputValue(v);
            }}
            onCreateOption={handleCreate}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            noOptionsMessage={() =>
                inputValue?.trim()
                    ? "Pulsa ESPACIO para agregar"
                    : "Escribe o pega IDs"
            }
            // Estilos: chips azules
            styles={{
                menuList: (base) => ({...base, maxHeight: 240}),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#1b56af", // azul Bootstrap
                    borderRadius: 6,
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: "white",
                    fontWeight: 600,
                }),
                multiValueRemove: (base) => ({
                    ...base,
                    color: "white",
                    ":hover": {backgroundColor: "rgba(0,0,0,0.15)", color: "white"},
                }),
            }}
            formatCreateLabel={(val) => `Agregar ID: "${val}" (o presiona ESPACIO)`}
        />
    );
}
