import React, { useEffect, useState } from "react";
import { listarCalendarios } from "../../api/calendarApi.js";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { listarFuncionariosAportados } from "../../api/funcionariosAporteApi.js";
import { getSlotsByCalendario } from "../../api/slotApi.js";
import "bootstrap/dist/css/bootstrap.min.css";

function ModificarAsignacionesUnidad() {
    const { user } = useAuth();

    // Calendarios de la unidad del jefe
    const [calendarios, setCalendarios] = useState([]);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);

    // Funcionario por calendario (objeto: calendarioId => array de funcionarios)
    const [funcionariosPorCalendario, setFuncionariosPorCalendario] = useState({});
    // Slots por calendario (objeto: calendarioId => array de slots)
    const [slotsPorCalendario, setSlotsPorCalendario] = useState({});

    // Selección de fechas para swap
    const [slotOrigenId, setSlotOrigenId] = useState(null);
    const [slotDestinoId, setSlotDestinoId] = useState(null);

    // Estado de carga
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    // 1. Cargar calendarios de la unidad
    useEffect(() => {
        setLoading(true);
        listarCalendarios().then(async (todos) => {
            const calendariosUnidad = todos.filter((c) => {
                if (c.tipo === "UNIDAD") {
                    return c.idUnidad === user.idUnidad;
                }
                if (c.tipo === "COMPLEJO") {
                    return (c.aporteUnidadTurnos || []).some(
                        (a) => a.idUnidad === user.idUnidad
                    );
                }
                return false;
            });
            setCalendarios(calendariosUnidad);

            // Cargar funcionarios de cada calendario
            const funcionariosData = {};
            for (const cal of calendariosUnidad) {
                funcionariosData[cal.id] = await listarFuncionariosAportados(
                    cal.id,
                    user.idUnidad
                );
            }
            setFuncionariosPorCalendario(funcionariosData);

            setLoading(false);
        });
    }, [user.idUnidad]);

    // 2. Cargar slots cuando se selecciona un calendario
    useEffect(() => {
        if (calendarioSeleccionado) {
            getSlotsByCalendario(calendarioSeleccionado.id).then((slots) => {
                console.log("Calendario seleccionado:", calendarioSeleccionado);
                // Por defecto, los slots traen info de fecha y funcionario asignado (ajusta si tu backend lo trae distinto)
                console.log("Slots cargados:", slots);
                setSlotsPorCalendario((prev) => ({
                    ...prev,
                    [calendarioSeleccionado.id]: slots,
                }));
                console.log("Slots por calendario actualizados:", slotsPorCalendario);
            });
        }
        // Limpiar selecciones si cambió calendario
        setSlotOrigenId(null);
        setSlotDestinoId(null);
        setMensaje("");
    }, [calendarioSeleccionado]);

    // 3. Lógica de swap de funcionarios
    const intercambiar = () => {
        if (!slotOrigenId || !slotDestinoId || slotOrigenId === slotDestinoId) {
            setMensaje("Selecciona dos fechas distintas para intercambiar.");
            return;
        }
        const slots = [...(slotsPorCalendario[calendarioSeleccionado.id] || [])];
        const origenIdx = slots.findIndex((s) => s.id === slotOrigenId);
        const destinoIdx = slots.findIndex((s) => s.id === slotDestinoId);

        if (origenIdx === -1 || destinoIdx === -1) {
            setMensaje("Error al encontrar los slots.");
            return;
        }
        // Intercambiar funcionario asignado
        const temp = slots[origenIdx].funcionario;
        slots[origenIdx].funcionario = slots[destinoIdx].funcionario;
        slots[destinoIdx].funcionario = temp;

        setSlotsPorCalendario((prev) => ({
            ...prev,
            [calendarioSeleccionado.id]: slots,
        }));

        setMensaje("¡Intercambio realizado!");
        setSlotOrigenId(null);
        setSlotDestinoId(null);

        // Aquí podrías llamar a tu API para persistir el swap si lo necesitas.
    };

    // Función utilitaria para mostrar nombre del funcionario
    const getNombreFuncionario = (funcionario) => {
        if (!funcionario) return <span className="text-secondary">Sin asignar</span>;
        // Si funcionario es objeto {nombre, ...}
        if (typeof funcionario === "object" && funcionario.nombre)
            return funcionario.nombre;
        // Si es string
        return funcionario;
    };

    return (
        <div className="container my-4">
            <h2 className="mb-3">Modificar Asignaciones de Unidad</h2>
            {loading ? (
                <div className="alert alert-info">Cargando calendarios...</div>
            ) : (
                <>
                    <div className="mb-3">
                        <label className="form-label">
                            <b>Selecciona un calendario:</b>
                        </label>
                        <select
                            className="form-select"
                            value={calendarioSeleccionado?.id || ""}
                            onChange={(e) => {
                                const cal = calendarios.find(
                                    (c) => c.id.toString() === e.target.value
                                );
                                setCalendarioSeleccionado(cal);
                            }}
                        >
                            <option value="">-- Selecciona --</option>
                            {calendarios.map((cal) => (
                                <option key={cal.id} value={cal.id}>
                                    {cal.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {calendarioSeleccionado && (
                        <>
                            <h5>Fechas y funcionarios asignados</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Funcionario asignado</th>
                                        <th>Seleccionar Origen</th>
                                        <th>Seleccionar Destino</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(slotsPorCalendario[calendarioSeleccionado.id] || []).map(
                                        (slot) => (
                                            <tr key={slot.id}>
                                                <td>{slot.fecha}</td>
                                                <td>{getNombreFuncionario(slot.funcionario)}</td>
                                                <td>
                                                    <input
                                                        type="radio"
                                                        name="origen"
                                                        checked={slotOrigenId === slot.id}
                                                        onChange={() => setSlotOrigenId(slot.id)}
                                                        disabled={slotDestinoId === slot.id}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="radio"
                                                        name="destino"
                                                        checked={slotDestinoId === slot.id}
                                                        onChange={() => setSlotDestinoId(slot.id)}
                                                        disabled={slotOrigenId === slot.id}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={intercambiar}
                                disabled={
                                    !slotOrigenId ||
                                    !slotDestinoId ||
                                    slotOrigenId === slotDestinoId
                                }
                            >
                                Intercambiar funcionarios
                            </button>
                            {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ModificarAsignacionesUnidad;