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
    FaListAlt,
    FaExchangeAlt
} from "react-icons/fa";
import { useAuth } from "./components/contexts/AuthContext.jsx";

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

// Organización de tarjetas por categorías
const CARD_GROUPS = [
    {
        title: "Gestión de Jefaturas",
        description: "Funciones exclusivas para jefes y subjefes de unidad",
        cards: [
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
                title: "Solicitudes de cambio",
                text: "Gestione solicitudes de intercambio de turnos de su unidad.",
                icon: <FaExchangeAlt size={34} />,
                route: "/layout/solicitudes-cambio",
                color: "#d97706",
                roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
            },
            {
                title: "Área Jefatura",
                text: "Gestione y remueva subjefes de unidad.",
                icon: <FaUserShield size={34} />,
                route: "/layout/jefe",
                color: azulSuave,
                roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"]
            },
        ]
    },
    {
        title: "Coordinación SECUIN",
        description: "Herramientas de coordinación y gestión centralizada",
        cards: [
            {
                title: "Gestión de turnos",
                text: "Configure y distribuya turnos entre las unidades colaboradoras.",
                icon: <FaClipboardList size={34} />,
                route: "/layout/gestion",
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
                title: "Configurar unidades",
                text: "Configure las unidades y departamentos del sistema.",
                icon: <FaCogs size={34} />,
                route: "/layout/configuraunidades",
                color: "#6366f1",
                roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"]
            },
        ]
    },
    {
        title: "Consulta y Visualización",
        description: "Acceso a información de turnos y calendarios",
        cards: [
            {
                title: "Ver mis turnos",
                text: "Visualice sus turnos mensuales y anuales asignados.",
                icon: <FaCalendarAlt size={34} />,
                route: "/layout/calendario",
                color: azulOscuro,
                roles: ["ROLE_FUNCIONARIO", "ROLE_ADMINISTRADOR"]
            },
            {
                title: "Calendarios",
                text: "Consulte los calendarios de turnos de todas las unidades.",
                icon: <FaCalendarAlt size={32} />,
                route: "/layout/calendarios",
                color: "#10b981",
                roles: ["ROLE_FUNCIONARIO", "ROLE_ADMINISTRADOR"]
            },
        ]
    },
    {
        title: "Administración",
        description: "Configuración avanzada del sistema",
        cards: [
            {
                title: "Constructor de plantillas",
                text: "Construcción de plantillas de servicios personalizadas.",
                icon: <FaCogs size={36} />,
                route: "/layout/plantillas",
                color: "#8b5cf6",
                roles: ["ROLE_ADMINISTRADOR"]
            },
        ]
    }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRoles = user?.roles || [];

    // Filtrar grupos y cards según roles del usuario
    const visibleGroups = CARD_GROUPS
        .map(group => ({
            ...group,
            cards: group.cards.filter(card =>
                card.roles.some(role => userRoles.includes(role))
            )
        }))
        .filter(group => group.cards.length > 0);

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

                    {visibleGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="mb-5">
                            {/* Section Header */}
                            <div className="mb-3" style={{
                                borderBottom: `2px solid ${azulPDI}20`,
                                paddingBottom: "0.75rem"
                            }}>
                                <h5 className="fw-bold mb-1" style={{
                                    color: azulPDI,
                                    fontSize: "1.1rem",
                                    textTransform: "uppercase",
                                    letterSpacing: ".05em"
                                }}>
                                    {group.title}
                                </h5>
                                <p className="mb-0" style={{
                                    color: textoSecundario,
                                    fontSize: "0.9rem"
                                }}>
                                    {group.description}
                                </p>
                            </div>

                            {/* Cards Grid */}
                            <Row className="g-4 mb-4">
                                {group.cards.map((mod, idx) => (
                                    <Col key={idx} xs={12} md={6} lg={4} xl={3}>
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
                        </div>
                    ))}
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