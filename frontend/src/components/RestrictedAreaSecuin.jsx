import React from 'react';
import {useAuth} from "../AuthContext.jsx";
import {Alert} from "react-bootstrap";

export function RestrictedAreaSecuin({component: Component, ...rest }) {
    // Aquí puedes definir la lógica para verificar si el usuario tiene acceso a la ruta
    const { user } = useAuth();

    console.log("User en restricted: ", user);

    const hasAccess = user && user.roles && (user.roles.includes('ROLE_SECUIN') || user.roles.includes("ROLE_ADMINISTRADOR") || user.isAdmin);

    return (
        <div>
            {hasAccess ? (
                <Component {...rest} />
            ) : (
                <Alert variant="warning" className="mt-4">
                    <h5>Acceso restringido</h5>
                    <p>No tienes acceso a esta sección porque no estás asignado al grupo <strong>Secuin</strong>.</p>
                    <p>Si crees que esto es un error, por favor contacta con el Administrador (PM Subdipol).</p>
                </Alert>
            )}
        </div>
    );

}