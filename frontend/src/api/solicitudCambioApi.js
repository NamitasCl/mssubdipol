import api from "./turnosApi";

const API_PATH = "/solicitudes-cambio";

/**
 * Crea una nueva solicitud de cambio de turno.
 */
export async function crearSolicitudCambio(data, idFuncionario, nombreFuncionario) {
    const res = await api.post(API_PATH, data, {
        headers: {
            idFuncionario,
            nombreFuncionario
        }
    });
    return res.data;
}

/**
 * Obtiene solicitudes pendientes de aprobación.
 */
export async function obtenerSolicitudesPendientes() {
    const res = await api.get(`${API_PATH}/pendientes`);
    return res.data;
}

/**
 * Obtiene historial de solicitudes de un funcionario.
 */
export async function obtenerHistorialSolicitudes(idFuncionario) {
    const res = await api.get(`${API_PATH}/historial/${idFuncionario}`);
    return res.data;
}

/**
 * Aprueba una solicitud de cambio.
 */
export async function aprobarSolicitud(id, observacion, idFuncionario, nombreFuncionario) {
    const res = await api.put(`${API_PATH}/${id}/aprobar`, { observacion }, {
        headers: {
            idFuncionario,
            nombreFuncionario
        }
    });
    return res.data;
}

/**
 * Rechaza una solicitud de cambio.
 */
export async function rechazarSolicitud(id, observacion, idFuncionario, nombreFuncionario) {
    const res = await api.put(`${API_PATH}/${id}/rechazar`, { observacion }, {
        headers: {
            idFuncionario,
            nombreFuncionario
        }
    });
    return res.data;
}

/**
 * Obtiene los turnos asignados a un funcionario.
 */
export async function obtenerMisTurnos(idFuncionario, mes = null, anio = null) {
    const params = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    
    const res = await api.get(`/slots/mis-turnos/${idFuncionario}`, { params });
    return res.data;
}
