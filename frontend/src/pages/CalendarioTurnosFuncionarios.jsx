import React, { useMemo, useState, useEffect } from "react";
import { Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { compareFuncionarioHierarchy } from "./AsignacionTurnosMensual";

export default function CalendarioTurnosFuncionarios({ asig, funcionarios, mes, anio }) {
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroUnidad, setFiltroUnidad] = useState("");
    const [filtroTurnosMin, setFiltroTurnosMin] = useState("");
    const [filtroTurnosMax, setFiltroTurnosMax] = useState("");
    const [filtroTurnoTexto, setFiltroTurnoTexto] = useState("");
    const [filtroDiaSeleccionado, setFiltroDiaSeleccionado] = useState("");
    const [soloGrupoDelDia, setSoloGrupoDelDia] = useState(false);

    // Estados para las listas precargadas
    const [nombresUnicos, setNombresUnicos] = useState([]);
    const [unidadesUnicas, setUnidadesUnicas] = useState([]);

    useEffect(() => {
        if (funcionarios) {
            const todosLosNombres = funcionarios.map(f => f.nombreCompleto).filter(Boolean);
            setNombresUnicos(["", ...new Set(todosLosNombres)].sort()); // Agrega opción "Todos" y ordena

            const todasLasUnidades = funcionarios.map(f => f.unidad).filter(Boolean);
            setUnidadesUnicas(["", ...new Set(todasLasUnidades)].sort()); // Agrega opción "Todos" y ordena
        }
    }, [funcionarios]);

    const limpiarFiltros = () => {
        setFiltroNombre("");
        setFiltroUnidad("");
        setFiltroTurnosMin("");
        setFiltroTurnosMax("");
        setFiltroTurnoTexto("");
        setFiltroDiaSeleccionado("");
        setSoloGrupoDelDia(false);
    };

    const diasDelMes = useMemo(() => {
        const total = new Date(anio, mes, 0).getDate();
        return Array.from({ length: total }, (_, i) => i + 1);
    }, [mes, anio]);

    const esWE = useMemo(() => {
        const map = {};
        diasDelMes.forEach(d => {
            const dow = new Date(anio, mes - 1, d).getDay();
            map[d] = dow === 0 || dow === 6;
        });
        return map;
    }, [diasDelMes, mes, anio]);

    const { listaPersonas, sumaPorDia, totalGeneral } = useMemo(() => {
        const base = new Map(funcionarios.map(f => [f.id, f]));
        const stats = new Map();

        base.forEach((f, id) =>
            stats.set(id, { info: f, dias: new Set(), total: 0, turnos: [] })
        );

        Object.entries(asig).forEach(([diaStr, objDia]) => {
            const dia = +diaStr;
            Object.entries(objDia).forEach(([nombreTurno, id]) => {
                if (!stats.has(id)) {
                    stats.set(id, {
                        info: { id, nombreCompleto: `(ID ${id})`, siglasCargo: "" },
                        dias: new Set(), total: 0, turnos: []
                    });
                }
                const st = stats.get(id);
                st.dias.add(dia);
                st.total += 1;
                st.turnos.push(nombreTurno);
            });
        });

        const sumDia = Object.fromEntries(diasDelMes.map(d => [d, 0]));
        Object.entries(asig).forEach(([dStr, objDia]) => {
            sumDia[+dStr] += Object.keys(objDia).length;
        });
        const totalGen = Object.values(sumDia).reduce((a, v) => a + v, 0);

        let grupoDelDia = new Set();
        if (soloGrupoDelDia && filtroDiaSeleccionado && asig[filtroDiaSeleccionado]) {
            Object.values(asig[filtroDiaSeleccionado]).forEach(id => grupoDelDia.add(id));
        }

        const list = Array.from(stats.values())
            .filter(p => {
                if (soloGrupoDelDia && filtroDiaSeleccionado && !grupoDelDia.has(p.info.id)) return false;

                // Filtro por nombre (ahora es una selección exacta o "todos")
                if (filtroNombre && p.info.nombreCompleto !== filtroNombre) return false;

                // Filtro por unidad (ahora es una selección exacta o "todos")
                if (filtroUnidad && p.info.unidad !== filtroUnidad) return false;


                const minOk = !filtroTurnosMin || p.total >= parseInt(filtroTurnosMin);
                const maxOk = !filtroTurnosMax || p.total <= parseInt(filtroTurnosMax);
                if (!minOk || !maxOk) return false;

                if (filtroTurnoTexto) {
                    const turnoMatch = p.turnos.some(t => t.toLowerCase().includes(filtroTurnoTexto.toLowerCase()));
                    if (!turnoMatch) return false;
                }

                return true;
            })
            .sort((a, b) => compareFuncionarioHierarchy(a.info, b.info));

        return { listaPersonas: list, sumaPorDia: sumDia, totalGeneral: totalGen };
    }, [asig, funcionarios, diasDelMes, filtroNombre, filtroUnidad, filtroTurnosMin, filtroTurnosMax, filtroTurnoTexto, filtroDiaSeleccionado, soloGrupoDelDia]);

    return (
        <div className="table-responsive">
            <h5 className="fw-bold mt-5 mb-3">Calendario Visual de Turnos</h5>
            <div className="mb-3 p-2 bg-light border rounded">
                <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Buscar por nombre</label>
                        <select
                            className="form-select"
                            value={filtroNombre}
                            onChange={e => setFiltroNombre(e.target.value)}
                        >
                            {nombresUnicos.map(nombre => (
                                <option key={nombre || "todos-nombres"} value={nombre}>
                                    {nombre || "Todos los nombres"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Filtrar por unidad</label>
                        <select
                            className="form-select"
                            value={filtroUnidad}
                            onChange={e => setFiltroUnidad(e.target.value)}
                        >
                            {unidadesUnicas.map(unidad => (
                                <option key={unidad || "todas-unidades"} value={unidad}>
                                    {unidad || "Todas las unidades"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Mín. turnos</label>
                        <input type="number" className="form-control" value={filtroTurnosMin}
                               onChange={e => setFiltroTurnosMin(e.target.value)} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Máx. turnos</label>
                        <input type="number" className="form-control" value={filtroTurnosMax}
                               onChange={e => setFiltroTurnosMax(e.target.value)} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Turno contiene</label>
                        <input type="text" className="form-control" value={filtroTurnoTexto}
                               onChange={e => setFiltroTurnoTexto(e.target.value)} />
                    </div>
                    <div className="col-md-1">
                        <label className="form-label fw-semibold">Día</label>
                        <input type="number" className="form-control" min={1} max={diasDelMes.length}
                               value={filtroDiaSeleccionado}
                               onChange={e => setFiltroDiaSeleccionado(e.target.value)} />
                    </div>
                    <div className="col-md-1 text-end">
                        <label className="form-label d-block">&nbsp;</label>
                        <Button variant="outline-secondary" size="sm" onClick={limpiarFiltros}>Limpiar</Button>
                    </div>
                    <div className="col-md-1">
                        <div className="form-check mt-4">
                            <input className="form-check-input" type="checkbox" id="soloGrupoDia"
                                   checked={soloGrupoDelDia}
                                   onChange={e => setSoloGrupoDelDia(e.target.checked)} />
                            <label className="form-check-label" htmlFor="soloGrupoDia">
                                Solo grupo
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <Table bordered hover size="sm" className="text-center align-middle">
                <thead className="sticky-top">
                <tr>
                    <th className="table-light">#</th>
                    <th className="table-light">Funcionario</th>
                    {diasDelMes.map(d =>
                        <th key={d} className={esWE[d] ? "bg-warning bg-opacity-25" : "table-light"}>{d}</th>)}
                    <th className="table-light">Total<br />turnos</th>
                </tr>
                </thead>

                <tbody>
                {listaPersonas.map((p, idx) => (
                    <tr key={p.info.id}>
                        <td>{idx + 1}</td>
                        <td className="text-start d-flex flex-column">
                            <div>
                                {p.info.siglasCargo && <strong>{p.info.siglasCargo} </strong>}
                                {p.info.nombreCompleto}
                            </div>
                            <div>
                                <span className="badge bg-primary bg-opacity-75">{p.info.unidad}</span>
                            </div>
                        </td>

                        {diasDelMes.map(d => {
                            const isDiaSeleccionado = parseInt(filtroDiaSeleccionado) === d;
                            const esAsignado = p.dias.has(d);

                            let tipoTurno = null;
                            if (esAsignado && asig[d]) {
                                tipoTurno = Object.entries(asig[d]).find(([turno, id]) => id === p.info.id)?.[0] || null;
                            }

                            let esMasAntiguo = false;
                            if (isDiaSeleccionado && asig[d]) {
                                const idsDelDia = Object.values(asig[d]);
                                const funcionariosDelDia = idsDelDia
                                    .map(id => funcionarios.find(f => f.id === id))
                                    .filter(Boolean);
                                const ordenados = [...funcionariosDelDia].sort(compareFuncionarioHierarchy);
                                esMasAntiguo = ordenados[0]?.id === p.info.id;
                            }

                            const clases = [
                                esWE[d] ? "bg-warning bg-opacity-10" : "",
                                esMasAntiguo ? "fw-bold bg-success bg-opacity-10" : ""
                            ].join(" ").trim();

                            return (
                                <td key={d} className={clases}>
                                    {esAsignado ? (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-${d}-${p.info.id}`}>{tipoTurno}</Tooltip>}
                                        >
                                            <span style={{ cursor: "pointer" }}>✔️</span>
                                        </OverlayTrigger>
                                    ) : ""}
                                </td>
                            );
                        })}
                        <td className="fw-bold">{p.total}</td>
                    </tr>
                ))}
                </tbody>

                <tfoot>
                <tr className="table-secondary">
                    <td></td>
                    <td className="fw-bold text-end">Total&nbsp;servicios</td>
                    {diasDelMes.map(d =>
                        <td key={d} className="fw-bold">{sumaPorDia[d] || ""}</td>)}
                    <td className="fw-bold">{totalGeneral}</td>
                </tr>
                </tfoot>
            </Table>
        </div>
    );
}