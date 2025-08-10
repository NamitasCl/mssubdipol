import React, { useState } from "react";
import { Form, Button, Card, Col, Row, InputGroup, Container } from "react-bootstrap";
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
    { value: "CHOFER", label: "Chofer" }
];

// Arriba en tu componente o incluso en un archivo aparte:
const opcionesTurno = [
    { value: "JEFE_DE_SERVICIO", label: "Jefe de Servicio" },
    { value: "GUARDIA", label: "Guardia" },
    { value: "PROCEPOL", label: "Procepol" },
    { value: "RONDA", label: "Ronda" }
];


export default function PlantillaTurnoBuilder() {
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
                turno: "",
                horaInicio: "",
                horaFin: "",
                cupos: [],
                recintos: [{ nombre: "", orden: 1 }],
            },
        ]);
    };
    const addServicioCarro = () => {
        setServicios(prev => ([
            ...prev,
            {
                nombreServicio: "Carro policial",
                turno: "",
                horaInicio: "",
                horaFin: "",
                recintos: [{ nombre: "", orden: 1 }],
                cupos: [
                    { rol: "JEFE_DE_MAQUINA", cantidad: 1, puedeConducir: false },
                    { rol: "TRIPULANTE", cantidad: 2, puedeConducir: false }, // uno de estos podría ser conductor
                    // O si quieres “tripulante y chofer” explícitos:
                    // { rol: "TRIPULANTE", cantidad: 1, puedeConducir: false },
                    // { rol: "CHOFER", cantidad: 1, puedeConducir: true },
                ],
                _esCarro: true, // flag de UI para validación especial
            }
        ]));
    };



    const updateServicio = (index, field, value) => {
        const updated = [...servicios];
        updated[index][field] = value;
        setServicios(updated);
    };

    const addCupo = (servicioIndex) => {
        const updated = [...servicios];
        updated[servicioIndex].cupos.push({ rol: "", cantidad: 1, puedeConducir: false });
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

        for (const [i, s] of servicios.entries()) {
            if (s._esCarro) {
                const total = (s.cupos || []).reduce((acc, c) => acc + (Number(c.cantidad) || 0), 0);
                const jefe = (s.cupos || []).find(c => c.rol === "JEFE_DE_MAQUINA");
                const cantJefe = jefe ? Number(jefe.cantidad) : 0;

                // ¿Hay al menos un conductor? (CHOFER o alguien marcado como puedeConducir)
                const hayConductor = (s.cupos || []).some(c =>
                    c.rol === "CHOFER" || Boolean(c.puedeConducir)
                );

                if (total !== 3) {
                    alert(`Servicio CARRO #${i + 1}: Debe tener exactamente 3 personas.`);
                    return;
                }
                if (cantJefe !== 1) {
                    alert(`Servicio CARRO #${i + 1}: Debe haber exactamente 1 JEFE_DE_MAQUINA.`);
                    return;
                }
                if (!hayConductor) {
                    alert(`Servicio CARRO #${i + 1}: Debe haber al menos un conductor (Chofer o alguien que pueda conducir).`);
                    return;
                }
            }
        }


        const payload = {
            nombre,
            descripcion,
            servicios: servicios.map(s => ({
                nombreServicio: s.nombreServicio,
                turno: s.turno,
                horaInicio: s.horaInicio,
                horaFin: s.horaFin,
                recintos: s.recintos,
                cupos: s.cupos.map(c => ({
                    rol: c.rol,
                    cantidad: c.cantidad,
                    puedeConducir: !!c.puedeConducir,
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
                <h3>Crear Plantilla de Turno</h3>
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
                            <h5>Servicio #{idx + 1}</h5>

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
                                        <Form.Label>Turno</Form.Label>
                                        <Form.Select
                                            value={servicio.turno}
                                            onChange={(e) => updateServicio(idx, "turno", e.target.value)}
                                        >
                                            <option value="">Seleccione opción</option>
                                            {opcionesTurno.map(op => (
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
                                        <Form.Control
                                            type="time"
                                            value={servicio.horaInicio}
                                            onChange={(e) => updateServicio(idx, "horaInicio", e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Group className="mb-2">
                                        <Form.Label>Hora Fin</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={servicio.horaFin}
                                            onChange={(e) => updateServicio(idx, "horaFin", e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h6 className="mt-3">Recintos</h6>
                            {servicio.recintos?.map((recinto, rIdx) => (
                                <Row key={rIdx} className="mb-2 align-items-center">
                                    <Col md={8}>
                                        <Form.Control
                                            value={recinto.nombre}
                                            placeholder={`Nombre recinto #${rIdx + 1}`}
                                            onChange={e => updateRecinto(idx, rIdx, "nombre", e.target.value)}
                                        />
                                    </Col>
                                    <Col md={2}>
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

                            <h6 className="mt-3">Cupos por Rol</h6>
                            {servicio.cupos.map((cupo, cIdx) => (
                                <Row key={cIdx} className="mb-2 align-items-center">
                                    <Col md={5}>
                                        <Form.Select
                                            value={cupo.rol}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Si elige CHOFER, forzamos puedeConducir = true
                                                const updated = [...servicios];
                                                updated[idx].cupos[cIdx].rol = value;
                                                if (value === "CHOFER") {
                                                    updated[idx].cupos[cIdx].puedeConducir = true;
                                                }
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

                                    <Col md={3}>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            value={cupo.cantidad}
                                            onChange={(e) => updateCupo(idx, cIdx, "cantidad", parseInt(e.target.value))}
                                        />
                                    </Col>

                                    <Col md={3}>
                                        <Form.Check
                                            type="checkbox"
                                            label="Puede conducir"
                                            checked={!!cupo.puedeConducir}
                                            disabled={cupo.rol === "CHOFER"} // CHOFER siempre conduce
                                            onChange={(e) => updateCupo(idx, cIdx, "puedeConducir", e.target.checked)}
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
                    <Button className="me-2" variant="outline-primary" onClick={addServicioCarro}>
                        + Agregar servicio CARRO (3 plazas)
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>Guardar Plantilla</Button>
                </Form>
            </Card>
        </Container>
    );
}