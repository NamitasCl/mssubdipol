import React, { useState } from "react";
import { Form, Button, Card, Col, Row, InputGroup, Container } from "react-bootstrap";
import { crearPlantilla } from "../../api/plantillaApi.js";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';              // base
import 'flatpickr/dist/themes/airbnb.css';

const defaultRoles = [
    { value: "JEFE_DE_SERVICIO", label: "Jefe de Servicio" },
    { value: "JEFE_DE_MAQUINA", label: "Jefe de máquina" },
    { value: "PRIMER_TRIPULANTE", label: "Primer tripulante" },
    { value: "SEGUNDO_TRIPULANTE", label: "Segundo tripulante" },
    { value: "TRIPULANTE", label: "Tripulante" },
    { value: "ENCARGADO_DE_TURNO", label: "Encargado de turno" },
    { value: "ENCARGADO_DE_GUARDIA", label: "Encargado de guardia" },
    { value: "AYUDANTE_DE_GUARDIA", label: "Ayudante de guardia" },
    { value: "JEFE_DE_RONDA", label: "Jefe de ronda" },
    { value: "GUARDIA_ARMADO", label: "Guardia armado" },
    { value: "REFUERZO_DE_GUARDIA", label: "Refuerzo de guardia" },
    { value: "CHOFER", label: "Chofer" }
];

// Arriba en tu componente o incluso en un archivo aparte:
const opcionestipoServicio = [
    { value: "JEFE_DE_SERVICIO", label: "Jefe de Servicio" },
    { value: "GUARDIA", label: "Guardia" },
    { value: "PROCEPOL", label: "Procepol" },
    { value: "RONDA", label: "Ronda" }
];


