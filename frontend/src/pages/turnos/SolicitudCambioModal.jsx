import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Card, Row, Col } from "react-bootstrap";
import { crearSolicitud } from "../../api/solicitudCambioApi";

const SolicitudCambioModal = ({ show, onHide, misSlots, todosSlots, onSolicitudCreada }) => {
    const [slotOrigenId, setSlotOrigenId] = useState("");
    const [slotDestinoId, setSlotDestinoId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const slotOrigen = misSlots.find(s => s.id === parseInt(slotOrigenId));
    const slotDestino = todosSlots.find(s => s.id === parseInt(slotDestinoId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!slotOrigenId || !slotDestinoId) {
            setError("Debes seleccionar ambos turnos");
            return;
        }

        if (slotOrigenId === slotDestinoId) {
            setError("No puedes intercambiar un turno contigo mismo");
            return;
        }

        setLoading(true);
        try {
            await crearSolicitud({
                idSlotOrigen: parseInt(slotOrigenId),
                idSlotDestino: parseInt(slotDestinoId)
            });

            alert("✅ Solicitud de cambio enviada exitosamente");
            onSolicitudCreada();
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al crear solicitud");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSlotOrigenId("");
        setSlotDestinoId("");
        setError("");
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Solicitar Cambio de Turno</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label><strong>Mi turno a cambiar:</strong></Form.Label>
                        <Form.Select
                            value={slotOrigenId}
                            onChange={(e) => setSlotOrigenId(e.target.value)}
                            required
                        >
                            <option value="">Selecciona tu turno...</option>
                            {misSlots?.map(slot => (
                                <option key={slot.id} value={slot.id}>
                                    {slot.fecha} - {slot.nombreServicio} ({slot.rolRequerido})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label><strong>Turno con quien quiero cambiar:</strong></Form.Label>
                        <Form.Select
                            value={slotDestinoId}
                            onChange={(e) => setSlotDestinoId(e.target.value)}
                            required
                        >
                            <option value="">Selecciona el turno...</option>
                            {todosSlots?.filter(s => !misSlots.some(ms => ms.id === s.id)).map(slot => (
                                <option key={slot.id} value={slot.id}>
                                    {slot.fecha} - {slot.nombreFuncionario} - {slot.nombreServicio}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {slotOrigen && slotDestino && (
                        <Card className="mt-3 bg-light">
                            <Card.Body>
                                <Card.Title>Previsualización del cambio:</Card.Title>
                                <Row>
                                    <Col md={6}>
                                        <strong>Tú darás:</strong>
                                        <ul>
                                            <li>Fecha: {slotOrigen.fecha}</li>
                                            <li>Servicio: {slotOrigen.nombreServicio}</li>
                                            <li>Rol: {slotOrigen.rolRequerido}</li>
                                        </ul>
                                    </Col>
                                    <Col md={6}>
                                        <strong>Tú recibirás:</strong>
                                        <ul>
                                            <li>Fecha: {slotDestino.fecha}</li>
                                            <li>Servicio: {slotDestino.nombreServicio}</li>
                                            <li>Rol: {slotDestino.rolRequerido}</li>
                                            <li>De: {slotDestino.nombreFuncionario}</li>
                                        </ul>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar Solicitud"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default SolicitudCambioModal;
