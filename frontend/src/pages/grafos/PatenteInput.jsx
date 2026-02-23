import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const azulBase = "#1a365d";
const azulClaro = "#b1cfff";

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
                    style={{ 
                        flex: 1, 
                        padding: "10px 14px", 
                        borderRadius: 8, 
                        border: "1.5px solid " + azulClaro,
                        fontSize: "16px",
                        outline: "none",
                        boxShadow: "0 2px 4px rgba(177, 207, 255, 0.1)"
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