// AuditoriaMemos.jsx
import React, {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    InputGroup,
    ListGroup,
    Modal,
    Row,
    Spinner,
    Tab,
    Table,
    Tabs,
} from "react-bootstrap";
import {getRegionesUnidades, getUnidadesByRegion} from "../../api/commonServicesApi.js";
import {consultaMemosServiciosEspeciales} from "../../api/nodosApi.js";

/* ------------------ Config UI y helpers ------------------ */

const estadoColors = {
    PENDIENTE: "secondary",
    APROBADO: "success",
    OBSERVADO: "warning",
    RECHAZADO: "danger",
};

const tipoMemos = [
    {value: "MEMORANDO DILIGENCIAS"},
    {value: "CONCURRENCIAS HOMICIDIOS"},
    {value: "MEMORANDO CONCURRENCIAS"},
    {value: "DILIGENCIAS HOMICIDIOS"},
];

const toUTCISO = (str) => (str ? new Date(str).toISOString() : null);

const clamp2 = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
};

const stickyTh = {
    position: "sticky",
    top: 0,
    background: "var(--bs-body-bg)",
    zIndex: 1,
};

/* ------------------ Normalización de datos ------------------ */

const normalizeMemo = (m) => {
    const fecha = m.fecha ? new Date(m.fecha) : null;

    const personas = (m.fichaPersonas || []).map((p) => ({
        id: p.id ?? `${m.id}-persona-${p.rut || Math.random()}`,
        rut: p.rut || "",
        nombre: [p.nombre, p.apellidoPat, p.apellidoMat].filter(Boolean).join(" ") || "",
    }));

    const drogas = (m.fichaDrogas || []).map((d, idx) => ({
        id: d.id ?? `${m.id}-droga-${idx}`,
        tipo: d.tipoDroga,
        cantidad: d.cantidadDroga,
        unidad: d.unidadMedida,
        obs: d.obs || "",
    }));

    const funcionarios = (m.fichaFuncionarios || []).map((f, idx) => ({
        id: f.id ?? `${m.id}-func-${idx}`,
        nombre: f.funcionario,
        responsabilidad: f.responsabilidadMemo,
    }));

    const vehiculos = (m.fichaVehiculos || []).map((v, idx) => ({
        id: v.id ?? `${m.id}-veh-${idx}`,
        patente: v.patente || v.ppu || "",
        marca: [v.marca, v.modelo].filter(Boolean).join(" "),
    }));

    const relatoPlano = (m.modusDescripcion || "").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();

    return {
        id: m.id,
        fecha: fecha ? fecha.toLocaleString("es-CL", {timeZone: "America/Santiago"}) : "—",
        _fechaSort: fecha ? fecha.getTime() : 0,
        tipo: m.formulario || "—",
        folio: m.folioBrain || "—",
        ruc: m.ruc || "—",
        unidad: m.unidad?.nombreUnidad || "—",
        estado: m.estado || "PENDIENTE",
        relato: relatoPlano,

        personas,
        drogas,
        funcionarios,
        vehiculos,
        armas: m.fichaArmas || [],
        dineros: m.fichaDineros || [],
        municiones: m.fichaMuniciones || [],
        issues: m.issues || [],
        _raw: m,
    };
};

/* ------------------ Componente principal ------------------ */

