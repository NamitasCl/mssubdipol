import React, { useState, useEffect } from "react";
import {
    Modal, Button, Table, Form, Row, Col, Badge, Card, OverlayTrigger, Tooltip, Container
} from "react-bootstrap";
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

function emptyRol() {
    return { nombreRol: "", cantidad: 1, gradosPermitidos: "" };
}

export default function PlantillasTurnoCrudModal({ show, onClose }) {
    const [plantillas, setPlantillas] = useState([]);
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        tipoServicio: "",
        horaInicio: "08:00",
        horaFin: "20:00",
        dias: [],
        restricciones: [],
        roles: [emptyRol()],
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
        } else if (name === "restricciones") {
            setForm(f => ({
                ...f,
                restricciones: value.split(",").map(x => x.trim()).filter(Boolean)
            }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    }

    // CRUD Roles
    function handleRolChange(idx, key, value) {
        setForm(f => ({
            ...f,
            roles: f.roles.map((r, i) => i === idx ? { ...r, [key]: value } : r)
        }));
    }
    function handleRolGrados(idx, grado) {
        setForm(f => ({
            ...f,
            roles: f.roles.map((r, i) => {
                if (i !== idx) return r;
                const arr = (r.gradosPermitidos || "").split(",").map(x => x.trim()).filter(Boolean);
                const found = arr.includes(grado);
                const nueva = found ? arr.filter(g => g !== grado) : [...arr, grado];
                return { ...r, gradosPermitidos: nueva.join(",") };
            })
        }));
    }
    function agregarRol() {
        setForm(f => ({ ...f, roles: [...f.roles, emptyRol()] }));
    }
    function eliminarRol(idx) {
        setForm(f => ({
            ...f,
            roles: f.roles.length === 1 ? [emptyRol()] : f.roles.filter((_, i) => i !== idx)
        }));
    }

    function handleEdit(p) {
        setEditId(p.id);
        setForm({
            nombre: p.nombre,
            descripcion: p.descripcion || "",
            tipoServicio: p.tipoServicio || "",
            horaInicio: p.horaInicio ? p.horaInicio.slice(0, 5) : "08:00",
            horaFin: p.horaFin ? p.horaFin.slice(0, 5) : "20:00",
            dias: p.dias || [],
            restricciones: p.restricciones || [],
            roles: p.roles && p.roles.length > 0
                ? p.roles.map(r => ({
                    nombreRol: r.nombreRol,
                    cantidad: r.cantidad,
                    gradosPermitidos: r.gradosPermitidos || ""
                }))
                : [emptyRol()]
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
            dias: [],
            restricciones: [],
            roles: [emptyRol()],
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const payload = {
            ...form,
            roles: form.roles.map(r => ({
                ...r,
                cantidad: Number(r.cantidad) || 1,
                gradosPermitidos: (r.gradosPermitidos || "").split(",").map(x => x.trim()).filter(Boolean).join(",")
            }))
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

    const TIPOS_SERVICIO = [
        { value: "guardia", label: "Guardia" },
        { value: "procepol", label: "Procepol" },
        { value: "turno", label: "Turno" },
        { value: "servicio", label: "Servicio" },
        // Agrega más aquí si lo necesitas
    ];


    return (
        <Modal show={show} onHide={onClose} fullscreen size="xl" centered>
            {/* Barra superior */}
            <Modal.Header

                style={{
                    background: "#193a59",
                    color: "#fff",
                    borderBottom: "1.5px solid #eaf2fb",
                    paddingTop: 16, paddingBottom: 16
                }}>
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                    style={{
                        filter: "invert(1)",
                        position: "absolute",
                        top: 22,
                        right: 18,
                        zIndex: 2,
                        opacity: 0.85
                    }}
                />
                <Modal.Title style={{ fontWeight: 700, fontSize: 22, letterSpacing: ".02em" }}>
                    <i className="bi bi-layout-wtf me-2" />
                    Plantillas de Turno <span className="fs-6 ms-2 text-info">Diseño y roles personalizados</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
                background: "#f4f6fa",
                minHeight: 720,
                padding: 0
            }}>
                <Container fluid style={{ padding: "0 36px", maxWidth: 1440 }}>
                    <Row className="pt-4 pb-2">
                        {/* Formulario lado izquierdo */}
                        <Col lg={5} md={6} sm={12} style={{ borderRight: "1.5px solid #e1eaf6" }}>
                            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                                <Form onSubmit={handleSubmit} autoComplete="off">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Nombre del Servicio</Form.Label>
                                        <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required autoFocus />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Descripción</Form.Label>
                                        <Form.Control name="descripcion" value={form.descripcion} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Servicio</Form.Label>
                                        <Form.Select
                                            name="tipoServicio"
                                            value={form.tipoServicio}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            {TIPOS_SERVICIO.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Hora Inicio</Form.Label>
                                                <Form.Control type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Hora Fin</Form.Label>
                                                <Form.Control type="time" name="horaFin" value={form.horaFin} onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
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
                                    <Form.Group className="mb-3">
                                        <Form.Label>Restricciones (opcional, separa con coma)</Form.Label>
                                        <Form.Control
                                            name="restricciones"
                                            value={Array.isArray(form.restricciones) ? form.restricciones.join(",") : form.restricciones}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    {/* ROLES */}
                                    <Form.Group className="mb-3">
                                        <div className="d-flex align-items-center mb-1">
                                            <Form.Label className="fw-bold mb-0" style={{ fontSize: 17 }}>
                                                Roles del Servicio
                                            </Form.Label>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="ms-3"
                                                type="button"
                                                onClick={agregarRol}
                                            >
                                                + Agregar Rol
                                            </Button>
                                        </div>
                                        <div style={{
                                            maxHeight: "350px",
                                            overflowY: "auto",
                                            border: "1px solid #e0eaf7",
                                            borderRadius: 13,
                                            background: "#f8fafd",
                                            padding: 12,
                                            marginBottom: 8
                                        }}>
                                            {form.roles.map((rol, idx) => (
                                                <Card
                                                    key={idx}
                                                    className="mb-3 border-0"
                                                    style={{
                                                        background: "#f3f8fe",
                                                        borderRadius: 13,
                                                        boxShadow: "0 2px 14px #d6e2f622",
                                                        padding: "11px 12px"
                                                    }}
                                                >
                                                    <Row>
                                                        <Col xs={10} md={10}>
                                                            <Row className="align-items-end g-2">
                                                                <Col xs={7} md={7}>
                                                                    <Form.Label className="mb-1 fw-light" style={{ fontSize: 13 }}>Nombre Rol</Form.Label>
                                                                    <Form.Control
                                                                        size="sm"
                                                                        placeholder="Ej: Encargado"
                                                                        value={rol.nombreRol}
                                                                        onChange={e => handleRolChange(idx, "nombreRol", e.target.value)}
                                                                        required
                                                                    />
                                                                </Col>
                                                                <Col xs={3} md={3}>
                                                                    <Form.Label className="mb-1 fw-light" style={{ fontSize: 13 }}>Cantidad</Form.Label>
                                                                    <Form.Control
                                                                        size="sm"
                                                                        type="number"
                                                                        min={1}
                                                                        value={rol.cantidad}
                                                                        onChange={e => handleRolChange(idx, "cantidad", e.target.value)}
                                                                        required
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col xs={10} md={10}>
                                                                    <Form.Label className="mb-1 fw-light" style={{ fontSize: 13 }}>Grados</Form.Label>
                                                                    <div className="d-flex flex-wrap gap-1 pt-1" style={{ minHeight: 34 }}>
                                                                        {TODOS_GRADOS.map(g => {
                                                                            const seleccionado = (rol.gradosPermitidos || "").split(",").includes(g);
                                                                            return (
                                                                                <OverlayTrigger
                                                                                    key={g}
                                                                                    placement="top"
                                                                                    overlay={<Tooltip>{g}</Tooltip>}
                                                                                >
                                                                                    <Badge
                                                                                        bg={seleccionado ? "primary" : "light"}
                                                                                        text={seleccionado ? "light" : "dark"}
                                                                                        style={{
                                                                                            cursor: "pointer",
                                                                                            borderRadius: 8,
                                                                                            fontWeight: 500,
                                                                                            fontSize: 13,
                                                                                            padding: "3px 7px",
                                                                                            border: seleccionado ? "1.2px solid #224477" : "1.2px solid #e3e8ee",
                                                                                            marginBottom: 1,
                                                                                            opacity: seleccionado ? 0.98 : 0.68,
                                                                                            boxShadow: seleccionado ? "0 1px 4px #91b2ed44" : undefined
                                                                                        }}
                                                                                        onClick={() => handleRolGrados(idx, g)}
                                                                                    >{g}</Badge>
                                                                                </OverlayTrigger>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col>
                                                            <Row>
                                                                <Col xs={12} className="d-flex align-items-end justify-content-end">
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        type="button"
                                                                        onClick={() => eliminarRol(idx)}
                                                                        title="Eliminar rol"
                                                                        disabled={form.roles.length === 1}
                                                                        style={{ padding: "3px 7px", fontSize: 18, borderRadius: 8, lineHeight: 1 }}
                                                                    >×</Button>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>

                                                </Card>
                                            ))}
                                        </div>
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
                            </div>
                        </Col>
                        {/* Tabla plantillas lado derecho */}
                        <Col lg={7} md={6} sm={12} style={{ background: "#f9fafb", minHeight: 600 }}>
                            <div className="p-4">
                                <h5 className="mb-4" style={{ fontWeight: 700, color: "#24487a", letterSpacing: ".02em" }}>Plantillas Registradas</h5>
                                <Table striped bordered size="sm" style={{ background: "#fff", borderRadius: 10 }}>
                                    <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Días</th>
                                        <th>Roles</th>
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
                                                {p.roles && p.roles.map((r, i) => (
                                                    <div key={i} style={{ fontSize: 14 }}>
                                                        <Badge bg="primary" className="me-1">{r.nombreRol}</Badge>
                                                        <span className="text-dark">
                                                            x{r.cantidad}
                                                            {" "}
                                                            <span className="text-muted">
                                                                ({r.gradosPermitidos})
                                                            </span>
                                                        </span>
                                                    </div>
                                                ))}
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
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    );
}
