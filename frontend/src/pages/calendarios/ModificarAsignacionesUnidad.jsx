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
// ⬆️ Mantengo tus APIs actuales
import { listarCalendarios } from "../../api/calendarApi.js";
import { getSlotsByCalendario, swapSlots } from "../../api/slotApi.js";
import { addHours, eachDayOfInterval, endOfMonth, format, parseISO } from "date-fns";

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
    const [selectedSourceId, setSelectedSourceId] = useState(null); // click-to-select
    const [validDropDates, setValidDropDates] = useState(new Set()); // fechas válidas durante drag/selección
    const [modalState, setModalState] = useState({
        open: false,
        step: "confirm", // "confirm" | "pick"
        source: null,    // slot source
        candidates: [],  // si hay múltiples
        target: null,    // slot target elegido
        targetDate: null // fecha destino cuando soltamos por día
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

    useEffect(() => {

    }, [funcionariosAportadosUnidad])

    /* -------- Cargar slots del calendario seleccionado -------- */
    useEffect(() => {
        if (!calendarioSeleccionado || !user?.idUnidad) return;

        getSlotsByCalendario(calendarioSeleccionado.id).then((data) => {


            const slotsUnidad = data.filter(
                (slot) => slot.siglasUnidadFuncionario === user.siglasUnidad
            );

            // Normalizar la fecha (si ya migraste a timestamptz estable, puedes quitar addHours)
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

    // Funcion helper para saber que funcionario es mas antiguo
    const getFuncionarioMasAntiguo = (fun1, fun2) => {
        let funcionarioMasAntiguo = null;
        const grados = ["PFT","SPF","SPF (OPP)","COM","COM (OPP)",
            "SBC","SBC (OPP)","ISP","SBI","DTV","APS","AP","APP","APP (AC)"]

        const posicionFuncionarioUno = grados.indexOf(fun1.gradoFuncionario)
        const posicionFuncionarioDos = grados.indexOf(fun2.gradoFuncionario)

        if(posicionFuncionarioUno === posicionFuncionarioDos) {
            funcionarioMasAntiguo = fun1.antiguedadFuncionario < fun2.antiguedadFuncionario ? fun1 : fun2;
        } else {
            funcionarioMasAntiguo = posicionFuncionarioUno < posicionFuncionarioDos ? fun1 : fun2
        }

        return funcionarioMasAntiguo;

    }



    const sensors = useSensors(useSensor(PointerSensor));

    // Generar días del mes para el calendario
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
        // un día es válido si existe al menos 1 candidato compatible en ese día
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
        setSelectedSourceId(null); // si arrastras, sales del modo selección
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

        const targetDate = over.id; // yyyy-MM-dd (drop por día)
        const list = candidatesForDate(sourceSlot, targetDate);

        if (list.length === 0) {
            // feedback directo
            toastLike("No hay un slot compatible en ese día.", "error");
            return;
        }

        if (list.length === 1) {
            // confirmación directa
            openConfirmModal({ source: sourceSlot, target: list[0], targetDate });
        } else {
            // pedir elección y luego confirmar
            openPickModal({ source: sourceSlot, candidates: list, targetDate });
        }
    };

    /* -------------------- Click-to-select (alternativa sin DnD) -------------------- */
    const handleCardClick = (f) => {
        if (!selectedSourceId) {
            setSelectedSourceId(f.id); // marca origen
            // recalcula destinos válidos por día para resaltar
            const sourceSlot = getSlotById(f.id) || f; // f ya tiene mismos campos
            setValidDropDates(recomputeValidDates(sourceSlot));
            return;
        }

        // Si ya hay origen seleccionado y haces clic en otro:
        if (selectedSourceId === f.id) {
            // deseleccionar
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

    /* -------------------- Modal / Confirmación -------------------- */
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

            // optimista: intercambia ubicaciones locales
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
            setBanderaRefresco((b) => !b); // recargar desde backend
        }
    };

    /* -------------------- Render -------------------- */
    return (
        <>
            <label className="form-label mt-3">Selecciona un calendario:</label>
            <select
                className="form-select mb-3"
                value={calendarioSeleccionado?.id || ""}
                onChange={(e) =>
                    setCalendarioSeleccionado(
                        calendarios.find((c) => c.id.toString() === e.target.value)
                    )
                }
            >
                <option value="">-- Selecciona --</option>
                {calendarios.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre}
                    </option>
                ))}
            </select>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div
                    className="calendarGrid"
                    style={{ display: "flex", gap: "40px", padding: "10px", overflowX: "hidden" }}
                >
                    {/* Zona calendario: una columna por día */}
                    <div
                        style={{
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: 10,
                        }}
                    >
                        {diasDelMes.map((dia) => {
                            const fechaStr = format(dia, "yyyy-MM-dd");
                            const isValidDay = validDropDates.has(fechaStr);

                            return (
                                <Droppable
                                    key={fechaStr}
                                    id={fechaStr}
                                    label={format(dia, "dd/MM")}
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

                {/* DragOverlay: ítem flotando */}
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

            {/* Modal de confirmación / selección */}
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
        </>
    );
}

/* ==================== Subcomponentes & estilos ==================== */

/* ---- Tarjeta Draggable con selección por clic ---- */
function DraggableCard({ id, funcionario, activeId, selected, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const isActive = activeId === id;

    const style = {
        width: 160,
        padding: 10,
        margin: 5,
        backgroundColor: selected ? "#eff6ff" : "#ffffff",
        border: selected ? "2px solid #3b82f6" : "1px solid #d1d5db",
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        cursor: isDragging ? "grabbing" : "grab",
        borderRadius: 8,
        textAlign: "center",
        fontSize: 12,
        opacity: isActive ? 0 : 1,
        pointerEvents: isActive ? "none" : "auto",
        position: "relative",
        zIndex: isDragging ? 999 : "auto",
        willChange: "transform",
        boxSizing: "border-box",
        transition: "box-shadow .15s ease, border-color .15s ease, background-color .15s ease",
        boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,.2)" : "none",
        color: "#17355A",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="d-flex flex-column align-items-center"
            title={`${funcionario?.nombreServicio ?? ""} • ${funcionario?.recinto ?? ""}`}
        >
            <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                {funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>
                {funcionario?.nombreServicio} • {funcionario?.recinto}
            </div>
            <div style={{ marginTop: 6, fontSize: 11 }}>
                <RolBadge rol={funcionario?.rolRequerido} />
            </div>
        </div>
    );
}

function DraggablePreview({ id, funcionario }) {
    return (
        <div
            style={{
                width: 180,
                padding: 10,
                margin: 5,
                backgroundColor: "#bfdbfe",
                borderRadius: 8,
                textAlign: "center",
                fontSize: 12,
                boxShadow: "0 12px 28px rgba(0,0,0,.25)",
                cursor: "grabbing",
            }}
        >
            <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                {funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>
                {funcionario?.nombreServicio} • {funcionario?.recinto}
            </div>
            <div style={{ marginTop: 6, fontSize: 11 }}>
                <RolBadge rol={funcionario?.rolRequerido} />
            </div>
        </div>
    );
}

/* ---- Contenedor Droppable por día con feedback visual ---- */
function Droppable({ id, label, children, valid, style: customStyle = {} }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    const baseBackground = customStyle.backgroundColor || "#f4f6f9";
    let backgroundColor = baseBackground;
    let borderColor = "#aaa";

    if (isOver && valid) {
        backgroundColor = "#d7f5e3"; // verde suave compatible
        borderColor = "#22c55e";
    } else if (isOver && !valid) {
        backgroundColor = "#fee2e2"; // rojo suave incompatible
        borderColor = "#ef4444";
    } else if (!isOver && valid) {
        backgroundColor = "#eefcf5"; // resalte leve en días válidos
        borderColor = "#86efac";
    }

    const combinedStyle = {
        minHeight: 300,
        maxHeight: 500,
        overflowY: "auto",
        overflowX: "hidden",
        border: `2px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        padding: 10,
        borderRadius: 10,
        transition: "background-color 0.15s, border-color 0.15s",
        ...customStyle,
        backgroundColor,
    };

    const listStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        alignContent: "flex-start",
        maxWidth: "100%",
        boxSizing: "border-box",
    };

    return (
        <div ref={setNodeRef} style={combinedStyle} className="dayCell">
            <div style={{ marginBottom: 10, fontWeight: "bold", fontSize: 15 }}>{label}</div>
            <div style={listStyle}>{children}</div>
        </div>
    );
}

/* ---- Badge de rol ---- */
function RolBadge({ rol }) {
    //if (!rol || rol === "JEFE_DE_SERVICIO") return null;
    const label = rolToLabel[rol] ?? rol;
    return (
        <span
            style={{
                padding: "2px 6px",
                borderRadius: 999,
                fontSize: 11,
                background: "#e5e7eb",
                border: "1px solid #d1d5db",
            }}
        >
      {label}
    </span>
    );
}

/* ----------------- Modal simple (sin dependencias) ----------------- */
function ConfirmModal({
                          open,
                          step,
                          source,
                          target,
                          candidates,
                          targetDate,
                          onClose,
                          onPickCandidate,
                          onConfirm,
                      }) {
    if (!open) return null;

    const wrapStyle = {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    };
    const modalStyle = {
        width: 500,
        maxWidth: "90vw",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 20px 50px rgba(0,0,0,.25)",
        padding: 18,
    };
    const titleStyle = { fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0f172a" };
    const subStyle = { fontSize: 13, color: "#475569", marginBottom: 12 };

    if (step === "pick") {
        return (
            <div style={wrapStyle} onClick={onClose}>
                <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={titleStyle}>Selecciona el destino</div>
                    <div style={subStyle}>
                        Se encontraron varios slots compatibles el{" "}
                        <strong>{format(parseISO(`${targetDate}T00:00:00`), "dd/MM/yyyy")}</strong>.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                        {candidates.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => onPickCandidate(c)}
                                style={{
                                    textAlign: "left",
                                    border: "1px solid #e5e7eb",
                                    background: "#f8fafc",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>
                                    {c?.nombreFuncionario ?? c?.nombreCompleto ?? "Funcionario"}
                                </div>
                                <div style={{ fontSize: 12, color: "#334155" }}>
                                    {c?.nombreServicio} • {c?.recinto}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={onClose} className="btn btn-light">Cancelar</button>
                    </div>
                </div>
            </div>
        );
    }

    // step === "confirm"
    return (
        <div style={wrapStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={titleStyle}>Confirmar Intercambio de Turno</div>
                <div style={subStyle}>Revisa los detalles antes de confirmar:</div>

                <div style={rowStyle}>
                    <SwapRow
                        title="Origen"
                        nombre={source?.nombreFuncionario ?? source?.nombreCompleto}
                        servicio={source?.nombreServicio}
                        fechaStr={source ? format(parseISO(source.fecha), "dd/MM/yyyy") : "—"}
                    />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#64748b" }}>↔</div>
                    <SwapRow
                        title="Destino"
                        nombre={target?.nombreFuncionario ?? target?.nombreCompleto}
                        servicio={target?.nombreServicio}
                        fechaStr={target ? format(parseISO(target.fecha), "dd/MM/yyyy") : "—"}
                    />
                </div>

                <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} className="btn btn-light">Cancelar</button>
                    <button onClick={onConfirm} className="btn btn-primary">Confirmar intercambio</button>
                </div>
            </div>
        </div>
    );
}

const rowStyle = { display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" };

function SwapRow({ title, nombre, servicio, fechaStr }) {
    return (
        <div style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 10,
            background: "#f8fafc"
        }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{title}</div>
            <div style={{ fontWeight: 600 }}>{nombre ?? "Funcionario"}</div>
            <div style={{ fontSize: 12, color: "#334155" }}>{servicio} • {fechaStr}</div>
        </div>
    );
}

/* ----------------- Toast mínimo (placeholder) ----------------- */
function toastLike(msg, type = "info") {
    // Reemplázalo por tu sistema de toasts
    if (type === "error") alert(`❌ ${msg}`);
    else if (type === "success") alert(`✅ ${msg}`);
    else alert(msg);
}
