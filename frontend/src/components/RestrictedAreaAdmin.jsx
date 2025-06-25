import React from 'react';
import {useAuth} from "./contexts/AuthContext.jsx";
import {Alert} from "react-bootstrap";

// Usa CHILDREN
export function RestrictedAreaAdmin({children}) {
    const { user } = useAuth();
    const hasAccess = user && (user.roles.includes('ROLE_ADMINISTRADOR') || user.isAdmin);

    return (
        <>
            {hasAccess ? (
                children
            ) : (
                <Alert variant="warning" className="mt-4">
                    <h5>Acceso restringido</h5>
                    <p>No tienes acceso a esta sección porque no estás asignado al grupo <strong>Administración</strong>.</p>
                    <p>Si crees que esto es un error, por favor contacta con el Administrador (PM Subdipol).</p>
                </Alert>
            )}
        </>
    );
}
