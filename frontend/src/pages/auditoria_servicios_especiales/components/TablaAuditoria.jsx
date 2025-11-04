// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/TablaAuditoria.jsx
import React from "react";
import {Alert, Badge, Button, Form, InputGroup, OverlayTrigger, Spinner, Table, Tooltip,} from "react-bootstrap";
import {clamp2, contarDetenidos, estadoColors, stickyTh} from "../utils/auditoriaMemosUtils.js";
import MemoIconset from "./MemoIconset.jsx";

export default function TablaAuditoria({
                                           // Estados de búsqueda y filtrado
                                           search,
                                           setSearch,
                                           setPage,

                                           // Datos de la tabla
                                           filteredSorted,
                                           paged,
                                           total,

                                           // Paginación
                                           page,
                                           totalPages,
                                           pageSize,
                                           setPageSize,

                                           // Ordenamiento
                                           sort,
                                           onToggleSort,

                                           // Estados de carga y error
                                           loading,
                                           err,

                                           // Handlers
                                           onRefresh,
                                           onExportStats,
                                           onSelectMemo,
                                           onCopy,
                                       }) {
    return (
        <>
            {/* Barra de búsqueda */}
            <div
                className="d-flex justify-content-between align-items-center m-2 bg-secondary bg-opacity-25 p-2 rounded-3 shadow-sm mb-4">
                <div className="d-flex align-items-center gap-2">
                    <InputGroup>
                        <InputGroup.Text>🔎</InputGroup.Text>
                        <Form.Control
                            placeholder="Búsqueda rápida local (ID, folio, RUC, unidad o texto del relato)…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </InputGroup>
                    <small className="text-muted">Este buscador filtra solo los resultados obtenidos.</small>
                </div>
            </div>

            {/* Controles superiores */}
            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg="dark" style={{width: 300, fontSize: "1rem"}}>
                            {total} resultado{total === 1 ? "" : "s"}
                            {total > 0 && (
                                <>
                                    {" • "}
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id="tooltip-detenidos">
                                                Incluye: Detenidos por PDI y Arrestados.
                                            </Tooltip>
                                        }
                                    >
                    <span className="text-info fw-bold" style={{cursor: 'pointer'}}>
                      {contarDetenidos(filteredSorted)} detenido{contarDetenidos(filteredSorted) !== 1 ? "s" : ""}
                    </span>
                                    </OverlayTrigger>
                                </>
                            )}
                        </Badge>
                    </div>
                    <Form.Select
                        size="sm"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n} por página
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={onRefresh} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border"/> : "Refrescar"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline-success"
                        onClick={onExportStats}
                        disabled={loading || !total}
                        className="ms-2"
                    >
                        📊 Estadísticas Excel
                    </Button>
                </div>
            </div>

            {/* Alert de error */}
            {err && <Alert variant="danger" className="mb-2">{err}</Alert>}

            {/* Tabla principal */}
            <div className="table-responsive" style={{maxHeight: "60vh"}}>
                <Table hover size="sm" className="align-middle">
                    <thead>
                    <tr>
                        <th style={stickyTh} onClick={() => onToggleSort("id")} role="button">
                            ID {sort.by === "id" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh} onClick={() => onToggleSort("_fechaSort")} role="button">
                            Fecha {sort.by === "_fechaSort" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Tipo</th>
                        <th style={stickyTh} onClick={() => onToggleSort("folio")} role="button">
                            Folio {sort.by === "folio" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh} onClick={() => onToggleSort("ruc")} role="button">
                            RUC {sort.by === "ruc" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Unidad / Relato</th>
                        <th style={stickyTh} onClick={() => onToggleSort("estado")} role="button">
                            Estado {sort.by === "estado" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                        </th>
                        <th style={stickyTh}>Info</th>
                        <th style={stickyTh}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={9} className="text-center">
                                <Spinner animation="border" size="sm" className="me-2"/>
                                Cargando…
                            </td>
                        </tr>
                    )}

                    {!loading && paged.length === 0 && (
                        <tr>
                            <td colSpan={9} className="text-center text-muted py-4">
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
                                    <Badge bg="info" className="text-dark">
                                        {m.tipo}
                                    </Badge>
                                </td>
                                <td className="text-nowrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{m.folio}</span>
                                        {m.folio !== "—" && (
                                            <Button
                                                size="sm"
                                                variant="link"
                                                className="p-0"
                                                onClick={() => onCopy(String(m.folio))}
                                                title="Copiar folio"
                                            >
                                                📋
                                            </Button>
                                        )}
                                    </div>
                                </td>
                                <td className="text-nowrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{m.ruc}</span>
                                        {m.ruc !== "—" && (
                                            <Button
                                                size="sm"
                                                variant="link"
                                                className="p-0"
                                                onClick={() => onCopy(String(m.ruc))}
                                                title="Copiar RUC"
                                            >
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
                                    <Badge bg={estadoColors[m.estado] || "secondary"}>
                                        {m.estado === "SIN_REVISAR" ? "Pendiente" : m.estado}
                                    </Badge>
                                </td>
                                <td>
                                    <div className="d-flex gap-2 flex-wrap align-items-center px-5"
                                         style={{width: 200}}>
                                        <MemoIconset memo={m}/>
                                    </div>
                                </td>
                                <td className="text-end">
                                    <Button size="sm" variant="outline-primary" onClick={() => onSelectMemo(m)}>
                                        Ver detalle
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ← Anterior
                    </Button>
                    <span className="small">Página {page} de {totalPages}</span>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Siguiente →
                    </Button>
                </div>
            )}
        </>
    );
}