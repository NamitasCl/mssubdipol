import React, { useState } from "react";
import { Card, Form, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { FIELD_TYPES } from "../mockData";

export default function FormFieldPalette({ onAgregarCampo }) {
    const [filtro, setFiltro] = useState("");

    const tiposFiltrados = FIELD_TYPES.filter(tipo =>
        tipo.label.toLowerCase().includes(filtro.toLowerCase()) ||
        tipo.description.toLowerCase().includes(filtro.toLowerCase())
    );

    const handleClick = (tipoId) => {
        console.log("🎨 Campo seleccionado desde paleta (click):", tipoId);
        onAgregarCampo(tipoId);
    };

    return (
        <Card
            className="shadow-sm position-sticky"
            style={{
                borderRadius: "16px",
                border: "1px solid #e9ecef",
                top: "20px",
                maxHeight: "calc(100vh - 150px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Card.Header
                className="bg-white"
                style={{
                    borderBottom: "2px solid #e9ecef",
                    borderRadius: "16px 16px 0 0",
                    padding: "16px"
                }}
            >
                <h6 className="mb-2" style={{ color: "#17355A", fontWeight: "700" }}>
                    <i className="bi bi-palette me-2"></i>
                    Paleta de Campos
                </h6>
                <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Buscar tipo de campo..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{
                        borderRadius: "8px",
                        border: "1px solid #dee2e6"
                    }}
                />
            </Card.Header>

            <Card.Body
                className="p-2"
                style={{
                    overflowY: "auto",
                    flex: 1
                }}
            >
                {tiposFiltrados.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <small>No se encontraron campos</small>
                    </div>
                ) : (
                    <Droppable droppableId="palette-droppable" isDropDisabled={true}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="d-flex flex-column gap-2"
                            >
                                {tiposFiltrados.map((tipo, index) => (
                                    <Draggable
                                        key={tipo.id}
                                        draggableId={`palette-${tipo.id}`}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div>
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="cursor-pointer"
                                                    onClick={() => !snapshot.isDragging && handleClick(tipo.id)}
                                                    title={tipo.description}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        borderRadius: "10px",
                                                        border: "1px solid #e9ecef",
                                                        cursor: snapshot.isDragging ? "grabbing" : "grab",
                                                        background: "#fff",
                                                        opacity: snapshot.isDragging ? 0.5 : 1
                                                    }}
                                                >
                                                    <Card.Body className="p-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                style={{
                                                                    fontSize: "1.5rem",
                                                                    lineHeight: 1,
                                                                    width: "32px",
                                                                    textAlign: "center"
                                                                }}
                                                            >
                                                                {tipo.icon}
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div
                                                                    style={{
                                                                        fontSize: "0.85rem",
                                                                        fontWeight: "600",
                                                                        color: "#212529"
                                                                    }}
                                                                >
                                                                    {tipo.label}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize: "0.7rem",
                                                                        color: "#6c757d",
                                                                        lineHeight: 1.2
                                                                    }}
                                                                >
                                                                    {tipo.description.length > 30
                                                                        ? tipo.description.substring(0, 30) + "..."
                                                                        : tipo.description
                                                                    }
                                                                </div>
                                                            </div>
                                                            <i
                                                                className="bi bi-grip-vertical"
                                                                style={{ color: "#17355A", fontSize: "1rem" }}
                                                            ></i>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                )}
            </Card.Body>

            <Card.Footer
                className="bg-light text-center"
                style={{
                    borderTop: "1px solid #e9ecef",
                    borderRadius: "0 0 16px 16px",
                    padding: "12px"
                }}
            >
                <small className="text-muted">
                    <i className="bi bi-hand-index me-1"></i>
                    Arrastra o haz clic para agregar
                </small>
            </Card.Footer>
        </Card>
    );
}
