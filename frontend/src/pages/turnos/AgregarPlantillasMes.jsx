import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert, ListGroup } from "../../components/BootstrapAdapter.jsx";
import axios from "axios";
import { listarPlantillas } from "../../api/plantillaApi.js";

export default function AgregarPlantillasMes({
                                                 show, onHide, mes, anio, seleccionadas = [], onPlantillasGuardadas
                                             }) {
    const [plantillas, setPlantillas] = useState([]);
    const [seleccion, setSeleccion] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Cargar plantillas y preseleccionar
    useEffect(() => {
        if (show) {
            setLoading(true);
            listarPlantillas()
                .then(data => {
                    setPlantillas(data || []);
                    setSeleccion(seleccionadas || []);
                })
                .catch(() => setError("Error al cargar plantillas"))
                .finally(() => setLoading(false));
        }
    }, [show, seleccionadas]);

    // Alternar selección
    const toggleSeleccion = (plantilla) => {
        if (seleccion.some(p => p.id === plantilla.id)) {
            setSeleccion(seleccion.filter(p => p.id !== plantilla.id));
        } else {
            setSeleccion([...seleccion, plantilla]);
        }
    };

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
                    <Form.Group className="mb-3 mt-3">
                        <Form.Label>Plantillas disponibles</Form.Label>
                        <ListGroup>
                            {plantillas.map((p) => {
                                const isSelected = seleccion.some(sel => sel.id === p.id);
                                return (
                                    <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{p.nombre}</strong>{" "}
                                            <span className="text-muted" style={{ fontSize: 13 }}>{p.descripcion}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={isSelected ? "danger" : "outline-primary"}
                                            onClick={() => toggleSeleccion(p)}
                                        >
                                            {isSelected ? "Quitar" : "Añadir"}
                                        </Button>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    </Form.Group>
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