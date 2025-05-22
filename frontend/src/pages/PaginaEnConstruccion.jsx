import React from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";

const PaginaEnConstruccion = () => {
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #1f1c2c, #928dab)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff"
        }}>
            <Container>
                <Row className="justify-content-center text-center">
                    <Col md={8}>
                        <Image
                            src="https://cdn-icons-png.flaticon.com/512/679/679922.png"
                            alt="En Construcción"
                            width={150}
                            height={150}
                            className="mb-4"
                        />
                        <h1 style={{ fontSize: "3rem", fontWeight: "700" }}>Página en Construcción</h1>
                        <p style={{ fontSize: "1.2rem", opacity: 0.85 }}>
                            Estamos trabajando para traerte algo increíble. Vuelve pronto para ver las novedades.
                        </p>
                        <Button
                            variant="light"
                            className="mt-3"
                            onClick={() => window.location.href = "/turnos"}
                        >
                            Volver al Inicio
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PaginaEnConstruccion;