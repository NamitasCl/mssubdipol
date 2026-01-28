// src/api/formulariosApi.js
import axios from "axios";
import {
    adaptarFormulariosDesdeBackend,
    adaptarFormularioDesdeBackend,
    adaptarFormularioHaciaBackend
} from "./formulariosAdapter";

/* Base URL del microservicio de formularios */
const FORMULARIOS_BASE = import.meta.env.VITE_FORMS_API_URL || 'http://localhost:8012/api/formularios';

const formsApi = axios.create({
    baseURL: FORMULARIOS_BASE,
});

// Request interceptor to attach JWT token
formsApi.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* Subrutas relativas a baseURL */
const DINAMICO_PATH = "/dinamico";
const DEFINICION_PATH = `${DINAMICO_PATH}/definicion`;
const REGISTROS_PATH = "/dinamicos/registros";
const CUOTAS_PATH = `${DINAMICO_PATH}/cuotas`;

/* -------- Definiciones de Formularios -------- */

/**
 * Listar todos los formularios activos con conteo de respuestas
 */
export async function listarFormularios() {
    const { data } = await formsApi.get(DEFINICION_PATH);
    const formularios = adaptarFormulariosDesdeBackend(data);

    // Enriquecer con conteo de respuestas
    const formulariosConRespuestas = await Promise.all(
        formularios.map(async (form) => {
            try {
                const avance = await obtenerAvanceFormulario(form.id);
                return { ...form, totalRespuestas: avance.total || 0 };
            } catch (err) {
                console.warn(`No se pudo obtener avance del formulario ${form.id}`, err);
                return form;
            }
        })
    );

    return formulariosConRespuestas;
}

/**
 * Obtener un formulario por ID
 */
export async function obtenerFormularioPorId(id) {
    const { data } = await formsApi.get(`${DEFINICION_PATH}/${id}`);
    return adaptarFormularioDesdeBackend(data);
}

/**
 * Obtener formularios creados por un funcionario
 */
export async function obtenerFormulariosPorCreador(idCreador) {
    const { data } = await formsApi.get(`${DEFINICION_PATH}/creador/${idCreador}`);
    return adaptarFormulariosDesdeBackend(data);
}

/**
 * Crear nuevo formulario
 * @param {Object} formulario - Objeto con nombre, descripcion, campos, visibilidad, cuotas
 */
export async function crearFormulario(formulario) {
    const formularioBackend = adaptarFormularioHaciaBackend(formulario);
    const { data } = await formsApi.post(DEFINICION_PATH, formularioBackend);
    return adaptarFormularioDesdeBackend(data);
}

/**
 * Actualizar formulario existente
 */
export async function actualizarFormulario(id, formulario) {
    const formularioBackend = adaptarFormularioHaciaBackend(formulario);
    const { data } = await formsApi.put(`${DEFINICION_PATH}/${id}`, formularioBackend);
    return adaptarFormularioDesdeBackend(data);
}

/**
 * Cambiar estado de un formulario (activo/inactivo)
 */
export async function cambiarEstadoFormulario(id, activo) {
    const { data } = await formsApi.put(`${DEFINICION_PATH}/${id}/estado`, { activo });
    return adaptarFormularioDesdeBackend(data);
}

/**
 * Eliminar formulario (y todas sus respuestas)
 */
export async function eliminarFormulario(id) {
    const { data } = await formsApi.delete(`${DEFINICION_PATH}/${id}`);
    return data;
}

/* -------- Respuestas / Registros -------- */

/**
 * Enviar respuesta a un formulario
 * @param {Object} registro - { formularioId, datos: { campo1: valor1, ... } }
 */
export async function enviarRespuesta(registro) {
    const { data } = await formsApi.post(REGISTROS_PATH, registro);
    return data;
}

/**
 * Listar todas las respuestas de un formulario
 */
export async function listarRespuestas(formularioId) {
    const { data } = await formsApi.get(`${REGISTROS_PATH}/${formularioId}`);
    return data;
}

/**
 * Listar mis respuestas de un formulario
 */
export async function listarMisRespuestas(formularioId) {
    const { data } = await formsApi.get(`${REGISTROS_PATH}/${formularioId}/listar`);
    return data;
}

/**
 * Obtener una respuesta específica por ID
 */
export async function obtenerRespuestaPorId(registroId) {
    const { data } = await formsApi.get(`${REGISTROS_PATH}/registro/${registroId}`);
    return data;
}

/**
 * Obtener avance/progreso de un formulario
 * Retorna: total, mias, miUnidad, porCuota
 */
export async function obtenerAvanceFormulario(formularioId) {
    const { data } = await formsApi.get(`${REGISTROS_PATH}/avance/${formularioId}`);
    return data;
}

/**
 * Editar mi propia respuesta
 */
export async function editarRespuesta(registroId, datos) {
    const { data } = await formsApi.put(`${REGISTROS_PATH}/${registroId}`, { datos });
    return data;
}

/**
 * Eliminar mi propia respuesta
 */
export async function eliminarRespuesta(registroId) {
    const { data } = await formsApi.delete(`${REGISTROS_PATH}/${registroId}`);
    return data;
}

/* -------- Cuotas / Asignaciones -------- */

/**
 * Crear asignación de cuota
 */
export async function crearCuota(cuota) {
    const { data } = await formsApi.post(CUOTAS_PATH, cuota);
    return data;
}

/**
 * Delegar cuota a sub-unidad o usuario
 */
export async function delegarCuota(delegacion) {
    const { data } = await formsApi.post(`${CUOTAS_PATH}/delegar`, delegacion);
    return data;
}

/**
 * Obtener cuotas de un formulario
 */
export async function obtenerCuotasFormulario(formularioId) {
    const { data } = await formsApi.get(`${CUOTAS_PATH}/formulario/${formularioId}`);
    return data;
}

/**
 * Obtener cuotas de una unidad
 */
export async function obtenerCuotasUnidad(idUnidad) {
    const { data } = await formsApi.get(`${CUOTAS_PATH}/unidad/${idUnidad}`);
    return data;
}

/**
 * Obtener mis cuotas asignadas
 */
export async function obtenerMisCuotas() {
    const { data } = await formsApi.get(`${CUOTAS_PATH}/mis`);
    return data;
}

/**
 * Obtener avance de cuota de una unidad en un formulario
 */
export async function obtenerAvanceCuotaUnidad(formularioId, idUnidad) {
    const { data } = await formsApi.get(`${CUOTAS_PATH}/formulario/${formularioId}/unidad/${idUnidad}/avance`);
    return data;
}

/**
 * Obtener delegaciones hijas de una cuota
 */
export async function obtenerDelegacionesCuota(cuotaPadreId) {
    const { data } = await formsApi.get(`${CUOTAS_PATH}/padre/${cuotaPadreId}`);
    return data;
}

export default {
    // Definiciones
    listarFormularios,
    obtenerFormularioPorId,
    obtenerFormulariosPorCreador,
    crearFormulario,
    actualizarFormulario,
    cambiarEstadoFormulario,
    eliminarFormulario,

    // Respuestas
    enviarRespuesta,
    listarRespuestas,
    listarMisRespuestas,
    obtenerRespuestaPorId,
    obtenerAvanceFormulario,
    editarRespuesta,
    eliminarRespuesta,

    // Cuotas
    crearCuota,
    delegarCuota,
    obtenerCuotasFormulario,
    obtenerCuotasUnidad,
    obtenerMisCuotas,
    obtenerAvanceCuotaUnidad,
    obtenerDelegacionesCuota
};
