import React, { useEffect, useState } from "react";
import { crearCalendario, actualizarCalendario } from "../../api/calendarApi";
import { listarPlantillas } from "../../api/plantillaApi";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import UnidadSelect from "./UnidadSelect";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

const tipos = [
    { value: "UNIDAD", label: "Unidad" },
    { value: "COMPLEJO", label: "Complejo" },
];

export default function CalendarioForm({ show, onHide, onSuccess, calendarioEditar }) {
    const { user } = useAuth();

    const [form, setForm] = useState(
        calendarioEditar
            ? { ...calendarioEditar }
            : {
                nombre: "",
                mes: new Date().getMonth() + 1,
                anio: new Date().getFullYear(),
                tipo: "UNIDAD",
                idUnidad: "",
                nombreComplejo: "",
                idPlantillasUsadas: [],
            }
    );

    useEffect(() => {
        if (calendarioEditar) {
            setForm({ ...calendarioEditar });
            setPlantillasAgregadas(calendarioEditar.idPlantillasUsadasDetalles || []);
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
            setPlantillasAgregadas([]);
        }
    }, [calendarioEditar, show]);

    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const [saving, setSaving] = useState(false);

    // PLANTILLAS
    const [plantillas, setPlantillas] = useState([]);
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
    const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
    const [plantillasAgregadas, setPlantillasAgregadas] = useState([]);

    useEffect(() => {
        listarPlantillas().then(setPlantillas);
    }, []);

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

    // Selección y agregado de plantillas
    const handlePlantillaSelect = (e) => {
        const id = e.target.value;
        if (!id) return;
        const plantilla = plantillas.find((p) => String(p.id) === String(id));
        setPlantillaSeleccionada(plantilla);
        setMostrarModalDetalle(true);
    };

    const agregarPlantilla = () => {
        if (
            plantillaSeleccionada &&
            !plantillasAgregadas.some((p) => p.id === plantillaSeleccionada.id)
        ) {
            setPlantillasAgregadas((prev) => [...prev, plantillaSeleccionada]);
            setForm((f) => ({
                ...f,
                idPlantillasUsadas: [...f.idPlantillasUsadas, plantillaSeleccionada.id],
            }));
        }
        setMostrarModalDetalle(false);
        setPlantillaSeleccionada(null);
    };

    const quitarPlantilla = (id) => {
        setPlantillasAgregadas((prev) => prev.filter((p) => p.id !== id));
        setForm((f) => ({
            ...f,
            idPlantillasUsadas: f.idPlantillasUsadas.filter((pid) => pid !== id),
        }));
    };

    // GUARDADO
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let payload = { ...form };
            if (form.tipo === "COMPLEJO") {
                payload.idUnidad = null;
            } else {
                payload.nombreComplejo = "";
            }
            console.log(payload)

            await (calendarioEditar && calendarioEditar.id
                    ? actualizarCalendario(calendarioEditar.id, payload, user.idFuncionario)
                    : crearCalendario(payload, user.idFuncionario)
            );
            if (onSuccess) onSuccess();
            setForm({
                nombre: "",
                mes: new Date().getMonth() + 1,
                anio: new Date().getFullYear(),
                tipo: "UNIDAD",
                idUnidad: "",
                nombreComplejo: "",
                idPlantillasUsadas: [],
            });
            
            setUnidadSeleccionada(null);
            setPlantillasAgregadas([]);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {calendarioEditar ? "Editar Calendario" : "Nuevo Calendario"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <Form.Group>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Mes</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="mes"
                                        value={form.mes}
                                        onChange={handleChange}
                                        required
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
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
                        <Form.Group>
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control as="select" name="tipo" value={form.tipo} onChange={handleChange}>
                                {tipos.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
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

                        {/* Selección de plantillas */}
                        <Form.Group>
                            <Form.Label>Agregar Plantilla(s) de Turno</Form.Label>
                            <Form.Control as="select" onChange={handlePlantillaSelect} value="">
                                <option value="">Selecciona una plantilla...</option>
                                {plantillas
                                    .filter((p) => !plantillasAgregadas.some((x) => x.id === p.id))
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre}
                                        </option>
                                    ))}
                            </Form.Control>
                            {plantillasAgregadas.length > 0 && (
                                <div className="mt-2">
                                    <strong>Plantillas seleccionadas:</strong>
                                    <ul>
                                        {plantillasAgregadas.map((p) => (
                                            <li key={p.id}>
                                                <p style={{marginRight: '10px', display: 'inline-block'}}>
                                                    {p.nombre}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    className="ml-2"
                                                    onClick={() => quitarPlantilla(p.id)}
                                                >
                                                    Quitar
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="success" disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal para ver detalle de plantilla seleccionada */}
            <Modal show={mostrarModalDetalle} onHide={() => setMostrarModalDetalle(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de Plantilla</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {plantillaSeleccionada && (
                        <>
                            <h5>{plantillaSeleccionada.nombre}</h5>
                            <div>{plantillaSeleccionada.descripcion}</div>
                            <hr />
                            <strong>Servicios:</strong>
                            <ul>
                                {plantillaSeleccionada.servicios.map((s, i) => (
                                    <li key={i}>
                                        <b>{s.nombreServicio}</b> ({s.turno}, {s.horaInicio} - {s.horaFin})<br />
                                        Recintos: {s.cantidadRecintos}
                                        <ul>
                                            {s.cupos.map((c, j) => (
                                                <li key={j}>
                                                    {c.rol}: {c.cantidad}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setMostrarModalDetalle(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={agregarPlantilla}>
                        Aceptar y Agregar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}