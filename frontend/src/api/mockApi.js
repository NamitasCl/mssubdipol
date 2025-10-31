// src/realApi.js
// API real (JS) compatible con tu mockApi.js — BASE = http://localhost:8010/api/turnos

const BASE_URL = import.meta.env.VITE_TURNOS_API_URL ?? "http://localhost:8010/api/turnos";

// Helper fetch con manejo de errores y 204 sin body
async function request(path, { method = "GET", body } = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} - ${txt}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : null;
}

// ---------- Adapters (backend -> forma que espera tu UI) ----------
const toDia = (raw) => ({
    id: raw.id,
    calendarioId: raw.calendario?.id ?? raw.calendarioId,
    fecha: raw.fecha,
    plantillaId: raw.plantillaRequerimiento?.id ?? raw.plantillaId ?? null,
});

const toCalendario = (raw) => ({
    id: raw.id,
    nombre: raw.nombre,
    fechaInicio: raw.fechaInicio,
    fechaFin: raw.fechaFin,
    estado: raw.estado, // asume enum como String
    unidadParticipantes: Array.isArray(raw.unidadParticipantes)
        ? raw.unidadParticipantes.map((u) => u.id ?? u)
        : [],
});

// =================== Datos base ===================
// GET /api/turnos/enums/roles-servicio
export async function getRolesServicio() {
    return request(`/enums/roles-servicio`);
}

// GET /api/turnos/unidades
export async function getUnidades() {
    const data = await request(`/unidades`);
    return (data ?? []).map((u) => ({ id: u.id, nombre: u.nombre, sigla: u.sigla }));
}

// (placeholder) cuando expongas /funcionarios
export async function getFuncionarios() {
    return [];
}

// =================== Plantillas ===================
// Asumiendo que tu controller queda bajo /api/turnos/plantillas
export async function getPlantillas() {
    return request(`/plantillas`);
}

export async function createPlantilla(plantillaData) {
    return request(`/plantillas`, { method: "POST", body: plantillaData });
}

export async function updatePlantilla(plantillaData) {
    return request(`/plantillas/${plantillaData.id}`, { method: "PUT", body: plantillaData });
}

export async function deletePlantilla(id) {
    await request(`/plantillas/${id}`, { method: "DELETE" });
    return { id };
}

// =================== Calendarios ===================
// /api/turnos/calendarios
export async function getCalendarios() {
    const data = await request(`/calendarios`);
    return (data ?? []).map(toCalendario);
}

export async function getCalendarioById(id) {
    const data = await request(`/calendarios/${id}`);
    return toCalendario(data);
}

export async function createCalendario(calendarioData) {
    // backend espera unidadParticipantes como objetos { id }
    const body = {
        ...calendarioData,
        unidadParticipantes: (calendarioData.unidadParticipantes || []).map((id) => ({ id })),
    };
    const data = await request(`/calendarios`, { method: "POST", body });
    return toCalendario(data);
}

// =================== Días calendario ===================
// /api/turnos/calendarios/{id}/dias
export async function getDiasCalendario(calendarioId) {
    const data = await request(`/calendarios/${calendarioId}/dias`);
    return (data ?? []).map(toDia);
}

export async function habilitarDias(calendarioId, fechas) {
    const data = await request(`/calendarios/${calendarioId}/dias/habilitar`, {
        method: "POST",
        body: { fechas },
    });
    return (data ?? []).map(toDia);
}

// /api/turnos/calendarios/dias/asignar-plantilla
export async function asignarPlantilla(diaIds, plantillaId) {
    const data = await request(`/calendarios/dias/asignar-plantilla`, {
        method: "PUT",
        body: { diaIds, plantillaId },
    });
    // si el backend responde 200 sin body -> devuelve []
    return (data ?? []).map(toDia);
}

// =================== Botones mágicos ===================
// /api/turnos/calendarios/{id}/generar-slots
export async function generarSlots(calendarioId) {
    await request(`/calendarios/${calendarioId}/generar-slots`, { method: "POST" });
    return { status: "success", message: "Slots generados correctamente" };
}

// /api/turnos/calendarios/{id}/resolver-turnos
export async function resolverTurnos(calendarioId) {
    await request(`/calendarios/${calendarioId}/resolver-turnos`, { method: "POST" });
    return { status: "success", message: "Turnos generados y publicados (en proceso)" };
}

// =================== Asignaciones ===================
// /api/turnos/calendarios/{id}/asignaciones (DTO plano)
export async function getAsignaciones(calendarioId) {
    const data = await request(`/calendarios/${calendarioId}/asignaciones`);
    return (data ?? []).map((a) => {
        const asignado = a.nombreFuncionario && a.nombreFuncionario !== "SIN ASIGNAR";
        return {
            id: a.id,
            slot: {
                id: a.id, // sintético; expón id real del Slot en tu DTO si lo necesitas
                calendarioId: Number(calendarioId),
                fecha: a.fecha,
                rolRequerido: a.rolRequerido,
            },
            funcionario: asignado
                ? { id: 0, nombres: a.nombreFuncionario, apellidoPaterno: "", grado: a.gradoFuncionario }
                : null,
        };
    });
}