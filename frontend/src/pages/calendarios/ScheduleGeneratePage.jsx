import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner, Alert, Row, Col, Card } from "react-bootstrap";
import {
    generateSchedule,
    getSchedule,
    fetchCalendarios,
} from "../../api/turnosApi.js";
import AsignacionTurnosMensual from "../../pages/turnos/AsignacionTurnosMensual.jsx";

export default function ScheduleGeneratePage() {
    const { id: calendarId } = useParams();
    const nav = useNavigate();

    const [calendar, setCalendar] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadCalendar = useCallback(async () => {
        try {
            const res = await fetchCalendarios();
            setCalendar(res.data.find((c) => +c.id === +calendarId));
        } catch {
            setError("Error obteniendo calendario");
        }
    }, [calendarId]);

    const loadSchedule = useCallback(async () => {
        try {
            const res = await getSchedule(calendarId);
            setAssignments(res.data.assignments);
        } catch {
            setError("Error obteniendo asignaciones");
        }
    }, [calendarId]);

    useEffect(() => {
        loadCalendar();
        loadSchedule();
    }, [loadCalendar, loadSchedule]);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            await generateSchedule(calendarId);
            await loadSchedule();
        } catch (err) {
            setError(err.response?.data?.message || "Error generando");
        }
        setLoading(false);
    };

    if (error)
        return (
            <Alert variant="danger">
                {error} <Button onClick={() => nav(-1)}>Volver</Button>
            </Alert>
        );

    if (!calendar)
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" />
            </div>
        );

    return (
        <>
            <Row className="align-items-center mb-3">
                <Col>
                    <h3>
                        Asignaciones – {calendar.name} ({calendar.month}/{calendar.year})
                    </h3>
                </Col>
                <Col className="text-end">
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" /> Generando…
                            </>
                        ) : (
                            "Generar / Regenerar"
                        )}
                    </Button>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <strong>Tipo:</strong> {calendar.type}
                        </Col>
                        <Col md={3}>
                            <strong>Estado:</strong> {calendar.state}
                        </Col>
                        <Col md={3}>
                            <strong>Slots asignados:</strong> {assignments.length}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <AsignacionTurnosMensual
                calendarioId={calendarId}
                assignments={assignments}
                reloadAssignments={loadSchedule}
            />
        </>
    );
}
