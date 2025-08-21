// ./ConfigurarUnidadesAportantesModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Table,
    InputGroup,
    Badge,
    Pagination,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";

/* ------------
   Datos mock
   ------------ */
const REGIONES = [
    { id: "01", nombre: "Arica y Parinacota" },
    { id: "02", nombre: "Tarapacá" },
    { id: "03", nombre: "Antofagasta" },
    { id: "04", nombre: "Atacama" },
    { id: "05", nombre: "Coquimbo" },
    { id: "06", nombre: "Valparaíso" },
    { id: "07", nombre: "Metropolitana de Santiago" },
    { id: "08", nombre: "O'Higgins" },
    { id: "09", nombre: "Maule" },
    { id: "10", nombre: "Ñuble" },
    { id: "11", nombre: "Biobío" },
    { id: "12", nombre: "La Araucanía" },
    { id: "13", nombre: "Los Ríos" },
    { id: "14", nombre: "Los Lagos" },
    { id: "15", nombre: "Aysén" },
    { id: "16", nombre: "Magallanes y Antártica Chilena" },
];

// Prefecturas por región (mock). En tu app real, vendrá de BD/API.
const PREFECTURAS_POR_REGION = {
    "07": [
        { id: "P7-1", nombre: "Prefectura Santiago Centro" },
        { id: "P7-2", nombre: "Prefectura Cordillera" },
        { id: "P7-3", nombre: "Prefectura Maipo" },
    ],
    "11": [
        { id: "P11-1", nombre: "Prefectura Concepción" },
        { id: "P11-2", nombre: "Prefectura Biobío" },
        { id: "P11-3", nombre: "Prefectura Arauco" },
    ],
    "02": [
        { id: "P2-1", nombre: "Prefectura Iquique" },
        { id: "P2-2", nombre: "Prefectura Tamarugal" },
    ],
};

// Unidades mock por prefectura
const UNIDADES_POR_PREFECTURA = {
    "P7-1": [
        { id: "U-001", nombre: "BICRIM Santiago Centro" },
        { id: "U-002", nombre: "BRIDEC Santiago" },
        { id: "U-003", nombre: "JENADEP Santiago" },
        { id: "U-004", nombre: "MT-Centro" },
    ],
    "P7-2": [
        { id: "U-101", nombre: "BICRIM Puente Alto" },
        { id: "U-102", nombre: "BRIDEC Puente Alto" },
    ],
    "P7-3": [
        { id: "U-201", nombre: "BICRIM San Bernardo" },
        { id: "U-202", nombre: "BRIDEC San Bernardo" },
    ],
    "P11-1": [
        { id: "U-301", nombre: "BICRIM Concepción" },
        { id: "U-302", nombre: "BRIDEC Concepción" },
        { id: "U-303", nombre: "Biro Robo Concepción" },
        { id: "U-304", nombre: "Biro MT Concepción" },
        { id: "U-305", nombre: "Biro Económica Concepción" },
    ],
    "P11-2": [
        { id: "U-401", nombre: "BICRIM Los Ángeles" },
        { id: "U-402", nombre: "BRIDEC Los Ángeles" },
    ],
    "P11-3": [
        { id: "U-501", nombre: "BICRIM Cañete" },
        { id: "U-502", nombre: "BRIDEC Lebu" },
        { id: "U-503", nombre: "BICRIM Arauco" },
    ],
    "P2-1": [
        { id: "U-601", nombre: "BICRIM Iquique" },
        { id: "U-602", nombre: "BRIDEC Iquique" },
    ],
    "P2-2": [
        { id: "U-701", nombre: "BICRIM Pozo Almonte" },
    ],
};

/* -----------------------------
   Helpers y defaults de esquema
   ----------------------------- */
const defaultUnitSchema = () => ({
    lunesAViernes: 0,
    sabado: 0,
    domingo: 0,
    festivo: 0,
});

const clamp = (n) => Math.max(0, Number.isFinite(n) ? n : 0);

function numberInputValue(e) {
    const v = parseInt(e.target.value, 10);
    return Number.isNaN(v) ? 0 : clamp(v);
}

/* ---------------------------------------------------
   Componente principal: ConfigurarUnidadesAportantes
   --------------------------------------------------- */
