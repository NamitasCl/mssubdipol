import api from "./turnosApi";

const API_PATH = "/slots";

// Trae un resumen del total de slots de un calendario (ajusta endpoint a tu backend)
export async function getResumenSlots(idCalendario) {
    const res = await api.get(`${API_PATH}/resumen/${idCalendario}`);
    return res.data;
}

export async function getSlotsByCalendario(idCalendario) {
    const res = await api.get(`${API_PATH}/calendario/${idCalendario}`);
    return res.data;
}

// Actualizar un slot individual
export async function updateSlot(id, slotData) {
    const res = await api.put(`${API_PATH}/${id}`, slotData);
    return res.data;
}

// Actualizar múltiples slots
export async function updateSlots(slotsData) {
    const res = await api.put(`${API_PATH}/batch`, slotsData);
    return res.data;
}

// Intercambiar asignaciones entre dos slots (mismo rol)
export async function swapSlots(slotIdA, slotIdB) {
    const res = await api.put(`${API_PATH}/swap`, {slotIdA, slotIdB});
    return res.data;
}

// Obtener funcionarios por unidad
export async function getFuncionariosByUnidad(siglasUnidad, tipoServicio) {
    const res = await api.get(`${API_PATH}/funcionarios-por-unidad/${siglasUnidad}/${tipoServicio}`);
    return res.data;
}