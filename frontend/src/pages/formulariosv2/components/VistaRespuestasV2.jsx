import React, {useEffect, useState} from 'react';
import {Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row, Spinner, Table} from 'react-bootstrap';
import {format} from 'date-fns';
import {es} from 'date-fns/locale';
import * as XLSX from 'xlsx';
import * as formulariosApi from '../../../api/formulariosApi';

export default function VistaRespuestasV2({formulario, onVolver}) {
    const [respuestas, setRespuestas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('');

    console.log("Formulario recibido: ", formulario)
    console.log("Respuestas: ", respuestas)

    useEffect(() => {
        cargarRespuestas();
    }, [formulario.id]);

    const cargarRespuestas = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await formulariosApi.listarRespuestas(formulario.id);
            setRespuestas(data);
        } catch (err) {
            console.error('Error al cargar respuestas:', err);
            setError('Error al cargar las respuestas');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar respuestas
    const respuestasFiltradas = respuestas.filter(resp => {
        if (!filtro) return true;
        const filtroLower = filtro.toLowerCase();

        // Buscar en datos JSON
        const datosStr = JSON.stringify(resp.datos).toLowerCase();
        if (datosStr.includes(filtroLower)) return true;

        // Buscar en fecha
        if (resp.fechaRespuesta?.toLowerCase().includes(filtroLower)) return true;

        return false;
    });

    console.log("Respuestas filtradas: ", respuestasFiltradas)

    /**
     * Aplanar un objeto con campos repetibles para Excel
     * Convierte arrays anidados en múltiples filas
     */
    const aplanarRespuestaParaExcel = (respuesta, campos) => {
        const filas = [];
        const datosBase = {
            'ID Respuesta': respuesta.id,
            'Fecha': respuesta.fechaRespuesta ? format(new Date(respuesta.fechaRespuesta), 'dd/MM/yyyy HH:mm', {locale: es}) : 'N/A',
            'ID Funcionario': respuesta.idFuncionario || 'N/A',
            'ID Unidad': respuesta.idUnidad || 'N/A'
        };

        // Identificar campos repetibles
        const camposRepetibles = campos.filter(c => c.tipo === 'repetible');
        const camposNormales = campos.filter(c => c.tipo !== 'repetible');

        // Si no hay campos repetibles, una sola fila
        if (camposRepetibles.length === 0) {
            const fila = {...datosBase};
            camposNormales.forEach(campo => {
                fila[campo.etiqueta] = formatearValorCampo(respuesta.datos[campo.nombre], campo);
            });
            filas.push(fila);
            return filas;
        }

        // Hay campos repetibles - necesitamos crear múltiples filas
        // Encontrar el campo repetible con más instancias
        let maxInstancias = 0;
        camposRepetibles.forEach(campo => {
            const datos = respuesta.datos[campo.nombre];
            if (Array.isArray(datos)) {
                maxInstancias = Math.max(maxInstancias, datos.length);
            }
        });

        // Si no hay instancias, crear una fila vacía
        if (maxInstancias === 0) {
            const fila = {...datosBase};
            camposNormales.forEach(campo => {
                fila[campo.etiqueta] = formatearValorCampo(respuesta.datos[campo.nombre], campo);
            });
            filas.push(fila);
            return filas;
        }

        // Crear una fila por cada instancia
        for (let i = 0; i < maxInstancias; i++) {
            const fila = {...datosBase};

            // Agregar número de instancia si hay repetibles
            if (camposRepetibles.length > 0) {
                fila['#'] = i + 1;
            }

            // Campos normales (se repiten en cada fila)
            camposNormales.forEach(campo => {
                fila[campo.etiqueta] = formatearValorCampo(respuesta.datos[campo.nombre], campo);
            });

            // Campos repetibles (expandir subcampos)
            camposRepetibles.forEach(campoRepetible => {
                const instancias = respuesta.datos[campoRepetible.nombre];
                const instancia = Array.isArray(instancias) ? instancias[i] : null;

                if (instancia && campoRepetible.subcampos) {
                    campoRepetible.subcampos.forEach(subcampo => {
                        const nombreColumna = `${campoRepetible.etiqueta} - ${subcampo.etiqueta}`;
                        fila[nombreColumna] = formatearValorCampo(instancia[subcampo.nombre], subcampo);
                    });
                } else if (campoRepetible.subcampos) {
                    // Fila vacía para este repetible
                    campoRepetible.subcampos.forEach(subcampo => {
                        const nombreColumna = `${campoRepetible.etiqueta} - ${subcampo.etiqueta}`;
                        fila[nombreColumna] = '';
                    });
                }
            });

            filas.push(fila);
        }

        return filas;
    };

    /**
     * Formatear valor de campo para Excel
     */
    const formatearValorCampo = (valor, campo) => {
        if (valor === null || valor === undefined || valor === '') return '';

        switch (campo.tipo) {
            case 'funcionario':
            case 'unidad':
                return valor?.label || valor?.nombre || JSON.stringify(valor);

            case 'checkbox':
                if (Array.isArray(valor)) {
                    return valor.join(', ');
                }
                return valor;

            case 'date':
            case 'datetime':
                if (valor) {
                    try {
                        return format(new Date(valor), 'dd/MM/yyyy HH:mm', {locale: es});
                    } catch {
                        return valor;
                    }
                }
                return '';

            case 'file':
                if (typeof valor === 'object') {
                    return valor.nombre || valor.name || JSON.stringify(valor);
                }
                return valor;

            default:
                if (typeof valor === 'object') {
                    return JSON.stringify(valor);
                }
                return valor;
        }
    };

    /**
     * Exportar a Excel con manejo de campos repetibles
     */
    const exportarAExcel = () => {
        try {
            // Aplanar todas las respuestas
            const filasExcel = [];
            respuestasFiltradas.forEach(respuesta => {
                const filasRespuesta = aplanarRespuestaParaExcel(respuesta, formulario.campos);
                filasExcel.push(...filasRespuesta);
            });

            // Crear workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(filasExcel);

            // Ajustar ancho de columnas
            const columnas = Object.keys(filasExcel[0] || {});
            ws['!cols'] = columnas.map(col => ({wch: Math.max(col.length + 2, 15)}));

            // Agregar hoja al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');

            // Generar nombre de archivo
            const nombreArchivo = `${formulario.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

            // Descargar
            XLSX.writeFile(wb, nombreArchivo);

            console.log('✅ Excel exportado:', nombreArchivo);
        } catch (err) {
            console.error('Error al exportar Excel:', err);
            alert('Error al exportar a Excel: ' + err.message);
        }
    };

    /**
     * Auxiliar para renderizar
     * */
    const renderizarGroup = (valor) => {

        console.log("Respuestas: ", respuestas)
        if (valor === null || valor === undefined || valor === '') {
            return <span className="text-muted">-</span>;
        }

        const info = valor.map(((dato, idx) => {
            const registro = {
                funcionario: dato.funcionario.label,
                idFuncionario: dato.funcionario.value,
                telefono: dato.telefono,
                siglaCarro: dato.siglaCarro,
                isCorporativo: Boolean(dato.corporativo),

            }

            return (
                <span style={{fontSize: '0.8rem', display: 'block'}}>
                    {registro.funcionario} - {registro.siglaCarro} - {registro.telefono}
                </span>
            )
        }))

        return info

    }

    /**
     * Renderizar valor de campo en tabla HTML
     */
    const renderizarValor = (valor, campo) => {

        if (valor === null || valor === undefined || valor === '') {
            return <span className="text-muted">-</span>;
        }

        switch (campo.tipo) {
            case 'repetible':
                if (!Array.isArray(valor) || valor.length === 0) {
                    return <span className="text-muted">Sin registros</span>;
                }
                return (
                    <Badge bg="info">
                        {valor.length} {campo.etiquetaInstancia || 'registro'}(s)
                    </Badge>
                );

            case 'funcionario':
            case 'unidad':
                return valor?.label || valor?.nombre || JSON.stringify(valor);

            case 'checkbox':
                if (Array.isArray(valor)) {
                    return valor.join(', ');
                }
                return valor;

            case 'file':
                if (typeof valor === 'object') {
                    return valor.nombre || valor.name || 'Archivo adjunto';
                }
                return valor;

            case 'repol':
                if (typeof valor === 'object') {
                    return valor?.label || valor?.nombre || JSON.stringify(valor);
                }

            case 'group':
                const info = renderizarGroup(valor);
                return (
                    <div className="d-flex flex-column gap-2" style={{minWidth: '400px'}}>
                        {info}
                    </div>
                )

            default:
                if (typeof valor === 'object') {
                    return <code style={{fontSize: '0.85rem'}}>{JSON.stringify(valor)}</code>;
                }
                return valor;
        }
    };

    if (isLoading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary"/>
                <p className="mt-3 text-muted">Cargando respuestas...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4" style={{maxWidth: '1600px'}}>
            {/* Header */}
            <div className="mb-4">
                <Button variant="outline-secondary" onClick={onVolver} className="mb-3">
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver
                </Button>

                <Card style={{border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                    <Card.Body className="p-4">
                        <Row className="align-items-center">
                            <Col>
                                <h3 style={{color: '#17355A', fontWeight: '700', marginBottom: '0.5rem'}}>
                                    {formulario.nombre}
                                </h3>
                                <p className="text-muted mb-0">
                                    {formulario.descripcion || 'Sin descripción'}
                                </p>
                            </Col>
                            <Col xs="auto">
                                <div className="text-center">
                                    <div style={{fontSize: '2rem', fontWeight: '700', color: '#17355A'}}>
                                        {respuestasFiltradas.length}
                                    </div>
                                    <div className="text-muted" style={{fontSize: '0.9rem'}}>
                                        Respuesta{respuestasFiltradas.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Toolbar */}
            <Card className="mb-4"
                  style={{border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                <Card.Body className="p-3">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar en respuestas..."
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6} className="text-end">
                            <Button
                                variant="success"
                                onClick={exportarAExcel}
                                disabled={respuestasFiltradas.length === 0}
                            >
                                <i className="bi bi-file-earmark-excel me-2"></i>
                                Exportar a Excel
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabla de respuestas */}
            {respuestasFiltradas.length === 0 ? (
                <Card className="text-center py-5" style={{border: '2px dashed #dee2e6', borderRadius: '16px'}}>
                    <Card.Body>
                        <div style={{fontSize: '4rem', opacity: 0.3}}>📋</div>
                        <h5 className="text-muted mt-3">
                            {filtro ? 'No se encontraron respuestas con ese filtro' : 'No hay respuestas aún'}
                        </h5>
                    </Card.Body>
                </Card>
            ) : (
                <Card style={{border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                    <div style={{overflowX: 'auto'}}>
                        <Table hover responsive style={{marginBottom: 0}}>
                            <thead style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                            <tr>
                                <th style={{padding: '1rem', fontWeight: '600'}}>ID</th>
                                {/*<th style={{padding: '1rem', fontWeight: '600'}}>Fecha</th>*/}
                                {formulario.campos.map(campo => (
                                    <th key={campo.id} style={{padding: '1rem', fontWeight: '600'}}>
                                        {campo.etiqueta}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {respuestasFiltradas.map((respuesta) => (
                                <tr key={respuesta.id}>
                                    <td style={{padding: '1rem', verticalAlign: 'middle'}}>
                                        <Badge bg="secondary">{respuesta.id}</Badge>
                                    </td>
                                    {/*<td style={{padding: '1rem', verticalAlign: 'middle'}}>
                                        {respuesta.fechaRespuesta
                                            ? format(new Date(respuesta.fechaRespuesta), 'dd/MM/yyyy HH:mm', {locale: es})
                                            : 'N/A'
                                        }
                                    </td>*/}
                                    {formulario.campos.map(campo => (
                                        <td key={campo.id} style={{padding: '1rem', verticalAlign: 'middle'}}>
                                            {renderizarValor(respuesta.datos[campo.nombre], campo)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                </Card>
            )}

            {/* Información sobre campos repetibles en Excel */}
            {formulario.campos.some(c => c.tipo === 'repetible') && respuestasFiltradas.length > 0 && (
                <Alert variant="info" className="mt-3" style={{fontSize: '0.9rem'}}>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Nota sobre exportación:</strong> Este formulario contiene campos repetibles. Al exportar a
                    Excel,
                    cada instancia de los campos repetibles generará una fila separada, facilitando el análisis de los
                    datos.
                </Alert>
            )}
        </Container>
    );
}
