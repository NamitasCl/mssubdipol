/**************************************************************************
 *  AsignacionTurnosMensual.jsx                                           *
 *  (Carga asignaciones guardadas + generación iterativa sin duplicados)  *
 **************************************************************************/

import React, { useEffect, useMemo, useState } from "react";
import axios                from "axios";
import { Row, Col, Form, Spinner, Button, Card, Modal } from "react-bootstrap";
import * as XLSX            from "xlsx";
import CalendarioTurnosFuncionarios from "../calendarios/CalendarioTurnosFuncionarios.jsx";
import { FaSyncAlt, FaSave, FaFileExcel } from "react-icons/fa"; // Para iconos de botones

const azulPastel = "#b1cfff";
const azulPrincipal = "#2a4d7c";
const azulClaro = "#eaf4fb";
const dorado = "#FFC700";
const grisBg = "#f7fafd";
const textoPrincipal = "#22334a";
const badgeTurno = "#f3fafb";

/* ---------- Endpoints ---------- */
const ENDPOINT_FUNC_DISP   = `${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/disponibles`;
const ENDPOINT_DND         = `${import.meta.env.VITE_TURNOS_API_URL}/funcionarios/dias-no-disponibles`;
const ENDPOINT_SAVE_DIA    = `${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/dia`;
const ENDPOINT_EXISTENTES  = `${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/mes`;

/* ---------- Reglas ---------- */
const MIN_SEP_1 = 3, MAX_WE_1 = 2;    // barrido 1
const MIN_SEP_2 = 2, MAX_WE_2 = 3;    // barrido 2
const MIN_SEP_3 = 2, MAX_WE_3 = 3;    // balance final

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
    "PFT","SPF","SPF (OPP)","COM","COM (OPP)",
    "SBC","SBC (OPP)","ISP","SBI","DTV","APS","AP","APP","APP (AC)",
];

