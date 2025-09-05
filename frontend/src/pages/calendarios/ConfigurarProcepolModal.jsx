// ./ConfigurarUnidadesAportantesModal.jsx
import React, {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Badge,
    Button,
    CloseButton,
    Col,
    Form,
    InputGroup,
    Modal,
    Pagination,
    Row,
    Stack,
    Table,
} from "react-bootstrap";

/* ------------------
   Datos mock básicos
   ------------------ */
const REGIONES = [
    {id: "01", nombre: "Arica y Parinacota"},
    {id: "02", nombre: "Tarapacá"},
    {id: "03", nombre: "Antofagasta"},
    {id: "04", nombre: "Atacama"},
    {id: "05", nombre: "Coquimbo"},
    {id: "06", nombre: "Valparaíso"},
    {id: "07", nombre: "Metropolitana de Santiago"},
    {id: "08", nombre: "O'Higgins"},
    {id: "09", nombre: "Maule"},
    {id: "10", nombre: "Ñuble"},
    {id: "11", nombre: "Biobío"},
    {id: "12", nombre: "La Araucanía"},
    {id: "13", nombre: "Los Ríos"},
    {id: "14", nombre: "Los Lagos"},
    {id: "15", nombre: "Aysén"},
    {id: "16", nombre: "Magallanes y Antártica Chilena"},
];

const PREFECTURAS_POR_REGION = {
    "07": [
        {id: "P7-1", nombre: "Prefectura Santiago Centro"},
        {id: "P7-2", nombre: "Prefectura Cordillera"},
        {id: "P7-3", nombre: "Prefectura Maipo"},
    ],
    "11": [
        {id: "P11-1", nombre: "Prefectura Concepción"},
        {id: "P11-2", nombre: "Prefectura Biobío"},
        {id: "P11-3", nombre: "Prefectura Arauco"},
    ],
    "02": [
        {id: "P2-1", nombre: "Prefectura Iquique"},
        {id: "P2-2", nombre: "Prefectura Tamarugal"},
    ],
};

const UNIDADES_POR_PREFECTURA = {
    "P7-1": [
        {id: "U-001", nombre: "BICRIM Santiago Centro"},
        {id: "U-002", nombre: "BRIDEC Santiago"},
        {id: "U-003", nombre: "JENADEP Santiago"},
        {id: "U-004", nombre: "MT-Centro"},
    ],
    "P7-2": [
        {id: "U-101", nombre: "BICRIM Puente Alto"},
        {id: "U-102", nombre: "BRIDEC Puente Alto"},
    ],
    "P7-3": [
        {id: "U-201", nombre: "BICRIM San Bernardo"},
        {id: "U-202", nombre: "BRIDEC San Bernardo"},
    ],
    "P11-1": [
        {id: "U-301", nombre: "BICRIM Concepción"},
        {id: "U-302", nombre: "BRIDEC Concepción"},
        {id: "U-303", nombre: "Biro Robo Concepción"},
        {id: "U-304", nombre: "Biro MT Concepción"},
        {id: "U-305", nombre: "Biro Económica Concepción"},
    ],
    "P11-2": [
        {id: "U-401", nombre: "BICRIM Los Ángeles"},
        {id: "U-402", nombre: "BRIDEC Los Ángeles"},
    ],
    "P11-3": [
        {id: "U-501", nombre: "BICRIM Cañete"},
        {id: "U-502", nombre: "BRIDEC Lebu"},
        {id: "U-503", nombre: "BICRIM Arauco"},
    ],
    "P2-1": [
        {id: "U-601", nombre: "BICRIM Iquique"},
        {id: "U-602", nombre: "BRIDEC Iquique"},
    ],
    "P2-2": [
        {id: "U-701", nombre: "BICRIM Pozo Almonte"},
    ],
};

/* -----------------------------
   Helpers y esquema por defecto
   ----------------------------- */
const defaultUnitSchema = () => ({
    cantidadLunesViernes: 0,
    cantidadSabado: 0,
    cantidadDomingo: 0,
    cantidadFestivo: 0,
    isTercero: false
});
const clamp = (n) => Math.max(0, Number.isFinite(n) ? n : 0);
const parseNumber = (e) => {
    const v = parseInt(e.target.value, 10);
    return Number.isNaN(v) ? 0 : clamp(v);
};

/* ---------------------------------------------------
   Componente principal (versión compacta + carrito)
   --------------------------------------------------- */
