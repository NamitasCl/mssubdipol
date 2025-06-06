import React, { useState, useEffect } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Form,
    Badge,
    ProgressBar,
    OverlayTrigger,
    Tooltip,
    Spinner
} from "react-bootstrap";
import axios from "axios";
import { DepartmentManagement } from "../../components/DepartmentManagement.jsx";
import { MonthSelector } from "../../components/MonthSelector.jsx";
import UnitAssignmentView from "./UnitAssignmentView.jsx";
import { FaArrowLeft } from "react-icons/fa";
import PlantillasTurnoCrudModal from "./PlantillasTurnoCrudModal.jsx";
import AgregarPlantillasMes from "./AgregarPlantillasMes.jsx";

// Paleta institucional
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";
const blanco = "#f7f8fc";
const grisClaro = "#eceff4";
const textoSecundario = "#4a5975";

function GestionTurnos({ setModo }) {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [departments, setDepartments] = useState([]);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState([]);
    const [showInfo, setShowInfo] = useState(true);
    const [showPlantillas, setShowPlantillas] = useState(false);
    const [showAgregarPlantillas, setShowAgregarPlantillas] = useState(false);
    const [loading, setLoading] = useState(false);

    // Carga estado de apertura y plantillas usadas en el mes (si existe TurnoAsignacion)
    useEffect(() => {
        fetchMesData();
        fetchUnidadesColaboradoras();
    }, [selectedMonth, selectedYear]);

    const fetchMesData = async () => {
        try {
            setLoading(true);
            // Busca si hay TurnoAsignacion para el mes/año
            const resp = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}`, {
                params: { mes: selectedMonth + 1, anio: selectedYear }
            });
            const dto = resp.data;
            setIsMonthOpen(true); // Si hay registro, está abierto (ajusta si tienes flag)
            // Asume que tu DTO incluye las plantillas usadas en el mes, si no, carga por otro endpoint
            setPlantillasSeleccionadas(dto.plantillasUsadas ?? []);
        } catch (err) {
            setIsMonthOpen(false);
            setPlantillasSeleccionadas([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnidadesColaboradoras = async () => {
        try {
            const resp = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras`, {
                params: {
                    mes: selectedMonth + 1,
                    anio: selectedYear,
                },
            });
            const fetchedDepts = resp.data.map((u, i) => ({
                id: u.id ?? Date.now() + i,
                name: u.nombreUnidad,
                totalPeople: u.cantFuncAporte,
                maxShifts: u.maxTurnos,
                workersPerDay: u.trabajadoresPorDia,
                noWeekend: !u.trabajaFindesemana,
            }));
            setDepartments(fetchedDepts);
        } catch (err) {
            setDepartments([]);
        }
    };

    // Guarda la lista de plantillas seleccionadas desde el modal
    const handleAgregarPlantillas = (plantillas) => {
        console.log("Plantillas: ", plantillas)
        setPlantillasSeleccionadas(plantillas);
        setShowAgregarPlantillas(false);
    };

    // ABRIR mes con /open-close
    const handleOpenMonth = async () => {
        if (plantillasSeleccionadas.length === 0) {
            alert("Debes agregar al menos un servicio (plantilla) para abrir el mes.");
            return;
        }
        try {
            setLoading(true);
            // Suma la cantidad total de turnos (servicios x días), o ajusta según tu modelo
            // Aquí dejo un ejemplo, debes calcularlo según tus plantillas
            let totalTurnos = 0; // Calcula la cantidad real si es necesario
            await axios.put(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, null, {
                params: {
                    mes: selectedMonth + 1,
                    anio: selectedYear,
                    open: true,
                    turnos: totalTurnos
                }
            });
            setIsMonthOpen(true);
            alert("Mes abierto correctamente.");
        } catch (error) {
            alert("Ocurrió un error al abrir el mes.");
        } finally {
            setLoading(false);
        }
    };


    // Cerrar mes (puedes ajustar el endpoint si usas PUT o PATCH)
    const handleCloseMonth = async () => {
        try {
            setLoading(true);
            await axios.put(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, null, {
                params: {
                    mes: selectedMonth + 1,
                    anio: selectedYear,
                    open: false,
                    turnos: 0  // o el valor adecuado
                }
            });
            setIsMonthOpen(false);
            alert("Mes cerrado correctamente.");
        } catch (err) {
            alert("Ocurrió un error al cerrar el mes.");
        } finally {
            setLoading(false);
        }
    };


    // Guarda unidades colaboradoras (puedes ajustar si tienes endpoint por mes/año)
    const handleSaveUnidadColaboradora = async () => {
        const payload = departments.map((dept) => ({
            name: dept.name,
            totalPeople: dept.totalPeople,
            maxShifts: dept.maxShifts,
            workersPerDay: dept.workersPerDay,
            noWeekend: dept.noWeekend,
            mes: selectedMonth + 1,
            anio: selectedYear,
        }));
        try {
            await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/unidades-colaboradoras/lote`, payload);
            alert("Unidades guardadas");
        } catch {
            alert("Error al guardar las unidades");
        }
    };

    return (
        <div style={{
            background: blanco,
            borderRadius: 20,
            boxShadow: "0 8px 36px #b0c5e820",
            padding: "18px 11px 16px 11px",
            minHeight: 540,
            maxWidth: "100%",
            margin: "0 auto"
        }}>
            <div className="d-flex align-items-baseline gap-5">
                <div>
                    <Button variant={"secondary"} size={"sm"} style={{ width: "auto", marginBottom: 10 }} onClick={() => setModo(null)}>
                        <FaArrowLeft style={{ marginRight: 7, fontSize: 17 }} />
                        Volver
                    </Button>
                    <h2
                        className="fw-bold mb-4"
                        style={{
                            color: azulPDI,
                            letterSpacing: ".09em",
                            textTransform: "uppercase",
                            fontSize: "1.35rem",
                            borderLeft: `5px solid ${doradoPDI}`,
                            paddingLeft: "1rem"
                        }}
                    >
                        Gestión de Turnos Mensuales
                    </h2>
                </div>
                <div>
                    Hola
                </div>
            </div>
            {showInfo && (
                <Row>
                    <Col xs={12}>
                        <Card
                            bg="info"
                            style={{
                                margin: "0 auto 18px auto",
                                maxWidth: 980,
                                color: "#183B68",
                                border: "none",
                                borderRadius: 17,
                                boxShadow: "0 4px 32px #3d6fd71b",
                                fontSize: 16.4,
                                padding: 0,
                                position: "relative"
                            }}
                            className="mb-3"
                        >
                            {/* Botón de cierre */}
                            <Button
                                variant="link"
                                style={{
                                    position: "absolute",
                                    top: 13,
                                    right: 18,
                                    fontSize: 23,
                                    color: "#17355A",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    opacity: 0.74,
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
                                        color: "#1a4172",
                                        borderRadius: "50%",
                                        fontWeight: 800,
                                        fontSize: 23,
                                        width: 42,
                                        height: 42,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 9px #99bbf82a"
                                    }}>
                                        i
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 18.2, marginBottom: 2 }}>
                                            ¿Cómo abrir un mes y asignar unidades colaboradoras?
                                        </div>
                                        <ol style={{ marginLeft: 22, marginBottom: 0, paddingLeft: 0, fontSize: 15.8 }}>
                                            <li style={{ marginBottom: 4 }}>
                                                <b>Selecciona el mes y año</b> que deseas abrir, y <b>agrega los servicios/plantillas</b> del mes.
                                            </li>
                                            <li style={{ marginBottom: 4 }}>
                                                Haz clic en <b>"Abrir"</b> para habilitar el mes. El estado cambiará a <span style={{ color: "#22a35b" }}>Abierto</span>.
                                            </li>
                                            <li style={{ marginBottom: 4 }}>
                                                Agrega las <b>unidades colaboradoras</b> usando el botón <b>"Agregar Departamento"</b>.<br />
                                                Para cada unidad, completa los datos solicitados.
                                            </li>
                                            <li style={{ marginBottom: 4 }}>
                                                Cuando termines, presiona <b>"Guardar Unidades"</b> para registrar la configuración.
                                            </li>
                                        </ol>
                                        <div style={{
                                            fontSize: 15,
                                            color: "#11554b",
                                            background: "#d9f7ec",
                                            borderRadius: 9,
                                            padding: "6px 15px",
                                            marginTop: 9
                                        }}>
                                            <b>Recuerda:</b> El mes solo se puede abrir si hay plantillas agregadas.<br />
                                            Para modificar las unidades después de guardar, simplemente edítalas en el listado y vuelve a guardar.
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <Row className="g-4">
                {/* Panel lateral */}
                <Col xs={12} md={5} lg={4}>
                    <Card
                        style={{
                            background: grisClaro,
                            border: "none",
                            borderRadius: 18,
                            boxShadow: "0 3px 16px #c7d3ef25",
                        }}
                        className="mb-3"
                    >
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <div className="fw-semibold" style={{ color: textoSecundario }}>
                                        Estado mes {selectedMonth + 1}/{selectedYear}:
                                    </div>
                                    <Badge bg={isMonthOpen ? "success" : "danger"} className="mt-1 px-3 py-1 fs-6 rounded-pill">
                                        {isMonthOpen ? "Abierto" : "Cerrado"}
                                    </Badge>
                                </div>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>{isMonthOpen ? "Cerrar mes" : "Abrir mes"}</Tooltip>}
                                >
                                    <Button
                                        variant={isMonthOpen ? "outline-warning" : "success"}
                                        onClick={isMonthOpen ? handleCloseMonth : handleOpenMonth}
                                        className="rounded-pill fw-bold"
                                        style={{ fontSize: 15, minWidth: 88 }}
                                        disabled={loading || (!isMonthOpen && plantillasSeleccionadas.length === 0)}
                                    >
                                        {loading && <Spinner size="sm" className="me-1" />}
                                        {isMonthOpen ? "Cerrar" : "Abrir"}
                                    </Button>
                                </OverlayTrigger>
                            </div>

                            <div className="mt-3">
                                <MonthSelector
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    setSelectedMonth={setSelectedMonth}
                                    setSelectedYear={setSelectedYear}
                                />
                            </div>
                            <hr style={{ borderColor: "#bcd2f3" }} />

                            <div>
                                <Button onClick={() => setShowPlantillas(true)}>Administrar Plantillas de Turno</Button>
                                <PlantillasTurnoCrudModal show={showPlantillas} onClose={() => setShowPlantillas(false)} />
                            </div>
                            <hr style={{ borderColor: "#bcd2f3" }} />

                            <div>
                                <Button variant="primary" onClick={() => setShowAgregarPlantillas(true)}>
                                    + Agregar Servicios del Mes
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

                            {/* Mostrar plantillas seleccionadas */}
                            <div className="mt-4">
                                <h6>Servicios del mes:</h6>
                                {plantillasSeleccionadas.length === 0 && <div className="text-muted">No hay servicios agregados aún.</div>}
                                <ul style={{ paddingLeft: 20 }}>
                                    {plantillasSeleccionadas.map(p => (
                                        <li key={p.id}>
                                            <b>{p.nombre}</b>{" "}
                                            <span className="text-muted" style={{ fontSize: 13 }}>{p.descripcion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Panel principal */}
                <Col xs={12} md={7} lg={8}>
                    <DepartmentManagement
                        setModo={setModo}
                        departments={departments}
                        setDepartments={setDepartments}
                    />
                    <div className="d-flex justify-content-end mt-4">
                        <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip>Guardar asignación de unidades colaboradoras</Tooltip>}
                        >
                            <Button
                                variant="primary"
                                className="rounded-pill px-4 fw-bold"
                                onClick={handleSaveUnidadColaboradora}
                                style={{
                                    fontSize: 17,
                                    boxShadow: "0 3px 16px #19374a21",
                                    letterSpacing: 0.8
                                }}
                            >
                                Guardar Unidades
                            </Button>
                        </OverlayTrigger>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default GestionTurnos;