export default function AuditoriaMemos() {

    console.log(import.meta.env.VITE_MODE_ACTUAL)

    const [selected, setSelected] = useState(null);
    const [regiones, setRegiones] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [regionSeleccionada, setRegionSeleccionada] = useState("");
    const [memos, setMemos] = useState([]);

    const [payload, setPayload] = useState({
        region: "",
        unidad: "",
        tipoMemo: "MEMORANDO DILIGENCIAS",
        fechaInicio: "",
        fechaTermino: "",
    });

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // UI state
    const [showFilters, setShowFilters] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState({by: "_fechaSort", dir: "desc"}); // default: fecha desc

    /* ------------------ Efectos de carga ------------------ */

    useEffect(() => {
        getRegionesUnidades().then((res) => {
            const corregido = (res || []).map((r) => ({
                value: r,
                label: r === "REGIÓN DEL ÑUBLE" ? "REGIÓN DE ÑUBLE" : r,
            }));
            setRegiones(corregido);
        });
    }, []);

    useEffect(() => {
        if (regionSeleccionada) {
            getUnidadesByRegion(regionSeleccionada)
                .then((lista) => setUnidades(lista || []))
                .catch(() => setUnidades([]));
        } else {
            setUnidades([]);
        }
    }, [regionSeleccionada]);

    /* ------------------ Handlers ------------------ */

    const handleChange = (e) => {
        const {name, value} = e.target;
        setPayload((prev) => ({...prev, [name]: value}));
    };

    const handleFiltrar = async () => {
        const filtros = {
            region: payload.region || null,
            unidad: payload.unidad || null,
            tipoMemo: payload.tipoMemo || null,
            fechaInicioUtc: toUTCISO(payload.fechaInicio),
            fechaTerminoUtc: toUTCISO(payload.fechaTermino),
        };

        setLoading(true);
        setErr(null);
        setSelected(null);
        console.log(filtros)
        try {
            const data = await consultaMemosServiciosEspeciales(filtros);
            const normalizados = (data || []).map(normalizeMemo);
            setMemos(normalizados);
            setPage(1);
        } catch (e) {
            console.error(e);
            setErr("No se pudo cargar la información. Inténtalo nuevamente.");
            setMemos([]);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setPayload({region: "", unidad: "", tipoMemo: "MEMORANDO DILIGENCIAS", fechaInicio: "", fechaTermino: ""});
        setRegionSeleccionada("");
        setSearch("");
        setMemos([]);
        setPage(1);
        setSelected(null);
    };

    const toggleSort = (by) => {
        setSort((prev) => {
            if (prev.by === by) {
                // alterna asc/desc
                return {by, dir: prev.dir === "asc" ? "desc" : "asc"};
            }
            return {by, dir: "asc"};
        });
    };

    const exportCsv = () => {
        const headers = ["ID", "Fecha", "Tipo", "Folio", "RUC", "Unidad", "Estado", "Relato"];
        const rows = filteredSorted.map((m) => [
            m.id,
            m.fecha,
            m.tipo,
            m.folio,
            m.ruc,
            m.unidad,
            m.estado,
            m.relato?.replace(/"/g, '""') || "",
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.map((c) => (typeof c === "string" && c.includes(",") ? `"${c}"` : c)).join(","))].join("\n");
        const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `auditoria_memos_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (_) {
            /* noop */
        }
    };

    /* ------------------ Derivados (search, sort, paginate) ------------------ */

    const filteredSorted = useMemo(() => {
        const q = search.trim().toLowerCase();
        let arr = memos;

        if (q) {
            arr = arr.filter((m) => {
                const hay =
                    String(m.id).includes(q) ||
                    (m.folio || "").toLowerCase().includes(q) ||
                    (m.ruc || "").toLowerCase().includes(q) ||
                    (m.unidad || "").toLowerCase().includes(q) ||
                    (m.tipo || "").toLowerCase().includes(q) ||
                    (m.relato || "").toLowerCase().includes(q);
                return hay;
            });
        }

        arr = arr.slice().sort((a, b) => {
            const dir = sort.dir === "asc" ? 1 : -1;
            const va = a[sort.by] ?? "";
            const vb = b[sort.by] ?? "";
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });

        return arr;
    }, [memos, search, sort]);

    const total = filteredSorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredSorted.slice(start, start + pageSize);
    }, [filteredSorted, page, pageSize]);

    /* ------------------ Render ------------------ */

    return (
        <Container fluid className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h4 className="mb-0">📋 Auditoría de Memos</h4>
                    <small className="text-muted">Revisa, busca y gestiona memos filtrados por región, unidad y rango de
                        fechas.</small>
                </div>
                <div className="d-flex gap-2">
                    <Button variant={showFilters ? "outline-secondary" : "secondary"} size="sm"
                            onClick={() => setShowFilters((s) => !s)}>
                        {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={clearFilters}>Limpiar</Button>
                    <Button variant="primary" size="sm" onClick={handleFiltrar}>Filtrar</Button>
                </div>
            </div>

            {showFilters && (
                <Card className="mb-3">
                    <Card.Body>
                        <Row className="g-2">
                            <Col md={3}>
                                <Form.Label className="mb-1">Región</Form.Label>
                                <Form.Select
                                    name="region"
                                    value={payload.region}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setRegionSeleccionada(value);
                                        setPayload((prev) => ({...prev, region: value, unidad: ""}));
                                    }}
                                >
                                    <option value="">— Región —</option>
                                    {regiones.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="mb-1">Unidad</Form.Label>
                                <Form.Select
                                    name="unidad"
                                    value={payload.unidad}
                                    onChange={(e) => setPayload((p) => ({...p, unidad: e.target.value}))}
                                    disabled={!payload.region}
                                >
                                    <option value="">— Unidad —</option>
                                    {unidades.map((u) => (
                                        <option key={u.idUnidad} value={u.nombreUnidad}>
                                            {u.nombreUnidad}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="mb-1">Tipo de memo</Form.Label>
                                <Form.Select name="tipoMemo" value={payload.tipoMemo}
                                             onChange={(e) => setPayload((p) => ({...p, tipoMemo: e.target.value}))}>
                                    {tipoMemos.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.value}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="mb-1">Búsqueda rápida</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>🔎</InputGroup.Text>
                                    <Form.Control
                                        placeholder="ID, folio, RUC, unidad o texto del relato…"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </InputGroup>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="mb-1">Fecha inicio</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="fechaInicio"
                                    value={payload.fechaInicio}
                                    onChange={(e) => setPayload((p) => ({...p, fechaInicio: e.target.value}))}
                                    step="60"
                                />
                            </Col>

                            <Col md={3}>
                                <Form.Label className="mb-1">Fecha término</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="fechaTermino"
                                    value={payload.fechaTermino}
                                    onChange={(e) => setPayload((p) => ({...p, fechaTermino: e.target.value}))}
                                    step="60"
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                    <Badge bg="dark" pill>
                        {total} resultado{total === 1 ? "" : "s"}
                    </Badge>
                    <Form.Select size="sm" value={pageSize} onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                    }}>
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n} por página
                            </option>
                        ))}
                    </Form.Select>
                </div>
                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={handleFiltrar} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border"/> : "Refrescar"}
                    </Button>
                    <Button size="sm" variant="outline-success" onClick={exportCsv} disabled={!total}>
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {err && <Alert variant="danger" className="mb-2">{err}</Alert>}

            <div className="table-responsive" style={{maxHeight: "60vh"}}>
                <Table hover size="sm" className="align-middle">
                    <thead>
                    <tr>
                        <th style={stickyTh} onClick={() => toggleSort("id")} role="button">
                            ID {sort.by === "id" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh} onClick={() => toggleSort("_fechaSort")} role="button">
                            Fecha {sort.by === "_fechaSort" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Tipo</th>
                        <th style={stickyTh} onClick={() => toggleSort("folio")} role="button">
                            Folio {sort.by === "folio" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh} onClick={() => toggleSort("ruc")} role="button">
                            RUC {sort.by === "ruc" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Unidad / Relato</th>
                        <th style={stickyTh} onClick={() => toggleSort("estado")} role="button">
                            Estado {sort.by === "estado" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={8} className="text-center">
                                <Spinner animation="border" size="sm" className="me-2"/>
                                Cargando…
                            </td>
                        </tr>
                    )}

                    {!loading && paged.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                                No hay resultados. Ajusta los filtros o la búsqueda.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        paged.map((m) => (
                            <tr key={m.id}>
                                <td className="text-nowrap">{m.id}</td>
                                <td className="text-nowrap">{m.fecha}</td>
                                <td>
                                    <Badge bg="info" className="text-dark">{m.tipo}</Badge>
                                </td>
                                <td className="text-nowrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{m.folio}</span>
                                        {m.folio !== "—" && (
                                            <Button size="sm" variant="link" className="p-0"
                                                    onClick={() => copy(String(m.folio))} title="Copiar folio">
                                                📋
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td className="text-nowrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{m.ruc}</span>
                                        {m.ruc !== "—" && (
                                            <Button size="sm" variant="link" className="p-0"
                                                    onClick={() => copy(String(m.ruc))} title="Copiar RUC">
                                                📋
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td style={{minWidth: 260}}>
                                    <div className="fw-semibold">{m.unidad}</div>
                                    <div className="text-muted small mt-1" style={clamp2}>
                                        {m.relato}
                                    </div>
                                </td>
                                <td>
                                    <Badge bg={estadoColors[m.estado] || "secondary"}>{m.estado}</Badge>
                                </td>
                                <td className="text-end">
                                    <Button size="sm" variant="outline-primary" onClick={() => setSelected(m)}>
                                        Ver detalle
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Paginación simple */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
                    <Button size="sm" variant="outline-secondary" disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        ← Anterior
                    </Button>
                    <span className="small">
            Página {page} de {totalPages}
          </span>
                    <Button size="sm" variant="outline-secondary" disabled={page === totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                        Siguiente →
                    </Button>
                </div>
            )}

            {/* -------- Modal Detalle -------- */}
            <Modal show={!!selected} onHide={() => setSelected(null)} size="xl" fullscreen="lg-down" centered>
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title className="d-flex align-items-center gap-2">
                                <span>Memo #{selected.id}</span>
                                <Badge bg="info" className="text-dark">{selected.tipo}</Badge>
                                <Badge bg={estadoColors[selected.estado] || "secondary"}>{selected.estado}</Badge>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Card>
                                        <Card.Body>
                                            <div className="mb-2">
                                                <div className="text-muted small">Fecha</div>
                                                <div className="fw-semibold">{selected.fecha}</div>
                                            </div>
                                            <div className="mb-2">
                                                <div className="text-muted small">Unidad</div>
                                                <div className="fw-semibold">{selected.unidad}</div>
                                            </div>
                                            <div className="mb-2">
                                                <div className="text-muted small">Folio / RUC</div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <span><strong>Folio:</strong> {selected.folio}</span>
                                                    <Button size="sm" variant="link" className="p-0"
                                                            onClick={() => copy(String(selected.folio))}>📋</Button>
                                                    <span><strong>RUC:</strong> {selected.ruc}</span>
                                                    <Button size="sm" variant="link" className="p-0"
                                                            onClick={() => copy(String(selected.ruc))}>📋</Button>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card>
                                        <Card.Body>
                                            <div className="mb-2">
                                                <div className="text-muted small">Relato</div>
                                            </div>
                                            {selected.relato ? (
                                                <div className="border rounded p-3" style={{
                                                    whiteSpace: "pre-line",
                                                    maxHeight: 240,
                                                    overflowY: "auto"
                                                }}>
                                                    {selected.relato}
                                                </div>
                                            ) : (
                                                <div className="text-muted">—</div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Tabs defaultActiveKey="personas" className="mt-3">
                                <Tab eventKey="personas" title={`Personas (${selected.personas.length})`}>
                                    {selected.personas.length === 0 ? (
                                        <p className="text-muted">No hay personas asociadas.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.personas.map((p) => (
                                                <ListGroup.Item key={p.id}>
                                                    <div className="fw-semibold">{p.nombre}</div>
                                                    {p.rut && <div className="text-muted small">{p.rut}</div>}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="drogas" title={`Drogas (${selected.drogas.length})`}>
                                    {selected.drogas.length === 0 ? (
                                        <p className="text-muted">No hay drogas.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.drogas.map((d) => (
                                                <ListGroup.Item key={d.id}>
                                                    <div className="fw-semibold">{d.tipo}</div>
                                                    <div className="text-muted small">
                                                        {d.cantidad} {d.unidad} {d.obs ? `· ${d.obs}` : ""}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="funcionarios" title={`Funcionarios (${selected.funcionarios.length})`}>
                                    {selected.funcionarios.length === 0 ? (
                                        <p className="text-muted">No hay funcionarios asociados.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.funcionarios.map((f) => (
                                                <ListGroup.Item key={f.id}>
                                                    <div className="fw-semibold">{f.nombre}</div>
                                                    {f.responsabilidad &&
                                                        <div className="text-muted small">{f.responsabilidad}</div>}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="vehiculos" title={`Vehículos (${selected.vehiculos.length})`}>
                                    {selected.vehiculos.length === 0 ? (
                                        <p className="text-muted">No hay vehículos.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.vehiculos.map((v) => (
                                                <ListGroup.Item key={v.id}>
                                                    <div className="fw-semibold">{v.patente || "Sin patente"}</div>
                                                    <div className="text-muted small">{v.marca}</div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>

                                <Tab eventKey="issues" title={`Observaciones (${selected.issues.length})`}>
                                    {selected.issues.length === 0 ? (
                                        <p className="text-muted">No hay observaciones.</p>
                                    ) : (
                                        <ListGroup className="mt-2">
                                            {selected.issues.map((i) => (
                                                <ListGroup.Item key={i.id}>
                                                    <Badge
                                                        bg={
                                                            i.severidad === "ERROR" ? "danger" : i.severidad === "WARN" ? "warning" : "info"
                                                        }
                                                        className="me-2"
                                                    >
                                                        {i.severidad}
                                                    </Badge>
                                                    <strong>{i.codigo}</strong> — {i.detalle}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="me-auto text-muted small">ID: {selected.id}</div>
                            <Button variant="success" size="sm" onClick={() => alert("Aprobado ✅")}>
                                Aprobar
                            </Button>
                            <Button variant="warning" size="sm" onClick={() => alert("Observado ⚠️")}>
                                Observar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => alert("Rechazado ❌")}>
                                Rechazar
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
}