import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_TURNOS_API_URL
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
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

// --- Calendarios ---
export const fetchCalendarios = () => api.get("/calendars");
export const createCalendario = (dto) => api.post("/calendars", dto);
export const addQuotas      = (id, list) => api.patch(`/calendars/${id}/quotas`, list);

// --- Indisponibilidad ---
export const addAvailability = (dto) => api.post("/availability", dto);
export const listAvailability= (calId) => api.get(`/availability/calendar/${calId}`);

// --- Scheduling ---
export const generateSchedule = (calId) => api.post(`/schedule/${calId}/generate`);
export const getSchedule      = (calId) => api.get(`/schedule/${calId}`); // opcional

// --- Reportes ---
export const reporteGuardias   = (params) => api.get("/reports/guardias", { params });
export const reporteServicios  = (params) => api.get("/reports/servicios", { params });

export default api;