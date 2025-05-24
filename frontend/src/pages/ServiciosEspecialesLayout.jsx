import React from "react";
import { Container, Navbar, Nav, Row, Col } from "react-bootstrap";
import PdiLogo from "../assets/imagenes/pdilogo.png"; // Usa tu logo
import { Outlet, Link } from "react-router-dom";
import {Header} from "../pages/DashboardPrincipal.jsx";
// Puedes cambiar por tus rutas o props.children

const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";

// Layout institucional
const ServiciosEspecialesLayout = ({ children }) => (
    <div style={{ minHeight: "calc(100vh-100px)", background: "radial-gradient(circle at 60% 10%, #23395d 0%, #172338 90%)" }}>
        {/* Header Institucional */}
        <Header />
        {/* Menú superior institucional */}
        <Container fluid className="px-0" style={{ background: "#172338", marginTop: "84px" }}>
            <Row>
                <Col>
                    <Nav
                        variant="tabs"
                        defaultActiveKey="/servicios-especiales"
                        className="px-4"
                        style={{ background: "#19233a", borderBottom: `2px solid ${doradoPDI}` }}
                    >
                        <Nav.Item>
                            <Nav.Link as={Link} to="/servicios-especiales/listarformsdisponibles" style={{ color: doradoPDI, fontWeight: 600 }}>
                                Formularios
                            </Nav.Link>
                        </Nav.Item>
                        {/* Puedes agregar más Nav.Item según los módulos */}
                    </Nav>
                </Col>
            </Row>
        </Container>
        {/* Contenido principal */}
        <Container
            fluid
            style={{
                padding: "32px 0",
                minHeight: "calc(100vh - 140px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start"
            }}
        >
            <Row style={{ width: "100%" }}>
                <Col xs={12} md={10} lg={9} xl={8} className="mx-auto">
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
        </Container>
    </div>
);

export default ServiciosEspecialesLayout;
