import React, { useState, useEffect } from "react";
import {
    Container, Card, Button, Form, ListGroup, Row, Col, Badge, Spinner, OverlayTrigger, Tooltip
} from "react-bootstrap";
import AsyncSelect from "react-select/async";
import axios from "axios";
import debounce from "lodash.debounce";
import UnavailabilityModal from "../../components/UnavailabilityModal.jsx";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

const azulPDI = "#17355A";
const azulSuave = "#7fa6da";
const azulOscuro = "#23395d";
const grisClaro = "#eceff4";
const verdeMenta = "#a6e3cf";
const textoPrincipal = "#23395d";
const textoSecundario = "#4a5975";
const blanco = "#f7f8fc";

export default function UnitAssignmentView() {
    const { user } = useAuth();
    const isAdmin = user?.isAdmin || false;
    const unidadUsuario = user?.siglasUnidad || "";
    const userId = user?.idFuncionario;

    // Estados principales
    const [unidadActual, setUnidadActual] = useState(unidadUsuario);
    const [calendarios, setCalendarios] = useState([]);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [unitData, setUnitData] = useState(null);
    const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
    const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);

    // 1. Cargar los calendarios disponibles del usuario
    useEffect(() => {
        if (!userId) return;
        axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/mis-calendarios`, { params: { userid: userId } })
            .then(res => setCalendarios(res.data))
            .catch(() => setCalendarios([]));
    }, [userId]);

    // 2. Al seleccionar un calendario, cargar unidades colaboradoras
    useEffect(() => {
        if (!calendarioSeleccionado) return;
        setLoading(true);
        setError(null);

        axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras`, {
            params: { turnoAsignacion: calendarioSeleccionado.id }
        })
            .then(({ data: unidadesColaboradoras }) => {
                setUnidadesDisponibles(unidadesColaboradoras.map(u => u.nombreUnidad));

                // Admin puede seleccionar unidad, sino por defecto la del usuario
                let unidadSel = isAdmin
                    ? (unidadActual || unidadesColaboradoras[0]?.nombreUnidad)
                    : unidadUsuario;

                // Si admin y aún no hay unidad definida, setear la primera
                if (isAdmin && !unidadActual && unidadesColaboradoras.length > 0) {
                    setUnidadActual(unidadesColaboradoras[0].nombreUnidad);
                    unidadSel = unidadesColaboradoras[0].nombreUnidad;
                }

                // Busca la unidad y obtiene el número requerido de funcionarios
                const aporteUnidad = unidadesColaboradoras.find(uc => uc.nombreUnidad === unidadSel);
                const required = aporteUnidad?.cantFuncAporte || 0;

                // 3. Cargar los funcionarios asignados para este calendario+unidad
                axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/${calendarioSeleccionado.id}/${unidadSel}`)
                    .then(resp => {
                        let asig = [];
                        if (Array.isArray(resp.data)) asig = resp.data;
                        setUnitData({
                            id: calendarioSeleccionado.id,
                            unitName: unidadSel,
                            required,
                            assigned: asig.map(f => ({
                                id: f.id,
                                idFuncionario: f.idFuncionario,
                                nombreCompleto: f.nombreCompleto,
                                siglasCargo: f.siglasCargo,
                                antiguedad: f.antiguedad,
                                unavailabilities: f.diasNoDisponibles || []
                            })),
                            isMonthOpen: true, // Puedes ajustar si necesitas info extra
                            nombreCalendario: calendarioSeleccionado.nombreCalendario
                        });
                        setLoading(false);
                    })
                    .catch(() => {
                        setUnitData({
                            id: calendarioSeleccionado.id,
                            unitName: unidadSel,
                            required,
                            assigned: [],
                            isMonthOpen: true,
                            nombreCalendario: calendarioSeleccionado.nombreCalendario
                        });
                        setLoading(false);
                    });
            })
            .catch(() => {
                setLoading(false);
                setError("Error al cargar las unidades colaboradoras.");
            });
        // eslint-disable-next-line
    }, [calendarioSeleccionado, unidadActual, isAdmin, unidadUsuario]);

    // Al cambiar de unidad (admin), limpiar unitData para forzar recarga
    useEffect(() => {
        if (!isAdmin || !calendarioSeleccionado) return;
        setUnitData(null);
    }, [unidadActual]);

    // Selección de calendario
    const handleCalendarioSelect = val => {
        const cal = calendarios.find(c => String(c.id) === val);
        setCalendarioSeleccionado(cal || null);
        setUnitData(null);
    };

    // Async select para buscar funcionarios
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

    // Guardar asignaciones
    const handleSaveAssignment = () => {
        if (!unitData) return;
        setLoading(true);
        axios
            .post(
                `${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/${unitData.id}/${unitData.unitName}`,
                unitData.assigned.map(emp => ({
                    id: emp.id,
                    idFuncionario: emp.idFuncionario,
                    nombreCompleto: emp.nombreCompleto,
                    siglasCargo: emp.siglasCargo,
                    antiguedad: emp.antiguedad,
                    diasNoDisponibles: emp.unavailabilities,
                }))
            )
            .then(() => {
                alert("Asignación guardada exitosamente.");
                setLoading(false);
            })
            .catch((e) => {
                setError("Error al guardar la asignación");
                setLoading(false);
            });
    };

    // Helpers
    const updateAssignedEmployees = (newList) =>
        setUnitData(prev => ({ ...prev, assigned: newList }));

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

    return (
        <Container style={{
            background: grisClaro,
            borderRadius: 22,
            padding: "36px 28px",
            marginTop: 5,
            marginBottom: 44,
            boxShadow: "0 8px 48px #7fa6da22",
            maxWidth: 1920,
        }}>
            {/* Selección de calendario */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-semibold" style={{ color: azulPDI }}>
                    Seleccione calendario
                </Form.Label>
                <Form.Select
                    value={calendarioSeleccionado ? String(calendarioSeleccionado.id) : ""}
                    onChange={e => handleCalendarioSelect(e.target.value)}
                    style={{ borderRadius: 13, fontSize: 16.2, padding: "0.7rem" }}
                >
                    <option value="">Seleccione un calendario</option>
                    {calendarios.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.nombreCalendario}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {calendarioSeleccionado && (
                <div className="mb-4 text-center">
                    <span className="fw-semibold text-uppercase" style={{ color: azulOscuro, fontSize: 18 }}>
                        {calendarioSeleccionado.nombreCalendario}
                    </span>
                </div>
            )}

            {/* Admin: opción de unidad */}
            {calendarioSeleccionado && isAdmin && unidadesDisponibles.length > 0 && (
                <Form.Group className="mb-3" style={{ maxWidth: 380 }}>
                    <Form.Label className="fw-semibold" style={{ color: azulPDI }}>
                        Ver como unidad
                    </Form.Label>
                    <Form.Select
                        value={unidadActual}
                        onChange={(e) => setUnidadActual(e.target.value)}
                        style={{ borderRadius: 13, fontSize: 15.8, padding: "0.6rem" }}
                    >
                        {unidadesDisponibles.map((u, i) => (
                            <option key={i} value={u}>{u}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}
            {error && (
                <div className="text-danger text-center mb-4" style={{ fontWeight: 500 }}>{error}</div>
            )}
            {!calendarioSeleccionado && !loading && (
                <div className="text-center text-muted py-4">Seleccione un calendario para comenzar.</div>
            )}

            {calendarioSeleccionado && unitData && (
                <Card className="shadow mb-4"
                      style={{ borderRadius: 19, border: "none", background: blanco }}>
                    <Card.Header
                        className="d-flex justify-content-between align-items-center"
                        style={{
                            background: azulSuave,
                            color: blanco,
                            fontWeight: 700,
                            fontSize: "1.13rem",
                            borderTopLeftRadius: 19,
                            borderTopRightRadius: 19,
                            border: "none"
                        }}>
                        <span>{unitData.unitName}</span>
                        <Badge bg={unitData.isMonthOpen ? "success" : "secondary"} style={{ fontSize: 15, letterSpacing: 0.1 }}>
                            {unitData.isMonthOpen ? "Mes Abierto" : "Mes Cerrado (Lectura)"}
                        </Badge>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={5} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Agregar Funcionario</Form.Label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={debouncedLoadOptions}
                                        value={selectedEmployee}
                                        onChange={(option) => setSelectedEmployee(option)}
                                        isDisabled={remaining <= 0 || !unitData.isMonthOpen}
                                        placeholder="Buscar funcionario..."
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: 12,
                                                fontSize: 15.2,
                                                minHeight: 40
                                            })
                                        }}
                                    />
                                </Form.Group>
                                <Button
                                    className="mt-2"
                                    style={{
                                        background: verdeMenta,
                                        border: "none",
                                        color: textoPrincipal,
                                        fontWeight: 600,
                                        borderRadius: 12,
                                        fontSize: 15.5,
                                        boxShadow: "0 2px 10px #a6e3cf44"
                                    }}
                                    onClick={() => {
                                        if (selectedEmployee && remaining > 0 && unitData.isMonthOpen) {
                                            const { funcionario } = selectedEmployee;
                                            // Evitar duplicados
                                            if (unitData.assigned.some(emp => emp.idFuncionario === funcionario.id)) {
                                                setSelectedEmployee(null);
                                                return;
                                            }
                                            updateAssignedEmployees([
                                                ...unitData.assigned,
                                                {
                                                    id: funcionario.id,
                                                    idFuncionario: funcionario.id,
                                                    nombreCompleto: funcionario.nombreCompleto,
                                                    siglasCargo: funcionario.siglasCargo,
                                                    antiguedad: funcionario.antiguedad,
                                                    unavailabilities: []
                                                }
                                            ]);
                                            setSelectedEmployee(null);
                                        }
                                    }}
                                    disabled={remaining <= 0 || !selectedEmployee || !unitData.isMonthOpen}
                                >
                                    Agregar
                                </Button>
                            </Col>
                            <Col md={7}>
                                <Card className="h-100 border-0" style={{ borderRadius: 14, background: grisClaro }}>
                                    <Card.Header className="bg-white border-0" style={{
                                        fontWeight: 700,
                                        color: azulPDI,
                                        borderTopLeftRadius: 14,
                                        borderTopRightRadius: 14
                                    }}>
                                        Funcionarios Asignados
                                    </Card.Header>
                                    <Card.Body style={{ padding: "16px 12px" }}>
                                        {unitData.assigned.length === 0 ? (
                                            <p className="text-muted">Ningún funcionario asignado.</p>
                                        ) : (
                                            <ListGroup variant="flush">
                                                {unitData.assigned.map((emp, idx) => (
                                                    <ListGroup.Item
                                                        key={idx}
                                                        style={{
                                                            border: "none",
                                                            background: "transparent",
                                                            marginBottom: 7,
                                                            paddingLeft: 0,
                                                            paddingRight: 0
                                                        }}
                                                        className="d-flex justify-content-between align-items-start flex-column"
                                                    >
                                                        <div className="w-100 d-flex justify-content-between align-items-center mb-1">
                                                            <div>
                                                                <strong style={{ color: azulOscuro }}>{emp.nombreCompleto}</strong>
                                                                <span style={{
                                                                    fontWeight: 500,
                                                                    color: azulSuave,
                                                                    fontSize: 13,
                                                                    marginLeft: 9
                                                                }}>
                                                                    {emp.siglasCargo}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                {unitData.isMonthOpen && (
                                                                    <>
                                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Agregar días no disponibles</Tooltip>}>
                                                                            <Button
                                                                                variant="outline-info"
                                                                                size="sm"
                                                                                onClick={() => handleOpenUnavailabilityModal(idx)}
                                                                                className="me-2"
                                                                                style={{ borderRadius: 10, fontWeight: 500, fontSize: 14.3 }}
                                                                            >
                                                                                Días no disponibles
                                                                            </Button>
                                                                        </OverlayTrigger>
                                                                        <OverlayTrigger placement="top" overlay={<Tooltip>Quitar funcionario</Tooltip>}>
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    updateAssignedEmployees(
                                                                                        unitData.assigned.filter((_, i) => i !== idx)
                                                                                    )
                                                                                }
                                                                                style={{ borderRadius: 10, fontWeight: 500, fontSize: 14.3 }}
                                                                            >
                                                                                Quitar
                                                                            </Button>
                                                                        </OverlayTrigger>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-muted w-100" style={{ fontSize: 13.6 }}>
                                                            Antigüedad: <span style={{ color: azulOscuro }}>{emp.antiguedad}</span>
                                                        </div>
                                                        {emp.unavailabilities && emp.unavailabilities.length > 0 && (
                                                            <ListGroup className="mt-2 mb-1" style={{ background: "transparent" }}>
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
                                                                            <span style={{
                                                                                fontWeight: 600,
                                                                                color: "#196787",
                                                                                fontSize: 14.5
                                                                            }}>
                                                                                Días no disponible:
                                                                            </span>
                                                                            <ListGroup.Item className="p-1" style={{
                                                                                background: "#dbeeff",
                                                                                borderRadius: 7,
                                                                                color: "#2d4966",
                                                                                margin: "3px 0"
                                                                            }}>
                                                                                {formattedDate} — {unav.motivo} {unav.detalle && `(${unav.detalle})`}
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
                        <div className="mt-4 mb-2 text-center">
                            <span className="me-3" style={{ color: textoSecundario, fontWeight: 500 }}>
                                <strong style={{ color: azulOscuro }}>Plazas requeridas:</strong> {unitData.required}
                            </span>
                            <span className="me-3" style={{ color: textoSecundario, fontWeight: 500 }}>
                                <strong style={{ color: azulOscuro }}>Asignadas:</strong> {unitData.assigned.length}
                            </span>
                            <span style={{ color: textoSecundario, fontWeight: 500 }}>
                                <strong style={{ color: azulOscuro }}>Restantes:</strong> {remaining > 0 ? remaining : 0}
                            </span>
                        </div>
                        {remaining > 0 ? (
                            <div className="text-warning text-center" style={{ fontWeight: 600 }}>
                                Asigne todos los funcionarios para poder guardar.
                            </div>
                        ) : (
                            <div className="text-success text-center" style={{ fontWeight: 600 }}>
                                ¡Todas las plazas han sido cubiertas para el mes!
                            </div>
                        )}
                        {unitData.isMonthOpen && (
                            <div className="d-flex justify-content-center mt-4">
                                <Button
                                    style={{
                                        background: azulPDI,
                                        border: "none",
                                        borderRadius: 14,
                                        padding: "11px 38px",
                                        fontWeight: 700,
                                        fontSize: 16.3,
                                        boxShadow: "0 2px 10px #7fa6da40"
                                    }}
                                    onClick={handleSaveAssignment}
                                    disabled={remaining > 0 || loading}
                                >
                                    Guardar Asignación
                                </Button>
                            </div>
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