/*  VistaRegistrosFormulario.jsx
    - Ahora, si el usuario tiene VISIBILIDAD (unidad, usuario o pública) ve TODOS los registros.
    - La regla de EDITAR / ELIMINAR sigue limitada a los registros propios.
*/

import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Table,
    Button,
    Spinner,
    Alert,
    Modal,
    Badge,
} from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import FormularioDinamico from "./FormularioDinamico";

const doradoPDI = "#FFC700";
const azulPDI   = "#17355A";

export default function VistaRegistrosFormulario() {
    const { state } = useLocation();
    const navigate  = useNavigate();
    const { user }  = useAuth();

    /* ------------ params recibidos ------------ */
    const formularioId       = state?.formularioId;
    const esCuotaPadre       = !!state?.esCuotaPadre;
    const idUnidadParam      = state?.idUnidad;
    const idFuncionarioParam = state?.idFuncionario;

    /* ------------ estados ------------ */
    const [formulario, setFormulario]   = useState({});
    const [campos,      setCampos]      = useState([]);
    const [registros,   setRegistros]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);

    /* ------------ modales (subform / edición) ------------ */
    const [showSubform,    setShowSubform]    = useState(false);
    const [subformData,    setSubformData]    = useState([]);
    const [registroEdit,   setRegistroEdit]   = useState(null);
    const [showEditModal,  setShowEditModal]  = useState(false);

    /* =======================================================
         1)   CARGAR DEFINICIÓN DE FORMULARIO
    ======================================================= */
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true); setError(null);
        fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formularioId}`,
            { headers:{ Authorization:`Bearer ${user.token}` } })
            .then(r=>r.json())
            .then(def => { setFormulario(def); setCampos(def.campos || []); })
            .catch(()=>setError("No se pudo cargar la definición"))
            .finally(()=>setLoading(false));
    }, [formularioId, user.token]);

    /* =======================================================
         2)   CARGAR REGISTROS
    ======================================================= */
    const cargarRegistros = () => {
        if (!formularioId) return;
        setLoading(true); setError(null);

        fetch(`${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${formularioId}`,
            { headers:{ Authorization:`Bearer ${user.token}` } })
            .then(r=>r.json())
            .then(data => {
                let lista = Array.isArray(data) ? data : [];

                /* --- Si NO es cuota padre, filtra por unidad/funcionario param --- */
                if (!esCuotaPadre) {
                    if (idUnidadParam)           lista = lista.filter(r => r.idUnidad      === idUnidadParam);
                    if (idFuncionarioParam)      lista = lista.filter(r => r.idFuncionario === idFuncionarioParam);
                }
                setRegistros(lista);
            })
            .catch(()=>setError("No se pudieron cargar los registros"))
            .finally(()=>setLoading(false));
    };

    useEffect(() => {
        cargarRegistros();
        // eslint-disable-next-line
    }, [formularioId, idUnidadParam, idFuncionarioParam, esCuotaPadre, user.token]);

    /* =======================================================
         3)   VISIBILIDAD → ¿puede ver TODOS los registros?
    ======================================================= */
    const tieneVisibilidad = useMemo(() => {
        if (!formulario.visibilidad) return false;
        return formulario.visibilidad.some(v =>
            v.tipoDestino === "publica" ||
            (v.tipoDestino === "usuario" &&
                String(v.valorDestino) === String(user.idFuncionario)) ||
            (v.tipoDestino === "unidad" &&
                (
                    (v.valorDestinoSiglas &&
                        String(v.valorDestinoSiglas) === String(user.siglasUnidad)) ||
                    (v.valorDestino &&
                        user.idUnidad &&
                        String(v.valorDestino) === String(user.idUnidad))
                ))
        );
    }, [formulario, user]);

    /* =======================================================
         4)   REGISTROS QUE SE MUESTRAN
             - Si es cuota padre  -> todos
             - Si tiene visib.    -> todos
             - Si no              -> sólo propios
    ======================================================= */
    const myId = String(user.idFuncionario ?? "");
    const registrosMostrados = useMemo(() => {
        if (esCuotaPadre || tieneVisibilidad) return registros;
        return registros.filter(r => String(r.idFuncionario) === myId);
    }, [registros, esCuotaPadre, tieneVisibilidad, myId]);

    /* =======================================================
         5)   UTILIDADES  (exportar, renderCell, etc.)
    ======================================================= */
    const toPlain = (v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object" && !Array.isArray(v) && "label" in v) return v.label;
        if (Array.isArray(v))
            return v
                .map((it) =>
                    typeof it === "object" && "label" in it ? it.label : JSON.stringify(it)
                )
                .join("; ");
        if (typeof v === "object") return JSON.stringify(v);
        return v;
    };

    const exportarExcel = () => {
        if (!registrosMostrados.length) {
            alert("No hay datos para exportar");
            return;
        }

        const NOMBRE_CAMPO_ARRAY = "CARRO DESIGNADO";
        const campoArray = campos.find(c => (c.etiqueta || c.nombre) === NOMBRE_CAMPO_ARRAY);
        const campoArrayNombre = campoArray ? campoArray.nombre : null;

        let rows = [];
        registrosMostrados.forEach((r, i) => {
            const carros = r.datos?.[campoArrayNombre];

            if (Array.isArray(carros) && carros.length) {
                carros.forEach((carro, j) => {
                    const fila = { "#": `${i + 1}.${j + 1}` };
                    campos.forEach((c) => {
                        if (c.nombre === campoArrayNombre) {
                            // Extrae los campos individuales de cada carro
                            fila["SIGLA CARRO"]        = carro.siglaCarro || "";
                            fila["TELEFONO CARRO"]     = carro.telefono || "";
                            fila["CORPORATIVO"]        = carro.corporativo === true ? "Sí" : (carro.corporativo === false ? "No" : "");
                            fila["FUNCIONARIO CARRO"]  = carro.funcionario?.label || "";
                            fila["ID FUNCIONARIO"]     = carro.funcionario?.value || "";
                        } else {
                            fila[c.etiqueta || c.nombre] = toPlain(r.datos?.[c.nombre]);
                        }
                    });
                    fila.Funcionario = r.nombreFuncionario
                        ? `${r.nombreFuncionario} (${r.idFuncionario})`
                        : r.idFuncionario;
                    fila.Fecha = r.fechaRespuesta
                        ? new Date(r.fechaRespuesta).toLocaleString()
                        : "";
                    rows.push(fila);
                });
            } else if (carros && typeof carros === "object") {
                // Solo un objeto, no array
                const carro = carros;
                const fila = { "#": i + 1 };
                campos.forEach((c) => {
                    if (c.nombre === campoArrayNombre) {
                        fila["SIGLA CARRO"]        = carro.siglaCarro || "";
                        fila["TELEFONO CARRO"]     = carro.telefono || "";
                        fila["CORPORATIVO"]        = carro.corporativo === true ? "Sí" : (carro.corporativo === false ? "No" : "");
                        fila["FUNCIONARIO CARRO"]  = carro.funcionario?.label || "";
                        fila["ID FUNCIONARIO"]     = carro.funcionario?.value || "";
                    } else {
                        fila[c.etiqueta || c.nombre] = toPlain(r.datos?.[c.nombre]);
                    }
                });
                fila.Funcionario = r.nombreFuncionario
                    ? `${r.nombreFuncionario} (${r.idFuncionario})`
                    : r.idFuncionario;
                fila.Fecha = r.fechaRespuesta
                    ? new Date(r.fechaRespuesta).toLocaleString()
                    : "";
                rows.push(fila);
            } else {
                // Sin carro designado (ni array ni objeto)
                const fila = { "#": i + 1 };
                campos.forEach((c) => {
                    fila[c.etiqueta || c.nombre] = toPlain(r.datos?.[c.nombre]);
                });
                fila.Funcionario = r.nombreFuncionario
                    ? `${r.nombreFuncionario} (${r.idFuncionario})`
                    : r.idFuncionario;
                fila.Fecha = r.fechaRespuesta
                    ? new Date(r.fechaRespuesta).toLocaleString()
                    : "";
                rows.push(fila);
            }
        });

        // Opcional: Elimina la columna original de CARRO DESIGNADO si no quieres que salga la versión en JSON
        rows = rows.map(row => {
            const newRow = { ...row };
            delete newRow["CARRO DESIGNADO"];
            return newRow;
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


    const renderCell = (v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object" && v && "label" in v) return v.label;
        if (typeof v === "boolean") return v ? "Sí" : "No";
        if (Array.isArray(v))
            return (
                <Button
                    size="sm"
                    variant="info"
                    onClick={() => {
                        setSubformData(v);
                        setShowSubform(true);
                    }}
                >
                    Ver
                </Button>
            );
        if (typeof v === "object") return <span title={JSON.stringify(v)}>[obj]</span>;
        return v;
    };

    /* ------------ CRUD helpers (eliminar / actualizar) ------------ */
    const eliminarRegistroFormulario = (registroId) =>
        axios.delete(
            `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${registroId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        );

    const handleEliminar = (registro) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
        eliminarRegistroFormulario(registro.id)
            .then(() => setRegistros((regs) => regs.filter((r) => r.id !== registro.id)))
            .catch(() => alert("No se pudo eliminar el registro. Intenta nuevamente."));
    };

    const handleActualizarRegistro = async (datosActualizados) => {
        if (!registroEdit) return;
        try {
            await axios.put(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${registroEdit.id}`,
                { datos: datosActualizados },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setShowEditModal(false);
            setRegistroEdit(null);
            cargarRegistros();
        } catch (e) {
            alert(
                "Error actualizando registro: " +
                (e.response?.data?.message || e.message)
            );
        }
    };

    /* =======================================================
           RENDER
    ======================================================= */
    if (!formularioId)
        return (
            <div className="container py-4">
                <Alert variant="warning">Falta ID de formulario</Alert>
            </div>
        );

    return (
        <div className="container py-4">
            {/* ---------------- Buttons top ---------------- */}
            <div className="d-flex justify-content-end gap-2 mb-2">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    ← Volver
                </Button>
                <Button
                    variant="success"
                    onClick={exportarExcel}
                    disabled={loading || registrosMostrados.length === 0}
                >
                    Exportar a Excel
                </Button>
            </div>

            <h3 style={{ color: azulPDI }}>
                Registros: {formulario.nombre || "Formulario"}
            </h3>
            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table bordered hover responsive size="sm">
                    <thead>
                    <tr style={{ background: doradoPDI }}>
                        <th>#</th>
                        {campos.map((c) => (
                            <th key={c.nombre}>{c.etiqueta || c.nombre}</th>
                        ))}
                        <th>Ingresado por</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {registrosMostrados.length === 0 ? (
                        <tr>
                            <td
                                colSpan={campos.length + 4}
                                className="text-center text-muted"
                            >
                                No hay registros
                            </td>
                        </tr>
                    ) : (
                        registrosMostrados.map((r, i) => (
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
                                <td>
                                    {/* EDITAR/ELIMINAR: solo el dueño puede */}
                                    {r.idFuncionario === user.idFuncionario && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                className="me-2"
                                                onClick={() => {
                                                    setRegistroEdit(r);
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleEliminar(r)}
                                            >
                                                Eliminar
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            )}

            {/* ---------------- Modal Subformulario ---------------- */}
            <Modal
                show={showSubform}
                onHide={() => setShowSubform(false)}
                size="xl"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Detalle del subformulario</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{width: "100%"}}>
                    <div style={{overflow: "auto"}}>
                        {subformData.length > 0 && (() => {
                            const keys = [...new Set(subformData.flatMap((o) => Object.keys(o)))];
                            return (
                                <Table bordered hover size="sm">
                                    <thead>
                                    <tr>{keys.map((k) => <th key={k}>{k}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                    {subformData.map((row, idx) => (
                                        <tr key={idx}>
                                            {keys.map((k) => (
                                                <td key={k}>{renderCell(row[k])}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            );
                        })()}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSubform(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ---------------- Modal Edición ---------------- */}
            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Editar Registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {registroEdit ? (
                        <FormularioDinamico
                            fields={campos}
                            initialValues={registroEdit.datos}
                            onSubmit={handleActualizarRegistro}
                        />
                    ) : (
                        <p>No hay registro seleccionado.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}