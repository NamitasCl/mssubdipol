import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import AsyncRegionesPolicialesSelect from "../../components/ComponentesAsyncSelect/AsyncRegionesPolicialesSelect.jsx";
import axios from "axios";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { GripVertical, Plus, Trash2, Eye, Save, ChevronRight, Check, Users, Building2, Globe, X, Loader2 } from "lucide-react";
import clsx from "clsx";

// Field types available
export const FIELD_TYPES = [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "select", label: "Selección" },
    { value: "checkbox", label: "Checkbox" },
    { value: "date", label: "Fecha" },
    { value: "datetime-local", label: "Fecha y Hora" },
    { value: "funcionario", label: "Funcionario" },
    { value: "unidad", label: "Regiones / Prefecturas / Unidades" },
    { value: "group", label: "Bloque/Subformulario" }
];

// Subform catalog
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
        value: "carrosConTripulacionServicio",
        label: "Carro y detalle",
        fields: [
            { id: 1001, name: "siglaCarro", label: "Sigla carro", type: "text" },
            { id: 1002, name: "corporativo", label: "Es carro corporativo", type: "checkbox" },
            { id: 1003, name: "funcion carro", label: "Función del carro", type: "select", opciones: "DECRETOS,FISCALIZACIONES,OTRO" },
            { id: 1004, name: "lugar", label: "Lugar", type: "text" },
            { id: 1005, name: "fecha inicio", label: "Fecha y Hora inicio servicio", type: "datetime-local" },
            { id: 1006, name: "fecha fin", label: "Fecha y Hora fin servicio", type: "datetime-local" },
            { id: 1007, name: "funcionario uno", label: "Nombre funcionario uno", type: "funcionario" },
            { id: 1008, name: "funcionario uno función", label: "Funcion dentro del carro", type: "select", opciones: "JEFE DE MAQUINA,TRIPULANTE,CONDUCTOR" },
            { id: 1009, name: "telefono funcionario uno", label: "Teléfono", type: "text" },
            { id: 1010, name: "funcionario dos", label: "Nombre funcionario dos", type: "funcionario" },
            { id: 1011, name: "funcionario dos función", label: "Funcion dentro del carro", type: "select", opciones: "JEFE DE MAQUINA,TRIPULANTE,CONDUCTOR" },
            { id: 1012, name: "telefono funcionario dos", label: "Teléfono", type: "text" },
            { id: 1013, name: "funcionario tres", label: "Nombre funcionario tres", type: "funcionario" },
            { id: 1014, name: "funcionario tres función", label: "Funcion dentro del carro", type: "select", opciones: "JEFE DE MAQUINA,TRIPULANTE,CONDUCTOR" },
            { id: 1015, name: "telefono funcionario tres", label: "Teléfono", type: "text" },
            { id: 1016, name: "observaciones", label: "observaciones", type: "text" },
        ]
    }
];

// Visibility types
const VISIBILIDAD_TIPOS = [
    { value: "usuario", label: "Usuario específico", icon: Users },
    { value: "unidad", label: "Unidad", icon: Building2 },
    { value: "publica", label: "Pública", icon: Globe }
];

// Quota types
const TIPO_CUOTA = [
    { value: "unidad", label: "Unidad" },
    { value: "usuario", label: "Funcionario específico" },
];

