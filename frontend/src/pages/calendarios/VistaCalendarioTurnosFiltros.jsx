import React, { useEffect, useState } from "react";
import CalendarioTurnosFuncionarios from "./CalendarioTurnosFuncionarios.jsx";
import { getSlotsByCalendario } from "../../api/slotApi.js";
import { listarCalendarios } from "../../api/calendarApi.js";
import { realizarAsignacionFuncionarios } from "../../api/asignacionFuncionarioApi.js";
import { Calendar, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Configuración de antigüedad por grado                                      */
/* -------------------------------------------------------------------------- */

const GRADOS_ORDENADOS = [
    "PFT", "SPF", "SPF (OPP)", "COM", "COM (OPP)", "SBC", "SBC (OPP)",
    "ISP", "SBI", "DTV", "APS", "AP", "APP", "APP (AC)"
];

const GRADO_RANK = GRADOS_ORDENADOS.reduce((acc, g, i) => {
    acc[g] = i;
    return acc;
}, {});

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

        loadSlots();
    }, [seleccionado, calendarios]);

    const loadSlots = async () => {
        setLoading(true);
        try {
            const data = await getSlotsByCalendario(seleccionado);
            setSlots([...data].sort(compareAntiguedad));

            const calSel = calendarios.find(c => c.id === Number(seleccionado));
            setMes(calSel?.mes ?? null);
            setAnio(calSel?.anio ?? null);
        } catch (e) {
            console.error("Error al cargar slots:", e);
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------- Acciones UI ----------------------------------- */
    const handleGeneraTurnos = async () => {
        try {
            await realizarAsignacionFuncionarios(seleccionado);
            await loadSlots(); 
            alert("Asignaciones realizadas con éxito");
        } catch (e) {
            alert("Hubo un error al asignar los turnos");
            console.error(e);
        }
    };


    const exportarExcel = () => {
        /* Implementar cuando sea necesario */
    };

    const handleChange = e => setSeleccionado(e.target.value);

    /* --------------------------------- Render ------------------------------------ */
    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-pdi-base mb-2">Calendario de Turnos</h2>
                    <p className="text-gray-500 text-sm">Visualiza y gestiona las asignaciones de turnos mensuales.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                     <div className="relative min-w-[280px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={16} className="text-gray-400" />
                        </div>
                        <select
                            value={seleccionado}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl border bg-white shadow-sm transition-all hover:bg-gray-50 cursor-pointer appearance-none"
                        >
                            <option value="" disabled>Seleccione un calendario...</option>
                            {calendarios.map(cal => (
                                <option key={cal.id} value={cal.id}>
                                    {cal.nombre} ({cal.mes}/{cal.anio})
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                             <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button
                        onClick={handleGeneraTurnos}
                        disabled={!seleccionado}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-pdi-base hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Generar
                    </button>

                    <button
                        onClick={exportarExcel}
                        disabled={!seleccionado}
                        className="inline-flex items-center justify-center px-4 py-2 border border-emerald-200 text-sm font-medium rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FileSpreadsheet size={16} className="mr-2" />
                        Exportar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex h-96 items-center justify-center flex-col gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pdi-base border-t-transparent"></div>
                        <p className="text-gray-400 text-sm font-medium animate-pulse">Cargando datos...</p>
                    </div>
                ) : slots.length ? (
                    <CalendarioTurnosFuncionarios
                        asignaciones={slots}
                        mes={mes}
                        anio={anio}
                        compareAntiguedad={compareAntiguedad}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Calendar size={48} className="text-gray-300" />
                        </div>
                         <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {seleccionado ? "Sin asignaciones encontradas" : "Selecciona un calendario"}
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            {seleccionado 
                                ? "No hay turnos registrados para este periodo. Intenta generar los turnos."
                                : "Por favor selecciona un calendario del listado superior para ver los turnos."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}