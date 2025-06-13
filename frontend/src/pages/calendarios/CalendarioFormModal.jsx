import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { createCalendario } from "../../api/turnosApi.js";

export default function CalendarioFormModal({ show, onHide, onSaved }) {
    const [form, setForm] = useState({ name:"", month:1, year:new Date().getFullYear(), type:"UNIT" });
    const handle = (k,v)=>setForm({...form,[k]:v});

    const save = async () => {
        await createCalendario({ ...form, month:+form.month, year:+form.year });
        onSaved(); onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Nuevo Calendario</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Nombre</Form.Label>
                        <Col sm={9}>
                            <Form.Control value={form.name} onChange={e=>handle("name",e.target.value)} />
                        </Col>
                    </Form.Group>

                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Mes</Form.Label>
                            <Form.Select value={form.month} onChange={e=>handle("month",e.target.value)}>
                                {[...Array(12)].map((_,i)=>
                                    <option key={i+1} value={i+1}>{i+1}</option>)}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Label>Año</Form.Label>
                            <Form.Control type="number" value={form.year}
                                          onChange={e=>handle("year",e.target.value)} />
                        </Col>
                    </Row>

                    <Form.Group>
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select value={form.type} onChange={e=>handle("type",e.target.value)}>
                            <option value="UNIT">Unidad</option>
                            <option value="COMPLEX">Complejo</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button onClick={save}>Crear</Button>
            </Modal.Footer>
        </Modal>
    );
}