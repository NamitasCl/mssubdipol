import axios from "axios";

const API_URL = `${import.meta.env.VITE_NODOS_CONSULTA_API_URL}/consulta`;
const API_SERVICIOS_ESPECIALES = `${import.meta.env.VITE_NODOS_CONSULTA_API_URL}/servicios-especiales`;
const API_SERVICIOS_ESPECIALES_MEMOS_REVISADOS = `${import.meta.env.VITE_NODOS_CONSULTA_API_URL}/memo-revisado`;

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

// Consulta de memos para servicios especiales
export async function consultaMemosServiciosEspeciales(consulta) {
    const res = await axios.post(`${API_SERVICIOS_ESPECIALES}`, consulta);
    return res.data;
}

export async function consultarMemosPorIds(ids) {
    const res = await axios.post(`${API_SERVICIOS_ESPECIALES}/ids`, ids);
    return res.data;
}

export async function crearRevisionMemo(payload, user) {

    const res = await axios.post(`${API_SERVICIOS_ESPECIALES_MEMOS_REVISADOS}`, payload)
}

export async function guardarRevisionMemo(revision, token) {
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await axios.post(`${API_SERVICIOS_ESPECIALES_MEMOS_REVISADOS}`, revision, config);
    return res.data;
}

// Obtener historial completo de revisiones de un memo
export async function obtenerHistorialRevisiones(memoId, token) {
    if (memoId == null) throw new Error("memoId es requerido");
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await axios.get(`${API_SERVICIOS_ESPECIALES_MEMOS_REVISADOS}/historial/${memoId}`, config);
    return res.data;
}

// Obtener últimos estados por rol para múltiples memos
export async function obtenerUltimosPorRol(memoIds, token) {
    const ids = Array.isArray(memoIds) ? memoIds.filter((x) => x != null) : [];
    const query = ids.length ? `?memoIds=${ids.join(',')}` : '?memoIds=';
    const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
    const res = await axios.get(`${API_SERVICIOS_ESPECIALES_MEMOS_REVISADOS}/ultimos-por-rol${query}`, config);
    return res.data;
}

export async function obtenerEstadisticas(consulta) {
    const res = await axios.post(`${API_SERVICIOS_ESPECIALES}/estadisticas`, consulta);
    return res.data;
}

// ✅ NUEVA FUNCIÓN PARA CONSULTA COMPLETA PMSUBDIPOL
export async function consultaTodosMemosPMSUBDIPOL(consulta) {
    const res = await axios.post(`${API_SERVICIOS_ESPECIALES}/pmsubdipol/global`, consulta);
    return res.data;
}