export default function PlantillatipoServicioBuilder() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [servicios, setServicios] = useState([]);

    // Recintos
    const addRecinto = (servicioIndex) => {
        const updated = [...servicios];
        const recintos = updated[servicioIndex].recintos || [];
        updated[servicioIndex].recintos = [
            ...recintos,
            { nombre: "", orden: recintos.length + 1 }
        ];
        setServicios(updated);
    };

    const updateRecinto = (servicioIndex, recintoIndex, field, value) => {
        const updated = [...servicios];
        updated[servicioIndex].recintos[recintoIndex][field] = value;
        setServicios(updated);
    };

    const removeRecinto = (servicioIndex, recintoIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].recintos.splice(recintoIndex, 1);
        // Reordena los orden
        updated[servicioIndex].recintos.forEach((r, i) => (r.orden = i + 1));
        setServicios(updated);
    };

    // Servicios y cupos
    const addServicio = () => {
        setServicios([
            ...servicios,
            {
                nombreServicio: "",
                tipoServicio: "",
                rondaCantidadSemana: 0,
                rondaCantidadFds: 0,
                horaInicio: "",
                horaFin: "",
                cupos: [],
                recintos: [{ nombre: "", orden: 1 }],
            },
        ]);
    };

    const updateServicio = (index, field, value) => {
        const updated = [...servicios];
        updated[index][field] = value;
        setServicios(updated);
    };

    const removeServicio = (index) => {
        /*if (servicios.length <= 1) {
            alert("Debe existir al menos un servicio.");
            return;
        }*/
        if (!window.confirm("¿Eliminar este servicio?")) return;
        setServicios(prev => prev.filter((_, i) => i !== index));
    };


    const addCupo = (servicioIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].cupos.push({ rol: "", cantidad: 1 });
        setServicios(updated);
    };

    const updateCupo = (servicioIndex, cupoIndex, field, value) => {
        const updated = [...servicios];
        updated[servicioIndex].cupos[cupoIndex][field] = value;
        setServicios(updated);
    };

    const removeCupo = (servicioIndex, cupoIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].cupos.splice(cupoIndex, 1);
        setServicios(updated);
    };

    const handleSubmit = async () => {
        // Valida que todos los recintos tengan nombre
        for (const [i, servicio] of servicios.entries()) {
            if (servicio.tipoServicio === "RONDA") {
                if ((servicio.rondaCantidadSemana ?? 0) < 1 || (servicio.rondaCantidadFds ?? 0) < 1) {
                    alert(`Servicio RONDA #${i + 1}: define cantidades ≥ 1 para semana y fin de semana.`);
                    return;
                }
            }
            if (servicio.tipoServicio !== "RONDA") {
                if (!servicio.recintos || servicio.recintos.length === 0) {
                    alert(`Debes agregar al menos un recinto en el Servicio #${i + 1}`);
                    return;
                }
                for (const [j, recinto] of servicio.recintos.entries()) {
                    if (!recinto.nombre || !recinto.nombre.trim()) {
                        alert(`El recinto #${j + 1} en el Servicio #${i + 1} debe tener un nombre.`);
                        return;
                    }
                }
            }
        }

        const payload = {
            nombre,
            descripcion,
            servicios: servicios.map(s => ({
                nombreServicio: s.nombreServicio,
                tipoServicio: s.tipoServicio,
                horaInicio: s.horaInicio,
                rondaCantidadSemana: s.rondaCantidadSemana ?? 0,
                rondaCantidadFds: s.rondaCantidadFds ?? 0,
                horaFin: s.horaFin,
                recintos: s.recintos,
                cupos: s.cupos.map(c => ({
                    rol: c.rol,
                    cantidad: c.cantidad
                })),
            })),
        };

        console.log("Plantilla creada:", payload);
        try {
            await crearPlantilla(payload);
            alert("Plantilla guardada con éxito");
            // reset formulario si quieres
            setNombre("");
            setDescripcion("");
            setServicios([]);
        } catch (err) {
            alert("Error al guardar la plantilla");
        }
    };

    return (
        <Container style={{ width: 1200 }}>
            <Card className="p-4">
                <h3>Crear Plantilla de Servicio</h3>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre de la plantilla</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </Form.Group>

                    <hr />

                    {servicios.map((servicio, idx) => (
                        <Card className="mb-3 p-3" key={idx}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0">Servicio #{idx + 1}</h5>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeServicio(idx)}
                                >
                                    Eliminar servicio
                                </Button>
                            </div>

                            <Row className="g-2">
                                <Col md={5}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Nombre del Servicio</Form.Label>
                                        <Form.Control
                                            value={servicio.nombreServicio}
                                            onChange={(e) => updateServicio(idx, "nombreServicio", e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Tipo de servicio</Form.Label>
                                        <Form.Select
                                            value={servicio.tipoServicio}
                                            onChange={(e) => updateServicio(idx, "tipoServicio", e.target.value)}
                                        >
                                            <option value="">Seleccione opción</option>
                                            {opcionestipoServicio.map(op => (
                                                <option key={op.value} value={op.value}>
                                                    {op.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Inicio</Form.Label>
                                        <Flatpickr
                                            options={{
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true
                                            }}
                                            value={servicio.horaInicio}
                                            onChange={([dt]) => {
                                                if (!dt) { updateServicio(idx, "horaInicio", ""); return; }
                                                const hh = String(dt.getHours()).padStart(2,'0');
                                                const mm = String(dt.getMinutes()).padStart(2,'0');
                                                updateServicio(idx, "horaInicio", `${hh}:${mm}`);
                                            }}
                                            className="form-control"
                                        />

                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Fin</Form.Label>
                                        <Flatpickr
                                            options={{
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true
                                            }}
                                            value={servicio.horaFin}
                                            onChange={([dt]) => {
                                                // dt es un Date; lo pasamos a "HH:mm" para tu backend (LocalTime)
                                                if (!dt) { updateServicio(idx, "horaFin", ""); return; }
                                                const hh = String(dt.getHours()).padStart(2,'0');
                                                const mm = String(dt.getMinutes()).padStart(2,'0');
                                                updateServicio(idx, "horaFin", `${hh}:${mm}`);
                                            }}
                                            className="form-control"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {servicio.tipoServicio !== "RONDA" && (
                                <>
                                    <h6 className="mt-3">Recintos</h6>
                                    {servicio.recintos?.map((recinto, rIdx) => (
                                        <Row key={rIdx} className="mb-2 align-items-center">
                                            <Col md={3}>
                                                <Form.Control
                                                    value={recinto.nombre}
                                                    placeholder={`Nombre recinto #${rIdx + 1}`}
                                                    onChange={(e) =>
                                                        updateRecinto(idx, rIdx, "nombre", e.target.value)
                                                    }
                                                />
                                            </Col>
                                            <Col md={1}>
                                                <Form.Control
                                                    type="number"
                                                    value={recinto.orden}
                                                    min={1}
                                                    readOnly
                                                />
                                            </Col>
                                            <Col md={2}>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => removeRecinto(idx, rIdx)}
                                                    disabled={servicio.recintos.length === 1}
                                                >
                                                    Eliminar
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="mb-2"
                                        onClick={() => addRecinto(idx)}
                                    >
                                        + Agregar Recinto
                                    </Button>
                                </>
                            )}

                            {servicio.tipoServicio === "RONDA" && (
                                <>
                                    <Row className="mt-2 mb-2">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Cantidad de funcionarios Lunes a Viernes</Form.Label>
                                                <Form.Control
                                                    type={"number"}
                                                    min={1}
                                                    style={{width: "30%"}}
                                                    value={servicio.rondaCantidadSemana}
                                                    onChange={(e) => updateServicio(idx, "rondaCantidadSemana", Number(e.target.value))}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Cantidad de funcionarios Sabados y Domingos</Form.Label>
                                                <Form.Control
                                                    type={"number"}
                                                    min={1}
                                                    style={{width: "30%"}}
                                                    value={servicio.rondaCantidadFds}
                                                    onChange={(e) => updateServicio(idx, "rondaCantidadFds", Number(e.target.value))}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>

                            )}


                            <h6 className="mt-3">Cupos por Rol</h6>
                            {servicio.cupos.map((cupo, cIdx) => (
                                <Row key={cIdx} className="mb-2 align-items-center">
                                    <Col md={3}>
                                        <Form.Select
                                            value={cupo.rol}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const updated = [...servicios];
                                                updated[idx].cupos[cIdx].rol = value;
                                                setServicios(updated);
                                            }}
                                        >
                                            <option value="">Seleccione rol</option>
                                            {defaultRoles.map((rol) => (
                                                <option key={rol.value} value={rol.value}>
                                                    {rol.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>

                                    <Col md={1}>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            value={cupo.cantidad}
                                            onChange={(e) => updateCupo(idx, cIdx, "cantidad", parseInt(e.target.value))}
                                        />
                                    </Col>
                                    <Col md={1}>
                                        <Button variant="danger" size="sm" onClick={() => removeCupo(idx, cIdx)}>
                                            Eliminar
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button variant="secondary" size="sm" onClick={() => addCupo(idx)}>
                                + Agregar Cupo
                            </Button>
                        </Card>
                    ))}

                    <Button className="me-2" onClick={addServicio}>+ Agregar Servicio</Button>
                    <Button variant="primary" onClick={handleSubmit}>Guardar Plantilla</Button>
                </Form>
            </Card>
        </Container>
    );
}