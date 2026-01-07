import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../components/contexts/AuthContext';
import AsyncFuncionarioSelect from '../../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect';
import AsyncUnidadesSelect from '../../../components/ComponentesAsyncSelect/AsyncUnidadesSelect';
import RepetibleFieldRenderer from './RepetibleFieldRenderer';
import * as formulariosApi from '../../../api/formulariosApi';

export default function FormularioCompletarV2({ formulario, onVolver, onExito }) {
    const { user } = useAuth();
    const [valores, setValores] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);

    const handleChange = (campoNombre, valor) => {
        setValores({
            ...valores,
            [campoNombre]: valor
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Preparar datos usando nombres técnicos de los campos
            const datos = {};
            formulario.campos.forEach(campo => {
                datos[campo.nombre] = valores[campo.nombre];
            });

            // Enviar respuesta
            await formulariosApi.enviarRespuesta({
                formularioId: formulario.id,
                datos
            });

            // Limpiar formulario
            setValores({});
            setValidated(false);

            // Notificar éxito
            if (onExito) {
                onExito();
            } else {
                alert('Formulario enviado correctamente');
                if (onVolver) onVolver();
            }
        } catch (err) {
            console.error('Error al enviar formulario:', err);
            setError(err.response?.data?.message || 'Error al enviar el formulario. Por favor, intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLimpiar = () => {
        setValores({});
        setValidated(false);
    };

    const renderCampo = (campo) => {
        const valor = valores[campo.nombre] || '';

        switch (campo.tipo) {
            case 'text':
            case 'email':
            case 'tel':
                return (
                    <Form.Control
                        type={campo.tipo}
                        placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    />
                );

            case 'textarea':
                return (
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    />
                );

            case 'number':
                return (
                    <Form.Control
                        type="number"
                        placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    />
                );

            case 'date':
                return (
                    <Form.Control
                        type="date"
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    />
                );

            case 'datetime':
                return (
                    <Form.Control
                        type="datetime-local"
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    />
                );

            case 'time':
                return (
                    <Form.Control
                        type="time"
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    />
                );

            case 'select':
                return (
                    <Form.Select
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        required={campo.requerido}
                        style={{ borderRadius: '8px' }}
                    >
                        <option value="">-- Seleccione --</option>
                        {(campo.opciones || []).map((opcion, idx) => (
                            <option key={idx} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </Form.Select>
                );

            case 'radio':
                return (
                    <div>
                        {(campo.opciones || []).map((opcion, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                id={`${campo.nombre}_${idx}`}
                                label={opcion}
                                name={campo.nombre}
                                value={opcion}
                                checked={valor === opcion}
                                onChange={(e) => handleChange(campo.nombre, e.target.value)}
                                required={campo.requerido}
                            />
                        ))}
                    </div>
                );

            case 'checkbox':
                const valoresCheckbox = Array.isArray(valor) ? valor : [];
                return (
                    <div>
                        {(campo.opciones || []).map((opcion, idx) => (
                            <Form.Check
                                key={idx}
                                type="checkbox"
                                id={`${campo.nombre}_${idx}`}
                                label={opcion}
                                checked={valoresCheckbox.includes(opcion)}
                                onChange={(e) => {
                                    const nuevosValores = e.target.checked
                                        ? [...valoresCheckbox, opcion]
                                        : valoresCheckbox.filter(v => v !== opcion);
                                    handleChange(campo.nombre, nuevosValores);
                                }}
                            />
                        ))}
                    </div>
                );

            case 'scale':
                return (
                    <div>
                        <Form.Range
                            min={campo.min || 1}
                            max={campo.max || 5}
                            value={valor || campo.min || 1}
                            onChange={(e) => handleChange(campo.nombre, parseInt(e.target.value))}
                        />
                        <Form.Text className="text-muted">
                            Valor seleccionado: {valor || campo.min || 1} (de {campo.min || 1} a {campo.max || 5})
                        </Form.Text>
                    </div>
                );

            case 'file':
                return (
                    <div>
                        <Form.Control
                            type="file"
                            accept={campo.tiposPermitidos || '*'}
                            onChange={(e) => {
                                const archivo = e.target.files[0];
                                if (archivo) {
                                    handleChange(campo.nombre, {
                                        nombre: archivo.name,
                                        tipo: archivo.type,
                                        tamanio: archivo.size
                                    });
                                }
                            }}
                            required={campo.requerido}
                            style={{ borderRadius: '8px' }}
                        />
                        {campo.tiposPermitidos && (
                            <Form.Text className="text-muted">
                                Tipos permitidos: {campo.tiposPermitidos}
                            </Form.Text>
                        )}
                    </div>
                );

            case 'funcionario':
                return (
                    <AsyncFuncionarioSelect
                        value={valor}
                        onChange={(funcionario) => handleChange(campo.nombre, funcionario)}
                        isClearable
                        placeholder="Seleccione un funcionario..."
                        user={user}
                    />
                );

            case 'unidad':
                return (
                    <AsyncUnidadesSelect
                        value={valor}
                        onChange={(unidad) => handleChange(campo.nombre, unidad)}
                        isClearable
                        placeholder="Seleccione una unidad..."
                        user={user}
                    />
                );

            case 'repetible':
                return (
                    <RepetibleFieldRenderer
                        campo={campo}
                        valores={valor}
                        onChange={(instancias) => handleChange(campo.nombre, instancias)}
                    />
                );

            default:
                return (
                    <Form.Control
                        type="text"
                        placeholder={`Campo tipo: ${campo.tipo}`}
                        value={valor}
                        onChange={(e) => handleChange(campo.nombre, e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                );
        }
    };

    return (
        <Container fluid className="py-4" style={{ maxWidth: '1000px' }}>
            {/* Header */}
            <div className="mb-4">
                <Button variant="outline-secondary" onClick={onVolver} className="mb-3">
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver
                </Button>

                <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #17355A 0%, #2a5a8f 100%)',
                    color: 'white'
                }}>
                    <Card.Body className="p-4">
                        <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>
                            {formulario.nombre}
                        </h3>
                        {formulario.descripcion && (
                            <p style={{ marginBottom: 0, opacity: 0.9 }}>
                                {formulario.descripcion}
                            </p>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Formulario */}
            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Card.Body className="p-4">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            {formulario.campos.map((campo) => {
                                const colSize = campo.tipo === 'textarea' || campo.tipo === 'repetible' ? 12 : 6;
                                return (
                                    <Col key={campo.id} md={colSize} className="mb-4">
                                        <Form.Group>
                                            <Form.Label style={{ fontWeight: '600', color: '#17355A' }}>
                                                {campo.etiqueta}
                                                {campo.requerido && (
                                                    <span style={{ color: '#dc3545' }}> *</span>
                                                )}
                                            </Form.Label>
                                            {renderCampo(campo)}
                                            <Form.Control.Feedback type="invalid">
                                                Este campo es requerido
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                );
                            })}
                        </Row>

                        <div className="d-flex gap-2 justify-content-end mt-4 pt-4" style={{ borderTop: '1px solid #dee2e6' }}>
                            <Button
                                type="button"
                                variant="outline-secondary"
                                onClick={handleLimpiar}
                                disabled={isSubmitting}
                            >
                                <i className="bi bi-eraser me-2"></i>
                                Limpiar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                style={{
                                    background: 'linear-gradient(135deg, #17355A 0%, #2a5a8f 100%)',
                                    border: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Enviar Formulario
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
