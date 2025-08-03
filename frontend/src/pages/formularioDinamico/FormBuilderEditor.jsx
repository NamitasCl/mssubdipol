import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Container, Alert, Spinner, CloseButton, Badge, Table } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import AsyncRegionesPolicialesSelect from "../../components/ComponentesAsyncSelect/AsyncRegionesPolicialesSelect.jsx";
import axios from "axios";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

// Tipos de campos disponibles
export const FIELD_TYPES = [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "select", label: "Selección" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio" },
    { value: "date", label: "Fecha" },
    { value: "datetime-local", label: "Fecha y Hora" },
    { value: "funcionario", label: "Funcionario" },
    { value: "unidad", label: "Unidad" },
    { value: "repol", label: "Región Policial" },
    { value: "group", label: "Bloque/Subformulario" }
];


// Catálogo de subformularios
export const SUBFORMULARIOS_CATALOGO = [
    {
        value: "carroDesignado",
        label: "Carro designado",
        fields: [
            { id: 1001, name: "siglaCarro", label: "Sigla carro", type: "text" },
            { id: 1002, name: "corporativo", label: "Es vehículo corporativo", type: "checkbox" },
            { id: 1003, name: "funcionario", label: "Jefe de máquina", type: "funcionario" },
            { id: 1004, name: "telefono", label: "Teléfono Jefe máquina", type: "text" },
        ]
    },
    {
        value: "carrosConTripulacion",
        label: "Carro y tripulacion",
        fields: [
            { id: 1001, name: "siglaCarro", label: "Sigla carro", type: "text" },
            { id: 1002, name: "corporativo", label: "Es vehículo corporativo", type: "checkbox" },
            { id: 1003, name: "funcionario", label: "Jefe de máquina", type: "funcionario" },
            { id: 1004, name: "funcionario", label: "Tripulante", type: "funcionario" },
            { id: 1005, name: "funcionario", label: "Tripulante", type: "funcionario" },
        ]
    },
    {
        value: "delitosAsociados",
        label: "Delito asociado a la orden de detención",
        fields: [
            { id: 1001, name: "delito", label: "Sigla carro", type: "text" },
        ]
    }
];

const inputStyle = { background: "#f9fafb" };

// Tipos de visibilidad
const VISIBILIDAD_TIPOS = [
    { value: "usuario", label: "Usuario", component: AsyncFuncionarioSelect },
    { value: "unidad", label: "Unidad", component: AsyncUnidadesSelect },
    { value: "grupo", label: "Grupo" },
    { value: "repol", label: "Región Policial", component: AsyncRegionesPolicialesSelect },
    { value: "publica", label: "Pública" }
];

// Tipos de cuota
const TIPO_CUOTA = [
    { value: "unidad", label: "Unidad" },
    { value: "usuario", label: "Funcionario específico" },
];