export default function FormBuilderEditor({ fields, setFields }) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaLimite, setFechaLimite] = useState("");
    const [visibilidad, setVisibilidad] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formularioGuardado, setFormularioGuardado] = useState(null);

    // Step management: 1=builder, 2=quotas, 3=done
    const [step, setStep] = useState(1);
    const [cuotas, setCuotas] = useState([]);
    const [nuevaCuota, setNuevaCuota] = useState({
        tipo: "unidad",
        valor: "",
        nombre: "",
        cantidad: 1,
        unidadObj: null,
        funcionarioObj: null
    });

    const { user } = useAuth();

    // ---------- VISIBILITY HANDLERS ----------
    const handleAddVisibilidad = () => {
        setVisibilidad([...visibilidad, { tipoDestino: "", valorDestino: "", valorDestinoNombre: "" }]);
    };

    const handleRemoveVisibilidad = (idx) => {
        setVisibilidad(visibilidad.filter((_, i) => i !== idx));
    };

    const handleTipoDestinoChange = (idx, tipoDestino) => {
        setVisibilidad(visibilidad.map((v, i) =>
            i === idx
                ? { ...v, tipoDestino, valorDestino: "", valorDestinoNombre: tipoDestino === "publica" ? "Pública" : "" }
                : v
        ));
    };

    const handleValorDestinoChange = (idx, value) => {
        setVisibilidad(visibilidad.map((v, i) =>
            i === idx
                ? { ...v, valorDestino: value?.value ?? "", valorDestinoNombre: value?.label ?? "" }
                : v
        ));
    };

    // ---------- FIELD HANDLERS ----------
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
            field.id === id ? { ...field, [key]: value } : field
        ));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const reordered = Array.from(fields);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setFields(reordered);
    };

    // ---------- SAVE FORM ----------
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
                subformulario: f.subformulario || null,
                esResumenDashboard: f.esResumenDashboard || false
            }));

            const reglas = visibilidad
                .filter(v => v.tipoDestino && (v.tipoDestino === "publica" || (v.valorDestino && v.valorDestino !== "")))
                .map(v => ({
                    tipoDestino: v.tipoDestino,
                    valorDestino: v.tipoDestino === "publica" ? null : v.valorDestino,
                    valorDestinoNombre: v.tipoDestino === "publica" ? "Pública" : v.valorDestinoNombre
                }));

            const dto = { nombre, descripcion, campos: camposDTO, visibilidad: reglas, fechaLimite: fechaLimite || null };

            const response = await axios.post(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion`,
                dto,
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            setFormularioGuardado(response.data);
            setStep(2);
            setSuccess("¡Formulario guardado exitosamente!");
            setFields([]);
            setNombre("");
            setDescripcion("");
            setVisibilidad([]);
        } catch {
            setError("No se pudo guardar el formulario");
        } finally {
            setGuardando(false);
        }
    };

    // ---------- QUOTA HANDLERS ----------
    const agregarCuota = () => {
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
                valor: nuevaCuota.tipo === "unidad" ? nuevaCuota.unidadObj?.value : nuevaCuota.funcionarioObj?.value,
                nombre: nuevaCuota.tipo === "unidad" ? nuevaCuota.unidadObj?.label : nuevaCuota.funcionarioObj?.label || "",
                cantidad: nuevaCuota.cantidad,
                unidadObj: nuevaCuota.tipo === "unidad" ? nuevaCuota.unidadObj : null,
                funcionarioObj: nuevaCuota.tipo === "usuario" ? nuevaCuota.funcionarioObj : null
            }
        ]);
        setNuevaCuota({ tipo: "unidad", valor: "", nombre: "", cantidad: 1, unidadObj: null, funcionarioObj: null });
    };

    const eliminarCuota = idx => setCuotas(cuotas.filter((_, i) => i !== idx));

    const handleGuardarCuotas = async () => {
        setGuardando(true);
        setError(null);
        try {
            for (const cuota of cuotas) {
                await axios.post(
                    `${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas`,
                    {
                        formularioId: formularioGuardado.id,
                        idUnidad: cuota.tipo === "unidad" ? cuota.valor : null,
                        idFuncionario: cuota.tipo === "usuario" ? cuota.funcionarioObj.value : null,
                        cuotaAsignada: cuota.cantidad,
                        cuotaPadreId: cuota.cuotaPadreId ?? null,
                    },
                    { headers: { Authorization: `Bearer ${user?.token}` } }
                );
            }
            setStep(3);
            setSuccess("Formulario y cuotas guardados correctamente.");
        } catch {
            setError("No se pudieron guardar las cuotas");
        } finally {
            setGuardando(false);
        }
    };

    // Render visibility input
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
        if (v.tipoDestino === "publica") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <Globe size={14} />
                    Pública
                </span>
            );
        }
        return null;
    }

    // Render quota destination selector
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
                            nombre: fun ? `${fun.nombreFun} ${fun.apellidoPaternoFun} ${fun.apellidoMaternoFun ?? ""}`.trim() : "",
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

    // ---------- STEP 1: FORM BUILDER ----------
    if (step === 1) {
        return (
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Constructor de Formulario</h2>
                    <p className="text-gray-500 mt-1">Define los campos y visibilidad de tu formulario</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[
                        { num: 1, label: "Diseñar" },
                        { num: 2, label: "Asignar cuotas" },
                        { num: 3, label: "Publicar" }
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                step >= s.num ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                            )}>
                                <span className={clsx(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                    step > s.num ? "bg-white text-blue-600" : step === s.num ? "bg-white/20 text-white" : "bg-gray-200 text-gray-400"
                                )}>
                                    {step > s.num ? <Check size={14} /> : s.num}
                                </span>
                                {s.label}
                            </div>
                            {i < 2 && <ChevronRight size={20} className="text-gray-300" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del Formulario *</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Ej: Registro de vehículos"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Breve descripción del formulario"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Fecha límite <span className="text-gray-400 text-xs">(opcional)</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={fechaLimite}
                                onChange={e => setFechaLimite(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Visibility Rules */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Visibilidad</h3>
                            <button
                                onClick={handleAddVisibilidad}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                            >
                                <Plus size={16} />
                                Agregar regla
                            </button>
                        </div>

                        {visibilidad.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No hay reglas de visibilidad definidas aún.</p>
                        )}

                        <div className="space-y-3">
                            {visibilidad.map((v, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                    <select
                                        value={v.tipoDestino}
                                        onChange={e => handleTipoDestinoChange(idx, e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Tipo...</option>
                                        {VISIBILIDAD_TIPOS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <div className="flex-1">
                                        {renderVisibilidadInput(v, idx)}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveVisibilidad(idx)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fields Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Campos del Formulario</h3>
                        <button
                            onClick={addField}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Agregar Campo
                        </button>
                    </div>

                    {fields.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p>No hay campos aún. Haz clic en <strong>Agregar Campo</strong> para comenzar.</p>
                        </div>
                    )}

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="fields-droppable">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {fields.map((field, idx) => (
                                        <Draggable key={field.id} draggableId={field.id.toString()} index={idx}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={clsx(
                                                        "bg-gray-50 rounded-xl border border-gray-200 p-4 transition-all",
                                                        snapshot.isDragging && "shadow-lg ring-2 ring-blue-500"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="p-2 text-gray-400 hover:text-gray-600 cursor-grab"
                                                        >
                                                            <GripVertical size={20} />
                                                        </div>

                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: email"
                                                                    value={field.name}
                                                                    onChange={e => updateField(field.id, "name", e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Etiqueta</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ej: Correo Electrónico"
                                                                    value={field.label}
                                                                    onChange={e => updateField(field.id, "label", e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                                                <select
                                                                    value={field.type}
                                                                    onChange={e => updateField(field.id, "type", e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    {FIELD_TYPES.map(ft => (
                                                                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                {field.type === "select" && (
                                                                    <>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Opciones</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Opción1, Opción2"
                                                                            value={Array.isArray(field.options) ? field.options.join(",") : ""}
                                                                            onChange={e => updateField(field.id, "options", e.target.value.split(","))}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        {Array.isArray(field.options) && field.options.length > 0 && field.options.length <= 4 && (
                                                                            <div className="mt-2 flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`dashboard-check-${field.id}`}
                                                                                    checked={field.esResumenDashboard || false}
                                                                                    onChange={(e) => updateField(field.id, "esResumenDashboard", e.target.checked)}
                                                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                />
                                                                                <label htmlFor={`dashboard-check-${field.id}`} className="ml-2 text-xs text-gray-700">
                                                                                    Mostrar en Dashboard (Resumen)
                                                                                </label>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {field.type === "group" && (
                                                                    <>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Subformulario</label>
                                                                        <select
                                                                            value={field.subformulario || ""}
                                                                            onChange={e => updateField(field.id, "subformulario", e.target.value)}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                                                        >
                                                                            <option value="">Selecciona...</option>
                                                                            {SUBFORMULARIOS_CATALOGO.map(sf => (
                                                                                <option key={sf.value} value={sf.value}>{sf.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => removeField(field.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handleGuardar}
                        disabled={fields.length === 0 || !nombre || visibilidad.length === 0 || guardando}
                        className={clsx(
                            "px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all",
                            fields.length === 0 || !nombre || visibilidad.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                        )}
                    >
                        {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Guardar y asignar cuotas
                    </button>
                </div>

                {/* Alerts */}
                {success && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-center font-medium">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // ---------- STEP 2: QUOTAS ----------
    if (step === 2) {
        return (
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Asignar Cuotas</h2>
                    <p className="text-gray-500 mt-1">¿Cuántos registros debe ingresar cada unidad/usuario?</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[
                        { num: 1, label: "Diseñar" },
                        { num: 2, label: "Asignar cuotas" },
                        { num: 3, label: "Publicar" }
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                step >= s.num ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                            )}>
                                <span className={clsx(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                    step > s.num ? "bg-white text-blue-600" : step === s.num ? "bg-white/20 text-white" : "bg-gray-200 text-gray-400"
                                )}>
                                    {step > s.num ? <Check size={14} /> : s.num}
                                </span>
                                {s.label}
                            </div>
                            {i < 2 && <ChevronRight size={20} className="text-gray-300" />}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Add Quota Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">Agregar cuota</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                            <select
                                value={nuevaCuota.tipo}
                                onChange={e => setNuevaCuota({ ...nuevaCuota, tipo: e.target.value, valor: "", nombre: "", unidadObj: null, funcionarioObj: null })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {TIPO_CUOTA.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Destino</label>
                            {renderSelectorValorDestino()}
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={nuevaCuota.cantidad}
                                    onChange={e => setNuevaCuota({ ...nuevaCuota, cantidad: Number(e.target.value) })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={agregarCuota}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quotas Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Destino</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cuota</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cuotas.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No hay cuotas asignadas aún
                                    </td>
                                </tr>
                            )}
                            {cuotas.map((c, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{i + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{TIPO_CUOTA.find(t => t.value === c.tipo)?.label}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{c.nombre || c.valor}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {c.cantidad}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => eliminarCuota(i)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={() => setStep(1)}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={handleGuardarCuotas}
                        disabled={guardando}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                        {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Guardar y publicar
                    </button>
                </div>
            </div>
        );
    }

    // ---------- STEP 3: CONFIRMATION ----------
    return (
        <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Formulario Publicado!</h2>
            <p className="text-gray-500 mb-8">
                El formulario y las cuotas han sido guardados correctamente. Los usuarios/unidades asignadas ya pueden comenzar a ingresar registros.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
                Crear otro formulario
            </button>
        </div>
    );
}