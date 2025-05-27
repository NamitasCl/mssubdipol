import React from "react";
import { Container, Navbar, Nav, Row, Col, Image, Button } from "react-bootstrap";
import PdiLogo from "../assets/imagenes/pdilogo.png";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Permiso from "../components/Permiso.jsx";
import { useAuth } from "../AuthContext.jsx";
import { FaSignOutAlt } from "react-icons/fa";

const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";

// HEADER INSTITUCIONAL
function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    return (
        <Navbar
            variant="dark"
            expand="lg"
            className="px-2 py-0"
            style={{
                background: `linear-gradient(90deg, ${azulPDI} 80%, ${doradoPDI} 200%)`,
                borderBottom: `2.5px solid ${doradoPDI}`,
                minHeight: "84px",
                boxShadow: "0 5px 20px 0 #0c1733aa",
                zIndex: 1030
            }}
        >
            <Container fluid className="align-items-center py-2" style={{ minHeight: "78px" }}>
                <div className="d-flex flex-column align-items-center" style={{ minWidth: 140, cursor: "pointer" }}>
                    <Image src={PdiLogo} alt="Logo" height={48} onClick={() => navigate("/")} />
                    <span className="text-uppercase fw-semibold" style={{ color: doradoPDI, fontSize: "0.98rem", letterSpacing: ".09em" }}>Plana Mayor Subdipol</span>
                </div>
                <div className="flex-grow-1 d-flex flex-column align-items-center">
                    <h1 className="mb-0 fw-bold text-light text-center" style={{ fontSize: "1.42rem", letterSpacing: ".02em", textTransform: "uppercase" }}>
                        Sistema Integrado de Gestión de Servicios
                    </h1>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="outline-light"
                        className="d-flex align-items-center gap-2"
                        size="sm"
                        onClick={handleLogout}
                        style={{
                            fontWeight: 600,
                            borderRadius: "1.7rem",
                            border: `1.5px solid ${doradoPDI}`,
                            color: doradoPDI,
                            background: "transparent"
                        }}
                    >
                        <span>Cerrar sesión</span>
                        <FaSignOutAlt />
                    </Button>
                </div>
            </Container>
        </Navbar>
    );
}

// LAYOUT PRINCIPAL
const ServiciosEspecialesLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 60% 10%, #23395d 0%, #172338 90%)" }}>
            {/* Header Institucional */}
            <Header />

            {/* Menú superior institucional */}
            <Container
                fluid
                className="px-0"
                style={{ background: "#172338", minHeight: "30px", borderBottom: `2px solid ${doradoPDI}` }}
            >
                <Row className="gx-0">
                    <Col>
                        <Nav
                            variant="tabs"
                            defaultActiveKey="/servicios-especiales"
                            className="w-100"
                            style={{ background: "#19233a" }}
                        >
                            <Nav.Item>
                                <Nav.Link as={Link} to="/servicios-especiales/listarformsdisponibles" style={{ color: doradoPDI, fontWeight: 600 }}>
                                    Formularios
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Permiso user={user} roles={["ROLE_ADMINISTRADOR"]}>
                                    <Nav.Link as={Link} to="/servicios-especiales/formularios-admin" style={{ color: doradoPDI, fontWeight: 600 }}>
                                        Crear formulario
                                    </Nav.Link>
                                </Permiso>
                            </Nav.Item>
                            {/* Agrega aquí más Nav.Item si necesitas más módulos */}
                        </Nav>
                    </Col>
                </Row>
            </Container>

            {/* Contenido principal */}
            <div
                style={{
                    padding: "32px 0",
                    minHeight: "calc(100vh - 140px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start"
                    // Elimina el width: calc(100vw - ...) para evitar scroll horizontal
                }}
            >
                <Row className="w-100 mx-0">
                    <Col xs={12} md={10} lg={9} xl={12} className="mx-auto">
                        <div
                            style={{
                                background: "rgba(25,29,43,0.98)",
                                borderRadius: "1.3rem",
                                boxShadow: "0 7px 32px 0 #0005",
                                border: `2px solid ${doradoPDI}`,
                                padding: "2.5rem 2rem",
                                minHeight: "60vh"
                            }}
                        >
                            {/* Si usas react-router, cambia {children} por <Outlet /> */}
                            {children || <Outlet />}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ServiciosEspecialesLayout;