import React, {useEffect, useState} from 'react';
import {Alert, Badge, Card, Offcanvas, Spinner} from 'react-bootstrap';
import {FaCar, FaDollarSign, FaFileAlt, FaPills, FaUser} from 'react-icons/fa';
import {FaGun} from "react-icons/fa6";
import * as PropTypes from "prop-types";

function FaBullet(props) {
    return null;
}

FaBullet.propTypes = {className: PropTypes.string};

const NodeInfoDrawer = ({show, handleClose, nodeData, onRelatedSearch}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailedInfo, setDetailedInfo] = useState(null);

    console.log("NodeData: ", nodeData);

    useEffect(() => {
        if (nodeData && show) {
            fetchDetailedInfo(nodeData);
        }
    }, [nodeData, show]);

    const fetchDetailedInfo = async (node) => {
        setLoading(true);
        setError(null);
        try {
            // Normalizamos: si no viene node.data, usamos el propio node
            const safe = {type: node?.type, data: node?.data ?? node ?? {}};
            setDetailedInfo(safe);
        } catch (err) {
            setError('Error al cargar información detallada');
        } finally {
            setLoading(false);
        }
    };

    const getNodeIcon = (type) => {
        const icons = {
            persona: <FaUser className="me-2"/>,
            vehiculo: <FaCar className="me-2"/>,
            arma: <FaGun className="me-2"/>,
            droga: <FaPills className="me-2"/>,
            dinero: <FaDollarSign className="me-2"/>,
            municion: <FaBullet className="me-2"/>,
            memo: <FaFileAlt className="me-2"/>
        };
        return icons[type] || <FaFileAlt className="me-2"/>;
    };

    // ---------- Renderers con optional chaining y defaults ----------
    const renderPersonaCard = (persona = {}) => (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{getNodeIcon('persona')} Ficha de Persona</h5>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-primary">Identificación</h6>
                        <p><strong>RUT:</strong> {persona.rut ?? '—'}</p>
                        <p>
                            <strong>Nombre:</strong> {[persona.nombre, persona.apellidoPat, persona.apellidoMat].filter(Boolean).join(' ') || '—'}
                        </p>
                        <p><strong>Sexo:</strong> {persona.sexo ?? '—'}</p>
                        <p><strong>Fecha Nacimiento:</strong> {persona.fechaNacimiento ?? '—'}</p>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-primary">Información Adicional</h6>
                        <p><strong>Estado Civil:</strong> {persona.estadoCivil ?? '—'}</p>
                        <p><strong>Nacionalidad:</strong> {persona.nacionalidad ?? '—'}</p>
                        <p><strong>Profesión:</strong> {persona.profesion ?? '—'}</p>
                        {persona.observaciones && (<p><strong>Observaciones:</strong> {persona.observaciones}</p>)}
                    </div>
                </div>

                {Array.isArray(persona.delitos) && persona.delitos.length > 0 && (
                    <div className="mt-3">
                        <h6 className="text-danger">Delitos Asociados</h6>
                        {persona.delitos.map((delito, idx) => (
                            <Badge key={idx} bg="danger" className="me-2 mb-1">
                                {delito?.tipoDelito ?? 'Delito'}
                            </Badge>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const renderVehiculoCard = (vehiculo = {}) => (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="bg-info text-white">
                <h5 className="mb-0">{getNodeIcon('vehiculo')} Ficha de Vehículo</h5>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-info">Identificación del Vehículo</h6>
                        <p><strong>Patente:</strong> <Badge bg="dark">{vehiculo.patente ?? '—'}</Badge></p>
                        <p><strong>Marca:</strong> {vehiculo.marca?.descripcion ?? '—'}</p>
                        <p><strong>Modelo:</strong> {vehiculo.modelo?.descripcion ?? '—'}</p>
                        <p><strong>Color:</strong> {vehiculo.color ?? '—'}</p>
                        <p><strong>Año:</strong> {vehiculo.año ?? '—'}</p>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-info">Información Legal</h6>
                        <p><strong>Calidad:</strong> {vehiculo.calidad ?? '—'}</p>
                        <p><strong>Condición:</strong> {vehiculo.condicion ?? '—'}</p>
                        {vehiculo.avaluo && (<p><strong>Avalúo:</strong> ${vehiculo.avaluo}</p>)}
                        {vehiculo.obs && (<p><strong>Observaciones:</strong> {vehiculo.obs}</p>)}
                    </div>
                </div>

                {vehiculo.sitioSuceso && (
                    <div className="mt-3">
                        <h6 className="text-secondary">Ubicación del Suceso</h6>
                        <p><strong>Sitio:</strong> {vehiculo.sitioSuceso}</p>
                        <p><strong>Comuna:</strong> {vehiculo.comunaSV}</p>
                        <p><strong>Vía:</strong> {vehiculo.nombreViaSV} {vehiculo.numSV}</p>
                        {(vehiculo.latitudV && vehiculo.longitudV) && (
                            <p><strong>Coordenadas:</strong> {vehiculo.latitudV}, {vehiculo.longitudV}</p>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const renderArmaCard = (arma = {}) => (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">{getNodeIcon('arma')} Ficha de Arma</h5>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-danger">Características del Arma</h6>
                        <p><strong>Tipo:</strong> {arma.tipoArma ?? '—'}</p>
                        <p><strong>Marca:</strong> {arma.marcaArma ?? '—'}</p>
                        <p><strong>Modelo:</strong> {arma.modeloArma ?? '—'}</p>
                        <p><strong>Calibre:</strong> {arma.calibre ?? '—'}</p>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-danger">Información de Serie</h6>
                        <p><strong>N° Serie:</strong> <Badge bg="dark">{arma.serieArma ?? '—'}</Badge></p>
                        <p><strong>Calidad:</strong> {arma.calidad ?? '—'}</p>
                        <p><strong>Estado:</strong> {arma.estado ?? '—'}</p>
                    </div>
                </div>
                {arma.obs && (
                    <div className="mt-3">
                        <Alert variant="warning">
                            <strong>Observaciones:</strong> {arma.obs}
                        </Alert>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const renderDrogaCard = (droga = {}) => (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">{getNodeIcon('droga')} Ficha de Droga</h5>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-warning">Tipo de Sustancia</h6>
                        <p><strong>Tipo:</strong> {droga.tipoDroga ?? '—'}</p>
                        <p><strong>Cantidad:</strong> {droga.cantidadDroga ?? '—'}</p>
                        <p><strong>Unidad:</strong> {droga.unidadMedida ?? '—'}</p>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-warning">Información Legal</h6>
                        <p><strong>Calidad:</strong> {droga.calidad ?? '—'}</p>
                        <p><strong>Estado:</strong> {droga.estado ?? '—'}</p>
                    </div>
                </div>
                {droga.obs && (
                    <Alert variant="info" className="mt-3">
                        <strong>Observaciones:</strong> {droga.obs}
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );

    const renderMemoCard = (memo = {}) => (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0">{getNodeIcon('memo')} Ficha de Memo</h5>
            </Card.Header>
            <Card.Body>
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-secondary">Información del Memo</h6>
                        <p><strong>Formulario:</strong> {memo.formulario ?? '—'}</p>
                        <p><strong>Fecha:</strong> {memo.fecha ?? '—'}</p>
                        <p><strong>Unidad:</strong> {memo.unidad ?? '—'}</p>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-secondary">Detalles del Procedimiento</h6>
                        <p><strong>Procedimiento:</strong> {memo.procedimiento ?? '—'}</p>
                        {memo.numeroSumario && (<p><strong>N° Sumario:</strong> {memo.numeroSumario}</p>)}
                    </div>
                </div>

                {Array.isArray(memo.fichaPersonas) && memo.fichaPersonas.length > 0 && (
                    <div className="mt-3">
                        <h6 className="text-secondary">Personas Involucradas</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {memo.fichaPersonas.map((persona, idx) => (
                                <Badge
                                    key={idx}
                                    bg="primary"
                                    className="cursor-pointer"
                                    onClick={() => onRelatedSearch && onRelatedSearch('persona', persona?.rut)}
                                >
                                    {[persona?.nombre, persona?.apellidoPat].filter(Boolean).join(' ') || 'Persona'}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const renderNodeInfo = () => {
        if (!detailedInfo) return null;
        const type = detailedInfo?.type;
        const data = detailedInfo?.data ?? {};

        switch (type) {
            case 'persona':
                return renderPersonaCard(data);
            case 'vehiculo':
                return renderVehiculoCard(data);
            case 'arma':
                return renderArmaCard(data);
            case 'droga':
                return renderDrogaCard(data);
            case 'memo':
                return renderMemoCard(data);
            default:
                return <Alert variant="info">Información detallada no disponible para este tipo de nodo.</Alert>;
        }
    };

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            style={{width: '500px', zIndex: 2000}}
        >
            <Offcanvas.Header closeButton className="bg-dark text-white">
                <Offcanvas.Title>
                    {nodeData && (
                        <>
                            {getNodeIcon(nodeData?.type)}
                            Ficha Policial
                            - {nodeData?.type ? nodeData.type.charAt(0).toUpperCase() + nodeData.type.slice(1) : '—'}
                        </>
                    )}
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-0">
                {loading && (
                    <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
                        <Spinner animation="border" variant="primary"/>
                    </div>
                )}

                {error && (<Alert variant="danger" className="m-3">{error}</Alert>)}

                <div className="p-3">
                    {renderNodeInfo()}
                </div>

                {nodeData && (
                    <div className="p-3 border-top bg-light">
                        <h6 className="text-muted">Acciones</h6>
                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => onRelatedSearch && onRelatedSearch(nodeData?.type, nodeData?.id)}
                            >
                                Buscar Relacionados
                            </button>
                            <button className="btn btn-outline-secondary" onClick={() => {
                            }}>
                                Exportar Ficha
                            </button>
                        </div>
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default NodeInfoDrawer;