import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    FaUsers,
    FaShieldAlt,
    FaCalendarAlt,
    FaCogs,
    FaClipboardList,
    FaUserCheck,
    FaUserShield,
    FaListAlt
} from "react-icons/fa";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

// Paleta institucional y pastel
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";
const blanco = "#f7f8fc";
const azulSuave = "#7fa6da";
const azulOscuro = "#23395d";
const grisClaro = "#eceff4";
const verdeMenta = "#a6e3cf";
const textoPrincipal = "#23395d";
const textoSecundario = "#4a5975";

// Define tus tarjetas del dashboard aquí, cada una con su rol permitido
const CARDS = [
    {
        title: "Gestión por unidad",
        text: "Asigne los funcionarios que deben ser incluidos en el rol de guardias.",
        icon: <FaUserCheck size={34} />,
        route: "/layout/asignacionunidad",
        color: azulPDI,
        roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Modificación de servicios",
        text: "Realice las modificaciones de los servicios que se han propuesto.",
        icon: <FaClipboardList size={34} />,
        route: "/layout/modificaturnosunidad",
        color: "#28618b",
        roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Gestión de turnos",
        text: "Configure y distribuya turnos entre las unidades colaboradoras.",
        icon: <FaClipboardList size={34} />,
        route: "/layout/turnos",
        color: "#28618b",
        roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Personal disponible",
        text: "Consulte funcionarios disponibles para cada día del mes.",
        icon: <FaUsers size={34} />,
        route: "/layout/disponibles",
        color: verdeMenta,
        roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Área Jefatura",
        text: "Gestione y remueva subjefes de unidad.",
        icon: <FaUserShield size={34} />,
        route: "/layout/jefe",
        color: azulSuave,
        roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
    },
    {
        title: "Administración",
        text: "Acceda a funciones administrativas como roles, usuarios y configuración.",
        icon: <FaCogs size={34} />,
        route: "/layout/admin",
        color: "#a67822",
        roles: ["ROLE_ADMINISTRADOR"]
    },
    {
        title: "Ver turnos",
        text: "Visualice sus turnos mensuales y anuales.",
        icon: <FaCalendarAlt size={34} />,
        route: "/layout/calendario",
        color: azulOscuro,
        roles: ["ROLE_FUNCIONARIO", "ROLE_ADMINISTRADOR"]
    }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRoles = user?.roles || [];

    // Filtra las tarjetas según los roles permitidos para el usuario autenticado
    const visibleCards = CARDS.filter(card =>
        card.roles.some(role => userRoles.includes(role))
    );

    return (
        <>
            <div style={{
                minHeight: "100vh",
            }}>
                <Container fluid style={{ maxWidth: 1450 }}>
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
                        Panel principal de servicios
                    </h2>
                    <Row className="g-4 flex-wrap">
                        {visibleCards.map((mod, idx) => (
                            <Col key={idx}  xs={12} md={4} lg={3}>
                                <Card
                                    className="dashboard-card h-100"
                                    style={{
                                        border: "none",
                                        borderRadius: "1.5rem",
                                        background: "#fff",
                                        color: azulPDI,
                                        boxShadow: "0 7px 24px 0 #2223",
                                        cursor: "pointer",
                                        minHeight: "218px",
                                        transition: "transform .16s, box-shadow .15s",
                                        maxWidth: 320,
                                        minWidth: 320,
                                    }}
                                    onClick={() => navigate(mod.route)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateY(-8px) scale(1.025)";
                                        e.currentTarget.style.boxShadow = `0 16px 36px 0 ${mod.color}2a`;
                                        e.currentTarget.style.border = `2.2px solid ${mod.color}`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "none";
                                        e.currentTarget.style.boxShadow = "0 7px 24px 0 #2223";
                                        e.currentTarget.style.border = "none";
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column justify-content-between">
                                        <div className="d-flex align-items-center mb-3" style={{ gap: "0.88rem" }}>
                                            <div style={{
                                                background: mod.color + "10",
                                                borderRadius: "50%",
                                                padding: "0.75rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: `2.4px solid ${mod.color}66`,
                                                color: mod.color
                                            }}>
                                                {mod.icon}
                                            </div>
                                            <Card.Title className="mb-0 fs-6 fw-bold"
                                                        style={{ color: azulPDI, textTransform: "uppercase", letterSpacing: ".06em" }}>
                                                {mod.title}
                                            </Card.Title>
                                        </div>
                                        <Card.Text style={{ color: grisOscuro, fontSize: "1.1rem", minHeight: "62px" }}>
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