// PatenteInput.jsx
import React, { useState } from "react";

const regexPatente = /^[A-Z]{2}[0-9]{4}$|^[A-Z]{4}[0-9]{2}$|^[A-Z]{3}[0-9]{2}$|^[A-Z]{4}[0-9]{1}$/;

const cleanPatente = (val) =>
    val.replace(/[^A-Z0-9]/gi, "").toUpperCase();

export default function PatenteInput({ onBuscar }) {
    const [patente, setPatente] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setPatente(cleanPatente(e.target.value));
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (regexPatente.test(patente)) {
            onBuscar && onBuscar({ tipo: "PATENTE", valor: patente });
        } else {
            setError("Patente no válida. Ej: AA1234, ABCD12, ABC12");
        }
    };


    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                    value={patente}
                    onChange={handleChange}
                    placeholder="Ej: AA1234, ABCD12, ABC12"
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "1.5px solid #b1cfff" }}
                />
                <button type="submit" style={{ padding: "8px 20px", borderRadius: 7 }}>Buscar</button>
            </div>
            {error && <span style={{ color: "#ff5a5a", fontSize: 14 }}>{error}</span>}
        </form>
    );
}