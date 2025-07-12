import axios from "axios";
const API_URL = import.meta.env.VITE_NODOS_CONSULTA_API_URL;

// Consulta por RUT (formateado)
export async function consultaPorRutFormateado(rutFormateado) {
    const res = await axios.get(`${API_URL}/persona/${rutFormateado}`);
    return res.data;
}

// Consulta por Pasaporte
export async function consultaPorPasaporte(pasaporte) {
    const res = await axios.get(`${API_URL}/pasaporte/${pasaporte}`);
    return res.data;
}

// Consulta por Patente
export async function consultaPorPatente(patente) {
    const res = await axios.get(`${API_URL}/patente/${patente}`);
    return res.data;
}

// Consulta por Características de Vehículo
export async function consultaPorCaracteristicasVehiculo(caracteristicas) {
    // características es un objeto: { marca, modelo, color, anio, vin }
    const res = await axios.post(`${API_URL}/vehiculo/caracteristicas`, caracteristicas);
    return res.data;
}
