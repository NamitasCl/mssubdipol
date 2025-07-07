import React, { useState } from "react";
import CalendarioList from "./CalendarioList";
import CalendarioDetalle from "./CalendarioDetalle";
import GestionTurnosPage from "../turnos/GestionTurnosPage.jsx";

export default function CalendarioPage() {
    const [detalleId, setDetalleId] = useState(null);

    return (
        <div>
            {!detalleId ? (
                <GestionTurnosPage onSeleccionar={setDetalleId} />
            ) : (
                <CalendarioDetalle id={detalleId} onVolver={() => setDetalleId(null)} />
            )}
        </div>
    );
}