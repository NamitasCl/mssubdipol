import React, { useState } from "react";
import { Modal, Button, Form, Alert, Row, Col, Table } from "react-bootstrap";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import { agregarFuncionarioAportado } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

const MOTIVOS = [
    "Feriado legal",
    "Licencia médica",
    "Permiso Administrativo",
    "Cometido funcionario",
    "Permiso parental",
    "Otro"
];

export default function IngresoFuncionarioConDiasNoDisponibles({ show, onHide, calendario, aporte, onGuardado }) {
    const { user } = useAuth();
    const esAdmin = user?.roles?.includes("ROLE_ADMINISTRADOR");

    const [nuevoFuncionario, setNuevoFuncionario] = useState(null);
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

    const [seleccion, setSeleccion] = useState({ from: undefined, to: undefined });
    const [motivo, setMotivo] = useState("");
    const [detalle, setDetalle] = useState("");
    const [bloques, setBloques] = useState([]);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    const [faltanDias, setFaltanDias] = useState(false);

    const [sinDiasNoDisponibles, setSinDiasNoDisponibles] = useState(false);

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

    const limpiarSeleccion = () => {
        setSeleccion({ from: undefined, to: undefined });
        setMotivo("");
        setDetalle("");
        setFaltanDias(false);
    };

    const handleAgregarBloque = () => {
        if (!seleccion.from || !motivo) {
            setFaltanDias(true);
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
    };

    const handleQuitarBloque = (idx) => {
        setBloques(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAgregar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        if (!nuevoFuncionario) {
            setError("Debes seleccionar un funcionario.");
            setGuardando(false);
            return;
        }

        // Determina la unidad según el rol
        const idUnidad = esAdmin
            ? unidadSeleccionada?.value
            : aporte?.idUnidad;

        if (!idUnidad || !calendario?.id) {
            setError("Faltan datos del calendario o unidad.");
            setGuardando(false);
            return;
        }
        if (bloques.length === 0 && !sinDiasNoDisponibles) {
            setError("Debes agregar al menos un grupo de días no disponibles (haz clic en 'Agregar' luego de seleccionar fechas y motivo).");
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

        if (diasNoDisponibles.length === 0 && !sinDiasNoDisponibles) {
            setError("No se agregaron días válidos. Por favor, revisa los bloques de días.");
            setGuardando(false);
            return;
        }

        const dto = {
            idCalendario: calendario.id,
            idUnidad,
            idFuncionario: parseInt(nuevoFuncionario.value, 10),
            nombreCompleto: nuevoFuncionario.f.nombreCompleto,
            grado: nuevoFuncionario.f.siglasCargo || "",
            antiguedad: nuevoFuncionario.f.antiguedad || 0,
            siglasUnidad: nuevoFuncionario.f.siglasUnidad || "",
            diasNoDisponibles
        };

        try {
            await agregarFuncionarioAportado(dto, user.idFuncionario);
            setNuevoFuncionario(null);
            setBloques([]);
            setUnidadSeleccionada(null);
            setError(null);
            setFaltanDias(false);
            if (onGuardado) onGuardado();
            if (onHide) onHide();
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                e.message ||
                "Error al guardar funcionario"
            );
        } finally {
            setGuardando(false);
        }
    };

    const disableSubmit =
        guardando ||
        !nuevoFuncionario ||
        !calendario?.id ||
        ((esAdmin && !unidadSeleccionada) || (!esAdmin && !aporte?.idUnidad)) ||
        (bloques.length === 0 && !sinDiasNoDisponibles);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Agregar Funcionario
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleAgregar}>
                    <Row className="mb-3">
                        <Col md={8}>
                            <AsyncFuncionarioSelect
                                value={nuevoFuncionario}
                                onChange={setNuevoFuncionario}
                                user={user}
                            />
                        </Col>
                        <Col>
                            <Button
                                variant="success"
                                type="submit"
                                disabled={disableSubmit}
                                style={{ minWidth: 120 }}
                            >
                                {guardando ? "Guardando..." : "Agregar funcionario"}
                            </Button>
                        </Col>
                        <Col className="mt-2">
                            <Form.Check
                                type="checkbox"
                                id="sin-dias-no-disponibles"
                                label="Funcionario NO tiene días no disponibles"
                                checked={sinDiasNoDisponibles}
                                onChange={e => setSinDiasNoDisponibles(e.target.checked)}
                                className="mb-2"
                            />
                            {esAdmin && (
                                <Col md={8}>
                                    <AsyncUnidadesSelect
                                        value={unidadSeleccionada}
                                        onChange={setUnidadSeleccionada}
                                        user={user}
                                    />
                                </Col>
                            )}
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <div className="mb-2">
                                <Form.Label>Selecciona un rango o un día:</Form.Label>
                                <DayPicker
                                    mode="range"
                                    selected={seleccion}
                                    onSelect={setSeleccion}
                                    fromMonth={new Date(calendario.anio, calendario.mes - 1, 1)}
                                    toMonth={new Date(calendario.anio, calendario.mes - 1, 31)}
                                    month={new Date(calendario.anio, calendario.mes - 1)}
                                />
                                {(seleccion.from || seleccion.to) && (
                                    <Alert variant="info" className="mt-2 py-1">
                                        <b>Fechas seleccionadas:</b> {getResumenSeleccion()}
                                    </Alert>
                                )}
                                {faltanDias && (
                                    <Alert variant="warning" className="mt-2 py-1">
                                        Selecciona fechas y motivo, luego haz clic en "Agregar" para sumarlas.
                                    </Alert>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <Form.Label>Motivo</Form.Label>
                                <Form.Select
                                    value={motivo}
                                    onChange={e => setMotivo(e.target.value)}
                                >
                                    <option value="">Seleccione motivo</option>
                                    {MOTIVOS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </Form.Select>
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
                                <Button
                                    variant="primary"
                                    className="mt-3"
                                    onClick={handleAgregarBloque}
                                    disabled={!seleccion.from || !motivo}
                                    size="sm"
                                    style={{ width: "100%" }}
                                    type="button"
                                >
                                    Agregar día no disponible
                                </Button>
                            </div>
                            {bloques.length > 0 && (
                                <div>
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
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={guardando}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}