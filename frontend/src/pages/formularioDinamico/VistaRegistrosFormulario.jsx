import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Table,
    Button,
    Spinner,
    Alert,
    Modal,
    Form,
    Badge,
} from "react-bootstrap";
import { useAuth } from "../../AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Colores institucionales
const doradoPDI = "#FFC700";
const azulPDI   = "#17355A";

export default function VistaRegistrosFormulario() {
    const { state }   = useLocation();
    const navigate    = useNavigate();
    const { user }    = useAuth();

    // ─── parámetros recibidos por navegación ──────────────────────────────
    const formularioId       = state?.formularioId;
    const esCuotaPadre       = !!state?.esCuotaPadre;
    const idUnidad           = state?.idUnidad;
    const idFuncionarioParam = state?.idFuncionario;

    // ─── estados globales ─────────────────────────────────────────────────
    const [formulario, setFormulario] = useState({});
    const [campos,      setCampos]      = useState([]);
    const [registros,   setRegistros]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);

    // sub‑formulario modal
    const [showSubform, setShowSubform] = useState(false);
    const [subformData, setSubformData] = useState([]);

    // ╭──────────────────────── Definición de formulario ───────────────────
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true); setError(null);
        fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formularioId}`,
            { headers:{ Authorization:`Bearer ${user.token}` } })
            .then(r=>r.json())
            .then(def=>{ setFormulario(def); setCampos(def.campos||[]); })
            .catch(()=>setError("No se pudo cargar la definición"))
            .finally(()=>setLoading(false));
    },[formularioId,user.token]);

    // ╭──────────────────────── Carga de registros ─────────────────────────
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true); setError(null);
        fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${formularioId}`,
            { headers:{ Authorization:`Bearer ${user.token}` } })
            .then(r=>r.json())
            .then(data=>{
                let lista=Array.isArray(data)?data:[];
                if(!esCuotaPadre){
                    if(idUnidad)           lista = lista.filter(r=>r.idUnidad===idUnidad);
                    if(idFuncionarioParam) lista = lista.filter(r=>r.idFuncionario===idFuncionarioParam);
                }
                setRegistros(lista);
            })
            .catch(()=>setError("No se pudieron cargar los registros"))
            .finally(()=>setLoading(false));
    },[formularioId,idUnidad,idFuncionarioParam,esCuotaPadre,user.token]);

    // ╭──────────────────────── Filtro propio ──────────────────────────────
    const misRegistros = esCuotaPadre
        ? registros                              // cuota‑padre ve todo
        : registros.filter(r=>r.idFuncionario === user.idFuncionario); // resto solo sus propios

    // ╭──────────────────────── Exportar Excel ─────────────────────────────
    const toPlain = (v)=>{
        if(v===null||v===undefined) return "";
        if(typeof v==="object" && !Array.isArray(v) && "label" in v) return v.label;
        if(Array.isArray(v)) return v.map(it=>typeof it==="object"&&"label" in it?it.label:JSON.stringify(it)).join("; ");
        if(typeof v==="object") return JSON.stringify(v);
        return v;
    };

    const exportarExcel=()=>{
        if(!misRegistros.length){alert("No hay datos para exportar");return;}
        const rows = misRegistros.map((r,i)=>{
            const fila={"#":i+1};
            campos.forEach(c=>{fila[c.etiqueta||c.nombre]=toPlain(r.datos?.[c.nombre]);});
            fila.Funcionario = r.nombreFuncionario?`${r.nombreFuncionario} (${r.idFuncionario})`:r.idFuncionario;
            fila.Fecha = r.fechaRespuesta?new Date(r.fechaRespuesta).toLocaleString():"";
            return fila;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,ws,"Registros");
        const wbout = XLSX.write(wb,{type:"array",bookType:"xlsx"});
        saveAs(new Blob([wbout],{type:"application/octet-stream"}),`registros_form${formularioId}.xlsx`);
    };

    // ╭──────────────────────── Render celda ───────────────────────────────
    const renderCell = (v)=>{
        if(v===null||v===undefined) return "";
        if(typeof v==="object" && v && "label" in v) return v.label;
        if(typeof v==="boolean") return v?"Sí":"No";
        if(Array.isArray(v)) return <Button size="sm" variant="info" onClick={()=>{setSubformData(v);setShowSubform(true);}}>Ver</Button>;
        if(typeof v==="object") return <span title={JSON.stringify(v)}>[obj]</span>;
        return v;
    };

    // ╭──────────────────────── Interfaz ───────────────────────────────────
    if(!formularioId) return <div className="container py-4"><Alert variant="warning">Falta ID de formulario</Alert></div>;

    return (
        <div className="container py-4">
            {/* Barra superior */}
            <div className="d-flex justify-content-end gap-2 mb-2">
                <Button variant="outline-secondary" onClick={()=>navigate(-1)}>← Volver</Button>
                <Button variant="success" onClick={exportarExcel} disabled={loading||misRegistros.length===0}>Exportar a Excel</Button>
            </div>

            <h3 style={{color:azulPDI}}>Registros: {formulario.nombre || "Formulario"}</h3>
            {error && <Alert variant="danger">{error}</Alert>}

            {loading? <Spinner animation="border"/> : (
                <Table bordered hover responsive size="sm">
                    <thead>
                    <tr style={{background:doradoPDI}}>
                        <th>#</th>
                        {campos.map(c=>(<th key={c.nombre}>{c.etiqueta||c.nombre}</th>))}
                        <th>Ingresado por</th>
                        <th>Fecha</th>
                    </tr>
                    </thead>
                    <tbody>
                    {misRegistros.length===0 ? (
                        <tr><td colSpan={campos.length+3} className="text-center text-muted">No hay registros propios</td></tr>
                    ) : (
                        misRegistros.map((r,i)=>(
                            <tr key={r.id}>
                                <td>{i+1}</td>
                                {campos.map(c=>(<td key={c.nombre}>{renderCell(r.datos?.[c.nombre])}</td>))}
                                <td>{r.nombreFuncionario?`${r.nombreFuncionario} (${r.idFuncionario})`:r.idFuncionario}</td>
                                <td>{r.fechaRespuesta?new Date(r.fechaRespuesta).toLocaleString():"-"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            )}

            {/* ── Modal Subformulario ───────────────────────────────────────────*/}
            <Modal show={showSubform} onHide={()=>setShowSubform(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Detalle del subformulario</Modal.Title></Modal.Header>
                <Modal.Body>
                    {subformData && subformData.length > 0 && (() => {
                        const keys = [...new Set(subformData.flatMap(o => Object.keys(o)))];
                        return (
                            <Table bordered hover size="sm">
                                <thead>
                                <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
                                </thead>
                                <tbody>
                                {subformData.map((row, i) => (
                                    <tr key={i}>{keys.map(k => <td key={k}>{renderCell(row[k])}</td>)}</tr>
                                ))}
                                </tbody>
                            </Table>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSubform(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}