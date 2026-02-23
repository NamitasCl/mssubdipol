import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const azulBase = "#1a365d";
const azulClaro = "#b1cfff";
const textoPrin = "#22334a";
const blanco = "#fff";
const rojoError = "#ff5a5a";

const cleanRut = (value) => value.replace(/[^\dkK]/g, "").toUpperCase();

const formatRut = (valueClean) => {
    if (valueClean.length < 2) return valueClean;
    const cuerpo = valueClean.slice(0, -1);
    const dv = valueClean.slice(-1);
    const cuerpoPuntos = cuerpo
        .split("")
        .reverse()
        .map((c, i) => (i > 0 && i % 3 === 0 ? c + "." : c))
        .reverse()
        .join("");
    return `${cuerpoPuntos}-${dv}`;
};

const validarRut = (valueClean) => {
    if (valueClean.length < 2) return false;
    const cuerpo = valueClean.slice(0, -1);
    let dv = valueClean.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    let dvEsperado = 11 - (suma % 11);
    dvEsperado =
        dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
    return dv === dvEsperado;
};

export default function RutInput({ onBuscar }) {
    const [rutInput, setRutInput] = useState("");
    const [rutValido, setRutValido] = useState(true);

    const handleChange = (e) => {
        const limpio = cleanRut(e.target.value);
        setRutInput(limpio);
        if (limpio.length >= 2) setRutValido(validarRut(limpio));
        else setRutValido(true);
    };

    const handleBlur = () => {
        if (!rutInput) return;
        const limpio = cleanRut(rutInput);
        const formateado = formatRut(limpio);
        setRutInput(formateado);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const limpio = cleanRut(rutInput);
        if (validarRut(limpio)) {
            onBuscar && onBuscar({ tipo: "RUT", valor: formatRut(limpio) });
        } else {
            setRutValido(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                marginBottom: 26,
                display: "flex",
                flexDirection: "column",
                gap: 6,
            }}
        >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                    value={rutInput}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="RUT Ej: 12.345.678-9"
                    style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${rutValido ? azulClaro : rojoError}`,
                        fontSize: "18px",
                        color: textoPrin,
                        background: blanco,
                        outline: "none",
                        boxShadow: rutValido
                            ? "0 2px 4px rgba(177, 207, 255, 0.1)"
                            : "0 2px 4px rgba(255, 90, 90, 0.1)",
                    }}
                />
                <button
                    type="submit"
                    disabled={!rutValido || rutInput.length < 2}
                    style={{
                        padding: "10px 24px",
                        borderRadius: 8,
                        border: "none",
                        background: rutValido ? azulBase : "#b5c9ea",
                        color: blanco,
                        fontWeight: "600",
                        fontSize: "17px",
                        cursor: rutValido ? "pointer" : "not-allowed",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                    onMouseOver={e => rutValido && (e.currentTarget.style.filter = "brightness(1.2)")}
                    onMouseOut={e => rutValido && (e.currentTarget.style.filter = "brightness(1)")}
                >
                    <FaSearch size={14} />
                    Buscar
                </button>
            </div>
            {!rutValido && (
                <span style={{ color: rojoError, fontSize: 14, fontWeight: 500 }}>RUT inválido</span>
            )}
        </form>
    );
}