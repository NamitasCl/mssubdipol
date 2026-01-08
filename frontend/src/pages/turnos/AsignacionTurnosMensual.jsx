/**************************************************************************
 *  AsignacionTurnosMensual.jsx                                           *
 *  (Carga asignaciones guardadas + generación iterativa sin duplicados)  *
 **************************************************************************/

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Row, Col, Form, Spinner, Button, Card, Modal } from "react-bootstrap";
import * as XLSX from "xlsx";
import { FaSyncAlt, FaSave, FaFileExcel } from "react-icons/fa";

const azulPastel = "#b1cfff";
const azulPrincipal = "#2a4d7c";
const azulClaro = "#eaf4fb";
const dorado = "#FFC700";
const grisBg = "#f7fafd";
const textoPrincipal = "#22334a";
const badgeTurno = "#f3fafb";

/* ---------- Endpoints ---------- */
const ENDPOINT_FUNC_DISP = `${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/disponibles`;

/* ---------- Turnos ---------- */
const TURNOS = [
    "Jefe de Servicio",
    "Encargado Primera Guardia Principal",
    "Encargado Segunda Guardia Principal",
    "Encargado Primera Guardia Prevención",
    "Encargado Segunda Guardia Prevención",
    "Ayudante Primera Guardia Principal",
    "Ayudante Segunda Guardia Principal",
    "Ayudante Primera Guardia Prevención",
    "Ayudante Segunda Guardia Prevención",
];

/* ---------- Jerarquía de grados ---------- */
const GRADOS_ORDEN = [
    "PFT", "SPF", "SPF (OPP)", "COM", "COM (OPP)",
    "SBC", "SBC (OPP)", "ISP", "SBI", "DTV", "APS", "AP", "APP", "APP (AC)",
];

