import React, { useState } from "react";
import { Form, Button, Card, Col, Row, Container } from "react-bootstrap";
import { crearPlantilla } from "../../api/plantillaApi.js";

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
    { value: "CHOFER", label: "Chofer" },
];

const opcionestipoServicio = [
    { value: "JEFE_DE_SERVICIO", label: "Jefe de Servicio" },
    { value: "GUARDIA", label: "Guardia" },
    { value: "PROCEPOL", label: "Procepol" },
    { value: "RONDA", label: "Ronda" },
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
            { nombre: "", orden: recintos.length + 1 },
        ];
        setServicios(updated);
    };

    const updateRecinto = (servicioIndex, recintoIndex, field, value) => {
        setServicios((prev) => {
            const next = [...prev];
            const recintos = [...(next[servicioIndex].recintos || [])];
            recintos[recintoIndex] = { ...recintos[recintoIndex], [field]: value };
            next[servicioIndex] = { ...next[servicioIndex], recintos };
            return next;
        });
    };

    const removeRecinto = (servicioIndex, recintoIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].recintos.splice(recintoIndex, 1);
        updated[servicioIndex].recintos.forEach((r, i) => (r.orden = i + 1));
        setServicios(updated);
    };

    const makeNuevoServicio = () => ({
        id: crypto.randomUUID(),
        nombreServicio: "",
        tipoServicio: "",
        horaInicio: "",
        horaFin: "",
        rondaCantidadSemana: 0,
        rondaCantidadFds: 0,
        rondaLvInicio: "",
        rondaLvFin: "",
        rondaFdsDiaInicio: "",
        rondaFdsDiaFin: "",
        rondaFdsNocheInicio: "",
        rondaFdsNocheFin: "",
        cupos: [],
        recintos: [{ nombre: "", orden: 1 }],
    });

    const addServicio = () => {
        setServicios((prev) => [...prev, makeNuevoServicio()]);
    };

    const updateServicio = (index, field, value) => {
        setServicios((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeServicio = (index) => {
        if (!window.confirm("¿Eliminar este servicio?")) return;
        setServicios((prev) => prev.filter((_, i) => i !== index));
    };

    const addCupo = (servicioIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].cupos.push({ rol: "", cantidad: 1 });
        setServicios(updated);
    };

    const updateCupo = (servicioIndex, cupoIndex, field, value) => {
        setServicios((prev) => {
            const next = [...prev];
            const cupos = [...(next[servicioIndex].cupos || [])];
            cupos[cupoIndex] = { ...cupos[cupoIndex], [field]: value };
            next[servicioIndex] = { ...next[servicioIndex], cupos };
            return next;
        });
    };

    const removeCupo = (servicioIndex, cupoIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].cupos.splice(cupoIndex, 1);
        setServicios(updated);
    };

    const handleSubmit = async () => {
        for (const [i, s] of servicios.entries()) {
            if (s.tipoServicio === "RONDA") {
                if ((s.rondaCantidadSemana ?? 0) < 1 || (s.rondaCantidadFds ?? 0) < 1) {
                    alert(
                        `Servicio RONDA #${i + 1}: define cantidades ≥ 1 para semana y fin de semana.`
                    );
                    return;
                }
            } else {
                if (!s.recintos || s.recintos.length === 0) {
                    alert(`Debes agregar al menos un recinto en el Servicio #${i + 1}`);
                    return;
                }
                for (const [j, r] of s.recintos.entries()) {
                    if (!r.nombre || !r.nombre.trim()) {
                        alert(
                            `El recinto #${j + 1} en el Servicio #${i + 1} debe tener un nombre.`
                        );
                        return;
                    }
                }
            }
        }

        const serviciosPayload = servicios.map((s) => {
            const base = {
                nombreServicio: s.nombreServicio,
                tipoServicio: s.tipoServicio,
                recintos: s.recintos,
                cupos: (s.cupos || []).map((c) => ({
                    rol: c.rol,
                    cantidad: c.cantidad,
                })),
            };

            if (s.tipoServicio === "RONDA") {
                return {
                    ...base,
                    rondaCantidadSemana: s.rondaCantidadSemana ?? 0,
                    rondaCantidadFds: s.rondaCantidadFds ?? 0,
                    ...(s.rondaLvInicio && { rondaLvInicio: s.rondaLvInicio }),
                    ...(s.rondaLvFin && { rondaLvFin: s.rondaLvFin }),
                    ...(s.rondaFdsDiaInicio && { rondaFdsDiaInicio: s.rondaFdsDiaInicio }),
                    ...(s.rondaFdsDiaFin && { rondaFdsDiaFin: s.rondaFdsDiaFin }),
                    ...(s.rondaFdsNocheInicio && {
                        rondaFdsNocheInicio: s.rondaFdsNocheInicio,
                    }),
                    ...(s.rondaFdsNocheFin && { rondaFdsNocheFin: s.rondaFdsNocheFin }),
                };
            }

            return {
                ...base,
                horaInicio: s.horaInicio,
                horaFin: s.horaFin,
            };
        });

        const payload = { nombre, descripcion, servicios: serviciosPayload };

        try {
            await crearPlantilla(payload);
            alert("Plantilla guardada con éxito");
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
                        <Card className="mb-3 p-3" key={servicio.id}>
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
                                            onChange={(e) =>
                                                updateServicio(idx, "nombreServicio", e.target.value)
                                            }
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Tipo de servicio</Form.Label>
                                        <Form.Select
                                            value={servicio.tipoServicio}
                                            onChange={(e) =>
                                                updateServicio(idx, "tipoServicio", e.target.value)
                                            }
                                        >
                                            <option value="">Seleccione opción</option>
                                            {opcionestipoServicio.map((op) => (
                                                <option key={op.value} value={op.value}>
                                                    {op.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Horarios generales (solo si NO es RONDA) */}
                                {servicio.tipoServicio !== "RONDA" && (
                                    <>
                                        <Col md={2}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Hora Inicio</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.horaInicio || ""}
                                                    onChange={(e) =>
                                                        updateServicio(idx, "horaInicio", e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Hora Fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.horaFin || ""}
                                                    onChange={(e) =>
                                                        updateServicio(idx, "horaFin", e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </>
                                )}
                            </Row>

                            {/* Config específica RONDA */}
                            {servicio.tipoServicio === "RONDA" && (
                                <>
                                    <Row className="mt-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Cantidad de funcionarios Lunes a Viernes
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    style={{ width: "40%" }}
                                                    value={servicio.rondaCantidadSemana}
                                                    onChange={(e) =>
                                                        updateServicio(
                                                            idx,
                                                            "rondaCantidadSemana",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>
                                                    Cantidad de funcionarios Sábado y Domingo
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    style={{ width: "40%" }}
                                                    value={servicio.rondaCantidadFds}
                                                    onChange={(e) =>
                                                        updateServicio(
                                                            idx,
                                                            "rondaCantidadFds",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>LV Inicio</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.rondaLvInicio || ""}
                                                    onChange={(e) =>
                                                        updateServicio(idx, "rondaLvInicio", e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>LV Fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.rondaLvFin || ""}
                                                    onChange={(e) =>
                                                        updateServicio(idx, "rondaLvFin", e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>FDS Día Inicio</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.rondaFdsDiaInicio || ""}
                                                    onChange={(e) =>
                                                        updateServicio(
                                                            idx,
                                                            "rondaFdsDiaInicio",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>FDS Día Fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.rondaFdsDiaFin || ""}
                                                    onChange={(e) =>
                                                        updateServicio(idx, "rondaFdsDiaFin", e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mt-3">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>FDS Noche Inicio</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.rondaFdsNocheInicio || ""}
                                                    onChange={(e) =>
                                                        updateServicio(
                                                            idx,
                                                            "rondaFdsNocheInicio",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>FDS Noche Fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    step="60"
                                                    value={servicio.rondaFdsNocheFin || ""}
                                                    onChange={(e) =>
                                                        updateServicio(
                                                            idx,
                                                            "rondaFdsNocheFin",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* Recintos (no aplica a RONDA) */}
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
                                            onChange={(e) =>
                                                updateCupo(idx, cIdx, "cantidad", parseInt(e.target.value))
                                            }
                                        />
                                    </Col>
                                    <Col md={1}>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeCupo(idx, cIdx)}
                                        >
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

                    <Button className="me-2" onClick={addServicio}>
                        + Agregar Servicio
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Guardar Plantilla
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}