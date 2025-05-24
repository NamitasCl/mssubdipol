import React from "react";
import { Card, Row, Col, Container, Button, Image, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaShieldAlt, FaCalendarAlt, FaCogs, FaSignOutAlt } from "react-icons/fa";
import PdiLogo from "../assets/imagenes/pdilogo.png";
import { useAuth } from "../AuthContext";

// Paleta institucional
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";
const blanco = "#f7f8fc";

const modules = [
    {
        title: "Turnos Cuartel Independencia",
        text: "Gestión completa de turnos y servicios regulares.",
        icon: <FaShieldAlt size={36} />,
        route: "/layout",
        color: azulPDI
    },
    {
        title: "Servicios Especiales",
        text: "Configura y administra servicios especiales del cuartel.",
        icon: <FaCogs size={36} />,
        route: "/servicios-especiales",
        color: "#a67822" // Dorado oscuro institucional
    },
    {
        title: "Calendario de Turnos",
        text: "Visualiza los turnos asignados de manera clara y rápida.",
        icon: <FaCalendarAlt size={36} />,
        route: "/enconstruccion",
        color: "#28618b" // Azul intermedio institucional
    },
];

export function Header() {
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
            fixed="top"
        >
            <Container fluid className="align-items-center py-2" style={{minHeight: "78px"}}>
                <div className="d-flex flex-column align-items-center" style={{ minWidth: 140 }}>
                    <Image src={PdiLogo} alt="Logo" height={48} />
                    <span className="text-uppercase fw-semibold" style={{ color: doradoPDI, fontSize: "0.98rem", letterSpacing: ".09em" }}>Plana Mayor Subdipol</span>
                </div>
                <div className="flex-grow-1 d-flex flex-column align-items-center">
                    <h1 className="mb-0 fw-bold text-light text-center" style={{ fontSize: "1.42rem", letterSpacing: ".02em", textTransform: "uppercase" }}>
                        Sistema Integrado de Gestión de Servicios
                    </h1>
                    <h6 className="mb-0 mt-1 fw-bold text-light text-center" style={{ fontSize: "1.03rem", letterSpacing: ".05em" }}>
                        Complejo Policial Cuartel Independencia
                    </h6>
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

export default function DashboardPrincipal() {
    const navigate = useNavigate();

    return (
        <>
            <Header />
            {/* Espaciado para header fijo */}
            <div style={{
                background: `radial-gradient(circle at 60% 20%, #23395d 0%, #172338 90%)`,
                minHeight: "100vh",
                paddingTop: "104px", // Compensa altura del header
                paddingBottom: "32px"
            }}>
                <Container fluid="md" style={{ maxWidth: 1100 }}>
                    <h2
                        className="fw-bold mb-4 text-light"
                        style={{
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
                        {modules.map((mod, idx) => (
                            <Col key={idx} xs={12} sm={6} md={4}>
                                <Card
                                    className="dashboard-card h-100"
                                    style={{
                                        border: `2.5px solid ${doradoPDI}`,
                                        borderRadius: "1.2rem",
                                        background: `linear-gradient(125deg, ${mod.color} 85%, #181d2d 150%)`,
                                        color: "#fff",
                                        boxShadow: "0 6px 28px 0 #0e2042a0",
                                        cursor: "pointer",
                                        minHeight: "220px",
                                        transition: "transform .16s, box-shadow .15s"
                                    }}
                                    onClick={() => navigate(mod.route)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateY(-10px) scale(1.032)";
                                        e.currentTarget.style.boxShadow = `0 12px 34px 0 ${doradoPDI}33`;
                                        e.currentTarget.style.borderColor = "#fff";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "none";
                                        e.currentTarget.style.boxShadow = "0 6px 28px 0 #0e2042a0";
                                        e.currentTarget.style.borderColor = doradoPDI;
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column justify-content-between">
                                        <div className="d-flex align-items-center mb-3" style={{ gap: "0.85rem" }}>
                                            <div style={{
                                                background: "rgba(255,255,255,0.10)",
                                                borderRadius: "50%",
                                                padding: "0.68rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: `2.5px solid ${doradoPDI}`
                                            }}>
                                                {mod.icon}
                                            </div>
                                            <Card.Title className="mb-0 fs-6 fw-bold" style={{ color: doradoPDI, textTransform: "uppercase", letterSpacing: ".07em" }}>
                                                {mod.title}
                                            </Card.Title>
                                        </div>
                                        <Card.Text style={{ color: "#e7e9ed", fontSize: "1.04rem", minHeight: "62px" }}>
                                            {mod.text}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
            <style>
                {`
                    .dashboard-card:active {
                        filter: brightness(0.98);
                    }
                `}
            </style>
        </>
    );
}