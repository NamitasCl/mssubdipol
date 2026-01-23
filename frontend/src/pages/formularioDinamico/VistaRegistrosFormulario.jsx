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
} from "../../components/BootstrapAdapter.jsx";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { saveAs } from "file-saver";
import axios from "axios";
import FormularioDinamico from "./FormularioDinamico";

// Fallback URL for forms API
const FORMS_API_URL = import.meta.env.VITE_FORMS_API_URL || 'http://localhost:8012/api/formularios';

const doradoPDI = "#FFC700";
const azulPDI   = "#17355A";

const unidadesAutorizadas = [
    "PMSUBDIPOL",
    "PM JENACROF",
    "PMJENADEP",
    "PM JENADEMA",
    "JENADECO",
    "PMREPOME",
    "PM ACA",
    "PM IQQ",
    "PM ATF",
    "PM COPIAP",
    "PM SNA",
    "PM VPO",
    "PM RGA",
    "PM TCA",
    "PMCHN",
    "PM COC",
    "PM TCO",
    "PM VDV",
    "PM PMO",
    "PM COY",
    "PM PAR",
    "PMSUBDICOR",
    "PM JENAMIG",
    "JENACO"
]


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

    /* ------------ import Excel (New Library) ------------ */
    const [isOpen, setIsOpen] = useState(false);

    /* =======================================================
         1)   CARGAR DEFINICIÓN DE FORMULARIO
    ======================================================= */
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true); setError(null);
        fetch(`${FORMS_API_URL}/dinamico/definicion/${formularioId}`,
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

        fetch(`${FORMS_API_URL}/dinamicos/registros/${formularioId}`,
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

        // --- Catálogo local de subformularios ---
        const SUBFORMULARIOS_CATALOGO = [
            {
                value: "carroDesignado",
                label: "Carro designado",
                fields: [
                    { id: 1001, name: "siglaCarro", label: "Sigla carro", type: "text" },
                    { id: 1002, name: "corporativo", label: "Es vehículo corporativo", type: "checkbox" },
                    { id: 1003, name: "funcionario", label: "Jefe de máquina", type: "funcionario" },
                    { id: 1004, name: "telefono", label: "Teléfono Jefe máquina", type: "text" },
                ]
            },
            {
                value: "carrosConTripulacion",
                label: "Carro y tripulacion",
                fields: [
                    { id: 1001, name: "siglaCarro", label: "Sigla carro", type: "text" },
                    { id: 1002, name: "corporativo", label: "Es vehículo corporativo", type: "checkbox" },
                    { id: 1003, name: "funcionario", label: "Jefe de máquina", type: "funcionario" },
                    { id: 1004, name: "funcionario", label: "Tripulante", type: "funcionario" },
                    { id: 1005, name: "funcionario", label: "Tripulante", type: "funcionario" },
                ]
            },
            {
                value: "carrosConTripulacionServicio",
                label: "Carro y detalle",
                fields: [
                    { id: 1001, name: "siglaCarro", label: "Sigla carro", type: "text" },
                    { id: 1002, name: "corporativo", label: "Es carro corporativo", type: "checkbox" },
                    { id: 1003, name: "funcion carro", label: "Función del carro", type: "select", opciones: "DECRETOS,FISCALIZACIONES,OTRO"},
                    { id: 1004, name: "lugar", label: "Lugar", type: "text"},
                    { id: 1005, name: "fecha inicio", label: "Fecha y Hora inicio servicio", type: "datetime-local"},
                    { id: 1006, name: "fecha fin", label: "Fecha y Hora fin servicio", type: "datetime-local"},
                    { id: 1007, name: "funcionario uno", label: "Nombre funcionario uno", type: "funcionario" },
                    { id: 1007, name: "funcionario uno función", label: "Función dentro del carro", type: "select", opciones: "JEFE DE MAQUINA,TRIPULANTE,CONDUCTOR"},
                    { id: 1010, name: "telefono funcionario uno", label: "Teléfono funcionario uno", type: "text"},
                    { id: 1008, name: "funcionario dos", label: "Nombre funcionario dos", type: "funcionario" },
                    { id: 1007, name: "funcionario dos función funcion", label: "Función funcionario dos", type: "select", opciones: "JEFE DE MAQUINA,TRIPULANTE,CONDUCTOR"},
                    { id: 1010, name: "telefono funcionario dos", label: "Teléfono funcionario dos", type: "text"},
                    { id: 1009, name: "funcionario tres", label: "Nombre funcionario tres", type: "funcionario" },
                    { id: 1007, name: "funcionario tres función", label: "Función funcionario tres", type: "select", opciones: "JEFE DE MAQUINA,TRIPULANTE,CONDUCTOR"},
                    { id: 1010, name: "telefono funcionario tres", label: "Teléfono funcionario tres", type: "text"},
                    { id: 1010, name: "observaciones", label: "Observaciones", type: "text"},
                ]
            }
        ];

        // Utilidad: busca label por nombre en catálogo
        function normalizeKey(key) {
            return key
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/_/g, "")
                .replace(/-/g, "");
        }

        function getLabel(name, camposCatalogo = []) {
            const normName = normalizeKey(name);
            const campo = camposCatalogo.find(f =>
                [f.nombre, f.etiqueta, f.name, f.label]
                    .filter(Boolean)
                    .map(normalizeKey)
                    .includes(normName)
            );
            return campo ? (campo.etiqueta || campo.label || campo.nombre || campo.name) : name;
        }


        // Principal: aplana un registro según catálogo
        function flattenRecordForExcel(json, campos, subformCatalogo) {
            // Detecta el primer campo array
            const arrayFieldName = Object.keys(json).find(
                k => Array.isArray(json[k]) && json[k].length > 0 && typeof json[k][0] === "object"
            );
            const arrayData = json[arrayFieldName] || [];

            // Encuentra info de subformulario (campos del sub)
            const subformField = campos.find(c => c.nombre === arrayFieldName);
            let subformFields = [];
            if (subformField && subformField.subformulario) {
                const subformDef = SUBFORMULARIOS_CATALOGO.find(sf => sf.value === subformField.subformulario);
                if (subformDef) {
                    subformFields = subformDef.fields;
                }
            }

            // Campos planos principales (solo label, sin label/value)
            const commonFields = Object.entries(json)
                .filter(([k]) => k !== arrayFieldName)
                .map(([k, v]) => {
                    const label = getLabel(k, campos);
                    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                        // Por ejemplo: {label, value, siglasUnidad} → saca solo label
                        if ('label' in v) {
                            return [[label, v.label]];
                        } else {
                            // Saca el primer string si hay, o todo como JSON
                            const val = Object.values(v).find(val => typeof val === "string") || JSON.stringify(v);
                            return [[label, val]];
                        }
                    } else {
                        return [[label, v]];
                    }
                })
                .flat();

            const commonObj = Object.fromEntries(commonFields);

            if (!Array.isArray(arrayData) || arrayData.length === 0) {
                return [commonObj];
            }

            // Subformulario: cada item del array es una fila (solo con label)
            return arrayData.map(item => {
                const flat = {};
                Object.entries(item).forEach(([key, value]) => {
                    const subLabel = getLabel(key, subformFields);
                    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                        // Por ejemplo funcionario: {label: "XX", ...} → solo label
                        if ('label' in value) {
                            flat[subLabel] = value.label;
                        } else if ('nombreCompleto' in value) {
                            flat[subLabel] = value.nombreCompleto;
                        } else {
                            // Saca el primer string, si existe
                            const val = Object.values(value).find(val => typeof val === "string") || JSON.stringify(value);
                            flat[subLabel] = val;
                        }
                    } else {
                        flat[subLabel] = value;
                    }
                });
                return { ...commonObj, ...flat };
            });
        }

        // --- Genera filas para Excel ---
        let rows = [];
        registrosMostrados.forEach((r, i) => {
            const flatRows = flattenRecordForExcel(r.datos, campos, SUBFORMULARIOS_CATALOGO);
            flatRows.forEach((fila) => {
                fila.Funcionario = r.nombreFuncionario
                    ? `${r.nombreFuncionario} (${r.idFuncionario})`
                    : r.idFuncionario;
                fila.Fecha = r.fechaRespuesta
                    ? "'" + r.fechaRespuesta.replace("T", " ").split(".")[0]
                    : "";

                fila["#registro"] = i + 1;
                rows.push(fila);
            });
        });

        // --- Exportar con XLSX ---
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
            `${FORMS_API_URL}/dinamicos/registros/${registroId}`,
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
                `${FORMS_API_URL}/dinamicos/registros/${registroEdit.id}`,
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
         IMPORT EXCEL - Handlers
    ======================================================= */
    


    // Column mapping state
    const [columnMapping, setColumnMapping] = useState([]);
    const [importMode, setImportMode] = useState('name'); // 'name' | 'position'
    const [importOffset, setImportOffset] = useState(0); // 0 = Start at Col A, 1 = Start at Col B
    const [hasHeaders, setHasHeaders] = useState(true);

    // Find matching campo by label or nombre (with fuzzy matching)
    // ... (rest of findCampoMatch)



    // ... (handleFileSelect updates mostly same, just checking hasHeaders)






    // 1. Configure fields for the wizard based on 'campos'
    const fields = useMemo(() => {
        return campos.map(c => {
            // Determine type
            let type = "input"; // default text
            if (c.tipo === "checkbox" || c.type === "checkbox") type = "checkbox";
            if (c.tipo === "select" || c.type === "select") type = "select";

            // Options for select
            let options = [];
            if (type === "select" && c.opciones) {
                const rawOps = Array.isArray(c.opciones) ? c.opciones : (typeof c.opciones === 'string' ? c.opciones.split(',') : []);
                options = rawOps.map(op => {
                    const label = typeof op === 'object' ? (op.label || op.nombre) : op;
                    const value = typeof op === 'object' ? (op.value || op.id) : op;
                    return { label: String(label).trim(), value: String(value).trim() };
                });
            }

            return {
                // Key metadata for the library
                label: c.etiqueta || c.nombre,
                key: c.nombre,
                alternateMatches: [c.nombre, c.etiqueta], // Helps detailed matching
                fieldType: {
                    type: type,
                    options: options.length > 0 ? options : undefined,
                },
                example: "Ejemplo...",
                validations: [
                    {
                        rule: "required",
                        errorMessage: "Este campo es obligatorio",
                        level: c.requerido ? "error" : "info",
                    },
                ],
            };
        });
    }, [campos]);

    // 2. Handle final submit from the wizard
    const handleImportSubmit = async (data) => {
        // data.validData contains the clean array of objects
        const validRows = data.validData;

        if (!validRows || validRows.length === 0) {
            alert("No hay registros válidos para importar.");
            return;
        }

        setLoading(true); 
        
        // Iterate and POST
        // Note: The library returns mapped data in 'validRows', keyed by 'key' (c.nombre)
        const promises = validRows.map(row => 
            axios.post(
                `${FORMS_API_URL}/dinamicos/registros`,
                {
                    formularioId: Number(formularioId),
                    datos: row,
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            ).catch(err => ({ error: err }))
        );

        const results = await Promise.all(promises);
        const successCount = results.filter(r => !r || !r.error).length;
        const errorCount = results.length - successCount;

        setLoading(false);
        setIsOpen(false); // Close wizard
        
        alert(`Importación completada:\n✅ ${successCount} registros importados\n❌ ${errorCount} errores`);
        cargarRegistros();
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
        <div className="container-fluid py-4">
            {/* ---------------- Buttons top ---------------- */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(-1)}
                    style={{ minWidth: '100px' }}
                >
                    ← Volver
                </Button>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        variant="primary"
                        onClick={() => setIsOpen(true)}
                        disabled={loading}
                        style={{ minWidth: '180px' }}
                    >
                        📥 Importar desde Excel
                    </Button>
                    <Button
                        variant="success"
                        onClick={exportarExcel}
                        disabled={loading || registrosMostrados.length === 0}
                        style={{ minWidth: '150px' }}
                    >
                        📤 Exportar a Excel
                    </Button>
                </div>
            </div>

            <h3 style={{ color: azulPDI }}>
                Registros: {formulario.nombre || "Formulario"}
            </h3>
            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <div style={{ overflowX: 'auto' }}>
                <Table bordered hover responsive size="sm">
                    <thead>
                    <tr>
                        <th style={{ minWidth: 40, maxWidth: 50, textAlign: 'center', verticalAlign: 'middle', padding: '8px 4px', fontSize: '12px' }}>
                            #
                        </th>
                        {campos.map((c) => (
                            <th 
                                key={c.nombre} 
                                title={c.etiqueta || c.nombre}
                                style={{ 
                                    minWidth: 100,
                                    maxWidth: 150, 
                                    textAlign: 'center', 
                                    verticalAlign: 'middle',
                                    padding: '8px 6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    wordBreak: 'break-word'
                                }}
                            >
                                {c.etiqueta || c.nombre}
                            </th>
                        ))}
                        <th style={{ minWidth: 140, maxWidth: 160, textAlign: 'center', verticalAlign: 'middle', padding: '8px 4px', fontSize: '12px' }}>
                            Acciones
                        </th>
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
                                <td style={{ height: '50px'}}>
                                    <div style={{height: '100%', display: 'flex', alignItems: 'center'}}>
                                        {i + 1}
                                    </div>
                                </td>
                                {campos.map((c) => (
                                    <td style={{height: '50px'}} key={c.nombre}>
                                        <div style={{height:'100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            {renderCell(r.datos?.[c.nombre])}
                                        </div>
                                    </td>
                                ))}
                                {/*<td>
                                    {r.nombreFuncionario
                                        ? `${r.nombreFuncionario} (${r.idFuncionario})`
                                        : r.idFuncionario}
                                </td>
                                <td>
                                    {r.fechaRespuesta
                                        ? new Date(r.fechaRespuesta).toLocaleString()
                                        : "-"}
                                </td>*/}
                                <td style={{ height: '50px'}}>
                                    {(unidadesAutorizadas.some(planaMayor => user.siglasUnidad.includes(planaMayor)) || r.idFuncionario === user.idFuncionario) && (
                                        <div style={{height:'100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                style={{ minWidth: 90 }} // Puedes ajustar el valor
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
                                                style={{ minWidth: 90 }} // Igual que el anterior
                                                onClick={() => handleEliminar(r)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    )}
                                </td>

                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
                </div>
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
                size={'lg'}
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



            {/* ---------------- New Wizard Import Component ---------------- */}
            <ReactSpreadsheetImport
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleImportSubmit}
                fields={fields}
                onCancel={() => setIsOpen(false)}
                translations={{
                    uploadStep: {
                        title: "Subir archivo",
                        manifestTitle: "Datos",
                        manifestDescription: "(Arrastra tu archivo aquí)",
                        maxRecords: {
                          short: "Max registros",
                          tooMany: "Demasiados registros"
                        },
                        dropzone: {
                          title: "Subir .xlsx",
                          errorToastDescription: "Archivo rechazado",
                          activeDropzoneTitle: "Suelta archivo aquí...",
                          buttonTitle: "Seleccionar archivo",
                          loadingTitle: "Procesando...",
                        },
                        selectSheet: {
                          title: "Selecciona la hoja",
                          nextButtonTitle: "Siguiente"
                        },
                    },
                    selectHeaderStep: {
                        title: "Seleccionar encabezado",
                        subtitle: "Selecciona la fila que contiene los nombres de columna",
                    },
                    matchColumnsStep: {
                        title: "Mapear columnas",
                        nextButtonTitle: "Confirmar",
                        userTableTitle: "Tu archivo",
                        templateTitle: "Campos requeridos",
                        selectPlaceholder: "Seleccionar columna...",
                        ignoredColumnText: "(Ignorar columna)",
                        subTitle: "Selecciona qué columnas de tu Excel corresponden a cada campo",
                    },
                    validationStep: {
                        title: "Validar datos",
                        nextButtonTitle: "Importar",
                        backButtonTitle: "Atrás",
                        noRowsMessage: "No hay datos",
                        noRowsWarning: "No se encontraron filas válidas",
                        dataLabel: "Datos válidos",
                    },
                }}
            />
        </div>
    );
}