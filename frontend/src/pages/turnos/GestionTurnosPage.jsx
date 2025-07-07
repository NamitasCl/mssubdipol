import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Badge, Table, Modal, Alert, ListGroup } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext";
import axios from "axios";
import AgregarPlantillasMes from "./AgregarPlantillasMes";
import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal";
import { eliminarCalendario, listarCalendarios, crearCalendario, actualizarCalendario } from "../../api/calendarApi.js";
import UnidadSelect from "../calendarios/UnidadSelect.jsx";

const tipos = [
    { value: "UNIDAD", label: "Unidad" },
    { value: "COMPLEJO", label: "Complejo" },
];

const rolServicioLabels = {
    JEFE_DE_SERVICIO: "Jefe de Servicio",
    JEFE_DE_MAQUINA: "Jefe de máquina",
    PRIMER_TRIPULANTE: "Primer tripulante",
    SEGUNDO_TRIPULANTE: "Segundo tripulante",
    TRIPULANTE: "Tripulante",
    ENCARGADO_DE_TURNO: "Encargado de turno",
    ENCARGADO_DE_GUARDIA: "Encargado de guardia",
    AYUDANTE_DE_GUARDIA: "Ayudante de guardia",
    JEFE_DE_RONDA: "Jefe de ronda",
    GUARDIA_ARMADO: "Guardia armado",
    REFUERZO_DE_GUARDIA: "Refuerzo de guardia"
};

