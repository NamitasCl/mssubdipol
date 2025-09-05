import React from 'react';
import {useAuth} from "./contexts/AuthContext.jsx";
import {Alert} from "react-bootstrap";

export function RestrictedAreaJefe({component: Component, ...rest }) {
    // Aquí puedes definir la lógica para verificar si el usuario tiene acceso a la ruta
    const { user } = useAuth();



    const hasAccess = user && user.roles && (user.roles.includes('ROLE_JEFE') || user.roles.includes('ROLE_SUBJEFE') || user.isAdmin);

    return (
        <div>
            {hasAccess ? (
                <Component {...rest} />
            ) : (
                <Alert variant="warning" className="mt-4">
                    <h5>Acceso restringido</h5>
                    <p>No tienes acceso a esta sección porque no estás asignado como <strong>Jefe</strong> de tu unidad.</p>
                </Alert>
            )}
        </div>
    );

}