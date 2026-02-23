// GrafoBusqueda.jsx
import React, { useState } from "react";
import SelectorBusqueda from "./SelectorBusqueda";
import SelectorTipoIdentidad from "./SelectorTipoIdentidad";
import SelectorTipoVehiculo from "./SelectorTipoVehiculo";
import RutInput from "./RutInput";
import PasaporteInput from "./PasaporteInput";
import PatenteInput from "./PatenteInput";
import CaracteristicasVehiculoInput from "./CaracteristicasVehiculoInput";
import {Button} from "react-bootstrap";

export default function GrafoBusqueda({ onBuscar }) {
    const [tipo, setTipo] = useState(null); // 'IDENTIDAD' | 'VEHICULO'
    const [subTipoIdentidad, setSubTipoIdentidad] = useState(null); // 'RUT' | 'PASAPORTE'
    const [subTipoVehiculo, setSubTipoVehiculo] = useState(null);   // 'PATENTE' | 'CARACTERISTICAS'

    // Para volver atrás
    const reset = () => {
        setTipo(null);
        setSubTipoIdentidad(null);
        setSubTipoVehiculo(null);
    };

    return (
        <div style={{ padding: "8px 4px" }}>
            {!tipo && <SelectorBusqueda onSeleccionar={setTipo} />}

            {tipo === "IDENTIDAD" && (
                <>
                    <SelectorTipoIdentidad tipo={subTipoIdentidad} onSeleccionar={setSubTipoIdentidad} />
                    {subTipoIdentidad === "RUT" && <RutInput onBuscar={onBuscar} />}
                    {subTipoIdentidad === "PASAPORTE" && <PasaporteInput onBuscar={onBuscar} />}
                </>
            )}

            {tipo === "VEHICULO" && (
                <>
                    <SelectorTipoVehiculo tipo={subTipoVehiculo} onSeleccionar={setSubTipoVehiculo} />
                    {subTipoVehiculo === "PATENTE" && <PatenteInput onBuscar={onBuscar} />}
                    {subTipoVehiculo === "CARACTERISTICAS" && <CaracteristicasVehiculoInput onBuscar={onBuscar} />}
                </>
            )}

            {(tipo || subTipoIdentidad || subTipoVehiculo) && (
                <div style={{ marginTop: 24, padding: "0 10px" }}>
                    <button 
                        onClick={reset}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: 8,
                            background: "transparent",
                            color: "#1a365d",
                            border: "1.5px solid #1a365d",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = "#1a365d";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#1a365d";
                        }}
                    >
                        Cambiar tipo de búsqueda
                    </button>
                </div>
            )}
        </div>
    );
}