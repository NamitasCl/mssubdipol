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
        <div style={{ margin: 12 }}>
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
                <div style={{ marginTop: 12 }}>
                    <Button variant={"primary"} onClick={reset}>
                        Cambiar tipo de búsqueda
                    </Button>
                </div>
            )}
        </div>
    );
}