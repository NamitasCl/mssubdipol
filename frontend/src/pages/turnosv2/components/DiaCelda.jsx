// src/components/Configuracion/DiaCelda.jsx

export default function DiaCelda({
                                     fecha,
                                     isHabilitado,
                                     plantillaNombre,
                                     isSelected,
                                     onToggleDia
                                 }) {
    const diaNum = fecha.split('-')[2]; // '2025-11-01' -> '01'

    // Definir clases de Bootstrap
    let cardClasses = "card h-100 ";
    let textClasses = "text-muted";

    if (isHabilitado) {
        cardClasses += "bg-white";
        textClasses = "text-dark";
    } else {
        cardClasses += "bg-light";
    }

    if (isSelected) {
        cardClasses += " border-primary border-2 shadow";
    } else {
        cardClasses += " border";
    }

    return (
        <div
            className={cardClasses}
            onClick={() => onToggleDia(fecha)}
            style={{
                minHeight: '100px',
                cursor: 'pointer',
                width: '100%'
            }}
        >
            <div className="card-body p-2 d-flex flex-column">
                <div className={`fw-bold small ${textClasses} mb-1`}>
                    {parseInt(diaNum)}
                </div>

                {isHabilitado && plantillaNombre && (
                    <span className="badge bg-success text-white small mt-auto text-truncate">
                        {plantillaNombre}
                    </span>
                )}
            </div>
        </div>
    );
}