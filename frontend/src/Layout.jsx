import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Navbar,
    Nav,
    Image as BImage,
    Button,
    Card,
} from "react-bootstrap";
import { FaUserCircle, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import PdiLogo from "./assets/imagenes/pdilogo.png";
import { useAuth } from "./components/contexts/AuthContext.jsx";

// PALETA
const azulBase = "#2a4d7c";
const azulMedio = "#4f7eb9";
const azulClaro = "#b1cfff";
const azulSidebar = "#eaf4fb";
const blanco = "#fff";
const grisClaro = "#f8fbfd";
const textoPrincipal = "#22334a";
const textoSecundario = "#4b6382";
const doradoSuave = "#ffe8a3";

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
        logout();
        window.location.href = "/turnos/login";
    };

    const navConfig = [
        { to: "/layout", label: "Dashboard", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.SECUIN, ROLES.JEFE, ROLES.FUNCIONARIO] },
        { to: "/layout/asignacionunidad", label: "Gestión por unidad", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.JEFE] },
        { to: "/layout/modificaturnosunidad", label: "Modifica servicios", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.JEFE] },
        { to: "/layout/calendario", label: "Calendario de turnos", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SUBJEFE, ROLES.SECUIN, ROLES.JEFE] },
        { to: "/layout/gestion", label: "Gestión de turnos", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SECUIN] },
        { to: "/layout/disponibles", label: "Ver personal disponible", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.SECUIN] },
        { to: "/layout/jefe", label: "Restringido Jefes", allowedRoles: [ROLES.ADMINISTRADOR, ROLES.JEFE, ROLES.SUBJEFE] },
        { to: "/layout/admin", label: "Administración", allowedRoles: [ROLES.ADMINISTRADOR] },
    ];

    const visibleNavItems = React.useMemo(() => {
        if (user && user.roles) {
            return navConfig.filter((item) =>
                item.allowedRoles.includes(user.roles[0])
            );
        }
        return [];
    }, [user]);

    return (
        <div style={{ minHeight: "100vh", background: grisClaro }}>
            {/* Header */}
            <Navbar
                expand="lg"
                style={{
                    background: azulBase,
                    boxShadow: "0 2px 18px #23395d22",
                    minHeight: 64,
                    padding: "0.8rem 0",
                }}
                className="mb-2"
            >
                <Container fluid style={{ maxWidth: 1920 }}>
                    <div className="d-flex align-items-center gap-3">
                        <BImage src={PdiLogo} alt="Logo" height={48} />
                        <div>
                            <h4 className="mb-0 fw-bold" style={{ color: blanco, letterSpacing: 1.2, fontSize: 24 }}>
                                Plataforma de gestión de turnos
                            </h4>
                            <span className="small" style={{ color: doradoSuave }}>
                Subdirección de Investigación Policial y Criminalística
              </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <FaUserCircle size={26} color={blanco} />
                        <span style={{ color: blanco, fontWeight: 600, fontSize: 17 }}>
              {user?.nombreUsuario || "Usuario"}
            </span>
                        <Button
                            variant="light"
                            onClick={handleClick}
                            className="rounded-pill px-3 d-flex align-items-center"
                            style={{
                                borderColor: azulClaro,
                                color: azulBase,
                                fontWeight: 600,
                                fontSize: 16,
                            }}
                        >
                            <FaSignOutAlt className="me-2" />
                            Cerrar sesión
                        </Button>
                    </div>
                </Container>
            </Navbar>

            {/* Main Content with Sidebar */}
            <Container fluid style={{ maxWidth: 1920 }}>
                <Row className="flex-nowrap" style={{ minHeight: "calc(100vh - 80px)" }}>
                    {/* Sidebar */}
                    <Col
                        md={2}
                        style={{
                            background: azulSidebar,
                            borderRight: `2px solid ${azulClaro}`,
                            minHeight: "85vh",
                            minWidth: 220,
                            maxWidth: 270,
                            paddingTop: 22,
                            paddingBottom: 20,
                            paddingLeft: 0,
                            paddingRight: 0,
                            boxShadow: "1.5px 0 9px #bfd3f325",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            zIndex: 2,
                            fontSize: 17
                        }}
                    >
                        <Nav className="flex-column w-100">
                            {visibleNavItems.map((item) => {
                                const isActive = location.pathname === item.to;
                                return (
                                    <Nav.Link
                                        as={Link}
                                        to={item.to}
                                        key={item.to}
                                        className={`
                      my-1 py-2 px-3
                      rounded-pill
                      d-flex align-items-center gap-2
                      ${isActive ? "fw-bold shadow-sm" : ""}
                    `}
                                        style={{
                                            background: isActive ? azulMedio : "transparent",
                                            color: isActive ? blanco : textoPrincipal,
                                            fontSize: 14,
                                            marginLeft: 10,
                                            marginRight: 8,
                                            letterSpacing: 0.1,
                                            boxShadow: isActive ? "0 2px 8px #4f7eb950" : undefined,
                                            transition: "background 0.16s, color 0.16s",
                                        }}
                                    >
                                        <FaChevronRight size={19} style={{ opacity: isActive ? 1 : 0.6 }} />
                                        {item.label}
                                    </Nav.Link>
                                );
                            })}
                        </Nav>
                    </Col>
                    {/* Content */}
                    <Col
                        md={10}
                        style={{
                            background: grisClaro,
                            minHeight: "85vh",
                            borderRadius: "32px 0 0 32px",
                            boxShadow: "-6px 0 42px #b1bed91b inset",
                            padding: "18px 18px 20px 18px",
                            zIndex: 1,
                            maxWidth: "100%"
                        }}
                    >
                        <Card
                            style={{
                                background: blanco,
                                border: "none",
                                borderRadius: 15,
                                boxShadow: "0 8px 36px #b0c5e820",
                                padding: 0,
                                minHeight: "79vh",
                                overflow: "visible",
                                maxWidth: "100%",

                                fontSize: 16.3,
                            }}

                        >
                            <Card.Body className="p-2">
                                <Outlet />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}