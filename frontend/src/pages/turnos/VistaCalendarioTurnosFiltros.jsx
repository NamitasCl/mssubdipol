import React, { useEffect, useState } from "react";
import CalendarioTurnosFuncionarios from "./CalendarioTurnosFuncionarios.jsx";
import { getSlotsByCalendario } from "../../api/slotApi.js";
import { Spinner } from "react-bootstrap";
import { listarCalendarios } from "../../api/calendarApi.js";

/* -------------------------------------------------------------------------- */
/*  Configuración de antigüedad por grado                                      */
/* -------------------------------------------------------------------------- */

// Orden de grados del más antiguo al menos antiguo
const GRADOS_ORDENADOS = [
    "PFT", "SPF", "SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)",
    "ISP", "SBI", "DTV", "APS", "AP", "APP", "APP (AC)"
];

// Mapa grado → índice (para comparar en O(1))
const GRADO_RANK = GRADOS_ORDENADOS.reduce((acc, g, i) => {
    acc[g] = i;
    return acc;
}, {});

// 1º por grado (índice menor = más antiguo); 2º por antigüedad (número menor = más antiguo)
function compareAntiguedad(a, b) {
    const rankA = GRADO_RANK[a.gradoFuncionario] ?? Number.MAX_SAFE_INTEGER;
    const rankB = GRADO_RANK[b.gradoFuncionario] ?? Number.MAX_SAFE_INTEGER;

    if (rankA !== rankB) return rankA - rankB;

    const antA = a.antiguedadFuncionario ?? Infinity;
    const antB = b.antiguedadFuncionario ?? Infinity;
    return antA - antB;
}

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                       */
/* -------------------------------------------------------------------------- */

export default function VistaCalendarioTurnosFiltros() {
    const [loading, setLoading] = useState(true);
    const [calendarios, setCalendarios] = useState([]);
    const [seleccionado, setSeleccionado] = useState("");
    const [slots, setSlots] = useState([]);
    const [mes, setMes] = useState(null);
    const [anio, setAnio] = useState(null);

    /* ----------------------------- Cargar calendarios ----------------------------- */
    useEffect(() => {
        (async () => {
            try {
                const data = await listarCalendarios();
                setCalendarios(data);
            } catch (e) {
                console.error("Error al cargar calendarios:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ---------------------- Cargar slots al cambiar de calendario ----------------- */
    useEffect(() => {
        if (!seleccionado) {
            setSlots([]);
            return;
        }

        setLoading(true);
        (async () => {
            try {
                // 1. Traer slots y ordenarlos
                const data = await getSlotsByCalendario(seleccionado);
                setSlots([...data].sort(compareAntiguedad));

                // 2. Extraer mes/año del calendario elegido
                const calSel = calendarios.find(c => c.id === Number(seleccionado));
                setMes(calSel?.mes ?? null);
                setAnio(calSel?.anio ?? null);
            } catch (e) {
                console.error("Error al cargar slots:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [seleccionado, calendarios]);

    /* ----------------------------- Acciones UI ----------------------------------- */
    const handleGeneraTurnos = () => {
        alert("Esta funcionalidad está en desarrollo y no está disponible aún.");
    };

    const exportarExcel = () => {
        /* Implementar cuando sea necesario */
    };

    const handleChange = e => setSeleccionado(e.target.value);

    /* --------------------------------- Render ------------------------------------ */
    return (
        <div>
            <h3>Calendario de Turnos</h3>

            <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
                <select
                    style={{ width: 400 }}
                    value={seleccionado}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="" disabled>Seleccione un calendario...</option>
                    {calendarios.map(cal => (
                        <option key={cal.id} value={cal.id}>
                            {cal.nombre}
                        </option>
                    ))}
                </select>

                <button
                    className="btn btn-primary ms-3"
                    onClick={handleGeneraTurnos}
                >
                    Generar turnos
                </button>

                <button
                    className="btn btn-success ms-3"
                    onClick={exportarExcel}
                    disabled={!seleccionado}
                >
                    Exportar a Excel
                </button>
            </div>

            {loading ? (
                <Spinner />
            ) : slots.length ? (
                <CalendarioTurnosFuncionarios
                    asignaciones={slots}
                    mes={mes}
                    anio={anio}
                    compareAntiguedad={compareAntiguedad}
                />
            ) : (
                <div className="alert alert-info text-center mt-4">
                    <strong>No hay turnos disponibles para el mes/año seleccionados.</strong>
                </div>
            )}
        </div>
    );
}