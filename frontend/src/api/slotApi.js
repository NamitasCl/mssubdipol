import axios from "axios";
const API_URL = `${import.meta.env.VITE_TURNOS_API_URL}/slots`;

// Trae un resumen del total de slots de un calendario (ajusta endpoint a tu backend)
export async function getResumenSlots(idCalendario) {
    const res = await axios.get(`${API_URL}/resumen/${idCalendario}`);
    // Ejemplo de respuesta: { totalSlots: 150 }
    return res.data;
}

export async function getSlotsByCalendario(idCalendario) {
    const res = await axios.get(`${API_URL}/calendario/${idCalendario}`);
    // Ejemplo de respuesta: [{ id: 1, fecha: "2023-10-01", estado: "DISPONIBLE" }, ...]
    return res.data;
}
