// SelectorBusqueda.jsx
import React from "react";
import { Button } from "react-bootstrap";

export default function SelectorBusqueda({ onSeleccionar }) {
    return (
        <div>
            <h4>Seleccione su búsqueda</h4>
            <div style={{ display: "flex", gap: 14, width: 500 }}>

                <Button variant="primary" onClick={() => onSeleccionar("IDENTIDAD")}>
                    Identidad
                </Button>
                <Button variant="secondary" onClick={() => onSeleccionar("VEHICULO")}>
                    Vehículo
                </Button>
            </div>
        </div>
    );
}
