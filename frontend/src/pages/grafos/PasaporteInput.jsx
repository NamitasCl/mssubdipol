// PasaporteInput.jsx
import React, { useState } from "react";

export default function PasaporteInput({ onBuscar }) {
    const [pasaporte, setPasaporte] = useState("");
    const [error, setError] = useState("");

    const validar = (value) =>
        /^[A-Z0-9]{6,15}$/i.test(value); // Simple, ajusta según país

    const handleChange = (e) => {
        setPasaporte(e.target.value.toUpperCase());
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validar(pasaporte)) {
            onBuscar && onBuscar({ tipo: "PASAPORTE", valor: pasaporte });
        } else {
            setError("Pasaporte no válido");
        }
    };


    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                    value={pasaporte}
                    onChange={handleChange}
                    placeholder="Pasaporte"
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 7, border: "1.5px solid #b1cfff" }}
                />
                <button type="submit" style={{ padding: "8px 20px", borderRadius: 7 }}>Buscar</button>
            </div>
            {error && <span style={{ color: "#ff5a5a", fontSize: 14 }}>{error}</span>}
        </form>
    );
}