import React from "react";
import { Row, Col, Card, Badge, Button, Dropdown, ProgressBar } from "react-bootstrap";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function FormulariosList({
    formularios,
    onVer,
    onEditar,
    onDuplicar,
    onEliminar,
    onToggleEstado,
    esCreador = false,
    emptyMessage = "No hay formularios disponibles"
}) {

    if (formularios.length === 0) {
        return (
            <Card
                className="text-center py-5"
                style={{
                    border: "2px dashed #dee2e6",
                    borderRadius: "16px",
                    background: "#f8f9fa"
                }}
            >
                <Card.Body>
                    <div style={{ fontSize: "4rem", opacity: 0.3 }}>📋</div>
                    <h5 className="text-muted mt-3">{emptyMessage}</h5>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Row className="g-4">
            {formularios.map((formulario) => {
                const progreso = formulario.limiteRespuestas
                    ? (formulario.totalRespuestas / formulario.limiteRespuestas) * 100
                    : 0;

                const fechaFormateada = format(
                    new Date(formulario.fechaCreacion),
                    "dd 'de' MMMM, yyyy",
                    { locale: es }
                );

                return (
                    <Col key={formulario.id} xs={12} md={6} lg={4}>
                        <Card
                            className="h-100 shadow-sm"
                            style={{
                                borderRadius: "16px",
                                border: "1px solid #e9ecef",
                                transition: "all 0.3s ease",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                            }}
                        >
                            <Card.Body className="d-flex flex-column">
                                {/* Header con estado y acciones */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <Badge
                                        bg={formulario.estado === "activo" ? "success" : "secondary"}
                                        style={{
                                            borderRadius: "8px",
                                            padding: "6px 12px",
                                            fontWeight: "600",
                                            fontSize: "0.75rem"
                                        }}
                                    >
                                        {formulario.estado === "activo" ? "● Activo" : "○ Inactivo"}
                                    </Badge>

                                    {esCreador && (
                                        <Dropdown align="end">
                                            <Dropdown.Toggle
                                                variant="link"
                                                className="p-0 text-muted"
                                                style={{
                                                    textDecoration: "none",
                                                    boxShadow: "none"
                                                }}
                                            >
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu
                                                style={{
                                                    borderRadius: "12px",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                                }}
                                            >
                                                <Dropdown.Item onClick={() => onEditar(formulario)}>
                                                    <i className="bi bi-pencil me-2"></i>
                                                    Editar
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => onDuplicar(formulario)}>
                                                    <i className="bi bi-files me-2"></i>
                                                    Duplicar
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => onToggleEstado(formulario)}>
                                                    <i className={`bi ${formulario.estado === "activo" ? "bi-pause-circle" : "bi-play-circle"} me-2`}></i>
                                                    {formulario.estado === "activo" ? "Desactivar" : "Activar"}
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item
                                                    className="text-danger"
                                                    onClick={() => onEliminar(formulario.id)}
                                                >
                                                    <i className="bi bi-trash me-2"></i>
                                                    Eliminar
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}
                                </div>

                                {/* Título y descripción */}
                                <div className="mb-3 flex-grow-1">
                                    <h5
                                        className="mb-2"
                                        style={{
                                            color: "#17355A",
                                            fontWeight: "700",
                                            fontSize: "1.1rem"
                                        }}
                                    >
                                        {formulario.nombre}
                                    </h5>
                                    <p
                                        className="text-muted mb-2"
                                        style={{
                                            fontSize: "0.9rem",
                                            lineHeight: "1.5",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {formulario.descripcion || "Sin descripción"}
                                    </p>
                                </div>

                                {/* Estadísticas */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">
                                            <i className="bi bi-clipboard-data me-1"></i>
                                            Respuestas
                                        </small>
                                        <small style={{ fontWeight: "600", color: "#17355A" }}>
                                            {formulario.totalRespuestas}
                                            {formulario.limiteRespuestas && ` / ${formulario.limiteRespuestas}`}
                                        </small>
                                    </div>
                                    {formulario.limiteRespuestas && (
                                        <ProgressBar
                                            now={progreso}
                                            variant={progreso >= 80 ? "success" : progreso >= 50 ? "info" : "warning"}
                                            style={{ height: "6px", borderRadius: "3px" }}
                                        />
                                    )}
                                </div>

                                {/* Cuotas si existen */}
                                {formulario.cuotas && formulario.cuotas.length > 0 && (
                                    <div className="mb-3">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-pie-chart me-1"></i>
                                            Cuotas asignadas
                                        </small>
                                        <div className="d-flex flex-wrap gap-1">
                                            {formulario.cuotas.slice(0, 3).map((cuota, idx) => (
                                                <Badge
                                                    key={idx}
                                                    bg="light"
                                                    text="dark"
                                                    style={{
                                                        fontSize: "0.7rem",
                                                        fontWeight: "500",
                                                        padding: "4px 8px",
                                                        borderRadius: "6px"
                                                    }}
                                                >
                                                    {cuota.nombre}: {cuota.completadas}/{cuota.cantidad}
                                                </Badge>
                                            ))}
                                            {formulario.cuotas.length > 3 && (
                                                <Badge
                                                    bg="secondary"
                                                    style={{
                                                        fontSize: "0.7rem",
                                                        fontWeight: "500",
                                                        padding: "4px 8px",
                                                        borderRadius: "6px"
                                                    }}
                                                >
                                                    +{formulario.cuotas.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="pt-3 border-top" style={{ fontSize: "0.8rem" }}>
                                    <div className="d-flex justify-content-between text-muted mb-1">
                                        <span>
                                            <i className="bi bi-person-circle me-1"></i>
                                            {formulario.creadorNombre}
                                        </span>
                                        <span>
                                            <i className="bi bi-building me-1"></i>
                                            {formulario.unidadCreador}
                                        </span>
                                    </div>
                                    <div className="text-muted">
                                        <i className="bi bi-calendar3 me-1"></i>
                                        {fechaFormateada}
                                    </div>
                                </div>

                                {/* Botón de acción */}
                                <Button
                                    variant="primary"
                                    className="mt-3 w-100"
                                    onClick={() => onVer(formulario)}
                                    style={{
                                        borderRadius: "10px",
                                        fontWeight: "600",
                                        padding: "10px",
                                        background: "#17355A",
                                        border: "none"
                                    }}
                                >
                                    <i className="bi bi-eye me-2"></i>
                                    Ver Formulario
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
}
