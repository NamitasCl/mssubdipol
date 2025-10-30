// src/api/mockApi.js
// Archivo de API simulada para el planificador de turnos

// --- DATOS MOCK: ENUMS Y DATOS SIMPLES ---
const MOCK_ROLES = [
    "JEFE_DE_SERVICIO",
    "ENCARGADO_DE_GUARDIA",
    "AYUDANTE_DE_GUARDIA",
    "JEFE_DE_RONDA",
    "GUARDIA_ARMADO"
];

const MOCK_UNIDADES = [
    {id: 1, nombre: "Unidad A", siglas: "UA"},
    {id: 2, nombre: "Unidad B", siglas: "UB"},
    {id: 3, nombre: "Unidad C", siglas: "UC"},
];

const MOCK_FUNCIONARIOS = [
    {id: 1, nombres: "Juan", apellidoPaterno: "Pérez", grado: "ISP"},
    {id: 2, nombres: "Ana", apellidoPaterno: "González", grado: "SBI"},
    {id: 3, nombres: "Carlos", apellidoPaterno: "Soto", grado: "DTV"},
    {id: 4, nombres: "María", apellidoPaterno: "Rojas", grado: "COM"},
    {id: 5, nombres: "Pedro", apellidoPaterno: "Morales", grado: "DTV"},
];

// --- DATOS MOCK: PLANTILLAS ---
let MOCK_PLANTILLAS = [
    {
        id: 1,
        nombre: "Turno Normal",
        requerimientos: [
            {rol: "JEFE_DE_SERVICIO", cantidad: 1},
            {rol: "AYUDANTE_DE_GUARDIA", cantidad: 2}
        ]
    },
    {
        id: 2,
        nombre: "Refuerzo Fin de Semana",
        requerimientos: [
            {rol: "JEFE_DE_RONDA", cantidad: 1},
            {rol: "ENCARGADO_DE_GUARDIA", cantidad: 2},
            {rol: "GUARDIA_ARMADO", cantidad: 2}
        ]
    }
];
let nextPlantillaId = 3;

// --- DATOS MOCK: CALENDARIOS ---
let MOCK_CALENDARIOS = [
    {
        id: 1,
        nombre: "Noviembre 2025",
        fechaInicio: "2025-11-01",
        fechaFin: "2025-11-30",
        estado: "EN_CONFIGURACION",
        unidadParticipantes: [1, 2] // IDs de MOCK_UNIDADES
    },
    {
        id: 2,
        nombre: "Octubre 2025 (Cerrado)",
        fechaInicio: "2025-10-01",
        fechaFin: "2025-10-31",
        estado: "PUBLICADO",
        unidadParticipantes: [1]
    }
];
let nextCalendarioId = 3;

// --- DATOS MOCK: DIAS, SLOTS, ASIGNACIONES ---
let MOCK_DIAS_CALENDARIO = [
    // Simula algunos días ya habilitados para el calendario 1
    {id: 101, calendarioId: 1, fecha: "2025-11-01", plantillaId: 1},
    {id: 102, calendarioId: 1, fecha: "2025-11-02", plantillaId: 1},
    {id: 103, calendarioId: 1, fecha: "2025-11-03", plantillaId: 1},
];
let nextDiaId = 104;

const MOCK_SLOTS = [
    // Slots para el 2025-11-01 (asumimos que 'generarSlots' los creó)
    {id: 1001, calendarioId: 1, fecha: "2025-11-01", rolRequerido: "JEFE_DE_SERVICIO"},
    {id: 1002, calendarioId: 1, fecha: "2025-11-01", rolRequerido: "AYUDANTE_DE_GUARDIA"},
    {id: 1003, calendarioId: 1, fecha: "2025-11-01", rolRequerido: "AYUDANTE_DE_GUARDIA"},
    // Slots para el 2025-11-02
    {id: 1004, calendarioId: 1, fecha: "2025-11-02", rolRequerido: "JEFE_DE_SERVICIO"},
    {id: 1005, calendarioId: 1, fecha: "2025-11-02", rolRequerido: "AYUDANTE_DE_GUARDIA"},
    {id: 1006, calendarioId: 1, fecha: "2025-11-02", rolRequerido: "AYUDANTE_DE_GUARDIA"},
    // Slots para el 2025-11-03
    {id: 1007, calendarioId: 1, fecha: "2025-11-03", rolRequerido: "JEFE_DE_SERVICIO"},
    {id: 1008, calendarioId: 1, fecha: "2025-11-03", rolRequerido: "AYUDANTE_DE_GUARDIA"},
    {id: 1009, calendarioId: 1, fecha: "2025-11-03", rolRequerido: "AYUDANTE_DE_GUARDIA"},
];

const MOCK_ASIGNACIONES = [
    // Asignaciones para 2025-11-01
    {id: 5001, slot: 1001, funcionario: 4}, // Slot 1001 (Jefe) -> Funcionario 4 (María)
    {id: 5002, slot: 1002, funcionario: 2}, // Slot 1002 (Ayudante) -> Funcionario 2 (Ana)
    {id: 5003, slot: 1003, funcionario: 3}, // Slot 1003 (Ayudante) -> Funcionario 3 (Carlos)
    // Asignaciones para 2025-11-02
    {id: 5004, slot: 1004, funcionario: 4}, // Slot 1004 (Jefe) -> Funcionario 4 (María)
    {id: 5005, slot: 1005, funcionario: 1}, // Slot 1005 (Ayudante) -> Funcionario 1 (Juan)
    {id: 5006, slot: 1006, funcionario: 5}, // Slot 1006 (Ayudante) -> Funcionario 5 (Pedro)
    // Asignaciones para 2025-11-03
    {id: 5007, slot: 1007, funcionario: 1}, // Slot 1007 (Jefe) -> Funcionario 1 (Juan)
    {id: 5008, slot: 1008, funcionario: 2}, // Slot 1008 (Ayudante) -> Funcionario 2 (Ana)
    {id: 5009, slot: 1009, funcionario: 5}, // Slot 1009 (Ayudante) -> Funcionario 5 (Pedro)
];

