import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {Container, Row, Col, Navbar, Nav, Image as BImage, Button} from "react-bootstrap";
import PdiLogo from "./assets/imagenes/pdilogo.png";
import {useAuth} from "./AuthContext.jsx";


const ROLES = {
    ADMINISTRADOR: "ROLE_ADMINISTRADOR",
    SUBJEFE: "ROLE_SUBJEFE",
    SECUIN: "ROLE_SECUIN",
    JEFE: "ROLE_JEFE",
    FUNCIONARIO: "ROLE_FUNCIONARIO",
};

export default function Layout() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleClick = () => {
        if (user) {
            logout();
            window.location.href = "/turnos/login";
        } else {
            window.location.href = "/turnos/login";
        }
    }

    const navConfig = [
        { to: "/layout", label: "Dashboard", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.SECUIN, ROLES.JEFE, ROLES.FUNCIONARIO] },
        { to: "/layout/asignacionunidad", label: "Gestión por unidad", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.JEFE] },
        { to: "/layout/modificaturnosunidad", label: "Modifica servicios", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.JEFE] },
        { to: "/layout/calendario", label: "Calendario de turnos", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.SECUIN, ROLES.JEFE] },
        { to: "/layout/unidades", label: "Gestión de unidades", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE] },
        { to: "/layout/turnos", label: "Gestión de turnos", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SECUIN] },
        { to: "/layout/disponibles", label: "Ver personal disponible", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SECUIN] },
        { to: "/layout/jefe", label: "Restringido Jefes", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.JEFE, ROLES.SUBJEFE] },
        { to: "/layout/admin", label: "Administración", allowedRoles: [ROLES.ADMINISTRADOR] },
        // El enlace de Login que estaba en tu `navItems` original se omite aquí
        // porque el botón superior "Iniciar sesión" / "Cerrar sesión" ya cumple esa función
        // de manera más explícita y contextual.
    ];

    // Filtra los navItems basados en el rol del usuario.
    // React.useMemo memoriza el resultado para no recalcular en cada renderizado si 'user' no cambia.
    const visibleNavItems = React.useMemo(() => {
        if (user && user.roles) { // Usuario está logueado y tiene un rol asignado

            console.log("Roles del usuario: ", user.roles);

            return navConfig.filter(item => {
                // Si el item tiene 'allowedRoles', verificar si el rol del usuario está incluido.
                return item.allowedRoles && item.allowedRoles.includes(user.roles[0]);
            });
        } else { // Usuario no está logueado o no tiene un rol definido.
            // En este caso, el sidebar estará vacío.
            return [];
        }
    }, [user]); // La dependencia es 'user'; si 'user' cambia, se recalcula.

    console.log("Visible navItems: ", visibleNavItems);

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Barra superior */}
            <Navbar bg="dark" variant="dark">
                <Container fluid className="d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column align-items-center">
                        <BImage src={PdiLogo} alt="Logo" height={"100%"} />
                        <h6 className="text-white text-uppercase">Plana Mayor Subdipol</h6>
                    </div>
                    <div className="d-flex flex-column align-items-center">
                        <h1 className="mb-4 fw-bold text-white">Sistema de Gestión de Turnos</h1>
                        <h5 className="mt-0 fw-bold text-white">Complejo Policial Cuartel Independencia</h5>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="light" onClick={() => window.location.href = 'https://rac.investigaciones.cl'}>Volver a RAC</Button>
                        <Button variant="outline-light" className="d-flex align-items-center gap-2" onClick={() => handleClick()}>
                            <span>{user ? "Cerrar sesión" : "Iniciar sesión"}</span>
                            <i className="bi bi-box-arrow-right"></i>
                        </Button>
                    </div>
                </Container>
            </Navbar>

            {/* Contenido general con sidebar + contenido */}
            <Container fluid className="flex-grow-1">
                <Row className="flex-grow-1" style={{ minHeight: "calc(100vh - 56px)" }}>
                    {/* Sidebar */}
                    <Col md={2} className="bg-light p-3 border-end min-vh-100">
                        <Nav className="flex-column">
                            {visibleNavItems.map((item) => { // No necesitas idx si usas item.to como key
                                const isActive = location.pathname === item.to;
                                return (
                                    <Nav.Link
                                        as={Link}
                                        to={item.to}
                                        key={item.to} // 'item.to' es una key ideal si es única
                                        className={`mb-1 px-3 py-2 rounded text-dark text-decoration-none ${
                                            isActive ? "bg-white border-start border-4 border-primary fw-bold shadow-sm" : "hover-shadow"
                                        }`}
                                    >
                                        {item.label}
                                    </Nav.Link>
                                );
                            })}
                        </Nav>
                    </Col>

                    {/* Contenido dinámico */}
                    <Col md={10} className="py-4">
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}