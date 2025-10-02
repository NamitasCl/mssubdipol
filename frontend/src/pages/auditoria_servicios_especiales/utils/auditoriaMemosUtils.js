// Colores de estados de revisión
export const estadoColors = {
    SIN_REVISAR: "secondary", // Pendiente (gris)
    PENDIENTE: "warning",
    APROBADO: "success",
    OBSERVADO: "warning",
    RECHAZADO: "danger",
};

// Colores para los estados de las personas (ajústalo a tu catálogo real si cambia)
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

export const colorEstado = (s) => estadoPersonaColor[(s || "").toUpperCase()] || "secondary";

// Catálogos UI
export const tipoMemos = [
    {value: "TODOS"},
    {value: "MEMORANDO DILIGENCIAS"},
    {value: "CONCURRENCIAS HOMICIDIOS"},
    {value: "MEMORANDO CONCURRENCIAS"},
    {value: "DILIGENCIAS HOMICIDIOS"},
];

export const tipoFecha = [{value: "FECHA REGISTRO"}, {value: "FECHA DEL HECHO"}];

// Estilos reutilizables
export const clamp2 = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
};
export const stickyTh = {position: "sticky", top: 0, background: "var(--bs-body-bg)", zIndex: 1};

// Helpers de tiempo
export const toUTCISO = (str) => (str ? new Date(str).toISOString() : null);

// Normalizaciones
export const normalizeEstadosPersona = (est) => {
    if (!est) return [];
    if (Array.isArray(est)) {
        return est
            .map((x) => {
                if (x == null) return null;
                if (typeof x === "string") return x;
                if (typeof x === "object") {
                    return x.calidad ?? x.nombre ?? x.label ?? x.valor ?? null;
                }
                return null;
            })
            .filter(Boolean);
    }
    return [];
};

// Normalizar delitos de persona
export const normalizeDelitosPersona = (delitos) => {
    if (!delitos) return [];
    if (Array.isArray(delitos)) {
        return delitos
            .map((x) => {
                if (x == null) return null;
                if (typeof x === "string") return x;
                if (typeof x === "object") {
                    return x.delito ?? x.nombre ?? x.descripcion ?? x.label ?? x.valor ?? null;
                }
                return null;
            })
            .filter(Boolean);
    }
    return [];
};

// Determina si una persona está detenida
export const esPersonaDetenida = (estados) => {
    if (!Array.isArray(estados)) return false;
    return estados.some((estado) => {
        if (!estado) return false;
        const estadoStr = String(estado).toUpperCase();
        return estadoStr === "DETENIDO POR PDI" || estadoStr === "ARRESTADO" || estadoStr.includes("DETE");
    });
};

// Contar detenidos en listado de memos
export const contarDetenidos = (memos) => {
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

// Normalizador principal de memos
export const normalizeMemo = (m) => {
    const fecha = m.fecha ? new Date(m.fecha) : null;
    const fecha_createdat = m.createdAt ? new Date(m.createdAt) : null;

    const personas = (m.fichaPersonas || []).map((p) => ({
        id: p.id ?? `${m.id}-persona-${p.rut || Math.random()}`,
        rut: p.rut || "",
        nombre: [p.nombre, p.apellidoPat, p.apellidoMat].filter(Boolean).join(" ") || "",
        sexo: p.sexo || null,
        edad: p.edad || null,
        nacionalidad: p.nacionalidad || null,
        condicionMigratoria: p.condicionMigratoria || null,
        estados: normalizeEstadosPersona(p.estados),
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

    const armas = (m.fichaArmas || []).map((a, idx) => ({
        id: a.id ?? `${m.id}-arma-${idx}`,
        serie: a.serieArma || "",
        marca: a.marcaArma || "",
        tipo: a.tipoArma || "",
        calibre: a.calibreArma || "",
    }));

    const dineros = (m.fichaDineros || []).map((d, idx) => ({
        id: d.id ?? `${m.id}-dinero-${idx}`,
        calidad: d.calidad || "",
        monto: d.monto || "",
        obs: d.obs || "",
    }));

    const municiones = (m.fichaMuniciones || []).map((mu, idx) => ({
        id: mu.id ?? `${m.id}-municion-${idx}`,
        obs: mu.obs || "",
    }));

    const otrasEspecies = (m.fichaOtrasEspecies || []).map((oe, idx) => ({
        id: oe.id ?? `${m.id}-especie-${idx}`,
        calidad: oe.calidad || "",
        descripcion: oe.descripcion || "",
        nue: oe.nue || "",
        cantidad: oe.cantidad || "",
        avaluo: oe.avaluo || "",
        utilizadoComoArma: oe.utilizadoComoArma || "",
        sitioSuceso: oe.sitioSuceso || "",
    }));

    const sitiosDeSuceso = (m.fichaSitioSucesos || []).map((ss) => ({
        calle: ss.calle || "",
        numero: ss.numero || "",
        block: ss.block || "",
        depto: ss.depto || "",
        comuna: ss.comuna || "",
        region: ss.region || "",
        fechaConcurrencia: ss.fechaConcurrencia ? new Date(ss.fechaConcurrencia).toLocaleString("es-CL", {timeZone: "America/Santiago"}) : null,
        tipoSitioSuceso: ss.tipoSitioSuceso || "",

    }))

    const relatoPlano = (m.modusDescripcion || "")
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const revision = {
        estado: m.estadoRevision || "SIN_REVISAR",
        fecha: m.fechaRevision ? new Date(m.fechaRevision).toLocaleString("es-CL", {timeZone: "America/Santiago"}) : null,
        nombreRevisor: m.nombreRevisor || null,
        unidadRevisor: m.unidadRevisor || null,
        rolRevisor: m.rolRevisor || null,
        observaciones: m.observacionesRevision || null,
    };

    return {
        id: m.id,
        fecha: fecha ? fecha.toLocaleString("es-CL", {timeZone: "America/Santiago"}) : "—",
        createdAt: fecha_createdat ? fecha_createdat.toLocaleString("es-Cl", {timeZone: "America/Santiago"}) : "-",
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
        otrasEspecies,
        revision,
        sitiosDeSuceso,
        issues: m.issues || [],
        _raw: m,
    };
};
