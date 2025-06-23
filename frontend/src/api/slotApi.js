import axios from "axios";
const API_URL = "http://localhost:8010/api/turnos/slots";

// Trae un resumen del total de slots de un calendario (ajusta endpoint a tu backend)
export async function getResumenSlots(idCalendario) {
    const res = await axios.get(`${API_URL}/resumen/${idCalendario}`);
    // Ejemplo de respuesta: { totalSlots: 150 }
    return res.data;
}
