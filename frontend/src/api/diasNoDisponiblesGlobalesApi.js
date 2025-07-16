import axios from "axios";
const URL = `${import.meta.env.VITE_TURNOS_API_URL}/dianodisponible`

export async function registrarDiaNoDisponibleGlobal(payload) {
    const res = await axios.post(`${URL}/registrar`, payload);
    return res.data;
}

export async function listarDiaNoDisponiblesGlobalByIdFuncionario(idFuncionario) {
    const res = await axios.get(`${URL}/listar/${idFuncionario}`);
    return res.data;
}

export async function listarFuncionariosAportadosPaginado(calendarioId, idUnidad, page = 0, size = 10) {
    const response = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/funcionarios-aporte/calendario/${calendarioId}/unidad/${idUnidad}/page`, {
        params: { page, size }
    });
    return response.data;
}