// --- HELPER: Simula un retraso de red ---
const delay = (ms) => new Promise(res => setTimeout(res, ms));


// --- API: Roles y Unidades (Datos base) ---

export const getRolesServicio = async () => {
    await delay(300);
    return [...MOCK_ROLES];
};

export const getUnidades = async () => {
    await delay(200);
    return [...MOCK_UNIDADES];
};

export const getFuncionarios = async () => {
    await delay(300);
    return [...MOCK_FUNCIONARIOS];
};

// --- API: Plantillas (Módulo 1) ---

export const getPlantillas = async () => {
    await delay(500);
    return [...MOCK_PLANTILLAS];
};

export const createPlantilla = async (plantillaData) => {
    await delay(500);
    const nuevaPlantilla = {...plantillaData, id: nextPlantillaId++};
    MOCK_PLANTILLAS.push(nuevaPlantilla);
    return {...nuevaPlantilla};
};

export const updatePlantilla = async (plantillaData) => {
    await delay(500);
    MOCK_PLANTILLAS = MOCK_PLANTILLAS.map(p =>
        p.id === plantillaData.id ? {...plantillaData} : p
    );
    return {...plantillaData};
};

export const deletePlantilla = async (id) => {
    await delay(500);
    MOCK_PLANTILLAS = MOCK_PLANTILLAS.filter(p => p.id !== id);
    return {id};
};

// --- API: Calendarios (Módulo 2 y 3) ---

export const getCalendarios = async () => {
    await delay(500);
    return [...MOCK_CALENDARIOS];
};

export const getCalendarioById = async (id) => {
    await delay(400);
    return MOCK_CALENDARIOS.find(c => c.id === parseInt(id));
};

export const createCalendario = async (calendarioData) => {
    await delay(500);
    const nuevoCalendario = {
        ...calendarioData,
        id: nextCalendarioId++,
        estado: "EN_CONFIGURACION" // Siempre empieza en config.
    };
    MOCK_CALENDARIOS.push(nuevoCalendario);
    return {...nuevoCalendario};
};

// --- API: Días Calendario (Módulo 3) ---

export const getDiasCalendario = async (calendarioId) => {
    await delay(500);
    return MOCK_DIAS_CALENDARIO.filter(d => d.calendarioId === parseInt(calendarioId));
};

export const habilitarDias = async (calendarioId, fechas) => {
    await delay(700);
    const nuevosDias = [];
    for (const fecha of fechas) {
        // Evitar duplicados
        if (!MOCK_DIAS_CALENDARIO.some(d => d.calendarioId === parseInt(calendarioId) && d.fecha === fecha)) {
            const nuevoDia = {
                id: nextDiaId++,
                calendarioId: parseInt(calendarioId),
                fecha: fecha,
                plantillaId: null // Empieza sin plantilla
            };
            MOCK_DIAS_CALENDARIO.push(nuevoDia);
            nuevosDias.push(nuevoDia);
        }
    }
    return nuevosDias;
};

export const asignarPlantilla = async (diaIds, plantillaId) => {
    await delay(600);
    const pId = plantillaId ? parseInt(plantillaId) : null;
    MOCK_DIAS_CALENDARIO = MOCK_DIAS_CALENDARIO.map(dia =>
        diaIds.includes(dia.id) ? {...dia, plantillaId: pId} : dia
    );
    return MOCK_DIAS_CALENDARIO.filter(dia => diaIds.includes(dia.id));
};


// --- API: Botones Mágicos (Módulo 3) ---

export const generarSlots = async (calendarioId) => {
    await delay(1500); // Simula un proceso más largo
    console.log(`API: Slots generados para calendario ${calendarioId}`);
    // En un app real, esto llenaría MOCK_SLOTS
    return {status: "success", message: "Slots generados correctamente"};
};

export const resolverTurnos = async (calendarioId) => {
    await delay(3000); // OptaPlanner puede tardar
    console.log(`API: ¡OptaPlanner resolvió los turnos para ${calendarioId}!`);

    // Simulamos que el estado del calendario cambia
    MOCK_CALENDARIOS = MOCK_CALENDARIOS.map(c =>
        c.id === parseInt(calendarioId) ? {...c, estado: "PUBLICADO"} : c
    );

    return {status: "success", message: "Turnos generados y publicados"};
};


// --- API: Asignaciones (Módulo 5) ---

export const getAsignaciones = async (calendarioId) => {
    await delay(800);
    // En una API real, haríamos un "join" en el backend
    // Aquí, lo simulamos:
    const asignaciones = MOCK_ASIGNACIONES.map(asig => {
        const slot = MOCK_SLOTS.find(s => s.id === asig.slot && s.calendarioId === parseInt(calendarioId));
        const funcionario = MOCK_FUNCIONARIOS.find(f => f.id === asig.funcionario);

        return {
            id: asig.id,
            slot: slot,
            funcionario: funcionario
        };
    });
    // Filtramos las que no pertenecen a este calendario
    return asignaciones.filter(asig => asig.slot != null);
};