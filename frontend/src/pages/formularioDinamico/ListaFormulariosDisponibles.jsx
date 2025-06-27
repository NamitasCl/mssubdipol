import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spinner, Alert, Badge, ProgressBar } from "react-bootstrap";
import { FaFolderOpen, FaUserCircle, FaGlobeAmericas, FaTasks, FaPlus, FaShare } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import DelegarCuotaFormulario from "./DelegarCuotaFormulario";

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
                console.log("Formularios recibidos: ", formulariosRes);
                console.log("Cuotas: ", cuotasRes);
                setFormularios(formulariosRes);
                setCuotas(cuotasRes);
            })
            .catch(err => setError(err.message || "Error de red"))
            .finally(() => setLoading(false));
    }, [user, showDelegar]);

    // ---- Ayudantes ----
    const buscarFormularioPorId = id => formularios.find(f => String(f.id) === String(id)) || {};
    const idsConCuota = new Set(cuotas.map(c => String(c.formularioId)));

    // FORMULARIOS PÚBLICOS (todos ven, incluso si tienen cuota, pero solo pueden "Completar" si no tienen cuota)
    const formulariosPublicos = formularios.filter(f =>
        f.visibilidad?.some(v => v.tipoDestino === "publica")
    );

    // FORMULARIOS PÚBLICOS sin cuota para el usuario
    const formulariosPublicosSinCuota = formulariosPublicos.filter(f => !idsConCuota.has(String(f.id)));

    // FORMULARIOS PRIVADOS, sólo los asignados directamente al usuario o a su unidad
    const formulariosPrivados = formularios.filter(f =>
        f.visibilidad?.some(
            v =>
                (v.tipoDestino === "usuario" && String(v.valorDestino) === String(user.idFuncionario)) ||
                (v.tipoDestino === "unidad" && String(v.valorDestinoSiglas) === String(user.siglasUnidad))
        )
    );

    // Sólo privados sin cuota ni públicos duplicados (evita mostrar formularios ya mostrados por cuota o público)
    const idsFormulariosMostrados = new Set([
        ...cuotas.map(c => String(c.formularioId)),
        ...formulariosPublicos.map(f => String(f.id)),
    ]);
    const soloPrivados = formulariosPrivados.filter(f => !idsFormulariosMostrados.has(String(f.id)));

    // Formulario soy creador
    const esCreador = (f) => String(f.idCreador) === String(user.idFuncionario);

    const handleAbrirDelegar = (cuota) => {
        setCuotaADistribuir(cuota);
        setShowDelegar(true);
    };
    const handleCerrarDelegar = () => {
        setShowDelegar(false);
        setCuotaADistribuir(null);
    };

    console.log("user:", user);
    console.log("formulariosPrivados:", formulariosPrivados.map(f=>f.id));
    console.log("soloPrivados:", soloPrivados.map(f=>f.id));
    
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

            {/* ---- Sección: Cuotas/tareas asignadas ---- */}
            {!loading && cuotas && cuotas.length === 0 && (
                <Alert variant="info">No tienes tareas asignadas por el momento.</Alert>
            )}

            <Row className="g-4 mb-4">
                {cuotas.map((cuota) => {
                    const form = buscarFormularioPorId(cuota.formularioId);
                    const nombre = cuota.formularioNombre || form.nombre || "Formulario";
                    const descripcion = form.descripcion || "";
                    const avance = cuota.avance ?? 0;
                    const total = cuota.cuotaAsignada ?? 1;
                    const completada = avance >= total;
                    const esCuotaPadre = !cuota.cuotaPadreId;
                    const idUnidad = cuota.idUnidad ?? null;
                    const idFuncionario = cuota.idFuncionario ?? null;

                    return (
                        <Col key={cuota.id} xs={12} md={6} lg={4}>
                            <Card className="shadow-sm border-0 h-100"
                                  style={{
                                      background: completada ? "#e6f9e7" : "#f6fafd",
                                      borderLeft: `5px solid ${azulSuave}`,
                                      borderRadius: 18
                                  }}>
                                <Card.Body>
                                    <Card.Title style={{ color: textoPrincipal, fontWeight: 600, fontSize: "1.09rem" }}>
                                        <FaFolderOpen className="me-2" /> {nombre}
                                        {completada && (
                                            <Badge bg="success" className="ms-2 align-middle" style={{ fontSize: "0.85em" }}>
                                                <FaTasks className="me-1" /> ¡Completado!
                                            </Badge>
                                        )}
                                        {esCreador(form) && (
                                            <Badge bg="warning" className="ms-2 align-middle" style={{ fontSize: "0.85em", color: "#754c00" }}>
                                                Creador
                                            </Badge>
                                        )}
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
                                            variant={completada ? "success" : "info"}
                                            className="my-1"
                                        />
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ minHeight: 45 }}>
                                        <div className={"w-100"}>
                                            <Badge bg="secondary" style={{ background: grisClaro, color: textoSecundario, fontWeight: 500 }}>
                                                Unidad: {user.siglasUnidad}
                                            </Badge>
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {!completada && (
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
                                                    onClick={() => navigate(`/servicios-especiales/formulario/${cuota.formularioId}`, {
                                                        state: {
                                                            cuotaId: cuota.id,
                                                            idUnidad,
                                                            idFuncionario
                                                        }
                                                    })}
                                                >
                                                    Completar
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() =>
                                                    navigate(`/servicios-especiales/verregistros`, {
                                                        state: {
                                                            formularioId: cuota.formularioId,
                                                            cuotaId: cuota.id,
                                                            esCuotaPadre,
                                                            idUnidad,
                                                            idFuncionario
                                                        }
                                                    })
                                                }
                                            >
                                                Ver registros
                                            </Button>

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

            {/* ---- Sección: Formularios asignados al usuario (privados) SIN cuota ---- */}
            {soloPrivados.length > 0 && (
                <>
                    <h5 className="fw-semibold mt-2 mb-3" style={{ color: textoSecundario }}>
                        <FaUserCircle className="me-2" /> Formularios asignados directamente a ti
                    </h5>
                    <Row className="g-4 mb-4">
                        {soloPrivados.map(f => (
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
                                            {esCreador(f) && (
                                                <Badge bg="warning" className="ms-2 align-middle" style={{ fontSize: "0.85em", color: "#754c00" }}>
                                                    Creador
                                                </Badge>
                                            )}
                                        </Card.Title>
                                        <Card.Text style={{ color: textoSecundario, fontSize: ".98rem" }}>
                                            {f.descripcion}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-end">
                                            {/*
                                            <Badge bg="secondary" style={{ background: grisClaro, color: textoSecundario, fontWeight: 500 }}>
                                                {f.visibilidad?.map(v =>
                                                    v.tipoDestino === "usuario" ? "Asignado a ti"
                                                        : v.tipoDestino === "unidad" ? `Unidad ${v.valorDestinoSiglas || v.valorDestino}` : null
                                                ).filter(Boolean).join(", ")}
                                            </Badge>
                                            */}
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
                                                    onClick={() => navigate(`/servicios-especiales/formulario/${f.id}`)}
                                                >
                                                    Completar
                                                </Button>
                                                {esCreador(f) && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            navigate(`/servicios-especiales/verregistros`, {
                                                                state: {
                                                                    formularioId: f.id,
                                                                    esCuotaPadre: true
                                                                }
                                                            })
                                                        }
                                                    >
                                                        Ver registros
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* ---- Sección: Formularios públicos SIN cuota ---- */}
            {formulariosPublicosSinCuota.length > 0 && (
                <>
                    <h5 className="fw-semibold mt-2 mb-3" style={{ color: textoSecundario }}>
                        <FaGlobeAmericas className="me-2" /> Formularios públicos
                    </h5>
                    <Row className="g-4">
                        {formulariosPublicosSinCuota.map(f => (
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
                                            {esCreador(f) && (
                                                <Badge bg="warning" className="ms-2 align-middle" style={{ fontSize: "0.85em", color: "#754c00" }}>
                                                    Creador
                                                </Badge>
                                            )}
                                        </Card.Title>
                                        <Card.Text style={{ color: textoSecundario, fontSize: ".98rem" }}>
                                            {f.descripcion}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <Badge bg="success">
                                                Pública
                                            </Badge>
                                            <div className="d-flex gap-2">
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
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        navigate(`/servicios-especiales/verregistros`, {
                                                            state: {
                                                                formularioId: f.id,
                                                                esCuotaPadre: true
                                                            }
                                                        })
                                                    }
                                                >
                                                    Ver registros
                                                </Button>
                                            </div>
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
                show={!!cuotaADistribuir}
                cuota={cuotaADistribuir}
                formulario={buscarFormularioPorId(cuotaADistribuir?.formularioId)}
                onClose={handleCerrarDelegar}
                onDelegado={handleCerrarDelegar}
            />
        </div>
    );
}