// SelectorTipoVehiculo.jsx
import React from "react";

export default function SelectorTipoVehiculo({ tipo, onSeleccionar }) {
    return (
        <div style={{ display: "flex", gap: 14, margin: 12 }}>
            <label>
                <input
                    type="radio"
                    name="tipoVeh"
                    checked={tipo === "PATENTE"}
                    onChange={() => onSeleccionar("PATENTE")}
                />{" "}
                Por patente
            </label>
            <label>
                <input
                    type="radio"
                    name="tipoVeh"
                    checked={tipo === "CARACTERISTICAS"}
                    onChange={() => onSeleccionar("CARACTERISTICAS")}
                />{" "}
                Por características
            </label>
        </div>
    );
}