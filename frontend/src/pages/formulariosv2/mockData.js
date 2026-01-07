// Mock data para formularios v2
// Este archivo contiene datos de prueba que pueden ser eliminados fácilmente

export const MOCK_FORMULARIOS = [
    {
        id: 1,
        nombre: "Registro de Servicios Especiales",
        descripcion: "Formulario para registro de servicios especiales policiales",
        creadorId: 101,
        creadorNombre: "Juan Pérez",
        unidadCreador: "DIPOL",
        fechaCreacion: "2025-01-10T10:00:00",
        estado: "activo",
        totalRespuestas: 45,
        limiteRespuestas: 100,
        visibilidad: [
            {tipo: "unidad", valor: "DIPOL", nombre: "DIPOL"},
            {tipo: "unidad", valor: "JENACAR", nombre: "JENACAR"}
        ],
        cuotas: [
            {tipo: "unidad", valor: "DIPOL", nombre: "DIPOL", cantidad: 50, completadas: 25},
            {tipo: "unidad", valor: "JENACAR", nombre: "JENACAR", cantidad: 50, completadas: 20}
        ],
        campos: [
            {id: "c1", tipo: "text", etiqueta: "Nombre del Servicio", requerido: true},
            {id: "c2", tipo: "date", etiqueta: "Fecha del Servicio", requerido: true},
            {
                id: "c3",
                tipo: "select",
                etiqueta: "Tipo de Servicio",
                opciones: ["Custodia", "Patrullaje", "Fiscalización"],
                requerido: true
            },
            {id: "c4", tipo: "number", etiqueta: "N° de Funcionarios", requerido: false}
        ]
    },
    {
        id: 2,
        nombre: "Evaluación de Desempeño",
        descripcion: "Evaluación trimestral de funcionarios",
        creadorId: 102,
        creadorNombre: "María González",
        unidadCreador: "RRHH",
        fechaCreacion: "2025-01-12T14:30:00",
        estado: "activo",
        totalRespuestas: 12,
        limiteRespuestas: null,
        visibilidad: [
            {tipo: "usuario", valor: "101", nombre: "Juan Pérez"},
            {tipo: "usuario", valor: "102", nombre: "María González"}
        ],
        cuotas: [],
        campos: [
            {id: "c1", tipo: "text", etiqueta: "Nombre Evaluado", requerido: true},
            {id: "c2", tipo: "scale", etiqueta: "Puntualidad", min: 1, max: 5, requerido: true},
            {id: "c3", tipo: "scale", etiqueta: "Trabajo en Equipo", min: 1, max: 5, requerido: true},
            {id: "c4", tipo: "textarea", etiqueta: "Comentarios", requerido: false}
        ]
    },
    {
        id: 3,
        nombre: "Solicitud de Permisos",
        descripcion: "Formulario para solicitar permisos administrativos",
        creadorId: 103,
        creadorNombre: "Carlos Ramírez",
        unidadCreador: "ADMIN",
        fechaCreacion: "2025-01-08T09:15:00",
        estado: "inactivo",
        totalRespuestas: 8,
        limiteRespuestas: 50,
        visibilidad: [
            {tipo: "publica", valor: null, nombre: "Público"}
        ],
        cuotas: [],
        campos: [
            {id: "c1", tipo: "date", etiqueta: "Fecha Inicio", requerido: true},
            {id: "c2", tipo: "date", etiqueta: "Fecha Término", requerido: true},
            {
                id: "c3",
                tipo: "select",
                etiqueta: "Tipo de Permiso",
                opciones: ["Médico", "Personal", "Administrativo"],
                requerido: true
            },
            {id: "c4", tipo: "textarea", etiqueta: "Justificación", requerido: true}
        ]
    }
];

