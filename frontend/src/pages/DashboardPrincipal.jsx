import React from "react";
import { Card, Row, Col, Container, Navbar, Button, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaShieldAlt, FaCalendarAlt, FaCogs, FaSignOutAlt } from "react-icons/fa";
import Header from "../components/Header.jsx";
import { useAuth } from "../AuthContext"; // Ajusta la ruta

const modules = [
    {
        title: "Turnos Cuartel Independencia",
        text: "Gestión completa de turnos y servicios regulares.",
        icon: <FaShieldAlt size={36} />,
        route: "/layout",
        color: "#28527a"
    },
    {
        title: "Servicios Especiales",
        text: "Configura y administra servicios especiales del cuartel.",
        icon: <FaCogs size={36} />,
        route: "/servesp",
        color: "#f76e11"
    },
    {
        title: "Calendario de Turnos",
        text: "Visualiza los turnos asignados de manera clara y rápida.",
        icon: <FaCalendarAlt size={36} />,
        route: "/enconstruccion",
        color: "#43aa8b"
    },

];

export default function DashboardPrincipal() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleClick = () => {
        if (user) {
            logout();
        } else {
            navigate("/login");
        }
    };

    return (
        <>
            {/* NAVBAR OCUPA TODO EL ANCHO, PEGADO ARRIBA */}
            <Header />

            {/* AGREGA UN MARGEN TOP IGUAL A LA ALTURA DEL NAVBAR PARA QUE NO QUEDE TAPADO */}
            <Container fluid className="py-5" style={{ background: "#f8f9fa", minHeight: "100vh", marginTop: "90px" }}>
                <h2 className="mb-4 fw-bold" style={{ letterSpacing: "1px" }}>
                    Panel Principal de Servicios
                </h2>
                <Row className="g-4">
                    {modules.map((mod, idx) => (
                        <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                            <Card
                                className="dashboard-card h-100 shadow-lg"
                                style={{
                                    border: "none",
                                    borderRadius: "1.2rem",
                                    cursor: "pointer",
                                    transition: "transform .18s, box-shadow .18s",
                                    background: `linear-gradient(135deg, ${mod.color} 70%, #fff 150%)`,
                                    color: "#fff",
                                    minHeight: "220px"
                                }}
                                onClick={() => navigate(mod.route)}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px) scale(1.025)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "none"}
                            >
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3" style={{ gap: "0.8rem" }}>
                                        <div style={{
                                            background: "rgba(255,255,255,0.12)",
                                            borderRadius: "50%",
                                            padding: "0.7rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            {mod.icon}
                                        </div>
                                        <Card.Title className="mb-0 fs-5 fw-semibold" style={{ color: "#fff" }}>{mod.title}</Card.Title>
                                    </div>
                                    <Card.Text style={{ color: "rgba(255,255,255,0.93)", fontSize: "1rem", minHeight: "60px" }}>
                                        {mod.text}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <style>
                    {`
                        .dashboard-card:hover {
                            box-shadow: 0 8px 32px 0 rgba(40,82,122,0.25);
                        }
                    `}
                </style>
            </Container>
        </>
    );
}