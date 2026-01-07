import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_TURNOS_API_URL}/solicitudes-cambio`;

// Endpoints para funcionarios
export const crearSolicitud = (dto) => axios.post(BASE_URL, dto);

export const obtenerMisSolicitudes = () => axios.get(`${BASE_URL}/mis-solicitudes`);

export const cancelarSolicitud = (id) => axios.delete(`${BASE_URL}/${id}`);

// Endpoints para jefes/subjefes
export const obtenerSolicitudesPendientes = () => axios.get(`${BASE_URL}/pendientes`);

export const aprobarSolicitud = (id) => axios.post(`${BASE_URL}/${id}/aprobar`);

export const rechazarSolicitud = (id, motivo) =>
    axios.post(`${BASE_URL}/${id}/rechazar`, { motivo });

export default {
    crearSolicitud,
    obtenerMisSolicitudes,
    cancelarSolicitud,
    obtenerSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud
};
