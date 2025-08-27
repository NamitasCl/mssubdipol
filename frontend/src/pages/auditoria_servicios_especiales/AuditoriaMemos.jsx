// AuditoriaMemos.jsx
import React, {useEffect, useMemo, useState} from "react";
import {Badge, Button, Col, Container, Form, ListGroup, Modal, Row, Tab, Table, Tabs,} from "react-bootstrap";
import {getRegionesUnidades, getUnidadesByRegion} from "../../api/commonServicesApi.js";
import {consultaMemosServiciosEspeciales} from "../../api/nodosApi.js";

// -------------------
// Datos Mock
// -------------------
const MOCK_MEMOS = [
    {
        id: 1,
        // Si tu backend trae fecha UTC como ISO con Z, puedes agregar:
        // fechaUtc: "2025-08-20T16:00:00Z",
        fecha: "2025-08-20",
        tipo: "Detención",
        folioBrain: "FB123",
        ruc: "RUC-111",
        unidad: "BRIGADA CRIM LOS ANDES",
        region: "Valparaíso",
        comuna: "Los Andes",
        estado: "PENDIENTE",
        personas: [
            {id: 10, rut: "12.345.678-9", nombre: "Juan Pérez"},
            {id: 11, rut: "22.333.444-5", nombre: "Ana Soto"},
        ],
        armas: [{id: 20, tipo: "Pistola", calibre: "9mm"}],
        drogas: [],
        vehiculos: [{id: 30, patente: "ABCD12", marca: "Toyota"}],
        issues: [
            {id: 100, severidad: "ERROR", codigo: "FALTA_UNIDAD", detalle: "El memo no tiene unidad asociada"},
            {id: 101, severidad: "WARN", codigo: "RUT_FORMATO", detalle: "RUT con formato inválido: 22.333.444-5"},
        ],
    },
    {
        id: 2,
        // fechaUtc: "2025-08-21T02:00:00Z",
        fecha: "2025-08-21",
        tipo: "Incautación",
        folioBrain: "FB999",
        ruc: "RUC-222",
        unidad: "BRIGADA CRIM IQUIQUE",
        region: "Tarapacá",
        comuna: "Iquique",
        estado: "APROBADO",
        personas: [],
        armas: [],
        drogas: [{id: 40, tipo: "Cocaína", cantidad: "2 kg"}],
        vehiculos: [],
        issues: [],
    },
];

// Colores de estado
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

