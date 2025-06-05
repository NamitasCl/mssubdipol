import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form, Row, Col, Badge } from "react-bootstrap";
import axios from "axios";

const ENDPOINT = import.meta.env.VITE_TURNOS_API_URL + "/plantillas";

const DIAS_SEMANA = [
    { label: "Lunes", value: "MONDAY" },
    { label: "Martes", value: "TUESDAY" },
    { label: "Miércoles", value: "WEDNESDAY" },
    { label: "Jueves", value: "THURSDAY" },
    { label: "Viernes", value: "FRIDAY" },
    { label: "Sábado", value: "SATURDAY" },
    { label: "Domingo", value: "SUNDAY" },
];

const TODOS_GRADOS = [
    "PFT","SPF","SPF (OPP)","COM","COM (OPP)",
    "SBC","SBC (OPP)","ISP","SBI","DTV","APS","AP","APP","APP (AC)",
];

export default function PlantillasTurnoCrudModal({ show, onClose }) {
    const [plantillas, setPlantillas] = useState([]);
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        tipoServicio: "",
        horaInicio: "08:00",
        horaFin: "20:00",
        cantidadFuncionarios: 1,
        dias: [],
        restricciones: [],
        gradosPermitidos: [],
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (show) cargarPlantillas();
    }, [show]);

    async function cargarPlantillas() {
        const { data } = await axios.get(ENDPOINT);
        setPlantillas(data || []);
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox" && name === "dias") {
            setForm(f => ({
                ...f,
                dias: checked ? [...f.dias, value] : f.dias.filter(v => v !== value)
            }));
        } else if (type === "checkbox" && name === "gradosPermitidos") {
            setForm(f => ({
                ...f,
                gradosPermitidos: checked ? [...f.gradosPermitidos, value] : f.gradosPermitidos.filter(v => v !== value)
            }));
        } else {
            setForm(f => ({ ...f, [name]: type === "number" ? +value : value }));
        }
    }

    function handleEdit(p) {
        setEditId(p.id);
        setForm({
            nombre: p.nombre,
            descripcion: p.descripcion || "",
            tipoServicio: p.tipoServicio || "",
            horaInicio: p.horaInicio ? p.horaInicio.slice(0, 5) : "08:00",
            horaFin: p.horaFin ? p.horaFin.slice(0, 5) : "20:00",
            cantidadFuncionarios: p.cantidadFuncionarios,
            dias: p.dias || [],
            restricciones: p.restricciones || [],
            gradosPermitidos: p.gradosPermitidos || [],
        });
    }

    function limpiarForm() {
        setEditId(null);
        setForm({
            nombre: "",
            descripcion: "",
            tipoServicio: "",
            horaInicio: "08:00",
            horaFin: "20:00",
            cantidadFuncionarios: 1,
            dias: [],
            restricciones: [],
            gradosPermitidos: [],
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const payload = {
            ...form,
            dias: form.dias,
            restricciones: Array.isArray(form.restricciones)
                ? form.restricciones.filter(x => !!x) : [],
            gradosPermitidos: form.gradosPermitidos,
        };
        if (editId) {
            await axios.put(`${ENDPOINT}/${editId}`, payload);
        } else {
            await axios.post(ENDPOINT, payload);
        }
        limpiarForm();
        cargarPlantillas();
    }

    async function handleDelete(id) {
        if (window.confirm("¿Seguro de eliminar esta plantilla?")) {
            await axios.delete(`${ENDPOINT}/${id}`);
            cargarPlantillas();
        }
    }

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Plantillas de Turno <span className="fs-6 text-secondary">- Configura los servicios</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={5} className="border-end">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-2">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control name="descripcion" value={form.descripcion} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Tipo de Servicio</Form.Label>
                                <Form.Control name="tipoServicio" value={form.tipoServicio} onChange={handleChange} />
                            </Form.Group>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Inicio</Form.Label>
                                        <Form.Control type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Fin</Form.Label>
                                        <Form.Control type="time" name="horaFin" value={form.horaFin} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-2">
                                <Form.Label>Cantidad de Funcionarios</Form.Label>
                                <Form.Control type="number" name="cantidadFuncionarios" min={1} value={form.cantidadFuncionarios} onChange={handleChange} required />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Días de la Semana</Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {DIAS_SEMANA.map(dia => (
                                        <Form.Check
                                            key={dia.value}
                                            type="checkbox"
                                            name="dias"
                                            value={dia.value}
                                            label={dia.label}
                                            checked={form.dias.includes(dia.value)}
                                            onChange={handleChange}
                                        />
                                    ))}
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Grados Permitidos</Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {TODOS_GRADOS.map(g => (
                                        <Form.Check
                                            key={g}
                                            type="checkbox"
                                            name="gradosPermitidos"
                                            value={g}
                                            label={g}
                                            checked={form.gradosPermitidos.includes(g)}
                                            onChange={handleChange}
                                        />
                                    ))}
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Restricciones (opcional, separa con coma)</Form.Label>
                                <Form.Control
                                    name="restricciones"
                                    value={form.restricciones.join(",")}
                                    onChange={e => setForm(f => ({
                                        ...f,
                                        restricciones: e.target.value.split(",").map(x => x.trim()).filter(Boolean)
                                    }))}
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-end mt-3">
                                {editId &&
                                    <Button variant="secondary" className="me-2" onClick={limpiarForm}>Cancelar</Button>
                                }
                                <Button type="submit" variant={editId ? "warning" : "primary"}>
                                    {editId ? "Actualizar" : "Crear"}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                    <Col md={7}>
                        <Table striped bordered size="sm" className="mt-2">
                            <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Días</th>
                                <th>Funcionarios</th>
                                <th>Grados</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {plantillas.map(p =>
                                <tr key={p.id}>
                                    <td>
                                        <b>{p.nombre}</b><br />
                                        <small className="text-muted">{p.descripcion}</small>
                                    </td>
                                    <td>
                                        {p.dias?.map(d =>
                                            <Badge key={d} bg="light" text="dark" className="me-1 mb-1">{d[0] + d.slice(1).toLowerCase()}</Badge>
                                        )}
                                    </td>
                                    <td>
                                        {p.cantidadFuncionarios}
                                    </td>
                                    <td>
                                        {p.gradosPermitidos?.map(g =>
                                            <Badge key={g} bg="info" className="me-1 mb-1">{g}</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <Button size="sm" variant="outline-primary" className="me-1"
                                                onClick={() => handleEdit(p)}>Editar</Button>
                                        <Button size="sm" variant="outline-danger"
                                                onClick={() => handleDelete(p.id)}>Eliminar</Button>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
}