/* ---------- Utilidades ---------- */
const norm  = s => (s || "").replace(/\s+/g, " ").replace(/\s+\(/g, " (").trim().toUpperCase();
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
const order   = arr => [...arr].sort(compareFuncionarioHierarchy);
const shuffle = a => { a = [...a]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const isNight = t => t.includes("Segunda");
const ymd     = d => d.toLocaleDateString("sv-SE");
const dim     = (m,y) => new Date(y,m,0).getDate();
const parseDND = o => { const r={}; Object.entries(o||{}).forEach(([id,l])=> r[+id]=new Set(l)); return r; };

/* ---------- Parseo de asignaciones existentes ---------- */
function parseAsignacionesExistentes(dataApi = []){
    const byDay = {};
    const detallesMap = new Map();
    (Array.isArray(dataApi) ? dataApi : []).forEach(regDia => {
        const dia = +regDia.dia;
        (regDia.asignaciones || []).forEach(a => {
            const id = +a.idFuncionario;
            const turno = a.nombreTurno;
            if (!dia || !id || !turno) return;
            if (!byDay[dia]) byDay[dia] = {};
            byDay[dia][turno] = id;
            if (!detallesMap.has(id)) detallesMap.set(id, {
                id,
                nombreCompleto : a.nombreCompleto,
                siglasCargo    : a.siglasCargo,
                antiguedad     : a.antiguedad,
                unidad         : a.unidad || a.siglasUnidad || "-",
            });
        });
    });
    return { byDay, detalles: [...detallesMap.values()] };
}

/* ====================================================================== */

export default function AsignacionTurnosMensual(){

    /* ---------------- State ---------------- */
    const [funcs,setFuncs]   = useState([]);
    const [asig ,setAsig]    = useState({});
    const [dnd  ,setDnd]     = useState({});
    const [loading,setLoading]=useState(true);
    const [mes ,setMes]      = useState(new Date().getMonth()+1);
    const [anio,setAnio]     = useState(new Date().getFullYear());
    const [sem ,setSem]      = useState(0);
    const [showConfirmModal,setShowConfirmModal]=useState(false);
    const [pendingChange,setPendingChange] = useState(null);

    /* ---------------- Memos ---------------- */
    const byId = useMemo(()=>{
        const m = new Map();
        funcs.forEach(f=>{ m.set(f.id, f); });
        return order([...m.values()]);
    },[funcs]);

    const funcionarioMap = useMemo(() => new Map(byId.map(f => [f.id, f])), [byId]);

    const dropdown = useMemo(()=>{
        const seen=new Set();
        return byId.filter(f=>{
            const n=(f.nombreCompleto||"").trim();
            if(!n || seen.has(n)) return false;
            seen.add(n); return true;
        });
    },[byId]);

    const semanas = useMemo(()=>{
        const sortedDays = Object.keys(asig).map(Number).sort((a,b)=>a-b);
        const arr = sortedDays.map(d => [String(d), asig[d]]);
        const out=[]; for(let i=0;i<arr.length;i+=7) out.push(arr.slice(i,i+7));
        return out;
    },[asig]);

    /* ---------------- Carga inicial ---------------- */
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setAsig({});
                setPendingChange(null);
                setShowConfirmModal(false);

                /* ---- 1. Funcionarios disponibles ---- */
                const {data:list = []} = await axios.get(ENDPOINT_FUNC_DISP, {
                    params:{ selectedMes: mes, selectedAnio: anio }
                });

                const disp = list.map(f => ({
                    ...f,
                    id: +(f.id ?? f.idFuncionario ?? f.idFuncionario),
                    nombreCompleto: f.nombreCompleto || "",
                    siglasCargo: f.siglasCargo || "",
                    antiguedad: f.antiguedad ?? null,
                    unidad: f.unidad && f.unidad !== "-" ? f.unidad : ""
                }))
                    .filter(f => f && !isNaN(f.id));

                /* ---- 2. DND ---- */
                const {data:dndResp} = await axios.get(ENDPOINT_DND, { params:{ mes, anio } });
                const dndMap = parseDND(dndResp.diasNoDisponibles || {});

                /* ---- 3. Asignaciones existentes ---- */
                const { data: existentesResp } = await axios.get(ENDPOINT_EXISTENTES, { params:{ mes, anio } });
                const { byDay, detalles: detallesExistentes } = parseAsignacionesExistentes(existentesResp?.asignaciones ?? existentesResp);

                /* ---- 4. Deduplicar evitando filas repetidas Y siempre preferir los datos más completos ---- */
                const assignedIds = new Set();
                Object.values(byDay).forEach(dia => {
                    Object.values(dia).forEach(id => assignedIds.add(id));
                });

                const combinados = [
                    ...disp,
                    ...detallesExistentes.filter(det => !disp.some(d => d.id === det.id))
                ];

                // --- Bloque robusto: preferir datos completos y con unidad válida ---
                const mapNombre = new Map();
                combinados.forEach(f => {
                    const key = norm(f.nombreCompleto);
                    const prev = mapNombre.get(key);

                    if (!prev) {
                        mapNombre.set(key, f);
                    } else {
                        // ¿Cuál tiene mejor unidad?
                        const prevUnidadValida = prev.unidad && prev.unidad !== "-";
                        const currUnidadValida = f.unidad && f.unidad !== "-";

                        // ¿Cuál está asignado?
                        const prevAssigned = assignedIds.has(prev.id);
                        const currAssigned = assignedIds.has(f.id);

                        // Prefiere registro con unidad válida
                        if (!prevUnidadValida && currUnidadValida) {
                            mapNombre.set(key, f);
                        }
                        // Si ambos tienen unidad válida, prioriza el que esté asignado
                        else if (currUnidadValida && (!prevAssigned && currAssigned)) {
                            mapNombre.set(key, f);
                        }
                            // Si ambos tienen unidad válida y el anterior está asignado, lo deja igual
                        // Si ninguno tiene unidad válida, prefiere el asignado
                        else if (!prevUnidadValida && !currUnidadValida && (!prevAssigned && currAssigned)) {
                            mapNombre.set(key, f);
                        }
                        // En otros casos, deja el que ya estaba (prev)
                    }
                });

                const funcsFinal = order([...mapNombre.values()]);

                if (!alive) return;
                setFuncs(funcsFinal);
                setDnd(dndMap);

                if (Object.keys(byDay).length > 0) {
                    setAsig(byDay);
                } else {
                    await generarIterativo(funcsFinal, dndMap);
                }

            } catch (error) {
                console.error("Error loading initial data:", error);
                alert(`Error cargando datos iniciales: ${error.message}`);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [mes, anio]);

    /* ==================================================================== */
    /* ------------------------ GENERADOR ITERATIVO ----------------------- */
    /* ==================================================================== */

    const MAX_GENERATION_ATTEMPTS = 20;

    function verificarCombinacionIdeal(asignacionesIntento, diasDelMes, funcionariosDelIntento, conteoTurnosDelIntento) {
        if (!funcionariosDelIntento || funcionariosDelIntento.length === 0) {
            const hayTurnosAsignados = Object.values(asignacionesIntento).some(dia => Object.keys(dia).length > 0);
            return { esIdeal: !hayTurnosAsignados, detalle: "No hay funcionarios disponibles o no se asignaron turnos." };
        }

        let idsFuncionariosConTurnos = Object.keys(conteoTurnosDelIntento).filter(id => conteoTurnosDelIntento[id] > 0);
        if (idsFuncionariosConTurnos.length === 0) {
            const hayTurnosAsignados = Object.values(asignacionesIntento).some(dia => Object.keys(dia).length > 0);
            return { esIdeal: !hayTurnosAsignados, detalle: "Ningún funcionario tiene turnos asignados." };
        }

        let funcionariosCon1Turno = 0;
        let funcionariosCon2Turnos = 0;
        let funcionariosConMasDe2Turnos = 0;
        let detalleDesviaciones = [];

        for (const idFuncionario of idsFuncionariosConTurnos) {
            const count = conteoTurnosDelIntento[idFuncionario];
            if (count === 1) {
                funcionariosCon1Turno++;
            } else if (count === 2) {
                funcionariosCon2Turnos++;
            } else if (count > 0) { // Solo contar los que participaron y no tienen 1 o 2
                funcionariosConMasDe2Turnos++;
                detalleDesviaciones.push(`ID ${idFuncionario} tiene ${count} turnos.`);
            }
        }

        if (diasDelMes === 30) {
            if (funcionariosConMasDe2Turnos === 0 && funcionariosCon1Turno === 0 && idsFuncionariosConTurnos.length > 0) {
                return { esIdeal: true, detalle: `Mes de 30 días: ${idsFuncionariosConTurnos.length} funcionarios participaron, todos con 2 turnos.` };
            } else {
                return { esIdeal: false, detalle: `Mes de 30 días: No todos los ${idsFuncionariosConTurnos.length} participantes tienen 2 turnos. 1T:${funcionariosCon1Turno}, 2T:${funcionariosCon2Turnos}, >2T:${funcionariosConMasDe2Turnos}. Desv: ${detalleDesviaciones.join(', ')}` };
            }
        } else if (diasDelMes === 31) {
            if (funcionariosConMasDe2Turnos === 0 && funcionariosCon1Turno <= 1 && idsFuncionariosConTurnos.length > 0) {
                return { esIdeal: true, detalle: `Mes de 31 días: ${idsFuncionariosConTurnos.length} part. ${funcionariosCon2Turnos} con 2T, ${funcionariosCon1Turno} con 1T.` };
            } else {
                return { esIdeal: false, detalle: `Mes de 31 días: Regla no cumplida (<=1 con 1T, resto con 2T). 1T:${funcionariosCon1Turno}, 2T:${funcionariosCon2Turnos}, >2T:${funcionariosConMasDe2Turnos}. Desv: ${detalleDesviaciones.join(', ')}` };
            }
        } else {
            return { esIdeal: true, detalle: `Mes de ${diasDelMes} días. Verificación de ideal específica no aplicada.` };
        }
    }

    async function generarIterativo(rawFuncs, dndMapParam) {
        let asignacionFinal = {};
        let seEncontroIdeal = false;
        let detalleUltimoIntento = "No se realizaron intentos.";
        let mejorAsignacionNoIdeal = null;
        let detalleMejorNoIdeal = "";

        for (let intento = 1; intento <= MAX_GENERATION_ATTEMPTS; intento++) {
            const diasMes = dim(mes,anio);
            const tmpIntento = {}; for(let d=1;d<=diasMes;d++) tmpIntento[d]={};
            const ordIntento = order([...rawFuncs]);

            if (ordIntento.length === 0) {
                asignacionFinal = {};
                detalleUltimoIntento = "No hay funcionarios disponibles.";
                break;
            }

            const numGroups = TURNOS.length;
            const base = Math.floor(ordIntento.length/numGroups);
            const rest = ordIntento.length % numGroups;

            const groupsIntento = TURNOS.map((_,i)=>{
                const extra=i<rest?1:0;
                const start=i*base+Math.min(i,rest);
                const slice = ordIntento.slice(start,start+base+extra);
                return shuffle(slice);
            });

            const ptrIntento = TURNOS.reduce((m,t)=>({...m,[t]:0}),{});
            const lastIntento = {}, weCntIntento = {};
            const posOrdIntento = new Map(ordIntento.map((p, i) => [p.id, i]));

            const canUseIntento=(id,dia,turno,minSep,maxWe)=>{
                if (!id || !tmpIntento[dia]) return false;
                if(Object.values(tmpIntento[dia]).includes(id)) return false;
                if(lastIntento[id]!=null && dia-lastIntento[id]<minSep) return false;
                const d = new Date(anio,mes-1,dia);
                const isWE=[0,6].includes(d.getDay());
                if(isWE && (weCntIntento[id]||0)>=maxWe) return false;
                const hoy=ymd(d);
                if(dndMapParam[id]?.has(hoy)) return false;
                if(isNight(turno)){
                    const manana = new Date(d); manana.setDate(d.getDate() + 1);
                    if (manana.getMonth() === mes - 1) {
                        if(dndMapParam[id]?.has(ymd(manana))) return false;
                    }
                }
                return true;
            };

            const pickIntento=(list,t,dia,minSep,maxWe)=>{
                if(!Array.isArray(list) || list.length===0) return null;
                let i=ptrIntento[t]%list.length;
                let tried=0;
                while(tried<list.length){
                    const currentFunc = list[i];
                    if(currentFunc && currentFunc.id && canUseIntento(currentFunc.id,dia,t,minSep,maxWe)){
                        ptrIntento[t]=(i+1);
                        return currentFunc.id;
                    }
                    i=(i+1)%list.length;
                    tried++;
                }
                return null;
            };

            const barridoIntento=(minSep,maxWe)=>{
                for(let dia=1;dia<=diasMes;dia++){
                    if (!tmpIntento[dia]) tmpIntento[dia] = {};
                    for(let idx=0;idx<TURNOS.length;idx++){
                        const turno=TURNOS[idx];
                        if(tmpIntento[dia][turno]) continue;

                        let currentGroup = [...groupsIntento[idx]];
                        let groupIndex = idx;

                        if(turno.startsWith("Ayudante")){
                            const encTurnoPrefix = turno.includes("Principal") ? "Encargado Primera Guardia Principal" : "Encargado Primera Guardia Prevención";
                            const encTurnoAlt = turno.includes("Principal") ? "Encargado Segunda Guardia Principal" : "Encargado Segunda Guardia Prevención";
                            const encId = tmpIntento[dia][encTurnoPrefix] ?? tmpIntento[dia][encTurnoAlt];

                            if(!encId) continue;
                            const idxEnc = posOrdIntento.get(encId);
                            if (idxEnc === undefined) continue;

                            currentGroup = shuffle(ordIntento.slice(idxEnc+1));
                            ptrIntento[turno]=0;
                            if (currentGroup.length === 0) continue;
                        }

                        const id=pickIntento(currentGroup,turno,dia,minSep,maxWe);
                        if(id){
                            tmpIntento[dia][turno]=id;
                            lastIntento[id]=dia;
                            if([0,6].includes(new Date(anio,mes-1,dia).getDay()))
                                weCntIntento[id]=(weCntIntento[id]||0)+1;
                            if (!turno.startsWith("Ayudante") && ptrIntento[turno] >= groupsIntento[groupIndex].length){
                                groupsIntento[groupIndex]=shuffle(groupsIntento[groupIndex]);
                                ptrIntento[turno]=0;
                            }
                        }
                    }
                }
            };

            barridoIntento(MIN_SEP_1, MAX_WE_1);
            barridoIntento(MIN_SEP_2, MAX_WE_2);

            const useCntIntentoActual = {};
            ordIntento.forEach(p => { useCntIntentoActual[p.id] = 0; });
            Object.keys(tmpIntento).forEach(d => {
                Object.values(tmpIntento[d] || {}).forEach(id => {
                    if (id != null) useCntIntentoActual[id] = (useCntIntentoActual[id] || 0) + 1;
                });
            });

            const totalTurnos = diasMes * TURNOS.length;
            const totalFuncs = ordIntento.length;
            if (totalFuncs > 0) {
                const idealBase = Math.floor(totalTurnos / totalFuncs);
                const extras = totalTurnos % totalFuncs;

                const tryBalanceTurnIntento = (idUnder, maxTurns) => {
                    for (let dia = 1; dia <= diasMes; dia++) {
                        if (!tmpIntento[dia]) continue;
                        for (const turno of TURNOS) {
                            const idOver = tmpIntento[dia][turno];
                            if (!idOver || idOver === idUnder) continue;
                            if (useCntIntentoActual[idOver] <= maxTurns) continue;
                            if (!canUseIntento(idUnder, dia, turno, MIN_SEP_3, MAX_WE_3)) continue;

                            const diasProhibidos = [dia - 2, dia - 1, dia + 1, dia + 2];
                            const hasNearby = diasProhibidos.some(dEval =>
                                dEval >= 1 && dEval <= diasMes && Object.values(tmpIntento[dEval] || {}).includes(idUnder));
                            if (hasNearby) continue;

                            if (turno.startsWith("Ayudante")) {
                                const encTurno = turno.includes("Principal") ? "Encargado Primera Guardia Principal" : "Encargado Primera Guardia Prevención";
                                const encTurnoAlt = turno.includes("Principal") ? "Encargado Segunda Guardia Principal" : "Encargado Segunda Guardia Prevención";
                                const encId = tmpIntento[dia][encTurno] ?? tmpIntento[dia][encTurnoAlt];
                                const idxUnder = posOrdIntento.get(idUnder);
                                const idxEnc = posOrdIntento.get(encId);
                                if (idxEnc !== undefined && idxUnder !== undefined && idxUnder <= idxEnc) continue;
                            }

                            tmpIntento[dia][turno] = idUnder;
                            useCntIntentoActual[idOver]--;
                            useCntIntentoActual[idUnder] = (useCntIntentoActual[idUnder] || 0) + 1;
                            return true;
                        }
                    }
                    return false;
                };

                const sortedByAntIntento = [...ordIntento];
                for (const f of sortedByAntIntento) {
                    const id = f.id;
                    const target = (sortedByAntIntento.indexOf(f) < extras) ? idealBase + 1 : idealBase;
                    while (useCntIntentoActual[id] < target) {
                        const success = tryBalanceTurnIntento(id, target);
                        if (!success) break;
                    }
                }
            }

            ordIntento.forEach(p => { useCntIntentoActual[p.id] = 0; });
            Object.keys(tmpIntento).forEach(d => {
                Object.values(tmpIntento[d] || {}).forEach(id => {
                    if (id != null) useCntIntentoActual[id] = (useCntIntentoActual[id] || 0) + 1;
                });
            });

            const { esIdeal, detalle } = verificarCombinacionIdeal(tmpIntento, diasMes, ordIntento, useCntIntentoActual);
            detalleUltimoIntento = detalle;

            if (esIdeal) {
                asignacionFinal = JSON.parse(JSON.stringify(tmpIntento));
                seEncontroIdeal = true;
                break;
            } else {
                if (intento === 1 || !mejorAsignacionNoIdeal) {
                    mejorAsignacionNoIdeal = JSON.parse(JSON.stringify(tmpIntento));
                    detalleMejorNoIdeal = detalle;
                }
            }
        }

        if (!seEncontroIdeal) {
            asignacionFinal = mejorAsignacionNoIdeal || asignacionFinal;
            detalleUltimoIntento = seEncontroIdeal ? detalleUltimoIntento : (detalleMejorNoIdeal || detalleUltimoIntento);
        }

        setAsig(asignacionFinal);
        return { seEncontroIdeal, detalleResultado: detalleUltimoIntento };
    }

    const getHierarchyComparisonText = (prev, next) => {
        if (!prev && !next) return "N/A (Ambos Nulos)";
        if (!prev) return <span className="text-info">Asignando a casilla vacía</span>;
        if (!next) return <span className="text-warning">Quitando asignación</span>;

        const comparison = compareFuncionarioHierarchy(prev, next);
        if (comparison < 0) return <span className="text-success fw-bold">Nuevo es MENOS ANTIGUO</span>;
        if (comparison > 0) return <span className="text-danger fw-bold">Nuevo es MÁS ANTIGUO</span>;
        const gA = norm(prev.siglasCargo);
        const gB = norm(next.siglasCargo);
        const oppA = gA.includes("(OPP)");
        const oppB = gB.includes("(OPP)");
        if (oppA !== oppB) {
            return oppA ?
                <span className="text-danger fw-bold">Mismo Grado (Nuevo NO OPP)</span>
                : <span className="text-success fw-bold">Mismo Grado (Nuevo SÍ OPP)</span>;
        }
        const antA = +prev.antiguedad || Infinity;
        const antB = +next.antiguedad || Infinity;
        if (antA < antB) return <span className="text-danger fw-bold">Mismo Grado (Nuevo MENOS Antig.)</span>;
        if (antA > antB) return <span className="text-success fw-bold">Mismo Grado (Nuevo MÁS Antig.)</span>;

        return "Misma Jerarquía (Grado y Antigüedad)";
    };

    /* ---------------- Handlers ---------------- */
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
        }
        else if (idPrev == null || idNew == null) {
            setAsig(p => {
                const dayData = { ...(p[dia] || {}) };
                if (idNew === null) {
                    delete dayData[t];
                } else {
                    dayData[t] = idNew;
                }
                return { ...p, [dia]: dayData };
            });
        }
    };

    const handleConfirmChange = () => {
        if (!pendingChange) return;
        const { dia, turno, idNew } = pendingChange;
        setAsig(p => {
            const dayData = { ...(p[dia] || {}) };
            dayData[turno] = idNew;
            return { ...p, [dia]: dayData };
        });
        setShowConfirmModal(false);
        setPendingChange(null);
    };

    const handleCancelChange = () => {
        setShowConfirmModal(false);
        setPendingChange(null);
    };

    const handleGuardar=async()=>{
        setLoading(true);
        try{
            const dias=Object.keys(asig).map(Number);
            for(const d of dias){
                const dayAssignments = asig[d];
                if (!dayAssignments) continue;

                const payload={
                    dia:d,mes,anio,
                    asignaciones:Object.entries(dayAssignments)
                        .filter(([,id])=>id)
                        .map(([nombreTurno,id])=>({nombreTurno,id: +id}))
                };

                if(payload.asignaciones.length) {
                    await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/asignaciones/dia`,payload);
                }
            }
            alert("Turnos guardados 👍");
        }catch(e){
            alert("Error al guardar los turnos.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport=()=>{
        const rows=[];
        Object.keys(asig).map(Number).sort((a,b)=>a-b).forEach(d=>{
            const fecha=new Date(anio,mes-1,d);
            const fechaStr = fecha.toLocaleDateString("es-CL",{year:"numeric",month:"2-digit",day:"2-digit"});

            TURNOS.forEach(t=>{
                const id=asig[d]?.[t] || null;
                const f=id ? funcionarioMap.get(id) : null;
                rows.push({
                    Fecha: fechaStr,
                    Turno: t,
                    Funcionario: f?.nombreCompleto||"-",
                    Grado: f?.siglasCargo||"-",
                    Antigüedad: f?.antiguedad != null ? String(f.antiguedad) : "-",
                    Unidad: f?.unidad && f.unidad !== "-" ? f.unidad : "-"
                });
            });
        });
        if(!rows.length){alert("Sin datos para exportar.");return;}
        try {
            const wb=XLSX.utils.book_new();
            const ws=XLSX.utils.json_to_sheet(rows);
            ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'])) };
            ws['!cols'] = [ { wch: 12 }, { wch: 35 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 20 } ];
            XLSX.utils.book_append_sheet(wb, ws, "Turnos");
            const monthStr = String(mes).padStart(2, '0');
            const filename = `Turnos_${anio}_${monthStr}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (error) {
            alert("Ocurrió un error al exportar a Excel.");
        }
    };

    /* ------------------- UI ------------------- */
    const selector=(
        <Row className="mb-4 align-items-end">
            <Col xs={12} md={5} className="mb-2 mb-md-0">
                <Form.Label htmlFor="selectMes" className="fw-semibold">Mes</Form.Label>
                <Form.Select id="selectMes" value={mes} disabled={loading}
                             onChange={e=>{setMes(+e.target.value);setSem(0);}}>
                    {[...Array(12)].map((_,i)=>
                        <option key={i+1} value={i+1}>
                            {new Date(2000,i,1).toLocaleDateString("es-ES",{month:"long"}).toUpperCase()}
                        </option>)}
                </Form.Select>
            </Col>
            <Col xs={12} md={4} className="mb-2 mb-md-0">
                <Form.Label htmlFor="inputAnio" className="fw-semibold">Año</Form.Label>
                <Form.Control id="inputAnio" type="number" value={anio} disabled={loading}
                              onChange={e=>{setAnio(+e.target.value);setSem(0);}}/>
            </Col>
            <Col xs={12} md={3} className="d-flex justify-content-start justify-content-md-end mt-3 mt-md-0 align-items-center">
                <Button size="sm" className="me-2" variant="warning"
                        title="Volver a generar turnos para este mes/año (descarta cambios manuales)"
                        disabled={loading || funcs.length === 0}
                        onClick={async () => {
                            if(window.confirm("¿Regenerar turnos? Se perderán los cambios manuales no guardados.")) {
                                setLoading(true);
                                setAsig({});
                                const resultadoGeneracion = await generarIterativo(funcs, dnd);
                                setLoading(false);
                                if (resultadoGeneracion.seEncontroIdeal) {
                                    alert("Turnos regenerados exitosamente con la combinación ideal. 👍\n" + resultadoGeneracion.detalleResultado);
                                } else {
                                    alert(`Turnos regenerados. No se alcanzó la combinación ideal deseada.\n${resultadoGeneracion.detalleResultado}`);
                                }
                            }
                        }}>
                    Regenerar
                </Button>
                <Button size="sm" className="me-2" variant="primary"
                        title="Guardar asignaciones actuales en la base de datos"
                        disabled={loading||!Object.keys(asig).length}
                        onClick={handleGuardar}>
                    {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/>}
                    Guardar
                </Button>
                <Button size="sm" variant="success"
                        title="Exportar tabla actual a Excel"
                        disabled={loading||!Object.keys(asig).length}
                        onClick={handleExport}>Exportar</Button>
            </Col>
        </Row>
    );

    const paginator=!loading&&semanas.length>1&&(
        <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
            <Button size="sm" variant="outline-secondary" disabled={sem===0}
                    onClick={()=>setSem(s=>s-1)}>← Semana Ant.</Button>
            <span className="fw-semibold">Semana {sem+1} de {semanas.length}</span>
            <Button size="sm" variant="outline-secondary"
                    disabled={sem===semanas.length-1}
                    onClick={()=>setSem(s=>s+1)}>Semana Sig. →</Button>
        </div>
    );

    const grid=!loading&&semanas[sem]&&(
        <Row className="g-2">
            {semanas[sem].map(([dStr,tDia])=>{
                const dia=+dStr;
                const fecha = new Date(anio, mes - 1, dia);
                const fechaStr = fecha.toLocaleDateString("es-CL",{weekday:"short",day:"2-digit"});
                const isWeekend = [0, 6].includes(fecha.getDay());

                return(
                    <Col xs={12} sm={6} md={4} lg={3} xl={2} key={`${anio}-${mes}-${dia}`} className="mb-2">
                        <Card className={`h-100 ${isWeekend ? 'bg-light' : ''}`}>
                            <Card.Header className="text-center small fw-bold py-1">
                                {fechaStr} <span className="fw-normal">({dia})</span>
                            </Card.Header>
                            <Card.Body className="p-2">
                                {TURNOS.map(t=>{
                                    const idSel = tDia?.[t] || "";
                                    const det = idSel ? funcionarioMap.get(idSel) : null;
                                    return(
                                        <div key={t} className="mb-2">
                                            <small className="fw-semibold d-block text-truncate" title={t}>{t}</small>
                                            <Form.Select
                                                size="sm"
                                                className="mt-1"
                                                value={idSel}
                                                title={det ? `${det.nombreCompleto} (${det.siglasCargo})` : 'Sin Asignar'}
                                                onChange={e => handleChange(dia, t, e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="">- Sin Asignar -</option>
                                                {det && !dropdown.some(f=>f.id===det.id) &&
                                                    <option key={`current-${det.id}`} value={det.id}>*{det.nombreCompleto}</option>}
                                                {dropdown.map(f=>
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
    );

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
                        <hr/>
                        <div className="mb-3">
                            <strong>Funcionario Actual:</strong>
                            {pendingChange.detPrev ? (
                                <div className="ps-2">
                                    <div>Nombre: {pendingChange.detPrev.nombreCompleto}</div>
                                    <div>Grado: {pendingChange.detPrev.siglasCargo}</div>
                                    <div>Antigüedad: {pendingChange.detPrev.antiguedad ?? '-'}</div>
                                </div>
                            ) : ( <div className="ps-2 text-muted">- Ninguno -</div> )}
                        </div>
                        <div className="mb-3">
                            <strong>Nuevo Funcionario:</strong>
                            {pendingChange.detNew ? (
                                <div className="ps-2">
                                    <div>Nombre: {pendingChange.detNew.nombreCompleto}</div>
                                    <div>Grado: {pendingChange.detNew.siglasCargo}</div>
                                    <div>Antigüedad: {pendingChange.detNew.antiguedad ?? '-'}</div>
                                </div>
                            ) : ( <div className="ps-2 text-muted">- Sin Asignar -</div> )}
                        </div>
                        <hr/>
                        <p><strong>Comparación Jerarquía:</strong> {pendingChange.comparisonResult}</p>
                        <p className="mt-3">¿Desea confirmar este cambio?</p>
                    </>
                ) : ( <p>Cargando detalles del cambio...</p> )}
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

                {/* Selector Panel */}
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
                                    onClick={async () => {
                                        if (window.confirm("¿Regenerar turnos? Se perderán los cambios manuales no guardados.")) {
                                            setLoading(true); setAsig({});
                                            const resultadoGeneracion = await generarIterativo(funcs, dnd);
                                            setLoading(false);
                                            if (resultadoGeneracion.seEncontroIdeal) {
                                                alert("Turnos regenerados exitosamente con la combinación ideal. 👍\n" + resultadoGeneracion.detalleResultado);
                                            } else {
                                                alert(`Turnos regenerados. No se alcanzó la combinación ideal deseada.\n${resultadoGeneracion.detalleResultado}`);
                                            }
                                        }
                                    }}>
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

                {/* Barra paginación */}
                {!loading && semanas.length > 1 && (
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

                {/* Loading Spinner */}
                {loading && (
                    <div className="text-center mt-5">
                        <Spinner animation="border" variant="primary" role="status" style={{ width: 48, height: 48 }} />
                    </div>
                )}

                {/* Grid de turnos */}
                {!loading && Object.keys(asig).length > 0 && (
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

                {/* Sin datos */}
                {!loading && Object.keys(asig).length === 0 && (
                    <div className="text-center text-muted mt-4" style={{ fontSize: 17 }}>
                        No hay turnos generados para este mes/año.
                    </div>
                )}

                {confirmationModal}
            </div>
            {/* Mini CSS para interacción */}
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