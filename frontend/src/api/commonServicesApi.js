// src/api/commonserviceApi.js
import axios from "axios";

// Define aquí la URL base (ajústala a tu entorno)
const API_BASE_URL = import.meta?.env?.VITE_COMMONSERVICES_API_URL || "http://localhost:8080/api/common/funcionarios";

/**
 * Busca funcionarios por término de búsqueda (nombre, etc.)
 * @param {string} term
 * @returns {Promise<Array>}
 */
export async function searchFuncionarios(term) {
    const { data } = await axios.get(`${API_BASE_URL}/search`, {
        params: { term }
    });
    return data;
}

/**
 * Busca funcionarios de una unidad, opcionalmente filtrados por nombre/term
 * @param {string} unidad
 * @param {string} term
 * @returns {Promise<Array>}
 */
export async function searchFuncionariosPorUnidad(unidad, term = "") {
    const params = { unidad };
    if (term) params.term = term;
    const { data } = await axios.get(`${API_BASE_URL}/porunidad`, { params });
    return data;
}

/**
 * Obtiene un funcionario por idFun
 * @param {number} idFun
 * @returns {Promise<Object>}
 */
export async function getFuncionarioByIdFun(idFun) {
    const { data } = await axios.get(`${API_BASE_URL}/${idFun}`);
    return data;
}

/**
 * Llama al endpoint para actualizar los funcionarios
 * @returns {Promise<boolean>}
 */
export async function testFuncionariosCron() {
    const { data } = await axios.get(`${API_BASE_URL}/test-cron`);
    return data;
}

export default {
    searchFuncionarios,
    searchFuncionariosPorUnidad,
    getFuncionarioByIdFun,
    testFuncionariosCron
};
