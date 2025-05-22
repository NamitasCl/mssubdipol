import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useAuth } from "../AuthContext"; // Ajusta el path si es necesario

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const userRoles = user?.roles || [];

    const cards = [
        {
            title: "Gestión por unidad",
            text: "Asigne los funcionarios que deben ser incluidos en el rol de guardias.",
            gradient: "linear-gradient(to right, #198754, #157347)",
            to: "/asignacionunidad",
            roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"],
        },
        {
            title: "Gestión de turnos",
            text: "Configure y distribuya turnos entre las unidades colaboradoras.",
            gradient: "linear-gradient(to right, #6f42c1, #5a32a3)",
            to: "/turnos",
            roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"],
        },
        {
            title: "Ver personal disponible",
            text: "Consulte funcionarios disponibles para cada día del mes.",
            gradient: "linear-gradient(to right, #fd7e14, #dc582a)",
            to: "/disponibles",
            roles: ["ROLE_SECUIN", "ROLE_ADMINISTRADOR"],
        },
        {
            title: "Área restringida Jefes",
            text: "Asigne o remueva el subjefe de unidad.",
            gradient: "linear-gradient(to right, #0dcaf0, #0aa2c0)",
            to: "/jefe",
            roles: ["ROLE_JEFE", "ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"],
        },
        {
            title: "Administración del sistema",
            text: "Acceda a funciones administrativas como roles, usuarios y configuración.",
            gradient: "linear-gradient(to right, #dc3545, #b02a37)",
            to: "/admin",
            roles: ["ROLE_ADMINISTRADOR"],
        },
        {
            title: "Ver mis turnos",
            text: "Ver mis turnos mensuales y anuales asignados durante el año.",
            gradient: "linear-gradient(to right, #6c757d, #495057)",
            to: "/enconstruccion",
            roles: ["ROLE_FUNCIONARIO", "ROLE_ADMINISTRADOR"],
        },
        {
            title: "Ver turnos",
            text: "Ver los turnos del día correspondientes al Cuartel Independencia.",
            gradient: "linear-gradient(to right, #6c757d, #495057)",
            to: "/enconstruccion",
            roles: ["ROLE_FUNCIONARIO", "ROLE_ADMINISTRADOR"],
        },
        {
            title: "Aprobar cambios de turno",
            text: "Aprobar cambios de turnos de funcionarios de mi unidad.",
            gradient: "linear-gradient(to right, #6c757d, #495057)",
            to: "/enconstruccion",
            roles: ["ROLE_SUBJEFE", "ROLE_ADMINISTRADOR"],
        },
    ];

    // Filtrar tarjetas visibles según los roles del usuario
    const visibleCards = cards.filter((card) => {

        // Mostrar tarjeta si es pública y no hay usuario logueado
        if (card.roles.includes("PUBLIC") && !user) return true;

        // Mostrar si el usuario tiene uno de los roles requeridos
        console.log("UserRoles:", userRoles);
        return card.roles.some((rol) => userRoles.includes(rol));
    });


    return (
        <Container className="mt-4">
            <Row className="mx-2">
                {visibleCards.map((card, index) => (
                    <Col md={4} className="mb-4" key={index}>
                        <Card className="h-100 shadow-sm rounded-4">
                            <Card.Header
                                className="d-flex rounded-top-4 p-0"
                                style={{ background: card.gradient, height: "10rem" }}
                            >
                                <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                                    <h4 className="text-white text-center fw-bold m-0">{card.title}</h4>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Card.Text className="text-muted mb-4">{card.text}</Card.Text>
                                <div className="d-grid">
                                    <Button
                                        className="text-white"
                                        style={{ backgroundColor: "#00234c" }}
                                        onClick={() => navigate(card.to)}
                                    >
                                        Ingresar
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Dashboard;