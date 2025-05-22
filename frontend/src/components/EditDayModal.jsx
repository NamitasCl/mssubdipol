import {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";

/**
 * Modal para editar manualmente los 9 puestos de un día (si no hay error).
 */
export function EditDayModal({ show, dayData, usedDepts, onSave, onClose }) {
    const [localWorkers, setLocalWorkers] = useState(dayData.unidades || []);

    useEffect(() => {
        setLocalWorkers(dayData.unidades || []);
    }, [dayData]);

    const options = usedDepts.map((dept) => dept.name);

    const handleChange = (index, value) => {
        const newWorkers = [...localWorkers];
        newWorkers[index] = value;
        setLocalWorkers(newWorkers);
    };

    const handleSave = () => {
        if (localWorkers.length === 9) {
            onSave(localWorkers);
        } else {
            alert("Debes asignar exactamente 9 puestos para este día.");
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Editar asignación para el día {dayData.dia}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {localWorkers.map((worker, idx) => (
                        <Form.Group key={idx} className="mb-2">
                            <Form.Label>Turno {idx + 1}</Form.Label>
                            <Form.Select
                                value={worker}
                                onChange={(e) => handleChange(idx, e.target.value)}
                            >
                                {options.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}