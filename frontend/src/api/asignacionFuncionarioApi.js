import axios from 'axios';

const URL = `${import.meta.env.VITE_TURNOS_API_URL}/asignacion-funcionario`;

export async function realizarAsignacionFuncionarios(calendario) {
    const res = axios.get(`${URL}/${calendario}`);
    return res.data;
}