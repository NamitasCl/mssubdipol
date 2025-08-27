// src/api/commonServicesApi.js
import axios from "axios";

/* Base común con fallback */
const COMMON_BASE =
    import.meta?.env?.VITE_COMMON_SERVICES_API_URL ||
    "http://localhost:8011/api/common";

/* Subrutas */
const FUNCIONARIOS_BASE = `${COMMON_BASE}/funcionarios`;
const UNIDADES_BASE = `${COMMON_BASE}/unidades`;

/* -------- Funcionarios -------- */
export async function searchFuncionarios(term) {
    const {data} = await axios.get(`${FUNCIONARIOS_BASE}/search`, {params: {term}});
    return data;
}

export async function searchFuncionariosPorUnidad(unidad, term = "") {
    const params = {unidad};
    if (term) params.term = term;
    const {data} = await axios.get(`${FUNCIONARIOS_BASE}/porunidad`, {params});
    return data;
}

export async function getFuncionarioByIdFun(idFun) {
    const {data} = await axios.get(`${FUNCIONARIOS_BASE}/${idFun}`);
    return data;
}

export async function testFuncionariosCron() {
    const {data} = await axios.get(`${FUNCIONARIOS_BASE}/test-cron`);
    return data;
}

/* -------- Unidades / Regiones -------- */
export async function getRegionesUnidades() {
    const {data} = await axios.get(`${UNIDADES_BASE}/regiones`);
    return data; // <- OJO: retorna el arreglo directo
}

/**
 * Obtengo las unidades asociadas a una region
 * */
export async function getUnidadesByRegion(region) {
    const {data} = await axios.post(`${UNIDADES_BASE}/region`, {region});
    return data;
}

export default {
    searchFuncionarios,
    searchFuncionariosPorUnidad,
    getFuncionarioByIdFun,
    testFuncionariosCron,
    getRegionesUnidades,
};
