import React, { useEffect, useState } from "react";
import { Container, Navbar, Row, Col, Image, Card, Button, Spinner } from "react-bootstrap";
import PdiLogo from "../assets/imagenes/pdilogo.png";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { FaSignOutAlt, FaPlus, FaClipboardList, FaCheckCircle, FaUserCheck } from "react-icons/fa";

// Paleta pastel
const azulSuave = "#7fa6da";
const azulOscuro = "#23395d";
const grisClaro = "#eceff4";
const blanco = "#fff";
const verdeMenta = "#a6e3cf";
const textoPrincipal = "#23395d";
const textoSecundario = "#4a5975";

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
                        Sistema Integrado de Gestión de Formularios
                    </h1>
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

// Panel de estadísticas con tarjetas pastel
function EstadisticasPanel({ stats, loading }) {
    const tarjetas = [
        {
            label: "Formularios creados",
            value: stats?.creados ?? "-",
            icon: <FaClipboardList size={28} color={azulSuave} />,
            color: blanco,
            border: azulSuave
        },
        {
            label: "Formularios activos",
            value: stats?.activos ?? "-",
            icon: <FaCheckCircle size={28} color={verdeMenta} />,
            color: blanco,
            border: verdeMenta
        },
        {
            label: "Asignados a mí",
            value: stats?.asignados ?? "-",
            icon: <FaUserCheck size={28} color={grisClaro} />,
            color: blanco,
            border: grisClaro
        }
    ];

    return (
        <Row className="g-4 my-1 justify-content-center">
            {tarjetas.map((t, i) => (
                <Col key={i} xs={12} md={4}>
                    <Card
                        className="h-100 border-0 shadow-sm rounded-4"
                        style={{
                            background: t.color,
                            minHeight: 104,
                            borderLeft: `7px solid ${t.border}`,
                            boxShadow: "0 5px 22px 0 #9ec8e733"
                        }}
                    >
                        <Card.Body className="d-flex align-items-center gap-3 py-3">
                            <div className="rounded-4 d-flex align-items-center justify-content-center"
                                 style={{
                                     width: 52, height: 52,
                                     background: "#f5f7fa",
                                     border: `2.5px solid ${t.border}`
                                 }}>
                                {t.icon}
                            </div>
                            <div>
                                <div className="fw-bold" style={{ fontSize: 27, color: textoPrincipal }}>
                                    {loading ? <Spinner animation="border" size="sm" /> : t.value}
                                </div>
                                <div className="text-muted" style={{ fontSize: 15 }}>{t.label}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

const ServiciosEspecialesPanelLayout = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    /*
    useEffect(() => {

        setLoading(true);
        fetch(`${import.meta.env.VITE_FORMS_API_URL}/estadisticas?usuarioId=${user?.id}`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => setStats({}))
            .finally(() => setLoading(false));
    }, [user]);

     */

    // Botón flotante para crear formulario
    const crearFormulario = () => {
        navigate("/servicios-especiales/crear-formulario");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f8fafc",
            position: "relative"
        }}>
            <Header />

            <div className="container-lg py-3" style={{ maxWidth: 1350 }}>
                <EstadisticasPanel stats={stats} loading={loading} />
            </div>

            {/* Contenido principal ocupa todo el espacio */}
            <Container

                className="pt-4"
                style={{
                    minHeight: "60vh",
                    position: "relative"
                }}
            >
                {/* Renderiza la lista de formularios o el contenido de rutas hijas */}
                {children || <Outlet />}
            </Container>

            {/* Botón flotante crear formulario, abajo a la derecha */}
            <Button
                variant="light"
                onClick={crearFormulario}
                className="d-flex align-items-center justify-content-center"
                style={{
                    position: "fixed",
                    bottom: 38,
                    right: 38,
                    width: 66,
                    height: 66,
                    borderRadius: "50%",
                    boxShadow: "0 4px 22px #b2c6e677",
                    background: azulSuave,
                    color: "#fff",
                    fontSize: 30,
                    zIndex: 2024,
                    border: "none",
                    transition: "background .16s, box-shadow .14s, transform .10s"
                }}
                title="Crear nuevo formulario"
                onMouseEnter={e => {
                    e.currentTarget.style.background = verdeMenta;
                    e.currentTarget.style.boxShadow = "0 8px 28px #a6e3cf55";
                    e.currentTarget.style.transform = "scale(1.09)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = azulSuave;
                    e.currentTarget.style.boxShadow = "0 4px 22px #b2c6e677";
                    e.currentTarget.style.transform = "none";
                }}
            >
                <FaPlus />
            </Button>
        </div>
    );
};

export default ServiciosEspecialesPanelLayout;
