import React, { useEffect, useState, useRef } from "react";
import CalendarioTurnosFuncionarios from "./CalendarioTurnosFuncionarios.jsx";
import axios from "axios";
import * as XLSX from "xlsx";

export default function VistaCalendarioTurnosFiltros() {
    const [asig, setAsig]           = useState({});
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [mes, setMes]             = useState(new Date().getMonth() + 1);
    const [anio, setAnio]           = useState(new Date().getFullYear());

    /* ----------  NUEVO: referencia al calendario  ---------- */
    const calendarioRef = useRef(null);

    /* ----------  Carga de datos (sin cambios)  ---------- */
    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/mes`,
                { params: { mes, anio } }),
            axios.get(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/disponibles`,
                { params: { selectedMes: mes, selectedAnio: anio } })
        ])
            .then(([turnosResp, funcsResp]) => {
                const byDay = {};
                (turnosResp.data || []).forEach(dia => {
                    byDay[dia.dia] = {};
                    (dia.asignaciones || []).forEach(as =>
                        byDay[dia.dia][as.nombreTurno] = Number(as.idFuncionario)
                    );
                });

                const list = (funcsResp.data || []).map(f => ({
                    ...f,
                    id: Number(f.idFuncionario || f.id),
                    nombreCompleto: f.nombreCompleto || "",
                    unidad: f.unidad || f.siglasUnidad || "-",
                    siglasCargo: f.siglasCargo || ""
                }));

                setAsig(byDay);
                setFuncionarios(list);
            })
            .catch(() => {
                setAsig({});
                setFuncionarios([]);
            })
            .finally(() => setLoading(false));
    }, [mes, anio]);

    /* ----------  Hay datos?  ---------- */
    const hayDatos =
        funcionarios.length > 0 &&
        Object.values(asig).some(dia => Object.keys(dia).length > 0);

    /* ----------  Exportar a Excel  ---------- */
    const exportarExcel = () => {
        // 1) lista realmente visible:
        const visibles =
            calendarioRef.current?.getVisibleFuncionarios?.() || funcionarios;

        // 2) resto igual
        const totalDias = new Date(anio, mes, 0).getDate();
        const header = [
            "#",
            "Funcionario",
            ...Array.from({ length: totalDias }, (_, i) => (i + 1).toString()),
            "Total turnos"
        ];

        const rows = visibles.map((f, idx) => {
            const fila = [
                idx + 1,
                `${f.siglasCargo || ""} ${f.nombreCompleto} (${f.unidad})`
            ];
            let total = 0;
            for (let d = 1; d <= totalDias; d++) {
                let turno = "";
                if (asig[d]) {
                    Object.entries(asig[d]).forEach(([nombreTurno, idFunc]) => {
                        if (idFunc === f.id) {
                            turno = nombreTurno;
                            total++;
                        }
                    });
                }
                fila.push(turno);
            }
            fila.push(total);
            return fila;
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Calendario");
        XLSX.writeFile(wb, `CalendarioTurnos_${mes}_${anio}.xlsx`);
    };

    /* ----------  Render  ---------- */
    return (
        <div>
            <h3>Calendario de Turnos</h3>

            {/* controles de mes / año y botón */}
            <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
                <label>Mes:</label>
                <input
                    type="number"
                    className="form-control"
                    style={{ width: 90 }}
                    value={mes}
                    min={1}
                    max={12}
                    onChange={e => setMes(+e.target.value)}
                />

                <label className="ms-2">Año:</label>
                <input
                    type="number"
                    className="form-control"
                    style={{ width: 110 }}
                    value={anio}
                    min={2000}
                    max={2100}
                    onChange={e => setAnio(+e.target.value)}
                />

                <button
                    className="btn btn-success ms-3"
                    onClick={exportarExcel}
                    disabled={!hayDatos}
                >
                    Exportar a Excel
                </button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : hayDatos ? (
                <CalendarioTurnosFuncionarios
                    ref={calendarioRef}          //* 👉 pasa la ref
                    asig={asig}
                    funcionarios={funcionarios}
                    mes={mes}
                    anio={anio}
                />
            ) : (
                <div className="alert alert-info text-center mt-4">
                    <strong>No hay turnos disponibles para el mes/año seleccionados.</strong>
                </div>
            )}
        </div>
    );
}