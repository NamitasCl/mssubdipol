import axios from "axios";

// ========================================
// Interceptor de REQUEST - Agregar JWT automáticamente
// ========================================
axios.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem("token");
        if (token) {
            // Quitar "Bearer " si ya está incluido en el token guardado
            const cleanToken = token.replace(/^Bearer\s+/i, '');
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// ========================================
// Interceptor de RESPONSE - Manejar 401 automáticamente
// ========================================
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            console.warn("Sesión expirada, redirigiendo a login...");
            sessionStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axios;