export default function FormBuilderEditor({ fields, setFields }) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [visibilidad, setVisibilidad] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formularioGuardado, setFormularioGuardado] = useState(null);

    // Paso 2: cuotas
    const [step, setStep] = useState(1); // 1=builder, 2=cuotas, 3=fin
    const [cuotas, setCuotas] = useState([]);
    // Ahora guardamos el objeto seleccionado para mostrar bien nombre y valor
    const [nuevaCuota, setNuevaCuota] = useState({
        tipo: "unidad",
        valor: "",
        nombre: "",
        cantidad: 1,
        unidadObj: null,
        funcionarioObj: null
    });

    const { user } = useAuth();

    // ---------- VISIBILIDAD ----------
    const handleAddVisibilidad = () => {
        setVisibilidad([...visibilidad, { tipoDestino: "", valorDestino: "", valorDestinoNombre: "" }]);
    };
    const handleRemoveVisibilidad = (idx) => {
        setVisibilidad(visibilidad.filter((_, i) => i !== idx));
    };
    const handleTipoDestinoChange = (idx, tipoDestino) => {
        setVisibilidad(visibilidad.map((v, i) =>
            i === idx
                ? {
                    ...v,
                    tipoDestino,
                    valorDestino: "",
                    valorDestinoNombre: tipoDestino === "publica" ? "Pública" : (tipoDestino === "grupo" ? "" : "")
                }
                : v
        ));
    };
    const handleValorDestinoChange = (idx, value) => {
        setVisibilidad(visibilidad.map((v, i) =>
            i === idx
                ? {
                    ...v,
                    valorDestino: value?.value ?? "",
                    valorDestinoNombre: value?.label ?? ""
                }
                : v
        ));
    };
    const handleValorDestinoTextChange = (idx, valorDestino) => {
        setVisibilidad(visibilidad.map((v, i) =>
            i === idx
                ? { ...v, valorDestino, valorDestinoNombre: valorDestino }
                : v
        ));
    };

    // ---------- CAMPOS ----------
    const addField = () => {
        setFields([
            ...fields,
            {
                id: Date.now() + Math.random(),
                name: "",
                label: "",
                type: "text",
                options: []
            }
        ]);
    };
    const removeField = (id) => {
        setFields(fields.filter((field) => field.id !== id));
    };
    const updateField = (id, key, value) => {
        setFields(fields.map(field =>
            field.id === id
                ? { ...field, [key]: value }
                : field
        ));
    };
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const reordered = Array.from(fields);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setFields(reordered);
    };

    // ---------- GUARDAR FORMULARIO ----------
    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        setSuccess(null);

        try {
            const camposDTO = fields.map((f, idx) => ({
                nombre: f.name,
                etiqueta: f.label,
                tipo: f.type,
                requerido: !!f.requerido,
                opciones: Array.isArray(f.options) ? f.options.join(",") : f.options || "",
                orden: idx + 1,
                allowMultiple: f.allowMultiple || false,
                subformulario: f.subformulario || null
            }));

            // Armar reglas de visibilidad, filtrando vacías
            const reglas = visibilidad
                .filter(v =>
                    v.tipoDestino &&
                    (v.tipoDestino === "publica" ||
                        (v.valorDestino && v.valorDestino !== ""))
                )
                .map(v => ({
                    tipoDestino: v.tipoDestino,
                    valorDestino: v.tipoDestino === "publica" ? null : v.valorDestino,
                    valorDestinoNombre: v.tipoDestino === "publica" ? "Pública" : v.valorDestinoNombre
                }));

            const dto = {
                nombre,
                descripcion,
                campos: camposDTO,
                visibilidad: reglas
            };

            console.log(dto);

            const response = await axios.post(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`,
                dto,
                {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                }
            );
            setFormularioGuardado(response.data)
            setStep(2)
            setSuccess("¡Formulario guardado exitosamente!");
            setFields([]);
            setNombre("");
            setDescripcion("");
            setVisibilidad([]);
        } catch (e) {
            setError("No se pudo guardar el formulario");
        } finally {
            setGuardando(false);
        }
    };


    // ---------- CUOTAS ----------
    const agregarCuota = () => {
        // Solo agregar si hay destino y cantidad
        console.log("Nueva cuota: ", nuevaCuota);
        if (
            (!nuevaCuota.unidadObj && nuevaCuota.tipo === "unidad") ||
            (!nuevaCuota.funcionarioObj && nuevaCuota.tipo === "usuario") ||
            !nuevaCuota.cantidad
        ) {
            return;
        }
        setCuotas(prev => [
            ...prev,
            {
                tipo: nuevaCuota.tipo,
                valor: nuevaCuota.tipo === "unidad"
                    ? nuevaCuota.unidadObj?.value
                    : nuevaCuota.funcionarioObj?.value,
                nombre: nuevaCuota.tipo === "unidad"
                    ? nuevaCuota.unidadObj?.label
                    : nuevaCuota.funcionarioObj
                        ? `${nuevaCuota.funcionarioObj.label}`.trim()
                        : "",
                cantidad: nuevaCuota.cantidad,
                unidadObj: nuevaCuota.tipo === "unidad" ? nuevaCuota.unidadObj : null,
                funcionarioObj: nuevaCuota.tipo === "usuario" ? nuevaCuota.funcionarioObj : null
            }
        ]);
        setNuevaCuota({
            tipo: "unidad",
            valor: "",
            nombre: "",
            cantidad: 1,
            unidadObj: null,
            funcionarioObj: null
        });
    };

    const eliminarCuota = idx => setCuotas(cuotas.filter((_, i) => i !== idx));

    const handleGuardarCuotas = async () => {
        setGuardando(true);
        setError(null);
        try {
            for (const cuota of cuotas) {

                console.log("Antes de guardar CUOTA: ", cuota)
                await axios.post(
                    `${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas`,
                    {
                        formularioId: formularioGuardado.id,
                        idUnidad: cuota.tipo === "unidad" ? cuota.valor : null,
                        idFuncionario: cuota.tipo === "usuario" ? cuota.funcionarioObj.value : null,
                        cuotaAsignada: cuota.cantidad,
                        cuotaPadreId: cuota.cuotaPadreId ?? null,
                    },
                    { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
                );

            }
            setStep(3);
            setSuccess("Formulario y cuotas guardados correctamente.");
        } catch (e) {
            setError("No se pudieron guardar las cuotas");
        } finally {
            setGuardando(false);
        }
    };

    // Selector de destino para cuota CORREGIDO:
    const renderSelectorValorDestino = () => {
        if (nuevaCuota.tipo === "unidad") {
            return (
                <AsyncUnidadesSelect
                    value={nuevaCuota.unidadObj || null}
                    onChange={unidad => {
                        setNuevaCuota({
                            ...nuevaCuota,
                            valor: unidad?.idUnidad || "",
                            nombre: unidad?.nombreUnidad || "",
                            unidadObj: unidad,
                            funcionarioObj: null
                        });
                    }}
                    isClearable
                    user={user}
                />
            );
        }
        if (nuevaCuota.tipo === "usuario") {
            return (
                <AsyncFuncionarioSelect
                    value={nuevaCuota.funcionarioObj || null}
                    onChange={fun => {
                        setNuevaCuota({
                            ...nuevaCuota,
                            valor: fun?.idFun || "",
                            nombre: fun
                                ? `${fun.nombreFun} ${fun.apellidoPaternoFun} ${fun.apellidoMaternoFun ?? ""}`.trim()
                                : "",
                            funcionarioObj: fun,
                            unidadObj: null
                        });
                    }}
                    isClearable
                    user={user}
                />
            );
        }
        return null;
    };

    // ------ Renderiza el input correcto para cada tipo de visibilidad ------
    function renderVisibilidadInput(v, idx) {
        if (v.tipoDestino === "usuario") {
            return (
                <AsyncFuncionarioSelect
                    value={v.valorDestino ? { value: v.valorDestino, label: v.valorDestinoNombre } : null}
                    onChange={option => handleValorDestinoChange(idx, option)}
                    isClearable
                    placeholder="Seleccione usuario"
                    user={user}
                />
            );
        }
        if (v.tipoDestino === "unidad") {
            return (
                <AsyncUnidadesSelect
                    value={v.valorDestino ? { value: v.valorDestino, label: v.valorDestinoNombre } : null}
                    onChange={option => handleValorDestinoChange(idx, option)}
                    isClearable
                    placeholder="Seleccione unidad"
                    user={user}
                />
            );
        }
        if (v.tipoDestino === "repol") {
            return (
                <AsyncRegionesPolicialesSelect
                    value={v.valorDestino ? { value: v.valorDestino, label: v.valorDestinoNombre } : null}
                    onChange={option => handleValorDestinoChange(idx, option)}
                    isClearable
                    placeholder="Seleccione región policial"
                    user={user}
                />
            );
        }
        if (v.tipoDestino === "grupo") {
            return (
                <Form.Control
                    type="text"
                    placeholder="Nombre del grupo"
                    value={v.valorDestino}
                    onChange={e => handleValorDestinoTextChange(idx, e.target.value)}
                />
            );
        }
        if (v.tipoDestino === "publica") {
            return (
                <Badge bg="success" className="ms-2">Pública</Badge>
            );
        }
        return null;
    }

    // ------ Paso 1: Builder ------
    if (step === 1) {
        return (
            <Container className="p-0" style={{ width: "100%", margin: "0 auto" }}>
                <Card className="shadow-lg rounded-4" style={{ border: "none", background: "#fff", width: "100%", margin: "0 auto" }}>
                    <Card.Body>
                        <div className="mb-4 text-center">
                            <h3 className="fw-bold mb-2" style={{ color: "#17355A" }}>Constructor de Formulario</h3>
                            <p className="text-muted mb-0">Define los campos y visibilidad de tu formulario</p>
                        </div>
                        <Form>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Nombre del Formulario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={nombre}
                                            onChange={e => setNombre(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Descripción</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {/* VISIBILIDAD */}
                            <Row>
                                <Col>
                                    <div className="mb-3 mt-2 p-3 rounded-4" style={{ background: "#f5f7fa", border: "1.5px solid #e1e4ea" }}>
                                        <div className="d-flex align-items-center mb-2 gap-2">
                                            <b style={{ color: "#17355A", fontSize: "1.07rem" }}>Visibilidad</b>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                style={{ borderRadius: 12, fontWeight: 600, fontSize: 13 }}
                                                onClick={handleAddVisibilidad}
                                            >+ Agregar regla</Button>
                                        </div>
                                        <div>
                                            {visibilidad.length === 0 && (
                                                <span className="text-muted">No hay reglas de visibilidad definidas aún.</span>
                                            )}
                                            {visibilidad.map((v, idx) => (
                                                <Row key={idx} className="align-items-center mb-2">
                                                    <Col md={4} xs={12} className="mb-2 mb-md-0">
                                                        <Form.Select
                                                            size="sm"
                                                            value={v.tipoDestino}
                                                            onChange={e => handleTipoDestinoChange(idx, e.target.value)}
                                                        >
                                                            <option value="">Tipo de visibilidad...</option>
                                                            {VISIBILIDAD_TIPOS.map(opt =>
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            )}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={6} xs={12}>
                                                        {renderVisibilidadInput(v, idx)}
                                                    </Col>
                                                    <Col md={2} xs={12}>
                                                        <CloseButton
                                                            className="ms-2"
                                                            title="Quitar"
                                                            onClick={() => handleRemoveVisibilidad(idx)}
                                                        />
                                                    </Col>
                                                </Row>
                                            ))}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                        {fields.length === 0 && (
                            <div className="text-center text-muted mb-4">
                                No hay campos aún. Haz clic en <strong>Agregar campo</strong> para comenzar.
                            </div>
                        )}
                        <div style={{
                            maxHeight: "48vh",
                            overflowY: "auto",
                            marginBottom: "2rem"
                        }}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="fields-droppable">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {fields.map((field, idx) => (
                                                <Draggable key={field.id} draggableId={field.id.toString()} index={idx}>
                                                    {(provided, snapshot) => (
                                                        <Card
                                                            className="mb-3 border-1 shadow-sm"
                                                            style={{
                                                                background: idx % 2 === 0 ? "#f5f7fa" : "#f8fafc",
                                                                borderRadius: 18,
                                                                opacity: snapshot.isDragging ? 0.9 : 1,
                                                                boxShadow: snapshot.isDragging ? "0 0 0.8rem #3332" : undefined,
                                                                ...provided.draggableProps.style
                                                            }}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <Card.Body>
                                                                <Row className="g-2 align-items-center">
                                                                    <Col md="auto" className="pe-0" style={{ cursor: "grab" }}>
                                                                        <span
                                                                            {...provided.dragHandleProps}
                                                                            title="Arrastra para reordenar"
                                                                            style={{
                                                                                fontSize: 24,
                                                                                color: "#bdbdbd",
                                                                                display: "inline-block",
                                                                                paddingRight: 6,
                                                                                userSelect: "none"
                                                                            }}
                                                                        >
                                                                            ☰
                                                                        </span>
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <Form.Group>
                                                                            <Form.Label className="fw-semibold">Nombre</Form.Label>
                                                                            <Form.Control
                                                                                size="sm"
                                                                                style={inputStyle}
                                                                                type="text"
                                                                                placeholder="Ej: email, telefono"
                                                                                value={field.name}
                                                                                onChange={e => updateField(field.id, "name", e.target.value)}
                                                                            />
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <Form.Group>
                                                                            <Form.Label className="fw-semibold">Etiqueta</Form.Label>
                                                                            <Form.Control
                                                                                size="sm"
                                                                                style={inputStyle}
                                                                                type="text"
                                                                                placeholder="Ej: Correo Electrónico"
                                                                                value={field.label}
                                                                                onChange={e => updateField(field.id, "label", e.target.value)}
                                                                            />
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <Form.Group>
                                                                            <Form.Label className="fw-semibold">Tipo</Form.Label>
                                                                            <Form.Select
                                                                                size="sm"
                                                                                style={inputStyle}
                                                                                value={field.type}
                                                                                onChange={e => updateField(field.id, "type", e.target.value)}
                                                                            >
                                                                                {FIELD_TYPES.map(ft => (
                                                                                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                                                                                ))}
                                                                            </Form.Select>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    {/* Opciones especiales según tipo */}
                                                                    <Col md={2}>
                                                                        {field.type === "select" && (
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">Opciones</Form.Label>
                                                                                <Form.Control
                                                                                    size="sm"
                                                                                    style={inputStyle}
                                                                                    type="text"
                                                                                    placeholder="Ej: Opción1, Opción2"
                                                                                    value={field.options.join(",")}
                                                                                    onChange={e => updateField(field.id, "options", e.target.value.split(","))}
                                                                                />
                                                                            </Form.Group>
                                                                        )}
                                                                        {field.type === "funcionario" && (
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">Funcionario</Form.Label>
                                                                                <AsyncFuncionarioSelect
                                                                                    value={field.funcionario || null}
                                                                                    onChange={val => updateField(field.id, "funcionario", val)}
                                                                                    isClearable
                                                                                    size="sm"
                                                                                    user={user}
                                                                                />
                                                                            </Form.Group>
                                                                        )}
                                                                        {field.type === "unidad" && (
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">Unidad</Form.Label>
                                                                                <AsyncUnidadesSelect
                                                                                    value={field.unidad || null}
                                                                                    onChange={val => updateField(field.id, "unidad", val)}
                                                                                    isClearable
                                                                                    size="sm"
                                                                                    user={user}
                                                                                />
                                                                            </Form.Group>
                                                                        )}
                                                                        {field.type === "repol" && (
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">Región Policial</Form.Label>
                                                                                <AsyncRegionesPolicialesSelect
                                                                                    value={field.repol || null}
                                                                                    onChange={val => updateField(field.id, "repol", val)}
                                                                                    isClearable
                                                                                    size="sm"
                                                                                    user={user}
                                                                                />
                                                                            </Form.Group>
                                                                        )}
                                                                        {/* Selector de subformulario si es group */}
                                                                        {field.type === "group" && (
                                                                            <Form.Group>
                                                                                <Form.Label className="fw-semibold">Subformulario</Form.Label>
                                                                                <Form.Select
                                                                                    size="sm"
                                                                                    style={inputStyle}
                                                                                    value={field.subformulario || ""}
                                                                                    onChange={e => updateField(field.id, "subformulario", e.target.value)}
                                                                                >
                                                                                    <option value="">Selecciona un bloque...</option>
                                                                                    {SUBFORMULARIOS_CATALOGO.map(sf => (
                                                                                        <option key={sf.value} value={sf.value}>{sf.label}</option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                                {/* Permitir repetir bloque */}
                                                                                <Form.Check
                                                                                    className="mt-2"
                                                                                    type="checkbox"
                                                                                    label="Permitir agregar varios"
                                                                                    checked={!!field.allowMultiple}
                                                                                    onChange={e => updateField(field.id, "allowMultiple", e.target.checked)}
                                                                                />
                                                                            </Form.Group>
                                                                        )}
                                                                    </Col>
                                                                    <Col className="d-flex justify-content-end align-items-center">
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => removeField(field.id)}
                                                                            title="Eliminar campo"
                                                                            style={{ borderRadius: 10 }}
                                                                        >
                                                                            🗑️
                                                                        </Button>
                                                                    </Col>
                                                                </Row>
                                                            </Card.Body>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                        <div className="d-flex justify-content-center gap-3">
                            <Button
                                variant="primary"
                                onClick={addField}
                                size="lg"
                                className="px-4"
                                style={{
                                    background: "#17355A",
                                    border: "none",
                                    borderRadius: 12,
                                    fontWeight: "bold",
                                    letterSpacing: 1
                                }}
                            >
                                + Agregar campo
                            </Button>
                            <Button
                                variant="success"
                                size="lg"
                                className="px-4"
                                disabled={fields.length === 0 || !nombre || visibilidad.length === 0}
                                onClick={handleGuardar}
                            >
                                {guardando ? <Spinner size="sm" /> : "Guardar y asignar cuotas"}
                            </Button>
                        </div>
                        {success && <Alert variant="success" className="mt-4">{success}</Alert>}
                        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ------ Paso 2: cuotas ------
    if (step === 2) {
        return (
            <Card className="mb-3 shadow" style={{ borderRadius: 14 }}>
                <Card.Header>
                    <b>Asignar cuotas de registros</b>
                    <span className="ms-2 text-secondary" style={{ fontWeight: 400 }}>
                        (¿Cuántos registros debe ingresar cada unidad/usuario?)
                    </span>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form as={Row} className="align-items-end g-2 mb-3">
                        <Col md={3}>
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select
                                value={nuevaCuota.tipo}
                                onChange={e => setNuevaCuota({
                                    ...nuevaCuota,
                                    tipo: e.target.value,
                                    valor: "",
                                    nombre: "",
                                    unidadObj: null,
                                    funcionarioObj: null
                                })}
                            >
                                {TIPO_CUOTA.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Label>Destino</Form.Label>
                            {renderSelectorValorDestino()}
                        </Col>
                        <Col md={3}>
                            <Form.Label>Cuota asignada</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                value={nuevaCuota.cantidad}
                                onChange={e => setNuevaCuota({ ...nuevaCuota, cantidad: Number(e.target.value) })}
                            />
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" onClick={agregarCuota}>Agregar</Button>
                        </Col>
                    </Form>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Tipo</th>
                            <th>Destino</th>
                            <th>Cuota</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {cuotas.map((c, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{TIPO_CUOTA.find(t => t.value === c.tipo)?.label}</td>
                                <td>{c.nombre || c.valor}</td>
                                <td>{c.cantidad}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => eliminarCuota(i)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <Button variant="secondary" onClick={() => setStep(1)}>← Volver</Button>
                        <Button variant="success" onClick={handleGuardarCuotas} disabled={guardando}>
                            {guardando ? <Spinner size="sm" /> : "Guardar y publicar"}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    // ------ Paso 3: Confirmación ------
    return (
        <Card className="mb-3 shadow" style={{ borderRadius: 14 }}>
            <Card.Header><b>¡Formulario configurado y publicado!</b></Card.Header>
            <Card.Body>
                <Alert variant="success">
                    <b>Formulario y cuotas guardadas correctamente.</b> Los usuarios/unidades asignadas ya pueden comenzar a ingresar registros.
                </Alert>
                <Button variant="primary" onClick={() => window.location.reload()}>Crear otro formulario</Button>
            </Card.Body>
        </Card>
    );
}