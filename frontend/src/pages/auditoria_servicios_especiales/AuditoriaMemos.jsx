// AuditoriaMemos.jsx
import React, {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Badge,
    Button,
    ButtonGroup,
    Card,
    Col,
    Container,
    Form,
    InputGroup,
    ListGroup,
    Modal,
    OverlayTrigger,
    Row,
    Spinner,
    Tab,
    Table,
    Tabs,
    Tooltip,
} from "react-bootstrap";
import {getRegionesUnidades} from "../../api/commonServicesApi.js";
import UnidadesAsyncMulti from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelectAct.jsx";
import AsyncMultiMemoIdsSelect from "../../components/ComponentesAsyncSelect/AsyncMultiMemoIdsSelect.jsx";
import {
    consultaMemosServiciosEspeciales,
    consultarMemosPorIds,
    consultaTodosMemosPMSUBDIPOL,
    guardarRevisionMemo,
    obtenerEstadisticas,
} from "../../api/nodosApi.js";
import {useAuth} from "../../components/contexts/AuthContext.jsx";
import {useNavigate} from "react-router-dom";

/* ------------------ Config UI y helpers ------------------ */

const estadoColors = {
    SIN_REVISAR: "secondary", // Pendiente (gris)
    PENDIENTE: "warning",
    APROBADO: "success",
    OBSERVADO: "warning",
    RECHAZADO: "danger",
};

// Colores para los estados de las personas (opcional, ajusta a tu catálogo real)
const estadoPersonaColor = {
    IMPUTADO: "danger",
    IMPUTADA: "danger",
    VICTIMA: "primary",
    VÍCTIMA: "primary",
    TESTIGO: "info",
    DENUNCIANTE: "warning",
    DETENIDO: "danger",
    AFECTADO: "secondary",
};
const colorEstado = (s) => estadoPersonaColor[(s || "").toUpperCase()] || "secondary";

const tipoMemos = [
    {value: "TODOS"},
    {value: "MEMORANDO DILIGENCIAS"},
    {value: "CONCURRENCIAS HOMICIDIOS"},
    {value: "MEMORANDO CONCURRENCIAS"},
    {value: "DILIGENCIAS HOMICIDIOS"},
];

const tipoFecha = [{value: "FECHA REGISTRO"}, {value: "FECHA DEL HECHO"}];

const toUTCISO = (str) => (str ? new Date(str).toISOString() : null);
const clamp2 = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
};
const stickyTh = {position: "sticky", top: 0, background: "var(--bs-body-bg)", zIndex: 1};

/* ------------------ Normalización de datos ------------------ */

// Acepta: ["VÍCTIMA", "IMPUTADO"]  ó  [{id:1, calidad:"VÍCTIMA"}, ...]  ó null
const normalizeEstadosPersona = (est) => {
    if (!est) return [];
    if (Array.isArray(est)) {
        return est
            .map((x) => {
                if (x == null) return null;
                if (typeof x === "string") return x;
                if (typeof x === "object") {
                    // intenta distintas claves habituales
                    return x.calidad ?? x.nombre ?? x.label ?? x.valor ?? null;
                }
                return null;
            })
            .filter(Boolean);
    }
    return [];
};

const normalizeMemo = (m) => {
    const fecha = m.fecha ? new Date(m.fecha) : null;

    const personas = (m.fichaPersonas || []).map((p) => ({
        id: p.id ?? `${m.id}-persona-${p.rut || Math.random()}`,
        rut: p.rut || "",
        nombre: [p.nombre, p.apellidoPat, p.apellidoMat].filter(Boolean).join(" ") || "",
        // ✅ Campos agregados
        sexo: p.sexo || null,
        edad: p.edad || null,
        nacionalidad: p.nacionalidad || null,
        condicionMigratoria: p.condicionMigratoria || null,
        // Campos existentes
        estados: normalizeEstadosPersona(p.estados),
        // ✅ NUEVO: Delitos agregados
        delitos: normalizeDelitosPersona(p.delitos),
    }));

    const drogas = (m.fichaDrogas || []).map((d, idx) => ({
        id: d.id ?? `${m.id}-droga-${idx}`,
        tipo: d.tipoDroga,
        cantidad: d.cantidadDroga,
        unidad: d.unidadMedida,
        obs: d.obs || "",
    }));

    const funcionarios = (m.fichaFuncionarios || []).map((f, idx) => ({
        id: f.id ?? `${m.id}-func-${idx}`,
        nombre: f.funcionario,
        responsabilidad: f.responsabilidadMemo,
    }));

    const vehiculos = (m.fichaVehiculos || []).map((v, idx) => ({
        id: v.id ?? `${m.id}-veh-${idx}`,
        patente: v.patente || v.ppu || "",
        marca: [v.marca, v.modelo].filter(Boolean).join(" "),
        calidad: v.calidad || "",
        obs: v.obs || "",
    }));

    // ✅ AGREGAR NORMALIZACIÓN PARA ARMAS
    const armas = (m.fichaArmas || []).map((a, idx) => ({
        id: a.id ?? `${m.id}-arma-${idx}`,
        serie: a.serieArma || "",
        marca: a.marcaArma || "",
        tipo: a.tipoArma || "",
        calibre: a.calibreArma || "",
    }));

    // ✅ AGREGAR NORMALIZACIÓN PARA DINEROS
    const dineros = (m.fichaDineros || []).map((d, idx) => ({
        id: d.id ?? `${m.id}-dinero-${idx}`,
        calidad: d.calidad || "",
        monto: d.monto || "",
        obs: d.obs || "",
    }));

    // ✅ AGREGAR NORMALIZACIÓN PARA MUNICIONES
    const municiones = (m.fichaMuniciones || []).map((mu, idx) => ({
        id: mu.id ?? `${m.id}-municion-${idx}`,
        obs: mu.obs || "",
    }));

    // ✅ AGREGAR NORMALIZACIÓN PARA OTRAS ESPECIES (COMO STRING)
    const otrasEspecies = (m.fichaOtrasEspecies || []).map((oe, idx) => ({
        id: oe.id ?? `${m.id}-especie-${idx}`,
        calidad: oe.calidad || "",
        descripcion: oe.descripcion || "",
        nue: oe.nue || "",
        cantidad: oe.cantidad || "",
        avaluo: oe.avaluo || "",
        utilizadoComoArma: oe.utilizadoComoArma || "", // ✅ MANTENER COMO STRING
        sitioSuceso: oe.sitioSuceso || "",
    }));

    const relatoPlano = (m.modusDescripcion || "")
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return {
        id: m.id,
        fecha: fecha ? fecha.toLocaleString("es-CL", {timeZone: "America/Santiago"}) : "—",
        _fechaSort: fecha ? fecha.getTime() : 0,
        tipo: m.formulario || "—",
        tipoDeMemo: m.tipo || "—",
        folio: m.folioBrain || "—",
        ruc: m.ruc || "—",
        unidad: m.unidad?.nombreUnidad || "—",
        estado: m.estadoRevision || "SIN_REVISAR",
        relato: relatoPlano,
        personas,
        drogas,
        funcionarios,
        vehiculos,
        armas,
        dineros,
        municiones,
        otrasEspecies, // ✅ AGREGAR
        issues: m.issues || [],
        _raw: m,
    };
};

