// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/FiltrosAuditoria.jsx
import React from "react";
import {Button, ButtonGroup, Card, Col, Form, Row} from "react-bootstrap";
import UnidadesAsyncMulti from "../../../components/ComponentesAsyncSelect/AsyncUnidadesSelectAct.jsx";
import AsyncMultiMemoIdsSelect from "../../../components/ComponentesAsyncSelect/AsyncMultiMemoIdsSelect.jsx";
import {tipoFecha, tipoMemos} from "../utils/auditoriaMemosUtils.js";

export default function FiltrosAuditoria({
                                             user,
                                             searchMode,
                                             setSearchMode,
                                             payload,
                                             setPayload,
                                             unidadesSeleccionadas,
                                             setUnidadesSeleccionadas,
                                             memoIds,
                                             setMemoIds,
                                             regionSeleccionada,
                                             setRegionSeleccionada,
                                             filtroDetenidos,
                                             setFiltroDetenidos,
                                         }) {
    return (
        <Card className="mb-3">
            <Card.Body>
                <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">Modo de búsqueda:</span>
                        <ButtonGroup>
                            <Button
                                size="sm"
                                variant={searchMode === "unidades" ? "primary" : "outline-primary"}
                                onClick={() => {
                                    setSearchMode("unidades");
                                    setMemoIds([]);
                                }}
                            >
                                Por Unidades
                            </Button>
                            <Button
                                size="sm"
                                variant={searchMode === "folio" ? "primary" : "outline-primary"}
                                onClick={() => {
                                    setSearchMode("folio");
                                    setUnidadesSeleccionadas([]);
                                }}
                            >
                                Por ID memo
                            </Button>
                        </ButtonGroup>
                    </div>

                    <div className="w-100 d-flex flex-wrap align-items-center gap-2">
                        <Form.Label className="mb-0 small text-muted ms-2">Tipo de fecha</Form.Label>
                        <Form.Select
                            size="sm"
                            style={{maxWidth: 160}}
                            value={payload.tipoFecha}
                            onChange={(e) => setPayload((p) => ({...p, tipoFecha: e.target.value}))}
                        >
                            {tipoFecha.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.value}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Label className="mb-0 small text-muted">Fecha inicio</Form.Label>
                        <Form.Control
                            size="sm"
                            type="datetime-local"
                            step="60"
                            style={{maxWidth: 220}}
                            value={payload.fechaInicio}
                            onChange={(e) => setPayload((p) => ({...p, fechaInicio: e.target.value}))}
                        />

                        <Form.Label className="mb-0 small text-muted ms-2">Fecha término</Form.Label>
                        <Form.Control
                            size="sm"
                            type="datetime-local"
                            step="60"
                            style={{maxWidth: 220}}
                            value={payload.fechaTermino}
                            onChange={(e) => setPayload((p) => ({...p, fechaTermino: e.target.value}))}
                        />

                        <Form.Label className="mb-0 small text-muted ms-2">Tipo de memo</Form.Label>
                        <Form.Select
                            size="sm"
                            style={{maxWidth: 280}}
                            value={payload.tipoMemo}
                            onChange={(e) => setPayload((p) => ({...p, tipoMemo: e.target.value}))}
                        >
                            {tipoMemos
                                /*.filter((t) => {
                                    if (user?.siglasUnidad !== "PMSUBDIPOL" && t.value === "TODOS") {
                                        return false;
                                    }
                                    return true;
                                })*/
                                .map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.value}
                                    </option>
                                ))}
                        </Form.Select>
                    </div>
                </div>

                <Row className="g-3 mt-2">
                    {searchMode === "unidades" && (
                        <Col md={12}>
                            <Form.Label className="mb-1">Unidades</Form.Label>
                            <UnidadesAsyncMulti
                                value={unidadesSeleccionadas}
                                onChange={setUnidadesSeleccionadas}
                                regionSeleccionada={regionSeleccionada}
                                comunaSeleccionada={""}
                            />
                            {!!unidadesSeleccionadas.length && (
                                <div className="small text-muted mt-1">
                                    Seleccionadas: {unidadesSeleccionadas.length}.
                                </div>
                            )}
                        </Col>
                    )}

                    {searchMode === "folio" && (
                        <Col md={8}>
                            <Form.Label className="mb-1">IDs de Memo</Form.Label>
                            <AsyncMultiMemoIdsSelect value={memoIds} onChange={setMemoIds}/>
                            {!!memoIds.length && (
                                <div className="small text-muted mt-1">IDs seleccionados: {memoIds.length}</div>
                            )}
                        </Col>
                    )}
                </Row>

                {user?.siglasUnidad === "PMSUBDIPOL" && (
                    <Row className="mt-3">
                        <Col>
                            <div className="bg-warning bg-opacity-10 border border-warning rounded p-3">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="fw-bold text-warning">🌍 Acceso Especial PMSUBDIPOL</span>
                                </div>
                                <small className="text-muted">
                                    Como usuario de PMSUBDIPOL, tienes acceso al botón <strong>"Consulta
                                    Global"</strong> que
                                    permite consultar todos los memos de todas las unidades usando únicamente los
                                    filtros de:
                                    <strong> Tipo de fecha, Fecha inicio, Fecha término y Tipo de memo</strong>. Este
                                    botón
                                    ignora la selección de unidades específicas.
                                </small>
                            </div>
                        </Col>
                    </Row>
                )}

                <Row className="mt-2">
                    <Col md={12}>
                        <Form.Check
                            type="checkbox"
                            id="filtro-detenidos"
                            label="🔒 Mostrar solo memorandos con personas detenidas (Detenido por PDI y Arrestado)"
                            checked={filtroDetenidos}
                            onChange={(e) => setFiltroDetenidos(e.target.checked)}
                            className="text-primary"
                        />
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}