import React, { useMemo, useState, useEffect } from "react";
import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Mapeo roles → etiqueta amigable                                            */
/* -------------------------------------------------------------------------- */
const defaultRoles = [
    { value: "JEFE_DE_SERVICIO",  label: "Jefe de Servicio" },
    { value: "JEFE_DE_MAQUINA",   label: "Jefe de máquina" },
    { value: "PRIMER_TRIPULANTE", label: "Primer tripulante" },
    { value: "SEGUNDO_TRIPULANTE",label: "Segundo tripulante" },
    { value: "TRIPULANTE",        label: "Tripulante" },
    { value: "ENCARGADO_DE_TURNO",label: "Encargado de turno" },
    { value: "ENCARGADO_DE_GUARDIA",label: "Encargado de guardia" },
    { value: "AYUDANTE_DE_GUARDIA", label: "Ayudante de guardia" },
    { value: "JEFE_DE_RONDA",     label: "Jefe de ronda" },
    { value: "GUARDIA_ARMADO",    label: "Guardia armado" },
    { value: "REFUERZO_DE_GUARDIA",label: "Refuerzo de guardia" }
];

const rolToLabel = (rol) => {
    const a = defaultRoles.find(r => r.value === rol)?.label || rol;
    return a;
}

/* -------------------------------------------------------------------------- */
/*  Componente                                                                */
/* -------------------------------------------------------------------------- */
export default function CalendarioTurnosFuncionarios({
                                                         asignaciones = [],
                                                         mes,
                                                         anio,
                                                         compareAntiguedad
                                                     }) {
    /* --------------------------------- filtros --------------------------------- */
    const [filtroNombre,        setFiltroNombre]        = useState("");
    const [filtroTurnosMin,     setFiltroTurnosMin]     = useState("");
    const [filtroTurnosMax,     setFiltroTurnosMax]     = useState("");
    const [filtroTurnoTexto,    setFiltroTurnoTexto]    = useState("");
    const [filtroDiaSeleccionado,setFiltroDiaSeleccionado] = useState("");
    const [soloGrupoDelDia,     setSoloGrupoDelDia]     = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const [nombresUnicos, setNombresUnicos] = useState([]);

    /* lista de nombres para el filtro desplegable */
    useEffect(() => {
        const nombres = asignaciones.map(a => a.nombreFuncionario).filter(Boolean);
        setNombresUnicos(["", ...new Set(nombres)].sort());
    }, [asignaciones]);

    const limpiarFiltros = () => {
        setFiltroNombre("");
        setFiltroTurnosMin("");
        setFiltroTurnosMax("");
        setFiltroTurnoTexto("");
        setFiltroDiaSeleccionado("");
        setSoloGrupoDelDia(false);
    };

    /* ---------------------------------- días ----------------------------------- */
    const diasDelMes = useMemo(() => {
        const total = new Date(anio, mes, 0).getDate();     // ej. 30 o 31
        return Array.from({ length: total }, (_, i) => i + 1);
    }, [mes, anio]);

    const esWE = useMemo(() => {
        const map = {};
        diasDelMes.forEach(d => {
            const dow = new Date(anio, mes - 1, d).getDay();  // 0=Domingo,6=Sábado
            map[d] = dow === 0 || dow === 6;
        });
        return map;
    }, [diasDelMes, mes, anio]);

    /* ----------------------------- agrupación & orden --------------------------- */
    const { listaPersonas, sumaPorDia, totalGeneral } = useMemo(() => {
        // 1. Agrupar por funcionario
        const base = new Map();

        asignaciones.forEach(slot => {
            if (!base.has(slot.idFuncionario)) {
                base.set(slot.idFuncionario, {
                    idFuncionario:           slot.idFuncionario,
                    nombreFuncionario:       slot.nombreFuncionario,
                    gradoFuncionario:        slot.gradoFuncionario,
                    antiguedadFuncionario:   slot.antiguedadFuncionario,
                    dias:   new Set(),
                    total:  0,
                    turnos: [],
                    turnosPorDia: {}
                });
            }
            const p  = base.get(slot.idFuncionario);
            const dia = Number(slot.fecha.split("-")[2]);
            p.dias.add(dia);
            p.total += 1;
            p.turnos.push(slot.rolRequerido);
            p.turnosPorDia[dia] = slot;
        });

        // 2. Suma por día (fila de totales)
        const sumDia = Object.fromEntries(diasDelMes.map(d => [d, 0]));
        asignaciones.forEach(a => {
            const d = Number(a.fecha.split("-")[2]);
            sumDia[d] += 1;
        });
        const totalGen = Object.values(sumDia).reduce((acc, v) => acc + v, 0);

        // 3. Filtro “solo grupo del día”
        let grupoDelDia = new Set();
        if (soloGrupoDelDia && filtroDiaSeleccionado) {
            asignaciones
                .filter(a => Number(a.fecha.split("-")[2]) === Number(filtroDiaSeleccionado))
                .forEach(a => grupoDelDia.add(a.idFuncionario));
        }

        // 4. Aplicar filtros
        const list = Array.from(base.values()).filter(p => {
            if (soloGrupoDelDia && filtroDiaSeleccionado && !grupoDelDia.has(p.idFuncionario)) return false;
            if (filtroNombre && p.nombreFuncionario !== filtroNombre) return false;

            const minOk = !filtroTurnosMin || p.total >= Number(filtroTurnosMin);
            const maxOk = !filtroTurnosMax || p.total <= Number(filtroTurnosMax);
            if (!minOk || !maxOk) return false;

            if (filtroTurnoTexto) {
                const ok = p.turnos.some(t =>
                    rolToLabel(t).toLowerCase().includes(filtroTurnoTexto.toLowerCase())
                );
                if (!ok) return false;
            }
            return true;
        });

        // 5. Ordenar con la jerarquía de grados + antigüedad
        list.sort(compareAntiguedad);

        return { listaPersonas: list, sumaPorDia: sumDia, totalGeneral: totalGen };
    }, [
        asignaciones, diasDelMes,
        filtroNombre, filtroTurnosMin, filtroTurnosMax,
        filtroTurnoTexto, filtroDiaSeleccionado, soloGrupoDelDia,
        compareAntiguedad
    ]);


    const Ticket = ({ servicio, slot }) => {
        const colorClass =
            servicio === "JEFE_DE_SERVICIO" ? "text-emerald-500" :
                servicio === "ENCARGADO_DE_GUARDIA" ? "text-amber-500" :
                    servicio === "AYUDANTE_DE_GUARDIA" ? "text-rose-500" :
                        "text-pdi-texto"; 

        return (
            <div className="group relative flex justify-center w-full h-full items-center">
                <span className={`text-xl cursor-default ${colorClass} hover:scale-125 transition-transform`}>
                    ✔
                </span>
                
                {/* Custom Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="font-bold mb-1 border-b border-gray-700 pb-1 text-center">
                         {Number(slot.fecha.split("-")[2])}/{mes}/{anio}
                    </div>
                    <div className="space-y-1">
                        <div><span className="text-gray-400">Rol:</span> {rolToLabel(slot.rolRequerido)}</div>
                        <div><span className="text-gray-400">Recinto:</span> {slot.recinto}</div>
                        <div><span className="text-gray-400">Servicio:</span> {slot.nombreServicio}</div>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
             <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h5 className="font-bold text-gray-700 flex items-center gap-2">
                    <Filter size={18} />
                    Filtros y Visualización
                </h5>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm text-blue-600 font-medium hover:text-blue-800"
                >
                    {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </button>
            </div>

            {/* Filtros */}
            {showFilters && (
                <div className="p-4 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top-2 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buscar por nombre</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <select
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                                    value={filtroNombre}
                                    onChange={e => setFiltroNombre(e.target.value)}
                                >
                                    {nombresUnicos.map(n => (
                                        <option key={n || "todos"} value={n}>
                                            {n || "Todos los nombres"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ranking Turnos</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={filtroTurnosMin}
                                    onChange={e => setFiltroTurnosMin(e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={filtroTurnosMax}
                                    onChange={e => setFiltroTurnosMax(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contiene texto</label>
                             <input
                                type="text"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={filtroTurnoTexto}
                                onChange={e => setFiltroTurnoTexto(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Día</label>
                             <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={diasDelMes.length}
                                    className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={filtroDiaSeleccionado}
                                    onChange={e => setFiltroDiaSeleccionado(e.target.value)}
                                />
                                 <div className="flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        id="soloGrupoDia"
                                        checked={soloGrupoDelDia}
                                        onChange={e => setSoloGrupoDelDia(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="soloGrupoDia" className="ml-2 text-xs text-gray-600 select-none cursor-pointer">
                                        Solo grupo
                                    </label>
                                </div>
                             </div>
                        </div>

                         <div className="flex justify-end">
                            <button 
                                onClick={limpiarFiltros}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2"
                            >
                                <X size={14} /> Limpiar
                            </button>
                        </div>
                     </div>
                </div>
            )}

            {/* Tabla con scroll horizontal */}
            <div className="flex-1 overflow-auto bg-white relative w-full">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-3 py-3 border-b border-gray-200 w-10 text-center bg-gray-50 sticky left-0 z-20">#</th>
                            <th className="px-3 py-3 border-b border-r border-gray-200 min-w-[200px] bg-gray-50 sticky left-10 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Funcionario</th>
                            {diasDelMes.map(d => (
                                <th
                                    key={d}
                                    className={`px-1 py-3 border-b border-gray-200 text-center min-w-[32px] ${esWE[d] ? "bg-amber-50 text-amber-900" : ""}`}
                                >
                                    {d}
                                </th>
                            ))}
                            <th className="px-3 py-3 border-b border-l border-gray-200 text-center min-w-[60px] bg-gray-50">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                         {listaPersonas.map((p, idx) => (
                            <tr key={p.idFuncionario} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-3 py-2 text-center text-gray-400 bg-white sticky left-0 z-10">{idx + 1}</td>
                                <td className="px-3 py-2 font-medium text-gray-900 border-r border-gray-100 bg-white sticky left-10 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] truncate max-w-[200px]" title={p.nombreFuncionario}>
                                    {p.gradoFuncionario && <span className="text-blue-600 mr-1">{p.gradoFuncionario}</span>}
                                    {p.nombreFuncionario}
                                </td>
                                {diasDelMes.map(d => (
                                    <td key={d} className={`p-0 text-center border-r border-gray-50 ${esWE[d] ? "bg-amber-50/30" : ""}`}>
                                        {p.dias.has(d) && (
                                            <div className="w-full h-8 flex items-center justify-center">
                                                <Ticket servicio={p.turnosPorDia[d].rolRequerido} slot={p.turnosPorDia[d]} />
                                            </div>
                                        )}
                                    </td>
                                ))}
                                <td className="px-3 py-2 text-center font-bold text-pdi-base border-l border-gray-100 bg-gray-50/30">
                                    {p.total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold text-gray-700 sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                        <tr>
                            <td className="px-3 py-3 text-center sticky left-0 z-20 bg-gray-100"></td>
                            <td className="px-3 py-3 text-right sticky left-10 z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Total Servicios</td>
                            {diasDelMes.map(d => (
                                <td key={d} className={`text-center py-2 ${esWE[d] ? "bg-amber-100/50" : ""}`}>
                                    {sumaPorDia[d] || ""}
                                </td>
                            ))}
                            <td className="px-3 py-3 text-center border-l border-gray-200 bg-gray-200 text-gray-900">
                                {totalGeneral}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}