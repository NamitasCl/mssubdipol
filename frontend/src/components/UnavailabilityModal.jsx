import React, { useState } from "react";
import { Modal, Button, Form, ListGroup, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function UnavailabilityModal({ show, onClose, onSave, existingDates }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [motivo, setMotivo] = useState("");
    const [detalle, setDetalle] = useState("");

    const motivos = [
        "licencia medica",
        "feriado legal",
        "permiso administrativo",
        "autorizado",
        "cometido funcionario",
        "comision de servicio",
        "otro"
    ];

    /**
     * Convierte la fecha seleccionada (Date obj) a un string "yyyy-MM-dd" en la zona local
     * sin restar ni sumar el offset. Así 15 se guarda como 15.
     */
    const toLocalYYYYMMDD = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleSave = () => {
        if (!startDate) return;
        let unavailability = {};
        if (endDate) {
            unavailability = {
                fechaInicio: toLocalYYYYMMDD(startDate),
                fechaFin: toLocalYYYYMMDD(endDate),
                motivo,
                detalle
            };
        } else {
            unavailability = {
                fecha: toLocalYYYYMMDD(startDate),
                motivo,
                detalle
            };
        }
        onSave(unavailability);
        setStartDate(null);
        setEndDate(null);
        setMotivo("");
        setDetalle("");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length !== 3) return dateString;
        const yyyy = parts[0];
        const mm = parts[1];
        const dd = parts[2];
        return `${dd}-${mm}-${yyyy}`;
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar días no disponibles</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="dateSelection" className="mb-3">
                        <Form.Label>Seleccione fecha o rango de fechas</Form.Label>
                        <Row>
                            <Col>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    placeholderText="Fecha inicial"
                                    className="form-control"
                                    dateFormat="dd-MM-yyyy"
                                />
                            </Col>
                            <Col>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    placeholderText="Fecha final (opcional)"
                                    className="form-control"
                                    dateFormat="dd-MM-yyyy"
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group controlId="motivo" className="mb-3">
                        <Form.Label>Motivo</Form.Label>
                        <Form.Select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                            <option value="">Seleccione un motivo</option>
                            {motivos.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {motivo === "otro" && (
                        <Form.Group controlId="detalle" className="mb-3">
                            <Form.Label>Detalle</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Escriba el motivo"
                                value={detalle}
                                onChange={(e) => setDetalle(e.target.value)}
                            />
                        </Form.Group>
                    )}
                    {existingDates && existingDates.length > 0 && (
                        <>
                            <Form.Label>Días ya agregados:</Form.Label>
                            <ListGroup>
                                {existingDates.map((date, idx) => {
                                    let formattedDate = "";
                                    if (date.fecha) {
                                        formattedDate = formatDate(date.fecha);
                                    } else if (date.fechaInicio) {
                                        formattedDate = formatDate(date.fechaInicio);
                                        if (date.fechaFin && date.fechaFin.trim() !== "") {
                                            formattedDate += " - " + formatDate(date.fechaFin);
                                        }
                                    }
                                    return (
                                        <ListGroup.Item key={idx}>
                                            {formattedDate} - {date.motivo} {date.detalle && `(${date.detalle})`}
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Agregar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UnavailabilityModal;