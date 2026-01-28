import api from "./turnosApi";
const API_PATH = "/plantillas";

export async function listarPlantillas() {
    const res = await api.get(API_PATH);
    return res.data;
}

export async function crearPlantilla(data) {
    const res = await api.post(API_PATH, data);
    return res.data;
}

export async function buscarPlantilla(id) {
    const res = await api.get(`${API_PATH}/${id}`);
    return res.data;
}

export async function actualizarPlantilla(id, data) {
    const res = await api.put(`${API_PATH}/${id}`, data);
    return res.data;
}

export async function eliminarPlantilla(id) {
    await api.delete(`${API_PATH}/${id}`);
}

export async function desactivarPlantilla(id) {
    await api.put(`${API_PATH}/${id}/desactivar`);
}
