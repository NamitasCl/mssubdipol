import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaTrash, FaGripVertical, FaCopy } from 'react-icons/fa';
import { FIELD_TYPES } from '../mockData';

/**
 * RepetibleFieldEditor - Editor de subcampos para campos repetibles
 * Permite configurar los campos que se repetirán en cada instancia
 */
const RepetibleFieldEditor = ({ campo, onUpdateCampo }) => {
    const [expandedSubfield, setExpandedSubfield] = useState(null);

    // Tipos de campos permitidos como subcampos (sin repetibles anidados por ahora)
    const allowedSubfieldTypes = FIELD_TYPES.filter(t => t.id !== 'repetible');

    // Generar nombre técnico a partir de etiqueta
    const generarNombreTecnico = (etiqueta) => {
        return etiqueta
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '_');
    };

    // Agregar nuevo subcampo
    const handleAgregarSubcampo = (tipoId) => {
        const tipo = allowedSubfieldTypes.find(t => t.id === tipoId);
        if (!tipo) return;

        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6);
        const nuevoSubcampo = {
            id: `subfield_${timestamp}_${random}`,
            ...tipo.defaultProps,
            tipo: tipoId,
            nombre: generarNombreTecnico(tipo.defaultProps.etiqueta),
            nombreManual: false
        };

        const subcamposActualizados = [...(campo.subcampos || []), nuevoSubcampo];
        onUpdateCampo(campo.id, 'subcampos', subcamposActualizados);

        console.log('➕ Subcampo agregado:', tipoId);
    };

    // Eliminar subcampo
    const handleEliminarSubcampo = (subcampoId) => {
        const subcamposActualizados = campo.subcampos.filter(sc => sc.id !== subcampoId);
        onUpdateCampo(campo.id, 'subcampos', subcamposActualizados);

        if (expandedSubfield === subcampoId) {
            setExpandedSubfield(null);
        }

        console.log('🗑️ Subcampo eliminado:', subcampoId);
    };

    // Duplicar subcampo
    const handleDuplicarSubcampo = (subcampoId) => {
        const subcampoOriginal = campo.subcampos.find(sc => sc.id === subcampoId);
        if (!subcampoOriginal) return;

        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6);
        const subcampoDuplicado = {
            ...subcampoOriginal,
            id: `subfield_${timestamp}_${random}`,
            etiqueta: `${subcampoOriginal.etiqueta} (copia)`,
            nombre: `${subcampoOriginal.nombre}_copia`,
            nombreManual: false
        };

        const subcamposActualizados = [...campo.subcampos, subcampoDuplicado];
        onUpdateCampo(campo.id, 'subcampos', subcamposActualizados);

        console.log('📋 Subcampo duplicado:', subcampoId);
    };

    // Actualizar propiedad de subcampo
    const handleActualizarSubcampo = (subcampoId, propiedad, valor) => {
        const subcamposActualizados = campo.subcampos.map(sc => {
            if (sc.id !== subcampoId) return sc;

            const actualizado = { ...sc, [propiedad]: valor };

            // Auto-generar nombre técnico si no es manual
            if (propiedad === 'etiqueta' && !sc.nombreManual) {
                actualizado.nombre = generarNombreTecnico(valor);
            }

            return actualizado;
        });

        onUpdateCampo(campo.id, 'subcampos', subcamposActualizados);
    };

    // Actualizar nombre técnico manualmente
    const handleActualizarNombreManual = (subcampoId, valor) => {
        const subcamposActualizados = campo.subcampos.map(sc => {
            if (sc.id !== subcampoId) return sc;
            return { ...sc, nombre: valor, nombreManual: true };
        });

        onUpdateCampo(campo.id, 'subcampos', subcamposActualizados);
    };

    // Manejar drag & drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const subcamposReordenados = Array.from(campo.subcampos);
        const [reordenado] = subcamposReordenados.splice(result.source.index, 1);
        subcamposReordenados.splice(result.destination.index, 0, reordenado);

        onUpdateCampo(campo.id, 'subcampos', subcamposReordenados);

        console.log('🔄 Subcampos reordenados');
    };

    // Renderizar configuración específica por tipo de subcampo
    const renderConfiguracionTipo = (subcampo) => {
        switch (subcampo.tipo) {
            case 'select':
            case 'radio':
            case 'checkbox':
                return (
                    <Form.Group className="mt-2">
                        <Form.Label style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            Opciones (separadas por coma)
                        </Form.Label>
                        <Form.Control
                            type="text"
                            size="sm"
                            value={subcampo.opciones?.join(', ') || ''}
                            onChange={(e) => {
                                const opciones = e.target.value.split(',').map(o => o.trim()).filter(o => o);
                                handleActualizarSubcampo(subcampo.id, 'opciones', opciones);
                            }}
                            placeholder="Opción 1, Opción 2, Opción 3"
                        />
                    </Form.Group>
                );

            case 'scale':
                return (
                    <Row className="mt-2">
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                    Mínimo
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    value={subcampo.min || 1}
                                    onChange={(e) => handleActualizarSubcampo(subcampo.id, 'min', parseInt(e.target.value))}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                    Máximo
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    value={subcampo.max || 5}
                                    onChange={(e) => handleActualizarSubcampo(subcampo.id, 'max', parseInt(e.target.value))}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                );

            case 'file':
                return (
                    <Form.Group className="mt-2">
                        <Form.Label style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            Tipos permitidos
                        </Form.Label>
                        <Form.Control
                            type="text"
                            size="sm"
                            value={subcampo.tiposPermitidos || ''}
                            onChange={(e) => handleActualizarSubcampo(subcampo.id, 'tiposPermitidos', e.target.value)}
                            placeholder=".pdf,.doc,.docx"
                        />
                    </Form.Group>
                );

            default:
                return null;
        }
    };

    // Obtener label del tipo
    const getTipoLabel = (tipoId) => {
        const tipo = allowedSubfieldTypes.find(t => t.id === tipoId);
        return tipo ? `${tipo.icon} ${tipo.label}` : tipoId;
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            {/* Configuración general del grupo repetible */}
            <Card style={{ marginBottom: '1rem', border: '1px solid #e9ecef' }}>
                <Card.Header style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <strong style={{ fontSize: '0.9rem' }}>⚙️ Configuración del Grupo Repetible</strong>
                </Card.Header>
                <Card.Body style={{ padding: '1rem' }}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mínimo de instancias <span style={{ color: '#dc3545' }}>*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={campo.minInstancias || 1}
                                    onChange={(e) => onUpdateCampo(campo.id, 'minInstancias', parseInt(e.target.value) || 0)}
                                />
                                <Form.Text className="text-muted">
                                    Número mínimo de registros requeridos
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Máximo de instancias</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={campo.maxInstancias || 9999}
                                    onChange={(e) => onUpdateCampo(campo.id, 'maxInstancias', parseInt(e.target.value) || 9999)}
                                />
                                <Form.Text className="text-muted">
                                    Número máximo de registros permitidos
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Etiqueta de instancia</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={campo.etiquetaInstancia || 'Registro'}
                                    onChange={(e) => onUpdateCampo(campo.id, 'etiquetaInstancia', e.target.value)}
                                    placeholder="Ej: Vehículo, Funcionario, Item"
                                />
                                <Form.Text className="text-muted">
                                    Se mostrará como "Vehículo #1", "Vehículo #2", etc.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Texto botón agregar</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={campo.textoAgregar || 'Agregar'}
                                    onChange={(e) => onUpdateCampo(campo.id, 'textoAgregar', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label="Mostrar número de instancia"
                            checked={campo.mostrarNumero !== false}
                            onChange={(e) => onUpdateCampo(campo.id, 'mostrarNumero', e.target.checked)}
                        />
                    </Form.Group>
                </Card.Body>
            </Card>

            {/* Paleta de subcampos */}
            <Card style={{ marginBottom: '1rem', border: '1px solid #e9ecef' }}>
                <Card.Header style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <strong style={{ fontSize: '0.9rem' }}>🎨 Agregar Subcampo</strong>
                </Card.Header>
                <Card.Body style={{ padding: '1rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '0.5rem'
                    }}>
                        {allowedSubfieldTypes.map(tipo => (
                            <Button
                                key={tipo.id}
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleAgregarSubcampo(tipo.id)}
                                style={{
                                    padding: '0.5rem',
                                    fontSize: '0.85rem',
                                    textAlign: 'left',
                                    border: '1px solid #dee2e6'
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>{tipo.icon} {tipo.label}</div>
                            </Button>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Lista de subcampos */}
            <Card style={{ border: '1px solid #e9ecef' }}>
                <Card.Header style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <strong style={{ fontSize: '0.9rem' }}>
                        📝 Subcampos ({campo.subcampos?.length || 0})
                    </strong>
                </Card.Header>
                <Card.Body style={{ padding: '1rem' }}>
                    {!campo.subcampos || campo.subcampos.length === 0 ? (
                        <Alert variant="info" style={{ margin: 0, fontSize: '0.9rem' }}>
                            No hay subcampos definidos. Agrega subcampos usando los botones de arriba.
                        </Alert>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="subcampos-list">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                        {campo.subcampos.map((subcampo, index) => (
                                            <Draggable
                                                key={subcampo.id}
                                                draggableId={subcampo.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            marginBottom: '0.75rem',
                                                            border: snapshot.isDragging
                                                                ? '2px solid #17355A'
                                                                : '1px solid #dee2e6',
                                                            boxShadow: snapshot.isDragging
                                                                ? '0 4px 12px rgba(0,0,0,0.15)'
                                                                : 'none'
                                                        }}
                                                    >
                                                        <Card.Header
                                                            style={{
                                                                backgroundColor: '#fff',
                                                                padding: '0.75rem',
                                                                borderBottom: expandedSubfield === subcampo.id
                                                                    ? '1px solid #dee2e6'
                                                                    : 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => setExpandedSubfield(
                                                                expandedSubfield === subcampo.id ? null : subcampo.id
                                                            )}
                                                        >
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.75rem'
                                                            }}>
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        cursor: 'grab',
                                                                        color: '#6c757d',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <FaGripVertical />
                                                                </div>

                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.5rem',
                                                                        flexWrap: 'wrap'
                                                                    }}>
                                                                        <strong style={{ fontSize: '0.95rem' }}>
                                                                            {subcampo.etiqueta || 'Sin etiqueta'}
                                                                        </strong>
                                                                        <Badge bg="secondary" style={{ fontSize: '0.75rem' }}>
                                                                            {getTipoLabel(subcampo.tipo)}
                                                                        </Badge>
                                                                        {subcampo.requerido && (
                                                                            <Badge bg="danger" style={{ fontSize: '0.75rem' }}>
                                                                                Requerido
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: '0.8rem',
                                                                        color: '#6c757d',
                                                                        marginTop: '0.25rem'
                                                                    }}>
                                                                        Nombre técnico: <code>{subcampo.nombre}</code>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '0.5rem'
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        onClick={() => handleDuplicarSubcampo(subcampo.id)}
                                                                        title="Duplicar subcampo"
                                                                    >
                                                                        <FaCopy />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleEliminarSubcampo(subcampo.id)}
                                                                        title="Eliminar subcampo"
                                                                    >
                                                                        <FaTrash />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card.Header>

                                                        {expandedSubfield === subcampo.id && (
                                                            <Card.Body style={{ padding: '1rem' }}>
                                                                <Form.Group className="mb-3">
                                                                    <Form.Label>
                                                                        Etiqueta (texto visible) <span style={{ color: '#dc3545' }}>*</span>
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={subcampo.etiqueta || ''}
                                                                        onChange={(e) => handleActualizarSubcampo(
                                                                            subcampo.id,
                                                                            'etiqueta',
                                                                            e.target.value
                                                                        )}
                                                                        placeholder="Ej: Nombre del conductor"
                                                                    />
                                                                </Form.Group>

                                                                <Form.Group className="mb-3">
                                                                    <Form.Label>
                                                                        Nombre técnico <span style={{ color: '#dc3545' }}>*</span>
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={subcampo.nombre || ''}
                                                                        onChange={(e) => handleActualizarNombreManual(
                                                                            subcampo.id,
                                                                            e.target.value
                                                                        )}
                                                                        placeholder="nombre_conductor"
                                                                    />
                                                                    <Form.Text className="text-muted">
                                                                        {subcampo.nombreManual
                                                                            ? '⚠️ Nombre editado manualmente'
                                                                            : 'ℹ️ Se genera automáticamente desde la etiqueta'
                                                                        }
                                                                    </Form.Text>
                                                                </Form.Group>

                                                                <Form.Group className="mb-3">
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        label="Campo requerido"
                                                                        checked={subcampo.requerido || false}
                                                                        onChange={(e) => handleActualizarSubcampo(
                                                                            subcampo.id,
                                                                            'requerido',
                                                                            e.target.checked
                                                                        )}
                                                                    />
                                                                </Form.Group>

                                                                {renderConfiguracionTipo(subcampo)}
                                                            </Card.Body>
                                                        )}
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default RepetibleFieldEditor;
