import axios from "axios";
const API_URL = `${import.meta.env.VITE_TURNOS_API_URL}/funcionarios-aporte`;

// Listar funcionarios aportados por calendario y unidad
export async function listarFuncionariosAportados(idCalendario, idUnidad) {
    const res = await axios.get(`${API_URL}/calendario/${idCalendario}/unidad/${idUnidad}`);
    return res.data;
}

// Listar funcionarios por calendario
export async function listar(idCalendario) {
    const res = await axios.get(`${API_URL}/calendario/${idCalendario}`);
    return res.data;
}

// Agregar funcionario aportado
export async function agregarFuncionarioAportado(dto, usuarioId) {
    const res = await axios.post(API_URL, dto, {
        headers: { usuario: usuarioId }
    });
    return res.data;
}

// Eliminar (borrado lógico) funcionario aportado
export async function eliminarFuncionarioAportado(id, usuarioId) {
    await axios.delete(`${API_URL}/${id}`, {
        headers: { usuario: usuarioId }
    });
}