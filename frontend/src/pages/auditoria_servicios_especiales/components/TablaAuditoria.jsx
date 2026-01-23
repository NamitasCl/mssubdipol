import React from "react";
import { contarDetenidos } from "../utils/auditoriaMemosUtils.js";
import MemoIconset from "./MemoIconset.jsx";

export default function TablaAuditoria({
    // Estados de búsqueda y filtrado
    search,
    setSearch,
    setPage,

    // Datos de la tabla
    filteredSorted,
    paged,
    total,

    // Paginación
    page,
    totalPages,
    pageSize,
    setPageSize,

    // Ordenamiento
    sort,
    onToggleSort,

    // Estados de carga y error
    loading,
    err,

    // Handlers
    onRefresh,
    onExportStats,
    onSelectMemo,
    onCopy,
}) {

    // Función auxiliar para badges de estado
    const getBadgeColor = (estado) => {
        const colors = {
            SIN_REVISAR: "bg-gray-100 text-gray-700",
            APROBADO: "bg-green-100 text-green-700",
            OBSERVADO: "bg-amber-100 text-amber-700",
            RECHAZADO: "bg-red-100 text-red-700",
            JENADEP: "bg-blue-100 text-blue-700",
            FINALIZADO: "bg-teal-100 text-teal-700"
        };
        return colors[estado] || "bg-gray-100 text-gray-600";
    };

    return (
        <>
            {/* Barra de búsqueda */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center gap-3 w-full max-w-3xl">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            🔍
                        </div>
                        <input
                            type="text"
                            placeholder="Búsqueda rápida local (ID, folio, RUC, unidad o texto del relato)…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:inline-block">
                        Filtra resultados locales
                    </span>
                </div>
            </div>

            {/* Controles superiores */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-sm font-semibold text-gray-800">
                            {total} resultado{total !== 1 && "s"}
                        </span>

                        {total > 0 && (
                            <>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <div
                                    className="flex items-center gap-1.5 cursor-help"
                                    title="Incluye: Detenidos por PDI y Arrestados"
                                >
                                    <span className="text-sm font-bold text-sky-600">
                                        {contarDetenidos(filteredSorted)} detenido{contarDetenidos(filteredSorted) !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                        className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8"
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n} por página
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-sm"
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Refrescar"}
                    </button>
                    <button
                        onClick={onExportStats}
                        disabled={loading || !total}
                        className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-sm"
                    >
                        📊 Estadísticas Excel
                    </button>
                </div>
            </div>

            {/* Alert de error */}
            {err && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 mb-4 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {err}
                </div>
            )}

            {/* Tabla principal */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto" style={{ maxHeight: "60vh" }}>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th onClick={() => onToggleSort("id")} className="px-4 py-3 cursor-pointer hover:bg-gray-100 font-semibold sticky top-0 bg-gray-50 shadow-sm whitespace-nowrap">
                                    ID {sort.by === "id" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th onClick={() => onToggleSort("_fechaSort")} className="px-4 py-3 cursor-pointer hover:bg-gray-100 font-semibold sticky top-0 bg-gray-50 shadow-sm whitespace-nowrap">
                                    Fecha {sort.by === "_fechaSort" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th className="px-4 py-3 font-semibold sticky top-0 bg-gray-50 shadow-sm">Tipo</th>
                                <th onClick={() => onToggleSort("folio")} className="px-4 py-3 cursor-pointer hover:bg-gray-100 font-semibold sticky top-0 bg-gray-50 shadow-sm whitespace-nowrap">
                                    Folio {sort.by === "folio" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th onClick={() => onToggleSort("ruc")} className="px-4 py-3 cursor-pointer hover:bg-gray-100 font-semibold sticky top-0 bg-gray-50 shadow-sm whitespace-nowrap">
                                    RUC {sort.by === "ruc" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th className="px-4 py-3 font-semibold sticky top-0 bg-gray-50 shadow-sm min-w-[300px]">Unidad / Relato</th>
                                <th onClick={() => onToggleSort("estado")} className="px-4 py-3 cursor-pointer hover:bg-gray-100 font-semibold sticky top-0 bg-gray-50 shadow-sm whitespace-nowrap">
                                    Estado {sort.by === "estado" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th className="px-4 py-3 font-semibold sticky top-0 bg-gray-50 shadow-sm text-center">Info</th>
                                <th className="px-4 py-3 font-semibold sticky top-0 bg-gray-50 shadow-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm font-medium">Cargando resultados...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && paged.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                            <span className="text-4xl">📭</span>
                                            <span className="text-sm font-medium text-gray-500">No hay resultados encontrados</span>
                                            <span className="text-xs">Intenta ajustar los filtros de búsqueda</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && paged.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-4 py-3 font-mono text-gray-600 font-medium">{m.id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{m.fecha}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                                            {m.tipo}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 font-mono text-gray-700">
                                            {m.folio}
                                            {m.folio !== "—" && (
                                                <button
                                                    onClick={() => onCopy(String(m.folio))}
                                                    className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors ml-1"
                                                    title="Copiar folio"
                                                >
                                                    📋
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 font-mono text-gray-700">
                                            {m.ruc}
                                            {m.ruc !== "—" && (
                                                <button
                                                    onClick={() => onCopy(String(m.ruc))}
                                                    className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors ml-1"
                                                    title="Copiar RUC"
                                                >
                                                    📋
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900 mb-0.5">{m.unidad}</div>
                                        <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={m.relato}>
                                            {m.relato}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getBadgeColor(m.estado)} bg-opacity-50 border-opacity-20`}>
                                            {m.estado === "SIN_REVISAR" ? "PENDIENTE" : m.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-center">
                                            <MemoIconset memo={m} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onSelectMemo(m)}
                                            className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors shadow-sm"
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-end items-center gap-3 mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                        ← Anterior
                    </button>
                    <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </>
    );
}