import React, { useState } from "react";
import RutInput from "./RutInput";
import GrafoD3 from "./GrafoD3";

// PALETA (debe ser igual en todo tu proyecto)
const azulBase = "#2a4d7c";
const azulMedio = "#4f7eb9";
const azulClaro = "#b1cfff";
const azulSidebar = "#eaf4fb";
const blanco = "#fff";
const grisClaro = "#f8fbfd";
const textoPrincipal = "#22334a";
const doradoSuave = "#ffe8a3";

export default function GrafoIndex() {
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);

    const buscarPorRut = async (rutFormateado) => {
        setLoading(true);
        try {
            const resp = await fetch(`http://localhost:8013/api/nodos/consulta/persona/${rutFormateado}`);
            if (resp.ok) {
                const data = await resp.json();
                setNodes(data.nodes);
                setLinks(data.links);
            } else {
                setNodes([]);
                setLinks([]);
                alert("No se encontró persona");
            }
        } catch (e) {
            setNodes([]);
            setLinks([]);
            alert("Error en la consulta");
        }
        setLoading(false);
    };

    return (
        <div style={{
            background: grisClaro,
            minHeight: "100vh",
            padding: "0",
            color: textoPrincipal,
            fontFamily: "Segoe UI, Arial"
        }}>
            <header style={{
                padding: "28px 0 16px 0",
                textAlign: "center",
                background: azulSidebar,
                marginBottom: 20,
                boxShadow: "0 1px 8px #0001"
            }}>
                <h1 style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 38,
                    color: azulBase,
                    letterSpacing: "-1px"
                }}>
                    Racview
                </h1>
                <div style={{
                    fontSize: 17,
                    color: azulMedio,
                    fontWeight: 400,
                    marginTop: 3
                }}>
                    Consulta y visualización de relaciones por RUT
                </div>
            </header>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
                <RutInput onBuscar={buscarPorRut} />
                {loading
                    ? <div style={{
                        margin: "2em auto",
                        fontSize: 20,
                        color: azulBase
                    }}>Cargando...</div>
                    : <GrafoD3 nodes={nodes} links={links} />}
            </div>
        </div>
    );
}
