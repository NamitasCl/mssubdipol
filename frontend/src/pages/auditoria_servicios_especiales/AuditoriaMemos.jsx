// javascript
// AuditoriaMemos.jsx
import React, {useEffect, useMemo, useState} from "react";
import {Button, Container, Spinner,} from "react-bootstrap";
import {getRegionesUnidades} from "../../api/commonServicesApi.js";
import {
    consultaMemosServiciosEspeciales,
    consultarMemosPorIds,
    consultaTodosMemosPMSUBDIPOL,
    obtenerEstadisticas,
} from "../../api/nodosApi.js";
import {useAuth} from "../../components/contexts/AuthContext.jsx";
import {useNavigate} from "react-router-dom";

// NUEVO: importar utilidades y constantes extraídas
import {normalizeMemo, toUTCISO} from "./utils/auditoriaMemosUtils.js";
import FiltrosAuditoria from "./components/FiltrosAuditoria.jsx";
import MemoDetalleModal from "./components/MemoDetalleModal.jsx";
import TablaAuditoria from "./components/TablaAuditoria.jsx";
import ModalesRevision from "./components/ModalesRevision.jsx";
import SessionExpiryBadge from "../../components/SessionExpiryBadge.jsx";

/* ------------------ Config UI y helpers ------------------ */

// (eliminado: estadoColors, estadoPersonaColor, colorEstado, tipoMemos, tipoFecha, toUTCISO, clamp2, stickyTh)

/* ------------------ Normalización de datos ------------------ */

// (eliminado: normalizeEstadosPersona, normalizeMemo, esPersonaDetenida, normalizeDelitosPersona, contarDetenidos)

/* ------------------ Componente principal ------------------ */

