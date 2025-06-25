import React from "react";
import { Card, Row, Col, Container, Button, Image, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaShieldAlt, FaCalendarAlt, FaCogs, FaSignOutAlt } from "react-icons/fa";
import PdiLogo from "./assets/imagenes/pdilogo.png";
import { useAuth } from "./components/contexts/AuthContext.jsx";
import {FaWpforms} from "react-icons/fa6";

// Paleta institucional
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";
const blanco = "#f7f8fc";

// Paleta pastel
const azulSuave = "#7fa6da";
const azulOscuro = "#23395d";
const grisClaro = "#eceff4";
const verdeMenta = "#a6e3cf";
const textoPrincipal = "#23395d";
const textoSecundario = "#4a5975";

const modules = [
    {
        title: "Turnos",
        text: "Gestión completa de turnos y servicios regulares.",
        icon: <FaShieldAlt size={36} />,
        route: "/layout",
        color: azulPDI,
        roles: ["ROLE_FUNCIONARIO", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Formularios",
        text: "Configura y administra formularios para requerimiento de información.",
        icon: <FaWpforms size={36} />,
        route: "/formularios",
        color: "#a67822",
        roles: ["ROLE_FUNCIONARIO", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Escolta y Enlaces",
        text: "Gestión de escoltas y enlaces institucionales.",
        icon: <FaCalendarAlt size={36} />,
        route: "/enconstruccion",
        color: "#28618b", // Azul intermedio institucional
        roles: ["ROLE_FUNCIONARIO", "ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Administración",
        text: "Gestión de usuarios y permisos.",
        icon: <FaCogs size={36} />,
        route: "/admin",
        color: "#28618b", // Azul intermedio institucional
        roles: ["ROLE_ADMINISTRADOR"]
    },
];

function Header() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    return (
        <Navbar
            variant="light"
            expand="lg"
            className="px-2 py-0"
            style={{
                background: azulOscuro,
                borderBottom: `2.5px solid ${azulSuave}`,
                minHeight: "84px",
                boxShadow: "0 5px 20px 0 #aecbf855",
                zIndex: 1030
            }}
        >
            <Container fluid className="align-items-center py-2" style={{ minHeight: "78px" }}>
                <div className="d-flex flex-column align-items-center" style={{ minWidth: 140, cursor: "pointer" }}>
                    <Image src={PdiLogo} alt="Logo" height={48} onClick={() => navigate("/")} />
                    <span className="text-uppercase fw-semibold" style={{ color: azulSuave, fontSize: "0.98rem", letterSpacing: ".09em" }}>
                        Plana Mayor Subdipol
                    </span>
                </div>
                <div className="flex-grow-1 d-flex flex-column align-items-center">
                    <h1 className="mb-0 fw-bold text-center"
                        style={{
                            color: blanco,
                            fontSize: "1.42rem",
                            letterSpacing: ".02em",
                            textTransform: "uppercase"
                        }}>
                        RAC - SIGES
                    </h1>
                    <h5 style={{color: "white"}}>Sistema Integrado de Gestión</h5>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="outline-dark"
                        className="d-flex align-items-center gap-2"
                        size="sm"
                        onClick={handleLogout}
                        style={{
                            fontWeight: 600,
                            borderRadius: "1.7rem",
                            border: `1.5px solid ${azulSuave}`,
                            color: blanco,
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

export default function DashboardPrincipal() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            <Header />
            {/* Espaciado para header fijo */}
            <div style={{
                background: "#f6f7fa",
                minHeight: "100vh",
                paddingTop: "52px",
                paddingBottom: "32px"
            }}>
                <Container fluid="md" style={{ maxWidth: 1100 }}>
                    <h2
                        className="fw-bold mb-4"
                        style={{
                            color: azulPDI,
                            letterSpacing: ".09em",
                            textTransform: "uppercase",
                            fontSize: "1.38rem",
                            borderLeft: `5px solid ${doradoPDI}`,
                            paddingLeft: "1rem"
                        }}
                    >
                        Panel Principal de Servicios
                    </h2>
                    <Row className="g-4">
                        {modules.map((mod, idx) => {
                            if(mod.roles.some(rol => user.roles.includes(rol))) {
                                return (
                                    <Col key={idx} xs={12} sm={6} md={4}>
                                        <Card
                                            className="dashboard-card h-100"
                                            style={{
                                                border: "none",
                                                borderRadius: "1.5rem",
                                                background: "#fff",
                                                color: azulPDI,
                                                boxShadow: "0 7px 24px 0 #2223",
                                                cursor: "pointer",
                                                minHeight: "220px",
                                                transition: "transform .16s, box-shadow .15s"
                                            }}
                                            onClick={() => navigate(mod.route)}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                                                e.currentTarget.style.boxShadow = `0 16px 32px 0 ${mod.color}22`;
                                                e.currentTarget.style.border = `2px solid ${mod.color}`;
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = "none";
                                                e.currentTarget.style.boxShadow = "0 7px 24px 0 #2223";
                                                e.currentTarget.style.border = "none";
                                            }}
                                        >
                                            <Card.Body className="d-flex flex-column justify-content-between">
                                                <div className="d-flex align-items-center mb-3" style={{ gap: "0.85rem" }}>
                                                    <div style={{
                                                        background: mod.color + "10",
                                                        borderRadius: "50%",
                                                        padding: "0.72rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        border: `2.5px solid ${mod.color}66`,
                                                        color: mod.color
                                                    }}>
                                                        {mod.icon}
                                                    </div>
                                                    <Card.Title className="mb-0 fs-6 fw-bold" style={{ color: azulPDI, textTransform: "uppercase", letterSpacing: ".07em" }}>
                                                        {mod.title}
                                                    </Card.Title>
                                                </div>
                                                <Card.Text style={{ color: grisOscuro, fontSize: "1.09rem", minHeight: "62px" }}>
                                                    {mod.text}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )
                            }
                        })}
                    </Row>
                </Container>
            </div>
            <style>
                {`
                    .dashboard-card:active {
                        filter: brightness(0.97);
                    }
                `}
            </style>
        </>
    );
}