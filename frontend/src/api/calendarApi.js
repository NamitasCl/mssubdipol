import api from "./turnosApi";

const API_PATH = "/calendario";

export async function listarCalendarios() {
    const res = await api.get(API_PATH);
    return res.data;
}

export async function crearCalendario(data, usuario) {
    const res = await api.post(API_PATH, data, { headers: { usuario } });
    return res.data;
}

export async function buscarCalendario(id) {
    const res = await api.get(`${API_PATH}/${id}`);
    return res.data;
}

export async function eliminarCalendario(id, usuario) {
    await api.delete(`${API_PATH}/${id}`, { headers: { usuario } });
}

export async function actualizarCalendario(id, data, usuario) {
    const res = await api.put(`${API_PATH}/${id}`, data, { headers: { usuario } });
    return res.data;
}