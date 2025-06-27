import React, { useState } from "react";
import { Modal, Button, Form, Alert, Row, Col, Table } from "react-bootstrap";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import { agregarFuncionarioAportado } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

// Opciones de motivos
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
    const [nuevoFuncionario, setNuevoFuncionario] = useState(null);

    // Selección de fechas actuales
    const [seleccion, setSeleccion] = useState({ from: undefined, to: undefined });
    const [motivo, setMotivo] = useState("");
    const [detalle, setDetalle] = useState("");

    // Lista de bloques de días no disponibles agregados
    const [bloques, setBloques] = useState([]);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    // Muestra resumen de las fechas seleccionadas actualmente
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

    // Limpia la selección de fechas y motivos actuales
    const limpiarSeleccion = () => {
        setSeleccion({ from: undefined, to: undefined });
        setMotivo("");
        setDetalle("");
    };

    // Agrega el bloque actual de fechas + motivo a la lista de bloques
    const handleAgregarBloque = () => {
        if (!seleccion.from || !motivo) return;
        // Genera array de fechas (como objetos Date)
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

    // Quita un bloque (grupo de fechas) de la lista
    const handleQuitarBloque = (idx) => {
        setBloques(prev => prev.filter((_, i) => i !== idx));
    };

    // Envía todos los datos al backend
    const handleAgregar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        if (!nuevoFuncionario) {
            setError("Debes seleccionar un funcionario.");
            setGuardando(false);
            return;
        }
        if (bloques.length === 0) {
            setError("Debes agregar al menos un día no disponible.");
            setGuardando(false);
            return;
        }

        // Construye el array plano de días no disponibles
        const diasNoDisponibles = bloques.flatMap(b =>
            b.dias.map(d => ({
                fecha: d.toISOString().slice(0, 10),
                motivo: b.motivo,
                detalle: b.detalle
            }))
        );

        const dto = {
            idCalendario: calendario.id,
            idUnidad: aporte.idUnidad,
            idFuncionario: nuevoFuncionario.value,
            nombreCompleto: nuevoFuncionario.f.nombreCompleto,
            grado: nuevoFuncionario.f.siglasCargo || "",
            antiguedad: nuevoFuncionario.f.antiguedad || 0,
            diasNoDisponibles
        };

        try {
            await agregarFuncionarioAportado(dto, user.idFuncionario);
            setNuevoFuncionario(null);
            setBloques([]);
            if (onGuardado) onGuardado();
            if (onHide) onHide();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Error al guardar funcionario");
        } finally {
            setGuardando(false);
        }
    };

    // UI
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Agregar Funcionario con Días No Disponibles
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Selector funcionario */}
                <Form onSubmit={handleAgregar}>
                    <Row className="mb-3">
                        <Col md={9}>
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
                                disabled={guardando}
                                style={{ minWidth: 120 }}
                            >
                                {guardando ? "Guardando..." : "Agregar"}
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        {/* Col izquierda: calendario */}
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
                            </div>
                        </Col>
                        {/* Col derecha: motivo, detalle y lista de bloques */}
                        <Col md={6}>
                            {/* Bloque para motivo */}
                            <div className="mb-3">
                                <Form.Label>Motivo</Form.Label>
                                <Form.Select
                                    value={motivo}
                                    onChange={e => setMotivo(e.target.value)}
                                    required
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
                                >
                                    Agregar
                                </Button>
                            </div>

                            {/* Lista de días no disponibles agregados */}
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