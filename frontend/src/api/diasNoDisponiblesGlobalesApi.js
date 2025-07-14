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