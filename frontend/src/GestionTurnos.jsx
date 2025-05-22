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
import { DepartmentManagement } from "./components/DepartmentManagement.jsx";
import { MonthSelector } from "./components/MonthSelector.jsx";

function GestionTurnos() {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [departments, setDepartments] = useState([]);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [totalTurnos, setTotalTurnos] = useState(0);
    const [turnosRestantes, setTurnosRestantes] = useState(0);
    const [turnosPorDia, setTurnosPorDia] = useState(0);

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
        <div className="p-3">
            <h5 className="fw-bold mb-3">Gestión de Turnos Mensuales</h5>

            <Row>
                {/* Panel lateral */}
                <Col md={4}>
                    <div className="bg-light p-3 rounded-3 shadow-sm mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <div className="fw-semibold">Estado mes {selectedMonth + 1}/{selectedYear}:</div>
                                <Badge bg={isMonthOpen ? "success" : "danger"} className="mt-1">
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
                                    className="rounded-pill"
                                >
                                    {isMonthOpen ? "Cerrar" : "Abrir"}
                                </Button>
                            </OverlayTrigger>
                        </div>

                        <MonthSelector
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            setSelectedMonth={setSelectedMonth}
                            setSelectedYear={setSelectedYear}
                        />

                        <hr />

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Turnos diarios</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                value={turnosPorDia}
                                onChange={(e) => setTurnosPorDia(Number(e.target.value))}
                            />
                        </Form.Group>

                        <div className="mt-3">
                            <div><strong>Total turnos:</strong> {totalTurnos}</div>
                            <div><strong>Cubiertos:</strong> {totalTurnos - turnosRestantes}</div>
                            <div><strong>Restantes:</strong> {turnosRestantes}</div>
                            <ProgressBar now={porcentajeCubierto} className="mt-2" label={`${porcentajeCubierto}%`} />
                        </div>
                    </div>
                </Col>

                {/* Panel principal */}
                <Col md={8}>
                    <DepartmentManagement
                        departments={departments}
                        setDepartments={setDepartments}
                    />

                    <div className="d-flex justify-content-end mt-3">
                        <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip>Guardar asignación de unidades colaboradoras</Tooltip>}
                        >
                            <Button
                                variant="primary"
                                className="rounded-pill px-4"
                                onClick={handleSaveUnidadColaboradora}
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