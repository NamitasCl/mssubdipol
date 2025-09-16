import React, {useState} from "react";
import GrafoBusqueda from "./GrafoBusqueda";
import GrafoD3 from "./GrafoD3";
import {Card, Spinner} from "react-bootstrap";
import {
    consultaPorCaracteristicasVehiculo,
    consultaPorPasaporte,
    consultaPorPatente,
    consultaPorRutFormateado
} from "../../api/nodosApi.js";

const azulBase = "#0b0b0b";
const azulClaro = "#e2e3ec";
const azulSidebar = "#0f1f2b";
const grisClaro = "#f8fbfd";
const textoPrincipal = "#bfc9d8";
const doradoSuave = "#ffe8a3";

export default function GrafoIndex() {
    const [nodos, setNodos] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState(null);

    const handleBuscar = async (criterio) => {
        setLoading(true);
        setNodos([]);
        setLinks([]);
        setBusqueda(criterio);
        try {
            let data = null;

            if (criterio.tipo === "RUT") {
                data = await consultaPorRutFormateado(criterio.valor);
            } else if (criterio.tipo === "PASAPORTE") {
                data = await consultaPorPasaporte(criterio.valor);
            } else if (criterio.tipo === "PATENTE") {
                data = await consultaPorPatente(criterio.valor);
            } else if (criterio.tipo === "CARACTERISTICAS") {
                data = await consultaPorCaracteristicasVehiculo(criterio.valores);
            }

            setNodos(data.nodes);
            console.log("Nodos busqueda: ", data)
            setLinks(data.links);

        } catch (err) {
            setNodos([]);
            setLinks([]);
            alert("No se encontraron datos o hubo un error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: "100vw",
            background: grisClaro,
            minHeight: "100vh",
            padding: 0,
            color: textoPrincipal,
            fontFamily: "Segoe UI, Arial, sans-serif"
        }}>
            {/* Header */}
            <header style={{
                padding: "32px 0 18px 0",
                background: azulSidebar,
                marginBottom: 28,
                boxShadow: "0 1px 8px #0001",
                paddingLeft: 20,
            }}>
                <div style={{
                    maxWidth: 900,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <h1 style={{
                        fontWeight: 800,
                        fontSize: 36,
                        color: azulClaro,
                        letterSpacing: "-0.5px",
                        marginBottom: 2,
                        textAlign: "left"
                    }}>
                        RACView <span style={{
                        fontWeight: 400,
                        fontSize: 22,
                        color: azulClaro,
                        marginLeft: 16
                    }}>— Consulta de Nodos</span>
                    </h1>
                    <span style={{
                        fontSize: 17,
                        color: textoPrincipal,
                        fontWeight: 400,
                        marginTop: 2,
                        opacity: 0.88
                    }}>
                        Busca personas o vehículos y explora relaciones en un solo lugar.
                    </span>
                </div>
            </header>

            {/* Main */}
            <div style={{
                maxWidth: "98vw",
                margin: "0 auto",
                display: "flex",
                flexDirection: "row",
                gap: 24,
                padding: "0 18px 32px 18px"
            }}>
                {/* Card de búsqueda */}
                <Card style={{
                    border: "1.5px solid " + azulClaro,
                    borderRadius: 14,
                    boxShadow: "0 3px 12px #b1cfff18",
                    background: "#fff",
                    padding: "18px 0",
                    width: 500
                }}>
                    <Card.Body>
                        <GrafoBusqueda onBuscar={handleBuscar}/>
                    </Card.Body>
                </Card>

                {/* Feedback de loading */}
                {loading && (
                    <div style={{
                        textAlign: "center",
                        margin: "40px auto 30px auto"
                    }}>
                        <Spinner animation="border" style={{color: azulBase, width: 36, height: 36}}/>
                        <div style={{
                            color: textoPrincipal,
                            marginTop: 8,
                            fontSize: 15
                        }}>Cargando resultados…
                        </div>
                    </div>
                )}

                {/* Resultados */}
                {!loading && (nodos.length > 0 || links.length > 0) && (
                    <Card style={{
                        width: "100%",
                        border: "1.5px solid " + azulBase,
                        borderRadius: 14,
                        boxShadow: "0 2px 8px #2a4d7c16",
                        padding: "14px 0",
                        marginTop: 12
                    }}>
                        <Card.Body>
                            <h5 style={{
                                fontWeight: 600,
                                color: azulBase,
                                marginBottom: 12
                            }}>
                                Resultado de la búsqueda
                            </h5>
                            {busqueda &&
                                <div style={{
                                    fontSize: 15,
                                    color: azulBase,
                                    marginBottom: 8,
                                    opacity: 0.7
                                }}>
                                    <span>
                                        <b>Consulta:</b>{" "}
                                        {busqueda.tipo === "RUT" && `RUT ${busqueda.valor}`}
                                        {busqueda.tipo === "PASAPORTE" && `Pasaporte ${busqueda.valor}`}
                                        {busqueda.tipo === "PATENTE" && `Patente ${busqueda.valor}`}
                                        {busqueda.tipo === "CARACTERISTICAS" && (
                                            <>
                                                Características: {
                                                Object.entries(busqueda.valores)
                                                    .filter(([k, v]) => v)
                                                    .map(([k, v]) =>
                                                        `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`
                                                    )
                                                    .join(", ")
                                            }
                                            </>
                                        )}
                                    </span>
                                </div>
                            }
                            <div style={{
                                border: "1px solid #e5eaff",
                                borderRadius: 10,
                                padding: 12,
                                background: "#fafcff"
                            }}>
                                <GrafoD3 nodes={nodos} links={links}/>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Feedback si no hay resultados después de buscar */}
                {!loading && busqueda && nodos.length === 0 && (
                    <div style={{
                        background: "#ffe8a3",
                        border: "1px solid #fff1be",
                        borderRadius: 8,
                        color: "#7a611c",
                        padding: "13px 18px",
                        fontSize: 15,
                        fontWeight: 500,
                        textAlign: "center"
                    }}>
                        No se encontraron nodos relacionados a la consulta.
                    </div>
                )}
            </div>
        </div>
    );
}