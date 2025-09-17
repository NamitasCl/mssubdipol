// src/utils/time.js
export function formatChile(date) {
    return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Santiago",
    }).format(date);
}