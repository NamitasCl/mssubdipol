import axios from "axios";

const API_URL = `${import.meta.env.VITE_TURNOS_API_URL}/slots`;

// Trae un resumen del total de slots de un calendario (ajusta endpoint a tu backend)
export async function getResumenSlots(idCalendario) {
    const res = await axios.get(`${API_URL}/resumen/${idCalendario}`);
    return res.data;
}

export async function getSlotsByCalendario(idCalendario) {
    const res = await axios.get(`${API_URL}/calendario/${idCalendario}`);
    return res.data;
}

// Actualizar un slot individual
export async function updateSlot(id, slotData) {
    const res = await axios.put(`${API_URL}/${id}`, slotData);
    return res.data;
}

// Actualizar múltiples slots
export async function updateSlots(slotsData) {
    const res = await axios.put(`${API_URL}/batch`, slotsData);
    return res.data;
}

// Intercambiar asignaciones entre dos slots (mismo rol)
export async function swapSlots(slotIdA, slotIdB) {
    const res = await axios.put(`${API_URL}/swap`, {slotIdA, slotIdB});
    return res.data;
}

// Obtener funcionarios por unidad
export async function getFuncionariosByUnidad(siglasUnidad, tipoServicio) {
    const res = await axios.get(`${API_URL}/funcionarios-por-unidad/${siglasUnidad}/${tipoServicio}`);
    return res.data;
}