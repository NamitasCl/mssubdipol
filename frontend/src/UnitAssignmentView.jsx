import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form, ListGroup, Row, Col, Badge } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import axios from "axios";
import debounce from "lodash.debounce";
import "bootstrap/dist/css/bootstrap.min.css";
import UnavailabilityModal from "./components/UnavailabilityModal.jsx";
import { useAuth } from "./AuthContext";

function UnitAssignmentView() {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin || false;
    const unidadUsuario = user?.siglasUnidad || "";

    const [unidadActual, setUnidadActual] = useState(unidadUsuario);
    const [unitData, setUnitData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [selectedMes, setSelectedMes] = useState(null);
    const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);

    const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
    const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const allMonths = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, anio: currentYear }));
        setMesesDisponibles(allMonths);
    }, []);

    useEffect(() => {
        if (!selectedMes) return;

        const { mes, anio } = selectedMes;
        if (!isAdmin) {
            setUnidadActual(unidadUsuario);
        }

        setLoading(true);
        setError(null);

        axios
            .get(`${import.meta.env.VITE_TURNOS_API_URL}/status`, { params: { mes, anio } })
            .then((resp) => setIsMonthOpen(resp.data.activo))
            .catch(() => setIsMonthOpen(false));

        Promise.all([
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/consultar`, {
                params: { mes, anio, unidad: unidadActual },
            }),
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/mesesactivos2`)
        ])
            .then(([asignadosResp, mesesResp]) => {
                const funcionariosAsignados = Array.isArray(asignadosResp.data)
                    ? asignadosResp.data.map((f) => ({
                        id: f.id,
                        nombreCompleto: f.nombreCompleto,
                        siglasCargo: f.siglasCargo,
                        antiguedad: f.antiguedad,
                        unavailabilities: f.diasNoDisponibles?.map((d) => ({
                            ...d,
                            fecha: d.fecha ?? null,
                            fechaInicio: d.fechaInicio ?? null,
                            fechaFin: d.fechaFin ?? null
                        })) || []
                    }))
                    : [];

                const datosMes = mesesResp.data.find((m) => m.mes === mes && m.anio === anio);
                const unidadesMes = datosMes?.unidades?.map((u) => u.unidad) || [];
                setUnidadesDisponibles(unidadesMes);

                const datosUnidad = datosMes?.unidades?.find(
                    (u) =>
                        u.unidad.replace(/\s/g, "").toUpperCase() ===
                        unidadActual.replace(/\s/g, "").toUpperCase()
                );


                if (!datosUnidad) {
                    setError("No hay configuración de plazas para esta unidad en el mes seleccionado.");
                }

                const required = datosUnidad?.cantidadPersonasNecesarias ?? 0;

                setUnitData({
                    id: 1,
                    unitName: unidadActual,
                    required,
                    assigned: funcionariosAsignados,
                });

                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [selectedMes, unidadActual]);

    const loadOptions = (inputValue, callback) => {
        if (inputValue.length < 3) return callback([]);
        axios
            .get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/search`, { params: { term: inputValue } })
            .then((response) => {
                const options = response.data.map((funcionario) => ({
                    value: funcionario.id,
                    label: funcionario.nombreCompleto,
                    funcionario,
                }));
                callback(options);
            })
            .catch(() => callback([]));
    };

    const debouncedLoadOptions = debounce(loadOptions, 300);

    const handleSaveAssignment = () => {
        if (!unitData) return;

        const payload = {
            unidad: unidadActual,
            mes: selectedMes.mes,
            anio: selectedMes.anio,
            funcionarios: unitData.assigned.map((emp) => ({
                id: emp.id,
                nombreCompleto: emp.nombreCompleto,
                siglasCargo: emp.siglasCargo,
                antiguedad: emp.antiguedad,
                diasNoDisponibles: emp.unavailabilities,
            })),
        };

        setLoading(true);
        setError(null);
        axios
            .post(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones`, payload)
            .then(() => {
                alert("Asignación guardada exitosamente.");
                setLoading(false);
            })
            .catch(() => {
                setError("Error al guardar la asignación");
                setLoading(false);
            });
    };

    const updateAssignedEmployees = (newList) => {
        setUnitData((prev) => ({ ...prev, assigned: newList }));
    };

    const handleOpenUnavailabilityModal = (index) => {
        setEditingEmployeeIndex(index);
        setShowUnavailabilityModal(true);
    };

    const handleSaveUnavailability = (newUnavailability) => {
        setUnitData((prev) => {
            const newAssigned = [...prev.assigned];
            const current = newAssigned[editingEmployeeIndex];
            current.unavailabilities = current.unavailabilities
                ? [...current.unavailabilities, newUnavailability]
                : [newUnavailability];
            newAssigned[editingEmployeeIndex] = current;
            return { ...prev, assigned: newAssigned };
        });
        setShowUnavailabilityModal(false);
    };

    const remaining = unitData ? unitData.required - unitData.assigned.length : 0;

    const formatMes = (mes, anio) => {
        const date = new Date(anio, mes - 1);
        return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4 text-center">Asignación de Turnos</h2>

            <Form.Group className="mb-4">
                <Form.Label>Seleccionar Mes</Form.Label>
                <Form.Select
                    value={selectedMes ? `${selectedMes.mes}-${selectedMes.anio}` : ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!value) {
                            setSelectedMes(null);
                            setUnitData(null);
                            return;
                        }
                        const [mes, anio] = value.split("-").map(Number);
                        setSelectedMes({ mes, anio });
                    }}
                >
                    <option value="">Seleccione mes a consultar</option>
                    {mesesDisponibles.map((m) => (
                        <option key={`${m.mes}-${m.anio}`} value={`${m.mes}-${m.anio}`}>
                            {formatMes(m.mes, m.anio)}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {isAdmin && selectedMes && (
                <Form.Group className="mb-3">
                    <Form.Label>Ver como unidad</Form.Label>
                    <Form.Select
                        value={unidadActual}
                        onChange={(e) => setUnidadActual(e.target.value)}
                    >
                        {unidadesDisponibles.map((u, i) => (
                            <option key={i} value={u}>{u}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {loading && <div className="text-center">Cargando datos...</div>}
            {error && <div className="text-danger text-center">{error}</div>}
            {!selectedMes && <div className="text-center text-muted">Seleccione un mes para comenzar.</div>}

            {selectedMes && unitData && (
                <Card className="shadow-sm mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                        <strong>{unitData.unitName}</strong>
                        <Badge bg={isMonthOpen ? "success" : "secondary"}>
                            {isMonthOpen ? "Mes Abierto" : "Mes Cerrado (Lectura)"}
                        </Badge>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={5}>
                                <Form.Group className="mb-2">
                                    <Form.Label>Agregar Funcionario</Form.Label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={debouncedLoadOptions}
                                        value={selectedEmployee}
                                        onChange={(option) => setSelectedEmployee(option)}
                                        isDisabled={remaining <= 0 || !isMonthOpen}
                                        placeholder="Nombre del funcionario"
                                    />
                                </Form.Group>
                                <Button
                                    variant="outline-success"
                                    onClick={() => {
                                        if (selectedEmployee && remaining > 0 && isMonthOpen) {
                                            const { funcionario } = selectedEmployee;
                                            updateAssignedEmployees([
                                                ...unitData.assigned,
                                                {
                                                    id: funcionario.id,
                                                    nombreCompleto: funcionario.nombreCompleto,
                                                    siglasCargo: funcionario.siglasCargo,
                                                    antiguedad: funcionario.antiguedad,
                                                    unavailabilities: []
                                                }
                                            ]);
                                            setSelectedEmployee(null);
                                        }
                                    }}
                                    disabled={remaining <= 0 || !selectedEmployee || !isMonthOpen}
                                >
                                    Agregar
                                </Button>
                            </Col>

                            <Col md={7}>
                                <Card className="h-100">
                                    <Card.Header className="bg-light">Funcionarios Asignados</Card.Header>
                                    <Card.Body>
                                        {unitData.assigned.length === 0 ? (
                                            <p className="text-muted">Ningún funcionario asignado.</p>
                                        ) : (
                                            <ListGroup>
                                                {unitData.assigned.map((emp, idx) => (
                                                    <ListGroup.Item
                                                        key={idx}
                                                        className="d-flex justify-content-between align-items-start flex-column"
                                                    >
                                                        <div className="w-100 d-flex justify-content-between align-items-center">
                                                            <strong>{emp.nombreCompleto}</strong>
                                                            <div>
                                                                {isMonthOpen && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline-info"
                                                                            size="sm"
                                                                            onClick={() => handleOpenUnavailabilityModal(idx)}
                                                                            className="me-2"
                                                                        >
                                                                            Días no disponibles
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                updateAssignedEmployees(
                                                                                    unitData.assigned.filter((_, i) => i !== idx)
                                                                                )
                                                                            }
                                                                        >
                                                                            Quitar
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-muted w-100">
                                                            <small>
                                                                Cargo: {emp.siglasCargo} | Antigüedad: {emp.antiguedad}
                                                            </small>
                                                        </div>
                                                        {emp.unavailabilities && emp.unavailabilities.length > 0 && (
                                                            <ListGroup className="mt-2">
                                                                {emp.unavailabilities.map((unav, uidx) => {
                                                                    let formattedDate = "";
                                                                    if (unav.fecha) {
                                                                        formattedDate = unav.fecha;
                                                                    } else if (unav.fechaInicio) {
                                                                        formattedDate = unav.fechaInicio;
                                                                        if (unav.fechaFin && unav.fechaFin.trim() !== "") {
                                                                            formattedDate += ` - ${unav.fechaFin}`;
                                                                        }
                                                                    }
                                                                    return (
                                                                        <div key={uidx}>
                                                                            <h6>Días no disponible:</h6>
                                                                            <ListGroup.Item className="p-1">
                                                                                {formattedDate} - {unav.motivo} {unav.detalle && `(${unav.detalle})`}
                                                                            </ListGroup.Item>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </ListGroup>
                                                        )}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <div className="mt-3">
                            <p>
                                <strong>Plazas requeridas:</strong> {unitData.required} — {" "}
                                <strong>Asignadas:</strong> {unitData.assigned.length} — {" "}
                                <strong>Restantes:</strong> {remaining > 0 ? remaining : 0}
                            </p>
                            {remaining > 0 ? (
                                <p className="text-warning">
                                    Asigne todos los funcionarios para poder guardar la asignación.
                                </p>
                            ) : (
                                <p className="text-success">¡Todas las plazas han sido cubiertas para el mes!</p>
                            )}
                        </div>

                        {isMonthOpen && (
                            <Button
                                variant="primary"
                                onClick={handleSaveAssignment}
                                disabled={remaining > 0 || loading}
                            >
                                Guardar Asignación
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            )}

            {showUnavailabilityModal && (
                <UnavailabilityModal
                    show={showUnavailabilityModal}
                    onClose={() => setShowUnavailabilityModal(false)}
                    onSave={handleSaveUnavailability}
                    existingDates={
                        editingEmployeeIndex !== null && unitData
                            ? unitData.assigned[editingEmployeeIndex].unavailabilities
                            : []
                    }
                />
            )}
        </Container>
    );
}

export default UnitAssignmentView;