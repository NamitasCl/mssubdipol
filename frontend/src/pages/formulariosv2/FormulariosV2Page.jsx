import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Nav, Tab, Badge } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext";
import { MOCK_FORMULARIOS, getFormulariosByCategory, clearMockData } from "./mockData";
import FormulariosList from "./components/FormulariosList";
import FormularioBuilder from "./components/FormularioBuilder";

export default function FormulariosV2Page() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("mis-formularios");
    const [formularios, setFormularios] = useState(MOCK_FORMULARIOS);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingFormulario, setEditingFormulario] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
        // Aquí iría la lógica para ver detalles o respuestas
    };

    const handleDuplicarFormulario = (formulario) => {
        console.log("📋 Duplicar formulario:", formulario.id);
        const duplicado = {
            ...formulario,
            id: Math.max(...formularios.map(f => f.id)) + 1,
            nombre: `${formulario.nombre} (Copia)`,
            fechaCreacion: new Date().toISOString(),
            totalRespuestas: 0,
            creadorId: user?.idFuncionario,
            creadorNombre: `${user?.nombreFun} ${user?.apellidoPaternoFun}`,
            unidadCreador: user?.siglasUnidad
        };
        setFormularios([...formularios, duplicado]);
    };

    const handleEliminarFormulario = (formularioId) => {
        console.log("🗑️ Eliminar formulario:", formularioId);
        if (window.confirm("¿Está seguro de eliminar este formulario?")) {
            setFormularios(formularios.filter(f => f.id !== formularioId));
        }
    };

    const handleToggleEstado = (formulario) => {
        console.log("🔄 Cambiar estado formulario:", formulario.id);
        setFormularios(formularios.map(f =>
            f.id === formulario.id
                ? { ...f, estado: f.estado === "activo" ? "inactivo" : "activo" }
                : f
        ));
    };

    const handleGuardarFormulario = (formularioData) => {
        console.log("💾 Guardar formulario:", formularioData);

        if (editingFormulario) {
            // Editar existente
            setFormularios(formularios.map(f =>
                f.id === editingFormulario.id
                    ? { ...editingFormulario, ...formularioData }
                    : f
            ));
        } else {
            // Crear nuevo
            const nuevoFormulario = {
                id: Math.max(...formularios.map(f => f.id), 0) + 1,
                ...formularioData,
                creadorId: user?.idFuncionario,
                creadorNombre: `${user?.nombreFun} ${user?.apellidoPaternoFun}`,
                unidadCreador: user?.siglasUnidad,
                fechaCreacion: new Date().toISOString(),
                estado: "activo",
                totalRespuestas: 0
            };
            setFormularios([...formularios, nuevoFormulario]);
        }

        setShowBuilder(false);
        setEditingFormulario(null);
    };

    const handleCancelarBuilder = () => {
        setShowBuilder(false);
        setEditingFormulario(null);
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
                            esCreador={false}
                            emptyMessage="No tienes formularios asignados directamente"
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="asignados-unidad">
                        <FormulariosList
                            formularios={asignadosUnidad}
                            onVer={handleVerFormulario}
                            esCreador={false}
                            emptyMessage={`No hay formularios asignados a ${user?.siglasUnidad}`}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="publicos">
                        <FormulariosList
                            formularios={publicos}
                            onVer={handleVerFormulario}
                            esCreador={false}
                            emptyMessage="No hay formularios públicos disponibles"
                        />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Dev helper */}
            {import.meta.env.DEV && (
                <div className="text-center mt-4">
                    <small className="text-muted">
                        Modo desarrollo - Usando datos mock.{" "}
                        <button
                            className="btn btn-link btn-sm p-0"
                            onClick={() => {
                                clearMockData();
                                setFormularios([]);
                            }}
                        >
                            Limpiar datos
                        </button>
                    </small>
                </div>
            )}
        </Container>
    );
}
