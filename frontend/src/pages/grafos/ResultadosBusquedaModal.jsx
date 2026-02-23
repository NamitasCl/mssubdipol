import React, { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { FaBookOpen, FaProjectDiagram } from "react-icons/fa";

const azulBase = "#1a365d";

export default function ResultadosBusquedaModal({ show, onHide, resultados, onCargarGrafo }) {
    const [relatoActivo, setRelatoActivo] = useState(null);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton style={{ background: azulBase, color: "#fff" }}>
                <Modal.Title style={{ fontWeight: 700 }}>
                    Coincidencias Encontradas ({resultados.length})
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
                <p style={{ color: "#64748b", marginBottom: 20 }}>
                    Se han encontrado los siguientes vehículos. Revise el relato del memo para confirmar si es el que busca.
                </p>

                <Table hover responsive style={{ borderRadius: 8, overflow: "hidden" }}>
                    <thead style={{ background: "#f8fafc" }}>
                        <tr>
                            <th style={{ color: "#475569" }}>Patente</th>
                            <th style={{ color: "#475569" }}>Marca / Modelo</th>
                            <th style={{ color: "#475569" }}>Formulario</th>
                            <th style={{ color: "#475569", textAlign: "center" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.map((v, idx) => {
                            const memo = v.memos && v.memos[0];
                            return (
                                <tr key={idx} style={{ verticalAlign: "middle" }}>
                                    <td style={{ fontWeight: 700, color: azulBase }}>{v.patente || "S/P"}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{v.marca || "Desconocida"}</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>{v.modelo || "-"}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "13px" }}>{memo?.formulario || "S/N"}</div>
                                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                            {memo?.fecha ? new Date(memo.fecha).toLocaleDateString() : "-"}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                                            <Button 
                                                variant="outline-info" 
                                                size="sm"
                                                onClick={() => setRelatoActivo(memo?.modusDescripcion || "Sin descripción disponible.")}
                                                style={{ borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}
                                            >
                                                <FaBookOpen size={12} /> Ver Relato
                                            </Button>
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={() => {
                                                    onCargarGrafo(v.patente);
                                                    onHide();
                                                }}
                                                style={{ background: azulBase, borderColor: azulBase, borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}
                                            >
                                                <FaProjectDiagram size={12} /> Cargar Grafo
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>

                {/* Sub-modal o Alerta para el Relato */}
                {relatoActivo && (
                    <div style={{
                        marginTop: 20,
                        padding: 16,
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 10,
                        position: "relative"
                    }}>
                        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 8, fontSize: 13, textTransform: "uppercase" }}>
                            Relato del Hecho:
                        </div>
                        <div style={{ fontSize: 14, color: "#451a03", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                            {relatoActivo}
                        </div>
                        <button 
                            onClick={() => setRelatoActivo(null)}
                            style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                border: "none",
                                background: "none",
                                color: "#92400e",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} style={{ borderRadius: 8 }}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
