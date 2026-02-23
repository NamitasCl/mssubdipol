import React from "react";
import { FaUser, FaCar } from "react-icons/fa";

const azulBase = "#1a365d";
const azulClaro = "#b1cfff";

export default function SelectorBusqueda({ onSeleccionar }) {
    const cardStyle = {
        flex: 1,
        padding: "24px",
        borderRadius: "12px",
        border: "1.5px solid #e2e8f0",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    };

    const handleMouseOver = (e) => {
        e.currentTarget.style.borderColor = azulClaro;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(177, 207, 255, 0.2)";
    };

    const handleMouseOut = (e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
    };

    return (
        <div style={{ padding: "10px" }}>
            <h4 style={{ color: azulBase, fontWeight: 700, marginBottom: "20px", fontSize: "18px" }}>
                ¿Qué desea buscar hoy?
            </h4>
            <div style={{ display: "flex", gap: "16px" }}>
                <div 
                    style={cardStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onClick={() => onSeleccionar("IDENTIDAD")}
                >
                    <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "10px" }}>
                        <FaUser size={24} color="#3b82f6" />
                    </div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>Identidad</span>
                </div>

                <div 
                    style={cardStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onClick={() => onSeleccionar("VEHICULO")}
                >
                    <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "10px" }}>
                        <FaCar size={24} color="#eab308" />
                    </div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>Vehículo</span>
                </div>
            </div>
        </div>
    );
}
