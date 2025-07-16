// SelectorTipoIdentidad.jsx
import React from "react";

export default function SelectorTipoIdentidad({ tipo, onSeleccionar }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: 12 }}>
            <label>
                <input
                    type="radio"
                    name="tipoId"
                    checked={tipo === "RUT"}
                    onChange={() => onSeleccionar("RUT")}
                />{" "}
                Cédula de identidad (RUT)
            </label>
            <label>
                <input
                    type="radio"
                    name="tipoId"
                    checked={tipo === "PASAPORTE"}
                    onChange={() => onSeleccionar("PASAPORTE")}
                />{" "}
                Pasaporte
            </label>
        </div>
    );
}