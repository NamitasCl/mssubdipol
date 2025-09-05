import React, { useState } from "react";
import CalendarioList from "./CalendarioList";
import CalendarioDetalle from "./CalendarioDetalle";
import CreadorCalendarios from "./CreadorCalendarios.jsx";
import {useAuth} from "../../components/contexts/AuthContext.jsx";

export default function CalendarioPage() {

    const { user } = useAuth();
    const [detalleId, setDetalleId] = useState(null);



    return (
        <div>
            {!detalleId ? (
                <CreadorCalendarios onSeleccionar={setDetalleId} />
            ) : (
                <CalendarioDetalle id={detalleId} onVolver={() => setDetalleId(null)} />
            )}
        </div>
    );
}