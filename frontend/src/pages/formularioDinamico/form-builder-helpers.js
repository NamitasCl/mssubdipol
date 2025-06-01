// src/components/form-builder-helpers.js
export function serializeFields(fields) {
    return fields.map((f, i) => {
        if (f.type === "group") {
            return {
                nombre: f.name,
                etiqueta: f.label,
                tipo: "group",
                requerido: false,
                opciones: JSON.stringify(serializeFields(f.subfields || [])), // Recursivo
                orden: i + 1
            }
        }
        return {
            nombre: f.name,
            etiqueta: f.label,
            tipo: f.type,
            requerido: false,
            opciones: (f.type === "select" && f.options) ? f.options.join(",") : "",
            orden: i + 1
        }
    });
}