import React, { useEffect, useState } from "react";
import { Modal, Button, Form, ListGroup, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

// Props:
// - show, onHide
// - mes, anio (para visual)
// - seleccionadas (array de plantillas ya seleccionadas)
// - onPlantillasGuardadas (callback: recibe array de plantillas seleccionadas)

export default function AgregarPlantillasMes({ show, onHide, mes, anio, seleccionadas = [], onPlantillasGuardadas }) {
    const [plantillas, setPlantillas] = useState([]);
    const [seleccion, setSeleccion] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Cargar plantillas y preseleccionar
    useEffect(() => {
        if (show) {
            setLoading(true);
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/plantillas`)
                .then(resp => {
                    setPlantillas(resp.data || []);
                    // Marca como seleccionadas las que ya están en props
                    setSeleccion(seleccionadas || []);
                })
                .catch(() => setError("Error al cargar plantillas"))
                .finally(() => setLoading(false));
        }
    }, [show, seleccionadas]);

    const handleAgregar = (plantilla) => {
        if (!seleccion.some(p => p.id === plantilla.id)) {
            setSeleccion([...seleccion, plantilla]);
        }
    };

    const handleEliminar = (id) => {
        setSeleccion(seleccion.filter(p => p.id !== id));
    };

    // Solo pasa al padre la selección actual
    const handleGuardar = () => {
        setSaving(true);
        setError(null);
        try {
            onPlantillasGuardadas(seleccion);
            onHide();
        } catch (e) {
            setError("Error inesperado.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Servicios del Mes</Modal.Title>
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
                                            disabled={!!seleccion.find(sel => sel.id === p.id)}
                                            onClick={() => handleAgregar(p)}
                                        >
                                            Añadir
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Form.Group>
                        <div className="mt-4">
                            <h6>Servicios seleccionados:</h6>
                            {seleccion.length === 0 && <div className="text-muted">No hay servicios seleccionados aún.</div>}
                            <ListGroup>
                                {seleccion.map(p => (
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
                    disabled={saving || seleccion.length === 0}
                >
                    {saving ? <Spinner size="sm" animation="border" /> : "Guardar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}