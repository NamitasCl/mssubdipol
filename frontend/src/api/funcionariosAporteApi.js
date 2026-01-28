import api from "./turnosApi";
const API_PATH = "/funcionarios-aporte";

// Listar funcionarios aportados por calendario y unidad
export async function listarFuncionariosAportados(idCalendario, idUnidad) {
    const res = await api.get(`${API_PATH}/calendario/${idCalendario}/unidad/${idUnidad}`);
    return res.data;
}

// Listar funcionarios por calendario
export async function listar(idCalendario) {
    const res = await api.get(`${API_PATH}/calendario/${idCalendario}`);
    return res.data;
}

// Agregar funcionario aportado
export async function agregarFuncionarioAportado(dto, usuarioId) {
    const res = await api.post(API_PATH, dto, {
        headers: { usuario: usuarioId }
    });
    return res.data;
}

// Eliminar (borrado lógico) funcionario aportado
export async function eliminarFuncionarioAportado(id, usuarioId) {
    await api.delete(`${API_PATH}/${id}`, {
        headers: { usuario: usuarioId }
    });
}