import React, { useEffect, useState } from "react";
import { Row, Col, Card, Alert, ListGroup, Spinner, Button, Table, Form } from "react-bootstrap";
import Select from "react-select";
import { listarCalendarios } from "../../api/calendarApi.js";
import { getAportesPorCalendario } from "../../api/aporteApi.js";
import { listarFuncionariosAportadosPaginado } from "../../api/diasNoDisponiblesGlobalesApi.js";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import { agregarFuncionarioAportado } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// =============== Componente Panel ===============

export default function PanelAdministracionAportes() {
    const { user } = useAuth();

    // Calendario y unidades
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [calendarioOptions, setCalendarioOptions] = useState([]);
    const [loadingCalendarios, setLoadingCalendarios] = useState(true);
    const [unidadesAporte, setUnidadesAporte] = useState([]);
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const [loadingUnidades, setLoadingUnidades] = useState(false);

    // Lista funcionarios aportados
    const [funcionarios, setFuncionarios] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
    const [error, setError] = useState(null);

    // Agregar funcionario
    const [nuevoFuncionario, setNuevoFuncionario] = useState(null);
    const [seleccion, setSeleccion] = useState({ from: undefined, to: undefined });
    const [motivo, setMotivo] = useState("");
    const [detalle, setDetalle] = useState("");
    const [bloques, setBloques] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errorAgregar, setErrorAgregar] = useState(null);
    const [sinDiasNoDisponibles, setSinDiasNoDisponibles] = useState(false);

    // Motivos
    const MOTIVOS = [
        "Feriado legal",
        "Licencia médica",
        "Permiso Administrativo",
        "Cometido funcionario",
        "Permiso parental",
        "Otro"
    ];

    // --- Cargar calendarios al inicio ---
    useEffect(() => {
        listarCalendarios()
            .then(todos => {
                setCalendarioOptions(
                    todos.map(c => ({
                        value: c.id,
                        label: c.nombre,
                        calendario: c
                    }))
                );
                setLoadingCalendarios(false);
            });
    }, []);

    // --- Cargar unidades al seleccionar calendario ---
    useEffect(() => {
        if (calendarioSeleccionado?.value) {
            setLoadingUnidades(true);
            getAportesPorCalendario(calendarioSeleccionado.value)
                .then(res => {
                    setUnidadesAporte(res);
                    setUnidadSeleccionada(null); // Reset unidad
                })
                .finally(() => setLoadingUnidades(false));
        } else {
            setUnidadesAporte([]);
            setUnidadSeleccionada(null);
        }
    }, [calendarioSeleccionado]);

    // --- Cargar funcionarios aportados al seleccionar calendario y unidad ---
    const cargarFuncionarios = (paginaSolicitada = 0) => {
        if (!calendarioSeleccionado?.value || !unidadSeleccionada?.idUnidad) {
            setFuncionarios([]);
            setTotalPaginas(1);
            setPagina(0);
            return;
        }
        setLoadingFuncionarios(true);
        listarFuncionariosAportadosPaginado(calendarioSeleccionado.value, unidadSeleccionada.idUnidad, paginaSolicitada)
            .then(data => {
                setFuncionarios(data.content);
                setPagina(data.number);
                setTotalPaginas(data.totalPages);
                setLoadingFuncionarios(false);
            })
            .catch(() => {
                setError("Error al cargar funcionarios");
                setLoadingFuncionarios(false);
            });
    };

    useEffect(() => {
        cargarFuncionarios(0);
        // eslint-disable-next-line
    }, [calendarioSeleccionado, unidadSeleccionada]);

    // --- Acciones tabla ---
    const handleEliminar = (id) => {
        /*if (!window.confirm("¿Seguro que deseas quitar este funcionario del aporte?")) return;
        setLoadingFuncionarios(true);
        eliminarFuncionarioAportado(id, user.idFuncionario)
            .then(() => cargarFuncionarios(pagina))
            .catch(() => {
                setError("No se pudo eliminar");
                setLoadingFuncionarios(false);
            });*/
    };

    // --- Agregar funcionario ---
    const limpiarSeleccion = () => {
        setSeleccion({ from: undefined, to: undefined });
        setMotivo("");
        setDetalle("");
    };

    const handleAgregarBloque = () => {
        if (!seleccion.from || !motivo) {
            setErrorAgregar("Debes seleccionar fechas y motivo");
            return;
        }
        const fechas = [];
        let date = new Date(seleccion.from);
        const to = seleccion.to || seleccion.from;
        while (date <= to) {
            fechas.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        setBloques(prev => [
            ...prev,
            {
                dias: fechas,
                motivo,
                detalle: motivo === "Otro" ? detalle : ""
            }
        ]);
        limpiarSeleccion();
        setErrorAgregar(null);
    };

    const handleQuitarBloque = (idx) => {
        setBloques(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAgregarFuncionario = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrorAgregar(null);

        if (!nuevoFuncionario) {
            setErrorAgregar("Debes seleccionar un funcionario.");
            setGuardando(false);
            return;
        }
        if (!unidadSeleccionada?.idUnidad || !calendarioSeleccionado?.value) {
            setErrorAgregar("Faltan datos del calendario o unidad.");
            setGuardando(false);
            return;
        }
        if (bloques.length === 0 && !sinDiasNoDisponibles) {
            setErrorAgregar("Debes agregar al menos un grupo de días no disponibles.");
            setGuardando(false);
            return;
        }

        const diasNoDisponibles = sinDiasNoDisponibles ? [] : bloques.flatMap(b =>
            b.dias.map(d => ({
                fecha: d.toISOString().slice(0, 10),
                motivo: b.motivo,
                detalle: b.detalle
            }))
        );

        const dto = {
            idCalendario: calendarioSeleccionado.value,
            idUnidad: unidadSeleccionada.idUnidad,
            idFuncionario: parseInt(nuevoFuncionario.value, 10),
            nombreCompleto: nuevoFuncionario.f.nombreCompleto,
            grado: nuevoFuncionario.f.siglasCargo || "",
            antiguedad: nuevoFuncionario.f.antiguedad || 0,
            diasNoDisponibles
        };

        try {
            await agregarFuncionarioAportado(dto, user.idFuncionario);
            setNuevoFuncionario(null);
            setBloques([]);
            setErrorAgregar(null);
            setSinDiasNoDisponibles(false);
            cargarFuncionarios(0);
        } catch (e) {
            setErrorAgregar(
                e?.response?.data?.message ||
                e.message ||
                "Error al guardar funcionario"
            );
        } finally {
            setGuardando(false);
        }
    };

    // Helper: resumen fechas seleccionadas
    const getResumenSeleccion = () => {
        if (!seleccion.from) return "No hay fechas";
        if (!seleccion.to) return seleccion.from.toLocaleDateString("es-CL");
        const fechas = [];
        let date = new Date(seleccion.from);
        while (date <= seleccion.to) {
            fechas.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return fechas.map(d => d.toLocaleDateString("es-CL")).join(", ");
    };

    const seleccionCompleta = !!(calendarioSeleccionado && unidadSeleccionada);

    // ========== Render ==========
    return (
        <div className="container py-4">
            <h2 className="mb-4">Administrar Aportes por Unidad y Calendario</h2>
            <Card className="mb-4 p-3">
                <Row className="mb-4">
                    <Col md={6}>
                        <label className="fw-bold mb-1">Calendario</label>
                        <Select
                            isLoading={loadingCalendarios}
                            options={calendarioOptions}
                            value={calendarioSeleccionado}
                            onChange={setCalendarioSeleccionado}
                            placeholder="Seleccionar calendario..."
                            isClearable
                        />
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={12}>
                        <label className="fw-bold mb-1">Unidades que deben aportar</label>
                        {loadingUnidades ? (
                            <Spinner size="sm" />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "1rem",
                                    marginBottom: "1rem"
                                }}
                            >
                                {unidadesAporte.map(unidad => (
                                    <Card
                                        key={unidad.idUnidad}
                                        onClick={() => setUnidadSeleccionada(unidad)}
                                        border={unidadSeleccionada?.idUnidad === unidad.idUnidad ? "primary" : "light"}
                                        style={{
                                            cursor: "pointer",
                                            boxShadow: unidadSeleccionada?.idUnidad === unidad.idUnidad
                                                ? "0 0 0 4px #0d6efd55"
                                                : "0 2px 3px rgba(0,0,0,.04)"
                                        }}
                                        className={unidadSeleccionada?.idUnidad === unidad.idUnidad ? "border-primary" : ""}
                                    >
                                        <Card.Body>
                                            <Card.Title style={{ fontSize: "1.1rem" }}>
                                                <b>{unidad.siglasUnidad}</b>
                                            </Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: ".97rem" }}>
                                                {unidad.nombreUnidad}
                                            </Card.Subtitle>
                                            <div style={{ fontSize: ".9rem", color: "#888" }}>
                                                Aporta: {unidad.cantidadFuncionarios}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                                {unidadesAporte.length === 0 &&
                                    <div className="text-muted" style={{ gridColumn: "1/-1" }}>
                                        No hay unidades configuradas para este calendario.
                                    </div>
                                }
                            </div>

                        )}
                    </Col>
                </Row>
            </Card>

            {!seleccionCompleta && (
                <Alert variant="info">
                    Selecciona un calendario y una unidad para administrar los funcionarios aportados.
                </Alert>
            )}

            {seleccionCompleta && (
                <Row>
                    {/* Columna formulario agregar */}
                    <Col md={6}>
                        <Card className="p-3 h-100">
                            <h5>Agregar funcionario</h5>
                            {errorAgregar && <Alert variant="danger">{errorAgregar}</Alert>}
                            <Form onSubmit={handleAgregarFuncionario}>
                                <Form.Group className="mb-3">
                                    <AsyncFuncionarioSelect
                                        value={nuevoFuncionario}
                                        onChange={setNuevoFuncionario}
                                        user={user}
                                    />
                                </Form.Group>
                                <Form.Check
                                    type="checkbox"
                                    id="sin-dias-no-disponibles"
                                    label="Funcionario NO tiene días no disponibles"
                                    checked={sinDiasNoDisponibles}
                                    onChange={e => setSinDiasNoDisponibles(e.target.checked)}
                                    className="mb-2"
                                />
                                {!sinDiasNoDisponibles && (
                                    <>
                                        <Row>
                                            <Col md={12}>
                                                <Form.Label>Selecciona un rango o un día:</Form.Label>
                                                <DayPicker
                                                    mode="range"
                                                    selected={seleccion}
                                                    onSelect={setSeleccion}
                                                    fromMonth={new Date(
                                                        calendarioSeleccionado.calendario.anio,
                                                        calendarioSeleccionado.calendario.mes - 1,
                                                        1
                                                    )}
                                                    toMonth={new Date(
                                                        calendarioSeleccionado.calendario.anio,
                                                        calendarioSeleccionado.calendario.mes - 1,
                                                        31
                                                    )}
                                                    month={new Date(
                                                        calendarioSeleccionado.calendario.anio,
                                                        calendarioSeleccionado.calendario.mes - 1
                                                    )}
                                                />
                                                {(seleccion.from || seleccion.to) && (
                                                    <Alert variant="info" className="mt-2 py-1">
                                                        <b>Fechas seleccionadas:</b> {getResumenSeleccion()}
                                                    </Alert>
                                                )}
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={8}>
                                                <Form.Select
                                                    value={motivo}
                                                    onChange={e => setMotivo(e.target.value)}
                                                >
                                                    <option value="">Seleccione motivo</option>
                                                    {MOTIVOS.map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </Form.Select>
                                            </Col>
                                            <Col md={4}>
                                                <Button
                                                    variant="primary"
                                                    className="w-100"
                                                    onClick={handleAgregarBloque}
                                                    disabled={!seleccion.from || !motivo}
                                                    type="button"
                                                >
                                                    Agregar día no disponible
                                                </Button>
                                            </Col>
                                        </Row>
                                        {motivo === "Otro" && (
                                            <Form.Control
                                                type="text"
                                                className="mt-2"
                                                value={detalle}
                                                onChange={e => setDetalle(e.target.value)}
                                                placeholder="Especificar motivo"
                                                required
                                            />
                                        )}
                                        {bloques.length > 0 && (
                                            <div className="mt-2">
                                                <h6>Días no disponibles agregados:</h6>
                                                <Table bordered size="sm" className="mb-0">
                                                    <thead>
                                                    <tr>
                                                        <th>Fechas</th>
                                                        <th>Motivo</th>
                                                        <th>Detalle</th>
                                                        <th>Quitar</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {bloques.map((b, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                {b.dias.map(d =>
                                                                    <span className="badge bg-secondary me-1" key={d.toISOString()}>
                                                                        {d.toLocaleDateString("es-CL")}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>{b.motivo}</td>
                                                            <td>{b.detalle}</td>
                                                            <td>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => handleQuitarBloque(idx)}
                                                                >
                                                                    Quitar
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="mt-3">
                                    <Button
                                        variant="success"
                                        type="submit"
                                        disabled={
                                            guardando ||
                                            !nuevoFuncionario ||
                                            !unidadSeleccionada?.idUnidad ||
                                            !calendarioSeleccionado?.value ||
                                            (bloques.length === 0 && !sinDiasNoDisponibles)
                                        }
                                        style={{ minWidth: 120 }}
                                    >
                                        {guardando ? "Guardando..." : "Agregar funcionario"}
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </Col>
                    {/* Columna tabla funcionarios */}
                    <Col md={6}>
                        <Card className="p-3 h-100">
                            <h5>Funcionarios agregados</h5>
                            {loadingFuncionarios && <Spinner />}
                            {error && <Alert variant="danger">{error}</Alert>}
                            {!loadingFuncionarios && (
                                <>
                                    {funcionarios.length === 0 ? (
                                        <Alert variant="info">No hay funcionarios aportados todavía.</Alert>
                                    ) : (
                                        <>
                                            <Table striped bordered>
                                                <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Acción</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {funcionarios.map(f => (
                                                    <tr key={f.id}>
                                                        <td>{f.nombreCompleto}</td>
                                                        <td>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleEliminar(f.id)}
                                                            >
                                                                Quitar
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => cargarFuncionarios(pagina - 1)}
                                                    disabled={pagina === 0}
                                                >
                                                    Anterior
                                                </Button>
                                                <span>Página {pagina + 1} de {totalPaginas}</span>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => cargarFuncionarios(pagina + 1)}
                                                    disabled={pagina + 1 >= totalPaginas}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
}