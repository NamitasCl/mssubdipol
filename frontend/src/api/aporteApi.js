import axios from "axios";
const API_URL = "http://localhost:8010/api/turnos/aportes";

// Obtener todos los aportes registrados para un calendario
export async function getAportesPorCalendario(idCalendario) {
    const res = await axios.get(`${API_URL}/calendario/${idCalendario}`);
    return res.data;
}

// Registrar un aporte (unidad + cantidad)
export async function agregarAporteUnidad(aporte) {
    const res = await axios.post(API_URL, aporte);
    return res.data;
}
