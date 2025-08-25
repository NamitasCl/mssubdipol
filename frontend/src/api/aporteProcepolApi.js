import axios from 'axios';
const API_URL = `${import.meta.env.VITE_TURNOS_API_URL}/procepol/cuota-aporte-unidad`;

//Guardar las unidades que van a aportar al calendario PROCEPOL con su respectiva cuota de vehiculos
export async function guardarCuotaUnidadesProcepol(cuotas) {
    const res = axios.post(API_URL, cuotas);
    return res.data;
}