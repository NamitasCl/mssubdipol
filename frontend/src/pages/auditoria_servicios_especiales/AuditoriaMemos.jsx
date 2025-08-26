// AuditoriaMemos.jsx
import React, {useState} from "react";
import {Badge, Button, Col, Container, Form, ListGroup, Modal, Row, Tab, Table, Tabs,} from "react-bootstrap";

// -------------------
// Datos Mock
// -------------------
const MOCK_MEMOS = [
    {
        id: 1,
        fecha: "2025-08-20",
        tipo: "Detención",
        folioBrain: "FB123",
        ruc: "RUC-111",
        unidad: "BRIGADA CRIM LOS ANDES",
        region: "Valparaíso",
        comuna: "Los Andes",
        estado: "PENDIENTE",
        personas: [
            {id: 10, rut: "12.345.678-9", nombre: "Juan Pérez"},
            {id: 11, rut: "22.333.444-5", nombre: "Ana Soto"},
        ],
        armas: [{id: 20, tipo: "Pistola", calibre: "9mm"}],
        drogas: [],
        vehiculos: [{id: 30, patente: "ABCD12", marca: "Toyota"}],
        issues: [
            {
                id: 100,
                severidad: "ERROR",
                codigo: "FALTA_UNIDAD",
                detalle: "El memo no tiene unidad asociada",
            },
            {
                id: 101,
                severidad: "WARN",
                codigo: "RUT_FORMATO",
                detalle: "RUT con formato inválido: 22.333.444-5",
            },
        ],
    },
    {
        id: 2,
        fecha: "2025-08-21",
        tipo: "Incautación",
        folioBrain: "FB999",
        ruc: "RUC-222",
        unidad: "BRIGADA CRIM IQUIQUE",
        region: "Tarapacá",
        comuna: "Iquique",
        estado: "APROBADO",
        personas: [],
        armas: [],
        drogas: [{id: 40, tipo: "Cocaína", cantidad: "2 kg"}],
        vehiculos: [],
        issues: [],
    },
];

// Colores de estado
const estadoColors = {
    PENDIENTE: "secondary",
    APROBADO: "success",
    OBSERVADO: "warning",
    RECHAZADO: "danger",
};

export default function AuditoriaMemos() {
    const [selected, setSelected] = useState(null);

    return (
        <Container fluid className="p-4">
            <h3>📋 Auditoría de Memos</h3>

            {/* -------- Filtros -------- */}
            <Row className="mb-3">
                <Col md={2}>
                    <Form.Select>
                        <option>-- Región --</option>
                        <option>Valparaíso</option>
                        <option>Tarapacá</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control placeholder="Unidad"/>
                </Col>
                <Col md={2}>
                    <Form.Select>
                        <option>-- Tipo --</option>
                        <option>Detención</option>
                        <option>Incautación</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select>
                        <option>-- Estado --</option>
                        <option>PENDIENTE</option>
                        <option>APROBADO</option>
                        <option>OBSERVADO</option>
                        <option>RECHAZADO</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control type="date"/>
                </Col>
                <Col md={2}>
                    <Button variant="primary" className="w-100">
                        Filtrar
                    </Button>
                </Col>
            </Row>

            {/* -------- Tabla -------- */}
            <Table striped bordered hover size="sm">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Folio</th>
                    <th>RUC</th>
                    <th>Unidad</th>
                    <th>Región</th>
                    <th>Comuna</th>
                    <th>Estado</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {MOCK_MEMOS.map((m) => (
                    <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.fecha}</td>
                        <td>{m.tipo}</td>
                        <td>{m.folioBrain}</td>
                        <td>{m.ruc}</td>
                        <td>{m.unidad}</td>
                        <td>{m.region}</td>
                        <td>{m.comuna}</td>
                        <td>
                            <Badge bg={estadoColors[m.estado]}>{m.estado}</Badge>
                        </td>
                        <td>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => setSelected(m)}
                            >
                                Ver Detalle
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {/* -------- Modal Detalle -------- */}
            <Modal
                show={!!selected}
                onHide={() => setSelected(null)}
                size="lg"
                fullscreen="lg-down"
            >
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Memo #{selected.id} - {selected.tipo}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                <strong>Fecha:</strong> {selected.fecha} <br/>
                                <strong>Unidad:</strong> {selected.unidad} ({selected.region} -{" "}
                                {selected.comuna})
                            </p>

                            <Tabs defaultActiveKey="personas" className="mb-3">
                                <Tab eventKey="personas" title="Personas">
                                    {selected.personas.length === 0 ? (
                                        <p>No hay personas asociadas.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.personas.map((p) => (
                                                <ListGroup.Item key={p.id}>
                                                    {p.nombre} ({p.rut})
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="armas" title="Armas">
                                    {selected.armas.length === 0 ? (
                                        <p>No hay armas.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.armas.map((a) => (
                                                <ListGroup.Item key={a.id}>
                                                    {a.tipo} - {a.calibre}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="drogas" title="Drogas">
                                    {selected.drogas.length === 0 ? (
                                        <p>No hay drogas.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.drogas.map((d) => (
                                                <ListGroup.Item key={d.id}>
                                                    {d.tipo} - {d.cantidad}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="vehiculos" title="Vehículos">
                                    {selected.vehiculos.length === 0 ? (
                                        <p>No hay vehículos.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.vehiculos.map((v) => (
                                                <ListGroup.Item key={v.id}>
                                                    {v.patente} - {v.marca}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="issues" title="Observaciones">
                                    {selected.issues.length === 0 ? (
                                        <p>No hay observaciones.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.issues.map((i) => (
                                                <ListGroup.Item key={i.id}>
                                                    <Badge
                                                        bg={
                                                            i.severidad === "ERROR"
                                                                ? "danger"
                                                                : i.severidad === "WARN"
                                                                    ? "warning"
                                                                    : "info"
                                                        }
                                                        className="me-2"
                                                    >
                                                        {i.severidad}
                                                    </Badge>
                                                    <strong>{i.codigo}</strong> - {i.detalle}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="success"
                                onClick={() => alert("Aprobado ✅")}
                                size="sm"
                            >
                                Aprobar
                            </Button>
                            <Button
                                variant="warning"
                                onClick={() => alert("Observado ⚠️")}
                                size="sm"
                            >
                                Observar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => alert("Rechazado ❌")}
                                size="sm"
                            >
                                Rechazar
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
}
