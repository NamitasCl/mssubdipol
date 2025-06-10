import React from "react";
import EditarCalendarioTurnos from "./EditarCalendarioTurnos";
import AbrirCerrarCalendarioTurnos from "./AbrirCerrarCalendarioTurnos";

export default function PanelCalendarioSeleccionado({ calendario, onActualizado }) {
    if (!calendario) return null;

    return (
        <div>
            <h5 className="mb-3">Gestión del Calendario Seleccionado</h5>

            <EditarCalendarioTurnos
                calendario={calendario}
                onCalendarioEditado={onActualizado}
            />

            <hr />

            <AbrirCerrarCalendarioTurnos
                calendario={calendario}
                onEstadoCambiado={onActualizado}
            />
        </div>
    );
}