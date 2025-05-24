import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Card, Container, Button } from "react-bootstrap";

const doradoPDI = "#FFC700";

const ListaRegistrosFormulario = ({ formulario, onVolver }) => {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios
            .get(`${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${formulario.id}`)
            .then(({ data }) => setRegistros(data))
            .catch(() => setError("Error cargando registros"))
            .finally(() => setLoading(false));
    }, [formulario.id]);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    if (!registros.length) {
        return (
            <Card>
                <Card.Body>
                    <h5>No hay registros aún para este formulario.</h5>
                    <Button variant="secondary" onClick={onVolver}>Volver</Button>
                </Card.Body>
            </Card>
        );
    }

    // Detecta dinámicamente los campos
    const campos = Object.keys(registros[0].datos || {});

    return (
        <Container style={{ maxWidth: 950 }}>
            <Card
                className="shadow border-0 mx-auto mb-4"
                style={{
                    background: "rgba(28,36,48,0.97)",
                    borderRadius: "1.2rem",
                    border: `2.5px solid ${doradoPDI}`,
                }}
            >
                <Card.Body>
                    <h4 style={{ color: doradoPDI }}>{formulario.nombre}</h4>
                    <p className="text-light mb-3">{formulario.descripcion}</p>
                    <Button variant="outline-warning" onClick={onVolver} className="mb-3">
                        Volver a formularios
                    </Button>
                    <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            {campos.map((c, i) => (
                                <th key={i}>{c}</th>
                            ))}
                            <th>Fecha de Respuesta</th>
                            <th>Funcionario</th>
                        </tr>
                        </thead>
                        <tbody>
                        {registros.map((reg, idx) => (
                            <tr key={reg.id}>
                                <td>{idx + 1}</td>
                                {campos.map((campo, j) => (
                                    <td key={j}>
                                        {typeof reg.datos[campo] === "boolean"
                                            ? reg.datos[campo] ? "Sí" : "No"
                                            : reg.datos[campo]}
                                    </td>
                                ))}
                                <td>{new Date(reg.fechaRespuesta).toLocaleString()}</td>
                                <td>{reg.idFuncionario}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ListaRegistrosFormulario;