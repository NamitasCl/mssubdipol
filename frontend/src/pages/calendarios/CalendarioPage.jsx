import React, { useState } from "react";
import CalendarioList from "./CalendarioList";
import CalendarioDetalle from "./CalendarioDetalle";
import GestionTurnosPage from "../turnos/GestionTurnosPage.jsx";
import {useAuth} from "../../components/contexts/AuthContext.jsx";

export default function CalendarioPage() {

    const { user } = useAuth();
    const [detalleId, setDetalleId] = useState(null);

    console.log("user:", user);

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