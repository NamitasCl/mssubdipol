import React, { useState } from "react";
import { Card, Form, Row, Col, Button, Badge } from "react-bootstrap";
import { useAuth } from "../../../components/contexts/AuthContext";
import AsyncFuncionarioSelect from "../../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect";
import AsyncUnidadesSelect from "../../../components/ComponentesAsyncSelect/AsyncUnidadesSelect";

export default function FormPreview({ nombre, descripcion, campos }) {
    const { user } = useAuth();
    const [valores, setValores] = useState({});

    // Manejar cambios en los campos
    const handleChange = (campoId, valor) => {
        setValores({
            ...valores,
            [campoId]: valor
        });
    };

    // Renderizar campo según tipo
    const renderCampo = (campo) => {
        const valor = valores[campo.id] || "";

        switch (campo.tipo) {
            case "text":
            case "email":
            case "tel":
                return (
                    <Form.Control
                        type={campo.tipo}
                        placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "textarea":
                return (
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "number":
                return (
                    <Form.Control
                        type="number"
                        placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "date":
                return (
                    <Form.Control
                        type="date"
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "datetime":
                return (
                    <Form.Control
                        type="datetime-local"
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "time":
                return (
                    <Form.Control
                        type="time"
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "select":
                return (
                    <Form.Select
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    >
                        <option value="">Seleccione una opción...</option>
                        {campo.opciones?.map((opcion, idx) => (
                            <option key={idx} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </Form.Select>
                );

            case "radio":
                return (
                    <div>
                        {campo.opciones?.map((opcion, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                id={`${campo.id}-${idx}`}
                                name={campo.id}
                                label={opcion}
                                value={opcion}
                                checked={valor === opcion}
                                onChange={(e) => handleChange(campo.id, e.target.value)}
                                required={campo.requerido}
                            />
                        ))}
                    </div>
                );

            case "checkbox":
                return (
                    <div>
                        {campo.opciones?.map((opcion, idx) => (
                            <Form.Check
                                key={idx}
                                type="checkbox"
                                id={`${campo.id}-${idx}`}
                                label={opcion}
                                checked={Array.isArray(valor) && valor.includes(opcion)}
                                onChange={(e) => {
                                    const currentValues = Array.isArray(valor) ? valor : [];
                                    if (e.target.checked) {
                                        handleChange(campo.id, [...currentValues, opcion]);
                                    } else {
                                        handleChange(campo.id, currentValues.filter(v => v !== opcion));
                                    }
                                }}
                            />
                        ))}
                    </div>
                );

            case "scale":
                const min = campo.min || 1;
                const max = campo.max || 5;
                return (
                    <div>
                        <Form.Range
                            min={min}
                            max={max}
                            value={valor || min}
                            onChange={(e) => handleChange(campo.id, e.target.value)}
                            required={campo.requerido}
                        />
                        <div className="d-flex justify-content-between mt-2">
                            <small className="text-muted">{min}</small>
                            <Badge bg="primary">{valor || min}</Badge>
                            <small className="text-muted">{max}</small>
                        </div>
                    </div>
                );

            case "file":
                return (
                    <Form.Control
                        type="file"
                        accept={campo.tiposPermitidos}
                        onChange={(e) => handleChange(campo.id, e.target.files[0])}
                        required={campo.requerido}
                        style={{ borderRadius: "8px" }}
                    />
                );

            case "funcionario":
                return (
                    <AsyncFuncionarioSelect
                        value={valor}
                        onChange={(funcionario) => handleChange(campo.id, funcionario)}
                        isClearable
                        placeholder="Seleccione un funcionario..."
                        user={user}
                    />
                );

            case "unidad":
                return (
                    <AsyncUnidadesSelect
                        value={valor}
                        onChange={(unidad) => handleChange(campo.id, unidad)}
                        isClearable
                        placeholder="Seleccione una unidad..."
                        user={user}
                    />
                );

            default:
                return (
                    <Form.Control
                        type="text"
                        placeholder={`Campo tipo: ${campo.tipo}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.id, e.target.value)}
                        style={{ borderRadius: "8px" }}
                    />
                );
        }
    };

    if (campos.length === 0) {
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
                    <div style={{ fontSize: "4rem", opacity: 0.3 }}>👁️</div>
                    <h5 className="text-muted mt-3">No hay campos para previsualizar</h5>
                    <p className="text-muted mb-0">
                        Agrega campos en la pestaña "Campos" para ver la vista previa
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div className="d-flex justify-content-center">
            <Card
                className="shadow-sm"
                style={{
                    borderRadius: "16px",
                    border: "none",
                    maxWidth: "800px",
                    width: "100%"
                }}
            >
                <Card.Header
                    className="bg-white"
                    style={{
                        borderBottom: "2px solid #e9ecef",
                        borderRadius: "16px 16px 0 0",
                        padding: "24px"
                    }}
                >
                    <div className="d-flex align-items-start gap-3">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #17355A 0%, #2a5a8f 100%)",
                                borderRadius: "12px",
                                padding: "12px",
                                color: "white"
                            }}
                        >
                            <i className="bi bi-file-earmark-text" style={{ fontSize: "1.5rem" }}></i>
                        </div>
                        <div className="flex-grow-1">
                            <h4 className="mb-2" style={{ color: "#17355A", fontWeight: "700" }}>
                                {nombre || "Nombre del Formulario"}
                            </h4>
                            {descripcion && (
                                <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                                    {descripcion}
                                </p>
                            )}
                        </div>
                    </div>
                </Card.Header>

                <Card.Body className="p-4">
                    <Form>
                        <Row className="g-4">
                            {campos.map((campo, index) => (
                                <Col key={campo.id} xs={12} md={campo.tipo === "textarea" ? 12 : 6}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: "600", color: "#212529" }}>
                                            {campo.etiqueta || `Campo ${index + 1}`}
                                            {campo.requerido && (
                                                <span className="text-danger ms-1">*</span>
                                            )}
                                        </Form.Label>
                                        {renderCampo(campo)}
                                        {campo.tipo === "scale" && (
                                            <Form.Text className="text-muted">
                                                Desliza para seleccionar un valor de {campo.min || 1} a {campo.max || 5}
                                            </Form.Text>
                                        )}
                                        {campo.tipo === "file" && campo.tiposPermitidos && (
                                            <Form.Text className="text-muted">
                                                Tipos permitidos: {campo.tiposPermitidos}
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <Button
                                variant="outline-secondary"
                                style={{ borderRadius: "10px", fontWeight: "600" }}
                                onClick={() => setValores({})}
                            >
                                Limpiar
                            </Button>
                            <Button
                                variant="primary"
                                style={{
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                    background: "#17355A",
                                    border: "none"
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log("📋 Vista previa - Valores:", valores);
                                    alert("Vista previa: Los valores se muestran en la consola");
                                }}
                            >
                                <i className="bi bi-check-circle me-2"></i>
                                Enviar (Simulado)
                            </Button>
                        </div>
                    </Form>
                </Card.Body>

                <Card.Footer
                    className="bg-light text-center"
                    style={{
                        borderTop: "1px solid #e9ecef",
                        borderRadius: "0 0 16px 16px",
                        padding: "16px"
                    }}
                >
                    <small className="text-muted">
                        <i className="bi bi-eye me-1"></i>
                        Esta es una vista previa de cómo se verá el formulario para los usuarios
                    </small>
                </Card.Footer>
            </Card>
        </div>
    );
}
