import axios from "axios";

const BASE_URL = import.meta.env.VITE_NODOS_CONSULTA_API_URL;

// Create axios instance
const nodosApi = axios.create({
    baseURL: BASE_URL,
});

// Request interceptor to attach JWT token from sessionStorage
nodosApi.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const API_PATH_CONSULTA = "/consulta";
const API_PATH_SERVICIOS_ESPECIALES = "/servicios-especiales";
const API_PATH_MEMOS_REVISADOS = "/memo-revisado";
const API_PATH_RELATO_JENADEP = "/relatojenadep";

// Consulta por RUT (formateado)
export async function consultaPorRutFormateado(rutFormateado) {
    const res = await nodosApi.get(`${API_PATH_CONSULTA}/persona/${rutFormateado}`);
    return res.data;
}

// Consulta por Pasaporte
export async function consultaPorPasaporte(pasaporte) {
    const res = await nodosApi.get(`${API_PATH_CONSULTA}/pasaporte/${pasaporte}`);
    return res.data;
}

// Consulta por Patente
export async function consultaPorPatente(patente) {
    const res = await nodosApi.get(`${API_PATH_CONSULTA}/patente/${patente}`);
    return res.data;
}

// Consulta por Características de Vehículo
export async function consultaPorCaracteristicasVehiculo(caracteristicas) {
    // características es un objeto: { marca, modelo, color, anio, vin }
    const res = await nodosApi.post(`${API_PATH_CONSULTA}/vehiculo/caracteristicas`, caracteristicas);
    return res.data;
}

// Consulta de memos para servicios especiales
export async function consultaMemosServiciosEspeciales(consulta) {
    const res = await nodosApi.post(`${API_PATH_SERVICIOS_ESPECIALES}`, consulta);
    return res.data;
}

export async function consultarMemosPorIds(ids) {
    const res = await nodosApi.post(`${API_PATH_SERVICIOS_ESPECIALES}/ids`, ids);
    return res.data;
}

export async function crearRevisionMemo(payload, user) {
    const res = await nodosApi.post(`${API_PATH_MEMOS_REVISADOS}`, payload)
}

export async function guardarRevisionMemo(revision, token) {
    // Note: Interceptor handles token now, but we keep arg for backward compat if needed, 
    // though interceptor priority depends on logic. Here interceptor adds header to config object.
    // If specific config is needed, we can pass it as second arg, but standardizing on sessionStorage is safer.
    const res = await nodosApi.post(`${API_PATH_MEMOS_REVISADOS}`, revision);
    return res.data;
}

// Obtener historial completo de revisiones de un memo
export async function obtenerHistorialRevisiones(memoId, token) {
    if (memoId == null) throw new Error("memoId es requerido");
    const res = await nodosApi.get(`${API_PATH_MEMOS_REVISADOS}/historial/${memoId}`);
    return res.data;
}

// Obtener últimos estados por rol para múltiples memos
export async function obtenerUltimosPorRol(memoIds, token) {
    const ids = Array.isArray(memoIds) ? memoIds.filter((x) => x != null) : [];
    const query = ids.length ? `?memoIds=${ids.join(',')}` : '?memoIds=';
    const res = await nodosApi.get(`${API_PATH_MEMOS_REVISADOS}/ultimos-por-rol${query}`);
    return res.data;
}

export async function obtenerEstadisticas(consulta) {
    const res = await nodosApi.post(`${API_PATH_SERVICIOS_ESPECIALES}/estadisticas`, consulta);
    return res.data;
}

// ✅ NUEVA FUNCIÓN PARA CONSULTA COMPLETA PMSUBDIPOL
export async function consultaTodosMemosPMSUBDIPOL(consulta) {
    const res = await nodosApi.post(`${API_PATH_SERVICIOS_ESPECIALES}/pmsubdipol/global`, consulta);
    return res.data;
}

export async function obtenerDetalleCompleto(tipo, id) {
    const endpoints = {
        persona: `/persona/detalle/${id}`,
        vehiculo: `/vehiculo/detalle/${id}`,
        arma: `/arma/detalle/${id}`,
        droga: `/droga/detalle/${id}`,
        memo: `/memo/detalle/${id}`
    };

    const endpoint = endpoints[tipo];
    if (!endpoint) throw new Error(`Tipo no soportado: ${tipo}`);

    const res = await nodosApi.get(`${API_PATH_CONSULTA}${endpoint}`);
    return res.data;
}

export async function registrarRelatoJenadep(payload) {
    const res = await nodosApi.post(`${API_PATH_RELATO_JENADEP}/guardar`, payload);
    return res.data;
}

