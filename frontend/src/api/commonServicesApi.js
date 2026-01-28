// src/api/commonServicesApi.js
import axios from "axios";

/* Base común con fallback */
const COMMON_BASE = import.meta.env.VITE_COMMON_SERVICES_API_URL;

const commonApi = axios.create({
    baseURL: COMMON_BASE,
});

// Request interceptor to attach JWT token
commonApi.interceptors.request.use(
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
const FUNCIONARIOS_PATH = "/funcionarios";
const UNIDADES_PATH = "/unidades";

/* -------- Funcionarios -------- */
export async function searchFuncionarios(term) {
    const { data } = await commonApi.get(`${FUNCIONARIOS_PATH}/search`, { params: { term } });
    return data;
}

export async function searchFuncionariosPorUnidad(unidad, term = "") {
    const params = { unidad };
    if (term) params.term = term;
    const { data } = await commonApi.get(`${FUNCIONARIOS_PATH}/porunidad`, { params });
    return data;
}

export async function getFuncionarioByIdFun(idFun) {
    const { data } = await commonApi.get(`${FUNCIONARIOS_PATH}/${idFun}`);
    return data;
}

export async function testFuncionariosCron() {
    const { data } = await commonApi.get(`${FUNCIONARIOS_PATH}/test-cron`);
    return data;
}

/* -------- Unidades / Regiones -------- */
export async function getRegionesUnidades() {
    const { data } = await commonApi.get(`${UNIDADES_PATH}/regiones`);


    return data; // <- OJO: retorna el arreglo directo
}

export async function getRegionesPoliciales() {
    const { data } = await commonApi.get(`${UNIDADES_PATH}/regiones-policiales`);
    return data;
}

/**
 * Obtengo las unidades asociadas a una region
 * */
export async function getUnidadesByRegion(region) {
    const { data } = await commonApi.post(`${UNIDADES_PATH}/region`, { region });
    return data;
}

export async function getJefaturasNacionalesPrefecturas() {
    const { data } = await commonApi.get(`${UNIDADES_PATH}/jefaturasnacionalesprefecturas`);
    return data;
}

export async function getUnidadesConJerarquia() {
    const { data } = await commonApi.get(`${UNIDADES_PATH}`);
    return data;
}

export async function getUnitContext(nombreUnidad) {
    const { data } = await commonApi.get(`${UNIDADES_PATH}/contexto`, { params: { unidad: nombreUnidad } });
    return data;
}

export default {
    searchFuncionarios,
    searchFuncionariosPorUnidad,
    getFuncionarioByIdFun,
    testFuncionariosCron,
    getRegionesUnidades,
    getRegionesPoliciales,
    getJefaturasNacionalesPrefecturas,
    getUnitContext,
};
