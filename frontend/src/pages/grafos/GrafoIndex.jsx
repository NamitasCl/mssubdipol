import React, {useState} from "react";
import GrafoBusqueda from "./GrafoBusqueda";
import GrafoD3 from "./GrafoD3";
import ResultadosBusquedaModal from "./ResultadosBusquedaModal";
import {Card, Spinner} from "react-bootstrap";
import {
    consultaPorCaracteristicasVehiculo,
    consultaPorPasaporte,
    consultaPorPatente,
    consultaPorRutFormateado
} from "../../api/nodosApi.js";

const azulBase = "#1e293b";
const azulClaro = "#f1f5f9";
const azulSidebar = "#0f172a";
const grisClaro = "#f8fafc";
const textoPrincipal = "#334155";
const doradoPdi = "#eab308";

export default function GrafoIndex() {
    const [nodos, setNodos] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState(null);
    const [resultadosVehiculos, setResultadosVehiculos] = useState([]);
    const [showModalResultados, setShowModalResultados] = useState(false);

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
                const results = await consultaPorCaracteristicasVehiculo(criterio.valores);
                if (results && results.length > 0) {
                    setResultadosVehiculos(results);
                    setShowModalResultados(true);
                    setLoading(false);
                    return; // Terminamos aquí por ahora, esperando selección del usuario
                } else {
                    alert("No se encontraron vehículos con esas características.");
                    setLoading(false);
                    return;
                }
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
                padding: "40px 0 30px 0",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                marginBottom: 32,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                paddingLeft: 40,
                borderBottom: "4px solid " + doradoPdi
            }}>
                <div style={{
                    maxWidth: 1000,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <h1 style={{
                        fontWeight: 800,
                        fontSize: 42,
                        color: "#fff",
                        letterSpacing: "-1px",
                        marginBottom: 4,
                        textAlign: "left"
                    }}>
                        RAC<span style={{color: doradoPdi}}>View</span>
                        <span style={{
                            fontWeight: 300,
                            fontSize: 24,
                            color: "rgba(255,255,255,0.7)",
                            marginLeft: 20
                        }}>| Consulta de Nodos</span>
                    </h1>
                    <span style={{
                        fontSize: 18,
                        color: "rgba(255,255,255,0.8)",
                        fontWeight: 400,
                        marginTop: 4,
                        maxWidth: 700
                    }}>
                        Visualiza inteligencia de datos y explora relaciones complejas entre entidades en una interfaz unificada.
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
                                <GrafoD3 
                                    nodes={nodos} 
                                    links={links} 
                                    onRelatedSearch={(type, valor) => handleBuscar({ tipo: type.toUpperCase(), valor })}
                                />
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

                <ResultadosBusquedaModal 
                    show={showModalResultados}
                    onHide={() => setShowModalResultados(false)}
                    resultados={resultadosVehiculos}
                    onCargarGrafo={(patente) => handleBuscar({ tipo: "PATENTE", valor: patente })}
                />
            </div>
        </div>
    );
}