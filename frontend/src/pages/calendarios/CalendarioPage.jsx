import React, { useState } from "react";
import CalendarioList from "./CalendarioList";
import CalendarioDetalle from "./CalendarioDetalle";

export default function CalendarioPage() {
    const [detalleId, setDetalleId] = useState(null);

    return (
        <div>
            {!detalleId ? (
                <CalendarioList onSeleccionar={setDetalleId} />
            ) : (
                <CalendarioDetalle id={detalleId} onVolver={() => setDetalleId(null)} />
            )}
        </div>
    );
}