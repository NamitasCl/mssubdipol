import React, { useState } from "react";
import { Button, Form, Card, Row, Col, Table } from "react-bootstrap";

const ROLES = ["Encargado", "Ayudante", "Jefe", "Auxiliar"]; // Personaliza tus roles

export default function AdministradorPlantillas({ onSubmit }) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [servicios, setServicios] = useState([]);

    // Añadir un servicio nuevo
    const addServicio = () => {
        setServicios([
            ...servicios,
            {
                nombreServicio: "",
                cantidadRecintos: 1,
                turno: "Día",
                horaInicio: "08:00",
                horaFin: "20:00",
                cupos: [{ rol: ROLES[0], cantidad: 1 }]
            }
        ]);
    };

    // Quitar servicio
    const removeServicio = idx => {
        setServicios(servicios.filter((_, i) => i !== idx));
    };

    // Cambiar datos de un servicio
    const updateServicio = (idx, field, value) => {
        const newServicios = [...servicios];
        newServicios[idx][field] = value;
        setServicios(newServicios);
    };

    // Añadir/quitar cupos a un servicio
    const addCupo = idx => {
        const newServicios = [...servicios];
        newServicios[idx].cupos.push({ rol: ROLES[0], cantidad: 1 });
        setServicios(newServicios);
    };
    const removeCupo = (servIdx, cupoIdx) => {
        const newServicios = [...servicios];
        newServicios[servIdx].cupos.splice(cupoIdx, 1);
        setServicios(newServicios);
    };
    const updateCupo = (servIdx, cupoIdx, field, value) => {
        const newServicios = [...servicios];
        newServicios[servIdx].cupos[cupoIdx][field] = value;
        setServicios(newServicios);
    };

    // Enviar datos
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit && onSubmit({
            nombre, descripcion, servicios
        });
    };

    return (
        <Card className="p-4 shadow-lg rounded-4" style={{ background: "#f5f9ff", maxWidth: 900, margin: "0 auto" }}>
            <h3 className="mb-4" style={{ color: "#1e355d" }}>Crear Plantilla de Servicio</h3>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </Col>
                    <Col>
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
                    </Col>
                </Row>
                <h5 className="mt-4" style={{ color: "#2863aa" }}>Servicios</h5>
                {servicios.map((serv, idx) => (
                    <Card key={idx} className="p-3 mb-4" style={{ background: "#eef5fd" }}>
                        <Row className="align-items-center mb-2">
                            <Col md={3}><Form.Control
                                placeholder="Nombre Servicio"
                                value={serv.nombreServicio}
                                onChange={e => updateServicio(idx, "nombreServicio", e.target.value)}
                                required
                            /></Col>
                            <Col md={2}><Form.Control
                                type="number"
                                min={1}
                                value={serv.cantidadRecintos}
                                onChange={e => updateServicio(idx, "cantidadRecintos", e.target.value)}
                                required
                            /></Col>
                            <Col md={2}><Form.Select
                                value={serv.turno}
                                onChange={e => updateServicio(idx, "turno", e.target.value)}
                            >
                                <option value="Día">Día</option>
                                <option value="Noche">Noche</option>
                            </Form.Select></Col>
                            <Col md={2}><Form.Control
                                type="time"
                                value={serv.horaInicio}
                                onChange={e => updateServicio(idx, "horaInicio", e.target.value)}
                                required
                            /></Col>
                            <Col md={2}><Form.Control
                                type="time"
                                value={serv.horaFin}
                                onChange={e => updateServicio(idx, "horaFin", e.target.value)}
                                required
                            /></Col>
                            <Col md={1}>
                                <Button size="sm" variant="outline-danger" onClick={() => removeServicio(idx)}>Quitar</Button>
                            </Col>
                        </Row>
                        <Table size="sm" bordered>
                            <thead>
                            <tr>
                                <th>Rol</th>
                                <th>Cantidad</th>
                                <th>Acción</th>
                            </tr>
                            </thead>
                            <tbody>
                            {serv.cupos.map((cupo, cupoIdx) => (
                                <tr key={cupoIdx}>
                                    <td>
                                        <Form.Select value={cupo.rol}
                                                     onChange={e => updateCupo(idx, cupoIdx, "rol", e.target.value)}>
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <Form.Control type="number" min={1}
                                                      value={cupo.cantidad}
                                                      onChange={e => updateCupo(idx, cupoIdx, "cantidad", e.target.value)} />
                                    </td>
                                    <td>
                                        <Button size="sm" variant="outline-danger"
                                                onClick={() => removeCupo(idx, cupoIdx)}>Quitar</Button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={3}>
                                    <Button size="sm" variant="outline-primary" onClick={() => addCupo(idx)}>
                                        + Agregar Cupo
                                    </Button>
                                </td>
                            </tr>
                            </tbody>
                        </Table>
                    </Card>
                ))}
                <Button className="mb-4" variant="outline-success" onClick={addServicio}>+ Agregar Servicio</Button>
                <div className="text-end">
                    <Button type="submit" variant="primary" size="lg">Guardar Plantilla</Button>
                </div>
            </Form>
        </Card>
    );
}
