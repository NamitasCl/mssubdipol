import React, {useState} from "react";
import {Alert, Badge, Button, Card, Col, Form, ListGroup, Row} from "react-bootstrap";
import {useAuth} from "../../../components/contexts/AuthContext";
import AsyncFuncionarioSelect from "../../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect";
import AsyncUnidadesSelect from "../../../components/ComponentesAsyncSelect/AsyncUnidadesSelect";
import {VISIBILITY_TYPES} from "../mockData";

export default function PermissionsManager({visibilidad, onChange}) {
    const {user} = useAuth();
    const [nuevaRegla, setNuevaRegla] = useState({
        tipo: "unidad",
        valor: null,
        nombre: ""
    });

    const handleAgregarRegla = () => {
        console.log("➕ Agregar regla de visibilidad:", nuevaRegla);

        // Validaciones
        if (nuevaRegla.tipo === "publica") {
            // Si es pública, verificar que no haya otras reglas
            if (visibilidad.length > 0) {
                alert("Si el formulario es público, no puede tener otras reglas de visibilidad");
                return;
            }
            onChange([{tipo: "publica", valor: null, nombre: "Público"}]);
            return;
        }

        if (!nuevaRegla.valor) {
            alert("Debe seleccionar un destino");
            return;
        }

        // Verificar duplicados
        const existe = visibilidad.some(
            v => v.tipo === nuevaRegla.tipo && v.valor === nuevaRegla.valor
        );

        if (existe) {
            alert("Esta regla ya existe");
            return;
        }

        // Agregar nueva regla
        onChange([
            ...visibilidad.filter(v => v.tipo !== "publica"), // Remover pública si existe
            {
                tipo: nuevaRegla.tipo,
                valor: nuevaRegla.valor,
                nombre: nuevaRegla.nombre
            }
        ]);

        // Limpiar formulario
        setNuevaRegla({
            tipo: "unidad",
            valor: null,
            nombre: ""
        });
    };

    const handleEliminarRegla = (index) => {
        console.log("🗑️ Eliminar regla de visibilidad:", index);
        onChange(visibilidad.filter((_, i) => i !== index));
    };

    const renderSelector = () => {
        switch (nuevaRegla.tipo) {
            case "publica":
                return (
                    <Alert variant="info" className="mb-0">
                        <i className="bi bi-globe me-2"></i>
                        El formulario será visible para todos los usuarios
                    </Alert>
                );

            case "unidad":
                return (
                    <AsyncUnidadesSelect
                        value={nuevaRegla.valor ? {value: nuevaRegla.valor, label: nuevaRegla.nombre} : null}
                        onChange={(unidad) => {
                            console.log("Unidad seleccionada:", unidad);
                            setNuevaRegla({
                                ...nuevaRegla,
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
                        value={nuevaRegla.valor ? {value: nuevaRegla.valor, label: nuevaRegla.nombre} : null}
                        onChange={(funcionario) => {
                            console.log("Funcionario seleccionado:", funcionario);
                            setNuevaRegla({
                                ...nuevaRegla,
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

            case "grupo":
                return (
                    <Form.Control
                        type="text"
                        placeholder="Nombre del grupo"
                        value={nuevaRegla.nombre}
                        onChange={(e) => setNuevaRegla({
                            ...nuevaRegla,
                            valor: e.target.value,
                            nombre: e.target.value
                        })}
                        style={{borderRadius: "10px"}}
                    />
                );

            default:
                return null;
        }
    };

    const getTipoIcon = (tipo) => {
        const tipoInfo = VISIBILITY_TYPES.find(t => t.value === tipo);
        return tipoInfo?.icon || "📄";
    };

    const getTipoLabel = (tipo) => {
        const tipoInfo = VISIBILITY_TYPES.find(t => t.value === tipo);
        return tipoInfo?.label || tipo;
    };

    return (
        <Card className="shadow-sm" style={{borderRadius: "16px", border: "none"}}>
            <Card.Body className="p-4">
                {/* Info */}
                <Alert variant="info" className="mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Visibilidad del Formulario:</strong> Define quién puede ver y completar este formulario.
                    Puedes asignar permisos a unidades específicas, usuarios individuales, grupos, o hacerlo público.
                </Alert>

                {/* Formulario para agregar regla */}
                <Card className="mb-4"
                      style={{background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "12px"}}>
                    <Card.Body>
                        <h6 className="mb-3" style={{color: "#17355A", fontWeight: "600"}}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Agregar Regla de Visibilidad
                        </h6>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold">Tipo de Permiso</Form.Label>
                                    <Form.Select
                                        value={nuevaRegla.tipo}
                                        onChange={(e) => setNuevaRegla({
                                            tipo: e.target.value,
                                            valor: null,
                                            nombre: ""
                                        })}
                                        style={{borderRadius: "10px"}}
                                    >
                                        {VISIBILITY_TYPES.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.icon} {tipo.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        {VISIBILITY_TYPES.find(t => t.value === nuevaRegla.tipo)?.description}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6} className={"h-100"}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold">
                                        {nuevaRegla.tipo === "publica" ? "Información" : "Destino"}
                                    </Form.Label>
                                    {renderSelector()}
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                {/* 2. Agrega un Label fantasma para alinear */}
                                <Form.Label className="small fw-semibold" style={{visibility: 'hidden'}}>
                                    Acción
                                </Form.Label>
                                <Button
                                    variant="primary"
                                    onClick={handleAgregarRegla}
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

                {/* Lista de reglas actuales */}
                <div>
                    <h6 className="mb-3" style={{color: "#17355A", fontWeight: "600"}}>
                        <i className="bi bi-list-check me-2"></i>
                        Reglas Configuradas ({visibilidad.length})
                    </h6>

                    {visibilidad.length === 0 ? (
                        <Card
                            className="text-center py-4"
                            style={{
                                border: "2px dashed #dee2e6",
                                borderRadius: "12px",
                                background: "#f8f9fa"
                            }}
                        >
                            <Card.Body>
                                <div style={{fontSize: "3rem", opacity: 0.3}}>🔒</div>
                                <p className="text-muted mb-0 mt-2">
                                    No hay reglas de visibilidad configuradas
                                </p>
                                <small className="text-muted">
                                    Agrega al menos una regla para definir quién puede ver este formulario
                                </small>
                            </Card.Body>
                        </Card>
                    ) : (
                        <ListGroup>
                            {visibilidad.map((regla, index) => (
                                <ListGroup.Item
                                    key={index}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{borderRadius: "10px", marginBottom: "8px", border: "1px solid #dee2e6"}}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            style={{
                                                fontSize: "1.5rem",
                                                width: "40px",
                                                textAlign: "center"
                                            }}
                                        >
                                            {getTipoIcon(regla.tipo)}
                                        </div>
                                        <div>
                                            <div style={{fontWeight: "600", color: "#212529"}}>
                                                {regla.nombre}
                                            </div>
                                            <Badge
                                                bg="light"
                                                text="dark"
                                                style={{
                                                    fontSize: "0.7rem",
                                                    fontWeight: "500",
                                                    padding: "4px 8px"
                                                }}
                                            >
                                                {getTipoLabel(regla.tipo)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleEliminarRegla(index)}
                                        style={{borderRadius: "8px"}}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>

                {/* Resumen */}
                {visibilidad.length > 0 && (
                    <Alert variant="success" className="mt-4 mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        Este formulario será visible para{" "}
                        <strong>
                            {visibilidad.some(v => v.tipo === "publica")
                                ? "todos los usuarios"
                                : `${visibilidad.length} ${visibilidad.length === 1 ? "destino" : "destinos"}`
                            }
                        </strong>
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
}
