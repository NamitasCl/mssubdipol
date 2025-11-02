// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/FiltrosAuditoria.jsx
import React, {useState} from "react";
import {Button, ButtonGroup, Card, Col, Form, Row} from "react-bootstrap";
import UnidadesAsyncMulti from "../../../components/ComponentesAsyncSelect/AsyncUnidadesSelectAct.jsx";
import AsyncMultiMemoIdsSelect from "../../../components/ComponentesAsyncSelect/AsyncMultiMemoIdsSelect.jsx";
import {tipoFecha, tipoMemos} from "../utils/auditoriaMemosUtils.js";
import DelitosAsyncMulti from "../../../components/ComponentesAsyncSelect/AsyncDelitosSelectAct.jsx";

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
                                             delitosSeleccionados,
                                             setDelitos,
                                             regionSeleccionada,
                                             setRegionSeleccionada,
                                             filtroDetenidos,
                                             setFiltroDetenidos,
                                             jerarquiaUnidades,
                                             setIdSeleccion
                                         }) {



    const [subdireccion, setSubdireccion] = useState("");
    const [regionJefaturaNacional, setRegionJefaturaNacional] = useState("");
    const [prefectura, setPrefectura] = useState("");
    const [unidadSeleccionada, setUnidadSeleccionada] = useState("");

    const [nivelDos, setNivelDos] = useState([]);
    const [nivelTres, setNivelTres] = useState([]);
    const [nivelCuatro, setNivelCuatro] = useState([]);

    /**
     * Retorna los IDs de todas las unidades bajo las prefecturas de una región policial.
     * @param {Array} datos - Estructura jerárquica completa.
     * @param {String} nombreRegion - Ej: "REGION POLICIAL DE COQUIMBO"
     * @returns {{porPrefectura: Array<{prefectura: string, ids: number[]}>, idsTotales: number[]}}
     */
    function getIdsBajoPrefecturas(datos, nombreRegion) {
        // 1) Región seleccionada
        const region = datos.find(d => d.nombreRegion === nombreRegion);
        if (!region) return { porPrefectura: [], idsTotales: [] };

        // 2) Prefecturas declaradas dentro de la región (por nombre contiene "PREFECTURA")
        const prefecturasEnRegion = (region.hijos ?? [])
            .flatMap(h => h.nietos ?? [])
            .filter(n => /PREFECTURA/i.test(n.nombreUnidad));

        // 3) Para cada prefectura, buscar su bloque en `datos` y acumular IDs de sus hijos.nietos
        const porPrefectura = prefecturasEnRegion.map(pref => {
            const bloquePref = datos.find(d => d.nombreRegion === pref.nombreUnidad);
            const ids = (bloquePref?.hijos ?? [])
                .flatMap(h => h.nietos ?? [])
                .map(n => n.id);
            return { prefectura: pref.nombreUnidad, ids };
        });

        // 4) Unificar sin duplicados
        return [...new Set(porPrefectura.flatMap(p => p.ids))];
    }

    const handleRegionJefaturaNacional = (e) => {
        const arrayUnidades = [];
        const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
        unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({id: nieto.id, nombreUnidad: nieto.nombreUnidad}))));
        const valoresFinales = arrayUnidades.filter(unidades => unidades.nombreUnidad.includes("REGION POLICIAL") || unidades.nombreUnidad.includes("JEFATURA NACIONAL"));
        setNivelDos(valoresFinales);
    }

    const handlePrefectura = (e) => {

        console.log(e.target.value);

        if(String(e.target.value).includes("REGION POLICIAL")){
            const resultado = getIdsBajoPrefecturas(jerarquiaUnidades, e.target.value);
            const arrayUnidades = [];
            const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
            unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({id: nieto.id, nombreUnidad: nieto.nombreUnidad}))));
            const valoresFinales = arrayUnidades.filter(unidades => unidades.nombreUnidad.includes("PREFECTURA"));
            setNivelTres(valoresFinales);
            setIdSeleccion(resultado);
            return;
        }

        const arrayUnidades = [];
        const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
        unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({id: nieto.id, nombreUnidad: nieto.nombreUnidad}))));
        const valoresFinales = arrayUnidades.filter(unidades => unidades.nombreUnidad.includes("PREFECTURA"));
        setNivelTres(valoresFinales);
        setIdSeleccion(unidadesSubdireccion.idsNietos);
    }

    const handleUnidad = (e) => {
        setUnidadSeleccionada(e.target.value);
        const arrayUnidades = [];
        const unidadesSubdireccion = jerarquiaUnidades.find(res => res.nombreRegion === e.target.value);
        unidadesSubdireccion.hijos.map(hijo => hijo.nietos.map(nieto => (arrayUnidades.push({id: nieto.id, nombreUnidad: nieto.nombreUnidad}))));
        setNivelCuatro(arrayUnidades);
        setIdSeleccion(unidadesSubdireccion.idsNietos)
    }



    return (
        <Card className="mb-3">
            <Card.Body>
                <div className="d-flex flex-column flex-wrap align-items-left gap-3">
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
                            <Button
                                size="sm"
                                variant={searchMode === "delitos" ? "primary" : "outline-primary"}
                                onClick={() => {
                                    setSearchMode("delitos");
                                    setUnidadesSeleccionadas([]);
                                }}
                            >
                                Filtro Grupal
                            </Button>
                        </ButtonGroup>
                    </div>

                    {searchMode === "delitos" && (
                        <Row className="mt-1">
                            <Col>
                                <div className="position-relative rounded-3 border border-info bg-info bg-opacity-10 p-3" role="alert" aria-live="polite">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge text-bg-info">🎯 Filtro grupal</span>
                                        <strong className="text-info">Requisitos obligatorios</strong>
                                    </div>

                                    <div className="small mt-2 text-secondary">
                                        Para ejecutar el filtro grupal debes seleccionar:
                                        <strong> Tipo de fecha</strong>, <strong>Fecha inicio</strong>, <strong>Fecha término</strong> y
                                        <strong> Tipo de memo</strong>.
                                        <br/>
                                        El filtro <u>solo</u> se ejecuta si escoges una
                                        <strong> Región Policial</strong>, <strong> Jefatura Nacional</strong> o una
                                        <strong> Prefectura</strong> específica.
                                    </div>
                                </div>
                            </Col>

                        </Row>
                    )}

                    <div className="w-100 d-flex flex-wrap align-items-center gap-3">
                        <Form.Label className="mb-0 small text-muted">Tipo de fecha</Form.Label>
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

                    {searchMode === "delitos" && (
                        <Col md={12}>
                            <Row className="g-3">
                                <Form.Group as={Col} md={6} lg={4}>
                                    <Form.Label className="mb-1">Subdirección</Form.Label>
                                    <Form.Select size="sm" value={subdireccion} onChange={(e) => {
                                        // 1. Actualiza su propio estado
                                        setSubdireccion(e.target.value);

                                        // 2. Llama a la función que calcula el Nivel 2 (pasando el evento 'e')
                                        handleRegionJefaturaNacional(e);

                                        // 3. Resetea los estados hijos
                                        setNivelTres([]);
                                        setNivelCuatro([]);
                                    }}>
                                        <option value="">Elija una opción</option>
                                        <option value="SUBDIRECCION DE INVESTIGACION POLICIAL">SUBDIRECCION DE INVESTIGACION POLICIAL</option>
                                        <option value="SUBDIRECCION DE INTELIGENCIA CRIMEN ORGANIZADO Y SEGURIDAD MIGRATORIA">SUBDIRECCION DE INTELIGENCIA CRIMEN ORGANIZADO Y SEGURIDAD MIGRATORIA</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group as={Col} md={6} lg={4}>
                                    <Form.Label className="mb-1">Región Policial o Jefatura Nacional</Form.Label>
                                    <Form.Select size="sm" value={regionJefaturaNacional} onChange={(e) => {
                                        // 1. Actualiza su propio estado (LA CORRECCIÓN)
                                        setRegionJefaturaNacional(e.target.value);

                                        // 2. Llama a la función que calcula el Nivel 3
                                        handlePrefectura(e);
                                    }}>
                                        <option value="">Elija una opción</option>
                                        {nivelDos.length > 0 && (
                                            nivelDos.map((u) => (
                                                <option key={u.id} value={u.nombreUnidad}>{u.nombreUnidad}</option>
                                            ))
                                        )}
                                    </Form.Select>
                                </Form.Group>

                                {/* Este condicional ahora es más simple y depende del estado correcto */}
                                <Form.Group as={Col} md={6} lg={4}>
                                    <Form.Label className="mb-1">Prefectura</Form.Label>
                                    <Form.Select size="sm" value={prefectura} onChange={(e) => {
                                        // 1. Actualiza su propio estado (LA CORRECCIÓN)
                                        setPrefectura(e.target.value);

                                        // 2. Llama a la función que calcula el Nivel 4
                                        handleUnidad(e);

                                    }}>
                                        <option value="">Elija una opción</option>
                                        {nivelTres.length > 0 && (
                                            nivelTres.map((u) => (
                                                <option key={u.id} value={u.nombreUnidad}>{u.nombreUnidad}</option>
                                            ))
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Row>
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