export default function ConfigurarProcepolModal({
                                                              show,
                                                              onHide,
                                                              idCalendario,
                                                              onSave, // opcional: callback para entregar payload al padre
                                                          }) {
    // Filtros
    const [regionId, setRegionId] = useState("");
    const [prefecturaId, setPrefecturaId] = useState("");

    // UI Search y paginación
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Datos visibles (derivados de filtros)
    const prefecturas = useMemo(
        () => (regionId ? PREFECTURAS_POR_REGION[regionId] || [] : []),
        [regionId]
    );

    const unidadesBase = useMemo(
        () => (prefecturaId ? UNIDADES_POR_PREFECTURA[prefecturaId] || [] : []),
        [prefecturaId]
    );

    const unidadesFiltradas = useMemo(() => {
        if (!query) return unidadesBase;
        const q = query.toLowerCase();
        return unidadesBase.filter((u) => u.nombre.toLowerCase().includes(q));
    }, [unidadesBase, query]);

    // Estado de configuraciones por unidad
    const [configPorUnidad, setConfigPorUnidad] = useState({});
    // Estado global
    const [usarGlobal, setUsarGlobal] = useState(false);
    const [agruparFinDeSemana, setAgruparFinDeSemana] = useState(false);
    const [globalCfg, setGlobalCfg] = useState({
        lunesAViernes: 0,
        sabado: 0,
        domingo: 0,
        festivo: 0,
        finde: 0, // usado solo si agruparFinDeSemana = true
    });

    // Limpiar prefectura/unidades al cambiar región
    useEffect(() => {
        setPrefecturaId("");
        setQuery("");
        setPage(1);
    }, [regionId]);

    // Al cambiar prefectura, inicializar configuraciones si no existen
    useEffect(() => {
        if (!prefecturaId) return;
        const unidades = UNIDADES_POR_PREFECTURA[prefecturaId] || [];
        setConfigPorUnidad((prev) => {
            const next = { ...prev };
            for (const u of unidades) {
                if (!next[u.id]) next[u.id] = defaultUnitSchema();
            }
            return next;
        });
        setQuery("");
        setPage(1);
    }, [prefecturaId]);

    // Aplicar global a todas las unidades visibles
    const aplicarGlobal = () => {
        if (!unidadesFiltradas.length) return;
        setConfigPorUnidad((prev) => {
            const next = { ...prev };
            for (const u of unidadesFiltradas) {
                if (!next[u.id]) next[u.id] = defaultUnitSchema();
                if (agruparFinDeSemana) {
                    next[u.id] = {
                        ...next[u.id],
                        lunesAViernes: clamp(globalCfg.lunesAViernes),
                        sabado: clamp(globalCfg.finde),
                        domingo: clamp(globalCfg.finde),
                        festivo: clamp(globalCfg.festivo),
                    };
                } else {
                    next[u.id] = {
                        ...next[u.id],
                        lunesAViernes: clamp(globalCfg.lunesAViernes),
                        sabado: clamp(globalCfg.sabado),
                        domingo: clamp(globalCfg.domingo),
                        festivo: clamp(globalCfg.festivo),
                    };
                }
            }
            return next;
        });
    };

    // Cambiar una unidad individual
    const updateUnidadField = (unidadId, field, value) => {
        setConfigPorUnidad((prev) => ({
            ...prev,
            [unidadId]: {
                ...(prev[unidadId] || defaultUnitSchema()),
                [field]: clamp(value),
            },
        }));
    };

    // Paginación
    const totalPages = Math.max(1, Math.ceil(unidadesFiltradas.length / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return unidadesFiltradas.slice(start, start + pageSize);
    }, [unidadesFiltradas, page]);

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    // Guardar (solo UI: log + callback opcional)
    const handleGuardar = () => {
        // construimos un payload simple para posterior POST
        const payload = {
            calendarioId: idCalendario,
            regionId,
            prefecturaId,
            agruparFinDeSemana,
            unidades: unidadesFiltradas.map((u) => ({
                unidadId: u.id,
                unidadNombre: u.nombre,
                ...configPorUnidad[u.id],
            })),
        };
        console.log("Payload de aportes:", payload);
        if (typeof onSave === "function") onSave(payload);
        onHide?.();
    };

    const resetConfig = () => {
        setConfigPorUnidad({});
        if (prefecturaId) {
            const unidades = UNIDADES_POR_PREFECTURA[prefecturaId] || [];
            setConfigPorUnidad(
                Object.fromEntries(unidades.map((u) => [u.id, defaultUnitSchema()]))
            );
        }
    };

    const headerBadge = (
        <Badge bg="secondary" pill>
            {unidadesFiltradas.length} unidad{unidadesFiltradas.length === 1 ? "" : "es"}
        </Badge>
    );

    return (
        <Modal show={show} onHide={onHide} fullscreen scrollable>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>
                    Configurar unidades colaboradoras {headerBadge}
                    <div className="small text-muted">
                        Calendario #{idCalendario ?? "-"}
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Filtros */}
                <div className="mb-3 p-3 border rounded-3">
                    <Row className="g-2 align-items-end">
                        <Col md={4}>
                            <Form.Label className="fw-semibold">Región</Form.Label>
                            <Form.Select
                                value={regionId}
                                onChange={(e) => setRegionId(e.target.value)}
                            >
                                <option value="">Seleccione región...</option>
                                {REGIONES.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={5}>
                            <Form.Label className="fw-semibold">Prefectura</Form.Label>
                            <Form.Select
                                value={prefecturaId}
                                onChange={(e) => setPrefecturaId(e.target.value)}
                                disabled={!regionId}
                            >
                                <option value="">Seleccione prefectura...</option>
                                {prefecturas.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label className="fw-semibold">Buscar unidad</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>🔎</InputGroup.Text>
                                <Form.Control
                                    placeholder="Nombre de unidad"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={!prefecturaId}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </div>

                {/* Panel Global */}
                <div className="mb-3 p-3 border rounded-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="fw-semibold">Configuración global (aplicar a unidades visibles)</div>
                        <Form.Check
                            type="switch"
                            id="switch-usar-global"
                            label="Habilitar"
                            checked={usarGlobal}
                            onChange={(e) => setUsarGlobal(e.target.checked)}
                        />
                    </div>

                    <Row className="g-2 mt-2">
                        <Col md={3}>
                            <Form.Label>Lun–Vie</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                value={globalCfg.lunesAViernes}
                                onChange={(e) =>
                                    setGlobalCfg({ ...globalCfg, lunesAViernes: numberInputValue(e) })
                                }
                                disabled={!usarGlobal}
                            />
                        </Col>

                        <Col md={3}>
                            <div className="d-flex align-items-center justify-content-between">
                                <Form.Label className="mb-0">Fin de semana</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="switch-weekend-group"
                                    label="Agrupar Sáb+Dom"
                                    checked={agruparFinDeSemana}
                                    onChange={(e) => setAgruparFinDeSemana(e.target.checked)}
                                    disabled={!usarGlobal}
                                />
                            </div>
                            <Form.Control
                                type="number"
                                min={0}
                                className="mt-1"
                                value={globalCfg.finde}
                                onChange={(e) =>
                                    setGlobalCfg({ ...globalCfg, finde: numberInputValue(e) })
                                }
                                disabled={!usarGlobal || !agruparFinDeSemana}
                                placeholder="Sáb+Dom"
                            />
                        </Col>

                        {!agruparFinDeSemana && (
                            <>
                                <Col md={3}>
                                    <Form.Label>Sábados</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={globalCfg.sabado}
                                        onChange={(e) =>
                                            setGlobalCfg({ ...globalCfg, sabado: numberInputValue(e) })
                                        }
                                        disabled={!usarGlobal}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Domingos</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        value={globalCfg.domingo}
                                        onChange={(e) =>
                                            setGlobalCfg({ ...globalCfg, domingo: numberInputValue(e) })
                                        }
                                        disabled={!usarGlobal}
                                    />
                                </Col>
                            </>
                        )}

                        <Col md={3}>
                            <Form.Label>Festivos</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                value={globalCfg.festivo}
                                onChange={(e) =>
                                    setGlobalCfg({ ...globalCfg, festivo: numberInputValue(e) })
                                }
                                disabled={!usarGlobal}
                            />
                        </Col>
                    </Row>

                    <div className="mt-3 d-flex gap-2">
                        <Button
                            variant="outline-primary"
                            onClick={aplicarGlobal}
                            disabled={!usarGlobal || !prefecturaId}
                        >
                            Aplicar a {unidadesFiltradas.length} unidad
                            {unidadesFiltradas.length === 1 ? "" : "es"} visibles
                        </Button>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Deja en cero todas las cantidades</Tooltip>}
                        >
                            <Button variant="outline-secondary" onClick={resetConfig} disabled={!prefecturaId}>
                                Reiniciar visibles
                            </Button>
                        </OverlayTrigger>
                    </div>
                </div>

                {/* Tabla de Unidades */}
                <div className="p-3 border rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-semibold">
                            Unidades ({unidadesFiltradas.length})
                        </div>
                        {totalPages > 1 && (
                            <Pagination size="sm" className="mb-0">
                                <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                                <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
                                <Pagination.Item active>{page}</Pagination.Item>
                                <Pagination.Next
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                />
                                <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
                            </Pagination>
                        )}
                    </div>

                    <Table responsive hover size="sm" className="align-middle">
                        <thead className="table-light">
                        <tr>
                            <th style={{ minWidth: 260 }}>Unidad</th>
                            <th style={{ width: 120 }}>Lun–Vie</th>
                            <th style={{ width: 120 }}>Sábado</th>
                            <th style={{ width: 120 }}>Domingo</th>
                            <th style={{ width: 120 }}>
                                Festivo{" "}
                                <span className="text-muted small">(independiente)</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {pageItems.map((u) => {
                            const cfg = configPorUnidad[u.id] || defaultUnitSchema();
                            return (
                                <tr key={u.id}>
                                    <td className="fw-semibold">{u.nombre}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            value={cfg.lunesAViernes}
                                            onChange={(e) =>
                                                updateUnidadField(u.id, "lunesAViernes", numberInputValue(e))
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            value={cfg.sabado}
                                            onChange={(e) =>
                                                updateUnidadField(u.id, "sabado", numberInputValue(e))
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            value={cfg.domingo}
                                            onChange={(e) =>
                                                updateUnidadField(u.id, "domingo", numberInputValue(e))
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            value={cfg.festivo}
                                            onChange={(e) =>
                                                updateUnidadField(u.id, "festivo", numberInputValue(e))
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}

                        {!prefecturaId && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                    Selecciona Región y Prefectura para listar unidades.
                                </td>
                            </tr>
                        )}
                        {prefecturaId && unidadesFiltradas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                    Sin resultados para este filtro.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
                <div className="text-muted small">
                    Los nombres en el resultado serán los de las unidades listadas.
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGuardar}
                        disabled={!prefecturaId || unidadesFiltradas.length === 0}
                    >
                        Guardar configuración
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
