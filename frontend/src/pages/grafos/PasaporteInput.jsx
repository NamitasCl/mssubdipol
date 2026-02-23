import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const azulBase = "#1a365d";
const azulClaro = "#b1cfff";

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
                    style={{ 
                        flex: 1, 
                        padding: "10px 14px", 
                        borderRadius: 8, 
                        border: "1.5px solid " + azulClaro,
                        fontSize: "16px",
                        outline: "none"
                    }}
                />
                <button 
                    type="submit" 
                    style={{ 
                        padding: "10px 24px", 
                        borderRadius: 8,
                        background: azulBase,
                        color: "#fff",
                        border: "none",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.filter = "brightness(1.2)"}
                    onMouseOut={e => e.currentTarget.style.filter = "brightness(1)"}
                >
                    <FaSearch size={14} />
                    Buscar
                </button>
            </div>
            {error && <div style={{ color: "#ff5a5a", fontSize: 13, marginTop: 6, fontWeight: 500 }}>{error}</div>}
        </form>
    );
}