// FUNCIÓN PARA DETERMINAR SI UNA PERSONA ESTÁ DETENIDA
const esPersonaDetenida = (estados) => {
    if (!Array.isArray(estados)) return false;
    return estados.some((estado) => {
        if (!estado) return false;
        const estadoStr = String(estado).toUpperCase();
        return estadoStr === "DETENIDO POR PDI" || estadoStr === "ARRESTADO" || estadoStr.includes("DETE");
    });
};

// ✅ NUEVA FUNCIÓN: Normalizar delitos (similar a normalizeEstadosPersona)
const normalizeDelitosPersona = (delitos) => {
    if (!delitos) return [];
    if (Array.isArray(delitos)) {
        return delitos
            .map((x) => {
                if (x == null) return null;
                if (typeof x === "string") return x;
                if (typeof x === "object") {
                    // intenta distintas claves habituales para delitos
                    return x.delito ?? x.nombre ?? x.descripcion ?? x.label ?? x.valor ?? null;
                }
                return null;
            })
            .filter(Boolean);
    }
    return [];
};

// FUNCIÓN PARA CONTAR DETENIDOS EN UNA LISTA DE MEMOS
const contarDetenidos = (memos) => {
    let totalDetenidos = 0;
    (memos || []).forEach((memo) => {
        if (memo.personas && Array.isArray(memo.personas)) {
            memo.personas.forEach((persona) => {
                if (esPersonaDetenida(persona.estados)) {
                    totalDetenidos++;
                }
            });
        }
    });
    return totalDetenidos;
};

/* ------------------ Componente principal ------------------ */

