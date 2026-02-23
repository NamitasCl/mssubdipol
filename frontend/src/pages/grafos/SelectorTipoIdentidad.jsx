import React from "react";

const azulBase = "#1a365d";
const azulClaro = "#b1cfff";

export default function SelectorTipoIdentidad({ tipo, onSeleccionar }) {
    const containerStyle = {
        display: "flex",
        background: "#f1f5f9",
        padding: "4px",
        borderRadius: "10px",
        marginBottom: "20px",
        border: "1px solid #e2e8f0"
    };

    const itemStyle = (selected) => ({
        flex: 1,
        padding: "8px 12px",
        borderRadius: "8px",
        textAlign: "center",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 600,
        transition: "all 0.2s ease",
        background: selected ? "#fff" : "transparent",
        color: selected ? azulBase : "#64748b",
        boxShadow: selected ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
        border: selected ? "1px solid #e2e8f0" : "1px solid transparent"
    });

    return (
        <div style={{ padding: "0 10px" }}>
            <div style={containerStyle}>
                <div 
                    style={itemStyle(tipo === "RUT")} 
                    onClick={() => onSeleccionar("RUT")}
                >
                    Cédula (RUT)
                </div>
                <div 
                    style={itemStyle(tipo === "PASAPORTE")} 
                    onClick={() => onSeleccionar("PASAPORTE")}
                >
                    Pasaporte
                </div>
            </div>
        </div>
    );
}