import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Tabs, Tab, Alert } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FormFieldPalette from "./FormFieldPalette";
import PermissionsManager from "./PermissionsManager";
import QuotasManager from "./QuotasManager";
import FormPreview from "./FormPreview";
import { FIELD_TYPES } from "../mockData";
import {FaTrash} from "react-icons/fa";

export default function FormularioBuilder({ formulario, onGuardar, onCancelar }) {
    // Estados del formulario
    const [nombre, setNombre] = useState(formulario?.nombre || "");
    const [descripcion, setDescripcion] = useState(formulario?.descripcion || "");
    const [campos, setCampos] = useState(formulario?.campos || []);
    const [visibilidad, setVisibilidad] = useState(formulario?.visibilidad || []);
    const [limiteRespuestas, setLimiteRespuestas] = useState(formulario?.limiteRespuestas || null);
    const [cuotas, setCuotas] = useState(formulario?.cuotas || []);

    const [activeTab, setActiveTab] = useState("campos");
    const [campoEditando, setCampoEditando] = useState(null);
    const [error, setError] = useState(null);

    // Agregar campo desde paleta
    const handleAgregarCampo = (tipoId) => {
        console.log("➕ Agregar campo:", tipoId);
        const tipo = FIELD_TYPES.find(t => t.id === tipoId);
        if (!tipo) return;

        const nuevoCampo = {
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tipo: tipo.id,
            ...tipo.defaultProps
        };

        setCampos([...campos, nuevoCampo]);
        setCampoEditando(nuevoCampo.id);
    };

    // Eliminar campo
    const handleEliminarCampo = (campoId) => {
        console.log("🗑️ Eliminar campo:", campoId);
        setCampos(campos.filter(c => c.id !== campoId));
        if (campoEditando === campoId) {
            setCampoEditando(null);
        }
    };

    // Función para generar nombre técnico desde etiqueta
    const generarNombreTecnico = (etiqueta) => {
        return etiqueta
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9\s]/g, "") // Solo letras, números y espacios
            .trim()
            .replace(/\s+/g, "_"); // Reemplazar espacios por guión bajo
    };

    // Actualizar campo
    const handleActualizarCampo = (campoId, propiedad, valor) => {
        setCampos(campos.map(c => {
            if (c.id === campoId) {
                const actualizado = { ...c, [propiedad]: valor };

                // Si se actualiza la etiqueta y no hay nombre manual, generar nombre automático
                if (propiedad === "etiqueta" && !c.nombreManual) {
                    actualizado.nombre = generarNombreTecnico(valor);
                }

                return actualizado;
            }
            return c;
        }));
    };

    // Actualizar nombre técnico manualmente
    const handleActualizarNombreManual = (campoId, valor) => {
        setCampos(campos.map(c =>
            c.id === campoId ? { ...c, nombre: valor, nombreManual: true } : c
        ));
    };

    // Duplicar campo
    const handleDuplicarCampo = (campoId) => {
        console.log("📋 Duplicar campo:", campoId);
        const campo = campos.find(c => c.id === campoId);
        if (!campo) return;

        const duplicado = {
            ...campo,
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            etiqueta: `${campo.etiqueta} (Copia)`
        };

        const index = campos.findIndex(c => c.id === campoId);
        const nuevosCampos = [...campos];
        nuevosCampos.splice(index + 1, 0, duplicado);
        setCampos(nuevosCampos);
    };

    // Drag & Drop - Manejador principal
    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Si no hay destino válido, cancelar
        if (!destination) {
            console.log("❌ Drag cancelado - sin destino");
            return;
        }

        // Si viene desde la paleta (CLONAR)
        if (source.droppableId === "palette-droppable" && destination.droppableId === "campos-droppable") {
            const tipoId = draggableId.replace("palette-", "");
            const tipo = FIELD_TYPES.find(t => t.id === tipoId);

            if (!tipo) {
                console.error("❌ Tipo de campo no encontrado:", tipoId);
                return;
            }

            console.log("🎨 Campo clonado desde paleta:", tipoId, "→ índice", destination.index);

            // Crear nuevo campo
            const nuevoCampo = {
                id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                tipo: tipo.id,
                ...tipo.defaultProps
            };

            // Insertar en la posición correcta
            const nuevosCampos = Array.from(campos);
            nuevosCampos.splice(destination.index, 0, nuevoCampo);

            setCampos(nuevosCampos);
            setCampoEditando(nuevoCampo.id);
            return;
        }

        // Reordenar campos existentes (MOVER)
        if (source.droppableId === "campos-droppable" && destination.droppableId === "campos-droppable") {
            // Si es la misma posición, no hacer nada
            if (source.index === destination.index) {
                return;
            }

            console.log("🔄 Reordenando campos:", source.index, "→", destination.index);

            const items = Array.from(campos);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            setCampos(items);
        }
    };

    // Manejador para el inicio del drag
    const handleDragStart = (result) => {
        console.log("🚀 Drag iniciado desde:", result.source.droppableId, "- Item:", result.draggableId);
    };

    // Validar y guardar
    const handleGuardar = () => {
        console.log("💾 Intentando guardar formulario...");

        // Validaciones
        if (!nombre.trim()) {
            setError("El nombre del formulario es obligatorio");
            setActiveTab("general");
            return;
        }

        if (campos.length === 0) {
            setError("Debe agregar al menos un campo al formulario");
            setActiveTab("campos");
            return;
        }

        if (visibilidad.length === 0) {
            setError("Debe definir al menos una regla de visibilidad");
            setActiveTab("permisos");
            return;
        }

        // Validar campos
        for (const campo of campos) {
            if (!campo.etiqueta || !campo.etiqueta.trim()) {
                setError(`El campo ${campos.indexOf(campo) + 1} debe tener una etiqueta`);
                setActiveTab("campos");
                return;
            }
            if (!campo.nombre || !campo.nombre.trim()) {
                setError(`El campo "${campo.etiqueta}" debe tener un nombre técnico`);
                setActiveTab("campos");
                return;
            }
        }

        // Validar nombres únicos
        const nombres = campos.map(c => c.nombre);
        const duplicados = nombres.filter((nombre, index) => nombres.indexOf(nombre) !== index);
        if (duplicados.length > 0) {
            setError(`Los nombres técnicos deben ser únicos. Duplicado: "${duplicados[0]}"`);
            setActiveTab("campos");
            return;
        }

        setError(null);

        // Preparar datos
        const datosFormulario = {
            nombre,
            descripcion,
            campos,
            visibilidad,
            limiteRespuestas: limiteRespuestas || null,
            cuotas
        };

        console.log("✅ Formulario válido, guardando:", datosFormulario);
        onGuardar(datosFormulario);
    };

    return (
        <Container fluid className="py-4" style={{ maxWidth: "1600px" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 style={{ color: "#17355A", fontWeight: "700" }}>
                        {formulario ? "Editar Formulario" : "Crear Nuevo Formulario"}
                    </h3>
                    <p className="text-muted mb-0">
                        Define la estructura, permisos y cuotas del formulario
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={onCancelar}
                        style={{ borderRadius: "10px", fontWeight: "600" }}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleGuardar}
                        style={{ borderRadius: "10px", fontWeight: "600", padding: "10px 24px" }}
                    >
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Formulario
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs de configuración */}
            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="mb-4"
                style={{ borderBottom: "2px solid #dee2e6" }}
            >
                {/* Tab 1: Información General */}
                <Tab
                    eventKey="general"
                    title={
                        <span>
                            <i className="bi bi-info-circle me-2"></i>
                            General
                        </span>
                    }
                >
                    <Card className="shadow-sm" style={{ borderRadius: "16px", border: "none" }}>
                        <Card.Body className="p-4">
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontWeight: "600", color: "#17355A" }}>
                                            Nombre del Formulario *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: Registro de Servicios Especiales"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            style={{ borderRadius: "10px", padding: "12px" }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontWeight: "600", color: "#17355A" }}>
                                            Límite de Respuestas
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Dejar vacío para ilimitado"
                                            value={limiteRespuestas || ""}
                                            onChange={(e) => setLimiteRespuestas(e.target.value ? parseInt(e.target.value) : null)}
                                            style={{ borderRadius: "10px", padding: "12px" }}
                                        />
                                        <Form.Text className="text-muted">
                                            Total máximo de respuestas que se pueden recibir
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontWeight: "600", color: "#17355A" }}>
                                            Descripción
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Describe brevemente el propósito del formulario..."
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            style={{ borderRadius: "10px", padding: "12px" }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Tab 2: Campos (Drag & Drop) */}
                <Tab
                    eventKey="campos"
                    title={
                        <span>
                            <i className="bi bi-layout-text-sidebar me-2"></i>
                            Campos ({campos.length})
                        </span>
                    }
                >
                    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                        <Row className="g-4">
                            {/* Paleta de campos */}
                            <Col lg={3}>
                                <FormFieldPalette onAgregarCampo={handleAgregarCampo} />
                            </Col>

                            {/* Constructor de campos */}
                            <Col lg={9}>
                                <Card className="shadow-sm" style={{ borderRadius: "16px", border: "none" }}>
                                    <Card.Body className="p-4">
                                        <Droppable droppableId="campos-droppable">
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    style={{
                                                        background: snapshot.isDraggingOver ? "#f0f7ff" : "transparent",
                                                        borderRadius: "12px",
                                                        minHeight: "400px",
                                                        padding: "8px",
                                                        border: snapshot.isDraggingOver ? "2px dashed #17355A" : "2px dashed transparent"
                                                    }}
                                                >
                                                    {campos.length === 0 ? (
                                                        <div className="text-center py-5" style={{ marginTop: "80px" }}>
                                                            <div style={{ fontSize: "4rem", opacity: 0.3 }}>📋</div>
                                                            <h5 className="text-muted mt-3">No hay campos aún</h5>
                                                            <p className="text-muted">
                                                                Arrastra campos desde la paleta de la izquierda o haz clic en ellos
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                        {campos.map((campo, index) => (
                                                            <Draggable
                                                                key={campo.id}
                                                                draggableId={campo.id}
                                                                index={index}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <Card
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        className="mb-3"
                                                                        style={{
                                                                            ...provided.draggableProps.style,
                                                                            borderRadius: "12px",
                                                                            border: campoEditando === campo.id
                                                                                ? "2px solid #17355A"
                                                                                : "1px solid #e9ecef",
                                                                            background: snapshot.isDragging
                                                                                ? "#fff"
                                                                                : campoEditando === campo.id
                                                                                    ? "#f8f9fa"
                                                                                    : "#fff",
                                                                            boxShadow: snapshot.isDragging
                                                                                ? "0 8px 24px rgba(0,0,0,0.15)"
                                                                                : "none"
                                                                        }}
                                                                        onClick={() => setCampoEditando(campo.id)}
                                                                    >
                                                                        <Card.Body className="p-3">
                                                                            <div className="d-flex align-items-start gap-3">
                                                                                {/* Drag Handle */}
                                                                                <div
                                                                                    {...provided.dragHandleProps}
                                                                                    style={{
                                                                                        cursor: "grab",
                                                                                        color: "#adb5bd",
                                                                                        fontSize: "1.2rem",
                                                                                        paddingTop: "4px"
                                                                                    }}
                                                                                >
                                                                                    <i className="bi bi-grip-vertical"></i>
                                                                                </div>

                                                                                {/* Campo principal */}
                                                                                <div className="flex-grow-1">
                                                                                    <Row className="g-2">
                                                                                        <Col md={4}>
                                                                                            <Form.Group>
                                                                                                <Form.Label className="small mb-1">
                                                                                                    Etiqueta * <small className="text-muted">(visible)</small>
                                                                                                </Form.Label>
                                                                                                <Form.Control
                                                                                                    size="sm"
                                                                                                    value={campo.etiqueta || ""}
                                                                                                    onChange={(e) =>
                                                                                                        handleActualizarCampo(campo.id, "etiqueta", e.target.value)
                                                                                                    }
                                                                                                    placeholder="Ej: Correo Electrónico"
                                                                                                    style={{ borderRadius: "8px" }}
                                                                                                />
                                                                                            </Form.Group>
                                                                                        </Col>
                                                                                        <Col md={4}>
                                                                                            <Form.Group>
                                                                                                <Form.Label className="small mb-1">
                                                                                                    Nombre * <small className="text-muted">(técnico)</small>
                                                                                                </Form.Label>
                                                                                                <Form.Control
                                                                                                    size="sm"
                                                                                                    value={campo.nombre || ""}
                                                                                                    onChange={(e) =>
                                                                                                        handleActualizarNombreManual(campo.id, e.target.value)
                                                                                                    }
                                                                                                    placeholder="Ej: email_contacto"
                                                                                                    style={{
                                                                                                        borderRadius: "8px",
                                                                                                        fontFamily: "monospace",
                                                                                                        fontSize: "0.85rem"
                                                                                                    }}
                                                                                                />
                                                                                            </Form.Group>
                                                                                        </Col>
                                                                                        <Col md={2}>
                                                                                            <Form.Group>
                                                                                                <Form.Label className="small mb-1">
                                                                                                    Tipo
                                                                                                </Form.Label>
                                                                                                <Form.Select
                                                                                                    size="sm"
                                                                                                    value={campo.tipo}
                                                                                                    onChange={(e) =>
                                                                                                        handleActualizarCampo(campo.id, "tipo", e.target.value)
                                                                                                    }
                                                                                                    style={{ borderRadius: "8px" }}
                                                                                                >
                                                                                                    {FIELD_TYPES.map(t => (
                                                                                                        <option key={t.id} value={t.id}>
                                                                                                            {t.label}
                                                                                                        </option>
                                                                                                    ))}
                                                                                                </Form.Select>
                                                                                            </Form.Group>
                                                                                        </Col>
                                                                                        <Col md={2}>
                                                                                            <Form.Label className="small mb-1">
                                                                                                Opciones
                                                                                            </Form.Label>
                                                                                            <Form.Check
                                                                                                type="switch"
                                                                                                label="Requerido"
                                                                                                checked={campo.requerido}
                                                                                                onChange={(e) =>
                                                                                                    handleActualizarCampo(campo.id, "requerido", e.target.checked)
                                                                                                }
                                                                                            />
                                                                                        </Col>

                                                                                        {/* Configuraciones específicas por tipo */}
                                                                                        {(campo.tipo === "select" || campo.tipo === "radio" || campo.tipo === "checkbox") && (
                                                                                            <Col xs={12}>
                                                                                                <Form.Group>
                                                                                                    <Form.Label className="small mb-1">
                                                                                                        Opciones (separadas por coma)
                                                                                                    </Form.Label>
                                                                                                    <Form.Control
                                                                                                        size="sm"
                                                                                                        value={campo.opciones?.join(", ") || ""}
                                                                                                        onChange={(e) =>
                                                                                                            handleActualizarCampo(
                                                                                                                campo.id,
                                                                                                                "opciones",
                                                                                                                e.target.value.split(",").map(o => o.trim())
                                                                                                            )
                                                                                                        }
                                                                                                        placeholder="Opción 1, Opción 2, Opción 3"
                                                                                                        style={{ borderRadius: "8px" }}
                                                                                                    />
                                                                                                </Form.Group>
                                                                                            </Col>
                                                                                        )}

                                                                                        {campo.tipo === "scale" && (
                                                                                            <>
                                                                                                <Col md={6}>
                                                                                                    <Form.Group>
                                                                                                        <Form.Label className="small mb-1">
                                                                                                            Valor mínimo
                                                                                                        </Form.Label>
                                                                                                        <Form.Control
                                                                                                            size="sm"
                                                                                                            type="number"
                                                                                                            value={campo.min || 1}
                                                                                                            onChange={(e) =>
                                                                                                                handleActualizarCampo(campo.id, "min", parseInt(e.target.value))
                                                                                                            }
                                                                                                            style={{ borderRadius: "8px" }}
                                                                                                        />
                                                                                                    </Form.Group>
                                                                                                </Col>
                                                                                                <Col md={6}>
                                                                                                    <Form.Group>
                                                                                                        <Form.Label className="small mb-1">
                                                                                                            Valor máximo
                                                                                                        </Form.Label>
                                                                                                        <Form.Control
                                                                                                            size="sm"
                                                                                                            type="number"
                                                                                                            value={campo.max || 5}
                                                                                                            onChange={(e) =>
                                                                                                                handleActualizarCampo(campo.id, "max", parseInt(e.target.value))
                                                                                                            }
                                                                                                            style={{ borderRadius: "8px" }}
                                                                                                        />
                                                                                                    </Form.Group>
                                                                                                </Col>
                                                                                            </>
                                                                                        )}

                                                                                        {campo.tipo === "file" && (
                                                                                            <Col xs={12}>
                                                                                                <Form.Group>
                                                                                                    <Form.Label className="small mb-1">
                                                                                                        Tipos de archivo permitidos
                                                                                                    </Form.Label>
                                                                                                    <Form.Control
                                                                                                        size="sm"
                                                                                                        value={campo.tiposPermitidos || ""}
                                                                                                        onChange={(e) =>
                                                                                                            handleActualizarCampo(campo.id, "tiposPermitidos", e.target.value)
                                                                                                        }
                                                                                                        placeholder=".pdf,.doc,.jpg,.png"
                                                                                                        style={{ borderRadius: "8px" }}
                                                                                                    />
                                                                                                </Form.Group>
                                                                                            </Col>
                                                                                        )}
                                                                                    </Row>
                                                                                </div>

                                                                                {/* Acciones */}
                                                                                <div className="d-flex flex-column gap-1">
                                                                                    <Button
                                                                                        variant="outline-secondary"
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDuplicarCampo(campo.id);
                                                                                        }}
                                                                                        style={{ borderRadius: "6px" }}
                                                                                        title="Duplicar"
                                                                                    >
                                                                                        Duplicar
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="outline-danger"
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleEliminarCampo(campo.id);
                                                                                        }}
                                                                                        style={{ borderRadius: "6px" }}
                                                                                        title="Eliminar"
                                                                                    >
                                                                                        <FaTrash />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </Card.Body>
                                                                    </Card>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        </>
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </DragDropContext>
                </Tab>

                {/* Tab 3: Permisos y Visibilidad */}
                <Tab
                    eventKey="permisos"
                    title={
                        <span>
                            <i className="bi bi-shield-check me-2"></i>
                            Permisos ({visibilidad.length})
                        </span>
                    }
                >
                    <PermissionsManager
                        visibilidad={visibilidad}
                        onChange={setVisibilidad}
                    />
                </Tab>

                {/* Tab 4: Cuotas */}
                <Tab
                    eventKey="cuotas"
                    title={
                        <span>
                            <i className="bi bi-pie-chart me-2"></i>
                            Cuotas ({cuotas.length})
                        </span>
                    }
                >
                    <QuotasManager
                        cuotas={cuotas}
                        onChange={setCuotas}
                        limiteTotal={limiteRespuestas}
                    />
                </Tab>

                {/* Tab 5: Vista Previa */}
                <Tab
                    eventKey="preview"
                    title={
                        <span>
                            <i className="bi bi-eye me-2"></i>
                            Vista Previa
                        </span>
                    }
                >
                    <FormPreview
                        nombre={nombre}
                        descripcion={descripcion}
                        campos={campos}
                    />
                </Tab>
            </Tabs>

            {/* Botones finales */}
            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={onCancelar}
                    style={{ borderRadius: "10px", fontWeight: "600", padding: "12px 32px" }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="success"
                    size="lg"
                    onClick={handleGuardar}
                    style={{ borderRadius: "10px", fontWeight: "600", padding: "12px 32px" }}
                >
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Formulario
                </Button>
            </div>
        </Container>
    );
}
