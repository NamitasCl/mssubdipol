/**
 * Adapter para transformar datos entre backend y FormulariosV2
 */

/**
 * Transforma un formulario del backend al formato de FormulariosV2
 */
export function adaptarFormularioDesdeBackend(formularioBackend) {
    if (!formularioBackend) return null;

    return {
        id: formularioBackend.id,
        nombre: formularioBackend.nombre,
        descripcion: formularioBackend.descripcion || '',

        // Mapear activo (boolean) a estado (string)
        estado: formularioBackend.activo ? 'activo' : 'inactivo',

        // Mapear idCreador a creadorId
        creadorId: formularioBackend.idCreador,
        creadorNombre: formularioBackend.creadorNombre || 'N/A',
        unidadCreador: formularioBackend.unidadCreador || 'N/A',

        // Fechas
        fechaCreacion: formularioBackend.fechaCreacion || new Date().toISOString(),

        // Respuestas (puede no venir del backend)
        totalRespuestas: formularioBackend.totalRespuestas || 0,
        limiteRespuestas: formularioBackend.limiteRespuestas || null,

        // Mapear campos
        campos: (formularioBackend.campos || []).map(adaptarCampoDesdeBackend),

        // Mapear visibilidad: tipoDestino → tipo, valorDestino → valor, valorDestinoNombre → nombre
        visibilidad: (formularioBackend.visibilidad || []).map(v => ({
            tipo: v.tipoDestino || v.tipo,
            valor: v.valorDestino || v.valor,
            nombre: v.valorDestinoNombre || v.valorDestinoSiglas || v.nombre || v.valorDestino || 'N/A'
        })),

        // Cuotas (puede no venir directamente)
        cuotas: formularioBackend.cuotas || []
    };
}

/**
 * Transforma un campo del backend al formato de FormulariosV2
 */
export function adaptarCampoDesdeBackend(campoBackend) {
    if (!campoBackend) return null;

    // Convertir opciones de string a array si es necesario
    let opciones = campoBackend.opciones;
    if (typeof opciones === 'string') {
        opciones = opciones.split(',').map(o => o.trim()).filter(o => o);
    }

    return {
        id: campoBackend.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tipo: campoBackend.tipo,
        etiqueta: campoBackend.etiqueta,
        nombre: campoBackend.nombre,
        requerido: campoBackend.requerido || false,
        opciones: opciones,
        min: campoBackend.min,
        max: campoBackend.max,
        tiposPermitidos: campoBackend.tiposPermitidos,

        // Campos para tipo repetible
        subcampos: (campoBackend.subcampos || []).map(adaptarCampoDesdeBackend),
        minInstancias: campoBackend.minInstancias,
        maxInstancias: campoBackend.maxInstancias,
        etiquetaInstancia: campoBackend.etiquetaInstancia,
        textoAgregar: campoBackend.textoAgregar,
        textoEliminar: campoBackend.textoEliminar,
        mostrarNumero: campoBackend.mostrarNumero,
        colapsable: campoBackend.colapsable,

        // Otros
        nombreManual: campoBackend.nombreManual || false
    };
}

/**
 * Transforma un formulario de FormulariosV2 al formato del backend
 */
export function adaptarFormularioHaciaBackend(formularioV2) {
    if (!formularioV2) return null;

    return {
        nombre: formularioV2.nombre,
        descripcion: formularioV2.descripcion || '',
        limiteRespuestas: formularioV2.limiteRespuestas || null,

        // Mapear campos
        campos: (formularioV2.campos || []).map(adaptarCampoHaciaBackend),

        // Mapear visibilidad: tipo → tipoDestino, valor → valorDestino
        visibilidad: (formularioV2.visibilidad || []).map(v => ({
            tipoDestino: v.tipo,
            valorDestino: v.valor,
            valorDestinoNombre: v.nombre
        })),

        // Cuotas (si las hay)
        cuotas: formularioV2.cuotas || []
    };
}

/**
 * Transforma un campo de FormulariosV2 al formato del backend
 */
export function adaptarCampoHaciaBackend(campoV2) {
    if (!campoV2) return null;

    // Convertir opciones de array a string si es necesario
    let opciones = campoV2.opciones;
    if (Array.isArray(opciones)) {
        opciones = opciones.join(', ');
    }

    return {
        nombre: campoV2.nombre,
        etiqueta: campoV2.etiqueta,
        tipo: campoV2.tipo,
        requerido: campoV2.requerido || false,
        opciones: opciones,
        min: campoV2.min,
        max: campoV2.max,
        tiposPermitidos: campoV2.tiposPermitidos,

        // Campos para tipo repetible
        subcampos: (campoV2.subcampos || []).map(adaptarCampoHaciaBackend),
        minInstancias: campoV2.minInstancias,
        maxInstancias: campoV2.maxInstancias,
        etiquetaInstancia: campoV2.etiquetaInstancia,
        textoAgregar: campoV2.textoAgregar,
        textoEliminar: campoV2.textoEliminar,
        mostrarNumero: campoV2.mostrarNumero,
        colapsable: campoV2.colapsable
    };
}

/**
 * Adaptar múltiples formularios
 */
export function adaptarFormulariosDesdeBackend(formularios) {
    if (!Array.isArray(formularios)) return [];
    return formularios.map(adaptarFormularioDesdeBackend);
}
