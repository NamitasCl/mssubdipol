import React, { useState } from 'react';
import { useAuth } from './components/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Card, Image } from 'react-bootstrap';
import PdiLogo from "./assets/imagenes/pdilogo.png";

// Paleta institucional sugerida
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#1a2233";

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ username, password });
            navigate("/");
        } catch (err) {
            setError("Credenciales incorrectas. Intenta nuevamente.");
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={{
                background: `radial-gradient(circle at 55% 30%, #23395d 40%, #142032 100%)`,
                minHeight: "100vh"
            }}
        >
            <Container>
                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "20px"
                }}>
                    <Button variant={"warning"} onClick={() => window.location.href="https://rac.investigaciones.cl/opciones/"}>
                        Volver a RAC
                    </Button>
                </div>
                <Card
                    className="mx-auto border-0 shadow"
                    style={{
                        maxWidth: 400,
                        borderRadius: "1rem",
                        background: "rgba(28,36,48,0.96)",
                        border: `2.5px solid ${doradoPDI}`,
                        boxShadow: "0 6px 30px rgba(23,53,90, 0.45)"
                    }}
                >
                    <div className="d-flex flex-column align-items-center pt-4 pb-2">
                        <Image src={PdiLogo} alt="Logo PDI" height={58} className="mb-2" style={{filter:"drop-shadow(0 2px 4px #1118)"}} />
                        <span
                            className="text-uppercase"
                            style={{
                                fontWeight: 700,
                                color: doradoPDI,
                                letterSpacing: ".15em",
                                fontSize: "1.06rem"
                            }}
                        >
                            PLANA MAYOR SUBDIPOL
                        </span>
                    </div>
                    <div className="px-4">
                        <h4
                            className="fw-bold text-center mb-1"
                            style={{
                                color: "#fff",
                                letterSpacing: ".03em",
                                fontSize: "1.48rem",
                                textTransform: "uppercase"
                            }}
                        >
                            Acceso Institucional
                        </h4>
                        <div
                            className="text-center mb-4"
                            style={{
                                fontSize: ".98rem",
                                color: "#b3c0d1",
                                letterSpacing: ".03em"
                            }}
                        >
                            Sistema Integrado de Gestión de Servicios
                        </div>
                        <Form onSubmit={handleSubmit} autoComplete="off">
                            <Form.Group controlId="loginUsername" className="mb-3">
                                <Form.Label
                                    className="fw-semibold text-light"
                                    style={{ letterSpacing: ".04em" }}
                                >
                                    Usuario
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Usuario institucional"
                                    autoFocus
                                    required
                                    style={{
                                        background: grisOscuro,
                                        color: "#fff",
                                        border: `1.5px solid ${doradoPDI}`,
                                        borderRadius: ".5rem"
                                    }}
                                />
                            </Form.Group>
                            <Form.Group controlId="loginPassword" className="mb-3">
                                <Form.Label
                                    className="fw-semibold text-light"
                                    style={{ letterSpacing: ".04em" }}
                                >
                                    Contraseña
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    required
                                    style={{
                                        background: grisOscuro,
                                        color: "#fff",
                                        border: `1.5px solid ${doradoPDI}`,
                                        borderRadius: ".5rem"
                                    }}
                                />
                            </Form.Group>
                            {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}
                            <div className="d-grid mb-2">
                                <Button
                                    variant="warning"
                                    type="submit"
                                    className="fw-bold text-dark"
                                    style={{
                                        background: doradoPDI,
                                        border: `2px solid ${doradoPDI}`,
                                        borderRadius: "2rem",
                                        fontSize: "1.08rem",
                                        letterSpacing: ".05em",
                                        boxShadow: "0 2px 12px #ffd80044"
                                    }}
                                >
                                    INGRESAR
                                </Button>
                            </div>
                        </Form>
                        <div className="text-center mt-3 mb-2">
                            <small style={{ color: "#7d8ba4" }}>
                                Uso exclusivo para personal autorizado.<br />
                                Acceso monitoreado por seguridad institucional.
                            </small>
                        </div>
                    </div>
                </Card>
            </Container>
        </div>
    );
};

export default LoginForm;