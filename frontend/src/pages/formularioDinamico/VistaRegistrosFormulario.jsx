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

// Paleta institucional
const doradoPDI = "#FFC700";
const azulPDI = "#17355A";

export default function VistaRegistrosFormulario() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- datos traídos por navegación ---
    const formularioId = state?.formularioId;
    const esCuotaPadre = !!state?.esCuotaPadre;
    const idUnidad = state?.idUnidad;
    const idFuncionario = state?.idFuncionario;

    // --- estados ---
    const [registros, setRegistros] = useState([]);
    const [campos, setCampos] = useState([]);
    const [formulario, setFormulario] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // edición
    const [showEdit, setShowEdit] = useState(false);
    const [registroEdit, setRegistroEdit] = useState(null);
    const [valoresEdit, setValoresEdit] = useState({});
    const [saving, setSaving] = useState(false);

    // subformulario
    const [showSubform, setShowSubform] = useState(false);
    const [subformData, setSubformData] = useState([]);

    // ───────────────────────── 1. definición de formulario ──────────────────
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true);
        setError(null);
        fetch(
            `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formularioId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then((r) => r.json())
            .then((d) => {
                setFormulario(d);
                setCampos(d.campos || []);
            })
            .catch(() => setError("No se pudo cargar la definición"))
            .finally(() => setLoading(false));
    }, [formularioId, user.token]);

    // ───────────────────────── 2. carga de registros ────────────────────────
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true);
        setError(null);

        fetch(
            `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${formularioId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then((r) => r.json())
            .then((data) => {
                let lista = Array.isArray(data) ? data : [];
                if (!esCuotaPadre) {
                    if (idUnidad) lista = lista.filter((r) => r.idUnidad === idUnidad);
                    if (idFuncionario)
                        lista = lista.filter((r) => r.idFuncionario === idFuncionario);
                }
                setRegistros(lista);
            })
            .catch(() => setError("No se pudieron cargar los registros"))
            .finally(() => setLoading(false));
    }, [formularioId, idUnidad, idFuncionario, esCuotaPadre, user.token, showEdit]);

    // ------------------------------------------------------------------------
    //  ➜ lista filtrada SOLO a mis registros si no soy cuota-padre
    // ------------------------------------------------------------------------
    const misRegistros = esCuotaPadre
        ? registros
        : registros.filter((r) => r.idFuncionario === user.idFuncionario);

    // ──────────────────────── 3. exportar a Excel ───────────────────────────
    const exportarExcel = () => {
        if (!misRegistros.length) {
            alert("No hay datos para exportar");
            return;
        }

        const rows = misRegistros.map((r, i) => {
            const fila = { "#": i + 1 };
            campos.forEach((c) => {
                const v = r.datos?.[c.nombre];
                fila[c.etiqueta || c.nombre] =
                    typeof v === "object" ? JSON.stringify(v) : v ?? "";
            });
            fila.Funcionario =
                r.nombreFuncionario ? `${r.nombreFuncionario} (${r.idFuncionario})` : r.idFuncionario;
            fila.Fecha = r.fechaRespuesta
                ? new Date(r.fechaRespuesta).toLocaleString()
                : "";
            return fila;
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");
        const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        saveAs(
            new Blob([wbout], { type: "application/octet-stream" }),
            `registros_form${formularioId}.xlsx`
        );
    };

    // ──────────────────────── renderizado de celdas ─────────────────────────
    const renderCell = (valor) => {
        if (valor === null || valor === undefined) return "";
        if (typeof valor === "object" && valor && "label" in valor) return valor.label;
        if (typeof valor === "boolean") return valor ? "Sí" : "No";
        if (Array.isArray(valor))
            return (
                <Button
                    size="sm"
                    variant="info"
                    onClick={() => {
                        setSubformData(valor);
                        setShowSubform(true);
                    }}
                >
                    Ver detalle
                </Button>
            );
        if (typeof valor === "object")
            return <span title={JSON.stringify(valor)}>[objeto]</span>;
        return valor;
    };

    // ────────────────────────────── JSX ─────────────────────────────────────
    if (!formularioId)
        return (
            <div className="container py-4">
                <Alert variant="warning">Falta ID de formulario</Alert>
            </div>
        );

    return (
        <div className="container py-4">
            {/* barra superior */}
            <div className="d-flex justify-content-end gap-2 mb-2">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    ← Volver
                </Button>
                <Button
                    variant="success"
                    onClick={exportarExcel}
                    disabled={loading || misRegistros.length === 0}
                >
                    Exportar a Excel
                </Button>
            </div>

            <h3 style={{ color: azulPDI }}>Registros: {formulario.nombre}</h3>

            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table bordered hover responsive>
                    <thead>
                    <tr style={{ background: doradoPDI }}>
                        <th>#</th>
                        {campos.map((c) => (
                            <th key={c.nombre}>{c.etiqueta || c.nombre}</th>
                        ))}
                        <th>Ingresado por</th>
                        <th>Fecha</th>
                    </tr>
                    </thead>
                    <tbody>
                    {misRegistros.length === 0 ? (
                        <tr>
                            <td colSpan={campos.length + 3} className="text-center text-muted">
                                No hay registros propios
                            </td>
                        </tr>
                    ) : (
                        misRegistros.map((r, i) => (
                            <tr key={r.id}>
                                <td>{i + 1}</td>
                                {campos.map((c) => (
                                    <td key={c.nombre}>{renderCell(r.datos?.[c.nombre])}</td>
                                ))}
                                <td>
                                    {r.nombreFuncionario
                                        ? `${r.nombreFuncionario} (${r.idFuncionario})`
                                        : r.idFuncionario}
                                </td>
                                <td>
                                    {r.fechaRespuesta
                                        ? new Date(r.fechaRespuesta).toLocaleString()
                                        : "-"}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            )}
        </div>
    );
}