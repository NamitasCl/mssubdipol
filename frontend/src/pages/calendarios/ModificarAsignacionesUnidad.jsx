import React, { useEffect, useState } from "react";
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

/* ------------------- Estilos básicos ------------------- */
const styleDisponible = { width: 200 };
const styleCalendario = { width: "100%" };

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

/* ---------------------- Componente ---------------------- */
export default function ModificarAsignacionesUnidad() {
    const { user } = useAuth();
    const [locations, setLocations] = useState({});
    const [calendarios, setCalendarios] = useState([]);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [funcionariosAportadosUnidad, setFuncionariosAportadosUnidad] = useState([]);
    const [slots, setSlots] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [banderaRefresco, setBanderaRefresco] = useState(false);

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
        console.log("Asignaciones actuales:", asignaciones);
    }, [asignaciones]);

    /* -------- Cargar slots del calendario seleccionado -------- */
    useEffect(() => {
        if (!calendarioSeleccionado || !user?.idUnidad) return;

        getSlotsByCalendario(calendarioSeleccionado.id).then((data) => {
            const slotsUnidad = data.filter(
                (slot) => slot.siglasUnidadFuncionario === user.siglasUnidad
            );

            // Normalizar la fecha de cada slot
            const normalizados = slotsUnidad.map((slot) => ({
                ...slot,
                fechaNormalizada: format(addHours(parseISO(slot.fecha), 4), "yyyy-MM-dd"),
            }));

            setFuncionariosAportadosUnidad(normalizados);
            setSlots(data);

            // Inicializar ubicaciones basadas en la fecha normalizada
            const ubicaciones = Object.fromEntries(
                normalizados.map((slot) => [`${slot.id}-item`, slot.fechaNormalizada])
            );
            setLocations(ubicaciones);
        });
    }, [calendarioSeleccionado, user, banderaRefresco]);

    const sensors = useSensors(useSensor(PointerSensor));

    // Generar días del mes para el calendario
    const diasDelMes = calendarioSeleccionado
        ? eachDayOfInterval({
            start: new Date(calendarioSeleccionado.anio, calendarioSeleccionado.mes - 1, 1),
            end: endOfMonth(new Date(calendarioSeleccionado.anio, calendarioSeleccionado.mes - 1, 1)),
        })
        : [];

    /* -------------------- DnD handlers -------------------- */
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragCancel = () => setActiveId(null);

    const handleDragEnd = async (event) => {
        setActiveId(null);
        const { over, active } = event;

        if (!(over && active)) return;

        const sourceSlotId = parseInt(active.id.split("-")[0], 10);
        const sourceSlot = slots.find((s) => s.id === sourceSlotId);
        if (!sourceSlot) return;

        const targetDate = over.id; // formato yyyy-MM-dd

        // Encontrar un slot de la unidad en esa fecha con el mismo rol (y mismo recinto si corresponde) para intercambiar
        const candidate = funcionariosAportadosUnidad.find(
            (f) =>
                locations[`${f.id}-item`] === targetDate &&
                f.rolRequerido === sourceSlot.rolRequerido &&
                f.id !== sourceSlot.id &&
                f.recinto === sourceSlot.recinto
        );

        if (!candidate) {
            alert("No hay un funcionario con el mismo rol en ese día para intercambiar.");
            // Revertir visualmente (no cambia nada, solo corta el intento)
            setLocations((prev) => ({ ...prev }));
            return;
        }

        try {
            await swapSlots(sourceSlot.id, candidate.id);

            // Actualizar ubicaciones locales: intercambiar las fechas de ambos elementos
            setLocations((prev) => {
                const prevSourceLoc = prev[`${sourceSlot.id}-item`];
                const prevTargetLoc = prev[`${candidate.id}-item`];
                return {
                    ...prev,
                    [`${sourceSlot.id}-item`]: prevTargetLoc,
                    [`${candidate.id}-item`]: prevSourceLoc,
                };
            });

            // Reflejar también en asignaciones locales (opcional/simple)
            setAsignaciones((prevAsig) => {
                const sinAmbos = prevAsig.filter(
                    (a) => a.id !== sourceSlot.id && a.id !== candidate.id
                );
                return [
                    ...sinAmbos,
                    { ...sourceSlot, fecha: targetDate },
                    {
                        ...candidate,
                        fecha:
                            prevAsig.find((a) => a.id === sourceSlot.id)?.fecha ||
                            locations[`${sourceSlot.id}-item`],
                    },
                ];
            });
        } catch (e) {
            console.error(e);
            alert(
                "No se pudo realizar el intercambio: " +
                (e?.response?.data?.message || e.message)
            );
            // Revertir visualmente
            setLocations((prev) => ({ ...prev }));
        } finally {
            setBanderaRefresco(b => !b);
        }
    };

    // Util para DragOverlay: obtener el funcionario por draggableId
    const getFuncionarioByDraggableId = (draggableId) => {
        const slotId = parseInt(draggableId.split("-")[0], 10);
        return (
            funcionariosAportadosUnidad.find((f) => f.id === slotId) ||
            slots.find((s) => s.id === slotId)
        );
    };

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

                            return (
                                <Droppable key={fechaStr} id={fechaStr} label={format(dia, "dd/MM")}>
                                    {funcionariosAportadosUnidad
                                        .filter((f) => locations[`${f.id}-item`] === fechaStr)
                                        .map((f) => (
                                            <Draggable key={f.id} id={`${f.id}-item`} funcionario={f} activeId={activeId} />
                                        ))}
                                </Droppable>
                            );
                        })}
                    </div>
                </div>

                {/* DragOverlay: renderiza el ítem flotando, fuera del flujo */}
                {createPortal(
                    <DragOverlay
                        dropAnimation={{
                            duration: 180,
                            easing: "ease-out",
                        }}
                    >
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
        </>
    );
}

