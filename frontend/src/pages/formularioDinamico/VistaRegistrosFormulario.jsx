import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table, Button, Spinner, Alert, Modal, Form, Badge } from "react-bootstrap";
import { useAuth } from "../../AuthContext";

// Paleta institucional
const doradoPDI = "#FFC700";
const azulPDI = "#17355A";
const grisOscuro = "#222938";

export default function VistaRegistrosFormulario() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Leer los datos desde el state recibido (navegación)
    const formularioId = state?.formularioId;
    const cuotaId = state?.cuotaId;
    const esCuotaPadre = !!state?.esCuotaPadre;
    const idUnidad = state?.idUnidad;
    const idFuncionario = state?.idFuncionario;

    const [registros, setRegistros] = useState([]);
    const [campos, setCampos] = useState([]);
    const [formulario, setFormulario] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal de edición
    const [showEdit, setShowEdit] = useState(false);
    const [registroEdit, setRegistroEdit] = useState(null);
    const [valoresEdit, setValoresEdit] = useState({});
    const [saving, setSaving] = useState(false);

    // Modal de detalle de subformulario
    const [showSubform, setShowSubform] = useState(false);
    const [subformData, setSubformData] = useState([]);
    const [subformField, setSubformField] = useState(""); // nombre del campo

    // Cargar definición de formulario
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true);
        setError(null);
        fetch(
            `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formularioId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(res => res.json())
            .then(data => {
                setFormulario(data);
                setCampos(data.campos || []);
            })
            .catch(() => setError("No se pudo cargar la definición del formulario"))
            .finally(() => setLoading(false));
    }, [formularioId, user.token]);

    // Traer los registros
    useEffect(() => {
        if (!formularioId) return;
        setLoading(true);
        setError(null);

        let url = `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${formularioId}`;

        fetch(url, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => res.json())
            .then(data => {
                let filtrar = data;
                if (!esCuotaPadre) {
                    if (idUnidad) filtrar = filtrar.filter(r => r.idUnidad === idUnidad);
                    if (idFuncionario) filtrar = filtrar.filter(r => r.idFuncionario === idFuncionario);
                }
                setRegistros(Array.isArray(filtrar) ? filtrar : []);
            })
            .catch(() => setError("No se pudieron cargar los registros"))
            .finally(() => setLoading(false));
    }, [formularioId, idUnidad, idFuncionario, esCuotaPadre, user.token, showEdit]);

    if (!state || !state.formularioId) {
        return (
            <div className="container py-4">
                <Alert variant="warning">
                    No se proporcionaron los datos del formulario.
                    <Button size="sm" className="ms-3" onClick={() => navigate(-1)}>
                        Volver
                    </Button>
                </Alert>
            </div>
        );
    }

    // ---- Modal de edición ----
    const handleShowEdit = (registro) => {
        setRegistroEdit(registro);
        setValoresEdit({ ...registro.datos });
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        setShowEdit(false);
        setRegistroEdit(null);
        setValoresEdit({});
    };

    const handleEditChange = (campo, valor) => {
        setValoresEdit(v => ({ ...v, [campo]: valor }));
    };

    const handleGuardarEdicion = async () => {
        setSaving(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros/${registroEdit.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ valores: valoresEdit }),
                }
            );
            if (!res.ok) throw new Error("Error al guardar");
            setShowEdit(false);
        } catch (e) {
            alert("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    // ---- Renderizador de celda inteligente ----
    function renderCell(valor) {
        if (valor === null || valor === undefined) return "";
        // Si es label/value (select async o select normal)
        if (
            typeof valor === "object" &&
            valor !== null &&
            Object.keys(valor).includes("label")
        ) {
            return valor.label;
        }
        // Si es booleano
        if (typeof valor === "boolean") {
            return valor ? "Sí" : "No";
        }
        // Si es array de objetos: subformulario
        if (Array.isArray(valor)) {
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
        }
        // Si es objeto genérico (no label/value ni array), mostrar JSON corto
        if (typeof valor === "object") {
            return <span title={JSON.stringify(valor)}>[objeto]</span>;
        }
        // Normal (string/number)
        return valor;
    }

    // ---- Render del modal de subformulario ----
    function SubformModal() {
        if (!subformData || !Array.isArray(subformData) || subformData.length === 0)
            return null;
        // Tomar todas las claves presentes en el subformulario
        const allKeys = Array.from(
            subformData.reduce((acc, item) => {
                Object.keys(item).forEach((k) => acc.add(k));
                return acc;
            }, new Set())
        );
        return (
            <Modal show={showSubform} onHide={() => setShowSubform(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle del subformulario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered hover>
                        <thead>
                        <tr>
                            {allKeys.map(k => (
                                <th key={k}>{k}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {subformData.map((row, i) => (
                            <tr key={i}>
                                {allKeys.map(k => (
                                    <td key={k}>
                                        {renderCell(row[k])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSubform(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // ---- Render ----
    // ...el resto del código igual...
    return (
        <div className="container py-4">
            {/* Botón volver */}
            <div className="d-flex justify-content-end mb-2">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/servicios-especiales")}
                >
                    ← Volver a formularios
                </Button>
            </div>
            <h3 className="mb-3" style={{ color: azulPDI }}>
                Registros: {formulario.nombre || "Formulario"}
            </h3>
            <div className="mb-2">
                {!esCuotaPadre && (
                    <>
                        {idUnidad && <Badge bg="secondary">Unidad: {idUnidad}</Badge>}
                        {idFuncionario && <Badge bg="info" className="ms-2">Funcionario: {idFuncionario}</Badge>}
                    </>
                )}
            </div>
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
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {registros.length === 0 ? (
                        <tr>
                            <td colSpan={campos.length + 4} className="text-center text-muted">
                                No hay registros aún
                            </td>
                        </tr>
                    ) : (
                        registros.map((r, i) => (
                            <tr key={r.id}>
                                <td>{i + 1}</td>
                                {campos.map(c => (
                                    <td key={c.nombre}>
                                        {renderCell(r.datos?.[c.nombre])}
                                    </td>
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
                                    {user.idFuncionario &&
                                        r.idFuncionario === user.idFuncionario && (
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                onClick={() => handleShowEdit(r)}
                                                disabled={true}
                                            >
                                                Editar
                                            </Button>
                                        )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            )}

            {/* --- Modal de edición --- */}
            <Modal show={showEdit} onHide={handleCloseEdit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {campos.map(campo => (
                            <Form.Group key={campo.nombre} className="mb-3">
                                <Form.Label>{campo.etiqueta || campo.nombre}</Form.Label>
                                <Form.Control
                                    type={campo.tipo === "number" ? "number" : "text"}
                                    value={valoresEdit[campo.nombre] ?? ""}
                                    disabled={saving}
                                    onChange={e =>
                                        handleEditChange(
                                            campo.nombre,
                                            campo.tipo === "number"
                                                ? Number(e.target.value)
                                                : e.target.value
                                        )
                                    }
                                />
                            </Form.Group>
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEdit} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleGuardarEdicion} disabled={saving}>
                        {saving ? <Spinner size="sm" /> : "Guardar cambios"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- Modal de subformulario --- */}
            <SubformModal />
        </div>
    );
}