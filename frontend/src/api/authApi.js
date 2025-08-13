// src/api/rolesApi.js
import axios from "axios";

const ROLES_API_URL = import.meta.env.VITE_ROLES_API_URL;
const COMMON_API_URL = import.meta.env.VITE_COMMON_SERVICES_API_URL;

// --- Funciones relacionadas con funcionarios ---

/**
 * Busca funcionarios por término (mín. 2 caracteres).
 * Devuelve opciones compatibles con react-select.
 */
export async function buscarFuncionarios(term) {
    if (!term || term.length < 2) return [];
    const { data } = await axios.get(`${COMMON_API_URL}/funcionarios/search`, {
        params: { term },
    });
    return data.map((f) => ({
        label: f.nombreCompleto,
        value: f.idFun,
        funcionario: f,
    }));
}

// --- Funciones relacionadas con roles ---

/** Obtiene funcionarios que tienen roles asignados (vista de administración). */
export async function obtenerFuncionariosConRoles() {
    const { data } = await axios.get(`${ROLES_API_URL}/asignados`);
    return data;
}

/** Asigna roles a un funcionario (sobrescribe roles actuales). */
export async function asignarRoles(idFun, roles) {
    return axios.post(`${ROLES_API_URL}/modificar`, { idFun, roles });
}

/** Quita roles y deja al funcionario con el rol básico. */
export async function quitarRoles(idFun) {
    return axios.post(`${ROLES_API_URL}/modificar`, {
        idFun,
        roles: ["ROLE_FUNCIONARIO"],
    });
}

/**
 * Quita roles a múltiples funcionarios en paralelo (deja ROLE_FUNCIONARIO).
 * Retorna el resultado de Promise.allSettled para que puedas resumir éxitos/errores.
 */
export async function quitarRolesMultiple(ids) {
    const tasks = ids.map((idFun) =>
        axios.post(`${ROLES_API_URL}/modificar`, {
            idFun,
            roles: ["ROLE_FUNCIONARIO"],
        })
    );
    return Promise.allSettled(tasks);
}