/* ---------------------- Draggable ---------------------- */
function Draggable({ id, funcionario, activeId }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

    const isActive = activeId === id;

    const style = {
        width: 150,
        padding: 10,
        margin: 5,
        backgroundColor: "#ffffff",
        border: "1px solid #d1d5db",
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
        transition: "box-shadow .15s ease",
        boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,.2)" : "none",
        color: "#17355A"
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="d-flex flex-column align-items-center"
        >
            <span>{funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}</span>
            <span style={{ fontWeight: "bold" }}>{funcionario?.nombreServicio}</span>
            <span style={{ fontWeight: "bold" }}>{funcionario?.recinto}</span>
            <span style={{ fontWeight: "bold" }}>
        {funcionario?.rolRequerido === "JEFE_DE_SERVICIO" ? "" : rolToLabel[funcionario?.rolRequerido]}
      </span>
        </div>
    );
}

/* ----------- Vista del ítem en DragOverlay -------------- */
function DraggablePreview({ id, funcionario }) {
    // Usa el mismo look & feel, pero sin listeners ni transform
    return (
        <div
            style={{
                width: 150,
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
            <span>{funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}</span>
            <span style={{ display: "block", fontWeight: "bold" }}>{funcionario?.nombreServicio}</span>
            <span style={{ display: "block", fontWeight: "bold" }}>{funcionario?.recinto}</span>
            <span style={{ display: "block", fontWeight: "bold" }}>
        {funcionario?.rolRequerido === "JEFE_DE_SERVICIO" ? "" : rolToLabel[funcionario?.rolRequerido]}
      </span>
        </div>
    );
}

/* ---------------------- Droppable ---------------------- */
function Droppable({ id, label, children, style: customStyle = {} }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    const baseBackground = customStyle.backgroundColor || "#f4f6f9";
    const backgroundColor = isOver ? "#b0eacb" : baseBackground;

    const combinedStyle = {
        minHeight: 300,
        maxHeight: 500,
        overflowY: "auto",
        overflowX: "hidden", // <- evita scroll horizontal en el día
        border: "2px solid #aaa",
        display: "flex",
        flexDirection: "column",
        padding: 10,
        borderRadius: 10,
        transition: "background-color 0.2s",
        ...customStyle,
        backgroundColor,
    };

    const listStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        alignContent: "flex-start",
        maxWidth: "100%", // <- no crezcas más que el contenedor
        boxSizing: "border-box",
    };

    return (
        <div ref={setNodeRef} style={combinedStyle} className="dayCell">
            <div style={{ marginBottom: 10, fontWeight: "bold", fontSize: 15 }}>{label}</div>
            <div style={listStyle}>{children}</div>
        </div>
    );
}
