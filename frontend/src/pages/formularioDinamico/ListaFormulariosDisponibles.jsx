import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner, Alert, Badge, ProgressBar, Modal } from "react-bootstrap";
import { FaFolderOpen, FaUserCircle, FaGlobeAmericas, FaTasks, FaPlus, FaShare } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import DelegarCuotaFormulario from "./DelegarCuotaFormulario"; // IMPORTANTE: ajusta el path según tu estructura

// Colores institucionales
const azulSuave = "#7fa6da";
const verdeMenta = "#347148";
const grisClaro = "#eceff4";
const textoPrincipal = "#23395d";
const textoSecundario = "#4a5975";

export default function ListaFormulariosDisponibles() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formularios, setFormularios] = useState([]);
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Para modal de delegar cuota
    const [showDelegar, setShowDelegar] = useState(false);
    const [cuotaADistribuir, setCuotaADistribuir] = useState(null);

    // Carga formularios y cuotas en paralelo
    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([
            fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`, {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(res => res.json()),
            fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/mis`, {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(res => res.json()),
        ])
            .then(([formulariosRes, cuotasRes]) => {
                setFormularios(formulariosRes);
                setCuotas(cuotasRes);
            })
            .catch(err => setError(err.message || "Error de red"))
            .finally(() => setLoading(false));
    }, [user, showDelegar]); // Recarga después de cerrar modal (para ver cambios)

    // --- Helper para encontrar la cuota del formulario asignada a este usuario/unidad ---
    function buscarCuotaParaFormulario(formularioId) {
        return cuotas.find(
            c =>
                String(c.formularioId) === String(formularioId) &&
                (
                    (c.idUnidad && user.idUnidad && String(c.idUnidad) === String(user.idUnidad))
                    || (c.idFuncionario && String(c.idFuncionario) === String(user.idFuncionario))
                )
        );
    }

    // Formularios públicos
    const formulariosPublicos = formularios.filter(f =>
        f.visibilidad?.some(v => v.tipoDestino === "publica")
    );
    // Formularios asignados a ti (usuario o unidad)
    const formulariosPrivados = formularios.filter(f =>
        f.visibilidad?.some(
            v =>
                (v.tipoDestino === "usuario" && String(v.valorDestino) === String(user.idFuncionario)) ||
                (v.tipoDestino === "unidad" && v.valorDestino === user.siglasUnidad)
        )
    );
    // Evitar duplicados (si uno es público y también privado)
    const idsPublicos = new Set(formulariosPublicos.map(f => f.id));
    const soloPrivados = formulariosPrivados.filter(f => !idsPublicos.has(f.id));
    // Formularios creados por mí (opcional)
    const formulariosMios = formularios.filter(f => String(f.idCreador) === String(user.idFuncionario));

    // Relacionar cuotas con formularios (para mostrar nombre, etc)
    const buscarFormularioPorId = id => formularios.find(f => String(f.id) === String(id)) || {};

    // Handler para abrir el modal de delegar cuota
    const handleAbrirDelegar = (cuota) => {
        setCuotaADistribuir(cuota);
        setShowDelegar(true);
    };

    // Handler para cerrar el modal
    const handleCerrarDelegar = (actualizar = false) => {
        setShowDelegar(false);
        setCuotaADistribuir(null);
        // Si actualizar, se recarga (lo hace useEffect)
    };

    return (
        <div>
            <h2 className="fw-bold mb-4" style={{ color: textoPrincipal, fontSize: "1.28rem" }}>
                <FaTasks className="me-2" /> Tareas/cuotas asignadas a tu unidad
            </h2>

            {loading && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {/* ---- Sección: Cuotas/tareas asignadas a mi unidad ---- */}
            {!loading && cuotas && cuotas.length === 0 && (
                <Alert variant="info">No tienes tareas asignadas por el momento.</Alert>
            )}

            <Row className="g-4 mb-4">
                {cuotas.map((cuota) => {
                    console.log("Cuota en seccion tareas: ", cuota)
                    const form = buscarFormularioPorId(cuota.formularioId);
                    const nombre = cuota.formularioNombre || form.nombre || "Formulario";
                    const descripcion = form.descripcion || "";
                    const avance = cuota.avance ?? 0;
                    const total = cuota.cuotaAsignada ?? 1;
                    return (
                        <Col key={cuota.id} xs={12} md={6} lg={4}>
                            <Card className="shadow-sm border-0 h-100"
                                  style={{ background: "#f6fafd", borderLeft: `5px solid ${azulSuave}`, borderRadius: 18 }}>
                                <Card.Body>
                                    <Card.Title style={{ color: textoPrincipal, fontWeight: 600, fontSize: "1.09rem" }}>
                                        <FaFolderOpen className="me-2" /> {nombre}
                                    </Card.Title>
                                    {descripcion && (
                                        <Card.Text style={{ color: textoSecundario, fontSize: ".98rem" }}>
                                            {descripcion}
                                        </Card.Text>
                                    )}
                                    <div className="mb-2">
                                        <small>Cuota asignada: <b>{total}</b></small>
                                        <ProgressBar
                                            now={avance}
                                            max={total}
                                            label={`${avance}/${total}`}
                                            variant={avance >= total ? "success" : "info"}
                                            className="my-1"
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Badge bg="secondary" style={{ background: grisClaro, color: textoSecundario, fontWeight: 500 }}>
                                            Unidad: {user.siglasUnidad}
                                        </Badge>
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                style={{
                                                    borderRadius: 12,
                                                    border: `1.5px solid ${azulSuave}`,
                                                    fontWeight: 600,
                                                    color: azulSuave,
                                                    background: "#fff"
                                                }}
                                                onClick={() => navigate(`/servicios-especiales/formulario/${cuota.formularioId}`)}
                                            >
                                                Completar
                                            </Button>
                                            {/* Botón para distribuir/delegar cuota */}
                                            <Button
                                                size="sm"
                                                variant="outline-success"
                                                style={{
                                                    borderRadius: 12,
                                                    border: `1.5px solid ${verdeMenta}`,
                                                    fontWeight: 600,
                                                    color: verdeMenta,
                                                    background: "#fff"
                                                }}
                                                title="Distribuir/delegar cuota"
                                                onClick={() => handleAbrirDelegar(cuota)}
                                            >
                                                <FaShare className="me-1" /> Distribuir cuota
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* ---- Sección: Formularios asignados al usuario (privados) ---- */}
            {soloPrivados.length > 0 && (
                <>
                    <h5 className="fw-semibold mt-2 mb-3" style={{ color: textoSecundario }}>
                        <FaUserCircle className="me-2" /> Formularios asignados directamente a ti
                    </h5>
                    <Row className="g-4 mb-4">
                        {soloPrivados.map(f => {
                            const cuota = buscarCuotaParaFormulario(f.id);
                            return (
                                <Col key={f.id} xs={12} md={6} lg={4}>
                                    <Card
                                        className="shadow-sm border-0 h-100"
                                        style={{
                                            background: "#f8fafc",
                                            borderLeft: `5px solid ${azulSuave}`,
                                            borderRadius: 18
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title style={{ color: textoPrincipal, fontWeight: 600, fontSize: "1.09rem" }}>
                                                <FaFolderOpen className="me-2" /> {f.nombre}
                                            </Card.Title>
                                            <Card.Text style={{ color: textoSecundario, fontSize: ".98rem" }}>
                                                {f.descripcion}
                                            </Card.Text>
                                            {cuota && (
                                                <div className="mb-2">
                                                    <small>Cuota asignada: <b>{cuota.cuotaAsignada ?? 1}</b></small>
                                                    <ProgressBar
                                                        now={cuota.avance ?? 0}
                                                        max={cuota.cuotaAsignada ?? 1}
                                                        label={`${cuota.avance ?? 0}/${cuota.cuotaAsignada ?? 1}`}
                                                        variant={cuota.avance >= (cuota.cuotaAsignada ?? 1) ? "success" : "info"}
                                                        className="my-1"
                                                    />
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between align-items-end">
                                                <Badge bg="secondary" style={{ background: grisClaro, color: textoSecundario, fontWeight: 500 }}>
                                                    {f.visibilidad?.map(v =>
                                                        v.tipoDestino === "usuario" ? "Asignado a ti"
                                                            : v.tipoDestino === "unidad" ? `Unidad ${v.valorDestinoSiglas || v.valorDestino}` : null
                                                    ).filter(Boolean).join(", ")}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    style={{
                                                        borderRadius: 12,
                                                        border: `1.5px solid ${azulSuave}`,
                                                        fontWeight: 600,
                                                        color: azulSuave,
                                                        background: "#fff"
                                                    }}
                                                    onClick={() => navigate(`/servicios-especiales/formulario/${f.id}`)}
                                                >
                                                    Completar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })}
                    </Row>
                </>
            )}

            {/* ---- Sección: Formularios públicos ---- */}
            {formulariosPublicos.length > 0 && (
                <>
                    <h5 className="fw-semibold mt-2 mb-3" style={{ color: textoSecundario }}>
                        <FaGlobeAmericas className="me-2" /> Formularios públicos
                    </h5>
                    <Row className="g-4">
                        {formulariosPublicos.map(f => {
                            const cuota = buscarCuotaParaFormulario(f.id);
                            return (
                                <Col key={f.id} xs={12} md={6} lg={4}>
                                    <Card
                                        className="shadow-sm border-0 h-100"
                                        style={{
                                            background: "#f6fff9",
                                            borderLeft: `5px solid ${verdeMenta}`,
                                            borderRadius: 18
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title style={{ color: textoPrincipal, fontWeight: 600, fontSize: "1.09rem" }}>
                                                <FaFolderOpen className="me-2" /> {f.nombre}
                                            </Card.Title>
                                            <Card.Text style={{ color: textoSecundario, fontSize: ".98rem" }}>
                                                {f.descripcion}
                                            </Card.Text>
                                            {cuota && (
                                                <div className="mb-2">
                                                    <small>Cuota asignada: <b>{cuota.cuotaAsignada ?? 1}</b></small>
                                                    <ProgressBar
                                                        now={cuota.avance ?? 0}
                                                        max={cuota.cuotaAsignada ?? 1}
                                                        label={`${cuota.avance ?? 0}/${cuota.cuotaAsignada ?? 1}`}
                                                        variant={cuota.avance >= (cuota.cuotaAsignada ?? 1) ? "success" : "info"}
                                                        className="my-1"
                                                    />
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between align-items-end">
                                                <Badge bg="success">
                                                    Pública
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="outline-success"
                                                    style={{
                                                        borderRadius: 12,
                                                        border: `1.5px solid ${verdeMenta}`,
                                                        fontWeight: 600,
                                                        color: "#000000",
                                                        background: "#fff"
                                                    }}
                                                    onClick={() => navigate(`/servicios-especiales/formulario/${f.id}`)}
                                                >
                                                    Completar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })}
                    </Row>
                </>
            )}

            {/* ---- (Opcional) Sección: Formularios que creaste tú ---- */}
            {formulariosMios.length > 0 && (
                <>
                    <h5 className="fw-semibold mt-4 mb-3" style={{ color: textoPrincipal }}>
                        <FaPlus className="me-2" /> Formularios que creaste
                    </h5>
                    <Row className="g-4">
                        {formulariosMios.map(f => (
                            <Col key={f.id} xs={12} md={6} lg={4}>
                                <Card className="shadow border-0 h-100" style={{ borderRadius: 18 }}>
                                    <Card.Body>
                                        <Card.Title style={{ color: textoPrincipal, fontWeight: 600, fontSize: "1.09rem" }}>
                                            <FaFolderOpen className="me-2" /> {f.nombre}
                                        </Card.Title>
                                        <Card.Text style={{ color: textoSecundario, fontSize: ".98rem" }}>
                                            {f.descripcion}
                                        </Card.Text>
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => navigate(`/servicios-especiales/formulario/${f.id}/registros`)}
                                            >
                                                Ver registros
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* ------ MODAL DELEGAR CUOTA ------ */}
            <DelegarCuotaFormulario
                show={showDelegar}
                cuota={cuotaADistribuir}
                formulario={cuotaADistribuir ? buscarFormularioPorId(cuotaADistribuir.formularioId) : null}
                onClose={handleCerrarDelegar}
            />
        </div>
    );
}