export default function GestionTurnosPage({ onSeleccionar }) {
    const { user } = useAuth();

    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [showCrudPlantillas, setShowCrudPlantillas] = useState(false);
    const [eliminarId, setEliminarId] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [editarCalendario, setEditarCalendario] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Formulario de calendario
    const [form, setForm] = useState({
        nombre: "",
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        tipo: "UNIDAD",
        idUnidad: "",
        nombreComplejo: "",
        idPlantillasUsadas: [],
    });
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState([]);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    // Cargar calendarios al iniciar o refrescar
    useEffect(() => {
        setLoading(true);
        listarCalendarios()
            .then(setCalendarios)
            .finally(() => setLoading(false));
    }, [refresh]);

    // Cuando editarCalendario cambia, cargar sus datos al form
    useEffect(() => {
        if (editarCalendario) {
            setForm({
                nombre: editarCalendario.nombre || "",
                mes: editarCalendario.mes || (new Date().getMonth() + 1),
                anio: editarCalendario.anio || (new Date().getFullYear()),
                tipo: editarCalendario.tipo || "UNIDAD",
                idUnidad: editarCalendario.idUnidad || "",
                nombreComplejo: editarCalendario.nombreComplejo || "",
                idPlantillasUsadas: editarCalendario.idPlantillasUsadas || [],
            });
            setPlantillasSeleccionadas(editarCalendario.idPlantillasUsadasDetalles || []);
            setUnidadSeleccionada(editarCalendario.idUnidad
                ? { value: editarCalendario.idUnidad, siglasUnidad: editarCalendario.siglasUnidad, nombreUnidad: editarCalendario.nombreUnidad }
                : null);
            setShowForm(true);
        } else {
            setForm({
                nombre: "",
                mes: new Date().getMonth() + 1,
                anio: new Date().getFullYear(),
                tipo: "UNIDAD",
                idUnidad: "",
                nombreComplejo: "",
                idPlantillasUsadas: [],
            });
            setPlantillasSeleccionadas([]);
            setUnidadSeleccionada(null);
        }
    }, [editarCalendario]);

    // ---- Handlers ----
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleUnidadChange = (unidad) => {
        setUnidadSeleccionada(unidad);
        setForm((f) => ({
            ...f,
            idUnidad: unidad ? unidad.value : "",
            siglasUnidad: unidad ? unidad.siglasUnidad : "",
            nombreUnidad: unidad ? unidad.nombreUnidad : "",
        }));
    };

    const handlePlantillasGuardadas = (plantillas) => {
        setPlantillasSeleccionadas(plantillas);
        setForm((f) => ({
            ...f,
            idPlantillasUsadas: plantillas.map(p => p.id),
        }));
        setShowAgregarPlantillas(false);
    };

    const handleCrearActualizarCalendario = async (e) => {
        e.preventDefault();
        setFormError(null);

        // Validación
        if (!form.nombre.trim() || plantillasSeleccionadas.length === 0) {
            setFormError("Debe completar nombre y seleccionar al menos una plantilla.");
            return;
        }
        setSaving(true);
        try {
            let payload = { ...form };
            payload.idPlantillasUsadas = plantillasSeleccionadas.map(p => p.id);

            if (form.tipo === "COMPLEJO") {
                payload.idUnidad = null;
            } else {
                payload.nombreComplejo = "";
            }

            if (editarCalendario && editarCalendario.id) {
                await actualizarCalendario(editarCalendario.id, payload, user.idFuncionario);
            } else {
                await crearCalendario(payload, user.idFuncionario);
            }
            setRefresh(r => !r);
            setShowForm(false);
            setEditarCalendario(null);
        } catch (err) {
            setFormError("Error al guardar calendario");
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (id) => {
        await eliminarCalendario(id, user.idFuncionario || 1); // Cambia por usuario real
        setRefresh((r) => !r);
        setEliminarId(null);
    };

    // ---- Render ----
    return (
        <div className="container">
            <h4 className="mb-3">Crear nuevo calendario</h4>

            <Form className="border p-3 rounded bg-light mb-4" onSubmit={handleCrearActualizarCalendario}>
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Mes</Form.Label>
                            <Form.Select
                                name="mes"
                                value={form.mes}
                                onChange={handleChange}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option value={i + 1} key={i}>
                                        {new Date(2000, i).toLocaleString("es-CL", { month: "long" })}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Año</Form.Label>
                            <Form.Control
                                name="anio"
                                type="number"
                                value={form.anio}
                                onChange={handleChange}
                                min={2020}
                                max={2100}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row style={{ marginTop: 20, marginBottom: 20 }}>
                    <Col md={12} className={"d-flex gap-3"}>
                        <Form.Group style={{ width: 200 }}>
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control as="select" name="tipo" value={form.tipo} onChange={handleChange}>
                                {tipos.map((t) => (
                                    <option key={t.value} value={t.value}
                                            disabled={t.value === "COMPLEJO" && !user.roles.includes("ROLE_TURNOS")}
                                    >
                                        {t.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group style={{ width: 600 }}>
                            <Form.Label>{form.tipo === "COMPLEJO" ? "Nombre Complejo" : "Unidad"}</Form.Label>
                            {form.tipo === "COMPLEJO" ? (
                                <Form.Control
                                    name="nombreComplejo"
                                    value={form.nombreComplejo}
                                    onChange={handleChange}
                                    placeholder="Escribe el nombre del complejo"
                                    required
                                />
                            ) : (
                                <UnidadSelect value={unidadSeleccionada} onChange={handleUnidadChange} />
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                    <Button type="button" onClick={() => setShowAgregarPlantillas(true)}>+ Agregar Servicios</Button>
                    <Button variant="outline-secondary" type="button" onClick={() => setShowCrudPlantillas(true)}>
                        Crear / Editar Plantillas
                    </Button>
                    <Button type="submit" variant="success" disabled={saving}>
                        {saving ? <Spinner size="sm" /> : (editarCalendario ? "Actualizar Calendario" : "Crear Calendario")}
                    </Button>
                    {formError && <Alert variant="danger" className="ms-3 mb-0 py-1 px-3">{formError}</Alert>}
                </div>

                {plantillasSeleccionadas.length > 0 && (
                    <div className="mt-3">
                        <b>Servicios seleccionados:</b>
                        <ListGroup>
                            {plantillasSeleccionadas.map(p => (
                                <ListGroup.Item key={p.id}>
                                    <strong>{p.nombre}</strong> {" "}
                                    <span className="text-muted" style={{ fontSize: 13 }}>{p.descripcion}</span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                )}
            </Form>

            <AgregarPlantillasMes
                show={showAgregarPlantillas}
                mes={form.mes}
                anio={form.anio}
                seleccionadas={plantillasSeleccionadas}
                onPlantillasGuardadas={handlePlantillasGuardadas}
                onHide={() => setShowAgregarPlantillas(false)}
            />

            <PlantillasTurnoCrudModal
                show={showCrudPlantillas}
                onClose={() => setShowCrudPlantillas(false)}
            />

            <h5 className="mb-3">Mis calendarios</h5>
            {loading && <Spinner />}
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Mes/Año</th>
                    <th>Tipo</th>
                    <th>Unidad / Complejo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {calendarios.map((cal) => (
                    <tr key={cal.id}>
                        <td>{cal.nombre}</td>
                        <td>{cal.mes}/{cal.anio}</td>
                        <td>{cal.tipo}</td>
                        <td>
                            {cal.tipo === "COMPLEJO"
                                ? cal.nombreComplejo
                                : cal.siglasUnidad ?? cal.idUnidad}
                        </td>
                        <td>{cal.estado}</td>
                        <td>
                            {cal.tipo === "COMPLEJO" &&
                                (
                                    <Button variant="info" size="sm" onClick={() => onSeleccionar(cal.id)}>
                                        Configurar unidades
                                    </Button>
                                )
                            }
                            {" "}
                            <Button variant="danger" size="sm" onClick={() => setEliminarId(cal.id)}>
                                Eliminar
                            </Button>{" "}
                            <Button variant="warning" size="sm" onClick={() => {
                                setEditarCalendario(cal);
                                setShowForm(true);
                            }}>
                                Editar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <Modal show={!!eliminarId} onHide={() => setEliminarId(null)} centered>
                <Modal.Body>¿Seguro que quieres eliminar este calendario?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEliminarId(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={() => handleEliminar(eliminarId)}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
            {/* Si deseas mostrar el form en modal, puedes envolver el Form arriba en un <Modal show={showForm} .../> */}
        </div>
    );
}