export const FIELD_TYPES = [
    {
        id: "text",
        label: "Texto Corto",
        icon: "📝",
        description: "Campo de texto de una línea",
        defaultProps: {etiqueta: "Campo de texto", requerido: false}
    },
    {
        id: "textarea",
        label: "Texto Largo",
        icon: "📄",
        description: "Campo de texto multilínea",
        defaultProps: {etiqueta: "Campo de texto largo", requerido: false}
    },
    {
        id: "number",
        label: "Número",
        icon: "🔢",
        description: "Campo numérico",
        defaultProps: {etiqueta: "Campo numérico", requerido: false}
    },
    {
        id: "email",
        label: "Email",
        icon: "📧",
        description: "Campo de correo electrónico",
        defaultProps: {etiqueta: "Correo electrónico", requerido: false}
    },
    {
        id: "tel",
        label: "Teléfono",
        icon: "📞",
        description: "Campo de teléfono",
        defaultProps: {etiqueta: "Teléfono", requerido: false}
    },
    {
        id: "date",
        label: "Fecha",
        icon: "📅",
        description: "Selector de fecha",
        defaultProps: {etiqueta: "Fecha", requerido: false}
    },
    {
        id: "datetime",
        label: "Fecha y Hora",
        icon: "🕐",
        description: "Selector de fecha y hora",
        defaultProps: {etiqueta: "Fecha y hora", requerido: false}
    },
    {
        id: "time",
        label: "Hora",
        icon: "⏰",
        description: "Selector de hora",
        defaultProps: {etiqueta: "Hora", requerido: false}
    },
    {
        id: "select",
        label: "Selección",
        icon: "📋",
        description: "Lista desplegable",
        defaultProps: {
            etiqueta: "Seleccione una opción",
            opciones: ["Opción 1", "Opción 2", "Opción 3"],
            requerido: false
        }
    },
    {
        id: "radio",
        label: "Opción Única",
        icon: "🔘",
        description: "Botones de radio",
        defaultProps: {etiqueta: "Seleccione una opción", opciones: ["Opción 1", "Opción 2"], requerido: false}
    },
    {
        id: "checkbox",
        label: "Casillas",
        icon: "☑️",
        description: "Casillas de verificación múltiple",
        defaultProps: {
            etiqueta: "Seleccione opciones",
            opciones: ["Opción 1", "Opción 2", "Opción 3"],
            requerido: false
        }
    },
    {
        id: "scale",
        label: "Escala",
        icon: "📊",
        description: "Escala numérica (1-5, 1-10, etc.)",
        defaultProps: {etiqueta: "Calificación", min: 1, max: 5, requerido: false}
    },
    {
        id: "file",
        label: "Archivo",
        icon: "📎",
        description: "Carga de archivos",
        defaultProps: {etiqueta: "Adjuntar archivo", requerido: false, tiposPermitidos: ".pdf,.doc,.docx"}
    },
    {
        id: "funcionario",
        label: "Funcionario",
        icon: "👤",
        description: "Selector de funcionario",
        defaultProps: {etiqueta: "Seleccione funcionario", requerido: false}
    },
    {
        id: "unidad",
        label: "Unidad",
        icon: "🏢",
        description: "Selector de unidad",
        defaultProps: {etiqueta: "Seleccione unidad", requerido: false}
    },
    {
        id: "repetible",
        label: "Grupo Repetible",
        icon: "🔁",
        description: "Grupo de campos que se puede repetir múltiples veces",
        defaultProps: {
            tipo: 'repetible',
            etiqueta: 'Nuevo grupo repetible',
            requerido: false,
            minInstancias: 1,        // Mínimo de instancias requeridas
            maxInstancias: 9999,       // Máximo de instancias permitidas
            subcampos: [],           // Array que contendrá los campos internos
            // Opcionalmente:
            textoAgregar: 'Agregar',           // Texto del botón agregar
            textoEliminar: 'Eliminar',         // Texto del botón eliminar
            mostrarNumero: true,               // Mostrar "Item #1", "Item #2"
            etiquetaInstancia: 'Registro',     // "Registro #1", "Registro #2"
            colapsable: true                   // Si las instancias se pueden colapsar
        }
    }
];

export const VISIBILITY_TYPES = [
    {value: "publica", label: "Pública", icon: "🌐", description: "Todos pueden ver y completar"},
    {value: "unidad", label: "Por Unidad", icon: "🏢", description: "Solo unidades específicas"},
    {value: "usuario", label: "Por Usuario", icon: "👤", description: "Solo usuarios específicos"},
    {value: "grupo", label: "Por Grupo", icon: "👥", description: "Solo grupos específicos"}
];

// Función helper para limpiar datos mock
export const clearMockData = () => {
    console.log("🗑️ Mock data cleared - Ready for API integration");
    return [];
};

// Función helper para verificar permisos
export const canViewForm = (formulario, user) => {
    // Si el usuario creó el formulario
    if (formulario.creadorId === user?.idFuncionario) return true;

    // Si es pública
    if (formulario.visibilidad.some(v => v.tipo === "publica")) return true;

    // Si está asignado a mi unidad
    if (formulario.visibilidad.some(v => v.tipo === "unidad" && v.valor === user?.siglasUnidad)) return true;

    // Si estoy asignado directamente
    if (formulario.visibilidad.some(v => v.tipo === "usuario" && v.valor === user?.idFuncionario?.toString())) return true;

    return false;
};

export const getFormulariosByCategory = (formularios, user) => {
    const misFormularios = formularios.filter(f => f.creadorId === user?.idFuncionario);
    const asignadosMi = formularios.filter(f =>
        f.creadorId !== user?.idFuncionario &&
        f.visibilidad.some(v => v.tipo === "usuario" && v.valor === user?.idFuncionario?.toString())
    );
    const asignadosUnidad = formularios.filter(f =>
        f.creadorId !== user?.idFuncionario &&
        !asignadosMi.includes(f) &&
        f.visibilidad.some(v => v.tipo === "unidad" && v.valor === user?.siglasUnidad)
    );
    const publicos = formularios.filter(f =>
        f.creadorId !== user?.idFuncionario &&
        !asignadosMi.includes(f) &&
        !asignadosUnidad.includes(f) &&
        f.visibilidad.some(v => v.tipo === "publica")
    );

    return {
        misFormularios,
        asignadosMi,
        asignadosUnidad,
        publicos
    };
};
