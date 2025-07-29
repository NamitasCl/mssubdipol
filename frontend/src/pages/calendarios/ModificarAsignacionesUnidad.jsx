import React, { useEffect, useState } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { listarCalendarios } from "../../api/calendarApi.js";
import { getSlotsByCalendario } from "../../api/slotApi.js";
import {addHours, eachDayOfInterval, endOfMonth, format, parseISO} from "date-fns";

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
    REFUERZO_DE_GUARDIA: "Refuerzo de guardia"
};

/* ---------------------- Componente ---------------------- */
export default function ModificarAsignacionesUnidad() {
    const { user } = useAuth();
    const [locations, setLocations] = useState({});
    const [calendarios, setCalendarios] = useState([]);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [funcionariosAportadosUnidad, setFuncionariosAportadosUnidad] = useState([]);
    const [slots, setSlots] = useState([]);

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

            // Normalizar la fecha de cada slot
            const normalizados = slotsUnidad.map(slot => ({
                ...slot,
                fechaNormalizada: format(addHours(parseISO(slot.fecha), 4), "yyyy-MM-dd")
            }));

            setFuncionariosAportadosUnidad(normalizados);
            console.log("Slots: ", slotsUnidad);
            setSlots(data);

            // Inicializar ubicaciones basadas en la fecha normalizada
            const ubicaciones = Object.fromEntries(
                normalizados.map((slot) => [`${slot.id}-item`, slot.fechaNormalizada])
            );
            setLocations(ubicaciones);
        });
    }, [calendarioSeleccionado, user]);

    const sensors = useSensors(useSensor(PointerSensor));

    // Generar días del mes para el calendario
    const diasDelMes = calendarioSeleccionado
        ? eachDayOfInterval({
            start: new Date(calendarioSeleccionado.anio, calendarioSeleccionado.mes - 1, 1),
            end: endOfMonth(new Date(calendarioSeleccionado.anio, calendarioSeleccionado.mes - 1, 1))
        })
        : [];

    const handleDragEnd = (event) => {
        const { over, active } = event;

        if (over && active) {
            setLocations((prev) => ({
                ...prev,
                [active.id]: over.id
            }));
        }
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

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div style={{ display: "flex", gap: "40px", padding: "10px" }}>
                    {/* Zona de personal disponible */}
                    <Droppable id="zoneA" label="Personal disponible" style={styleDisponible}>
                        {funcionariosAportadosUnidad
                            .filter((f) => locations[`${f.id}-item`] === "zoneA")
                            .map((f) => (
                                <Draggable key={f.id} id={`${f.id}-item`} funcionario={f} />
                            ))}
                    </Droppable>

                    {/* Zona calendario: una columna por día */}
                    <div
                        style={{
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: 10
                        }}
                    >
                        {diasDelMes.map((dia) => {
                            const fechaStr = format(dia, "yyyy-MM-dd");

                            return (
                                <Droppable key={fechaStr} id={fechaStr} label={format(dia, "dd/MM")}>
                                    {funcionariosAportadosUnidad
                                        .filter((f) => locations[`${f.id}-item`] === fechaStr)
                                        .map((f) => (
                                            <Draggable key={f.id} id={`${f.id}-item`} funcionario={f} />
                                        ))}
                                </Droppable>
                            );
                        })}
                    </div>
                </div>
            </DndContext>
        </>
    );
}

/* ---------------------- Draggable ---------------------- */
function Draggable({ id, funcionario }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    const style = {
        width: 150,
        padding: 10,
        margin: 5,
        backgroundColor: "orange",
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        cursor: "grab",
        borderRadius: 8,
        textAlign: "center",
        fontSize: 12
    };

    return (
        <>
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="d-flex flex-column align-items-center">
                <span>{funcionario?.nombreFuncionario ?? funcionario?.nombreCompleto ?? "Funcionario"}</span>
                <span style={{fontWeight: "bold"}}>{funcionario?.nombreServicio}</span>
                <span style={{fontWeight: "bold"}}>{funcionario?.recinto}</span>
                <span style={{fontWeight: "bold"}}>{
                    funcionario.rolRequerido === "JEFE_DE_SERVICIO" ?
                        "" : rolToLabel[funcionario?.rolRequerido]
                }</span>
            </div>
            <div>

            </div>
        </>
    );
}

/* ---------------------- Droppable ---------------------- */
function Droppable({ id, label, children, style: customStyle = {} }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    const baseBackground = customStyle.backgroundColor || "#ddd";
    const backgroundColor = isOver ? "#b0eacb" : baseBackground;

    const combinedStyle = {
        minHeight: 300,
        maxHeight: 500,
        overflowY: "auto",
        border: "2px dashed #aaa",
        display: "flex",
        flexDirection: "column",
        padding: 10,
        borderRadius: 10,
        transition: "background-color 0.2s",
        ...customStyle,
        backgroundColor
    };

    const listStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        alignContent: "flex-start"
    };

    return (
        <div ref={setNodeRef} style={combinedStyle}>
            <div style={{ marginBottom: 10, fontWeight: "bold", fontSize: 15 }}>{label}</div>
            <div style={listStyle}>{children}</div>
        </div>
    );
}