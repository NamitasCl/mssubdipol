import React, { useState } from "react";

// Paleta igual que GrafoIndex
const azulBase = "#2a4d7c";
const azulMedio = "#4f7eb9";
const azulClaro = "#b1cfff";
const textoPrincipal = "#22334a";
const blanco = "#fff";

export default function RutInput({ onBuscar }) {
    const [rut, setRut] = useState("");

    // Opcional: Formatea RUT onChange
    const handleChange = (e) => setRut(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rut && onBuscar) {
            onBuscar(rut);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            marginBottom: 26,
            display: "flex",
            alignItems: "center",
            gap: 10
        }}>
            <input
                value={rut}
                onChange={handleChange}
                placeholder="RUT Ej: 12.345.678-9"
                style={{
                    padding: "8px 12px",
                    borderRadius: 7,
                    border: `1.5px solid ${azulClaro}`,
                    fontSize: 18,
                    color: textoPrincipal,
                    background: blanco,
                    outline: "none",
                    marginRight: 6,
                    boxShadow: "0 1px 3px #b1cfff10"
                }}
            />
            <button
                type="submit"
                style={{
                    padding: "8px 20px",
                    borderRadius: 7,
                    border: "none",
                    background: azulBase,
                    color: blanco,
                    fontWeight: 700,
                    fontSize: 17,
                    cursor: "pointer",
                    transition: "background 0.18s"
                }}
                onMouseOver={e => e.currentTarget.style.background = azulMedio}
                onMouseOut={e => e.currentTarget.style.background = azulBase}
            >
                Buscar
            </button>
        </form>
    );
}