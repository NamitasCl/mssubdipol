import React from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import AsyncFuncionarioSelect from '../../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect';
import AsyncUnidadesSelect from '../../../components/ComponentesAsyncSelect/AsyncUnidadesSelect';

/**
 * RepetibleFieldRenderer - Renderiza un campo repetible con múltiples instancias
 * Permite agregar/eliminar instancias y editar cada subcampo
 */
const RepetibleFieldRenderer = ({ campo, valores = [], onChange }) => {
    // Configuración del campo repetible
    const {
        etiqueta,
        requerido,
        subcampos = [],
        minInstancias = 1,
        maxInstancias = 9999,
        textoAgregar = 'Agregar',
        mostrarNumero = true,
        etiquetaInstancia = 'Registro'
    } = campo;

    // Asegurar que valores sea un array
    const instancias = Array.isArray(valores) ? valores : [];

    // Agregar nueva instancia
    const handleAgregarInstancia = () => {
        if (instancias.length >= maxInstancias) {
            alert(`No se pueden agregar más de ${maxInstancias} ${etiquetaInstancia.toLowerCase()}s`);
            return;
        }

        // Crear objeto vacío con todos los subcampos
        const nuevaInstancia = {};
        subcampos.forEach(subcampo => {
            if (subcampo.tipo === 'checkbox') {
                nuevaInstancia[subcampo.nombre] = [];
            } else {
                nuevaInstancia[subcampo.nombre] = '';
            }
        });

        const nuevasInstancias = [...instancias, nuevaInstancia];
        onChange(nuevasInstancias);

        console.log('➕ Nueva instancia agregada');
    };

    // Eliminar instancia
    const handleEliminarInstancia = (index) => {
        if (instancias.length <= minInstancias) {
            alert(`Debe haber al menos ${minInstancias} ${etiquetaInstancia.toLowerCase()}(s)`);
            return;
        }

        const nuevasInstancias = instancias.filter((_, i) => i !== index);
        onChange(nuevasInstancias);

        console.log('🗑️ Instancia eliminada:', index);
    };

    // Actualizar valor de subcampo en una instancia
    const handleCambioSubcampo = (instanciaIndex, subcampoNombre, valor) => {
        const nuevasInstancias = instancias.map((instancia, i) => {
            if (i !== instanciaIndex) return instancia;
            return { ...instancia, [subcampoNombre]: valor };
        });

        onChange(nuevasInstancias);
    };

    // Renderizar un subcampo según su tipo
    const renderSubcampo = (subcampo, instanciaIndex, valorActual) => {
        const { tipo, etiqueta, requerido, nombre } = subcampo;

        switch (tipo) {
            case 'text':
            case 'email':
            case 'tel':
                return (
                    <Form.Control
                        type={tipo}
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                        placeholder={etiqueta}
                    />
                );

            case 'textarea':
                return (
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                        placeholder={etiqueta}
                    />
                );

            case 'number':
                return (
                    <Form.Control
                        type="number"
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                        placeholder={etiqueta}
                    />
                );

            case 'date':
                return (
                    <Form.Control
                        type="date"
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                    />
                );

            case 'datetime':
                return (
                    <Form.Control
                        type="datetime-local"
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                    />
                );

            case 'time':
                return (
                    <Form.Control
                        type="time"
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                    />
                );

            case 'select':
                return (
                    <Form.Select
                        value={valorActual || ''}
                        onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                        required={requerido}
                    >
                        <option value="">-- Seleccione --</option>
                        {(subcampo.opciones || []).map((opcion, idx) => (
                            <option key={idx} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </Form.Select>
                );

            case 'radio':
                return (
                    <div>
                        {(subcampo.opciones || []).map((opcion, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                id={`${nombre}_${instanciaIndex}_${idx}`}
                                label={opcion}
                                name={`${nombre}_${instanciaIndex}`}
                                value={opcion}
                                checked={valorActual === opcion}
                                onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, e.target.value)}
                                required={requerido}
                            />
                        ))}
                    </div>
                );

            case 'checkbox':
                const valoresCheckbox = Array.isArray(valorActual) ? valorActual : [];
                return (
                    <div>
                        {(subcampo.opciones || []).map((opcion, idx) => (
                            <Form.Check
                                key={idx}
                                type="checkbox"
                                id={`${nombre}_${instanciaIndex}_${idx}`}
                                label={opcion}
                                checked={valoresCheckbox.includes(opcion)}
                                onChange={(e) => {
                                    const nuevosValores = e.target.checked
                                        ? [...valoresCheckbox, opcion]
                                        : valoresCheckbox.filter(v => v !== opcion);
                                    handleCambioSubcampo(instanciaIndex, nombre, nuevosValores);
                                }}
                            />
                        ))}
                    </div>
                );

            case 'scale':
                return (
                    <div>
                        <Form.Range
                            min={subcampo.min || 1}
                            max={subcampo.max || 5}
                            value={valorActual || subcampo.min || 1}
                            onChange={(e) => handleCambioSubcampo(instanciaIndex, nombre, parseInt(e.target.value))}
                        />
                        <Form.Text className="text-muted">
                            Valor seleccionado: {valorActual || subcampo.min || 1} (de {subcampo.min || 1} a {subcampo.max || 5})
                        </Form.Text>
                    </div>
                );

            case 'file':
                return (
                    <div>
                        <Form.Control
                            type="file"
                            accept={subcampo.tiposPermitidos || '*'}
                            onChange={(e) => {
                                const archivo = e.target.files[0];
                                if (archivo) {
                                    handleCambioSubcampo(instanciaIndex, nombre, {
                                        nombre: archivo.name,
                                        tipo: archivo.type,
                                        tamanio: archivo.size
                                    });
                                }
                            }}
                            required={requerido}
                        />
                        {subcampo.tiposPermitidos && (
                            <Form.Text className="text-muted">
                                Tipos permitidos: {subcampo.tiposPermitidos}
                            </Form.Text>
                        )}
                    </div>
                );

            case 'funcionario':
                return (
                    <AsyncFuncionarioSelect
                        value={valorActual}
                        onChange={(valor) => handleCambioSubcampo(instanciaIndex, nombre, valor)}
                        required={requerido}
                    />
                );

            case 'unidad':
                return (
                    <AsyncUnidadesSelect
                        value={valorActual}
                        onChange={(valor) => handleCambioSubcampo(instanciaIndex, nombre, valor)}
                        required={requerido}
                    />
                );

            default:
                return (
                    <Alert variant="warning" style={{ margin: 0 }}>
                        Tipo de campo no soportado: {tipo}
                    </Alert>
                );
        }
    };

    // Verificar si hay subcampos definidos
    if (!subcampos || subcampos.length === 0) {
        return (
            <Alert variant="warning">
                Este campo repetible no tiene subcampos definidos.
            </Alert>
        );
    }

    // Asegurar que haya al menos minInstancias
    React.useEffect(() => {
        if (instancias.length < minInstancias) {
            const faltantes = minInstancias - instancias.length;
            const nuevasInstancias = [...instancias];

            for (let i = 0; i < faltantes; i++) {
                const nuevaInstancia = {};
                subcampos.forEach(subcampo => {
                    if (subcampo.tipo === 'checkbox') {
                        nuevaInstancia[subcampo.nombre] = [];
                    } else {
                        nuevaInstancia[subcampo.nombre] = '';
                    }
                });
                nuevasInstancias.push(nuevaInstancia);
            }

            onChange(nuevasInstancias);
        }
    }, [minInstancias, subcampos]); // Solo ejecutar cuando cambien estos valores

    return (
        <div>
            <Form.Label>
                {etiqueta}
                {requerido && <span style={{ color: '#dc3545' }}> *</span>}
            </Form.Label>

            {/* Información de límites */}
            <div style={{
                fontSize: '0.85rem',
                color: '#6c757d',
                marginBottom: '0.75rem'
            }}>
                {instancias.length} de {maxInstancias < 9999 ? maxInstancias : '∞'}
                {minInstancias > 0 && ` (mínimo ${minInstancias})`}
            </div>

            {/* Lista de instancias */}
            {instancias.map((instancia, index) => (
                <Card
                    key={index}
                    style={{
                        marginBottom: '1rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px'
                    }}
                >
                    <Card.Header
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid #dee2e6'
                        }}
                    >
                        <strong style={{ fontSize: '0.95rem' }}>
                            {mostrarNumero
                                ? `${etiquetaInstancia} #${index + 1}`
                                : etiquetaInstancia
                            }
                        </strong>

                        {instancias.length > minInstancias && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleEliminarInstancia(index)}
                                title="Eliminar"
                            >
                                <FaTrash /> Eliminar
                            </Button>
                        )}
                    </Card.Header>

                    <Card.Body style={{ padding: '1rem' }}>
                        <Row>
                            {subcampos.map((subcampo) => {
                                const colSize = subcampo.tipo === 'textarea' ? 12 : 6;
                                return (
                                    <Col key={subcampo.id} md={colSize} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>
                                                {subcampo.etiqueta}
                                                {subcampo.requerido && (
                                                    <span style={{ color: '#dc3545' }}> *</span>
                                                )}
                                            </Form.Label>
                                            {renderSubcampo(
                                                subcampo,
                                                index,
                                                instancia[subcampo.nombre]
                                            )}
                                        </Form.Group>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card.Body>
                </Card>
            ))}

            {/* Botón para agregar nueva instancia */}
            {instancias.length < maxInstancias && (
                <Button
                    variant="outline-primary"
                    onClick={handleAgregarInstancia}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px dashed #17355A',
                        backgroundColor: 'transparent',
                        color: '#17355A',
                        fontWeight: 'bold'
                    }}
                >
                    <FaPlus /> {textoAgregar} {etiquetaInstancia}
                </Button>
            )}

            {/* Mensaje si se alcanzó el límite */}
            {instancias.length >= maxInstancias && maxInstancias < 9999 && (
                <Alert variant="info" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    Se alcanzó el límite máximo de {maxInstancias} {etiquetaInstancia.toLowerCase()}(s).
                </Alert>
            )}
        </div>
    );
};

export default RepetibleFieldRenderer;
