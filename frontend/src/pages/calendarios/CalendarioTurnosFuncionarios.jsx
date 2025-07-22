import React, { useMemo, useState, useEffect } from "react";
import { Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";

/* -------------------------------------------------------------------------- */
/*  Mapeo roles → etiqueta amigable                                            */
/* -------------------------------------------------------------------------- */
const defaultRoles = [
    { value: "JEFE_DE_SERVICIO",  label: "Jefe de Servicio" },
    { value: "JEFE_DE_MAQUINA",   label: "Jefe de máquina" },
    { value: "PRIMER_TRIPULANTE", label: "Primer tripulante" },
    { value: "SEGUNDO_TRIPULANTE",label: "Segundo tripulante" },
    { value: "TRIPULANTE",        label: "Tripulante" },
    { value: "ENCARGADO_DE_TURNO",label: "Encargado de turno" },
    { value: "ENCARGADO_DE_GUARDIA",label: "Encargado de guardia" },
    { value: "AYUDANTE_DE_GUARDIA", label: "Ayudante de guardia" },
    { value: "JEFE_DE_RONDA",     label: "Jefe de ronda" },
    { value: "GUARDIA_ARMADO",    label: "Guardia armado" },
    { value: "REFUERZO_DE_GUARDIA",label: "Refuerzo de guardia" }
];

const rolToLabel = (rol) => {
    console.log(rol);
    const a = defaultRoles.find(r => r.value === rol)?.label || rol;
    return a;
}

/* -------------------------------------------------------------------------- */
/*  Componente                                                                */
/* -------------------------------------------------------------------------- */
/**
 * props:
 *   asignaciones : array de slots
 *   mes, anio    : números
 *   compareAntiguedad (opcional) : función para ordenar
 */
export default function CalendarioTurnosFuncionarios({
                                                         asignaciones = [],
                                                         mes,
                                                         anio,
                                                         compareAntiguedad
                                                     }) {
    /* --------------------------------- filtros --------------------------------- */
    const [filtroNombre,        setFiltroNombre]        = useState("");
    const [filtroTurnosMin,     setFiltroTurnosMin]     = useState("");
    const [filtroTurnosMax,     setFiltroTurnosMax]     = useState("");
    const [filtroTurnoTexto,    setFiltroTurnoTexto]    = useState("");
    const [filtroDiaSeleccionado,setFiltroDiaSeleccionado] = useState("");
    const [soloGrupoDelDia,     setSoloGrupoDelDia]     = useState(false);

    const [nombresUnicos, setNombresUnicos] = useState([]);

    console.log("Asignaciones recibidas:", asignaciones);

    /* lista de nombres para el filtro desplegable */
    useEffect(() => {
        const nombres = asignaciones.map(a => a.nombreFuncionario).filter(Boolean);
        setNombresUnicos(["", ...new Set(nombres)].sort());
    }, [asignaciones]);

    const limpiarFiltros = () => {
        setFiltroNombre("");
        setFiltroTurnosMin("");
        setFiltroTurnosMax("");
        setFiltroTurnoTexto("");
        setFiltroDiaSeleccionado("");
        setSoloGrupoDelDia(false);
    };

    /* ---------------------------------- días ----------------------------------- */
    const diasDelMes = useMemo(() => {
        const total = new Date(anio, mes, 0).getDate();     // ej. 30 o 31
        return Array.from({ length: total }, (_, i) => i + 1);
    }, [mes, anio]);

    const esWE = useMemo(() => {
        const map = {};
        diasDelMes.forEach(d => {
            const dow = new Date(anio, mes - 1, d).getDay();  // 0=Domingo,6=Sábado
            map[d] = dow === 0 || dow === 6;
        });
        return map;
    }, [diasDelMes, mes, anio]);

    /* ----------------------------- agrupación & orden --------------------------- */
    const { listaPersonas, sumaPorDia, totalGeneral } = useMemo(() => {
        // 1. Agrupar por funcionario
        const base = new Map();

        asignaciones.forEach(slot => {
            if (!base.has(slot.idFuncionario)) {
                base.set(slot.idFuncionario, {
                    idFuncionario:           slot.idFuncionario,
                    nombreFuncionario:       slot.nombreFuncionario,
                    gradoFuncionario:        slot.gradoFuncionario,
                    antiguedadFuncionario:   slot.antiguedadFuncionario,
                    dias:   new Set(),
                    total:  0,
                    turnos: [],
                    turnosPorDia: {}
                });
            }
            const p  = base.get(slot.idFuncionario);
            const dia = Number(slot.fecha.split("-")[2]);
            p.dias.add(dia);
            p.total += 1;
            p.turnos.push(slot.rolRequerido);
            p.turnosPorDia[dia] = slot;
        });

        // 2. Suma por día (fila de totales)
        const sumDia = Object.fromEntries(diasDelMes.map(d => [d, 0]));
        asignaciones.forEach(a => {
            const d = Number(a.fecha.split("-")[2]);
            sumDia[d] += 1;
        });
        const totalGen = Object.values(sumDia).reduce((acc, v) => acc + v, 0);

        // 3. Filtro “solo grupo del día”
        let grupoDelDia = new Set();
        if (soloGrupoDelDia && filtroDiaSeleccionado) {
            asignaciones
                .filter(a => Number(a.fecha.split("-")[2]) === Number(filtroDiaSeleccionado))
                .forEach(a => grupoDelDia.add(a.idFuncionario));
        }

        // 4. Aplicar filtros
        const list = Array.from(base.values()).filter(p => {
            if (soloGrupoDelDia && filtroDiaSeleccionado && !grupoDelDia.has(p.idFuncionario)) return false;
            if (filtroNombre && p.nombreFuncionario !== filtroNombre) return false;

            const minOk = !filtroTurnosMin || p.total >= Number(filtroTurnosMin);
            const maxOk = !filtroTurnosMax || p.total <= Number(filtroTurnosMax);
            if (!minOk || !maxOk) return false;

            if (filtroTurnoTexto) {
                const ok = p.turnos.some(t =>
                    rolToLabel(t).toLowerCase().includes(filtroTurnoTexto.toLowerCase())
                );
                if (!ok) return false;
            }
            return true;
        });

        // 5. Ordenar con la jerarquía de grados + antigüedad
        list.sort(compareAntiguedad);

        return { listaPersonas: list, sumaPorDia: sumDia, totalGeneral: totalGen };
    }, [
        asignaciones, diasDelMes,
        filtroNombre, filtroTurnosMin, filtroTurnosMax,
        filtroTurnoTexto, filtroDiaSeleccionado, soloGrupoDelDia,
        compareAntiguedad
    ]);

    console.log("Lista de personas:", listaPersonas);

    /* --------------------------------- render ---------------------------------- */
    return (
        <div className="table-responsive">
            <h5 className="fw-bold mt-5 mb-3">Calendario Visual de Turnos</h5>

            {/* --------------------------- barra de filtros --------------------------- */}
            <div className="mb-3 p-2 bg-light border rounded">
                <div className="row g-2 align-items-end">

                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Buscar por nombre</label>
                        <select
                            className="form-select"
                            value={filtroNombre}
                            onChange={e => setFiltroNombre(e.target.value)}
                        >
                            {nombresUnicos.map(n => (
                                <option key={n || "todos"} value={n}>
                                    {n || "Todos los nombres"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Mín. turnos</label>
                        <input
                            type="number"
                            className="form-control"
                            value={filtroTurnosMin}
                            onChange={e => setFiltroTurnosMin(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Máx. turnos</label>
                        <input
                            type="number"
                            className="form-control"
                            value={filtroTurnosMax}
                            onChange={e => setFiltroTurnosMax(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">Turno contiene</label>
                        <input
                            type="text"
                            className="form-control"
                            value={filtroTurnoTexto}
                            onChange={e => setFiltroTurnoTexto(e.target.value)}
                        />
                    </div>

                    <div className="col-md-1">
                        <label className="form-label fw-semibold">Día</label>
                        <input
                            type="number"
                            className="form-control"
                            min={1}
                            max={diasDelMes.length}
                            value={filtroDiaSeleccionado}
                            onChange={e => setFiltroDiaSeleccionado(e.target.value)}
                        />
                    </div>

                    <div className="col-md-1 text-end">
                        <label className="form-label d-block">&nbsp;</label>
                        <Button variant="outline-secondary" size="sm" onClick={limpiarFiltros}>
                            Limpiar
                        </Button>
                    </div>

                    <div className="col-md-1">
                        <div className="form-check mt-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="soloGrupoDia"
                                checked={soloGrupoDelDia}
                                onChange={e => setSoloGrupoDelDia(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="soloGrupoDia">
                                Solo grupo
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* ----------------------------- tabla principal -------------------------- */}
            <Table bordered hover size="sm" className="text-center align-middle">
                <thead className="sticky-top">
                <tr>
                    <th className="table-light">#</th>
                    <th className="table-light">Funcionario</th>
                    {diasDelMes.map(d => (
                        <th
                            key={d}
                            className={esWE[d] ? "bg-warning bg-opacity-25" : "table-light"}
                        >
                            {d}
                        </th>
                    ))}
                    <th className="table-light">
                        Total<br />turnos
                    </th>
                </tr>
                </thead>

                <tbody>
                {listaPersonas.map((p, idx) => (
                    <tr key={p.idFuncionario}>
                        <td>{idx + 1}</td>
                        <td className="text-start">
                            {p.gradoFuncionario && <strong>{p.gradoFuncionario} </strong>}
                            {p.nombreFuncionario}
                        </td>

                        {diasDelMes.map(d => (
                            <td key={d}>
                                {p.dias.has(d) ? (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`tt-${p.idFuncionario}-${d}`}>
                                                {p.turnosPorDia[d] ? (
                                                    <div className="text-start">
                                                        <div><b>Rol:</b> {rolToLabel(p.turnosPorDia[d].rolRequerido)}</div>
                                                        <div><b>Recinto:</b> {p.turnosPorDia[d].recinto}</div>
                                                        <div><b>Nombre servicio:</b> {p.turnosPorDia[d].nombreServicio}</div>
                                                        {/* Agrega cualquier otro campo relevante */}
                                                    </div>
                                                ) : null}
                                            </Tooltip>
                                        }
                                    >
                                        <span style={{ cursor: "pointer" }}>✔️</span>
                                    </OverlayTrigger>
                                ) : null}
                            </td>
                        ))}

                        <td className="fw-bold">{p.total}</td>
                    </tr>
                ))}
                </tbody>

                <tfoot>
                <tr className="table-secondary">
                    <td></td>
                    <td className="fw-bold text-end">Total&nbsp;servicios</td>
                    {diasDelMes.map(d => (
                        <td key={d} className="fw-bold">{sumaPorDia[d] || ""}</td>
                    ))}
                    <td className="fw-bold">{totalGeneral}</td>
                </tr>
                </tfoot>
            </Table>
        </div>
    );
}