/* ---------- Utilidades ---------- */
const norm = s => (s || "").replace(/\s+/g, " ").replace(/\s+\(/g, " (").trim().toUpperCase();
export const compareFuncionarioHierarchy = (a, b) => {
    if (!a || !b) return 0;
    const gA = norm(a.siglasCargo);
    const gB = norm(b.siglasCargo);
    const iA = GRADOS_ORDEN.indexOf(gA.replace(" (OPP)", ""));
    const iB = GRADOS_ORDEN.indexOf(gB.replace(" (OPP)", ""));
    if (iA === -1 && iB === -1) return 0;
    if (iA === -1) return 1;
    if (iB === -1) return -1;
    if (iA !== iB) return iA - iB;
    const oppA = gA.includes("(OPP)");
    const oppB = gB.includes("(OPP)");
    if (oppA !== oppB) return oppA ? 1 : -1;
    const antA = +a.antiguedad || Infinity;
    const antB = +b.antiguedad || Infinity;
    if (antA === Infinity && antB === Infinity) return 0;
    if (antA === Infinity) return 1;
    if (antB === Infinity) return -1;
    return antA - antB;
};
const order = arr => [...arr].sort(compareFuncionarioHierarchy);

export default function AsignacionTurnosMensual() {

    /* ---------------- State ---------------- */
    const [funcs, setFuncs] = useState([]);
    const [slots, setSlots] = useState([]); // Raw slots from backend
    const [asig, setAsig] = useState({}); // { [dia]: { [turno]: idFuncionario } }
    const [slotIds, setSlotIds] = useState({}); // { [dia]: { [turno]: slotId } }
    const [loading, setLoading] = useState(false);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [sem, setSem] = useState(0);
    const [idCalendario, setIdCalendario] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingChange, setPendingChange] = useState(null);

    /* ---------------- Memos ---------------- */
    const byId = useMemo(() => {
        const m = new Map();
        funcs.forEach(f => { m.set(f.id, f); });
        return order([...m.values()]);
    }, [funcs]);

    const funcionarioMap = useMemo(() => new Map(byId.map(f => [f.id, f])), [byId]);

    const dropdown = useMemo(() => {
        const seen = new Set();
        return byId.filter(f => {
            const n = (f.nombreCompleto || "").trim();
            if (!n || seen.has(n)) return false;
            seen.add(n); return true;
        });
    }, [byId]);

    const semanas = useMemo(() => {
        const days = Object.keys(asig).map(Number).sort((a, b) => a - b);
        if (days.length === 0 && !loading) return [];
        const arr = days.map(d => [String(d), asig[d]]);
        const out = [];
        for (let i = 0; i < arr.length; i += 7) out.push(arr.slice(i, i + 7));
        return out;
    }, [asig, loading]);

    /* ---------------- Carga ---------------- */
    const loadData = async () => {
        setLoading(true);
        setAsig({});
        setSlots([]);
        setSlotIds({});
        setFuncs([]);
        setIdCalendario(null);

        try {
            const { data: cal } = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/calendario/buscar`, {
                params: { mes, anio }
            });

            if (!cal || !cal.id) {
                setLoading(false);
                return;
            }
            setIdCalendario(cal.id);

            const { data: slotList } = await axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/slots/calendario/${cal.id}`);

            const { data: listFuncs } = await axios.get(ENDPOINT_FUNC_DISP, {
                params: { selectedMes: mes, selectedAnio: anio }
            });

            const processedFuncs = (listFuncs || []).map(f => ({
                ...f,
                id: +(f.id ?? f.idFuncionario),
                nombreCompleto: f.nombreCompleto || "",
                siglasCargo: f.siglasCargo || "",
                antiguedad: f.antiguedad,
                unidad: f.unidad && f.unidad !== "-" ? f.unidad : ""
            })).filter(f => f && !isNaN(f.id));

            setFuncs(order(processedFuncs));

            const newAsig = {};
            const newSlotIds = {};

            (slotList || []).forEach(slot => {
                const [y, m, d] = slot.fecha.split("-").map(Number);
                const dia = d;
                const turnoName = slot.nombreServicio;

                if (!newAsig[dia]) { newAsig[dia] = {}; newSlotIds[dia] = {}; }

                newSlotIds[dia][turnoName] = slot.id;
                if (slot.idFuncionario) {
                    newAsig[dia][turnoName] = slot.idFuncionario;
                }
            });

            setSlots(slotList);
            setAsig(newAsig);
            setSlotIds(newSlotIds);

        } catch (error) {
            console.error("Error cargando datos:", error);
            if (error.response?.status !== 404) {
                alert("Error cargando datos del calendario.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [mes, anio]);

    /* ---------------- Generación ---------------- */
    const handleGenerar = async () => {
        if (!idCalendario) {
            alert("No se encontró un calendario abierto para este mes.");
            return;
        }
        if (!window.confirm("¿Regenerar turnos? Esto sobreescribirá la distribución actual con una propuesta automática.")) return;

        setLoading(true);
        try {
            const { data: result } = await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/distribucion/generar`, {
                idCalendario,
                mes,
                anio,
                permitirRelajacion: true
            });

            if (result.exitoso) {
                const proposedAsig = {};
                Object.values(result.asignacionesPorFuncionario).flat().forEach(asigDTO => {
                    const [y, m, d] = asigDTO.fecha.split("-").map(Number);
                    const dia = d;
                    const turno = asigDTO.nombreServicio;
                    if (!proposedAsig[dia]) proposedAsig[dia] = {};
                    proposedAsig[dia][turno] = asigDTO.idFuncionario;
                });

                setAsig(proposedAsig);
                alert("Propuesta generada exitosamente. Revise y guarde los cambios.");
            } else {
                alert("No se pudo generar una distribución completa: " + result.mensaje);
            }
        } catch (error) {
            console.error(error);
            alert("Error al generar turnos en el servidor.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Guardar ---------------- */
    const handleGuardar = async () => {
        setLoading(true);
        try {
            const updates = [];
            Object.keys(slotIds).forEach(dia => {
                const turnosDelDia = slotIds[dia];
                Object.keys(turnosDelDia).forEach(turno => {
                    const slotId = turnosDelDia[turno];
                    const funcId = asig[dia]?.[turno];
                    updates.push({
                        id: slotId,
                        idFuncionario: funcId || null,
                        cubierto: !!funcId
                    });
                });
            });

            if (updates.length > 0) {
                await axios.put(`${import.meta.env.VITE_TURNOS_API_URL}/slots/batch`, updates);
            }
            alert("Turnos guardados exitosamente. 👍");
            loadData();
        } catch (e) {
            console.error(e);
            alert("Error al guardar los turnos.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Auxiliares UI ---------------- */
    const getHierarchyComparisonText = (prev, next) => {
        if (!prev && !next) return "N/A (Ambos Nulos)";
        if (!prev) return <span className="text-info">Asignando a casilla vacía</span>;
        if (!next) return <span className="text-warning">Quitando asignación</span>;

        const comparison = compareFuncionarioHierarchy(prev, next);
        if (comparison < 0) return <span className="text-danger fw-bold">Nuevo tiene MENOR Jerarquía (Cambio arriesgado)</span>;
        if (comparison > 0) return <span className="text-success fw-bold">Nuevo tiene MAYOR Jerarquía</span>;
        return "Misma Jerarquía (Grado y Antigüedad)";
    };

    const handleChange = (dia, t, val) => {
        const idNew = val === "" ? null : +val;
        const currentDayAssignments = asig[dia] || {};
        const idPrev = currentDayAssignments[t] || null;

        if (idNew === idPrev) return;

        const detPrev = idPrev ? funcionarioMap.get(idPrev) : null;
        const detNew = idNew ? funcionarioMap.get(idNew) : null;

        if (idPrev != null && idNew != null && idPrev !== idNew) {
            const comparisonResult = getHierarchyComparisonText(detPrev, detNew);
            setPendingChange({ dia, turno: t, idPrev, idNew, detPrev, detNew, comparisonResult });
            setShowConfirmModal(true);
        } else {
            setAsig(p => ({
                ...p,
                [dia]: { ...(p[dia] || {}), [t]: idNew }
            }));
        }
    };

    const handleConfirmChange = () => {
        if (!pendingChange) return;
        const { dia, turno, idNew } = pendingChange;
        setAsig(p => ({
            ...p,
            [dia]: { ...(p[dia] || {}), [turno]: idNew }
        }));
        setShowConfirmModal(false);
        setPendingChange(null);
    };

    const handleCancelChange = () => {
        setShowConfirmModal(false);
        setPendingChange(null);
    };

    const handleExport = () => {
        const rows = [];
        Object.keys(asig).map(Number).sort((a, b) => a - b).forEach(d => {
            const fecha = new Date(anio, mes - 1, d);
            const fechaStr = fecha.toLocaleDateString("es-CL", { year: "numeric", month: "2-digit", day: "2-digit" });

            TURNOS.forEach(t => {
                const id = asig[d]?.[t] || null;
                const f = id ? funcionarioMap.get(id) : null;
                rows.push({
                    Fecha: fechaStr,
                    Turno: t,
                    Funcionario: f?.nombreCompleto || "-",
                    Grado: f?.siglasCargo || "-",
                    Antigüedad: f?.antiguedad != null ? String(f.antiguedad) : "-",
                    Unidad: f?.unidad && f.unidad !== "-" ? f.unidad : "-"
                });
            });
        });
        if (!rows.length) { alert("Sin datos para exportar."); return; }
        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'])) };
            ws['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws, "Turnos");
            const monthStr = String(mes).padStart(2, '0');
            const filename = `Turnos_${anio}_${monthStr}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (error) {
            alert("Ocurrió un error al exportar a Excel.");
        }
    };

    /* ------------------- UI Render ------------------- */

    const confirmationModal = (
        <Modal show={showConfirmModal} onHide={handleCancelChange} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Cambio de Asignación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {pendingChange ? (
                    <>
                        <p>Está a punto de cambiar la asignación para:</p>
                        <ul>
                            <li><strong>Día:</strong> {pendingChange.dia}</li>
                            <li><strong>Turno:</strong> {pendingChange.turno}</li>
                        </ul>
                        <hr />
                        <div className="mb-3">
                            <strong>Funcionario Actual:</strong>
                            {pendingChange.detPrev ? (
                                <div className="ps-2">
                                    <div>Nombre: {pendingChange.detPrev.nombreCompleto}</div>
                                    <div>Grado: {pendingChange.detPrev.siglasCargo}</div>
                                    <div>Antigüedad: {pendingChange.detPrev.antiguedad ?? '-'}</div>
                                </div>
                            ) : (<div className="ps-2 text-muted">- Ninguno -</div>)}
                        </div>
                        <div className="mb-3">
                            <strong>Nuevo Funcionario:</strong>
                            {pendingChange.detNew ? (
                                <div className="ps-2">
                                    <div>Nombre: {pendingChange.detNew.nombreCompleto}</div>
                                    <div>Grado: {pendingChange.detNew.siglasCargo}</div>
                                    <div>Antigüedad: {pendingChange.detNew.antiguedad ?? '-'}</div>
                                </div>
                            ) : (<div className="ps-2 text-muted">- Sin Asignar -</div>)}
                        </div>
                        <hr />
                        <p><strong>Comparación Jerarquía:</strong> {pendingChange.comparisonResult}</p>
                        <p className="mt-3">¿Desea confirmar este cambio?</p>
                    </>
                ) : (<p>Cargando detalles del cambio...</p>)}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancelChange}>Cancelar</Button>
                <Button variant="primary" onClick={handleConfirmChange} disabled={!pendingChange}>Confirmar Cambio</Button>
            </Modal.Footer>
        </Modal>
    );

    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{
                maxWidth: 1920,
                margin: "0 auto",
                background: "#fff",
                borderRadius: "1.5rem",
                boxShadow: "0 8px 32px #174e7d15",
                padding: "32px 36px",
            }}>
                <h3 className="fw-bold mb-3" style={{
                    color: azulPrincipal,
                    letterSpacing: ".09em",
                    borderLeft: `5px solid ${dorado}`,
                    paddingLeft: "1rem"
                }}>
                    Asignación de Turnos por Día
                </h3>

                <Card className="shadow-sm mb-4 border-0" style={{
                    borderRadius: 16,
                    background: azulClaro,
                    padding: "18px 22px"
                }}>
                    <Row className="align-items-end">
                        <Col xs={12} md={5} className="mb-2 mb-md-0">
                            <Form.Label htmlFor="selectMes" className="fw-semibold" style={{ color: azulPrincipal }}>Mes</Form.Label>
                            <Form.Select id="selectMes" value={mes} disabled={loading}
                                style={{ borderRadius: 11 }}
                                onChange={e => { setMes(+e.target.value); setSem(0); }}>
                                {[...Array(12)].map((_, i) =>
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2000, i, 1).toLocaleDateString("es-ES", { month: "long" }).toUpperCase()}
                                    </option>)}
                            </Form.Select>
                        </Col>
                        <Col xs={12} md={4} className="mb-2 mb-md-0">
                            <Form.Label htmlFor="inputAnio" className="fw-semibold" style={{ color: azulPrincipal }}>Año</Form.Label>
                            <Form.Control id="inputAnio" type="number" value={anio} disabled={loading}
                                style={{ borderRadius: 11 }}
                                onChange={e => { setAnio(+e.target.value); setSem(0); }} />
                        </Col>
                        <Col xs={12} md={3} className="d-flex justify-content-start justify-content-md-end mt-3 mt-md-0 align-items-center">
                            <Button size="sm" className="me-2"
                                style={{
                                    background: "linear-gradient(120deg, #4f7eb9 50%, #7fa6da 100%)",
                                    border: "none", borderRadius: 11, fontWeight: 500
                                }}
                                title="Volver a generar turnos para este mes/año (descarta cambios manuales)"
                                disabled={loading || funcs.length === 0}
                                onClick={handleGenerar}>
                                <FaSyncAlt className="me-1" /> Regenerar
                            </Button>
                            <Button size="sm" className="me-2"
                                style={{
                                    background: "linear-gradient(120deg, #2a4d7c 60%, #4f7eb9 100%)",
                                    border: "none", borderRadius: 11, fontWeight: 500
                                }}
                                title="Guardar asignaciones actuales en la base de datos"
                                disabled={loading || !Object.keys(asig).length}
                                onClick={handleGuardar}>
                                {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />}
                                <FaSave className="me-1" /> Guardar
                            </Button>
                            <Button size="sm"
                                style={{
                                    background: "linear-gradient(120deg, #41b475 70%, #a6e3cf 100%)",
                                    border: "none", borderRadius: 11, fontWeight: 500, color: "#234"
                                }}
                                title="Exportar tabla actual a Excel"
                                disabled={loading || !Object.keys(asig).length}
                                onClick={handleExport}>
                                <FaFileExcel className="me-1" /> Exportar
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Grid */}
                {!loading && semanas.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-4 py-2 px-3" style={{
                        background: azulClaro, borderRadius: 12
                    }}>
                        <Button size="sm" variant="outline-secondary" style={{ borderRadius: 11, minWidth: 90 }}
                            disabled={sem === 0}
                            onClick={() => setSem(s => s - 1)}>← Semana Ant.</Button>
                        <span className="fw-semibold" style={{ color: azulPrincipal, fontSize: 17 }}>Semana {sem + 1} de {semanas.length}</span>
                        <Button size="sm" variant="outline-secondary" style={{ borderRadius: 11, minWidth: 90 }}
                            disabled={sem === semanas.length - 1}
                            onClick={() => setSem(s => s + 1)}>Semana Sig. →</Button>
                    </div>
                )}

                {!loading && semanas.length > 0 && (
                    <Row className="g-4">
                        {semanas[sem].map(([dStr, tDia]) => {
                            const dia = +dStr;
                            const fecha = new Date(anio, mes - 1, dia);
                            const fechaStr = fecha.toLocaleDateString("es-CL", { weekday: "short", day: "2-digit" });
                            const isWeekend = [0, 6].includes(fecha.getDay());
                            return (
                                <Col xs={12} sm={6} md={4} lg={3} xl={2} key={`${anio}-${mes}-${dia}`}>
                                    <Card className="h-100 border-0 shadow-sm"
                                        style={{
                                            borderRadius: 17,
                                            background: isWeekend ? "#f0f5fa" : "#fff",
                                            minHeight: 270,
                                            transition: "box-shadow .16s"
                                        }}>
                                        <Card.Header
                                            className="text-center fw-bold small"
                                            style={{
                                                borderTopLeftRadius: 17,
                                                borderTopRightRadius: 17,
                                                background: isWeekend ? azulPastel : "#f5f7fc",
                                                color: textoPrincipal,
                                                border: "none",
                                                letterSpacing: 0.1,
                                                fontSize: 15
                                            }}>
                                            {fechaStr} <span className="fw-normal" style={{ fontWeight: 400 }}>({dia})</span>
                                        </Card.Header>
                                        <Card.Body className="p-2">
                                            {TURNOS.map(t => {
                                                const idSel = tDia?.[t] || "";
                                                const det = idSel ? funcionarioMap.get(idSel) : null;
                                                return (
                                                    <div key={t} className="mb-2">
                                                        <small
                                                            className="fw-semibold d-block text-truncate"
                                                            title={t}
                                                            style={{
                                                                color: textoPrincipal,
                                                                background: badgeTurno,
                                                                borderRadius: 8,
                                                                padding: "2px 8px",
                                                                fontSize: 13.7,
                                                                marginBottom: 3
                                                            }}
                                                        >{t}</small>
                                                        <Form.Select
                                                            size="sm"
                                                            className="mt-1"
                                                            style={{ borderRadius: 10, fontSize: 14.2 }}
                                                            value={idSel}
                                                            title={det ? `${det.nombreCompleto} (${det.siglasCargo})` : 'Sin Asignar'}
                                                            onChange={e => handleChange(dia, t, e.target.value)}
                                                            disabled={loading}
                                                        >
                                                            <option value="">- Sin Asignar -</option>
                                                            {det && !dropdown.some(f => f.id === det.id) &&
                                                                <option key={`current-${det.id}`} value={det.id}>*{det.nombreCompleto}</option>}
                                                            {dropdown.map(f =>
                                                                <option key={f.id} value={f.id}>{f.nombreCompleto}</option>)}
                                                        </Form.Select>
                                                        {det && (
                                                            <div className="text-muted small mt-1 text-truncate" title={`${det.siglasCargo} · ${det.unidad && det.unidad !== "-" ? det.unidad : "Unidad no informada"}`}>
                                                                {det.siglasCargo} · {det.unidad && det.unidad !== "-" ? det.unidad : <span className="text-warning">Unidad no informada</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {!loading && Object.keys(asig).length === 0 && (
                    <div className="text-center text-muted mt-4" style={{ fontSize: 17 }}>
                        No hay turnos generados o cargados para este mes/año.
                    </div>
                )}

                {loading && (
                    <div className="text-center mt-5">
                        <Spinner animation="border" variant="primary" role="status" style={{ width: 48, height: 48 }} />
                    </div>
                )}

                {confirmationModal}
            </div>
            <style>
                {`
        .form-select:focus {
          box-shadow: 0 0 0 1.5px #4f7eb966 !important;
          border-color: #4f7eb9 !important;
        }
        .card:hover { box-shadow: 0 8px 32px #4f7eb91a !important; }
      `}
            </style>
        </div>
    );
}