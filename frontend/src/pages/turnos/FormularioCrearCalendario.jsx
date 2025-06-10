import React, { useState } from "react";
import { Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import axios from "axios";
import AgregarPlantillasMes from "./AgregarPlantillasMes.jsx";
import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal.jsx";

export default function FormularioCrearCalendario({ onCalendarioCreado }) {
    const { user } = useAuth();
    const today = new Date();

    const [nombreCalendario, setNombreCalendario] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState([]);
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [showCrudPlantillas, setShowCrudPlantillas] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAgregarPlantillas = (plantillas) => {
        setPlantillasSeleccionadas(plantillas);
        setShowAgregarPlantillas(false);
    };

    const handleCrearCalendario = async () => {
        if (!nombreCalendario.trim()) {
            alert("Debes ingresar un nombre para el calendario.");
            return;
        }
        if (plantillasSeleccionadas.length === 0) {
            alert("Debes agregar al menos un servicio (plantilla) para crear el calendario.");
            return;
        }

        try {
            setLoading(true);
            const ids = plantillasSeleccionadas.map(p => p.id);

            await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, {
                nombreCalendario: nombreCalendario.trim(),
                creador: user.idFuncionario,
                mes: selectedMonth + 1,
                anio: selectedYear,
                open: true,
                ids,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            alert("Calendario creado correctamente.");
            if (onCalendarioCreado) onCalendarioCreado();
            // Opcional: limpiar formulario
            setNombreCalendario("");
            setPlantillasSeleccionadas([]);
        } catch (error) {
            if (error.response?.data?.includes("ya existe")) {
                alert("Ya existe un calendario con ese nombre para ese mes/año.");
            } else {
                alert("Ocurrió un error al crear el calendario.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form className="border p-3 rounded shadow-sm bg-light">
            <h5>Crear nuevo calendario de turnos</h5>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Nombre del Calendario</Form.Label>
                        <Form.Control
                            value={nombreCalendario}
                            onChange={e => setNombreCalendario(e.target.value)}
                            placeholder="Ej: Guardia Abril 2025"
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
                            min={2023}
                            max={2100}
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                <Button variant="primary" onClick={() => setShowAgregarPlantillas(true)}>
                    + Agregar Servicios del Mes
                </Button>
                <Button variant="outline-secondary" onClick={() => setShowCrudPlantillas(true)}>
                    Crear / Editar Plantillas
                </Button>
            </div>

            <AgregarPlantillasMes
                show={showAgregarPlantillas}
                mes={selectedMonth + 1}
                anio={selectedYear}
                seleccionadas={plantillasSeleccionadas}
                onPlantillasGuardadas={handleAgregarPlantillas}
                onHide={() => setShowAgregarPlantillas(false)}
            />

            <PlantillasTurnoCrudModal
                show={showCrudPlantillas}
                onClose={() => setShowCrudPlantillas(false)}
            />

            {plantillasSeleccionadas.length > 0 && (
                <div className="mb-3">
                    <b>Servicios seleccionados:</b>
                    <ul>
                        {plantillasSeleccionadas.map(p => (
                            <li key={p.id}>{p.nombre}</li>
                        ))}
                    </ul>
                </div>
            )}

            <Button variant="success" onClick={handleCrearCalendario} disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : "Crear Calendario"}
            </Button>
        </Form>
    );
}
