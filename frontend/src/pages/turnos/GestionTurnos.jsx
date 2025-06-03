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
    Tooltip
} from "react-bootstrap";
import axios from "axios";
import { DepartmentManagement } from "../../components/DepartmentManagement.jsx";
import { MonthSelector } from "../../components/MonthSelector.jsx";
import UnitAssignmentView from "./UnitAssignmentView.jsx";

// Paleta institucional
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";
const blanco = "#f7f8fc";
const grisClaro = "#eceff4";
const textoSecundario = "#4a5975";

function GestionTurnos() {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [departments, setDepartments] = useState([]);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [totalTurnos, setTotalTurnos] = useState(0);
    const [turnosRestantes, setTurnosRestantes] = useState(0);
    const [turnosPorDia, setTurnosPorDia] = useState(0);
    const [showInfo, setShowInfo] = useState(true);
    const [modo, setModo] = useState(null); // "UNIDAD" | "COMPLEJO"

    useEffect(() => {
        fetchUnidadesColaboradoras();
        checkMonthStatus();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        calcularTotales();
    }, [departments, turnosPorDia]);

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
            console.error("Error al cargar unidades:", err);
            setDepartments([]);
        }
    };

    const checkMonthStatus = async () => {
        try {
            const resp = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/status`, {
                params: { mes: selectedMonth + 1, anio: selectedYear },
            });
            setIsMonthOpen(resp.data?.activo ?? false);
        } catch {
            setIsMonthOpen(false);
        }
    };

    const calcularTotales = () => {
        const days = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const total = days * turnosPorDia;
        setTotalTurnos(total);

        const turnosCubiertos = departments.reduce((acc, dept) => {
            const personas = dept.totalPeople ?? 0;
            return acc + (personas * 2);
        }, 0);

        setTurnosRestantes(Math.max(total - turnosCubiertos, 0));
    };

    const toggleMonth = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, null, {
                params: {
                    mes: selectedMonth + 1,
                    anio: selectedYear,
                    open: !isMonthOpen,
                    turnos: totalTurnos,
                },
            });
            checkMonthStatus();
        } catch (error) {
            console.error("Error abriendo/cerrando mes:", error);
            alert("Ocurrió un error al cambiar el estado del mes.");
        }
    };

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
        } catch (err) {
            console.error("Error al guardar unidades:", err);
            alert("Error al guardar las unidades");
        }
    };

    const porcentajeCubierto = totalTurnos > 0
        ? Math.round(((totalTurnos - turnosRestantes) / totalTurnos) * 100)
        : 0;

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
                                                <b>Selecciona el mes y año</b> que deseas abrir, y define el número de <b>turnos diarios</b>.
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
                                            <b>Recuerda:</b> No podrás abrir el mes si los turnos diarios están en cero.<br />
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
                                        onClick={toggleMonth}
                                        className="rounded-pill fw-bold"
                                        style={{ fontSize: 15, minWidth: 88 }}
                                        disabled={!isMonthOpen && turnosPorDia <= 0}
                                    >
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

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold" style={{ color: textoSecundario }}>
                                    Turnos diarios
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    value={turnosPorDia}
                                    onChange={(e) => setTurnosPorDia(Number(e.target.value))}
                                    style={{ borderRadius: 12, fontSize: 16 }}
                                />
                            </Form.Group>

                            <div className="mt-3" style={{ fontSize: 16 }}>
                                <div><strong>Total turnos:</strong> {totalTurnos}</div>
                                <div><strong>Cubiertos:</strong> {totalTurnos - turnosRestantes}</div>
                                <div><strong>Restantes:</strong> {turnosRestantes}</div>
                                <ProgressBar
                                    now={porcentajeCubierto}
                                    className="mt-2"
                                    style={{ borderRadius: 18, height: 18, background: blanco }}
                                    variant={porcentajeCubierto >= 100 ? "success" : "info"}
                                    label={`${porcentajeCubierto}%`}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Panel principal */}
                <Col xs={12} md={7} lg={8}>
                    {!modo && (
                        <Card
                            className="mb-4 p-4 text-center"
                            style={{ borderRadius: 17, boxShadow: "0 3px 18px #d5e1fa55" }}
                        >
                            <h5 className="mb-3">¿Qué deseas gestionar?</h5>
                            <div className="d-flex justify-content-center gap-4 mb-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="px-5"
                                    onClick={() => setModo("UNIDAD")}
                                >Gestionar UNIDAD</Button>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="px-5"
                                    onClick={() => setModo("COMPLEJO")}
                                >Gestionar COMPLEJO</Button>
                            </div>
                            <div style={{ fontSize: 15, color: "#555" }}>
                                <span className="me-2">Elige <b>Unidad</b> para gestionar solo tu unidad, o <b>Complejo</b> para configurar varias unidades colaboradoras.</span>
                            </div>
                        </Card>
                    )}

                    {/* Si elige UNIDAD, carga UnitAssignmentView */}
                    {modo === "UNIDAD" && (
                        <UnitAssignmentView modoVista={modo} mes={selectedMonth} anio={selectedYear} setModo={setModo} />
                    )}

                    {/* Si elige COMPLEJO, deja el flujo actual */}
                    {modo === "COMPLEJO" && (
                        <>
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
                        </>
                    )}
                </Col>

            </Row>
        </div>
    );
}

export default GestionTurnos;