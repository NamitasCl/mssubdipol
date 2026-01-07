import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Badge, Modal, Form, Alert, Spinner } from "react-bootstrap";
import {
    obtenerSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud
} from "../../api/solicitudCambioApi";
import { useAuth } from "../../components/contexts/AuthContext";

const GestionSolicitudesCambio = () => {
    const { user } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRechazoModal, setShowRechazoModal] = useState(false);
    const [solicitudAct, setSolicitudActual] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        setLoading(true);
        try {
            const { data } = await obtenerSolicitudesPendientes();
            setSolicitudes(data);
        } catch (error) {
            console.error("Error cargandosolicitudes:", error);
            alert("Error al cargar solicitudes");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id) => {
        if (!confirm("¿Estás seguro de aprobar este cambio de turno?")) return;

        try {
            await aprobarSolicitud(id);
            alert("✅ Solicitud aprobada. Los turnos han sido intercambiados.");
            cargarSolicitudes();
        } catch (error) {
            alert("Error al aprobar: " + (error.response?.data?.message || error.message));
        }
    };

    const handleRechazar = (solicitud) => {
        setSolicitudActual(solicitud);
        setShowRechazoModal(true);
    };

    const confirmarRechazo = async () => {
        if (!motivoRechazo.trim()) {
            alert("Debes ingresar un motivo de rechazo");
            return;
        }

        try {
            await rechazarSolicitud(solicitudActual.id, motivoRechazo);
            alert("❌ Solicitud rechazada");
            setShowRechazoModal(false);
            setMotivoRechazo("");
            cargarSolicitudes();
        } catch (error) {
            alert("Error al rechazar: " + (error.response?.data?.message || error.message));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('es-CL');
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        return new Date(dateTimeString).toLocaleString('es-CL');
    };

    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" />
                <p>Cargando solicitudes...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                        <i className="bi bi-arrow-left-right me-2"></i>
                        Gestión de Solicitudes de Cambio de Turno
                    </h4>
                </Card.Header>
                <Card.Body>
                    {solicitudes.length === 0 ? (
                        <Alert variant="info">
                            No hay solicitudes pendientes en tu unidad
                        </Alert>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Solicitante</th>
                                    <th>Turno Original</th>
                                    <th>Turno Deseado</th>
                                    <th>Funcionario Destino</th>
                                    <th>Fecha Solicitud</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map((sol, idx) => (
                                    <tr key={sol.id}>
                                        <td>{idx + 1}</td>
                                        <td><strong>{sol.nombreSolicitante}</strong></td>
                                        <td>
                                            {formatDate(sol.slotOrigen?.fecha)}<br />
                                            <small className="text-muted">
                                                {sol.slotOrigen?.nombreServicio} - {sol.slotOrigen?.rolRequerido}
                                            </small>
                                        </td>
                                        <td>
                                            {formatDate(sol.slotDestino?.fecha)}<br />
                                            <small className="text-muted">
                                                {sol.slotDestino?.nombreServicio} - {sol.slotDestino?.rolRequerido}
                                            </small>
                                        </td>
                                        <td>{sol.nombreDestino}</td>
                                        <td>{formatDateTime(sol.fechaSolicitud)}</td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="success"
                                                className="me-2"
                                                onClick={() => handleAprobar(sol.id)}
                                            >
                                                <i className="bi bi-check-circle me-1"></i>
                                                Aprobar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleRechazar(sol)}
                                            >
                                                <i className="bi bi-x-circle me-1"></i>
                                                Rechazar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de Rechazo */}
            <Modal show={showRechazoModal} onHide={() => setShowRechazoModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rechazar Solicitud</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Motivo del rechazo:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            placeholder="Explica por qué se rechaza esta solicitud..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRechazoModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmarRechazo}>
                        Confirmar Rechazo
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GestionSolicitudesCambio;
