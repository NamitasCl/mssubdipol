import React, { useState } from "react";
import { FaCar, FaPalette, FaCalendarAlt, FaIdCard, FaBarcode, FaSearch } from "react-icons/fa";

const azulBase = "#2a4d7c";
const azulClaro = "#b1cfff";
const textoPrincipal = "#22334a";
const rojoError = "#ff5a5a";

export default function CaracteristicasVehiculoInput({ onBuscar }) {
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [color, setColor] = useState("");
    const [vin, setVin] = useState("");
    const [error, setError] = useState("");

    const campos = [marca, modelo, color];
    const filledFields = campos.filter(Boolean).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (filledFields >= 2) {
            setError("");
            onBuscar && onBuscar({ tipo: "CARACTERISTICAS", valores: { marca, modelo, color, vin } });
        } else {
            setError("Debes ingresar al menos dos características.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                background: "#fff",
                border: `1.5px solid ${azulClaro}`,
                borderRadius: 13,
                boxShadow: "0 3px 12px #b1cfff22",
                padding: "22px 18px 18px 18px",
                maxWidth: 420,
                margin: "0 auto"
            }}
        >
            <div style={{ fontWeight: 700, color: azulBase, fontSize: 20, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <FaCar style={{ fontSize: 24, color: azulClaro }} /> Características del Vehículo
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative" }}>
                    <FaIdCard style={{ position: "absolute", left: 12, top: 11, color: azulClaro }} />
                    <input
                        value={marca}
                        onChange={e => setMarca(e.target.value)}
                        placeholder="Marca"
                        style={{
                            padding: "9px 12px 9px 38px",
                            border: "1.2px solid #dbeafe",
                            borderRadius: 8,
                            fontSize: 16,
                            color: textoPrincipal,
                            outline: "none",
                            width: "100%"
                        }}
                        autoComplete="off"
                    />
                </div>
                <div style={{ position: "relative" }}>
                    <FaBarcode style={{ position: "absolute", left: 12, top: 11, color: azulClaro }} />
                    <input
                        value={modelo}
                        onChange={e => setModelo(e.target.value)}
                        placeholder="Modelo"
                        style={{
                            padding: "9px 12px 9px 38px",
                            border: "1.2px solid #dbeafe",
                            borderRadius: 8,
                            fontSize: 16,
                            color: textoPrincipal,
                            outline: "none",
                            width: "100%"
                        }}
                        autoComplete="off"
                    />
                </div>
                <div style={{ position: "relative" }}>
                    <FaPalette style={{ position: "absolute", left: 12, top: 11, color: azulClaro }} />
                    <input
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        placeholder="Color"
                        style={{
                            padding: "9px 12px 9px 38px",
                            border: "1.2px solid #dbeafe",
                            borderRadius: 8,
                            fontSize: 16,
                            color: textoPrincipal,
                            outline: "none",
                            width: "100%"
                        }}
                        autoComplete="off"
                    />
                </div>
                <div 
                    style={{ position: "relative", cursor: "help" }} 
                    title="Campo en proceso de desarrollo"
                >
                    <FaIdCard style={{ position: "absolute", left: 12, top: 11, color: "#cbd5e1" }} />
                    <input
                        value={vin}
                        disabled
                        placeholder="VIN (Próximamente)"
                        style={{
                            padding: "9px 12px 9px 38px",
                            border: "1.2px solid #e2e8f0",
                            borderRadius: 8,
                            fontSize: 16,
                            color: "#94a3b8",
                            background: "#f8fafc",
                            outline: "none",
                            cursor: "help",
                            width: "100%"
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={filledFields < 2}
                    style={{
                        marginTop: 10,
                        padding: "10px 0",
                        borderRadius: 9,
                        background: filledFields >= 2 ? azulBase : "#b5c9ea",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 17,
                        border: "none",
                        cursor: filledFields >= 2 ? "pointer" : "not-allowed",
                        boxShadow: filledFields >= 2 ? "0 2px 7px #b1cfff34" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        justifyContent: "center",
                        transition: "background 0.15s",
                    }}
                >
                    <FaSearch style={{ fontSize: 17, opacity: 0.94 }} />
                    Buscar vehículo
                </button>
                <div style={{ fontSize: 14, marginTop: 7, color: "#666", textAlign: "center", opacity: 0.83 }}>
                    <span style={{ color: filledFields >= 2 ? azulBase : "#999", fontWeight: 500 }}>
                        {filledFields}/2
                    </span>{" "}
                    campos requeridos
                </div>
                {error && (
                    <span style={{
                        color: rojoError,
                        fontSize: 15,
                        fontWeight: 500,
                        marginTop: 7,
                        textAlign: "center",
                        letterSpacing: "-0.2px"
                    }}>
                        {error}
                    </span>
                )}
            </div>
        </form>
    );
}