export default function AuditoriaMemos() {
    const {user, logout, renewAccessToken} = useAuth();
    const navigate = useNavigate();

    const [searchMode, setSearchMode] = useState("unidades"); // "unidades" | "folio"

    // Modales observar / aprobar
    const [selected, setSelected] = useState(null);
    const [observado, setObservado] = useState(null);
    const [aprobado, setAprobado] = useState(null);


    const [regiones, setRegiones] = useState([]);
    const [regionSeleccionada, setRegionSeleccionada] = useState("");
    const [memos, setMemos] = useState([]);

    // Filtros
    const [payload, setPayload] = useState({
        fechaInicio: "",
        fechaTermino: "",
        tipoFecha: "FECHA REGISTRO",
        tipoMemo: "TODOS",
        folio: "",
    });

    const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
    const [memoIds, setMemoIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // UI tabla
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState({by: "_fechaSort", dir: "desc"});
    const [filtroDetenidos, setFiltroDetenidos] = useState(false);


    /* ------------------ Efectos de carga ------------------ */

    useEffect(() => {
        getRegionesUnidades()
            .then((res) => {
                const lista = Array.isArray(res) ? res : [];
                const corregido = lista.map((r) => ({
                    value: r,
                    label: r === "REGIÓN DEL ÑUBLE" ? "REGIÓN DE ÑUBLE" : r,
                }));
                setRegiones(corregido);
            })
            .catch(() => setRegiones([]));
    }, []);

    /* ------------------ Handlers ------------------ */

    const buildFiltersPMSUBDIPOL = () => {
        return {
            fechaInicioUtc: toUTCISO(payload.fechaInicio),
            fechaTerminoUtc: toUTCISO(payload.fechaTermino),
            tipoFecha: payload.tipoFecha || null,
            tipoMemo: payload.tipoMemo === "TODOS" ? null : payload.tipoMemo,
            filtroDetenidos: filtroDetenidos,
        };
    };

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
            return {
                modo: "unidades",
                ...base,
                unidades,
                unidad: unidades[0] || null,
            };
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
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();
            let hojasCreadas = 0;

            if (estadisticas.personas && Array.isArray(estadisticas.personas) && estadisticas.personas.length > 0) {
                const wsPersonas = XLSX.utils.json_to_sheet(estadisticas.personas.map(p => ({
                    'ID Memo': p.memoId,
                    'RUT': p.rut,
                    'Nombre': p.nombre,
                    'Apellido Pat': p.apellidoPat,
                    'Apellido Mat': p.apellidoMat,
                    'Estados': Array.isArray(p.estados) ? p.estados.join(', ') : (p.estados || ''),
                    'Sexo': p.sexo || '',
                    'Edad': p.edad || '',
                    'Nacionalidad': p.nacionalidad || '',
                    'Condición Migratoria': p.condicionMigratoria || '',
                    'Folio': p.memoFolio,
                    'RUC': p.memoRuc,
                    'Formulario': p.memoFormulario,
                    'Fecha Memo': p.memoFecha ? new Date(p.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': p.memoUnidad,
                })));
                XLSX.utils.book_append_sheet(wb, wsPersonas, "Personas");
                hojasCreadas++;
            }

            if (estadisticas.armas && Array.isArray(estadisticas.armas) && estadisticas.armas.length > 0) {
                const wsArmas = XLSX.utils.json_to_sheet(estadisticas.armas.map(a => ({
                    'ID Memo': a.memoId,
                    'Serie': a.serieArma,
                    'Marca': a.marcaArma,
                    'Tipo': a.tipoArma,
                    'Calibre': a.calibreArma,
                    'Calidad': a.calidad,
                    'Condición': a.condicion,
                    'Observaciones': a.obs,
                    'Folio': a.memoFolio,
                    'RUC': a.memoRuc,
                    'Fecha Memo': a.memoFecha ? new Date(a.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': a.memoUnidad,
                    'Formulario': a.memoFormulario,
                })));
                XLSX.utils.book_append_sheet(wb, wsArmas, "Armas");
                hojasCreadas++;
            }

            if (estadisticas.drogas && Array.isArray(estadisticas.drogas) && estadisticas.drogas.length > 0) {
                const wsDrogas = XLSX.utils.json_to_sheet(estadisticas.drogas.map(d => ({
                    'ID Memo': d.memoId,
                    'Tipo': d.tipoDroga,
                    'Cantidad': d.cantidadDroga,
                    'Unidad Medida': d.unidadMedida,
                    'Observaciones': d.obs,
                    'Folio': d.memoFolio,
                    'RUC': d.memoRuc,
                    'Fecha Memo': d.memoFecha ? new Date(d.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad Policial': d.memoUnidad,
                    'Formulario': d.memoFormulario,
                })));
                XLSX.utils.book_append_sheet(wb, wsDrogas, "Drogas");
                hojasCreadas++;
            }

            if (estadisticas.dineros && Array.isArray(estadisticas.dineros) && estadisticas.dineros.length > 0) {
                const wsDineros = XLSX.utils.json_to_sheet(estadisticas.dineros.map(d => ({
                    'ID Memo': d.memoId,
                    'Calidad': d.calidad,
                    'Monto': d.monto,
                    'Observaciones': d.obs,
                    'Folio': d.memoFolio,
                    'RUC': d.memoRuc,
                    'Fecha Memo': d.memoFecha ? new Date(d.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': d.memoUnidad,
                    'Formulario': d.memoFormulario,
                })));
                XLSX.utils.book_append_sheet(wb, wsDineros, "Dineros");
                hojasCreadas++;
            }

            if (estadisticas.vehiculos && Array.isArray(estadisticas.vehiculos) && estadisticas.vehiculos.length > 0) {
                const wsVehiculos = XLSX.utils.json_to_sheet(estadisticas.vehiculos.map(v => ({
                    'ID Memo': v.memoId,
                    'Patente': v.patente,
                    'Marca': v.marca,
                    'Modelo': v.modelo,
                    'Calidad': v.calidad,
                    'Observaciones': v.obs,
                    'Folio': v.memoFolio,
                    'RUC': v.memoRuc,
                    'Fecha Memo': v.memoFecha ? new Date(v.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': v.memoUnidad,
                    'Formulario': v.memoFormulario,
                })));
                XLSX.utils.book_append_sheet(wb, wsVehiculos, "Vehículos");
                hojasCreadas++;
            }

            if (estadisticas.municiones && Array.isArray(estadisticas.municiones) && estadisticas.municiones.length > 0) {
                const wsMuniciones = XLSX.utils.json_to_sheet(estadisticas.municiones.map(m => ({
                    'ID Memo': m.memoId,
                    'Observaciones': m.obs,
                    'Folio': m.memoFolio,
                    'RUC': m.memoRuc,
                    'Fecha Memo': m.memoFecha ? new Date(m.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': m.memoUnidad,
                    'Formulario': m.memoFormulario,
                })));
                XLSX.utils.book_append_sheet(wb, wsMuniciones, "Municiones");
                hojasCreadas++;
            }

            if (estadisticas.otrasEspecies && Array.isArray(estadisticas.otrasEspecies) && estadisticas.otrasEspecies.length > 0) {
                const wsEspecies = XLSX.utils.json_to_sheet(estadisticas.otrasEspecies.map(oe => ({
                    'ID Memo': oe.memoId,
                    'Calidad': oe.calidad,
                    'Descripción': oe.descripcion,
                    'NUE': oe.nue,
                    'Cantidad': oe.cantidad,
                    'Avalúo': oe.avaluo,
                    'Utilizado como Arma': oe.utilizadoComoArma,
                    'Sitio Suceso': oe.sitioSuceso,
                    'Folio': oe.memoFolio,
                    'RUC': oe.memoRuc,
                    'Fecha Memo': oe.memoFecha ? new Date(oe.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': oe.memoUnidad,
                    'Formulario': oe.memoFormulario,
                })));
                XLSX.utils.book_append_sheet(wb, wsEspecies, "Otras Especies");
                hojasCreadas++;
            }

            if (estadisticas.resumenMemos && Array.isArray(estadisticas.resumenMemos) && estadisticas.resumenMemos.length > 0) {
                const wsMemos = XLSX.utils.json_to_sheet(estadisticas.resumenMemos.map(m => ({
                    'ID Memo': m.memoId,
                    'Formulario': m.memoFormulario,
                    'Folio': m.memoFolio,
                    'RUC': m.memoRuc,
                    'Fecha': m.memoFecha ? new Date(m.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': m.memoUnidad,
                    'Total Personas': m.totalPersonas || 0,
                    'Total Armas': m.totalArmas || 0,
                    'Total Drogas': m.totalDrogas || 0,
                    'Total Dineros': m.totalDineros || 0,
                    'Total Vehículos': m.totalVehiculos || 0,
                    'Total Municiones': m.totalMuniciones || 0,
                    'Total Otras Especies': m.totalOtrasEspecies || 0,
                })));
                XLSX.utils.book_append_sheet(wb, wsMemos, "Resumen Memos");
                hojasCreadas++;
            }

            if (hojasCreadas === 0) {
                throw new Error('No se encontraron datos para exportar. Verifica que existan registros en el período seleccionado.');
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

    /* ------------------ Derivados (search, sort, paginate) ------------------ */

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
        setMemos(memos =>
            memos.map(m =>
                m.id === memoId
                    ? {...m, estado: nuevoEstado}
                    : m
            )
        );

        // Cerrar modales
        resetModales();
    };

// Función para mostrar notificaciones (opcional)
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


    /* ------------------ Render ------------------ */

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
                <div>
                    <SessionExpiryBadge
                        onExpire={() => logout()}
                        onRefresh={handleRefresh}
                    />
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
                    {/* ✅ NUEVO BOTÓN PARA PMSUBDIPOL */}
                    {user?.siglasUnidad === "PMSUBDIPOL" && (
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={handleConsultaTodosPMSUBDIPOL}
                            disabled={loading}
                            title="Consulta todos los memos sin restricción de unidad (solo para PMSUBDIPOL)"
                        >
                            {loading ? (
                                <Spinner size="sm" animation="border"/>
                            ) : (
                                <>🌍 Consulta Global</>
                            )}
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
                // Estados de búsqueda y filtrado
                search={search}
                setSearch={setSearch}
                setPage={setPage}

                // Datos de la tabla
                filteredSorted={filteredSorted}
                paged={paged}
                total={total}

                // Paginación
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                setPageSize={setPageSize}

                // Ordenamiento
                sort={sort}
                onToggleSort={toggleSort}

                // Estados de carga y error
                loading={loading}
                err={err}

                // Handlers
                onRefresh={handleFiltrar}
                onExportStats={exportarEstadisticas}
                onSelectMemo={setSelected}
                onCopy={copy}
            />


            {/* Modal Detalle */}
            <MemoDetalleModal
                selected={selected}
                onHide={() => setSelected(null)}
                onAprobar={(memo) => setAprobado(memo)}
                onObservar={(memo) => setObservado(memo)}
                onCopy={copy}
            />

            <ModalesRevision
                // Estados de los modales
                observado={observado}
                aprobado={aprobado}
                selected={selected}
                onHide={resetModales}

                // Callback único
                onMemoUpdated={handleMemoUpdated}
                showNotification={showNotification}
            />


        </Container>
    );
}