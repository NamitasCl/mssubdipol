import React, { useEffect, useState } from "react";
import { listarFuncionariosAportados, agregarFuncionarioAportado, eliminarFuncionarioAportado } from "../../api/funcionariosAporteApi";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx"; // Si tienes un buscador de funcionarios, cámbialo aquí
import { Button, Modal, Table, Form, Alert, Row, Col } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

export default function IngresoFuncionariosAporte({ show, onHide, calendario, aporte }) {
    const { user } = useAuth();
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoFuncionario, setNuevoFuncionario] = useState(null); // Para el select
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    // Carga funcionarios ya aportados
    useEffect(() => {
        if (calendario && aporte) {
            setLoading(true);
            listarFuncionariosAportados(calendario.id, aporte.idUnidad)
                .then(setFuncionarios)
                .finally(() => setLoading(false));
        }
    }, [calendario, aporte, show]);

    const cuposRestantes = aporte.cantidadFuncionarios - funcionarios.length;

    const handleAgregar = async () => {
        setGuardando(true);
        setError(null);
        try {
            if (!nuevoFuncionario) {
                setError("Debes seleccionar un funcionario");
                return;
            }
            if (funcionarios.find(f => f.idFuncionario === nuevoFuncionario.value)) {
                setError("Este funcionario ya está registrado para este calendario.");
                return;
            }
            if (cuposRestantes <= 0) {
                setError("Ya has completado todos los cupos requeridos.");
                return;
            }
            // Puedes ajustar estos campos según cómo venga el objeto desde tu buscador
            const dto = {
                idCalendario: calendario.id,
                idUnidad: aporte.idUnidad,
                idFuncionario: nuevoFuncionario.value,
                nombreCompleto: nuevoFuncionario.f.nombreCompleto,
                grado: nuevoFuncionario.f.siglasCargo || "",
                antiguedad: nuevoFuncionario.f.antiguedad || 0
            };
            await agregarFuncionarioAportado(dto, user.idFuncionario);
            setNuevoFuncionario(null);
            // Recarga
            const lista = await listarFuncionariosAportados(calendario.id, aporte.idUnidad);
            setFuncionarios(lista);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Error al agregar funcionario");
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Quitar este funcionario del aporte?")) return;
        await eliminarFuncionarioAportado(id, user.idFuncionario);
        const lista = await listarFuncionariosAportados(calendario.id, aporte.idUnidad);
        setFuncionarios(lista);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Aportar funcionarios — {calendario.nombre} ({calendario.mes}/{calendario.anio})<br />
                    <span className="fs-6 text-muted">
                        Unidad: {calendario.tipo === "COMPLEJO" ? aporte.nombreUnidad : calendario.nombreUnidad}
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-2">
                    <Col>
                        <b>Cupos requeridos:</b> {aporte.cantidadFuncionarios}
                    </Col>
                    <Col>
                        <b>Cupos aportados:</b> {funcionarios.length}
                    </Col>
                    <Col>
                        <b>Restantes:</b>{" "}
                        <span className={cuposRestantes > 0 ? "text-danger" : "text-success"}>
                            {cuposRestantes > 0 ? cuposRestantes : 0}
                        </span>
                    </Col>
                </Row>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form className="mb-3" onSubmit={e => { e.preventDefault(); handleAgregar(); }}>
                    <Row>
                        <Col md={8}>
                            {/* Aquí va tu selector/buscador de funcionarios */}
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
                                disabled={guardando || cuposRestantes <= 0}
                            >
                                {guardando ? "Guardando..." : "Agregar funcionario"}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Grado</th>
                        <th>Antigüedad</th>
                        <th>Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {funcionarios.map((f, i) => (
                        <tr key={f.id}>
                            <td>{i + 1}</td>
                            <td>{f.nombreCompleto}</td>
                            <td>{f.grado}</td>
                            <td>{f.antiguedad}</td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleEliminar(f.id)}
                                >
                                    Quitar
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {funcionarios.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center">No hay funcionarios registrados.</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}