export default function AuditoriaMemos() {
    const [selected, setSelected] = useState(null);
    const [regiones, setRegiones] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [regionSeleccionada, setRegionSeleccionada] = useState("");

    const [payload, setPayload] = useState({
        region: "",
        unidad: "",
        fechaInicio: "",
        fechaTermino: "",
    });

    // Helpers de fecha/hora (UTC-safe)
    const localInputToUTC = (str) => (str ? new Date(str) : null); // "2025-08-27T12:00" (local) -> Date (UTC epoch)
    const toUTCISO = (str) => (str ? new Date(str).toISOString() : null); // para enviar a backend

    /** Obtiene el instante UTC del memo:
     * - Si trae fechaUtc / fechaHoraUtc (ISO con Z/offset) => úsalo
     * - Si solo trae 'fecha' (YYYY-MM-DD), asumimos 00:00:00Z
     */
    const memoUTC = (m) => {
        if (m.fechaUtc) return new Date(m.fechaUtc);
        if (m.fechaHoraUtc) return new Date(m.fechaHoraUtc);
        if (m.fecha) return new Date(`${m.fecha}T00:00:00Z`);
        return null;
    };

    // Carga de regiones (corrigiendo Ñuble solo en label)
    useEffect(() => {
        getRegionesUnidades().then((res) => {
            const corregido = res.map((r) => ({
                value: r,
                label: r === "REGIÓN DEL ÑUBLE" ? "REGIÓN DE ÑUBLE" : r,
            }));
            setRegiones(corregido);
        });
    }, []);

    // Carga de unidades según región
    useEffect(() => {
        if (regionSeleccionada) {
            getUnidadesByRegion(regionSeleccionada)
                .then((lista) => setUnidades(lista || []))
                .catch(() => setUnidades([]));
        } else {
            setUnidades([]);
        }
    }, [regionSeleccionada]);

    // Handler genérico para inputs nativos
    const handleChange = (e) => {
        const {name, value} = e.target;
        setPayload((prev) => ({...prev, [name]: value}));
    };

    // Filtrado (en vivo) por región, unidad y rango de fecha-hora (UTC)
    const memosFiltrados = useMemo(() => {
        const inicio = localInputToUTC(payload.fechaInicio);   // Date (UTC epoch)
        const termino = localInputToUTC(payload.fechaTermino); // Date (UTC epoch)

        // Normaliza rango si viene invertido
        const [desde, hasta] =
            inicio && termino && inicio > termino ? [termino, inicio] : [inicio, termino];

        return MOCK_MEMOS.filter((m) => {
            if (payload.region && m.region !== payload.region) return false;
            if (payload.unidad && m.unidad !== payload.unidad) return false;

            if (desde || hasta) {
                const f = memoUTC(m); // instante UTC del memo
                if (!f) return false;
                if (desde && f < desde) return false; // inclusivo en el límite inferior
                if (hasta && f > hasta) return false; // inclusivo en el límite superior
            }
            return true;
        });
    }, [payload]);

    // (Opcional) Acción del botón Filtrar: ejemplo payload listo para backend (UTC ISO)
    const handleFiltrar = () => {
        const filtros = {
            region: payload.region || null,
            unidad: payload.unidad || null,
            fechaInicioUtc: toUTCISO(payload.fechaInicio),   // ej "2025-08-27T16:00:00.000Z"
            fechaTerminoUtc: toUTCISO(payload.fechaTermino), // idem
        };
        console.log("Payload filtros para backend (UTC):", filtros);
        consultaMemosServiciosEspeciales(filtros).then(console.log);
        // Aquí podrías llamar a tu API real:
        // buscarMemos(filtros).then(setMemos);  // si reemplazas los MOCK_MEMOS
    };

    return (
        <Container fluid className="p-4">
            <h3>📋 Auditoría de Memos</h3>

            {/* -------- Filtros -------- */}
            <Row className="mb-3">
                <Col md={2}>
                    <Form.Select
                        name="region"
                        value={payload.region}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRegionSeleccionada(value); // dispara carga de unidades
                            setPayload((prev) => ({...prev, region: value, unidad: ""})); // resetea unidad
                        }}
                    >
                        <option value="">-- Región --</option>
                        {regiones.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                <Col md={2}>
                    <Form.Select
                        name="unidad"
                        value={payload.unidad}
                        onChange={handleChange}
                        disabled={!payload.region}
                    >
                        <option value="">-- Unidad --</option>
                        {unidades.map((u) => (
                            <option key={u.idUnidad} value={u.nombreUnidad}>
                                {u.nombreUnidad}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                <Col md={2}>
                    <Form.Select aria-label="Tipo de memo">
                        {tipoMemos.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.value}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                <Col md={2}>
                    <Form.Control
                        type="datetime-local"
                        name="fechaInicio"
                        value={payload.fechaInicio}
                        onChange={handleChange}
                        placeholder="Fecha inicio"
                        step="60"
                    />
                </Col>

                <Col md={2}>
                    <Form.Control
                        type="datetime-local"
                        name="fechaTermino"
                        value={payload.fechaTermino}
                        onChange={handleChange}
                        placeholder="Fecha término"
                        step="60"
                    />
                </Col>

                <Col md={2}>
                    <Button variant="primary" className="w-100" onClick={handleFiltrar}>
                        Filtrar
                    </Button>
                </Col>
            </Row>

            {/* -------- Tabla -------- */}
            <Table striped bordered hover size="sm">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Folio</th>
                    <th>RUC</th>
                    <th>Unidad</th>
                    <th>Región</th>
                    <th>Comuna</th>
                    <th>Estado</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {memosFiltrados.map((m) => (
                    <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.fecha}</td>
                        <td>{m.tipo}</td>
                        <td>{m.folioBrain}</td>
                        <td>{m.ruc}</td>
                        <td>{m.unidad}</td>
                        <td>{m.region}</td>
                        <td>{m.comuna}</td>
                        <td>
                            <Badge bg={estadoColors[m.estado]}>{m.estado}</Badge>
                        </td>
                        <td>
                            <Button size="sm" variant="outline-primary" onClick={() => setSelected(m)}>
                                Ver Detalle
                            </Button>
                        </td>
                    </tr>
                ))}
                {memosFiltrados.length === 0 && (
                    <tr>
                        <td colSpan={10} className="text-center">
                            Sin resultados.
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>

            {/* -------- Modal Detalle -------- */}
            <Modal show={!!selected} onHide={() => setSelected(null)} size="lg" fullscreen="lg-down">
                {selected && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Memo #{selected.id} - {selected.tipo}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                <strong>Fecha:</strong> {selected.fecha} <br/>
                                <strong>Unidad:</strong> {selected.unidad} ({selected.region} - {selected.comuna})
                            </p>

                            <Tabs defaultActiveKey="personas" className="mb-3">
                                <Tab eventKey="personas" title="Personas">
                                    {selected.personas.length === 0 ? (
                                        <p>No hay personas asociadas.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.personas.map((p) => (
                                                <ListGroup.Item key={p.id}>
                                                    {p.nombre} ({p.rut})
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="armas" title="Armas">
                                    {selected.armas.length === 0 ? (
                                        <p>No hay armas.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.armas.map((a) => (
                                                <ListGroup.Item key={a.id}>
                                                    {a.tipo} - {a.calibre}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="drogas" title="Drogas">
                                    {selected.drogas.length === 0 ? (
                                        <p>No hay drogas.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.drogas.map((d) => (
                                                <ListGroup.Item key={d.id}>
                                                    {d.tipo} - {d.cantidad}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="vehiculos" title="Vehículos">
                                    {selected.vehiculos.length === 0 ? (
                                        <p>No hay vehículos.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.vehiculos.map((v) => (
                                                <ListGroup.Item key={v.id}>
                                                    {v.patente} - {v.marca}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                                <Tab eventKey="issues" title="Observaciones">
                                    {selected.issues.length === 0 ? (
                                        <p>No hay observaciones.</p>
                                    ) : (
                                        <ListGroup>
                                            {selected.issues.map((i) => (
                                                <ListGroup.Item key={i.id}>
                                                    <Badge
                                                        bg={
                                                            i.severidad === "ERROR"
                                                                ? "danger"
                                                                : i.severidad === "WARN"
                                                                    ? "warning"
                                                                    : "info"
                                                        }
                                                        className="me-2"
                                                    >
                                                        {i.severidad}
                                                    </Badge>
                                                    <strong>{i.codigo}</strong> - {i.detalle}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="success" onClick={() => alert("Aprobado ✅")} size="sm">
                                Aprobar
                            </Button>
                            <Button variant="warning" onClick={() => alert("Observado ⚠️")} size="sm">
                                Observar
                            </Button>
                            <Button variant="danger" onClick={() => alert("Rechazado ❌")} size="sm">
                                Rechazar
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
}