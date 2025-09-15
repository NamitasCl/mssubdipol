// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/MemoDetalleModal.jsx
import React from "react";
import {Badge, Button, Card, Col, ListGroup, Modal, Row, Tab, Tabs,} from "react-bootstrap";
import {colorEstado, esPersonaDetenida, estadoColors} from "../utils/auditoriaMemosUtils.js";
import HistorialRevisiones from "./HistorialRevisiones.jsx";

export default function MemoDetalleModal({
                                             selected,
                                             onHide,
                                             onAprobar,
                                             onObservar,
                                             onCopy,
                                         }) {
    if (!selected) return null;

    return (
        <Modal show={!!selected} onHide={onHide} fullscreen="lg-down" fullscreen>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <span>Memo #{selected.id}</span>
                    <Badge bg="info" className="text-dark">
                        {selected.tipo}
                    </Badge>
                    <Badge bg={estadoColors[selected.estado] || "secondary"}>
                        {selected.estado === "SIN_REVISAR" ? "Pendiente" : selected.estado}
                    </Badge>
                    <Badge bg="secondary" className="text-white">
                        {selected.tipoDeMemo}
                    </Badge>
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
                    <span>
                      <strong>Folio:</strong> {selected.folio}
                    </span>
                                        <Button
                                            size="sm"
                                            variant="link"
                                            className="p-0"
                                            onClick={() => onCopy?.(String(selected.folio))}
                                        >
                                            📋
                                        </Button>
                                        <span>
                      <strong>RUC:</strong> {selected.ruc}
                    </span>
                                        <Button
                                            size="sm"
                                            variant="link"
                                            className="p-0"
                                            onClick={() => onCopy?.(String(selected.ruc))}
                                        >
                                            📋
                                        </Button>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="text-muted small">Tipo de memo</div>
                                    <div className="fw-semibold">{selected.tipoDeMemo}</div>
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
                                    <div
                                        className="border rounded p-3"
                                        style={{
                                            whiteSpace: "pre-line",
                                            maxHeight: 240,
                                            overflowY: "auto",
                                        }}
                                    >
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
                                        <div className="fw-semibold">{p.nombre || "Sin nombre"}</div>
                                        {p.rut && <div className="text-muted small">{p.rut}</div>}

                                        <div className="row mt-2">
                                            <div className="col-md-6">
                                                <div className="small">
                                                    <strong>Sexo:</strong>{" "}
                                                    {p.sexo || (
                                                        <span className="text-muted fst-italic">
                              Información no disponible
                            </span>
                                                    )}
                                                </div>
                                                <div className="small">
                                                    <strong>Edad:</strong>{" "}
                                                    {p.edad ? (
                                                        `${p.edad} años`
                                                    ) : (
                                                        <span className="text-muted fst-italic">
                              Información no disponible
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="small">
                                                    <strong>Nacionalidad:</strong>{" "}
                                                    {p.nacionalidad || (
                                                        <span className="text-muted fst-italic">
                              Información no disponible
                            </span>
                                                    )}
                                                </div>
                                                <div className="small">
                                                    <strong>Condición Migratoria:</strong>{" "}
                                                    {p.condicionMigratoria || (
                                                        <span className="text-muted fst-italic">
                              Información no disponible
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 d-flex flex-column gap-1">
                                            <div className="d-flex gap-2 align-items-center">
                                                <div>
                                                    <strong>Calidad de la persona:</strong>
                                                </div>
                                                <div>
                                                    {!!(p.estados && p.estados.length) ? (
                                                        p.estados.map((e, i) => {
                                                            const esDet = esPersonaDetenida([e]);
                                                            return (
                                                                <Badge
                                                                    key={i}
                                                                    bg={esDet ? "danger" : colorEstado(e)}
                                                                    className={`me-1 ${esDet ? "fw-bold" : ""}`}
                                                                    pill
                                                                    title={esDet ? "Persona detenida" : ""}
                                                                >
                                                                    {e}
                                                                    {esDet && " 🔒"}
                                                                </Badge>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-muted fst-italic">
                              Información no disponible
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-1 d-flex flex-column gap-1">
                                            <div className="d-flex gap-2 align-items-center">
                                                <div>
                                                    <strong>Delitos:</strong>
                                                </div>
                                                <div>
                                                    {!!(p.delitos && p.delitos.length) ? (
                                                        p.delitos.map((delito, i) => (
                                                            <Badge
                                                                key={i}
                                                                bg="warning"
                                                                text="dark"
                                                                className="me-1"
                                                                pill
                                                            >
                                                                {delito}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted fst-italic">
                              Información no disponible
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Tab>

                    <Tab eventKey="armas" title={`Armas (${selected.armas.length})`}>
                        {selected.armas.length === 0 ? (
                            <p className="text-muted">No hay armas asociadas.</p>
                        ) : (
                            <ListGroup className="mt-2">
                                {selected.armas.map((a) => (
                                    <ListGroup.Item key={a.id}>
                                        <div className="fw-semibold">
                                            {a.tipo || "Sin tipo especificado"}
                                        </div>
                                        <div className="text-muted small">
                                            <strong>Marca:</strong> {a.marca || "—"} |
                                            <strong> Serie:</strong> {a.serie || "—"} |
                                            <strong> Calibre:</strong> {a.calibre || "—"}
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Tab>

                    <Tab eventKey="dineros" title={`Dineros (${selected.dineros.length})`}>
                        {selected.dineros.length === 0 ? (
                            <p className="text-muted">No hay dineros asociados.</p>
                        ) : (
                            <ListGroup className="mt-2">
                                {selected.dineros.map((d) => (
                                    <ListGroup.Item key={d.id}>
                                        <div className="fw-semibold">
                                            {d.calidad || "Sin calidad especificada"}
                                        </div>
                                        <div className="text-muted small">
                                            <strong>Monto:</strong> {d.monto || "—"}
                                            {d.obs && (
                                                <span>
                          {" "}
                                                    | <strong>Observaciones:</strong> {d.obs}
                        </span>
                                            )}
                                        </div>
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
                                        {f.responsabilidad && (
                                            <div className="text-muted small">{f.responsabilidad}</div>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Tab>

                    <Tab eventKey="municiones" title={`Municiones (${selected.municiones.length})`}>
                        {selected.municiones.length === 0 ? (
                            <p className="text-muted">No hay municiones asociadas.</p>
                        ) : (
                            <ListGroup className="mt-2">
                                {selected.municiones.map((m) => (
                                    <ListGroup.Item key={m.id}>
                                        <div className="fw-semibold">Munición</div>
                                        <div className="text-muted small">
                                            {m.obs || "Sin observaciones"}
                                        </div>
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
                                        <div className="text-muted small">
                                            <strong>Marca/Modelo:</strong> {v.marca || "—"}
                                            {v.calidad && (
                                                <span>
                          {" "}
                                                    | <strong>Calidad:</strong> {v.calidad}
                        </span>
                                            )}
                                            {v.obs && (
                                                <span>
                          {" "}
                                                    | <strong>Observaciones:</strong> {v.obs}
                        </span>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Tab>

                    <Tab eventKey="otrasEspecies" title={`Otras Especies (${selected.otrasEspecies.length})`}>
                        {selected.otrasEspecies.length === 0 ? (
                            <p className="text-muted">No hay otras especies asociadas.</p>
                        ) : (
                            <ListGroup className="mt-2">
                                {selected.otrasEspecies.map((oe) => (
                                    <ListGroup.Item key={oe.id}>
                                        <div className="fw-semibold">
                                            {oe.descripcion || "Sin descripción"}
                                        </div>
                                        <div className="text-muted small">
                                            <strong>Calidad:</strong> {oe.calidad || "—"} |
                                            <strong> Cantidad:</strong> {oe.cantidad || "—"} |
                                            <strong> NUE:</strong> {oe.nue || "—"}
                                        </div>
                                        {oe.avaluo && (
                                            <div className="text-muted small">
                                                <strong>Avalúo:</strong> {oe.avaluo}
                                            </div>
                                        )}
                                        {oe.utilizadoComoArma &&
                                            oe.utilizadoComoArma !== "—" &&
                                            oe.utilizadoComoArma !== "" &&
                                            oe.utilizadoComoArma.toUpperCase().includes("SI") && (
                                                <Badge bg="warning" className="me-1">
                                                    Utilizado como arma
                                                </Badge>
                                            )}
                                        {oe.sitioSuceso && (
                                            <div className="text-muted small">
                                                <strong>Sitio del suceso:</strong> {oe.sitioSuceso}
                                            </div>
                                        )}
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
                                        <strong>{i.codigo}</strong> — {i.detalle}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Tab>

                    {/* Nueva pestaña: Historial de Revisiones */}
                    <Tab eventKey="historial" title="Historial de Revisiones">
                        <div className="mt-2">
                            <HistorialRevisiones memoId={selected.id} />
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                <div className="me-auto text-muted small">ID: {selected.id}</div>
                <Button variant="success" size="sm" onClick={() => onAprobar?.(selected)}>
                    Aprobar
                </Button>
                <Button variant="warning" size="sm" onClick={() => onObservar?.(selected)}>
                    Observar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}