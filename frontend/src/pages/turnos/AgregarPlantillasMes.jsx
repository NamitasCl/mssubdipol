import React, { useEffect, useState } from "react";
import { Modal, Button, Form, ListGroup, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

export default function AgregarPlantillasMes({ show, onHide, mes, anio, turnoAsignacionId, onPlantillasGuardadas }) {
    const [plantillas, setPlantillas] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Cargar plantillas existentes
    useEffect(() => {
        if (show) {
            setLoading(true);
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/plantillas`)
                .then(resp => setPlantillas(resp.data))
                .catch(e => setError("Error al cargar plantillas"))
                .finally(() => setLoading(false));
        }
    }, [show]);

    const handleAgregar = (plantilla) => {
        if (!seleccionadas.some(p => p.id === plantilla.id)) {
            setSeleccionadas([...seleccionadas, plantilla]);
        }
    };

    const handleEliminar = (id) => {
        setSeleccionadas(seleccionadas.filter(p => p.id !== id));
    };

    const handleGuardar = async () => {
        setSaving(true);
        setError(null);
        try {
            // Si ya tienes turnoAsignacionId, actualizas, si no, creas nuevo
            let res;
            if (turnoAsignacionId) {
                res = await axios.put(
                    `${import.meta.env.VITE_TURNOS_API_URL}/turnosasignacion/${turnoAsignacionId}/plantillas`,
                    { plantillaIds: seleccionadas.map(p => p.id) }
                );
            } else {
                res = await axios.post(
                    `${import.meta.env.VITE_TURNOS_API_URL}/turnosasignacion`,
                    { mes, anio, plantillaIds: seleccionadas.map(p => p.id) }
                );
            }
            onPlantillasGuardadas(res.data);
            onHide();
        } catch (e) {
            setError("No se pudo guardar. Revise la conexión.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Plantillas para el Mes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <strong>Mes:</strong> {mes} <strong>Año:</strong> {anio}
                </div>
                {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
                {loading ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : (
                    <>
                        <Form.Group className="mb-3 mt-3">
                            <Form.Label>Plantillas disponibles</Form.Label>
                            <ListGroup>
                                {plantillas.map((p) => (
                                    <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{p.nombre}</strong> {" "}
                                            <span className="text-muted" style={{ fontSize: 13 }}>{p.descripcion}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            disabled={!!seleccionadas.find(sel => sel.id === p.id)}
                                            onClick={() => handleAgregar(p)}
                                        >
                                            Añadir
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Form.Group>
                        <div className="mt-4">
                            <h6>Plantillas seleccionadas:</h6>
                            {seleccionadas.length === 0 && <div className="text-muted">No hay plantillas seleccionadas aún.</div>}
                            <ListGroup>
                                {seleccionadas.map(p => (
                                    <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>{p.nombre}</strong> {" "}
                                            <span className="text-muted" style={{ fontSize: 13 }}>{p.descripcion}</span>
                                        </span>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleEliminar(p.id)}>
                                            Quitar
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button
                    variant="primary"
                    onClick={handleGuardar}
                    disabled={saving || seleccionadas.length === 0}
                >
                    {saving ? <Spinner size="sm" animation="border" /> : "Guardar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}