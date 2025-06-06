import React, { useState, useEffect } from "react";
import {
    Container, Card, Button, Form, ListGroup, Row, Col, Badge, Spinner, OverlayTrigger, Tooltip
} from "react-bootstrap";
import AsyncSelect from "react-select/async";
import axios from "axios";
import debounce from "lodash.debounce";
import "bootstrap/dist/css/bootstrap.min.css";
import UnavailabilityModal from "../../components/UnavailabilityModal.jsx";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import {FaArrowLeft} from "react-icons/fa";

// Paleta institucional y pastel
const azulPDI = "#17355A";
const azulSuave = "#7fa6da";
const azulOscuro = "#23395d";
const grisClaro = "#eceff4";
const verdeMenta = "#a6e3cf";
const doradoPDI = "#FFC700";
const textoPrincipal = "#23395d";
const textoSecundario = "#4a5975";
const blanco = "#f7f8fc";

function UnitAssignmentView({modoVista, anio, mes, setModo}) {
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
    const [showInfo, setShowInfo] = useState(true);

    const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
    const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const allMonths = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, anio: currentYear }));
        setMesesDisponibles(allMonths);
        if(mes) {
            setSelectedMes({mes: mes + 1, anio})
        }
    }, [mes, anio]);

    useEffect(() => {
        if (!selectedMes) return;

        const { mes, anio } = selectedMes;
        if (!isAdmin) setUnidadActual(unidadUsuario);

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

                if (!datosUnidad) setError("No hay configuración de plazas para esta unidad en el mes seleccionado.");
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

    const handleVolver = () => {
        setModo(null)
    }

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
            {modoVista !== "UNIDAD" &&
                (
                    <>
                        <h2 className="fw-bold mb-2"
                            style={{
                                color: azulOscuro,
                                letterSpacing: ".03em",
                                fontSize: "2rem",
                                textShadow: "0 1px 2px #d6e2f840",
                            }}
                        >
                            Asignación de Turnos
                        </h2>
                        <div className="d-flex gap-4">
                            <div className={"w-25"}>
                                <Form.Group className="mb-4" style={{ maxWidth: 420, margin: "0 auto" }}>
                                    <Form.Label className="fw-semibold" style={{ color: azulPDI }}>Seleccionar Mes</Form.Label>
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
                                        style={{
                                            borderRadius: 13,
                                            fontSize: 16.2,
                                            padding: "0.7rem"
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
                                    <Form.Group className="mb-3" style={{ maxWidth: 380, margin: "0 auto" }}>
                                        <Form.Label className="fw-semibold" style={{ color: azulPDI }}>Ver como unidad</Form.Label>
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
                            </div>
                            <div className="w-100">
                                {showInfo && (
                                    <Card
                                        style={{
                                            background: azulSuave + "15",
                                            color: textoPrincipal,
                                            border: "1px solid",
                                            borderColor: "#575757",
                                            borderRadius: 17,
                                            boxShadow: "0 2px 10px #aecbf855",
                                            fontSize: 16.2,
                                            marginBottom: 20,
                                            position: "relative",
                                            maxWidth: 800,
                                            margin: "0 auto 24px auto"
                                        }}
                                    >
                                        <Button
                                            variant="link"
                                            style={{
                                                position: "absolute",
                                                top: 11,
                                                right: 18,
                                                fontSize: 23,
                                                color: azulOscuro,
                                                textDecoration: "none",
                                                fontWeight: 700,
                                                opacity: 0.77,
                                                zIndex: 10
                                            }}
                                            onClick={() => setShowInfo(false)}
                                            aria-label="Cerrar caja informativa"
                                        >
                                            ×
                                        </Button>
                                        <Card.Body style={{ padding: "26px 32px" }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                                                <div style={{
                                                    background: "#fff",
                                                    color: azulOscuro,
                                                    borderRadius: "50%",
                                                    fontWeight: 800,
                                                    fontSize: 22,
                                                    width: 40,
                                                    height: 40,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    boxShadow: "0 2px 9px #99bbf82a"
                                                }}>
                                                    i
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 18.2, marginBottom: 3 }}>
                                                        ¿Cómo disponibilizar funcionarios para los turnos?
                                                    </div>
                                                    <ol style={{ marginLeft: 22, marginBottom: 0, paddingLeft: 0, fontSize: 15.7 }}>
                                                        <li><b>Selecciona el mes y año</b> para desplegar opciones de agregar funcionarios.</li>
                                                        <li>Escriba el nombre del funcionario y pulse <Badge bg="info">Agregar</Badge>.</li>
                                                        <li>Agregue todos los funcionarios requeridos para activar el botón <Badge bg="info">Guardar asignación</Badge>.</li>
                                                        <li>Las modificaciones son posibles solo mientras el mes esté abierto.</li>
                                                    </ol>
                                                    <div style={{
                                                        fontSize: 15,
                                                        color: "#16675b",
                                                        background: "#d9f7ec",
                                                        borderRadius: 9,
                                                        padding: "7px 16px",
                                                        marginTop: 9
                                                    }}>
                                                        <b>Recuerda:</b> Al agregar un funcionario puedes especificar sus días no disponibles.<br />
                                                        Esto ayuda a optimizar la asignación de servicios.
                                                    </div>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </>
                )
            }

            {
                modoVista === "UNIDAD" && (
                    <Row style={{marginBottom: 10}}>
                        <Col md={4}>
                            <Button variant={"warning"} style={{width: 100}}
                                onClick={() => handleVolver()}
                            >
                                <FaArrowLeft style={{ marginRight: 7, fontSize: 17 }} />
                                Volver
                            </Button>
                        </Col>
                    </Row>
                )
            }

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}
            {error && (
                <div className="text-danger text-center mb-4" style={{ fontWeight: 500 }}>{error}</div>
            )}
            {!selectedMes && <div className="text-center text-muted py-4">Seleccione un mes para comenzar.</div>}

            {selectedMes && unitData && (
                <Card className="shadow mb-4"
                      style={{ borderRadius: 19, border: "none", background: blanco }}>
                    <Card.Header
                        className="d-flex justify-content-between align-items-center"
                        style={{
                            background: azulSuave,
                            color: azulOscuro,
                            fontWeight: 700,
                            fontSize: "1.13rem",
                            borderTopLeftRadius: 19,
                            borderTopRightRadius: 19,
                            border: "none"
                        }}>
                        <span>{unitData.unitName}</span>
                        <Badge bg={isMonthOpen ? "success" : "secondary"} style={{ fontSize: 15, letterSpacing: 0.1 }}>
                            {isMonthOpen ? "Mes Abierto" : "Mes Cerrado (Lectura)"}
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
                                        isDisabled={remaining <= 0 || !isMonthOpen}
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
                                                                {isMonthOpen && (
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
                        {isMonthOpen && (
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

export default UnitAssignmentView;
