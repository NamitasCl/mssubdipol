import React, {useMemo, useState} from "react";
import {Button, Container, Spinner} from "react-bootstrap";
import {
    consultaMemosServiciosEspeciales,
    consultarMemosPorIds,
    consultaTodosMemosPMSUBDIPOL,
    obtenerEstadisticas,
} from "../../api/nodosApi.js";
import {useAuth} from "../../components/contexts/AuthContext.jsx";
import {useNavigate} from "react-router-dom";

import {normalizeMemo, toUTCISO} from "./utils/auditoriaMemosUtils.js";
import FiltrosAuditoria from "./components/FiltrosAuditoria.jsx";
import MemoDetalleModal from "./components/MemoDetalleModal.jsx";
import TablaAuditoria from "./components/TablaAuditoria.jsx";
import ModalesRevision from "./components/ModalesRevision.jsx";
import SessionExpiryBadge from "../../components/SessionExpiryBadge.jsx";

export default function AuditoriaMemos() {
    const {user, loading, logout, renewAccessToken} = useAuth();
    const navigate = useNavigate();

    const [searchMode, setSearchMode] = useState("unidades");
    const [selected, setSelected] = useState(null);
    const [observado, setObservado] = useState(null);
    const [aprobado, setAprobado] = useState(null);

    const [regiones, setRegiones] = useState([]); // si no los usas aún, puedes quitar este estado
    const [regionSeleccionada, setRegionSeleccionada] = useState("");
    const [memos, setMemos] = useState([]);

    const [payload, setPayload] = useState({
        fechaInicio: "",
        fechaTermino: "",
        tipoFecha: "FECHA REGISTRO",
        tipoMemo: "TODOS",
        folio: "",
    });

    const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
    const [memoIds, setMemoIds] = useState([]);

    const [loadingTabla, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState({by: "_fechaSort", dir: "desc"});
    const [filtroDetenidos, setFiltroDetenidos] = useState(false);

    /* ------------------ Handlers ------------------ */

    const buildFiltersPMSUBDIPOL = () => ({
        fechaInicioUtc: toUTCISO(payload.fechaInicio),
        fechaTerminoUtc: toUTCISO(payload.fechaTermino),
        tipoFecha: payload.tipoFecha || null,
        tipoMemo: payload.tipoMemo === "TODOS" ? null : payload.tipoMemo,
        filtroDetenidos: filtroDetenidos,
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
        const base = {
            fechaInicioUtc: toUTCISO(payload.fechaInicio),
            fechaTerminoUtc: toUTCISO(payload.fechaTermino),
            tipoFecha: payload.tipoFecha || null,
            tipoMemo: payload.tipoMemo === "TODOS" ? null : payload.tipoMemo,
            filtroDetenidos: filtroDetenidos,
        };

        if (searchMode === "unidades") {
            const unidades = (unidadesSeleccionadas || []).map((o) => o.value);
            return {modo: "unidades", ...base, unidades, unidad: unidades[0] || null};
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
        }

        const filtros = buildFilters();

        setLoading(true);
        setSelected(null);

        try {
            if (searchMode === "unidades") {
                data = await consultaMemosServiciosEspeciales(filtros);
            } else if (searchMode === "folio") {
                data = await consultarMemosPorIds(filtros);
            }
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
            prev.by === by ? {by, dir: prev.dir === "asc" ? "desc" : "asc"} : {by, dir: "asc"}
        );
    };

    const exportCsv = () => {
        const headers = ["ID", "Fecha", "Tipo", "Folio", "RUC", "Unidad", "Estado", "Relato"];
        const rows = filteredSorted.map((m) => [
            m.id,
            m.fecha,
            m.tipo,
            m.folio,
            m.ruc,
            m.unidad,
            m.estado,
            m.relato?.replace(/"/g, '""') || "",
        ]);
        const csv = [
            headers.join(","),
            ...rows.map((r) =>
                r.map((c) => (typeof c === "string" && c.includes(",") ? `"${c}"` : c)).join(",")
            ),
        ].join("\n");
        const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `auditoria_memos_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
        setSelected(null);
    };

    const handleMemoUpdated = (memoId, nuevoEstado) => {
        setMemos((memos) => memos.map((m) => (m.id === memoId ? {...m, estado: nuevoEstado} : m)));
        resetModales();
    };

    const showNotification = (type, message) => {
        if (type === "success") {
            toast?.success?.(message) || console.log(message);
        } else if (type === "error") {
            toast?.error?.(message) || console.error(message);
        }
    };

    async function handleRefresh() {
        try {
            await renewAccessToken();
        } catch (e) {
            console.error("No se pudo renovar el token", e);
            logout();
        }
    }

    return (
        <Container fluid className="p-3">
            <div className="d-flex align-items-center justify-content-xl-between mb-3">
                <div>
                    <h4 className="mb-0">📋 Auditoría de Registros RAC</h4>
                    <small className="text-muted">
                        Busca por <strong>Unidades</strong> o por <strong>Folio</strong>. Las fechas y el{" "}
                        <strong>Tipo de memo</strong> aplican a ambos modos.
                    </small>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {loading && (
                        <>
                            <Spinner size="sm" animation="border"/>
                            <small className="text-muted">Verificando sesión…</small>
                        </>
                    )}
                    <SessionExpiryBadge onExpire={() => logout()} onRefresh={handleRefresh}/>
                </div>

                <div className="d-flex gap-2">
                    <Button onClick={() => navigate("/")} variant="outline-secondary" size="sm">
                        Volver al Dashboard
                    </Button>
                    <Button
                        variant={!!memos.length ? "outline-secondary" : "secondary"}
                        size="sm"
                        onClick={clearFilters}
                    >
                        Limpiar
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleFiltrar}>
                        Filtrar
                    </Button>

                    {user?.siglasUnidad === "PMSUBDIPOL" && (
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={handleConsultaTodosPMSUBDIPOL}
                            disabled={loadingTabla}
                            title="Consulta todos los memos sin restricción de unidad (solo para PMSUBDIPOL)"
                        >
                            {loadingTabla ? <Spinner size="sm" animation="border"/> : <>🌍 Consulta Global</>}
                        </Button>
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
                regionSeleccionada={regionSeleccionada}
                setRegionSeleccionada={setRegionSeleccionada}
                filtroDetenidos={filtroDetenidos}
                setFiltroDetenidos={setFiltroDetenidos}
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
                onCopy={copy}
            />

            <ModalesRevision
                observado={observado}
                aprobado={aprobado}
                selected={selected}
                onHide={resetModales}
                onMemoUpdated={handleMemoUpdated}
                showNotification={showNotification}
            />
        </Container>
    );
}