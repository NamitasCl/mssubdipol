import React, { useState, useEffect } from "react";
import {Card, Form, Button, Row, Col, Alert, OverlayTrigger, Tooltip} from "react-bootstrap";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import axios from "axios";


const doradoPDI = "#FFC700";
const tiposCampo = [
    { value: "text", label: "Texto" },
    { value: "datetime-local", label: "Fecha y Hora" },
    { value: "boolean", label: "Sí/No (checkbox)" },
    { value: "select", label: "Lista (select)" },
    { value: "radio", label: "Radio (selección)"},
    { value: "funcionario", label: "Lista Funcionarios"},
    { value: "unidad", label: "Lista Unidades"},
    { value: "repol", label: "Región Policial"}
];

const vacioCampo = () => ({
    nombre: "", etiqueta: "", tipo: "text", requerido: false, opciones: "", orden: 1
});

const vacioVisibilidad = () => ({
    tipoDestino: "unidad",
    valorDestino: null
});

export default function CrearEditarFormularioDinamico({ user, formulario, onSuccess }) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [campos, setCampos] = useState([]);
    const [visibilidad, setVisibilidad] = useState([vacioVisibilidad()]);
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (formulario) {
            setNombre(formulario.nombre || "");
            setDescripcion(formulario.descripcion || "");
            setCampos(formulario.campos?.length ? formulario.campos : [vacioCampo()]);
            if (formulario.visibilidad?.length) {
                Promise.all(
                    formulario.visibilidad.map(async v => {
                        if ((v.tipoDestino === "unidad" || v.tipoDestino === "usuario") && typeof v.valorDestino === "string") {
                            // Para selects, usamos value y label
                            return {
                                ...v,
                                valorDestino: {
                                    value: v.valorDestino,
                                    label: v.valorDestinoNombre || v.valorDestino
                                }
                            };
                        }
                        // grupo: string plano. publica: null
                        return v;
                    })
                ).then(setVisibilidad);
            } else {
                setVisibilidad([vacioVisibilidad()]);
            }
        } else {
            setNombre("");
            setDescripcion("");
            setCampos([vacioCampo()]);
            setVisibilidad([vacioVisibilidad()]);
        }
        setMsg(null); setError(null);
    }, [formulario, user.token]);



    // --- handlers campos ---
    const handleCampoChange = (idx, key, value) => {
        setCampos(camps =>
            camps.map((c, i) => {
                if (i !== idx) return c;

                // Si está cambiando el tipo...
                if (key === "tipo") {
                    // Si el nuevo tipo NO es select NI radio, borra opciones
                    if (!(value === "select" || value === "radio")) {
                        return { ...c, tipo: value, opciones: "" };
                    }
                }
                // Para cualquier otro cambio, deja igual
                return { ...c, [key]: value };
            })
        );
    };
    const addCampo = () => setCampos([...campos, vacioCampo()]);
    const delCampo = idx => setCampos(campos.filter((_, i) => i !== idx));

    // --- handlers visibilidad ---
    const handleVisibilidadChange = (idx, key, value) => {
        setVisibilidad(list =>
            list.map((v, i) =>
                i === idx
                    ? key === "tipoDestino" && value === "publica"
                        ? { tipoDestino: value, valorDestino: null }
                        : { ...v, [key]: value }
                    : v
            )
        );
    };
    const addVisibilidad = () => setVisibilidad([...visibilidad, vacioVisibilidad()]);
    const delVisibilidad = idx => setVisibilidad(visibilidad.filter((_, i) => i !== idx));

    // --- submit ---
    const handleSubmit = async e => {
        e.preventDefault();
        setMsg(null); setError(null);

        if (!nombre || campos.length === 0) {
            setError("Debe ingresar nombre y al menos un campo");
            return;
        }

        const esPublica = visibilidad.some(v => v.tipoDestino === "publica");
        const reglasVisibilidad = esPublica
            ? [{ tipoDestino: "publica", valorDestino: null }]
            : visibilidad.map(v => ({
                tipoDestino: v.tipoDestino,
                valorDestino:
                    (v.tipoDestino === "unidad" || v.tipoDestino === "usuario")
                        ? (v.valorDestino && typeof v.valorDestino === "object" && v.valorDestino.value
                            ? v.valorDestino.value
                            : "")
                        : (
                            v.tipoDestino === "grupo"
                                ? (typeof v.valorDestino === "object" && v.valorDestino.value
                                        ? v.valorDestino.value
                                        : v.valorDestino
                                )
                                : v.valorDestino
                        )
            }));

        const payload = {
            nombre,
            descripcion,
            campos: campos.map((c, idx) => ({ ...c, orden: idx + 1 })),
            visibilidad: reglasVisibilidad
        };

        if (formulario && formulario.id) {
            payload.id = formulario.id;
        }

        const urlBase = `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`;
        const isEdit = formulario && formulario.id;
        const method = isEdit ? "PUT" : "POST";
        const url = isEdit ? `${urlBase}/${formulario.id}` : urlBase;

        try {
            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            setMsg(isEdit ? "Formulario actualizado correctamente." : "Formulario guardado correctamente.");
            if (onSuccess) onSuccess();
        } catch {
            setError(isEdit ? "Error al actualizar el formulario." : "Error al guardar el formulario.");
        }
    };

    // Estilo de inputs
    const inputStyle = {
        background: "#222938",
        color: "#fff",
        border: `1.5px solid ${doradoPDI}`
    };

    // Si alguna visibilidad es pública, bloquea la opción de agregar más
    const esPublica = visibilidad.some(v => v.tipoDestino === "publica");

    return (
        <Card
            className="shadow-lg border-0 mx-auto"
            style={{
                background: "rgba(28,36,48,0.98)",
                borderRadius: "1.2rem",
                border: `2.5px solid ${doradoPDI}`,
                boxShadow: "0 5px 30px 0 #0e2042a1",
                overflow: "hidden"
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
                            style={inputStyle}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: doradoPDI }}>Descripción</Form.Label>
                        <Form.Control
                            type="text" value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            style={inputStyle}
                        />
                    </Form.Group>
                    <h5 className="mt-4 mb-2" style={{ color: doradoPDI }}>Campos del formulario</h5>
                    {campos.map((campo, idx) => (
                        <Row key={idx} className="align-items-end mb-2">
                            <Col md={2}>
                                <Form.Label style={{ color: "#b8becd" }}>Nombre</Form.Label>
                                <Form.Control type="text" value={campo.nombre}
                                              onChange={e => handleCampoChange(idx, "nombre", e.target.value)}
                                              required style={inputStyle}/>
                            </Col>
                            <Col md={3}>
                                <Form.Label style={{ color: "#b8becd" }}>Etiqueta</Form.Label>
                                <Form.Control type="text" value={campo.etiqueta}
                                              onChange={e => handleCampoChange(idx, "etiqueta", e.target.value)}
                                              required style={inputStyle}/>
                            </Col>
                            <Col md={2}>
                                <Form.Label style={{ color: "#b8becd" }}>Tipo</Form.Label>
                                <Form.Select value={campo.tipo} onChange={e => handleCampoChange(idx, "tipo", e.target.value)}
                                             style={inputStyle}>
                                    {tiposCampo.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Form.Label style={{ color: "#b8becd" }}>Opciones</Form.Label>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`tooltip-opciones-${idx}`}>
                                            <p>Solo para <b>select</b> o <b>radio</b>: <br />
                                            Ingresa las opciones separadas por coma, por ejemplo:<br />
                                                <code>Si,No,En Proceso</code></p>
                                        </Tooltip>
                                    }
                                >
                                    <Form.Control
                                        type="text"
                                        value={campo.opciones || ""}
                                        onChange={e => handleCampoChange(idx, "opciones", e.target.value)}
                                        placeholder="Solo para select/radio (a,b,c)"
                                        style={inputStyle}
                                        disabled={!(campo.tipo === "select" || campo.tipo === "radio")}
                                        // Puedes añadir un ícono o un hint visual si gustas
                                    />
                                </OverlayTrigger>
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
                                <Form.Select
                                    value={v.tipoDestino}
                                    onChange={e => handleVisibilidadChange(idx, "tipoDestino", e.target.value)}
                                    style={inputStyle}
                                    disabled={esPublica && v.tipoDestino !== "publica"}
                                >
                                    <option value="unidad">Unidad</option>
                                    <option value="usuario">Usuario</option>
                                    <option value="grupo">Grupo</option>
                                    <option value="publica">Pública</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                {v.tipoDestino === "unidad" && (
                                    <AsyncUnidadesSelect
                                        value={v.valorDestino}
                                        onChange={opt => handleVisibilidadChange(idx, "valorDestino", opt)}
                                        user={user}
                                    />
                                )}
                                {v.tipoDestino === "usuario" && (
                                    <AsyncFuncionarioSelect
                                        value={v.valorDestino}
                                        onChange={opt => handleVisibilidadChange(idx, "valorDestino", opt)}
                                        user={user}
                                    />
                                )}
                                {v.tipoDestino === "grupo" && (
                                    <Form.Control
                                        type="text"
                                        placeholder="Nombre de grupo"
                                        value={v.valorDestino?.label || v.valorDestino || ""}
                                        onChange={e => handleVisibilidadChange(idx, "valorDestino", { value: e.target.value, label: e.target.value })}
                                        style={inputStyle}
                                    />
                                )}
                                {v.tipoDestino === "publica" && (
                                    <div style={{ color: doradoPDI, paddingTop: 6, paddingLeft: 8 }}>
                                        Cualquiera puede ver este formulario
                                    </div>
                                )}
                            </Col>
                            <Col md={2}>
                                <Button variant="danger" size="sm"
                                        className="mb-1"
                                        onClick={() => delVisibilidad(idx)}
                                        disabled={visibilidad.length === 1 || esPublica}
                                        style={{ marginTop: 5 }}
                                >X</Button>
                            </Col>
                        </Row>
                    ))}
                    <div className="d-flex mb-3">
                        <Button
                            type="button"
                            variant="outline-warning"
                            onClick={addVisibilidad}
                            style={{ borderRadius: "1rem" }}
                            disabled={esPublica}
                        >
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