import React, { useState } from "react";
import { Button, Form, Spinner, Row, Col } from "react-bootstrap";
import AgregarPlantillasMes from "./AgregarPlantillasMes";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import axios from "axios";
import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal.jsx";

export default function CrearCalendarioTurnos({ onCalendarioCreado }) {
    const { user } = useAuth();
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState([]);
    const [nombreCalendario, setNombreCalendario] = useState("");
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCrudPlantillas, setShowCrudPlantillas] = useState(false);


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
            });
            alert("Calendario creado correctamente.");
            if (onCalendarioCreado) onCalendarioCreado();
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
        <Form>
            <h4>Crear nuevo calendario de turnos</h4>
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

            <div className="mb-2 d-flex align-items-center gap-2">
                <Button
                    variant="primary"
                    onClick={() => setShowAgregarPlantillas(true)}
                >
                    + Agregar Servicios del Mes
                </Button>
                <Button
                    variant="outline-secondary"
                    onClick={() => setShowCrudPlantillas(true)} // Nuevo estado
                >
                    Crear/Editar Plantilla
                </Button>
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
                variant="success"
                onClick={handleCrearCalendario}
                disabled={loading}
            >
                {loading ? <Spinner size="sm" /> : "Crear Calendario"}
            </Button>
        </Form>
    );
}
