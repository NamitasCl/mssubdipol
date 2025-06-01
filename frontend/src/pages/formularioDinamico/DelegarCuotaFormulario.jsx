import React, { useEffect, useState } from "react";
import { Modal, Button, Alert, Form, Row, Col, Table, Spinner, Badge } from "react-bootstrap";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect";
import axios from "axios";
import { useAuth } from "../../AuthContext";

export default function DelegarCuotaFormulario({ show, cuota, formulario, onClose, onDelegado }) {
    const { user } = useAuth();

    // HOOKS VAN ANTES DE CUALQUIER RETURN!!!
    const [tipoDestino, setTipoDestino] = useState("unidad");
    const [destinoObj, setDestinoObj] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [subcuotas, setSubcuotas] = useState([]);
    const [delegadas, setDelegadas] = useState([]);
    const [cargandoDelegadas, setCargandoDelegadas] = useState(false);

    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [success, setSuccess] = useState(null);

    // Cargar delegadas al abrir modal
    useEffect(() => {
        if (!show || !cuota?.id) return;
        setCargandoDelegadas(true);
        axios.get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/padre/${cuota.id}`,
            { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => setDelegadas(res.data || []))
            .catch(() => setDelegadas([]))
            .finally(() => setCargandoDelegadas(false));
    }, [show, cuota, user.token]);


    // Lógica: después de los hooks
    if (!show || !cuota) return null;

    const totalAsignado = [
        ...delegadas.map(d => d.cuotaAsignada ?? 0),
        ...subcuotas.map(sc => Number(sc.cantidad) || 0)
    ].reduce((sum, x) => sum + x, 0);

    const cuotaRestante = (cuota.cuotaAsignada ?? 0) - totalAsignado;

    const agregarSubcuota = () => {
        if (!destinoObj || !cantidad || cantidad < 1) return;
        if (cantidad > cuotaRestante) {
            setError("No puedes asignar más de la cuota restante.");
            return;
        }
        setError(null);
        setSubcuotas(prev => [
            ...prev,
            {
                tipoDestino,
                destinoObj,
                cantidad: Number(cantidad),
            }
        ]);
        setDestinoObj(null);
        setCantidad(1);
    };

    const eliminarSubcuota = idx => setSubcuotas(subcuotas.filter((_, i) => i !== idx));

    const guardarDelegaciones = async () => {
        setGuardando(true);
        setError(null);
        setSuccess(null);
        try {
            for (const sc of subcuotas) {
                await axios.post(
                    `${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/delegar`,
                    {
                        formularioId: cuota.formularioId,
                        cuotaPadreId: cuota.id,
                        cuotaAsignada: sc.cantidad,
                        idUnidad: sc.tipoDestino === "unidad" ? (sc.destinoObj.idUnidad || sc.destinoObj.value) : null,
                        idFuncionario: sc.tipoDestino === "usuario" ? (sc.destinoObj.idFun || sc.destinoObj.value) : null
                    },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
            }
            setSuccess("Delegación registrada correctamente");
            setSubcuotas([]);
            if (onDelegado) onDelegado();
            // Recargar delegadas:
            setCargandoDelegadas(true);
            axios.get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/delegadas/${cuota.id}`,
                { headers: { Authorization: `Bearer ${user.token}` } })
                .then(res => setDelegadas(res.data || []))
                .finally(() => setCargandoDelegadas(false));
        } catch (e) {
            setError("Error al guardar delegaciones");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    Delegar cuota de formulario
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <b>Formulario:</b> {formulario?.nombre || "-"}
                    <br />
                    <b>Cuota asignada a ti:</b>{" "}
                    <Badge bg="primary">{cuota.cuotaAsignada ?? 0}</Badge>
                    <br />
                    <b>Total ya repartido:</b>{" "}
                    <Badge bg={totalAsignado > 0 ? "success" : "secondary"}>{totalAsignado}</Badge>
                    <br />
                    <b>Cuota restante:</b>{" "}
                    <Badge bg={cuotaRestante === 0 ? "secondary" : "warning"}>{cuotaRestante}</Badge>
                </p>
                <hr />
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form as={Row} className="g-2 align-items-end">
                    <Col md={4}>
                        <Form.Label>Tipo destino</Form.Label>
                        <Form.Select
                            size="sm"
                            value={tipoDestino}
                            onChange={e => {
                                setTipoDestino(e.target.value);
                                setDestinoObj(null);
                            }}
                        >
                            <option value="unidad">Unidad</option>
                            <option value="usuario">Funcionario</option>
                        </Form.Select>
                    </Col>
                    <Col md={5}>
                        <Form.Label>Destino</Form.Label>
                        {tipoDestino === "unidad" ? (
                            <AsyncUnidadesSelect
                                value={destinoObj}
                                onChange={setDestinoObj}
                                isClearable
                                user={user}
                            />
                        ) : (
                            <AsyncFuncionarioSelect
                                value={destinoObj}
                                onChange={setDestinoObj}
                                isClearable
                                user={user}
                            />
                        )}
                    </Col>
                    <Col md={2}>
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            max={cuotaRestante}
                            value={cantidad}
                            onChange={e => setCantidad(Number(e.target.value))}
                            size="sm"
                        />
                    </Col>
                    <Col md={1} className="d-grid">
                        <Button
                            variant="primary"
                            onClick={agregarSubcuota}
                            disabled={
                                !destinoObj ||
                                !cantidad ||
                                cantidad < 1 ||
                                cantidad > cuotaRestante
                            }
                        >
                            +
                        </Button>
                    </Col>
                </Form>
                <hr />
                <h6 className="mt-3 mb-2">Cuotas ya delegadas</h6>
                {cargandoDelegadas ? (
                    <Spinner animation="border" size="sm" />
                ) : (
                    <Table size="sm" bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Destino</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                        </tr>
                        </thead>
                        <tbody>
                        {delegadas.length > 0 ? delegadas.map((d, i) => (
                            <tr key={d.id}>
                                <td>{i + 1}</td>
                                <td>
                                    {d.nombreUnidad
                                        || d.nombreFuncionario
                                        || d.idUnidad
                                        || d.idFuncionario
                                        || "?"}
                                </td>
                                <td>{d.idUnidad ? "Unidad" : d.idFuncionario ? "Funcionario" : "-"}</td>
                                <td>{d.cuotaAsignada}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center text-muted">
                                    No hay delegaciones guardadas aún
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                )}
                <h6 className="mt-3 mb-2">Delegaciones a registrar (no guardadas)</h6>
                <Table size="sm" bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Destino</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {subcuotas.map((sc, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>
                                {sc.tipoDestino === "unidad"
                                    ? sc.destinoObj.nombreUnidad || sc.destinoObj.label
                                    : `${sc.destinoObj.nombreFun || ""} ${sc.destinoObj.apellidoPaternoFun || ""} ${sc.destinoObj.apellidoMaternoFun || ""}`.trim()}
                            </td>
                            <td>{sc.tipoDestino === "unidad" ? "Unidad" : "Funcionario"}</td>
                            <td>{sc.cantidad}</td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => eliminarSubcuota(i)}>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {subcuotas.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center text-muted">
                                No hay delegaciones nuevas
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cerrar
                </Button>
                <Button
                    variant="success"
                    onClick={guardarDelegaciones}
                    disabled={guardando || subcuotas.length === 0 || cuotaRestante < 0}
                >
                    {guardando ? <Spinner size="sm" /> : "Guardar delegaciones"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}