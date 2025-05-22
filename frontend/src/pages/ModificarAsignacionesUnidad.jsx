import React, { useEffect, useState, useMemo } from "react";
import { Card, Button, Spinner, Form, Row, Col, Alert, Modal, Table, Badge } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import axios from "axios";
import debounce from "lodash.debounce";
import { useAuth } from "../AuthContext.jsx";

function ModificarAsignacionesUnidad() {
    const { user } = useAuth();
    const unidadUsuario = user?.siglasUnidad || "";
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [asignaciones, setAsignaciones] = useState([]);
    const [funcionariosUnidad, setFuncionariosUnidad] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Calendario/Modal states
    const [selectedDia, setSelectedDia] = useState(null); // Día seleccionado para abrir modal
    const [turnosDia, setTurnosDia] = useState([]);       // Turnos del día seleccionado
    const [showTurnosModal, setShowTurnosModal] = useState(false);

    // Modal de cambio individual
    const [showCambioModal, setShowCambioModal] = useState(false);
    const [modalTipo, setModalTipo] = useState(""); // "servicio" o "normal"
    const [turnoIndex, setTurnoIndex] = useState(null);
    const [modalValue, setModalValue] = useState(null);

    const mesesDelAnio = useMemo(() => [
        { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
        { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" }
    ], []);

    // ---------------- Cargar asignaciones y funcionarios ya asignados ----------------
    useEffect(() => {
        if (!unidadUsuario) return;
        setAsignaciones([]);
        setLoading(true);
        setError(null);

        Promise.all([
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/mes`, {
                params: { mes, anio }
            }),
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/consultar`, {
                params: { mes, anio, unidad: unidadUsuario }
            }),
        ])
            .then(([resp1, resp2]) => {
                try {
                    const dataAsignaciones = Array.isArray(resp1.data) ? resp1.data : [];
                    const asignacionesConInfo = [];
                    dataAsignaciones.forEach((dia) => {
                        if (Array.isArray(dia.asignaciones)) {
                            dia.asignaciones
                                .filter((a) => (a.unidad || a.siglasUnidad) === unidadUsuario)
                                .forEach((a) => {
                                    asignacionesConInfo.push({
                                        dia: dia.dia,
                                        diaSemana: dia.diaSemana,
                                        nombreTurno: a.nombreTurno,
                                        funcionarioOriginal: {
                                            ...a,
                                            grado: a.grado || a.siglasCargo || "",
                                        },
                                        funcionarioNuevo: null,
                                    });
                                });
                        }
                    });
                    setAsignaciones(asignacionesConInfo);
                    setFuncionariosUnidad(Array.isArray(resp2.data) ? resp2.data : []);
                } catch (e) {
                    console.error("Error procesando asignaciones:", e);
                    setError("Error procesando los datos de turnos.");
                }
            })
            .catch((err) => {
                console.error("Error al cargar asignaciones", err);
                setError("Error al cargar asignaciones. Verifique la conexión o los parámetros.");
            })
            .finally(() => setLoading(false));
    }, [mes, anio, unidadUsuario]);

    // --------- Buscar funcionarios disponibles para "servicio" (todas unidades) -----
    const buscarFuncionariosDisponibles = debounce((inputValue, callback) => {
        if (inputValue.length < 3) return callback([]);
        axios.get(`${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/porunidad`, {
            params: { unidad: unidadUsuario, term: inputValue },
        })
            .then((res) => {
                const results = Array.isArray(res.data) ? res.data : [];
                callback(
                    results.map((f) => ({
                        value: f.idFun, // este es el identificador de funcionario
                        label: `${f.siglasCargo} ${f.nombreFun} ${f.apellidoPaternoFun} ${f.apellidoMaternoFun}`,
                        grado: f.siglasCargo,
                        nombreCompleto: `${f.nombreFun} ${f.apellidoPaternoFun} ${f.apellidoMaternoFun}`,
                        unidad: f.siglasUnidad || f.unidad,
                    }))
                );
            })
            .catch(() => callback([]));
    }, 350);

    // -------- Opciones solo para la unidad del usuario (para cambio "normal") -------
    const opcionesUnidad = useMemo(() => funcionariosUnidad.map((f) => ({
        value: f.idFuncionario || f.id,
        label: (f.grado ? `${f.grado} ` : "") + f.nombreCompleto,
        grado: f.grado,
        nombreCompleto: f.nombreCompleto,
        unidad: f.siglasUnidad || f.unidad,
    })), [funcionariosUnidad]);

    // ------- Calendario helpers -------
    const daysInMonth = useMemo(() => new Date(anio, mes, 0).getDate(), [anio, mes]);
    const firstDayWeek = useMemo(() => new Date(anio, mes - 1, 1).getDay(), [anio, mes]);
    const calendarRows = useMemo(() => {
        const rows = [];
        let cells = [];
        let day = 1;
        // Ajuste para que domingo sea 7 (último), lunes=1 (inicio semana)
        const realFirstDay = firstDayWeek === 0 ? 7 : firstDayWeek;
        for (let i = 1; i < realFirstDay; i++) {
            cells.push(null); // Días en blanco antes del 1
        }
        while (day <= daysInMonth) {
            cells.push(day);
            if (cells.length === 7) {
                rows.push(cells);
                cells = [];
            }
            day++;
        }
        while (cells.length < 7) cells.push(null); // completa la última fila
        if (cells.some(c => c !== null)) rows.push(cells);
        return rows;
    }, [anio, mes, daysInMonth, firstDayWeek]);

    // ------ Modal: al seleccionar un día del calendario ------
    const handleDiaClick = (dia) => {
        const turnos = asignaciones.filter(a => a.dia === dia);
        setSelectedDia(dia);
        setTurnosDia(turnos);
        setShowTurnosModal(true);
    };

    // ------ Modal de cambio de funcionario (individual) ------
    const handleShowCambioModal = (index) => {
        setModalTipo("");
        setTurnoIndex(index);
        setModalValue(null);
        setShowCambioModal(true);
    };

    const handleModalTipo = (tipo) => {
        setModalTipo(tipo);
        setModalValue(null);
    };

    const handleModalSelect = (nuevo) => {
        setModalValue(nuevo);
    };

    const handleConfirmarCambio = () => {
        if (modalValue && turnoIndex !== null) {
            // Hay que actualizar la asignación en el array global!
            const diaGlobalIdx = asignaciones.findIndex(
                a =>
                    a.dia === turnosDia[turnoIndex].dia &&
                    a.nombreTurno === turnosDia[turnoIndex].nombreTurno &&
                    a.funcionarioOriginal.idFuncionario === turnosDia[turnoIndex].funcionarioOriginal.idFuncionario
            );
            if (diaGlobalIdx !== -1) {
                const actual = [...asignaciones];
                actual[diaGlobalIdx].funcionarioNuevo = modalValue;
                setAsignaciones(actual);

                // Refresca turnos del día en el modal para mostrar el cambio
                const updatedTurnos = [...turnosDia];
                updatedTurnos[turnoIndex].funcionarioNuevo = modalValue;
                setTurnosDia(updatedTurnos);
            }
        }
        setShowCambioModal(false);
        setModalTipo("");
        setTurnoIndex(null);
        setModalValue(null);
    };

    // -------------------------- Guardar los cambios ---------------------------------
    const handleGuardarCambios = async () => {
        const cambios = asignaciones
            .filter(a => a.funcionarioNuevo && a.funcionarioNuevo.value !== null)
            .map(a => ({
                dia: a.dia,
                mes: mes,
                anio: anio,
                diaSemana: a.diaSemana,
                nombreTurno: a.nombreTurno,
                funcionarioNuevo: {
                    label: a.funcionarioNuevo.nombreCompleto,
                    value: a.funcionarioNuevo.value,
                    unidad: a.funcionarioNuevo.unidad
                },
                funcionarioOriginal: {
                    antiguedad: a.funcionarioOriginal.antiguedad,
                    idFuncionario: a.funcionarioOriginal.idFuncionario,
                    nombreCompleto: a.funcionarioOriginal.nombreCompleto,
                    nombreTurno: a.funcionarioOriginal.nombreTurno,
                    siglasCargo: a.funcionarioOriginal.siglasCargo,
                    unidad: a.funcionarioOriginal.unidad
                }
            }));

        if (cambios.length === 0) {
            alert("No hay cambios para guardar. Seleccione un reemplazo para al menos un turno.");
            return;
        }

        setLoading(true);

        try {
            await axios.put(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/actualizar-turno-unidad`, {
                actualizaciones: cambios
            });
            alert("Cambios guardados exitosamente.");
            window.location.reload();
        } catch (error) {
            alert(`Error al guardar los cambios: ${error.response?.data?.message || error.message}`);
            setError("No se pudieron guardar los cambios. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    // --------------- Estilos para react-select --------------------------------------
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            borderColor: '#adb5bd',
            borderRadius: 6,
            fontSize: '1rem',
            minHeight: 36,
            boxShadow: 'none',
            padding: 0
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '1rem',
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 10,
            paddingRight: 10,
        }),
        singleValue: (provided) => ({
            ...provided,
            fontSize: '1rem',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#6c757d',
            fontSize: '1rem',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 12,
        }),
    };

    // ------------------ Modals ----------------------

    const infoRestricciones = (
        <Alert variant="info" className="mt-3 mb-2">
            <strong>Restricciones:</strong>
            <ul className="mb-0" style={{ fontSize: 15 }}>
                <li>El "Cambio de funcionario por razones de mejor servicio" permite buscar cualquier funcionario disponible.</li>
                <li>El "Cambio normal de funcionario" solo permite seleccionar funcionarios de la unidad.</li>
                <li>No se permite el cambio si el funcionario reemplazante no cumple con los requisitos de la función asignada.</li>
            </ul>
        </Alert>
    );

    // Modal de todos los turnos de un día
    const renderTurnosModal = (
        <Modal show={showTurnosModal} onHide={() => setShowTurnosModal(false)} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Turnos asignados el día {selectedDia} de {mesesDelAnio.find(m => m.value === mes)?.label} {anio}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {turnosDia.length === 0 && <Alert variant="info">No hay turnos para este día.</Alert>}
                {turnosDia.length > 0 && (
                    <Table striped bordered hover size="sm" style={{ background: "#fff" }}>
                        <thead className="table-light">
                        <tr>
                            <th>Turno</th>
                            <th>Funcionario original</th>
                            <th>Nuevo funcionario</th>
                            <th>Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {turnosDia.map((asig, idx) => (
                            <tr key={asig.funcionarioOriginal.idAsignacion || idx}>
                                <td>{asig.nombreTurno}</td>
                                <td>
                                    {(asig.funcionarioOriginal.grado ? asig.funcionarioOriginal.grado + " " : "")}
                                    {asig.funcionarioOriginal.nombreCompleto}
                                </td>
                                <td>
                                    {asig.funcionarioNuevo ? (
                                        <Badge bg="success">{asig.funcionarioNuevo.label}</Badge>
                                    ) : (
                                        <span className="text-muted">Sin cambio</span>
                                    )}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleShowCambioModal(idx)}
                                    >
                                        Modificar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );

    // Modal de cambio de funcionario individual (NO incluye datos de día/turno en el título)
    const renderCambioModal = (
        <Modal show={showCambioModal} onHide={() => setShowCambioModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Cambiar funcionario asignado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column gap-3 mb-3">
                    <Button
                        variant={modalTipo === "servicio" ? "primary" : "outline-primary"}
                        size="lg"
                        className="w-100"
                        onClick={() => handleModalTipo("servicio")}
                    >
                        Cambio de funcionario por razones de mejor servicio
                    </Button>
                    <Button
                        variant={modalTipo === "normal" ? "success" : "outline-success"}
                        size="lg"
                        className="w-100"
                        onClick={() => handleModalTipo("normal")}
                    >
                        Cambio normal de funcionario
                    </Button>
                </div>
                {modalTipo === "servicio" && (
                    <div className="mt-3">
                        <Form.Label>Seleccionar funcionario disponible:</Form.Label>
                        <AsyncSelect
                            inputId="select-cambio-servicio"
                            placeholder="Buscar funcionario..."
                            cacheOptions
                            loadOptions={buscarFuncionariosDisponibles}
                            onChange={handleModalSelect}
                            value={modalValue}
                            isClearable
                            styles={customSelectStyles}
                            noOptionsMessage={({ inputValue }) =>
                                inputValue.length < 3 ? "Escriba al menos 3 caracteres para buscar..." : "No se encontraron funcionarios"
                            }
                        />
                    </div>
                )}
                {modalTipo === "normal" && (
                    <div className="mt-3">
                        <Form.Label>Seleccionar funcionario de la unidad:</Form.Label>
                        <AsyncSelect
                            inputId="select-cambio-normal"
                            placeholder="Buscar funcionario..."
                            cacheOptions
                            defaultOptions={opcionesUnidad}
                            loadOptions={(input, cb) => cb(opcionesUnidad.filter(opt => opt.label.toLowerCase().includes(input.toLowerCase())))}
                            onChange={handleModalSelect}
                            value={modalValue}
                            isClearable
                            styles={customSelectStyles}
                            noOptionsMessage={() => "No hay funcionarios disponibles"}
                        />
                    </div>
                )}
                {infoRestricciones}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowCambioModal(false)}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirmarCambio}
                    disabled={!modalTipo || !modalValue}
                >
                    Confirmar cambio
                </Button>
            </Modal.Footer>
        </Modal>
    );

    // -------- Render principal --------
    return (
        <Card className="mt-4 border" style={{ maxWidth: 1100, margin: "auto" }}>
            <Card.Header as="h5" className="py-2 bg-secondary text-white border-bottom">
                <i className="bi bi-calendar2-week me-2" />
                Modificar Turnos Asignados — <span className="fw-bold">{unidadUsuario}</span>
            </Card.Header>
            <Card.Body className="px-3 pb-4 bg-white">
                <Form>
                    <Row className="mb-3 align-items-end">
                        <Col md={5} sm={6} className="mb-2 mb-md-0">
                            <Form.Group controlId="selectMes">
                                <Form.Label className="fw-normal mb-1">Mes</Form.Label>
                                <Form.Select value={mes} onChange={(e) => setMes(Number(e.target.value))} disabled={loading}>
                                    {mesesDelAnio.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={5} sm={6} className="mb-2 mb-md-0">
                            <Form.Group controlId="inputAnio">
                                <Form.Label className="fw-normal mb-1">Año</Form.Label>
                                <Form.Control type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} disabled={loading} placeholder="Ej: 2024"/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>

                {loading && (
                    <div className="text-center my-4">
                        <Spinner animation="border" variant="secondary" style={{ width: '2.5rem', height: '2.5rem' }} />
                        <div className="mt-2 text-muted">Cargando asignaciones...</div>
                    </div>
                )}

                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                {!loading && !error && (
                    <div>
                        <div className="mb-3 text-muted fw-semibold" style={{fontSize: "1.1rem"}}>
                            Haz clic en el número del día para ver y modificar los turnos de esa fecha.
                        </div>
                        {/* CALENDARIO */}
                        <Table bordered responsive style={{ maxWidth: 900, background: "#fff", margin: "auto" }}>
                            <thead>
                            <tr>
                                <th>Lun</th>
                                <th>Mar</th>
                                <th>Mié</th>
                                <th>Jue</th>
                                <th>Vie</th>
                                <th>Sáb</th>
                                <th>Dom</th>
                            </tr>
                            </thead>
                            <tbody>
                            {calendarRows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((day, j) => (
                                        <td key={j} className="p-2" style={{height: 80, verticalAlign: "top"}}>
                                            {day ? (
                                                <div>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        style={{ borderRadius: 50, width: 34, height: 34, fontWeight: 600 }}
                                                        onClick={() => handleDiaClick(day)}
                                                    >
                                                        {day}
                                                    </Button>
                                                    {/* Muestra cantidad de turnos para ese día */}
                                                    <div className="mt-1" style={{ fontSize: 13 }}>
                                                        {asignaciones.filter(a => a.dia === day).length > 0 ? (
                                                            <span className="text-success">
                                                                    {asignaciones.filter(a => a.dia === day).length} turnos
                                                                </span>
                                                        ) : (
                                                            <span className="text-muted">Sin turnos</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {/* Guardar Cambios */}
                {!loading && asignaciones.length > 0 && (
                    <div className="mt-3 pt-2 border-top text-end">
                        <Button
                            variant="secondary"
                            onClick={handleGuardarCambios}
                            disabled={loading || !asignaciones.some(a => a.funcionarioNuevo && a.funcionarioNuevo.value !== null)}
                            style={{
                                borderRadius: 7,
                                fontWeight: 500,
                                fontSize: "1rem",
                                paddingLeft: 26,
                                paddingRight: 26
                            }}
                        >
                            <i className="bi bi-save me-2"></i>
                            Guardar Cambios
                        </Button>
                    </div>
                )}

                {renderTurnosModal}
                {renderCambioModal}
            </Card.Body>
        </Card>
    );
}

export default ModificarAsignacionesUnidad;