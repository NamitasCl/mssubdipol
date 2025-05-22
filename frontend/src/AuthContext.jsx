// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from "jwt-decode";

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    // Al iniciar, se revisa si hay datos en el localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                const enrichedUser = {
                    ...decoded,
                    token: storedToken,
                };
                setUser(enrichedUser);
                setIsAuth(true);
            } catch (error) {
                console.error("Error al decodificar el token guardado:", error);
                logout();
            }
        }
        setLoading(false); // ← 🔑 Finaliza la carga
    }, []);



    // Función de login que llama al API Gateway
    const login = async (credentials) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                const decoded = jwtDecode(data.token);

                const enrichedUser = {
                    ...decoded,
                    token: data.token,
                };

                setUser(enrichedUser);
                setIsAuth(true);
                localStorage.setItem('user', JSON.stringify(enrichedUser));
                localStorage.setItem('token', data.token);
                console.log('Usuario autenticado:', enrichedUser);
            } else {
                // ⚠️ Manejo de errores sin asumir que hay JSON
                const contentType = response.headers.get("content-type");
                let errorMessage = `Login fallido: Código ${response.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } else {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                }

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            throw error;
        }
    };


    // Función de logout que limpia el usuario y el token
    const logout = () => {
        setUser(null);
        setIsAuth(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = { user, isAuth, login, logout, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuth = () => React.useContext(AuthContext);