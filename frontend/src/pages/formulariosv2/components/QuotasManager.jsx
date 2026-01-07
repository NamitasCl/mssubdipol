import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Badge, Alert, Table, ProgressBar } from "react-bootstrap";
import { useAuth } from "../../../components/contexts/AuthContext";
import AsyncFuncionarioSelect from "../../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect";
import AsyncUnidadesSelect from "../../../components/ComponentesAsyncSelect/AsyncUnidadesSelect";

export default function QuotasManager({ cuotas, onChange, limiteTotal }) {
    const { user } = useAuth();
    const [nuevaCuota, setNuevaCuota] = useState({
        tipo: "unidad",
        valor: null,
        nombre: "",
        cantidad: 1
    });

    // Calcular total asignado
    const totalAsignado = cuotas.reduce((sum, c) => sum + (c.cantidad || 0), 0);
    const porcentajeAsignado = limiteTotal ? (totalAsignado / limiteTotal) * 100 : 0;

    const handleAgregarCuota = () => {
        console.log("➕ Agregar cuota:", nuevaCuota);

        // Validaciones
        if (!nuevaCuota.valor) {
            alert("Debe seleccionar un destino");
            return;
        }

        if (!nuevaCuota.cantidad || nuevaCuota.cantidad <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
        }

        // Validar que no exceda el límite total
        if (limiteTotal && (totalAsignado + nuevaCuota.cantidad) > limiteTotal) {
            alert(`La suma de cuotas no puede exceder el límite total de ${limiteTotal} respuestas`);
            return;
        }

        // Verificar duplicados
        const existe = cuotas.some(
            c => c.tipo === nuevaCuota.tipo && c.valor === nuevaCuota.valor
        );

        if (existe) {
            alert("Ya existe una cuota para este destino");
            return;
        }

        // Agregar nueva cuota
        onChange([
            ...cuotas,
            {
                tipo: nuevaCuota.tipo,
                valor: nuevaCuota.valor,
                nombre: nuevaCuota.nombre,
                cantidad: parseInt(nuevaCuota.cantidad),
                completadas: 0 // Inicializar en 0
            }
        ]);

        // Limpiar formulario
        setNuevaCuota({
            tipo: "unidad",
            valor: null,
            nombre: "",
            cantidad: 1
        });
    };

    const handleEliminarCuota = (index) => {
        console.log("🗑️ Eliminar cuota:", index);
        onChange(cuotas.filter((_, i) => i !== index));
    };

    const handleActualizarCantidad = (index, nuevaCantidad) => {
        const cantidad = parseInt(nuevaCantidad);

        if (isNaN(cantidad) || cantidad <= 0) {
            return;
        }

        // Validar límite total
        const otrassCuotas = cuotas.filter((_, i) => i !== index);
        const totalOtras = otrassCuotas.reduce((sum, c) => sum + (c.cantidad || 0), 0);

        if (limiteTotal && (totalOtras + cantidad) > limiteTotal) {
            alert(`La suma de cuotas no puede exceder el límite total de ${limiteTotal} respuestas`);
            return;
        }

        onChange(cuotas.map((c, i) =>
            i === index ? { ...c, cantidad } : c
        ));
    };

    const renderSelector = () => {
        switch (nuevaCuota.tipo) {
            case "unidad":
                return (
                    <AsyncUnidadesSelect
                        value={nuevaCuota.valor ? { value: nuevaCuota.valor, label: nuevaCuota.nombre } : null}
                        onChange={(unidad) => {
                            setNuevaCuota({
                                ...nuevaCuota,
                                valor: unidad?.idUnidad || unidad?.value || null,
                                nombre: unidad?.nombreUnidad || unidad?.label || ""
                            });
                        }}
                        isClearable
                        placeholder="Seleccione una unidad..."
                        user={user}
                    />
                );

            case "usuario":
                return (
                    <AsyncFuncionarioSelect
                        value={nuevaCuota.valor ? { value: nuevaCuota.valor, label: nuevaCuota.nombre } : null}
                        onChange={(funcionario) => {
                            setNuevaCuota({
                                ...nuevaCuota,
                                valor: funcionario?.idFun || funcionario?.value || null,
                                nombre: funcionario?.label ||
                                    (funcionario?.nombreFun
                                        ? `${funcionario.nombreFun} ${funcionario.apellidoPaternoFun}`.trim()
                                        : "")
                            });
                        }}
                        isClearable
                        placeholder="Seleccione un funcionario..."
                        user={user}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Card className="shadow-sm" style={{ borderRadius: "16px", border: "none" }}>
            <Card.Body className="p-4">
                {/* Info */}
                <Alert variant="info" className="mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Cuotas de Respuestas:</strong> Asigna una cantidad específica de respuestas que debe
                    completar cada unidad o funcionario. Las cuotas son opcionales.
                </Alert>

                {/* Resumen del límite total */}
                {limiteTotal && (
                    <Card className="mb-4" style={{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "12px" }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{ fontWeight: "600", color: "#17355A" }}>
                                    <i className="bi bi-speedometer2 me-2"></i>
                                    Límite Total
                                </span>
                                <Badge
                                    bg={porcentajeAsignado > 100 ? "danger" : porcentajeAsignado === 100 ? "success" : "warning"}
                                    style={{ fontSize: "0.9rem", padding: "6px 12px" }}
                                >
                                    {totalAsignado} / {limiteTotal} respuestas asignadas
                                </Badge>
                            </div>
                            <ProgressBar
                                now={Math.min(porcentajeAsignado, 100)}
                                variant={porcentajeAsignado > 100 ? "danger" : porcentajeAsignado === 100 ? "success" : "info"}
                                style={{ height: "8px", borderRadius: "4px" }}
                            />
                            {porcentajeAsignado > 100 && (
                                <small className="text-danger mt-2 d-block">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Las cuotas exceden el límite total
                                </small>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {/* Formulario para agregar cuota */}
                <Card className="mb-4" style={{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "12px" }}>
                    <Card.Body>
                        <h6 className="mb-3" style={{ color: "#17355A", fontWeight: "600" }}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Asignar Nueva Cuota
                        </h6>
                        <Row className="g-3 align-items-end">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold">Asignar a</Form.Label>
                                    <Form.Select
                                        value={nuevaCuota.tipo}
                                        onChange={(e) => setNuevaCuota({
                                            tipo: e.target.value,
                                            valor: null,
                                            nombre: "",
                                            cantidad: 1
                                        })}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="unidad">🏢 Unidad</option>
                                        <option value="usuario">👤 Funcionario</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold">Destino</Form.Label>
                                    {renderSelector()}
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold">Cantidad</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={nuevaCuota.cantidad}
                                        onChange={(e) => setNuevaCuota({
                                            ...nuevaCuota,
                                            cantidad: e.target.value
                                        })}
                                        style={{ borderRadius: "10px" }}
                                        placeholder="1"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Button
                                    variant="primary"
                                    onClick={handleAgregarCuota}
                                    className="w-100"
                                    style={{
                                        borderRadius: "10px",
                                        fontWeight: "600",
                                        background: "#17355A",
                                        border: "none"
                                    }}
                                >
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Agregar
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Tabla de cuotas actuales */}
                <div>
                    <h6 className="mb-3" style={{ color: "#17355A", fontWeight: "600" }}>
                        <i className="bi bi-list-check me-2"></i>
                        Cuotas Asignadas ({cuotas.length})
                    </h6>

                    {cuotas.length === 0 ? (
                        <Card
                            className="text-center py-4"
                            style={{
                                border: "2px dashed #dee2e6",
                                borderRadius: "12px",
                                background: "#f8f9fa"
                            }}
                        >
                            <Card.Body>
                                <div style={{ fontSize: "3rem", opacity: 0.3 }}>📊</div>
                                <p className="text-muted mb-0 mt-2">
                                    No hay cuotas asignadas
                                </p>
                                <small className="text-muted">
                                    Las cuotas son opcionales. Puedes dejar este formulario sin cuotas específicas.
                                </small>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <Table hover responsive style={{ minWidth: "600px" }}>
                                <thead style={{ background: "#f8f9fa" }}>
                                    <tr>
                                        <th style={{ borderRadius: "10px 0 0 0", padding: "12px" }}>#</th>
                                        <th style={{ padding: "12px" }}>Tipo</th>
                                        <th style={{ padding: "12px" }}>Destino</th>
                                        <th style={{ padding: "12px" }}>Cuota Asignada</th>
                                        <th style={{ padding: "12px" }}>Completadas</th>
                                        <th style={{ padding: "12px" }}>Progreso</th>
                                        <th style={{ borderRadius: "0 10px 0 0", padding: "12px" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cuotas.map((cuota, index) => {
                                        const progreso = (cuota.completadas / cuota.cantidad) * 100;
                                        return (
                                            <tr key={index}>
                                                <td style={{ verticalAlign: "middle" }}>{index + 1}</td>
                                                <td style={{ verticalAlign: "middle" }}>
                                                    <Badge
                                                        bg="light"
                                                        text="dark"
                                                        style={{ fontSize: "0.75rem" }}
                                                    >
                                                        {cuota.tipo === "unidad" ? "🏢 Unidad" : "👤 Funcionario"}
                                                    </Badge>
                                                </td>
                                                <td style={{ verticalAlign: "middle", fontWeight: "500" }}>
                                                    {cuota.nombre}
                                                </td>
                                                <td style={{ verticalAlign: "middle" }}>
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        value={cuota.cantidad}
                                                        onChange={(e) => handleActualizarCantidad(index, e.target.value)}
                                                        style={{
                                                            width: "80px",
                                                            borderRadius: "8px",
                                                            textAlign: "center"
                                                        }}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td style={{ verticalAlign: "middle" }}>
                                                    <Badge bg="info" style={{ fontSize: "0.8rem" }}>
                                                        {cuota.completadas || 0}
                                                    </Badge>
                                                </td>
                                                <td style={{ verticalAlign: "middle", width: "150px" }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ProgressBar
                                                            now={progreso}
                                                            variant={progreso >= 100 ? "success" : "primary"}
                                                            style={{ flex: 1, height: "6px" }}
                                                        />
                                                        <small className="text-muted" style={{ minWidth: "40px" }}>
                                                            {Math.round(progreso)}%
                                                        </small>
                                                    </div>
                                                </td>
                                                <td style={{ verticalAlign: "middle" }}>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleEliminarCuota(index)}
                                                        style={{ borderRadius: "8px" }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Resumen final */}
                {cuotas.length > 0 && (
                    <Alert
                        variant={porcentajeAsignado > 100 ? "danger" : "success"}
                        className="mt-4 mb-0"
                    >
                        <i className={`bi ${porcentajeAsignado > 100 ? "bi-exclamation-triangle" : "bi-check-circle"} me-2`}></i>
                        {porcentajeAsignado > 100 ? (
                            <>
                                <strong>Advertencia:</strong> Has asignado {totalAsignado} respuestas, pero el límite total es {limiteTotal}.
                                Ajusta las cuotas para que no excedan el límite.
                            </>
                        ) : (
                            <>
                                Se han asignado <strong>{totalAsignado} respuestas</strong> en total a {cuotas.length} {cuotas.length === 1 ? "destino" : "destinos"}.
                                {limiteTotal && (
                                    <> Quedan <strong>{limiteTotal - totalAsignado} respuestas</strong> sin asignar.</>
                                )}
                            </>
                        )}
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
}
