import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
const doradoPDI = "#FFC700";
const tiposCampo = [
    { value: "text", label: "Texto" },
    { value: "datetime-local", label: "Fecha y Hora" },
    { value: "boolean", label: "Sí/No (checkbox)" },
    { value: "select", label: "Lista (select)" }
];

const vacioCampo = () => ({
    nombre: "", etiqueta: "", tipo: "text", requerido: false, opciones: "", orden: 1
});

export default function CrearEditarFormularioDinamico({ user, formulario, onSuccess }) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [campos, setCampos] = useState([]);
    const [visibilidad, setVisibilidad] = useState([{ tipoDestino: "unidad", valorDestino: "" }]);
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (formulario) {
            setNombre(formulario.nombre || "");
            setDescripcion(formulario.descripcion || "");
            setCampos(formulario.campos?.length ? formulario.campos : [vacioCampo()]);
            setVisibilidad(formulario.visibilidad?.length ? formulario.visibilidad : [{ tipoDestino: "unidad", valorDestino: "" }]);
        } else {
            setNombre(""); setDescripcion(""); setCampos([vacioCampo()]); setVisibilidad([{ tipoDestino: "unidad", valorDestino: "" }]);
        }
        setMsg(null); setError(null);
    }, [formulario]);

    // --- handlers campos ---
    const handleCampoChange = (idx, key, value) => {
        setCampos(camps =>
            camps.map((c, i) => (i === idx ? { ...c, [key]: value } : c))
        );
    };
    const addCampo = () => setCampos([...campos, vacioCampo()]);
    const delCampo = idx => setCampos(campos.filter((_, i) => i !== idx));

    // --- handlers visibilidad ---
    const handleVisibilidadChange = (idx, key, value) => {
        setVisibilidad(list =>
            list.map((v, i) => (i === idx ? { ...v, [key]: value } : v))
        );
    };
    const addVisibilidad = () => setVisibilidad([...visibilidad, { tipoDestino: "unidad", valorDestino: "" }]);
    const delVisibilidad = idx => setVisibilidad(visibilidad.filter((_, i) => i !== idx));

    // --- submit ---
    const handleSubmit = async e => {
        e.preventDefault();
        setMsg(null); setError(null);
        if (!nombre || campos.length === 0) {
            setError("Debe ingresar nombre y al menos un campo");
            return;
        }
        const payload = {
            nombre, descripcion,
            campos: campos.map((c, idx) => ({ ...c, orden: idx + 1 })),
            visibilidad
        };
        try {
            if (formulario?.id) {
                await fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formulario.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    },
                    body: JSON.stringify(payload)
                });
            }
            setMsg("Formulario guardado correctamente.");
            if (onSuccess) onSuccess();
        } catch {
            setError("Error al guardar el formulario.");
        }
    };

    return (
        <Card
            className="shadow-lg border-0 mx-auto"
            style={{
                background: "rgba(28,36,48,0.98)",
                borderRadius: "1.2rem",
                border: `2.5px solid ${doradoPDI}`,
                boxShadow: "0 5px 30px 0 #0e2042a1"
            }}
        >
            <Card.Body>
                <h4 style={{ color: doradoPDI, fontWeight: 700 }}>
                    {formulario ? "Editar" : "Crear"} Formulario Dinámico
                </h4>
                {msg && <Alert variant="success">{msg}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit} autoComplete="off">
                    <Form.Group className="mb-2">
                        <Form.Label style={{ color: doradoPDI }}>Nombre</Form.Label>
                        <Form.Control
                            type="text" value={nombre}
                            onChange={e => setNombre(e.target.value)} required
                            style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: doradoPDI }}>Descripción</Form.Label>
                        <Form.Control
                            type="text" value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}
                        />
                    </Form.Group>
                    <h5 className="mt-4 mb-2" style={{ color: doradoPDI }}>Campos del formulario</h5>
                    {campos.map((campo, idx) => (
                        <Row key={idx} className="align-items-end mb-2">
                            <Col md={2}>
                                <Form.Label style={{ color: "#b8becd" }}>Nombre</Form.Label>
                                <Form.Control type="text" value={campo.nombre}
                                              onChange={e => handleCampoChange(idx, "nombre", e.target.value)}
                                              required style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}/>
                            </Col>
                            <Col md={3}>
                                <Form.Label style={{ color: "#b8becd" }}>Etiqueta</Form.Label>
                                <Form.Control type="text" value={campo.etiqueta}
                                              onChange={e => handleCampoChange(idx, "etiqueta", e.target.value)}
                                              required style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}/>
                            </Col>
                            <Col md={2}>
                                <Form.Label style={{ color: "#b8becd" }}>Tipo</Form.Label>
                                <Form.Select value={campo.tipo} onChange={e => handleCampoChange(idx, "tipo", e.target.value)}
                                             style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}>
                                    {tiposCampo.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Form.Label style={{ color: "#b8becd" }}>Opciones</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={campo.opciones || ""}
                                    onChange={e => handleCampoChange(idx, "opciones", e.target.value)}
                                    placeholder="Solo para select (a,b,c)"
                                    style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}
                                    disabled={campo.tipo !== "select"}
                                />
                            </Col>
                            <Col md={2}>
                                <Form.Check
                                    type="checkbox"
                                    label="Requerido"
                                    checked={campo.requerido}
                                    onChange={e => handleCampoChange(idx, "requerido", e.target.checked)}
                                    style={{ color: doradoPDI, marginTop: 28 }}
                                />
                            </Col>
                            <Col md={1}>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="mb-1"
                                    onClick={() => delCampo(idx)}
                                    disabled={campos.length === 1}
                                    style={{ marginTop: 30 }}
                                >X</Button>
                            </Col>
                        </Row>
                    ))}
                    <div className="d-flex mb-3">
                        <Button type="button" variant="outline-warning"
                                onClick={addCampo} style={{ borderRadius: "1rem" }}>
                            + Agregar campo
                        </Button>
                    </div>
                    <h5 className="mt-3 mb-2" style={{ color: doradoPDI }}>Visibilidad</h5>
                    {visibilidad.map((v, idx) => (
                        <Row key={idx} className="align-items-end mb-2">
                            <Col md={4}>
                                <Form.Select value={v.tipoDestino}
                                             onChange={e => handleVisibilidadChange(idx, "tipoDestino", e.target.value)}
                                             style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}>
                                    <option value="unidad">Unidad</option>
                                    <option value="usuario">Usuario</option>
                                    <option value="grupo">Grupo</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Control type="text"
                                              placeholder="Ej: sigla unidad, id usuario, nombre grupo..."
                                              value={v.valorDestino}
                                              onChange={e => handleVisibilidadChange(idx, "valorDestino", e.target.value)}
                                              style={{ background: "#222938", color: "#fff", border: `1.5px solid ${doradoPDI}` }}/>
                            </Col>
                            <Col md={2}>
                                <Button variant="danger" size="sm"
                                        className="mb-1"
                                        onClick={() => delVisibilidad(idx)}
                                        disabled={visibilidad.length === 1}
                                        style={{ marginTop: 5 }}
                                >X</Button>
                            </Col>
                        </Row>
                    ))}
                    <div className="d-flex mb-3">
                        <Button type="button" variant="outline-warning"
                                onClick={addVisibilidad} style={{ borderRadius: "1rem" }}>
                            + Agregar visibilidad
                        </Button>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <Button type="submit"
                                variant="warning"
                                className="fw-bold px-4"
                                style={{
                                    background: doradoPDI,
                                    color: "#17355A",
                                    border: `2px solid ${doradoPDI}`,
                                    borderRadius: "2rem",
                                    fontSize: "1.07rem",
                                    letterSpacing: ".05em",
                                    boxShadow: "0 2px 10px #ffd80033"
                                }}>
                            Guardar formulario
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}