// src/api/sgeApi.js
import axios from "axios";

const SGE_BASE_URL = import.meta.env.VITE_SGE_API_URL || "/api";

const sgeApi = axios.create({
    baseURL: SGE_BASE_URL,
});

// Request interceptor to attach JWT token from sessionStorage
sgeApi.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            // Remove "Bearer " prefix if present, we'll add it ourselves
            const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling (optional, but good practice)
sgeApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("SGE API: Unauthorized - token might be expired");
            // Optional: trigger logout or token refresh here
        }
        return Promise.reject(error);
    }
);

export default sgeApi;
