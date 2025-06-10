import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext";
import axios from "axios";
import AgregarPlantillasMes from "./AgregarPlantillasMes";
import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal";

export default function GestionTurnosPage() {
    const { user } = useAuth();
    const [nombreCalendario, setNombreCalendario] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calendarios, setCalendarios] = useState([]);
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [showCrudPlantillas, setShowCrudPlantillas] = useState(false);

    const cargarCalendarios = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/mis-calendarios`, {
                params: { userid: user.idFuncionario }
            });
            setCalendarios(res.data || []);
        } catch {
            setCalendarios([]);
        }
    };

    useEffect(() => {
        cargarCalendarios();
    }, []);

    const handleAgregarPlantillas = (plantillas) => {
        setPlantillasSeleccionadas(plantillas);
        setShowAgregarPlantillas(false);
    };

    const handleCrearCalendario = async () => {
        if (!nombreCalendario.trim() || plantillasSeleccionadas.length === 0) {
            alert("Completa nombre y plantillas.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, {
                nombreCalendario: nombreCalendario.trim(),
                creador: user.idFuncionario,
                mes: selectedMonth + 1,
                anio: selectedYear,
                open: true,
                ids: plantillasSeleccionadas.map(p => p.id),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            alert("Calendario creado correctamente.");
            setNombreCalendario("");
            setPlantillasSeleccionadas([]);
            cargarCalendarios();
        } catch (error) {
            alert(error.response?.data || "Error al crear calendario.");
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirCerrar = async (cal) => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, {
                nombreCalendario: cal.nombreCalendario,
                creador: cal.idFuncionarioCreador || user.idFuncionario,
                mes: cal.mes,
                anio: cal.anio,
                open: !cal.activo,
                ids: cal.plantillasUsadas.map(p => p.id),
                idUnidad: cal.idUnidad || null,
                idComplejo: cal.idComplejo || null,
                createdAt: cal.createdAt,
                updatedAt: new Date().toISOString()
            });
            alert(`Calendario ${cal.activo ? "cerrado" : "abierto"}.`);
            cargarCalendarios();
        } catch (error) {
            alert("Error al cambiar estado.");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este calendario?")) return;
        setLoading(true);
        try {
            await axios.delete(`${import.meta.env.VITE_TURNOS_API_URL}/${id}`);
            alert("Calendario eliminado.");
            cargarCalendarios();
        } catch (error) {
            alert("Error al eliminar calendario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h4 className="mb-3">Crear nuevo calendario</h4>

            <Form className="border p-3 rounded bg-light mb-4">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-2">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                value={nombreCalendario}
                                onChange={e => setNombreCalendario(e.target.value)}
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
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mt-3 d-flex flex-wrap gap-2">
                    <Button onClick={() => setShowAgregarPlantillas(true)}>+ Agregar Servicios</Button>
                    <Button variant="outline-secondary" onClick={() => setShowCrudPlantillas(true)}>
                        Crear / Editar Plantillas
                    </Button>
                    <Button variant="success" onClick={handleCrearCalendario} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "Crear Calendario"}
                    </Button>
                </div>

                {plantillasSeleccionadas.length > 0 && (
                    <div className="mt-3">
                        <b>Servicios seleccionados:</b>
                        <ul>
                            {plantillasSeleccionadas.map(p => (
                                <li key={p.id}>{p.nombre}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </Form>

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

            <h5 className="mb-3">Mis calendarios</h5>

            {loading && <Spinner />}
            {calendarios.map(cal => (
                <div key={cal.id} className="border rounded p-2 mb-2 bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <strong>{cal.nombreCalendario}</strong> ({cal.mes}/{cal.anio}){" "}
                        <Badge bg={cal.activo ? "success" : "danger"}>
                            {cal.activo ? "Abierto" : "Cerrado"}
                        </Badge>
                    </div>
                    <div className="d-flex gap-2">
                        {/* Placeholder: puedes abrir un modal de edición o navegación */}
                        <Button variant="outline-primary" onClick={() => alert("Editar no implementado")}>
                            Editar
                        </Button>
                        <Button variant={cal.activo ? "warning" : "success"} onClick={() => handleAbrirCerrar(cal)}>
                            {cal.activo ? "Cerrar" : "Abrir"}
                        </Button>
                        <Button variant="danger" onClick={() => handleEliminar(cal.id)}>
                            Eliminar
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}