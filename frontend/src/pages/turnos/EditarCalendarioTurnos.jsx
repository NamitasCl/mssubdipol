import React, { useState, useEffect } from "react";
import { Button, Form, Spinner, Row, Col } from "react-bootstrap";
import AgregarPlantillasMes from "./AgregarPlantillasMes";
import axios from "axios";

export default function EditarCalendarioTurnos({ calendario, onCalendarioEditado }) {
    const [nombreCalendario, setNombreCalendario] = useState(calendario.nombreCalendario);
    const [selectedMonth, setSelectedMonth] = useState(calendario.mes - 1);
    const [selectedYear, setSelectedYear] = useState(calendario.anio);
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState(calendario.plantillasUsadas || []);
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setNombreCalendario(calendario.nombreCalendario);
        setSelectedMonth(calendario.mes - 1);
        setSelectedYear(calendario.anio);
        setPlantillasSeleccionadas(calendario.plantillasUsadas || []);
    }, [calendario]);

    const handleAgregarPlantillas = (plantillas) => {
        setPlantillasSeleccionadas(plantillas);
        setShowAgregarPlantillas(false);
    };

    const handleEditarCalendario = async () => {
        if (!nombreCalendario.trim()) {
            alert("Debes ingresar un nombre para el calendario.");
            return;
        }
        if (plantillasSeleccionadas.length === 0) {
            alert("Debes agregar al menos un servicio (plantilla).");
            return;
        }
        try {
            setLoading(true);
            // Suponiendo que el backend tiene endpoint PUT/PATCH para editar (ajusta la URL si es diferente)
            const ids = plantillasSeleccionadas.map(p => p.id);
            await axios.put(`${import.meta.env.VITE_TURNOS_API_URL}/${calendario.id}`, {
                nombreCalendario: nombreCalendario.trim(),
                mes: selectedMonth + 1,
                anio: selectedYear,
                ids
            });
            alert("Calendario editado correctamente.");
            if (onCalendarioEditado) onCalendarioEditado();
        } catch (error) {
            alert("Ocurrió un error al editar el calendario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form>
            <h4>Editar calendario de turnos</h4>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Calendario</Form.Label>
                        <Form.Control
                            value={nombreCalendario}
                            onChange={e => setNombreCalendario(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Mes</Form.Label>
                        <Form.Select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option value={i} key={i}>
                                    {new Date(2000, i).toLocaleString("es-CL", { month: "long" })}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Año</Form.Label>
                        <Form.Control
                            type="number"
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            min={2023}
                            max={2100}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <div className="mb-2">
                <Button
                    variant="primary"
                    onClick={() => setShowAgregarPlantillas(true)}
                    className="me-2"
                >
                    + Editar Servicios del Mes
                </Button>
                <AgregarPlantillasMes
                    show={showAgregarPlantillas}
                    mes={selectedMonth + 1}
                    anio={selectedYear}
                    seleccionadas={plantillasSeleccionadas}
                    onPlantillasGuardadas={handleAgregarPlantillas}
                    onHide={() => setShowAgregarPlantillas(false)}
                />
            </div>
            <div>
                <b>Servicios agregados:</b>
                <ul>
                    {plantillasSeleccionadas.map(p => (
                        <li key={p.id}>{p.nombre}</li>
                    ))}
                </ul>
            </div>
            <Button
                className="mt-2"
                variant="warning"
                onClick={handleEditarCalendario}
                disabled={loading}
            >
                {loading ? <Spinner size="sm" /> : "Guardar Cambios"}
            </Button>
        </Form>
    );
}
