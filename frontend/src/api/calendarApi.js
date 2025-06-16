import axios from "axios";
const API_URL = "http://localhost:8010/api/turnos/calendario";

export async function listarCalendarios() {
    const res = await axios.get(API_URL);
    return res.data;
}

export async function crearCalendario(data, usuario) {
    const res = await axios.post(API_URL, data, { headers: { usuario } });
    return res.data;
}

export async function buscarCalendario(id) {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

export async function eliminarCalendario(id, usuario) {
    await axios.delete(`${API_URL}/${id}`, { headers: { usuario } });
}

export async function actualizarCalendario(id, data, usuario) {
    const res = await axios.put(`${API_URL}/${id}`, data, { headers: { usuario } });
    return res.data;
}