export default function AuditoriaMemos() {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [searchMode, setSearchMode] = useState("unidades"); // "unidades" | "folio"

    // Modales observar / aprobar
    const [selected, setSelected] = useState(null);
    const [observado, setObservado] = useState(null);
    const [aprobado, setAprobado] = useState(null);

    // formularios
    const [obsTexto, setObsTexto] = useState("");
    const [obsAprobTexto, setObsAprobTexto] = useState("");
    const [savingRev, setSavingRev] = useState(false);
    const [saveErr, setSaveErr] = useState(null);

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

    // ✅ NUEVA FUNCIÓN PARA CONSULTA PMSUBDIPOL (solo 4 filtros)
    const buildFiltersPMSUBDIPOL = () => {
        return {
            fechaInicioUtc: toUTCISO(payload.fechaInicio),
            fechaTerminoUtc: toUTCISO(payload.fechaTermino),
            tipoFecha: payload.tipoFecha || null,
            tipoMemo: payload.tipoMemo === "TODOS" ? null : payload.tipoMemo,
            filtroDetenidos: filtroDetenidos,
        };
    };

    // ✅ NUEVA FUNCIÓN PARA CONSULTA COMPLETA PMSUBDIPOL
    const handleConsultaTodosPMSUBDIPOL = async () => {
        setErr(null);

        // Validar permisos
        if (!user?.siglasUnidad || user.siglasUnidad !== "PMSUBDIPOL") {
            setErr("No tienes permisos para realizar esta consulta completa.");
            return;
        }

        const filtros = buildFiltersPMSUBDIPOL();
        setLoading(true);
        setSelected(null);

        try {
            console.log("🔍 Iniciando consulta completa PMSUBDIPOL...");
            console.log("📋 Filtros:", filtros);

            const data = await consultaTodosMemosPMSUBDIPOL(filtros);
            const normalizados = (Array.isArray(data) ? data : []).map(normalizeMemo);
            setMemos(normalizados);
            setPage(1);

            console.log(`✅ Se cargaron ${normalizados.length} memos de todas las unidades`);
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
            // ✅ CONVERTIR A NÚMEROS
            memoIds: (memoIds || []).map((o) => {
                const id = parseInt(o.value, 10);
                return isNaN(id) ? null : id;
            }).filter(id => id !== null),
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
        a.download = `auditoria_memos_${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[:T]/g, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ✅ FUNCIÓN MEJORADA PARA EXPORTAR ESTADÍSTICAS CON DEBUG
    const exportarEstadisticas = async () => {
        console.log("🔍 Iniciando exportación de estadísticas...");
        console.log("👤 Usuario:", user);

        if (!user?.siglasUnidad || user.siglasUnidad !== "PMSUBDIPOL") {
            alert("No tienes permisos para exportar estadísticas");
            return;
        }

        const filtros = buildFilters();

        try {
            setLoading(true);

            console.log("🌐 Llamando al endpoint de estadísticas...");
            console.log("🔗 URL:", `${import.meta.env.VITE_NODOS_CONSULTA_API_URL}/servicios-especiales/estadisticas`);

            // Usar la función de nodosApi.js en lugar de fetch directo
            const estadisticas = await obtenerEstadisticas(filtros);

            console.log("✅ Estadísticas obtenidas:", estadisticas);
            console.log("📊 Estructura de datos recibida:", Object.keys(estadisticas || {}));

            // Verificar que tengamos datos
            if (!estadisticas || typeof estadisticas !== 'object') {
                throw new Error('No se recibieron datos válidos del servidor');
            }

            // Generar Excel
            console.log("📄 Iniciando generación de Excel...");
            await generarArchivosExcel(estadisticas);

        } catch (e) {
            console.error("❌ Error detallado:", e);
            console.error("📝 Stack trace:", e.stack);

            let mensaje = "Error desconocido";
            if (e.response) {
                console.error("🔴 Error de respuesta HTTP:", e.response.status, e.response.data);
                mensaje = `Error del servidor: ${e.response.status} - ${e.response.statusText}`;
            } else if (e.request) {
                console.error("🔴 Error de red:", e.request);
                mensaje = "Error de conexión con el servidor";
            } else {
                mensaje = e.message || "Error al procesar los datos";
            }

            alert(`No fue posible generar el Excel: ${mensaje}`);
        } finally {
            setLoading(false);
        }
    };

    // ✅ FUNCIÓN MEJORADA PARA GENERAR EXCEL CON DEBUG
    const generarArchivosExcel = async (estadisticas) => {
        console.log("📊 Iniciando generación de archivo Excel...");

        try {
            // Verificar si xlsx está disponible
            console.log("📚 Importando librería XLSX...");
            const XLSX = await import('xlsx');
            console.log("✅ XLSX importado correctamente");

            // Crear workbook
            console.log("📖 Creando workbook...");
            const wb = XLSX.utils.book_new();

            let hojasCreadas = 0;

            // Hoja 1: Personas
            console.log("👥 Procesando personas...", estadisticas.personas);
            if (estadisticas.personas && Array.isArray(estadisticas.personas) && estadisticas.personas.length > 0) {
                const wsPersonas = XLSX.utils.json_to_sheet(estadisticas.personas.map(p => ({
                    'ID Memo': p.memoId,
                    'RUT': p.rut,
                    'Nombre': p.nombre,
                    'Apellido Pat': p.apellidoPat,
                    'Apellido Mat': p.apellidoMat,
                    'Estados': Array.isArray(p.estados) ? p.estados.join(', ') : (p.estados || ''),
                    'Folio': p.memoFolio,
                    'RUC': p.memoRuc,
                    'Formulario': p.memoFormulario,
                    'Fecha Memo': p.memoFecha ? new Date(p.memoFecha).toLocaleDateString('es-CL') : '',
                    'Unidad': p.memoUnidad,
                })));
                XLSX.utils.book_append_sheet(wb, wsPersonas, "Personas");
                hojasCreadas++;
                console.log("✅ Hoja Personas creada");
            } else {
                console.log("⚠️ No hay datos de personas o datos inválidos");
            }

            // Hoja 2: Armas
            console.log("🔫 Procesando armas...", estadisticas.armas);
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
                console.log("✅ Hoja Armas creada");
            } else {
                console.log("⚠️ No hay datos de armas");
            }

            // Hoja 3: Drogas
            console.log("💊 Procesando drogas...", estadisticas.drogas);
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
                console.log("✅ Hoja Drogas creada");
            } else {
                console.log("⚠️ No hay datos de drogas");
            }

            // Hoja 4: Dineros
            console.log("💰 Procesando dineros...", estadisticas.dineros);
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
                console.log("✅ Hoja Dineros creada");
            } else {
                console.log("⚠️ No hay datos de dineros");
            }

            // Hoja 5: Vehículos
            console.log("🚗 Procesando vehículos...", estadisticas.vehiculos);
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
                console.log("✅ Hoja Vehículos creada");
            } else {
                console.log("⚠️ No hay datos de vehículos");
            }

            // Hoja 6: Municiones
            console.log("🔆 Procesando municiones...", estadisticas.municiones);
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
                console.log("✅ Hoja Municiones creada");
            } else {
                console.log("⚠️ No hay datos de municiones");
            }

            // Hoja 7: Otras Especies
            console.log("📦 Procesando otras especies...", estadisticas.otrasEspecies);
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
                console.log("✅ Hoja Otras Especies creada");
            } else {
                console.log("⚠️ No hay datos de otras especies");
            }

            // Hoja 8: Resumen de Memos
            console.log("📋 Procesando resumen de memos...", estadisticas.resumenMemos);
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
                console.log("✅ Hoja Resumen Memos creada");
            } else {
                console.log("⚠️ No hay datos de resumen de memos");
            }

            // Verificar que al menos tengamos una hoja
            if (hojasCreadas === 0) {
                throw new Error('No se encontraron datos para exportar. Verifica que existan registros en el período seleccionado.');
            }

            // Generar archivo y descargarlo
            console.log(`📁 Generando archivo Excel con ${hojasCreadas} hojas...`);
            const fechaActual = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            const fileName = `Estadisticas_PMSUBDIPOL_${fechaActual}.xlsx`;

            console.log("💾 Guardando archivo:", fileName);
            XLSX.writeFile(wb, fileName);

            console.log("✅ Archivo generado exitosamente");
            alert(`✅ Archivo ${fileName} descargado exitosamente con ${hojasCreadas} hojas de datos`);

        } catch (e) {
            console.error("❌ Error en generación de Excel:", e);
            throw e; // Re-lanzar para que lo capture el catch principal
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

    /* ------------------ Modales aprobar / observar ------------------ */

    const resetModales = () => {
        setObservado(false);
        setAprobado(false);
        setObsTexto("");
        setObsAprobTexto("");
        setSaveErr(null);
    };

    const handleGuardarObservado = async () => {
        if (!selected?.id) return;
        const txt = obsTexto.trim();
        if (txt.length < 3) {
            setSaveErr("Escribe al menos 3 caracteres de observación.");
            return;
        }
        setSavingRev(true);
        setSaveErr(null);
        try {
            const payload = {
                estado: "PENDIENTE",
                memoId: selected.id,
                observaciones: txt,
                nombreRevisor: user?.nombreUsuario,
                unidadRevisor: user?.siglasUnidad,
                revisadoPlana: true,
                fechaRevisionPlana: new Date().toISOString()
            };
            const saved = await guardarRevisionMemo(payload, user?.token);
            setMemos((prev) => prev.map(m => m.id === selected.id ? {
                ...m,
                estado: (saved?.estado || "PENDIENTE")
            } : m));
            window.alert("Observación guardada correctamente");
            resetModales();
        } catch (e) {
            setSaveErr("No se pudo guardar la observación.");
            console.error(e);
        } finally {
            setSavingRev(false);
        }
    };

    const handleGuardarAprobado = async () => {
        if (!selected?.id) return;
        setSavingRev(true);
        setSaveErr(null);
        try {
            const payload = {
                estado: "APROBADO",
                memoId: selected.id,
                observaciones: obsAprobTexto.trim() || null,
                nombreRevisor: user?.nombreUsuario,
                unidadRevisor: user?.siglasUnidad,
                revisadoPlana: true,
                fechaRevisionPlana: new Date().toISOString()
            };
            const saved = await guardarRevisionMemo(payload, user?.token);
            setMemos((prev) => prev.map(m => m.id === selected.id ? {...m, estado: (saved?.estado || "APROBADO")} : m));
            window.alert("Memo aprobado correctamente");
            resetModales();
        } catch (e) {
            setSaveErr("No se pudo aprobar el memo.");
            console.error(e);
        } finally {
            setSavingRev(false);
        }
    };

    /* ------------------ Render ------------------ */

    return (
        <Container fluid className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h4 className="mb-0">📋 Auditoría de Memos</h4>
                    <small className="text-muted">
                        Busca por <strong>Unidades</strong> o por <strong>Folio</strong>. Las fechas y el{" "}
                        <strong>Tipo de memo</strong> aplican a ambos modos.
                    </small>
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

            <Card className="mb-3">
                <Card.Body>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">Modo de búsqueda:</span>
                            <ButtonGroup>
                                <Button
                                    size="sm"
                                    variant={searchMode === "unidades" ? "primary" : "outline-primary"}
                                    onClick={() => {
                                        setSearchMode("unidades");
                                        setMemoIds([]);
                                    }}
                                >
                                    Por Unidades
                                </Button>
                                <Button
                                    size="sm"
                                    variant={searchMode === "folio" ? "primary" : "outline-primary"}
                                    onClick={() => {
                                        setSearchMode("folio");
                                        setUnidadesSeleccionadas([]);
                                    }}
                                >
                                    Por ID memo
                                </Button>
                            </ButtonGroup>
                        </div>

                        <div className="w-100 d-flex flex-wrap align-items-center gap-2">
                            <Form.Label className="mb-0 small text-muted ms-2">Tipo de fecha</Form.Label>
                            <Form.Select
                                size="sm"
                                style={{maxWidth: 160}}
                                value={payload.tipoFecha}
                                onChange={(e) => setPayload((p) => ({...p, tipoFecha: e.target.value}))}
                            >
                                {tipoFecha.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.value}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Label className="mb-0 small text-muted">Fecha inicio</Form.Label>
                            <Form.Control
                                size="sm"
                                type="datetime-local"
                                step="60"
                                style={{maxWidth: 220}}
                                value={payload.fechaInicio}
                                onChange={(e) => setPayload((p) => ({...p, fechaInicio: e.target.value}))}
                            />
                            <Form.Label className="mb-0 small text-muted ms-2">Fecha término</Form.Label>
                            <Form.Control
                                size="sm"
                                type="datetime-local"
                                step="60"
                                style={{maxWidth: 220}}
                                value={payload.fechaTermino}
                                onChange={(e) => setPayload((p) => ({...p, fechaTermino: e.target.value}))}
                            />
                            <Form.Label className="mb-0 small text-muted ms-2">Tipo de memo</Form.Label>
                            <Form.Select
                                size="sm"
                                style={{maxWidth: 280}}
                                value={payload.tipoMemo}
                                onChange={(e) => setPayload((p) => ({...p, tipoMemo: e.target.value}))}
                            >
                                {tipoMemos
                                    .filter(t => {
                                        // ✅ Si no es usuario PMSUBDIPOL, filtrar la opción "TODOS"
                                        if (user?.siglasUnidad !== "PMSUBDIPOL" && t.value === "TODOS") {
                                            return false;
                                        }
                                        return true;
                                    })
                                    .map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.value}
                                        </option>
                                    ))
                                }
                            </Form.Select>

                        </div>
                    </div>

                    <Row className="g-3 mt-2">
                        {searchMode === "unidades" && (
                            <Col md={12}>
                                <Form.Label className="mb-1">Unidades</Form.Label>
                                <UnidadesAsyncMulti
                                    value={unidadesSeleccionadas}
                                    onChange={setUnidadesSeleccionadas}
                                    regionSeleccionada={regionSeleccionada}
                                    comunaSeleccionada={""}
                                />
                                {!!unidadesSeleccionadas.length && (
                                    <div className="small text-muted mt-1">
                                        Seleccionadas: {unidadesSeleccionadas.length}.
                                    </div>
                                )}
                            </Col>
                        )}

                        {searchMode === "folio" && (
                            <Col md={8}>
                                <Form.Label className="mb-1">IDs de Memo</Form.Label>
                                <AsyncMultiMemoIdsSelect value={memoIds} onChange={setMemoIds}/>
                                {!!memoIds.length && (
                                    <div className="small text-muted mt-1">IDs seleccionados: {memoIds.length}</div>
                                )}
                            </Col>
                        )}
                    </Row>

                    {/* ✅ NUEVA SECCIÓN INFORMATIVA PARA PMSUBDIPOL */}
                    {user?.siglasUnidad === "PMSUBDIPOL" && (
                        <Row className="mt-3">
                            <Col>
                                <div className="bg-warning bg-opacity-10 border border-warning rounded p-3">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="fw-bold text-warning">🌍 Acceso Especial PMSUBDIPOL</span>
                                    </div>
                                    <small className="text-muted">
                                        Como usuario de PMSUBDIPOL, tienes acceso al botón <strong>"Consulta
                                        Global"</strong> que permite
                                        consultar todos los memos de todas las unidades usando únicamente los filtros
                                        de:
                                        <strong> Tipo de fecha, Fecha inicio, Fecha término y Tipo de memo</strong>.
                                        Este botón ignora la selección de unidades específicas.
                                    </small>
                                </div>
                            </Col>
                        </Row>
                    )}

                    <Row className="mt-2">
                        <Col md={12}>
                            <Form.Check
                                type="checkbox"
                                id="filtro-detenidos"
                                label="🔒 Mostrar solo memorandos con personas detenidas (Detenido por PDI y Arrestado)"
                                checked={filtroDetenidos}
                                onChange={(e) => setFiltroDetenidos(e.target.checked)}
                                className="text-primary"
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div
                className="d-flex justify-content-between align-items-center m-2 bg-secondary bg-opacity-25 p-2 rounded-3 shadow-sm mb-4">
                <div className="d-flex align-items-center gap-2">
                    <InputGroup>
                        <InputGroup.Text>🔎</InputGroup.Text>
                        <Form.Control
                            placeholder="Búsqueda rápida local (ID, folio, RUC, unidad o texto del relato)…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </InputGroup>
                    <small className="text-muted">Este buscador filtra solo los resultados obtenidos.</small>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg="dark" pill>
                            {total} resultado{total === 1 ? "" : "s"}
                            {total > 0 && (
                                <>
                                    {" • "}
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id="tooltip-detenidos">
                                                Incluye: Detenidos por PDI y Arrestados.
                                            </Tooltip>
                                        }
                                    >
                                        <span className="text-info fw-bold" style={{cursor: 'pointer'}}>
                                            {contarDetenidos(filteredSorted)} detenido{contarDetenidos(filteredSorted) !== 1 ? "s" : ""}
                                        </span>
                                    </OverlayTrigger>

                                </>
                            )}
                        </Badge>
                    </div>
                    <Form.Select
                        size="sm"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n} por página
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={handleFiltrar} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border"/> : "Refrescar"}
                    </Button>
                    {
                        /**
                         *  <Button size="sm" variant="outline-success" onClick={exportCsv} disabled={!total}>
                         Exportar CSV
                         </Button>
                         */
                    }
                    <Button
                        size="sm"
                        variant="outline-success"
                        onClick={exportarEstadisticas}
                        disabled={loading || !total}
                        className="ms-2"
                    >
                        📊 Estadísticas Excel
                    </Button>
                </div>
            </div>

            {err && <Alert variant="danger" className="mb-2">{err}</Alert>}

            <div className="table-responsive" style={{maxHeight: "60vh"}}>
                <Table hover size="sm" className="align-middle">
                    <thead>
                    <tr>
                        <th style={stickyTh} onClick={() => toggleSort("id")} role="button">
                            ID {sort.by === "id" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh} onClick={() => toggleSort("_fechaSort")} role="button">
                            Fecha {sort.by === "_fechaSort" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Tipo</th>
                        <th style={stickyTh} onClick={() => toggleSort("folio")} role="button">
                            Folio {sort.by === "folio" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh} onClick={() => toggleSort("ruc")} role="button">
                            RUC {sort.by === "ruc" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Unidad / Relato</th>
                        <th style={stickyTh} onClick={() => toggleSort("estado")} role="button">
                            Estado {sort.by === "estado" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={8} className="text-center">
                                <Spinner animation="border" size="sm" className="me-2"/>
                                Cargando…
                            </td>
                        </tr>
                    )}

                    {!loading && paged.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                                No hay resultados. Ajusta los filtros o la búsqueda.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        paged.map((m) => (
                            <tr key={m.id}>
                                <td className="text-nowrap">{m.id}</td>
                                <td className="text-nowrap">{m.fecha}</td>
                                <td>
                                    <Badge bg="info" className="text-dark">
                                        {m.tipo}
                                    </Badge>
                                </td>
                                <td className="text-nowrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{m.folio}</span>
                                        {m.folio !== "—" && (
                                            <Button
                                                size="sm"
                                                variant="link"
                                                className="p-0"
                                                onClick={() => copy(String(m.folio))}
                                                title="Copiar folio"
                                            >
                                                📋
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td className="text-nowrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{m.ruc}</span>
                                        {m.ruc !== "—" && (
                                            <Button
                                                size="sm"
                                                variant="link"
                                                className="p-0"
                                                onClick={() => copy(String(m.ruc))}
                                                title="Copiar RUC"
                                            >
                                                📋
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td style={{minWidth: 260}}>
                                    <div className="fw-semibold">{m.unidad}</div>
                                    <div className="text-muted small mt-1" style={clamp2}>
                                        {m.relato}
                                    </div>
                                </td>
                                <td>
                                    <Badge
                                        bg={estadoColors[m.estado] || "secondary"}>{m.estado === "SIN_REVISAR" ? "Pendiente" : m.estado}</Badge>
                                </td>
                                <td className="text-end">
                                    <Button size="sm" variant="outline-primary" onClick={() => setSelected(m)}>
                                        Ver detalle
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ← Anterior
                    </Button>
                    <span className="small">Página {page} de {totalPages}</span>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Siguiente →
                    </Button>
                </div>
            )}

            {/* Modal Detalle */}
            <Modal show={!!selected} onHide={() => setSelected(null)} size="xl" fullscreen="lg-down" centered>
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title className="d-flex align-items-center gap-2">
                                <span>Memo #{selected.id}</span>
                                <Badge bg="info" className="text-dark">{selected.tipo}</Badge>
                                <Badge
                                    bg={estadoColors[selected.estado] || "secondary"}>{selected.estado === "SIN_REVISAR" ? "Pendiente" : selected.estado}</Badge>
                                <Badge bg="secondary" className="text-white">{selected.tipoDeMemo}</Badge>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Card>
                                        <Card.Body>
                                            <div className="mb-2">
                                                <div className="text-muted small">Fecha</div>
                                                <div className="fw-semibold">{selected.fecha}</div>
                                            </div>
                                            <div className="mb-2">
                                                <div className="text-muted small">Unidad</div>
                                                <div className="fw-semibold">{selected.unidad}</div>
                                            </div>
                                            <div className="mb-2">
                                                <div className="text-muted small">Folio / RUC</div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span><strong>Folio:</strong> {selected.folio}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="p-0"
                                                        onClick={() => copy(String(selected.folio))}
                                                    >
                                                        📋
                                                    </Button>
                                                    <span><strong>RUC:</strong> {selected.ruc}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="p-0"
                                                        onClick={() => copy(String(selected.ruc))}
                                                    >
                                                        📋
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <div className="text-muted small">Tipo de memo</div>
                                                <div className="fw-semibold">{selected.tipoDeMemo}</div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card>
                                        <Card.Body>
                                            <div className="mb-2">
                                                <div className="text-muted small">Relato</div>
                                            </div>
                                            {selected.relato ? (
                                                <div
                                                    className="border rounded p-3"
                                                    style={{whiteSpace: "pre-line", maxHeight: 240, overflowY: "auto"}}
                                                >
                                                    {selected.relato}
                                                </div>
                                            ) : (
                                                <div className="text-muted">—</div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Tabs defaultActiveKey="personas" className="mt-3">
                                <Tab eventKey="personas" title={`Personas (${selected.personas.length})`}>
                                    {selected.personas.length === 0 ? (
                                        <p className="text-muted">No hay personas asociadas.</p>
                                    ) : (

                                        <ListGroup className="mt-2">
                                            {selected.personas.map((p) => (
                                                <ListGroup.Item key={p.id}>
                                                    <div className="fw-semibold">{p.nombre || "Sin nombre"}</div>
                                                    {p.rut && <div className="text-muted small">{p.rut}</div>}

                                                    {/* ✅ Información personal con mensajes cuando no hay datos */}
                                                    <div className="row mt-2">
                                                        <div className="col-md-6">
                                                            <div className="small">
                                                                <strong>Sexo:</strong> {p.sexo ||
                                                                <span className="text-muted fst-italic">Información no disponible</span>}
                                                            </div>
                                                            <div className="small">
                                                                <strong>Edad:</strong> {p.edad ? `${p.edad} años` :
                                                                <span className="text-muted fst-italic">Información no disponible</span>}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="small">
                                                                <strong>Nacionalidad:</strong> {p.nacionalidad ||
                                                                <span className="text-muted fst-italic">Información no disponible</span>}
                                                            </div>
                                                            <div className="small">
                                                                <strong>Condición
                                                                    Migratoria:</strong> {p.condicionMigratoria ||
                                                                <span className="text-muted fst-italic">Información no disponible</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ✅ Estados con mensaje cuando no hay datos */}
                                                    <div className="mt-2 d-flex flex-column gap-1">
                                                        <div className={"d-flex gap-2 align-items-center"}>
                                                            <div>
                                                                <strong>Calidad de la persona:</strong>
                                                            </div>
                                                            <div>
                                                                {!!(p.estados && p.estados.length) ? (
                                                                    p.estados.map((e, i) => {
                                                                        const esDet = esPersonaDetenida([e]);
                                                                        return (
                                                                            <Badge
                                                                                key={i}
                                                                                bg={esDet ? "danger" : colorEstado(e)}
                                                                                className={`me-1 ${esDet ? "fw-bold" : ""}`}
                                                                                pill
                                                                                title={esDet ? "Persona detenida" : ""}
                                                                            >
                                                                                {e}
                                                                                {esDet && " 🔒"}
                                                                            </Badge>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-muted fst-italic">Información no disponible</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ✅ Delitos con mensaje cuando no hay datos */}
                                                    <div className="mt-1 d-flex flex-column gap-1">
                                                        <div className={"d-flex gap-2 align-items-center"}>
                                                            <div>
                                                                <strong>Delitos:</strong>
                                                            </div>
                                                            <div>
                                                                {!!(p.delitos && p.delitos.length) ? (
                                                                    p.delitos.map((delito, i) => (
                                                                        <Badge
                                                                            key={i}
                                                                            bg="warning"
                                                                            text="dark"
                                                                            className="me-1"
                                                                            pill
                                                                        >
                                                                            {delito}
                                                                        </Badge>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-muted fst-italic">Información no disponible</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                {/* ✅ PESTAÑA ARMAS */}
                                <Tab eventKey="armas" title={`Armas (${selected.armas.length})`}>
                                    {selected.armas.length === 0 ? (
                                        <p className="text-muted">No hay armas asociadas.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.armas.map((a) => (
                                                <ListGroup.Item key={a.id}>
                                                    <div
                                                        className="fw-semibold">{a.tipo || "Sin tipo especificado"}</div>
                                                    <div className="text-muted small">
                                                        <strong>Marca:</strong> {a.marca || "—"} |
                                                        <strong> Serie:</strong> {a.serie || "—"} |
                                                        <strong> Calibre:</strong> {a.calibre || "—"}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                {/* ✅ PESTAÑA DINEROS */}
                                <Tab eventKey="dineros" title={`Dineros (${selected.dineros.length})`}>
                                    {selected.dineros.length === 0 ? (
                                        <p className="text-muted">No hay dineros asociados.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.dineros.map((d) => (
                                                <ListGroup.Item key={d.id}>
                                                    <div
                                                        className="fw-semibold">{d.calidad || "Sin calidad especificada"}</div>
                                                    <div className="text-muted small">
                                                        <strong>Monto:</strong> {d.monto || "—"}
                                                        {d.obs && (
                                                            <span> | <strong>Observaciones:</strong> {d.obs}</span>
                                                        )}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="drogas" title={`Drogas (${selected.drogas.length})`}>
                                    {selected.drogas.length === 0 ? (
                                        <p className="text-muted">No hay drogas.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.drogas.map((d) => (
                                                <ListGroup.Item key={d.id}>
                                                    <div className="fw-semibold">{d.tipo}</div>
                                                    <div className="text-muted small">
                                                        {d.cantidad} {d.unidad} {d.obs ? `· ${d.obs}` : ""}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="funcionarios" title={`Funcionarios (${selected.funcionarios.length})`}>
                                    {selected.funcionarios.length === 0 ? (
                                        <p className="text-muted">No hay funcionarios asociados.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.funcionarios.map((f) => (
                                                <ListGroup.Item key={f.id}>
                                                    <div className="fw-semibold">{f.nombre}</div>
                                                    {f.responsabilidad && (
                                                        <div className="text-muted small">{f.responsabilidad}</div>
                                                    )}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                {/* ✅ PESTAÑA MUNICIONES */}
                                <Tab eventKey="municiones" title={`Municiones (${selected.municiones.length})`}>
                                    {selected.municiones.length === 0 ? (
                                        <p className="text-muted">No hay municiones asociadas.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.municiones.map((m) => (
                                                <ListGroup.Item key={m.id}>
                                                    <div className="fw-semibold">Munición</div>
                                                    <div className="text-muted small">
                                                        {m.obs || "Sin observaciones"}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="vehiculos" title={`Vehículos (${selected.vehiculos.length})`}>
                                    {selected.vehiculos.length === 0 ? (
                                        <p className="text-muted">No hay vehículos.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.vehiculos.map((v) => (
                                                <ListGroup.Item key={v.id}>
                                                    <div className="fw-semibold">{v.patente || "Sin patente"}</div>
                                                    <div className="text-muted small">
                                                        <strong>Marca/Modelo:</strong> {v.marca || "—"}
                                                        {v.calidad && (
                                                            <span> | <strong>Calidad:</strong> {v.calidad}</span>
                                                        )}
                                                        {v.obs && (
                                                            <span> | <strong>Observaciones:</strong> {v.obs}</span>
                                                        )}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                {/* ✅ PESTAÑA OTRAS ESPECIES (CORREGIDA PARA STRING) */}
                                <Tab eventKey="otrasEspecies"
                                     title={`Otras Especies (${selected.otrasEspecies.length})`}>
                                    {selected.otrasEspecies.length === 0 ? (
                                        <p className="text-muted">No hay otras especies asociadas.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.otrasEspecies.map((oe) => (
                                                <ListGroup.Item key={oe.id}>
                                                    <div
                                                        className="fw-semibold">{oe.descripcion || "Sin descripción"}</div>
                                                    <div className="text-muted small">
                                                        <strong>Calidad:</strong> {oe.calidad || "—"} |
                                                        <strong> Cantidad:</strong> {oe.cantidad || "—"} |
                                                        <strong> NUE:</strong> {oe.nue || "—"}
                                                    </div>
                                                    {oe.avaluo && (
                                                        <div className="text-muted small">
                                                            <strong>Avalúo:</strong> {oe.avaluo}
                                                        </div>
                                                    )}
                                                    {/* ✅ LÓGICA CORREGIDA PARA STRING */}
                                                    {oe.utilizadoComoArma &&
                                                        oe.utilizadoComoArma !== "—" &&
                                                        oe.utilizadoComoArma !== "" &&
                                                        oe.utilizadoComoArma.toUpperCase().includes("SI") && (
                                                            <Badge bg="warning" className="me-1">
                                                                Utilizado como arma
                                                            </Badge>
                                                        )}
                                                    {oe.sitioSuceso && (
                                                        <div className="text-muted small">
                                                            <strong>Sitio del suceso:</strong> {oe.sitioSuceso}
                                                        </div>
                                                    )}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="issues" title={`Observaciones (${selected.issues.length})`}>
                                    {selected.issues.length === 0 ? (
                                        <p className="text-muted">No hay observaciones.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.issues.map((i) => (
                                                <ListGroup.Item key={i.id}>
                                                    <Badge
                                                        bg={
                                                            i.severidad === "ERROR"
                                                                ? "danger"
                                                                : i.severidad === "WARN"
                                                                    ? "warning"
                                                                    : "info"
                                                        }
                                                        className="me-2"
                                                    >
                                                        {i.severidad}
                                                    </Badge>
                                                    <strong>{i.codigo}</strong> — {i.detalle}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="me-auto text-muted small">ID: {selected.id}</div>
                            <Button variant="success" size="sm" onClick={() => setAprobado(selected)}>
                                Aprobar
                            </Button>
                            <Button variant="warning" size="sm" onClick={() => setObservado(selected)}>
                                Observar
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Modal OBSERVAR */}
            <Modal show={!!observado} onHide={resetModales} centered>
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Observar memo #{selected.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className="mb-2">
                                <Form.Label>Observaciones (requerido)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Describe brevemente el problema/observación…"
                                    value={obsTexto}
                                    onChange={(e) => setObsTexto(e.target.value)}
                                    disabled={savingRev}
                                />
                                <Form.Text muted>
                                    Se guardará con estado <strong>PENDIENTE</strong>.
                                </Form.Text>
                            </Form.Group>
                            {saveErr && <div className="text-danger small">{saveErr}</div>}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={resetModales} disabled={savingRev}>
                                Cancelar
                            </Button>
                            <Button variant="warning" onClick={handleGuardarObservado} disabled={savingRev}>
                                {savingRev ? "Guardando…" : "Guardar observación"}
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Modal APROBAR */}
            <Modal show={!!aprobado} onHide={resetModales} centered>
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Aprobar memo #{selected.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="mb-2">
                                ¿Confirmas la aprobación de este memo? Se guardará con estado{" "}
                                <strong>APROBADO</strong>.
                            </p>
                            <Form.Group>
                                <Form.Label>Observación (opcional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Puedes dejar un comentario breve (opcional)…"
                                    value={obsAprobTexto}
                                    onChange={(e) => setObsAprobTexto(e.target.value)}
                                    disabled={savingRev}
                                />
                            </Form.Group>
                            {saveErr && <div className="text-danger small mt-2">{saveErr}</div>}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={resetModales} disabled={savingRev}>
                                Cancelar
                            </Button>
                            <Button variant="success" onClick={handleGuardarAprobado} disabled={savingRev}>
                                {savingRev ? "Aprobando…" : "Aprobar"}
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
}