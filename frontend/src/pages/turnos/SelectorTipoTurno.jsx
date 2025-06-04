import React from "react";
import { Card, Button, Row, Col, Container } from "react-bootstrap";

// Paleta institucional y pastel
const azulPDI = "#17355A";
const azulSuave = "#7fa6da";
const azulOscuro = "#23395d";
const azulClaro = "#b1cfff";
const grisClaro = "#eceff4";
const doradoPDI = "#FFC700";
const textoPrincipal = "#22334a";
const textoSecundario = "#4a5975";

export default function SelectorTipoTurno({ onSeleccion }) {
    // onSeleccion(tipo) => "UNIDAD", "COMPLEJO", "CONSULTA"
    return (
        <Container style={{ maxWidth: 700, marginTop: 32 }}>
            <Card
                className="shadow rounded-4"
                style={{
                    border: "none",
                    background: "#fff",
                    padding: "44px 32px 32px 32px",
                    boxShadow: "0 6px 36px 0 #b1cfff36",
                    borderLeft: `7px solid ${doradoPDI}`,
                }}
            >
                <h3
                    className="mb-4 fw-bold"
                    style={{
                        color: azulPDI,
                        letterSpacing: ".07em",
                        textTransform: "uppercase",
                        fontSize: "1.38rem",
                    }}
                >
                    ¿Qué desea gestionar en turnos?
                </h3>
                <Row className="g-4 justify-content-center mb-2">
                    <Col xs={12} md={4}>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100 py-3 rounded-4 fw-bold shadow-sm"
                            style={{
                                background: azulSuave,
                                border: `2px solid ${azulPDI}`,
                                fontSize: "1.09rem",
                                color: azulOscuro,
                                transition: "all .16s",
                            }}
                            onClick={() => onSeleccion("UNIDAD")}
                            onMouseEnter={e => { e.currentTarget.style.background = azulClaro; }}
                            onMouseLeave={e => { e.currentTarget.style.background = azulSuave; }}
                        >
                            Turnos de <b>Unidad</b>
                        </Button>
                    </Col>
                    <Col xs={12} md={4}>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-100 py-3 rounded-4 fw-bold shadow-sm"
                            style={{
                                background: azulClaro,
                                border: `2px solid ${azulSuave}`,
                                fontSize: "1.09rem",
                                color: azulPDI,
                                transition: "all .16s",
                            }}
                            onClick={() => onSeleccion("COMPLEJO")}
                            onMouseEnter={e => { e.currentTarget.style.background = azulSuave; }}
                            onMouseLeave={e => { e.currentTarget.style.background = azulClaro; }}
                        >
                            Turnos de <b>Complejo</b>
                        </Button>
                    </Col>
                    <Col xs={12} md={4}>
                        <Button
                            variant="light"
                            size="lg"
                            className="w-100 py-3 rounded-4 fw-bold shadow-sm"
                            style={{
                                background: grisClaro,
                                border: `2px solid ${azulClaro}`,
                                fontSize: "1.09rem",
                                color: textoSecundario,
                                transition: "all .16s",
                            }}
                            onClick={() => onSeleccion("CONSULTA")}
                            onMouseEnter={e => { e.currentTarget.style.background = azulClaro; e.currentTarget.style.color = azulOscuro; }}
                            onMouseLeave={e => { e.currentTarget.style.background = grisClaro; e.currentTarget.style.color = textoSecundario; }}
                        >
                            Consultar <b>Turnos</b>
                        </Button>
                    </Col>
                </Row>
                <div className="mt-3 text-center" style={{ color: textoSecundario, fontSize: 15.5 }}>
                    Seleccione si quiere gestionar turnos de su <b>Unidad</b>, de un <b>Complejo</b> policial, o sólo consultar asignaciones de turnos previos.
                </div>
            </Card>
        </Container>
    );
}
