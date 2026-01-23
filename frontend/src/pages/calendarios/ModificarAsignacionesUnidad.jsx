import React, { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { listarCalendarios } from "../../api/calendarApi.js";
import { getSlotsByCalendario, swapSlots } from "../../api/slotApi.js";
import { addHours, eachDayOfInterval, endOfMonth, format, parseISO } from "date-fns";
import { AlertCircle, CheckCircle, ArrowLeftRight, User } from 'lucide-react';

/* ------------------- Etiquetas de roles ------------------- */
const rolToLabel = {
    JEFE_DE_SERVICIO: "Jefe de Servicio",
    JEFE_DE_MAQUINA: "Jefe de máquina",
    PRIMER_TRIPULANTE: "Primer tripulante",
    SEGUNDO_TRIPULANTE: "Segundo tripulante",
    TRIPULANTE: "Tripulante",
    ENCARGADO_DE_TURNO: "Encargado de turno",
    ENCARGADO_DE_GUARDIA: "Encargado de guardia",
    AYUDANTE_DE_GUARDIA: "Ayudante de guardia",
    JEFE_DE_RONDA: "Jefe de ronda",
    GUARDIA_ARMADO: "Guardia armado",
    REFUERZO_DE_GUARDIA: "Refuerzo de guardia",
};

/* ==================== Componente principal ==================== */
export default function ModificarAsignacionesUnidad() {
    const { user } = useAuth();

    const [locations, setLocations] = useState({});
    const [calendarios, setCalendarios] = useState([]);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [funcionariosAportadosUnidad, setFuncionariosAportadosUnidad] = useState([]);
    const [slots, setSlots] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [banderaRefresco, setBanderaRefresco] = useState(false);

    // Para UI/UX avanzada
    const [selectedSourceId, setSelectedSourceId] = useState(null); 
    const [validDropDates, setValidDropDates] = useState(new Set()); 
    const [modalState, setModalState] = useState({
        open: false,
        step: "confirm", 
        source: null,    
        candidates: [],  
        target: null,    
        targetDate: null 
    });

    /* ---------- Cargar calendarios según unidad ---------- */
    useEffect(() => {
        if (!user?.idUnidad) return;
        listarCalendarios().then((all) =>
            setCalendarios(
                all.filter(
                    (c) =>
                        (c.tipo === "UNIDAD" && c.idUnidad === user.idUnidad) ||
                        (c.tipo === "COMPLEJO" &&
                            (c.aporteUnidadTurnos || []).some((a) => a.idUnidad === user.idUnidad))
                )
            )
        );
    }, [user]);

    /* -------- Cargar slots del calendario seleccionado -------- */
    useEffect(() => {
        if (!calendarioSeleccionado || !user?.idUnidad) return;

        getSlotsByCalendario(calendarioSeleccionado.id).then((data) => {
            const slotsUnidad = data.filter(
                (slot) => slot.siglasUnidadFuncionario === user.siglasUnidad
            );

            // Normalizar la fecha
            const normalizados = slotsUnidad.map((slot) => ({
                ...slot,
                fechaNormalizada: format(addHours(parseISO(slot.fecha), 4), "yyyy-MM-dd"),
            }));

            setFuncionariosAportadosUnidad(normalizados);
            setSlots(data);

            const ubicaciones = Object.fromEntries(
                normalizados.map((slot) => [`${slot.id}-item`, slot.fechaNormalizada])
            );
            setLocations(ubicaciones);
        });
    }, [calendarioSeleccionado, user, banderaRefresco]);

    const sensors = useSensors(useSensor(PointerSensor));

    const diasDelMes = calendarioSeleccionado
        ? eachDayOfInterval({
            start: new Date(calendarioSeleccionado.anio, calendarioSeleccionado.mes - 1, 1),
            end: endOfMonth(new Date(calendarioSeleccionado.anio, calendarioSeleccionado.mes - 1, 1)),
        })
        : [];

    /* -------------------- Helpers de compatibilidad -------------------- */
    const getSlotById = (idNum) => slots.find((s) => s.id === idNum);
    const getFuncionarioByDraggableId = (draggableId) => {
        const slotId = parseInt(draggableId.split("-")[0], 10);
        return (
            funcionariosAportadosUnidad.find((f) => f.id === slotId) ||
            slots.find((s) => s.id === slotId)
        );
    };
    const isCompatible = (a, b) =>
        a &&
        b &&
        a.rolRequerido === b.rolRequerido &&
        a.recinto === b.recinto &&
        a.id !== b.id &&
        a.siglasUnidadFuncionario === b.siglasUnidadFuncionario;

    const candidatesForDate = (sourceSlot, fechaStr) =>
        funcionariosAportadosUnidad.filter(
            (f) =>
                locations[`${f.id}-item`] === fechaStr &&
                isCompatible(sourceSlot, f)
        );

    const recomputeValidDates = (sourceSlot) => {
        const dates = new Set();
        if (!sourceSlot) return dates;
        for (const f of funcionariosAportadosUnidad) {
            if (isCompatible(sourceSlot, f)) {
                const d = locations[`${f.id}-item`];
                if (d) dates.add(d);
            }
        }
        return dates;
    };

    /* -------------------- DnD handlers -------------------- */
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        setSelectedSourceId(null);
        const sourceSlotId = parseInt(event.active.id.split("-")[0], 10);
        const sourceSlot = getSlotById(sourceSlotId);
        setValidDropDates(recomputeValidDates(sourceSlot));
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setValidDropDates(new Set());
    };

    const handleDragEnd = async (event) => {
        setActiveId(null);
        const { over, active } = event;
        setValidDropDates(new Set());
        if (!(over && active)) return;

        const sourceSlotId = parseInt(active.id.split("-")[0], 10);
        const sourceSlot = getSlotById(sourceSlotId);
        if (!sourceSlot) return;

        const targetDate = over.id;
        const list = candidatesForDate(sourceSlot, targetDate);

        if (list.length === 0) {
            toastLike("No hay un slot compatible en ese día.", "error");
            return;
        }

        if (list.length === 1) {
            openConfirmModal({ source: sourceSlot, target: list[0], targetDate });
        } else {
            openPickModal({ source: sourceSlot, candidates: list, targetDate });
        }
    };

    /* -------------------- Click-to-select -------------------- */
    const handleCardClick = (f) => {
        if (!selectedSourceId) {
            setSelectedSourceId(f.id);
            const sourceSlot = getSlotById(f.id) || f;
            setValidDropDates(recomputeValidDates(sourceSlot));
            return;
        }
        if (selectedSourceId === f.id) {
            setSelectedSourceId(null);
            setValidDropDates(new Set());
            return;
        }
        const source = getSlotById(selectedSourceId);
        const target = getSlotById(f.id) || f;
        if (!isCompatible(source, target)) {
            toastLike("Ese destino no es compatible para intercambio.", "error");
            return;
        }
        openConfirmModal({ source, target, targetDate: locations[`${target.id}-item`] });
    };

    /* -------------------- Modal Actions -------------------- */
    const openConfirmModal = ({ source, target, targetDate }) =>
        setModalState({ open: true, step: "confirm", source, target, targetDate, candidates: [] });

    const openPickModal = ({ source, candidates, targetDate }) =>
        setModalState({ open: true, step: "pick", source, candidates, target: null, targetDate });

    const closeModal = () => setModalState({ open: false, step: "confirm", source: null, target: null, candidates: [], targetDate: null });

    const onPickCandidate = (cand) => {
        setModalState((m) => ({ ...m, step: "confirm", target: cand, candidates: [] }));
    };

    const doSwap = async () => {
        const { source, target } = modalState;
        if (!(source && target)) return;
        try {
            await swapSlots(source.id, target.id);
            setLocations((prev) => {
                const a = prev[`${source.id}-item`];
                const b = prev[`${target.id}-item`];
                return { ...prev, [`${source.id}-item`]: b, [`${target.id}-item`]: a };
            });
            toastLike("¡Intercambio realizado con éxito!", "success");
        } catch (e) {
            console.error(e);
            toastLike(e?.response?.data?.message || e.message || "No se pudo realizar el intercambio", "error");
        } finally {
            closeModal();
            setSelectedSourceId(null);
            setBanderaRefresco((b) => !b);
        }
    };

    return (
        <div className="w-full">
            {/* Header / Selector */}
            <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-bold text-pdi-base mb-1">Modificación de Servicios</h2>
                   <p className="text-sm text-gray-500">Seleccione un calendario para gestionar los turnos</p>
                </div>
                
                <div className="w-72">
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">Calendario</label>
                    <select
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-medium"
                        value={calendarioSeleccionado?.id || ""}
                        onChange={(e) =>
                            setCalendarioSeleccionado(
                                calendarios.find((c) => c.id.toString() === e.target.value)
                            )
                        }
                    >
                        <option value="">-- Seleccionar --</option>
                        {calendarios.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="overflow-x-auto pb-6">
                    <div 
                        className="grid gap-4" 
                        style={{ gridTemplateColumns: "repeat(7, minmax(180px, 1fr))" }}
                    >
                        {diasDelMes.map((dia) => {
                            const fechaStr = format(dia, "yyyy-MM-dd");
                            const isValidDay = validDropDates.has(fechaStr);

                            return (
                                <Droppable
                                    key={fechaStr}
                                    id={fechaStr}
                                    label={format(dia, "dd/MM - EEEE")}
                                    valid={isValidDay}
                                >
                                    {funcionariosAportadosUnidad
                                        .filter((f) => locations[`${f.id}-item`] === fechaStr)
                                        .map((f) => (
                                            <DraggableCard
                                                key={f.id}
                                                id={`${f.id}-item`}
                                                funcionario={f}
                                                activeId={activeId}
                                                selected={selectedSourceId === f.id}
                                                onClick={() => handleCardClick(f)}
                                            />
                                        ))}
                                </Droppable>
                            );
                        })}
                    </div>
                </div>

                {createPortal(
                    <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
                        {activeId ? (
                            <DraggablePreview
                                id={activeId}
                                funcionario={getFuncionarioByDraggableId(activeId)}
                            />
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {modalState.open && (
                <ConfirmModal
                    open={modalState.open}
                    step={modalState.step}
                    source={modalState.source}
                    target={modalState.target}
                    candidates={modalState.candidates}
                    targetDate={modalState.targetDate}
                    onClose={closeModal}
                    onPickCandidate={onPickCandidate}
                    onConfirm={doSwap}
                />
            )}
        </div>
    );
}

/* ==================== Subcomponentes & estilos ==================== */

function DraggableCard({ id, funcionario, activeId, selected, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const isActive = activeId === id;

    const baseClasses = "relative bg-white border rounded-xl p-3 mb-2 cursor-grab transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md";
    const selectedClasses = selected ? "ring-2 ring-pdi-base border-pdi-base bg-blue-50/50" : "border-gray-200 hover:border-blue-300";
    const draggingClasses = isDragging ? "opacity-30" : "opacity-100";

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        zIndex: isDragging ? 999 : "auto",
        transition: "box-shadow 0.15s, border-color 0.15s, transform 0.1s",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`${baseClasses} ${selectedClasses} ${draggingClasses}`}
            title={`${funcionario?.nombreServicio ?? ""} • ${funcionario?.recinto ?? ""}`}
        >
            <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 p-1.5 rounded-lg ${selected ? 'bg-pdi-base text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'} transition-colors`}>
                   <User size={14} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate mb-0.5 leading-tight">
                        {funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mb-1.5">
                        {funcionario?.nombreServicio}
                    </p>
                     <RolBadge rol={funcionario?.rolRequerido} />
                </div>
            </div>
        </div>
    );
}

function DraggablePreview({ id, funcionario }) {
    return (
        <div className="bg-white border-2 border-pdi-base shadow-xl rounded-xl p-3 w-48 cursor-grabbing transform rotate-2">
             <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1.5 rounded-lg bg-pdi-base text-white">
                   <User size={14} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate mb-0.5 leading-tight">
                        {funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mb-1.5">
                        {funcionario?.nombreServicio}
                    </p>
                     <RolBadge rol={funcionario?.rolRequerido} />
                </div>
            </div>
        </div>
    );
}

function Droppable({ id, label, children, valid }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    let bgClass = "bg-gray-50/50";
    let borderClass = "border-gray-200 border-dashed";

    if (isOver && valid) {
        bgClass = "bg-emerald-50";
        borderClass = "border-emerald-400 border-solid ring-2 ring-emerald-100";
    } else if (isOver && !valid) {
        bgClass = "bg-rose-50";
        borderClass = "border-rose-400 border-solid ring-2 ring-rose-100";
    } else if (!isOver && valid) {
        bgClass = "bg-blue-50/30"; 
        borderClass = "border-blue-200 border-dashed";
    }

    return (
        <div 
            ref={setNodeRef} 
            className={`rounded-xl border-2 p-3 min-h-[300px] flex flex-col transition-colors duration-200 ${bgClass} ${borderClass}`}
        >
            <div className="mb-3 pb-2 border-b border-gray-200/50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
                <span className="text-[10px] font-medium bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {React.Children.count(children)}
                </span>
            </div>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}

function RolBadge({ rol }) {
    const label = rolToLabel[rol] ?? rol;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            {label}
        </span>
    );
}

function ConfirmModal({ open, step, source, target, candidates, targetDate, onClose, onPickCandidate, onConfirm }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {step === "pick" ? (
                    <>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Selecciona el destino</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Múltiples opciones disponibles para el <strong>{format(parseISO(`${targetDate}T00:00:00`), "dd/MM/yyyy")}</strong>.
                            </p>
                        </div>
                        <div className="p-4 max-h-80 overflow-y-auto space-y-2 bg-gray-50/50">
                            {candidates.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => onPickCandidate(c)}
                                    className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 p-4 rounded-xl transition-all shadow-sm group"
                                >
                                    <div className="font-bold text-gray-900 group-hover:text-blue-700">
                                        {c?.nombreFuncionario ?? c?.nombreCompleto ?? "Funcionario"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {c?.nombreServicio} • {c?.recinto}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                <ArrowLeftRight size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirmar Intercambio</h3>
                                <p className="text-sm text-gray-500 mt-1">¿Estás seguro de realizar este cambio de turno?</p>
                            </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Origen</div>
                                <div className="font-bold text-gray-900 mb-1">{source?.nombreFuncionario}</div>
                                <div className="text-xs text-gray-500">
                                    {source ? format(parseISO(source.fecha), "dd/MM") : "-"}
                                </div>
                            </div>
                             
                            <div className="text-gray-300">
                                <ArrowLeftRight size={20} />
                            </div>

                            <div className="bg-white border border-gray-200 p-4 rounded-xl text-center">
                                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Destino</div>
                                <div className="font-bold text-gray-900 mb-1">{target?.nombreFuncionario}</div>
                                <div className="text-xs text-gray-500">
                                    {target ? format(parseISO(target.fecha), "dd/MM") : "-"}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-pdi-base hover:bg-blue-800 rounded-lg shadow-sm transition-colors">
                                Confirmar Cambio
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function toastLike(msg, type = "info") {
    // Simple alert for now, could be replaced with a real toast component
    // Assuming you have a toast system, or just browser alert for MVP
    // Ideally use: import { toast } from 'react-hot-toast'; toast.success(...)
    if(type === 'error'){
        console.error(msg);
    } else {
        console.log(msg);
    }
}
