import React, { useState } from "react";
import UnidadesAsyncMulti from "../../../components/ComponentesAsyncSelect/AsyncUnidadesSelectAct.jsx";
import AsyncMultiMemoIdsSelect from "../../../components/ComponentesAsyncSelect/AsyncMultiMemoIdsSelect.jsx";
import { tipoFecha, tipoMemos } from "../utils/auditoriaMemosUtils.js";

export default function FiltrosAuditoria({
    user,
    searchMode,
    setSearchMode,
    payload,
    setPayload,
    unidadesSeleccionadas,
    setUnidadesSeleccionadas,
    memoIds,
    setMemoIds,
    delitosSeleccionados,
    setDelitos,
    regionSeleccionada,
    setRegionSeleccionada,
    filtroDetenidos,
    setFiltroDetenidos,
    jerarquiaUnidades,
    setIdSeleccion
}) {

    const [subdireccion, setSubdireccion] = useState("");
    const [regionJefaturaNacional, setRegionJefaturaNacional] = useState("");
    const [prefectura, setPrefectura] = useState("");
    const [unidadSeleccionada, setUnidadSeleccionada] = useState("");

    const [nivelDos, setNivelDos] = useState([]);
    const [nivelTres, setNivelTres] = useState([]);
    const [nivelCuatro, setNivelCuatro] = useState([]);

    /**
     * Retorna los IDs de todas las unidades bajo las prefecturas de una región policial.
     * @param {Array} datos - Estructura jerárquica completa.
     * @param {String} nombreRegion - Ej: "REGION POLICIAL DE COQUIMBO"
     * @returns {{porPrefectura: Array<{prefectura: string, ids: number[]}>, idsTotales: number[]}}
     */
    function getIdsBajoPrefecturas(datos, nombreRegion) {
        // 1) Región seleccionada
        const region = datos.find(d => d.nombreRegion === nombreRegion);
        if (!region) return { porPrefectura: [], idsTotales: [] };

        // 2) Prefecturas declaradas dentro de la región (por nombre contiene "PREFECTURA")
        const prefecturasEnRegion = (region.hijos ?? [])
            .flatMap(h => h.nietos ?? [])
            .filter(n => /PREFECTURA/i.test(n.nombreUnidad));

        // 3) Para cada prefectura, buscar su bloque en `datos` y acumular IDs de sus hijos.nietos
        const porPrefectura = prefecturasEnRegion.map(pref => {
            const bloquePref = datos.find(d => d.nombreRegion === pref.nombreUnidad);
            const ids = (bloquePref?.hijos ?? [])
                .flatMap(h => h.nietos ?? [])
                .map(n => n.id);
            return { prefectura: pref.nombreUnidad, ids };
        });

        // 4) Unificar sin duplicados
        return [...new Set(porPrefectura.flatMap(p => p.ids))];
    }

    const handleRegionJefaturaNacional = (e) => {
        const arrayUnidades = [];
        const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
        if (unidadesSubdireccion) {
            unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({ id: nieto.id, nombreUnidad: nieto.nombreUnidad }))));
            const valoresFinales = arrayUnidades.filter(unidades => unidades.nombreUnidad.includes("REGION POLICIAL") || unidades.nombreUnidad.includes("JEFATURA NACIONAL"));
            setNivelDos(valoresFinales);
        } else {
            setNivelDos([]);
        }
    }

    const handlePrefectura = (e) => {
        if (!e.target.value) {
            setNivelTres([]);
            return;
        }

        console.log(e.target.value);

        if (String(e.target.value).includes("REGION POLICIAL")) {
            const resultado = getIdsBajoPrefecturas(jerarquiaUnidades, e.target.value);
            const arrayUnidades = [];
            const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
            if (unidadesSubdireccion) {
                unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({ id: nieto.id, nombreUnidad: nieto.nombreUnidad }))));
                const valoresFinales = arrayUnidades.filter(unidades => unidades.nombreUnidad.includes("PREFECTURA"));
                setNivelTres(valoresFinales);
                setIdSeleccion(resultado);
            }
            return;
        }

        const arrayUnidades = [];
        const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
        if (unidadesSubdireccion) {
            unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({ id: nieto.id, nombreUnidad: nieto.nombreUnidad }))));
            const valoresFinales = arrayUnidades.filter(unidades => unidades.nombreUnidad.includes("PREFECTURA"));
            setNivelTres(valoresFinales);
            setIdSeleccion(unidadesSubdireccion.idsNietos);
        }
    }

    const handleUnidad = (e) => {
        setUnidadSeleccionada(e.target.value);
        if (!e.target.value) {
            setNivelCuatro([]);
            return;
        }
        const arrayUnidades = [];
        const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
        if (unidadesSubdireccion) {
            unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({ id: nieto.id, nombreUnidad: nieto.nombreUnidad }))));
            setNivelCuatro(arrayUnidades);
            setIdSeleccion(unidadesSubdireccion.idsNietos)
        }
    }

    const inputClass = "w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2";
    const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    {/* Modo de búsqueda */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Modo de búsqueda:</span>
                        <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                            <button
                                onClick={() => { setSearchMode("unidades"); setMemoIds([]); }}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${searchMode === "unidades" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                Por Unidades
                            </button>
                            <button
                                onClick={() => { setSearchMode("folio"); setUnidadesSeleccionadas([]); }}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${searchMode === "folio" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                Por ID memo
                            </button>
                            <button
                                onClick={() => { setSearchMode("delitos"); setUnidadesSeleccionadas([]); }}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${searchMode === "delitos" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                Filtro Grupal
                            </button>
                        </div>
                    </div>

                    {/* Botón de Filtro Rápido para Revisores/Jefes */}
                    {(user?.roles?.some(r => ["ROLE_JEFE", "ROLE_REVISOR", "ROLE_CONTRALOR", "ROLE_ADMINISTRADOR"].includes(r)) ||
                        user?.roles?.some(r => ["ROLE_JEFE", "ROLE_REVISOR", "ROLE_CONTRALOR", "ROLE_ADMINISTRADOR"].includes(r.authority || r.nombre))) && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Acción rápida:</span>
                                <button
                                    onClick={() => {
                                        if (payload.estado === "SIN_REVISAR,PENDIENTE") {
                                            setPayload(p => ({ ...p, estado: "" }));
                                        } else {
                                            setPayload(p => ({ ...p, estado: "SIN_REVISAR,PENDIENTE" }));
                                        }
                                    }}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all border flex items-center gap-2 ${payload.estado === "SIN_REVISAR,PENDIENTE"
                                            ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-amber-50 hover:text-amber-700"
                                        }`}
                                >
                                    {payload.estado === "SIN_REVISAR,PENDIENTE" ? "★ Viendo Pendientes" : "☆ Ver Pendientes de Revisión"}
                                </button>
                            </div>
                        )}
                </div>
            </div>

            <div className="p-5 space-y-6">

                {/* Alerta Modo Grupal */}
                {searchMode === "delitos" && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Filtro grupal</span>
                            <strong className="text-blue-900 text-sm">Requisitos obligatorios</strong>
                        </div>
                        <div className="text-sm text-blue-800">
                            Para ejecutar el filtro grupal debes seleccionar: <strong>Tipo de fecha, Fecha inicio, Fecha término y Tipo de memo</strong>.
                            <br />
                            El filtro <u>solo</u> se ejecuta si escoges una <strong>Región Policial, Jefatura Nacional o una Prefectura</strong> específica.
                        </div>
                    </div>
                )}

                {/* Filtros Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className={labelClass}>Tipo de fecha</label>
                        <select
                            className={inputClass}
                            value={payload.tipoFecha}
                            onChange={(e) => setPayload((p) => ({ ...p, tipoFecha: e.target.value }))}
                        >
                            {tipoFecha.map((t) => (
                                <option key={t.value} value={t.value}>{t.value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Fecha inicio</label>
                        <input
                            type="datetime-local"
                            step="60"
                            className={inputClass}
                            value={payload.fechaInicio}
                            onChange={(e) => setPayload((p) => ({ ...p, fechaInicio: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Fecha término</label>
                        <input
                            type="datetime-local"
                            step="60"
                            className={inputClass}
                            value={payload.fechaTermino}
                            onChange={(e) => setPayload((p) => ({ ...p, fechaTermino: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Tipo de memo</label>
                        <select
                            className={inputClass}
                            value={payload.tipoMemo}
                            onChange={(e) => setPayload((p) => ({ ...p, tipoMemo: e.target.value }))}
                        >
                            {tipoMemos.map((t) => (
                                <option key={t.value} value={t.value}>{t.value}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filtros Específicos por Modo */}
                <div className="pt-2">
                    {searchMode === "unidades" && (
                        <div>
                            <label className={labelClass}>Unidades</label>
                            <UnidadesAsyncMulti
                                value={unidadesSeleccionadas}
                                onChange={setUnidadesSeleccionadas}
                                regionSeleccionada={regionSeleccionada}
                                comunaSeleccionada={""}
                            />
                            {!!unidadesSeleccionadas.length && (
                                <div className="text-xs text-gray-500 mt-1.5">
                                    Seleccionadas: {unidadesSeleccionadas.length}.
                                </div>
                            )}
                        </div>
                    )}

                    {searchMode === "folio" && (
                        <div className="max-w-xl">
                            <label className={labelClass}>IDs de Memo</label>
                            <AsyncMultiMemoIdsSelect value={memoIds} onChange={setMemoIds} />
                            {!!memoIds.length && (
                                <div className="text-xs text-gray-500 mt-1.5">IDs seleccionados: {memoIds.length}</div>
                            )}
                        </div>
                    )}

                    {searchMode === "delitos" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Subdirección</label>
                                <select
                                    className={inputClass}
                                    value={subdireccion}
                                    onChange={(e) => {
                                        setSubdireccion(e.target.value);
                                        handleRegionJefaturaNacional(e);
                                        setNivelTres([]);
                                        setNivelCuatro([]);
                                    }}
                                >
                                    <option value="">Elija una opción</option>
                                    <option value="SUBDIRECCION DE INVESTIGACION POLICIAL">SUBDIRECCION DE INVESTIGACION POLICIAL</option>
                                    <option value="SUBDIRECCION DE INTELIGENCIA CRIMEN ORGANIZADO Y SEGURIDAD MIGRATORIA">SUBDIRECCION DE INTELIGENCIA CRIMEN ORGANIZADO Y SEGURIDAD MIGRATORIA</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Región Policial o Jefatura Nacional</label>
                                <select
                                    className={inputClass}
                                    value={regionJefaturaNacional}
                                    onChange={(e) => {
                                        setRegionJefaturaNacional(e.target.value);
                                        handlePrefectura(e);
                                    }}
                                >
                                    <option value="">Elija una opción</option>
                                    {nivelDos.length > 0 && (
                                        nivelDos.map((u) => (
                                            <option key={u.id} value={u.nombreUnidad}>{u.nombreUnidad}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Prefectura</label>
                                <select
                                    className={inputClass}
                                    value={prefectura}
                                    onChange={(e) => {
                                        setPrefectura(e.target.value);
                                        handleUnidad(e);
                                    }}
                                >
                                    <option value="">Elija una opción</option>
                                    {nivelTres.length > 0 && (
                                        nivelTres.map((u) => (
                                            <option key={u.id} value={u.nombreUnidad}>{u.nombreUnidad}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acceso Especial PMSUBDIPOL */}
                {user?.siglasUnidad === "PMSUBDIPOL" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-amber-600 font-bold text-sm">🌍 Acceso Especial PMSUBDIPOL</span>
                        </div>
                        <div className="text-sm text-amber-800 opacity-90">
                            Como usuario de PMSUBDIPOL, tienes acceso al botón <strong>"Consulta Global"</strong> que
                            permite consultar todos los memos de todas las unidades usando únicamente los
                            filtros de: <strong>Tipo de fecha, Fecha inicio, Fecha término y Tipo de memo</strong>.
                            Este botón ignora la selección de unidades específicas.
                        </div>
                    </div>
                )}

                {/* Filtro Detenidos Checkbox */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={filtroDetenidos}
                            onChange={(e) => setFiltroDetenidos(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 select-none">
                            🔒 Mostrar solo memorandos con personas detenidas (Detenido por PDI y Arrestado)
                        </span>
                    </label>
                </div>

            </div>
        </div>
    );
}