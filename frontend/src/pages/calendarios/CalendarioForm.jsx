import React, {useEffect, useState} from "react";
import { crearCalendario, actualizarCalendario } from "../../api/calendarApi";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import UnidadSelect from "./UnidadSelect";
import {useAuth} from "../../components/contexts/AuthContext.jsx";

const tipos = [
    { value: "UNIDAD", label: "Unidad" },
    { value: "COMPLEJO", label: "Complejo" },
];

export default function CalendarioForm({ show, onHide, onSuccess, calendarioEditar }) {

    const {user} = useAuth();

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
        }
    }, [calendarioEditar, show]);

    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleUnidadChange = (unidad) => {
        console.log("Unidad seleccionada:", unidad);

        setUnidadSeleccionada(unidad);
        setForm((f) => ({
            ...f,
            idUnidad: unidad ? unidad.value : "",
            siglasUnidad: unidad ? unidad.siglasUnidad : "",
            nombreUnidad: unidad ? unidad.nombreUnidad : "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Si es COMPLEJO, setea idUnidad en null y usa nombreComplejo
            let payload = { ...form };
            if (form.tipo === "COMPLEJO") {
                payload.idUnidad = null;
            } else {
                payload.nombreComplejo = "";
            }
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
        } finally {
            setSaving(false);
        }
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {calendarioEditar ? "Editar Calendario" : "Nuevo Calendario"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{display: "flex", flexDirection: "column", height: "100%", gap: "1rem"}}>
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
                    {/* Selección de plantillas puede ir aquí luego */}
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
    );
}