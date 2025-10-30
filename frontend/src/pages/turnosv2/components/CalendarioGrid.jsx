import DiaCelda from './DiaCelda';

// Helper (Lunes=0, ... Domingo=6)
const getDiaSemana = (fecha) => {
    const dia = new Date(fecha + "T00:00:00").getUTCDay();
    return (dia === 0) ? 6 : dia - 1;
};

const DIAS_SEMANA_LABEL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function CalendarioGrid({
                                           diasDelMes,
                                           diasHabilitados,
                                           plantillas,
                                           diasSeleccionados,
                                           onToggleDia
                                       }) {
    const habilitadosMap = new Map(diasHabilitados.map(dia => [dia.fecha, dia]));
    const plantillasMap = new Map(plantillas.map(p => [p.id, p.nombre]));

    const primerDiaPadding = diasDelMes.length > 0 ? getDiaSemana(diasDelMes[0]) : 0;

    return (
        <div className="bg-white p-3 rounded shadow-sm">
            {/* 1. Encabezado de días de la semana */}
            <div className="d-grid mb-2" style={{
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.25rem'
            }}>
                {DIAS_SEMANA_LABEL.map(d => (
                    <div key={d} className="text-center small text-muted fw-bold py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* 2. GRILLA DE DÍAS usando CSS Grid */}
            <div
                className="d-grid"
                style={{
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.25rem'
                }}
            >
                {/* A. Celdas de Relleno (Padding) para alinear el primer día del mes */}
                {Array.from({length: primerDiaPadding}).map((_, i) => (
                    <div key={`pad-${i}`} style={{minHeight: '100px'}}>
                        {/* Celda vacía */}
                    </div>
                ))}

                {/* B. Días del Mes (1, 2, 3...) */}
                {diasDelMes.map(fecha => {
                    const diaHabilitado = habilitadosMap.get(fecha);
                    const plantillaNombre = diaHabilitado?.plantillaId
                        ? plantillasMap.get(diaHabilitado.plantillaId)
                        : null;

                    return (
                        <DiaCelda
                            key={fecha}
                            fecha={fecha}
                            isHabilitado={!!diaHabilitado}
                            plantillaNombre={plantillaNombre}
                            isSelected={diasSeleccionados.has(fecha)}
                            onToggleDia={onToggleDia}
                        />
                    );
                })}
            </div>
        </div>
    );
}