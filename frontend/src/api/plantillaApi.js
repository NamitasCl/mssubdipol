import axios from "axios";
const API_URL = `${import.meta.env.VITE_TURNOS_API_URL}/plantillas`;

export async function listarPlantillas() {
    const res = await axios.get(API_URL);
    return res.data;
}

export async function crearPlantilla(data) {
    const res = await axios.post(API_URL, data);
    return res.data;
}

export async function buscarPlantilla(id) {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

export async function actualizarPlantilla(id, data) {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
}

export async function eliminarPlantilla(id) {
    await axios.delete(`${API_URL}/${id}`);
}

export async function desactivarPlantilla(id) {
    await axios.put(`${API_URL}/${id}/desactivar`);
}
