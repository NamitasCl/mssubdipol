import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Nav, Tab, Badge, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext";
import { getFormulariosByCategory } from "./mockData";
import FormulariosList from "./components/FormulariosList";
import FormularioBuilder from "./components/FormularioBuilder";
import VistaRespuestasV2 from "./components/VistaRespuestasV2";
import FormularioCompletarV2 from "./components/FormularioCompletarV2";
import * as formulariosApi from "../../api/formulariosApi";

export default function FormulariosV2Page() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("mis-formularios");
    const [formularios, setFormularios] = useState([]);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingFormulario, setEditingFormulario] = useState(null);
    const [showRespuestas, setShowRespuestas] = useState(false);
    const [formularioRespuestas, setFormularioRespuestas] = useState(null);
    const [showCompletar, setShowCompletar] = useState(false);
    const [formularioCompletar, setFormularioCompletar] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar formularios al montar
    useEffect(() => {
        cargarFormularios();
    }, []);

    const cargarFormularios = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await formulariosApi.listarFormularios();
            setFormularios(data);
        } catch (err) {
            console.error("Error al cargar formularios:", err);
            setError("Error al cargar los formularios. Por favor, intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    // Categorizar formularios
    const {
        misFormularios,
        asignadosMi,
        asignadosUnidad,
        publicos
    } = getFormulariosByCategory(formularios, user);

    // Handlers
    const handleNuevoFormulario = () => {
        console.log("📝 Crear nuevo formulario");
        setEditingFormulario(null);
        setShowBuilder(true);
    };

    const handleEditFormulario = (formulario) => {
        console.log("✏️ Editar formulario:", formulario.id);
        setEditingFormulario(formulario);
        setShowBuilder(true);
    };

    const handleVerFormulario = (formulario) => {
        console.log("👁️ Ver formulario:", formulario.id);
        setFormularioRespuestas(formulario);
        setShowRespuestas(true);
    };

    const handleCompletarFormulario = (formulario) => {
        console.log("✍️ Completar formulario:", formulario.id);
        setFormularioCompletar(formulario);
        setShowCompletar(true);
    };

    const handleDuplicarFormulario = async (formulario) => {
        console.log("📋 Duplicar formulario:", formulario.id);
        try {
            const duplicado = {
                nombre: `${formulario.nombre} (Copia)`,
                descripcion: formulario.descripcion,
                campos: formulario.campos,
                visibilidad: formulario.visibilidad,
                limiteRespuestas: formulario.limiteRespuestas,
                cuotas: []
            };
            await formulariosApi.crearFormulario(duplicado);
            await cargarFormularios();
        } catch (err) {
            console.error("Error al duplicar formulario:", err);
            alert("Error al duplicar el formulario");
        }
    };

    const handleEliminarFormulario = async (formularioId) => {
        console.log("🗑️ Eliminar formulario:", formularioId);
        if (window.confirm("¿Está seguro de eliminar este formulario? Se eliminarán también todas las respuestas.")) {
            try {
                await formulariosApi.eliminarFormulario(formularioId);
                await cargarFormularios();
            } catch (err) {
                console.error("Error al eliminar formulario:", err);
                alert("Error al eliminar el formulario");
            }
        }
    };

    const handleToggleEstado = async (formulario) => {
        console.log("🔄 Cambiar estado formulario:", formulario.id);
        try {
            const nuevoEstado = formulario.estado === "activo" || formulario.activo;
            await formulariosApi.cambiarEstadoFormulario(formulario.id, !nuevoEstado);
            await cargarFormularios();
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            alert("Error al cambiar el estado del formulario");
        }
    };

    const handleGuardarFormulario = async (formularioData) => {
        console.log("💾 Guardar formulario:", formularioData);

        try {
            if (editingFormulario) {
                // Editar existente
                await formulariosApi.actualizarFormulario(editingFormulario.id, formularioData);
            } else {
                // Crear nuevo
                await formulariosApi.crearFormulario(formularioData);
            }

            await cargarFormularios();
            setShowBuilder(false);
            setEditingFormulario(null);
        } catch (err) {
            console.error("Error al guardar formulario:", err);
            alert("Error al guardar el formulario: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCancelarBuilder = () => {
        setShowBuilder(false);
        setEditingFormulario(null);
    };

    const handleVolverDeRespuestas = () => {
        setShowRespuestas(false);
        setFormularioRespuestas(null);
        cargarFormularios(); // Recargar por si cambió el contador
    };

    const handleVolverDeCompletar = () => {
        setShowCompletar(false);
        setFormularioCompletar(null);
    };

    const handleExitoCompletar = () => {
        alert('¡Formulario enviado correctamente!');
        setShowCompletar(false);
        setFormularioCompletar(null);
        cargarFormularios(); // Recargar para actualizar contador
    };

    // Si está en modo builder, mostrar solo el builder
    if (showBuilder) {
        return (
            <FormularioBuilder
                formulario={editingFormulario}
                onGuardar={handleGuardarFormulario}
                onCancelar={handleCancelarBuilder}
            />
        );
    }

    // Si está viendo respuestas, mostrar vista de respuestas
    if (showRespuestas && formularioRespuestas) {
        return (
            <VistaRespuestasV2
                formulario={formularioRespuestas}
                onVolver={handleVolverDeRespuestas}
            />
        );
    }

    // Si está completando formulario, mostrar formulario de llenado
    if (showCompletar && formularioCompletar) {
        return (
            <FormularioCompletarV2
                formulario={formularioCompletar}
                onVolver={handleVolverDeCompletar}
                onExito={handleExitoCompletar}
            />
        );
    }

    // Vista principal - dashboard de formularios
    return (
        <Container fluid className="py-4" style={{ maxWidth: "1400px" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ color: "#17355A", fontWeight: "700" }}>
                        Gestión de Formularios
                    </h2>
                    <p className="text-muted mb-0">
                        Crea, administra y monitorea formularios dinámicos
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={handleNuevoFormulario}
                    style={{
                        background: "linear-gradient(135deg, #17355A 0%, #2a5a8f 100%)",
                        border: "none",
                        borderRadius: "12px",
                        padding: "12px 32px",
                        fontWeight: "600",
                        boxShadow: "0 4px 12px rgba(23, 53, 90, 0.3)"
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Nuevo Formulario
                </Button>
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" size="sm" onClick={cargarFormularios}>
                        Reintentar
                    </Button>
                </Alert>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
                    <p className="mt-3 text-muted">Cargando formularios...</p>
                </div>
            ) : (
                <>
                    {/* Tabs de categorías */}
                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav
                    variant="pills"
                    className="mb-4 p-2"
                    style={{
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        gap: "8px"
                    }}
                >
                    <Nav.Item>
                        <Nav.Link
                            eventKey="mis-formularios"
                            style={{
                                borderRadius: "8px",
                                fontWeight: "600",
                                color: activeTab === "mis-formularios" ? "#fff" : "#495057"
                            }}
                        >
                            <i className="bi bi-person-fill me-2"></i>
                            Mis Formularios
                            <Badge
                                bg="light"
                                text="dark"
                                className="ms-2"
                                style={{ fontWeight: "500" }}
                            >
                                {misFormularios.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="asignados-mi"
                            style={{
                                borderRadius: "8px",
                                fontWeight: "600",
                                color: activeTab === "asignados-mi" ? "#fff" : "#495057"
                            }}
                        >
                            <i className="bi bi-bookmark-fill me-2"></i>
                            Asignados a Mí
                            <Badge
                                bg="light"
                                text="dark"
                                className="ms-2"
                                style={{ fontWeight: "500" }}
                            >
                                {asignadosMi.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="asignados-unidad"
                            style={{
                                borderRadius: "8px",
                                fontWeight: "600",
                                color: activeTab === "asignados-unidad" ? "#fff" : "#495057"
                            }}
                        >
                            <i className="bi bi-building me-2"></i>
                            Mi Unidad ({user?.siglasUnidad})
                            <Badge
                                bg="light"
                                text="dark"
                                className="ms-2"
                                style={{ fontWeight: "500" }}
                            >
                                {asignadosUnidad.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            eventKey="publicos"
                            style={{
                                borderRadius: "8px",
                                fontWeight: "600",
                                color: activeTab === "publicos" ? "#fff" : "#495057"
                            }}
                        >
                            <i className="bi bi-globe me-2"></i>
                            Públicos
                            <Badge
                                bg="light"
                                text="dark"
                                className="ms-2"
                                style={{ fontWeight: "500" }}
                            >
                                {publicos.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="mis-formularios">
                        <FormulariosList
                            formularios={misFormularios}
                            onVer={handleVerFormulario}
                            onEditar={handleEditFormulario}
                            onDuplicar={handleDuplicarFormulario}
                            onEliminar={handleEliminarFormulario}
                            onToggleEstado={handleToggleEstado}
                            esCreador={true}
                            emptyMessage="No has creado ningún formulario aún"
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="asignados-mi">
                        <FormulariosList
                            formularios={asignadosMi}
                            onVer={handleVerFormulario}
                            onCompletar={handleCompletarFormulario}
                            esCreador={false}
                            emptyMessage="No tienes formularios asignados directamente"
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="asignados-unidad">
                        <FormulariosList
                            formularios={asignadosUnidad}
                            onVer={handleVerFormulario}
                            onCompletar={handleCompletarFormulario}
                            esCreador={false}
                            emptyMessage={`No hay formularios asignados a ${user?.siglasUnidad}`}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="publicos">
                        <FormulariosList
                            formularios={publicos}
                            onVer={handleVerFormulario}
                            onCompletar={handleCompletarFormulario}
                            esCreador={false}
                            emptyMessage="No hay formularios públicos disponibles"
                        />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
                </>
            )}
        </Container>
    );
}
