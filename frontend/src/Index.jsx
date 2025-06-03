// App.js
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginForm from './LoginForm';
import App from "./App.jsx";
import UnitAssignmentView from "./pages/turnos/UnitAssignmentView.jsx";
import StaffOrderingView from "./pages/turnos/StaffOrderingView.jsx"; // Componente de la aplicación protegida

const AppContent = () => {
    const { isAuth, user, logout } = useAuth();

    return (
        <div>
            {isAuth ? (
                <>
                    <App />
                </>
            ) : (
                <LoginForm />
            )}
        </div>
    );
};

const Index = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default Index;
