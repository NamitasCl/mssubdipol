import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import {Link, Outlet, useNavigate} from 'react-router-dom';
import {Form, Button, Alert, Container, Row, Col, Image as BImage, Navbar, Nav} from 'react-bootstrap';
import PdiLogo from "./assets/imagenes/pdilogo.png";

const LoginForm = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate(); // 👈 Hook de navegación
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ username, password });
            navigate("/"); // 👈 Redirige al Dashboard
        } catch (err) {
            setError("Credenciales incorrectas. Intenta nuevamente.");
        }
    };

    const handleClick = () => {
        if (user) {
            logout();
            window.location.href = "/turnos/login";
        } else {
            window.location.href = "/turnos/login";
        }
    }

    return (

            <div className="min-vh-100 d-flex flex-column">
                {/* Barra superior */}
                <Navbar bg="dark" variant="dark">
                    <Container fluid className="d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-center">
                            <BImage src={PdiLogo} alt="Logo" height={"100%"} />
                            <h6 className="text-white text-uppercase">Plana Mayor Subdipol</h6>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                            <h1 className="mb-4 fw-bold text-white">Sistema de Gestión de Turnos</h1>
                            <h5 className="mt-0 fw-bold text-white">Complejo Policial Cuartel Independencia</h5>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="light" onClick={() => window.location.href = 'https://rac.investigaciones.cl'}>Volver a RAC</Button>
                            <Button variant="outline-light" className="d-flex align-items-center gap-2" onClick={() => handleClick()}>
                                <span>{user ? "Cerrar sesión" : "Iniciar sesión"}</span>
                                <i className="bi bi-box-arrow-right"></i>
                            </Button>
                        </div>
                    </Container>
                </Navbar>

                {/* Contenido general con sidebar + contenido */}
                <Row className="w-100 justify-content-center">
                    <Col xs={12} sm={8} md={5} lg={2}>
                        <h3 className="mb-4 text-center">Iniciar Sesión</h3>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="loginUsername" className="mb-3">
                                <Form.Label>Usuario</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ingresa tu usuario"
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="loginPassword" className="mb-3">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    required
                                />
                            </Form.Group>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <div className="d-grid">
                                <Button variant="primary" type="submit">
                                    Iniciar Sesión
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </div>



    );
};

export default LoginForm;