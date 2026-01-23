import React, { useMemo, useState, useEffect } from "react";
import {
    consultaMemosServiciosEspeciales,
    consultarMemosPorIds,
    consultaTodosMemosPMSUBDIPOL,
    obtenerEstadisticas,
} from "../../api/nodosApi.js";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

import { normalizeMemo, toUTCISO } from "./utils/auditoriaMemosUtils.js";
import FiltrosAuditoria from "./components/FiltrosAuditoria.jsx";
import MemoDetalleModal from "./components/MemoDetalleModal.jsx";
import TablaAuditoria from "./components/TablaAuditoria.jsx";
import ModalesRevision from "./components/ModalesRevision.jsx";
import SessionExpiryBadge from "../../components/SessionExpiryBadge.jsx";
import toast from "bootstrap/js/src/toast.js";
import { getUnidadesConJerarquia } from "../../api/commonServicesApi.js";

export default function AuditoriaMemos() {

    const { user, logout, renewAccessToken } = useAuth();
    /*console.log("User en auditoria: ", user);*/

    const [searchMode, setSearchMode] = useState("unidades");
    const [selected, setSelected] = useState(null);
    const [observado, setObservado] = useState(null);
    const [aprobado, setAprobado] = useState(null);
    const [jenadep, setJenadep] = useState(null);

    const [regionSeleccionada, setRegionSeleccionada] = useState("");
    const [memos, setMemos] = useState([]);

    const [payload, setPayload] = useState({
        fechaInicio: "",
        fechaTermino: "",
        tipoFecha: "FECHA REGISTRO",
        tipoMemo: "TODOS",
        folio: "",
        estado: "", // "SIN_REVISAR,PENDIENTE" o null
    });

    const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
    const [memoIds, setMemoIds] = useState([]);
    const [delitosSeleccionados, setDelitosSeleccionados] = useState([]);

    const [loadingTabla, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState({ by: "_fechaSort", dir: "desc" });
    const [filtroDetenidos, setFiltroDetenidos] = useState(false);

    const [jerarquiaUnidades, setJerarquiaUnidades] = useState([]);

    /**
     * Búsqueda por Subdireccion -> Region o Jefatura Nacional -> Prefectura -> Unidad
     * aqui obtengo los id's de unidades que voy a buscar en los memos
     * */
    const [idSeleccion, setIdSeleccion] = useState([]);

    useEffect(() => {
        getUnidadesConJerarquia()
            .then(res => setJerarquiaUnidades(res))
            .catch(err => console.log(err));
    }, []);

    /*useEffect(() => {
        console.log("idSeleccion: ", idSeleccion);
    }, [idSeleccion]);*/



    /* ------------------ Handlers ------------------ */

    const buildFiltersPMSUBDIPOL = () => ({
        fechaInicioUtc: toUTCISO(payload.fechaInicio),
        fechaTerminoUtc: toUTCISO(payload.fechaTermino),
        tipoFecha: payload.tipoFecha || null,
        tipoMemo: payload.tipoMemo === "TODOS" ? null : payload.tipoMemo,
        filtroDetenidos: filtroDetenidos,
        estadoRevision: payload.estado || null,
    });

    const handleConsultaTodosPMSUBDIPOL = async () => {
        setErr(null);

        if (!user?.siglasUnidad || user.siglasUnidad !== "PMSUBDIPOL") {
            setErr("No tienes permisos para realizar esta consulta completa.");
            return;
        }

        const filtros = buildFiltersPMSUBDIPOL();
        setLoading(true);
        setSelected(null);

        try {
            const data = await consultaTodosMemosPMSUBDIPOL(filtros);
            const normalizados = (Array.isArray(data) ? data : []).map(normalizeMemo);
            setMemos(normalizados);
            setPage(1);
        } catch (e) {
            console.error("❌ Error en consulta completa PMSUBDIPOL:", e);
            setErr("No se pudo cargar la información completa. Inténtalo nuevamente.");
            setMemos([]);
        } finally {
            setLoading(false);
        }
    };

    const buildFilters = () => {
        /*console.log("Memos Ids: ", memoIds)
        console.log("SerchMode: ", searchMode)*/

        const base = {
            fechaInicioUtc: toUTCISO(payload.fechaInicio),
            fechaTerminoUtc: toUTCISO(payload.fechaTermino),
            tipoFecha: payload.tipoFecha || null,
            tipoMemo: payload.tipoMemo === "TODOS" ? null : payload.tipoMemo,
            filtroDetenidos: filtroDetenidos,
            estadoRevision: payload.estado || null,
        };

        if (searchMode === "unidades") {
            const unidades = (unidadesSeleccionadas || []).map((o) => o.value);
            return { modo: "unidades", ...base, unidades, unidad: unidades[0] || null };
        }

        if (searchMode === "delitos") {
            return { modo: "delitos", ...base, identificadoresUnidades: idSeleccion }
        }

        return {
            modo: "folio",
            ...base,
            memoIds: (memoIds || [])
                .map((o) => {
                    const id = parseInt(o.value, 10);
                    return isNaN(id) ? null : id;
                })
                .filter((id) => id !== null),
        };
    };

    const handleFiltrar = async () => {
        let data = null;
        setErr(null);

        if (searchMode === "unidades") {
            if (!(unidadesSeleccionadas?.length > 0)) {
                setErr("Debes seleccionar al menos una unidad.");
                return;
            }
        } else if (searchMode === "folio") {
            if (!(memoIds?.length > 0)) {
                setErr("Debes ingresar al menos un ID de memo.");
                return;
            }
        } else if (searchMode === "delitos") { // ⭐ AGREGAR VALIDACIÓN PARA MODO DELITOS
            /*console.log("🔍 Validando modo delitos...");
            console.log("📋 idSeleccion actual:", idSeleccion);
            console.log("📊 Cantidad de IDs:", idSeleccion?.length);*/

            if (!idSeleccion || idSeleccion.length === 0) {
                setErr("Debes seleccionar al menos una Región Policial, Jefatura Nacional o Prefectura.");
                return;
            }
        }

        const filtros = buildFilters();

        /*console.log("📦 Filtros construidos para enviar:", filtros);*/

        setLoading(true);
        setSelected(null);

        try {
            if (searchMode === "unidades") {
                /*console.log("🔵 Consultando por UNIDADES");*/
                data = await consultaMemosServiciosEspeciales(filtros);
            } else if (searchMode === "folio") {
                /*console.log("🟢 Consultando por FOLIO");*/
                data = await consultarMemosPorIds(filtros);
            } else if (searchMode === "delitos") { // ⭐ CASO EXPLÍCITO PARA DELITOS
                /*console.log("🟣 Consultando por DELITOS/JERARQUÍA");
                console.log("📨 Enviando al backend:", filtros);*/
                data = await consultaMemosServiciosEspeciales(filtros);
            }
            /*console.log("Data: ", data)*/
            const normalizados = (Array.isArray(data) ? data : []).map(normalizeMemo);
            setMemos(normalizados);
            setPage(1);
        } catch (e) {
            console.error(e);
            setErr("No se pudo cargar la información. Inténtalo nuevamente.");
            setMemos([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchMode("unidades");
        setPayload({
            fechaInicio: "",
            fechaTermino: "",
            tipoFecha: "FECHA REGISTRO",
            tipoMemo: "TODOS",
            folio: "",
        });
        setRegionSeleccionada("");
        setUnidadesSeleccionadas([]);
        setMemoIds([]);
        setSearch("");
        setMemos([]);
        setPage(1);
        setSelected(null);
        setErr(null);
        setFiltroDetenidos(false);
    };

    const toggleSort = (by) => {
        setSort((prev) =>
            prev.by === by ? { by, dir: prev.dir === "asc" ? "desc" : "asc" } : { by, dir: "asc" }
        );
    };

    const exportarEstadisticas = async () => {
        const filtros = buildFilters();
        try {
            setLoading(true);
            const estadisticas = await obtenerEstadisticas(filtros);
            await generarArchivosExcel(estadisticas);
        } catch (e) {
            console.error("❌ Error detallado:", e);
            let mensaje = e.message || "Error desconocido";
            if (e.response) {
                mensaje = `Error del servidor: ${e.response.status} - ${e.response.statusText}`;
            } else if (e.request) {
                mensaje = "Error de conexión con el servidor";
            }
            alert(`No fue posible generar el Excel: ${mensaje}`);
        } finally {
            setLoading(false);
        }
    };

    const generarArchivosExcel = async (estadisticas) => {
        try {
            const XLSX = await import("xlsx");
            const wb = XLSX.utils.book_new();
            let hojasCreadas = 0;

            // ... tu armado de hojas (sin cambios) ...

            if (hojasCreadas === 0) {
                throw new Error("No se encontraron datos para exportar. Verifica el período seleccionado.");
            }

            const fechaActual = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            const fileName = `Estadisticas_PMSUBDIPOL_${fechaActual}.xlsx`;
            XLSX.writeFile(wb, fileName);
            alert(`✅ Archivo ${fileName} descargado exitosamente con ${hojasCreadas} hojas de datos`);
        } catch (e) {
            console.error("❌ Error en generación de Excel:", e);
            throw e;
        }
    };

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
        }
    };

    const filteredSorted = useMemo(() => {
        const q = search.trim().toLowerCase();
        let arr = Array.isArray(memos) ? memos.slice() : [];

        if (q) {
            arr = arr.filter((m) => {
                const hay =
                    String(m.id).includes(q) ||
                    (m.folio || "").toLowerCase().includes(q) ||
                    (m.ruc || "").toLowerCase().includes(q) ||
                    (m.unidad || "").toLowerCase().includes(q) ||
                    (m.tipo || "").toLowerCase().includes(q) ||
                    (m.relato || "").toLowerCase().includes(q);
                return hay;
            });
        }

        arr.sort((a, b) => {
            const dir = sort.dir === "asc" ? 1 : -1;
            const va = a[sort.by] ?? "";
            const vb = b[sort.by] ?? "";
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });

        return arr;
    }, [memos, search, sort]);

    const total = filteredSorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredSorted.slice(start, start + pageSize);
    }, [filteredSorted, page, pageSize]);

    const resetModales = () => {
        setObservado(null);
        setAprobado(null);
        setJenadep(null);
        setSelected(null);
    };

    const handleMemoUpdated = (memoId, nuevoEstado) => {
        setMemos((memos) => memos.map((m) => (m.id === memoId ? { ...m, estado: nuevoEstado } : m)));
        resetModales();
    };

    const showNotification = (type, message) => {
        if (type === "success") {
            toast?.success?.(message) /*|| console.log(message)*/;
        } else if (type === "error") {
            toast?.error?.(message) || console.error(message);
        }
    };



    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-3xl">📋</span>
                        Auditoría de Registros RAC
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Busca por <strong className="text-gray-700">Unidades</strong>, <strong className="text-gray-700">Folio</strong> o <strong className="text-gray-700">Jerarquía</strong>.
                        Las fechas y el tipo de memo aplican a todos los modos.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={clearFilters}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${memos.length
                            ? "border-gray-300 text-gray-600 hover:bg-gray-100"
                            : "border-gray-400 text-gray-700 bg-gray-100"
                            }`}
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={handleFiltrar}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        Filtrar
                    </button>

                    {user?.siglasUnidad === "PMSUBDIPOL" && (
                        <button
                            onClick={handleConsultaTodosPMSUBDIPOL}
                            disabled={loadingTabla}
                            title="Consulta todos los memos sin restricción de unidad (solo para PMSUBDIPOL)"
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loadingTabla ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span>🌍</span>
                            )}
                            Consulta Global
                        </button>
                    )}
                </div>
            </div>

            <FiltrosAuditoria
                user={user}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
                payload={payload}
                setPayload={setPayload}
                unidadesSeleccionadas={unidadesSeleccionadas}
                setUnidadesSeleccionadas={setUnidadesSeleccionadas}
                memoIds={memoIds}
                setMemoIds={setMemoIds}
                delitosSeleccionados={delitosSeleccionados}
                setDelitos={setDelitosSeleccionados}
                regionSeleccionada={regionSeleccionada}
                setRegionSeleccionada={setRegionSeleccionada}
                filtroDetenidos={filtroDetenidos}
                setFiltroDetenidos={setFiltroDetenidos}
                jerarquiaUnidades={jerarquiaUnidades}
                setIdSeleccion={setIdSeleccion}
            />

            <TablaAuditoria
                search={search}
                setSearch={setSearch}
                setPage={setPage}
                filteredSorted={filteredSorted}
                paged={paged}
                total={total}
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                setPageSize={setPageSize}
                sort={sort}
                onToggleSort={toggleSort}
                loading={loadingTabla}
                err={err}
                onRefresh={handleFiltrar}
                onExportStats={exportarEstadisticas}
                onSelectMemo={setSelected}
                onCopy={copy}
            />

            <MemoDetalleModal
                selected={selected}
                onHide={() => setSelected(null)}
                onAprobar={(memo) => setAprobado(memo)}
                onObservar={(memo) => setObservado(memo)}
                onJenadep={(memo) => setJenadep(memo)}
                onCopy={copy}
                user={user}
            />

            <ModalesRevision
                observado={observado}
                aprobado={aprobado}
                jenadep={jenadep}
                selected={selected}
                onHide={resetModales}
                onMemoUpdated={handleMemoUpdated}
                showNotification={showNotification}
            />
        </div>
    );
}