import React, {useEffect, useState} from 'react';
import {Alert, Badge, Card, Offcanvas, Spinner} from 'react-bootstrap';
import {FaBoxOpen, FaCar, FaDollarSign, FaFileAlt, FaPills, FaTimes, FaUser, FaUserTie} from 'react-icons/fa';
import {FaGun} from "react-icons/fa6";
import * as PropTypes from "prop-types";

const NodeInfoDrawer = ({show, handleClose, nodeData, onRelatedSearch}) => {
    const [detailedInfo, setDetailedInfo] = useState(null);

    useEffect(() => {
        if (nodeData && show) {
            console.log("NodeInfoDrawer — nodeData:", nodeData);
            console.log("NodeInfoDrawer — nodeData.data:", JSON.stringify(nodeData.data, null, 2));
            setDetailedInfo({
                type: nodeData.type || 'default',
                data: nodeData.data || {}
            });
        } else if (!show) {
            setDetailedInfo(null);
        }
    }, [nodeData, show]);

    const typeColors = {
        persona: '#3b82f6', memo: '#f59e0b', funcionario: '#10b981',
        vehiculo: '#eab308', droga: '#a855f7', dinero: '#06b6d4',
        arma: '#ef4444', municion: '#64748b', especie: '#f43f5e',
    };

    const getNodeIcon = (type) => {
        const map = {
            persona: <FaUser/>, vehiculo: <FaCar/>, arma: <FaGun/>,
            droga: <FaPills/>, dinero: <FaDollarSign/>, municion: <span>•</span>,
            memo: <FaFileAlt/>, funcionario: <FaUserTie/>, especie: <FaBoxOpen/>
        };
        return map[type] || <FaFileAlt/>;
    };

    // ── Helpers ────────────────────────────────────────────────────────────────
    const Row = ({label, value}) =>
        value ? <p className="mb-1 text-dark"><strong>{label}:</strong> {value}</p> : null;

    const Header = ({type, title}) => (
        <Card.Header className="text-white py-3" style={{backgroundColor: typeColors[type] || '#64748b', color: '#fff'}}>
            <h5 className="mb-0 d-flex align-items-center gap-2">
                {getNodeIcon(type)} {title}
            </h5>
        </Card.Header>
    );

    // ── Renderers ──────────────────────────────────────────────────────────────
    const renderPersona = (p = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="persona" title="Ficha de Persona"/>
            <Card.Body className="bg-white border">
                <Row label="RUT" value={p.rut}/>
                <Row label="Nombre" value={[p.nombre, p.apellidoPat, p.apellidoMat].filter(Boolean).join(' ') || null}/>
                <Row label="Sexo" value={p.sexo}/>
                <Row label="Edad" value={p.edad}/>
                <Row label="Nacionalidad" value={p.nacionalidad}/>
                <Row label="Apodo" value={p.apodo}/>
                <Row label="Dirección" value={[p.direccion, p.direccionNumero].filter(Boolean).join(' ') || null}/>
                <Row label="Teléfono" value={p.fono}/>
                <Row label="Correo" value={p.correoElectronico}/>
                <Row label="Observaciones" value={p.observaciones}/>

                {p.delitos && p.delitos.length > 0 && (
                    <div className="mt-3 pt-2 border-top">
                        <small className="text-muted fw-bold text-uppercase">Delitos</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {[...p.delitos].map((d, i) => (
                                <Badge key={i} bg="danger" className="opacity-85">{d}</Badge>
                            ))}
                        </div>
                    </div>
                )}
                {p.estados && p.estados.length > 0 && (
                    <div className="mt-2">
                        <small className="text-muted fw-bold text-uppercase">Calidades</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {[...p.estados].map((e, i) => (
                                <Badge key={i} bg="secondary">{e}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const renderVehiculo = (v = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="vehiculo" title="Ficha de Vehículo"/>
            <Card.Body className="bg-white border">
                {(v.patente) && (
                    <p className="mb-2"><Badge bg="dark" className="fs-6 px-3">{v.patente}</Badge></p>
                )}
                <Row label="Marca" value={v.marca}/>
                <Row label="Modelo" value={v.modelo}/>
                <Row label="Color" value={v.color}/>
                <Row label="Tipo" value={v.tipo}/>
                <Row label="Calidad" value={v.calidad}/>
                <Row label="Observaciones" value={v.obs}/>
            </Card.Body>
        </Card>
    );

    const renderMemo = (m = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="memo" title="Ficha de Memo"/>
            <Card.Body className="bg-white border">
                <Row label="Formulario" value={m.formulario}/>
                <Row label="Folio Brain" value={m.folioBrain}/>
                <Row label="RUC" value={m.ruc}/>
                <Row label="Fecha" value={m.fecha ? new Date(m.fecha).toLocaleDateString('es-CL') : null}/>
                <Row label="Procedimiento" value={m.modusDescripcion}/>
                <Row label="Unidad" value={m.unidad?.nombreUnidad || m.unidad}/>
                <Row label="Tipo" value={m.tipo}/>
            </Card.Body>
        </Card>
    );

    const renderFuncionario = (f = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="funcionario" title="Ficha de Funcionario"/>
            <Card.Body className="bg-white border">
                <Row label="Nombre" value={f.funcionario}/>
                <Row label="Responsabilidad" value={f.responsabilidadMemo}/>
            </Card.Body>
        </Card>
    );

    const renderArma = (a = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="arma" title="Ficha de Arma"/>
            <Card.Body className="bg-white border">
                <Row label="Tipo" value={a.tipoArma}/>
                <Row label="Marca" value={a.marcaArma}/>
                <Row label="Calibre" value={a.calibreArma}/>
                <Row label="N° Serie" value={a.serieArma}/>
                <Row label="Calidad" value={a.calidad}/>
                <Row label="Condición" value={a.condicion}/>
                <Row label="Observaciones" value={a.obs}/>
            </Card.Body>
        </Card>
    );

    const renderDinero = (d = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="dinero" title="Ficha de Dinero"/>
            <Card.Body className="bg-white border">
                <Row label="Monto" value={d.monto != null ? `$${d.monto}` : null}/>
                <Row label="Calidad" value={d.calidad}/>
                <Row label="Observaciones" value={d.obs}/>
            </Card.Body>
        </Card>
    );

    const renderEspecie = (e = {}) => (
        <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <Header type="especie" title="Ficha de Especie"/>
            <Card.Body className="bg-white border">
                <Row label="Descripción" value={e.descripcion}/>
                <Row label="Calidad" value={e.calidad}/>
                <Row label="Cantidad" value={e.cantidad}/>
                <Row label="NUE" value={e.nue}/>
                <Row label="Avalúo" value={e.avaluo}/>
            </Card.Body>
        </Card>
    );

    const renderGeneric = (type, data = {}) => (
        <Alert variant="secondary" className="border">
            <div className="fw-bold mb-2">{getNodeIcon(type)} <span className="ms-1 text-capitalize">{type}</span></div>
            <Row label="Etiqueta" value={data.label || nodeData?.label}/>
            {/* Muestra todas las propiedades disponibles */}
            {Object.entries(data).map(([k, v]) =>
                typeof v === 'string' || typeof v === 'number'
                    ? <Row key={k} label={k} value={String(v)}/>
                    : null
            )}
        </Alert>
    );

    const renderContent = () => {
        if (!detailedInfo) return null;
        const {type, data} = detailedInfo;
        switch (type) {
            case 'persona':     return renderPersona(data);
            case 'vehiculo':    return renderVehiculo(data);
            case 'memo':        return renderMemo(data);
            case 'funcionario': return renderFuncionario(data);
            case 'arma':        return renderArma(data);
            case 'dinero':      return renderDinero(data);
            case 'especie':     return renderEspecie(data);
            default:            return renderGeneric(type, data);
        }
    };

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            style={{width: '460px', zIndex: 3000, borderLeft: '1px solid #cbd5e1'}}
            className="shadow-lg"
        >
            {/* Header */}
            <Offcanvas.Header
                className="text-white py-3"
                style={{backgroundColor: typeColors[nodeData?.type] || '#1a365d', borderBottom: '1px solid rgba(255,255,255,.15)'}}
            >
                <Offcanvas.Title className="d-flex gap-2 align-items-center">
                    <span className="p-2 rounded" style={{background: 'rgba(255,255,255,0.2)'}}>
                        {getNodeIcon(nodeData?.type)}
                    </span>
                    <div>
                        <div style={{fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: .8, textTransform: 'uppercase'}}>
                            Grafo · {nodeData?.type || ''}
                        </div>
                        <div style={{fontSize: 18, fontWeight: 700, lineHeight: 1.2}}>
                            {nodeData?.label || 'Ficha Policial'}
                        </div>
                    </div>
                </Offcanvas.Title>
                <button
                    onClick={handleClose}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 8,
                        color: '#fff',
                        width: 36, height: 36,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    <FaTimes size={16}/>
                </button>
            </Offcanvas.Header>

            {/* Body */}
            <Offcanvas.Body style={{background: '#f8fafc', padding: 0}}>
                <div style={{padding: '20px 16px 100px'}}>
                    {renderContent()}
                </div>

                {/* Acciones fijas al fondo */}
                {nodeData && (
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: '#fff', borderTop: '1px solid #e2e8f0',
                        padding: '14px 16px'
                    }}>
                        <div className="d-flex flex-column gap-2">
                            {onRelatedSearch && (
                                <button
                                    className="btn btn-primary fw-bold py-2"
                                    onClick={() => {
                                        const rawId = String(nodeData.id || '');
                                        const identifier = rawId.includes(':') ? rawId.split(':').slice(1).join(':') : rawId;
                                        onRelatedSearch(nodeData.type, identifier);
                                    }}
                                >
                                    Explorar Relaciones
                                </button>
                            )}
                            <button className="btn btn-outline-secondary py-2">
                                Generar PDF de Ficha
                            </button>
                        </div>
                    </div>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

NodeInfoDrawer.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    nodeData: PropTypes.object,
    onRelatedSearch: PropTypes.func
};

export default NodeInfoDrawer;