export default function ConfigurarUnidadesAportantesModal({
                                                              show,
                                                              onHide,
                                                              idCalendario,
                                                              onSave, // callback(payload)
                                                          }) {
    // Filtros
    const [regionId, setRegionId] = useState("");
    const [prefecturaId, setPrefecturaId] = useState("");
    const [query, setQuery] = useState("");

    // Paginación
    const [page, setPage] = useState(1);
    const pageSize = 8; // más compacto

    // Estado de configuración y selección
    const [configPorUnidad, setConfigPorUnidad] = useState({});
    const [unidadIndex, setUnidadIndex] = useState({}); // { [idUnidad]: { siglasUnidad, regionId, prefecturaId } }
    const [seleccionadas, setSeleccionadas] = useState({}); // carrito: { [idUnidad]: true }

    // Globales
    const [usarGlobal, setUsarGlobal] = useState(false);
    const [agruparFinDeSemana, setAgruparFinDeSemana] = useState(false);
    const [globalCfg, setGlobalCfg] = useState({
        cantidadLunesViernes: 0,
        cantidadSabado: 0,
        cantidadDomingo: 0,
        cantidadFestivo: 0,
        finde: 0
    });

    // Prefecturas y unidades visibles
    const prefecturas = useMemo(() => (regionId ? PREFECTURAS_POR_REGION[regionId] || [] : []), [regionId]);
    const unidadesBase = useMemo(() => (prefecturaId ? UNIDADES_POR_PREFECTURA[prefecturaId] || [] : []), [prefecturaId]);
    const unidadesFiltradas = useMemo(() => {
        if (!query) return unidadesBase;
        const q = query.toLowerCase();
        return unidadesBase.filter((u) => u.nombre.toLowerCase().includes(q));
    }, [unidadesBase, query]);

    // Reset al cambiar región
    useEffect(() => {
        setPrefecturaId("");
        setQuery("");
        setPage(1);
    }, [regionId]);

    // Inicializa configs e índice al cambiar prefectura
    useEffect(() => {
        if (!prefecturaId) return;
        const unidades = UNIDADES_POR_PREFECTURA[prefecturaId] || [];

        setConfigPorUnidad((prev) => {
            const next = {...prev};
            for (const u of unidades) {
                if (!next[u.id]) next[u.id] = defaultUnitSchema();
            }
            return next;
        });

        setUnidadIndex((prev) => {
            const next = {...prev};
            for (const u of unidades) {
                next[u.id] = {siglasUnidad: u.nombre, regionId, prefecturaId};
            }
            return next;
        });

        setQuery("");
        setPage(1);
    }, [prefecturaId, regionId]);

    // Paginación
    const totalPages = Math.max(1, Math.ceil(unidadesFiltradas.length / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return unidadesFiltradas.slice(start, start + pageSize);
    }, [unidadesFiltradas, page]);
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    // Actualiza un campo individual
    const updateUnidadField = (idUnidad, field, value) => {
        setConfigPorUnidad((prev) => ({
            ...prev,
            [idUnidad]: {
                ...(prev[idUnidad] || defaultUnitSchema()),
                [field]: field === "isTercero" ? !!value : clamp(value), // <- no clamping para boolean
            },
        }));
    };

    // Acciones carrito
    const toggleSeleccion = (u) => {
        setSeleccionadas((prev) => {
            const next = {...prev};
            if (next[u.id]) delete next[u.id]; else next[u.id] = true;
            return next;
        });
        setUnidadIndex((prev) => ({...prev, [u.id]: {siglasUnidad: u.nombre, regionId, prefecturaId}}));
        setConfigPorUnidad((prev) => ({...prev, [u.id]: prev[u.id] || defaultUnitSchema()}));
    };

    const agregarVisibles = () => {
        const ids = unidadesFiltradas.map((u) => u.id);
        setSeleccionadas((prev) => {
            const next = {...prev};
            ids.forEach((id) => (next[id] = true));
            return next;
        });
        setUnidadIndex((prev) => {
            const next = {...prev};
            unidadesFiltradas.forEach((u) => (next[u.id] = {siglasUnidad: u.nombre, regionId, prefecturaId}));
            return next;
        });
        setConfigPorUnidad((prev) => {
            const next = {...prev};
            unidadesFiltradas.forEach((u) => {
                if (!next[u.id]) next[u.id] = defaultUnitSchema();
            });
            return next;
        });
    };

    const quitarSeleccion = (idUnidad) => {
        setSeleccionadas((prev) => {
            const next = {...prev};
            delete next[idUnidad];
            return next;
        });
    };

    const limpiarCarrito = () => setSeleccionadas({});

    // Aplicar global
    const aplicarGlobal = (scope = "visibles") => {
        const fuente = scope === "seleccionadas"
            ? Object.keys(seleccionadas)
            : unidadesFiltradas.map((u) => u.id);

        setConfigPorUnidad((prev) => {
            const next = {...prev};
            for (const id of fuente) {
                const actual = next[id] || defaultUnitSchema();
                next[id] = agruparFinDeSemana
                    ? {
                        ...actual,
                        cantidadLunesViernes: clamp(globalCfg.cantidadLunesViernes),
                        cantidadSabado: clamp(globalCfg.finde),
                        cantidadDomingo: clamp(globalCfg.finde),
                        cantidadFestivo: clamp(globalCfg.cantidadFestivo)
                    }
                    : {
                        ...actual,
                        cantidadLunesViernes: clamp(globalCfg.cantidadLunesViernes),
                        cantidadSabado: clamp(globalCfg.cantidadSabado),
                        cantidadDomingo: clamp(globalCfg.cantidadDomingo),
                        cantidadFestivo: clamp(globalCfg.cantidadFestivo)
                    };
            }
            return next;
        });
    };

    // Guardar: arma payload SOLO con carrito
    const handleGuardar = () => {
        const seleccionIds = Object.keys(seleccionadas);
        const unidadesPayload = seleccionIds.map((idUnidad) => {
            const cfg = configPorUnidad[idUnidad] || defaultUnitSchema();
            const meta = unidadIndex[idUnidad] || {};
            return {
                idUnidad,
                siglasUnidad: meta.siglasUnidad ?? "(desconocida)",
                regionId: meta.regionId ?? regionId,
                prefecturaId: meta.prefecturaId ?? prefecturaId,
                ...cfg,
            };
        });

        const payload = {
            calendarioId: idCalendario,
            agruparFinDeSemana,
            unidades: unidadesPayload,
        };


        onSave?.(payload);
        onHide?.();
    };

    // Métricas
    const totalSeleccionadas = Object.keys(seleccionadas).length;

    return (
        <Modal show={show} onHide={onHide} fullscreen scrollable>
            <Modal.Header closeButton className="bg-light py-2">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <span>Configurar unidades colaboradoras</span>
                    <Badge bg="secondary" pill>{unidadesFiltradas.length} unidades</Badge>
                    <Badge bg="primary" pill>{totalSeleccionadas} seleccionadas</Badge>
                    <div className="small text-muted ms-2">Calendario #{idCalendario ?? "-"}</div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="py-2">
                <Row className="g-2">
                    {/* COLUMNA IZQUIERDA: Filtros + Global + Tabla */}
                    <Col md={8} lg={9}>
                        {/* Filtros (compacto) */}
                        <div className="mb-2 p-2 border rounded-3">
                            <Row className="g-2 align-items-end">
                                <Col md={4} sm={6} xs={12}>
                                    <Form.Label className="fw-semibold small mb-1">Región</Form.Label>
                                    <Form.Select size="sm" value={regionId}
                                                 onChange={(e) => setRegionId(e.target.value)}>
                                        <option value="">Seleccione región...</option>
                                        {REGIONES.map((r) => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={5} sm={6} xs={12}>
                                    <Form.Label className="fw-semibold small mb-1">Prefectura</Form.Label>
                                    <Form.Select size="sm" value={prefecturaId}
                                                 onChange={(e) => setPrefecturaId(e.target.value)} disabled={!regionId}>
                                        <option value="">Seleccione prefectura...</option>
                                        {prefecturas.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3} xs={12}>
                                    <Form.Label className="fw-semibold small mb-1">Buscar unidad</Form.Label>
                                    <InputGroup size="sm">
                                        <InputGroup.Text>🔎</InputGroup.Text>
                                        <Form.Control placeholder="Nombre de unidad" value={query}
                                                      onChange={(e) => setQuery(e.target.value)}
                                                      disabled={!prefecturaId}/>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </div>

                        {/* Panel Global (compacto) */}
                        <div className="mb-2 p-2 border rounded-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="fw-semibold">Configuración global</div>
                                <Form.Check type="switch" id="switch-usar-global" label="Habilitar" checked={usarGlobal}
                                            onChange={(e) => setUsarGlobal(e.target.checked)}/>
                            </div>

                            <Row className="g-2">
                                <Col md={3} sm={6} xs={6}>
                                    <Form.Label className="small mb-1">Lun–Vie</Form.Label>
                                    <Form.Control size="sm" type="number" min={0} value={globalCfg.cantidadLunesViernes}
                                                  onChange={(e) => setGlobalCfg({
                                                      ...globalCfg,
                                                      cantidadLunesViernes: parseNumber(e)
                                                  })} disabled={!usarGlobal}/>
                                </Col>

                                <Col md={3} sm={6} xs={6}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Form.Label className="small mb-1">Fin de semana</Form.Label>
                                        <Form.Check type="switch" id="switch-weekend-group" label="Agrupar"
                                                    checked={agruparFinDeSemana}
                                                    onChange={(e) => setAgruparFinDeSemana(e.target.checked)}
                                                    disabled={!usarGlobal}/>
                                    </div>
                                    <Form.Control size="sm" type="number" min={0} className="mt-1"
                                                  value={globalCfg.finde}
                                                  onChange={(e) => setGlobalCfg({...globalCfg, finde: parseNumber(e)})}
                                                  disabled={!usarGlobal || !agruparFinDeSemana} placeholder="Sáb+Dom"/>
                                </Col>

                                {!agruparFinDeSemana && (
                                    <>
                                        <Col md={3} sm={6} xs={6}>
                                            <Form.Label className="small mb-1">Sábado</Form.Label>
                                            <Form.Control size="sm" type="number" min={0}
                                                          value={globalCfg.cantidadSabado}
                                                          onChange={(e) => setGlobalCfg({
                                                              ...globalCfg,
                                                              cantidadSabado: parseNumber(e)
                                                          })} disabled={!usarGlobal}/>
                                        </Col>
                                        <Col md={3} sm={6} xs={6}>
                                            <Form.Label className="small mb-1">Domingo</Form.Label>
                                            <Form.Control size="sm" type="number" min={0}
                                                          value={globalCfg.cantidadDomingo}
                                                          onChange={(e) => setGlobalCfg({
                                                              ...globalCfg,
                                                              cantidadDomingo: parseNumber(e)
                                                          })} disabled={!usarGlobal}/>
                                        </Col>
                                    </>
                                )}

                                <Col md={3} sm={6} xs={6}>
                                    <Form.Label className="small mb-1">Festivos</Form.Label>
                                    <Form.Control size="sm" type="number" min={0} value={globalCfg.cantidadFestivo}
                                                  onChange={(e) => setGlobalCfg({
                                                      ...globalCfg,
                                                      cantidadFestivo: parseNumber(e)
                                                  })} disabled={!usarGlobal}/>
                                </Col>
                            </Row>

                            <div className="mt-2 d-flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => aplicarGlobal("visibles")}
                                        disabled={!usarGlobal || !prefecturaId}>
                                    Aplicar a visibles ({unidadesFiltradas.length})
                                </Button>
                                <Button size="sm" variant="outline-success"
                                        onClick={() => aplicarGlobal("seleccionadas")}
                                        disabled={!usarGlobal || totalSeleccionadas === 0}>
                                    Aplicar a seleccionadas ({totalSeleccionadas})
                                </Button>
                            </div>
                        </div>

                        {/* Tabla de Unidades (compacta) */}
                        <div className="p-2 border rounded-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="fw-semibold">Unidades ({unidadesFiltradas.length})</div>
                                {totalPages > 1 && (
                                    <Pagination size="sm" className="mb-0">
                                        <Pagination.First onClick={() => setPage(1)} disabled={page === 1}/>
                                        <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                         disabled={page === 1}/>
                                        <Pagination.Item active>{page}</Pagination.Item>
                                        <Pagination.Next onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                         disabled={page === totalPages}/>
                                        <Pagination.Last onClick={() => setPage(totalPages)}
                                                         disabled={page === totalPages}/>
                                    </Pagination>
                                )}
                            </div>

                            <Table responsive hover size="sm" className="align-middle mb-2">
                                <thead className="table-light">
                                <tr>
                                    <th style={{minWidth: 240}}>Unidad</th>
                                    <th style={{width: 100}}>L–V</th>
                                    <th style={{width: 100}}>Sáb</th>
                                    <th style={{width: 100}}>Dom</th>
                                    <th style={{width: 110}}>Festivos</th>
                                    <th style={{width: 110}}>¿Nocturno?</th>
                                    {/* nueva */}
                                    <th style={{width: 120}}>Acciones</th>
                                    {/* nueva */}
                                    <th style={{width: 120}}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageItems.map((u) => {
                                    const cfg = configPorUnidad[u.id] || defaultUnitSchema();
                                    const inCart = !!seleccionadas[u.id];
                                    return (
                                        <tr key={u.id}>
                                            <td className="fw-semibold">
                                                {u.nombre}
                                                <div className="small text-muted">{prefecturaId}</div>
                                            </td>
                                            <td>
                                                <Form.Control size="sm" type="number" min={0}
                                                              value={cfg.cantidadLunesViernes}
                                                              onChange={(e) => updateUnidadField(u.id, "cantidadLunesViernes", parseNumber(e))}/>
                                            </td>
                                            <td>
                                                <Form.Control size="sm" type="number" min={0} value={cfg.cantidadSabado}
                                                              onChange={(e) => updateUnidadField(u.id, "cantidadSabado", parseNumber(e))}/>
                                            </td>
                                            <td>
                                                <Form.Control size="sm" type="number" min={0}
                                                              value={cfg.cantidadDomingo}
                                                              onChange={(e) => updateUnidadField(u.id, "cantidadDomingo", parseNumber(e))}/>
                                            </td>
                                            <td>
                                                <Form.Control size="sm" type="number" min={0}
                                                              value={cfg.cantidadFestivo}
                                                              onChange={(e) => updateUnidadField(u.id, "cantidadFestivo", parseNumber(e))}/>
                                            </td>
                                            <td>
                                                <Form.Check size={"sm"} type="checkbox" label="Nocturno"
                                                            checked={!!(configPorUnidad[u.id]?.isTercero)}
                                                            onChange={(e) => updateUnidadField(u.id, "isTercero", e.target.checked)}/>
                                            </td>
                                            <td className="text-end">
                                                <Button size="sm"
                                                        variant={inCart ? "outline-danger" : "outline-primary"}
                                                        onClick={() => toggleSeleccion(u)}>
                                                    {inCart ? "Quitar" : "Agregar"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!prefecturaId && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            Selecciona Región y Prefectura para listar unidades.
                                        </td>
                                    </tr>
                                )}
                                {prefecturaId && unidadesFiltradas.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">Sin resultados para este
                                            filtro.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-end">
                                <Button size="sm" variant="outline-secondary" onClick={agregarVisibles}
                                        disabled={!prefecturaId || unidadesFiltradas.length === 0}>
                                    Agregar todas las visibles
                                </Button>
                            </div>
                        </div>
                    </Col>

                    {/* COLUMNA DERECHA: Carrito */}
                    <Col md={4} lg={3}>
                        <div className="p-2 border rounded-3 h-100 d-flex flex-column" style={{minHeight: 300}}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="fw-semibold">Unidades seleccionadas</div>
                                <Badge bg={totalSeleccionadas ? "primary" : "secondary"} pill>
                                    {totalSeleccionadas}
                                </Badge>
                            </div>

                            {totalSeleccionadas === 0 ? (
                                <Alert variant="light" className="py-2 mb-2">
                                    Aún no agregas unidades. Usa "Agregar" o "Agregar visibles".
                                </Alert>
                            ) : null}

                            <div className="flex-grow-1 overflow-auto" style={{maxHeight: 420}}>
                                <Stack gap={1}>
                                    {Object.keys(seleccionadas).map((idUnidad) => {
                                        const meta = unidadIndex[idUnidad] || {};
                                        const cfg = configPorUnidad[idUnidad] || defaultUnitSchema();
                                        return (
                                            <div key={idUnidad} className="border rounded-3 p-2 position-relative">
                                                <div className="d-flex align-items-start justify-content-between">
                                                    <div>
                                                        <div
                                                            className="fw-semibold small">{meta.siglasUnidad || idUnidad}</div>
                                                        <div className="text-muted small">{meta.prefecturaId} ·
                                                            Región {meta.regionId}</div>
                                                    </div>
                                                    <CloseButton onClick={() => quitarSeleccion(idUnidad)}/>
                                                </div>
                                                <div className="mt-2 small">
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <Badge bg="secondary">L–V: {cfg.cantidadLunesViernes}</Badge>
                                                        <Badge bg="secondary">Sáb: {cfg.cantidadSabado}</Badge>
                                                        <Badge bg="secondary">Dom: {cfg.cantidadDomingo}</Badge>
                                                        <Badge bg="secondary">Fest: {cfg.cantidadFestivo}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </Stack>
                            </div>

                            <div className="mt-2 d-flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline-danger" onClick={limpiarCarrito}
                                        disabled={totalSeleccionadas === 0}>
                                    Limpiar selección
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer className="py-2 d-flex justify-content-between">
                <div className="text-muted small">Solo se guardarán las unidades del carrito.</div>
                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={onHide}>Cancelar</Button>
                    <Button size="sm" variant="primary" onClick={handleGuardar}
                            disabled={Object.keys(seleccionadas).length === 0}>
                        Guardar configuración
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
