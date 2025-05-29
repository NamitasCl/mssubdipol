import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Container, Button, Form, Alert, Spinner, Toast, ToastContainer } from "react-bootstrap";
import AsyncFuncionarioSelect from "../../components/ComponentesAsyncSelect/AsyncFuncionarioSelect.jsx";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect.jsx";
import AsyncRegionesPolicialesSelect from "../../components/ComponentesAsyncSelect/AsyncRegionesPolicialesSelect.jsx";

// Paleta institucional
const azulPDI = "#17355A";
const doradoPDI = "#FFC700";
const grisOscuro = "#222938";

// Props: formularioId
const FormularioDinamico = ({ formularioId, user, onSuccess }) => {
    const [definicion, setDefinicion] = useState(null);
    const [valores, setValores] = useState({});
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    // 1. Cargar definición al montar
    useEffect(() => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formularioId}`)
            .then(({ data }) => {
                setDefinicion(data);
                // Inicializa los valores con vacío/false y también _label para tipos select
                const ini = {};
                data.campos.forEach(c => {
                    ini[c.nombre] = c.tipo === "boolean" ? false : "";
                    if (["funcionario", "unidad", "repol"].includes(c.tipo)) {
                        ini[`${c.nombre}_label`] = "";
                    }
                });
                setValores(ini);
            })
            .catch(() => setError("Error cargando la definición"))
            .finally(() => setLoading(false));
    }, [formularioId]);

    // 2. Cambios en los inputs
    const handleChange = (e, campo) => {
        const { type, checked, value, name } = e.target;
        setValores((vals) => ({
            ...vals,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // 3. Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMsg(null);
        try {
            await axios.post(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros`,
                {
                    formularioId: definicion.id,
                    datos: valores
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMsg("Registro enviado correctamente.");
            setToastVariant("success");
            setToastMsg("Registro guardado correctamente.");
            setShowToast(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError("No se pudo guardar el registro.");
            setToastVariant("danger");
            setToastMsg("No se pudo guardar el registro.");
            setShowToast(true);
        }
    };

    // 4. Render
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" />
            </div>
        );
    }

    if (!definicion) {
        return <Alert variant="danger">No se encontró el formulario.</Alert>;
    }

    return (
        <>
            {/* Toast institucional arriba, centrado */}
            <ToastContainer
                position="top-center"
                style={{ zIndex: 9999, marginTop: 18 }}
                className="mt-3"
            >
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    bg={toastVariant}
                    autohide
                    delay={3400}
                >
                    <Toast.Header closeButton={true}
                                  style={{
                                      background: toastVariant === "success" ? doradoPDI : "#e35d6a",
                                      color: azulPDI,
                                      fontWeight: 600
                                  }}
                    >
                        {toastVariant === "success" ? "Éxito" : "Error"}
                    </Toast.Header>
                    <Toast.Body
                        style={{
                            background: "#232f47",
                            color: "#fff",
                            fontWeight: 500
                        }}
                    >
                        {toastMsg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <div
                style={{
                    minHeight: "80vh",
                    background: `radial-gradient(circle at 60% 20%, #23395d 0%, #172338 90%)`,
                    paddingTop: "48px",
                    paddingBottom: "24px"
                }}
            >
                <Container style={{ maxWidth: 600 }}>
                    <Card
                        className="shadow-lg border-0 mx-auto"
                        style={{
                            background: "rgba(28,36,48,0.96)",
                            borderRadius: "1.2rem",
                            border: `2.5px solid ${doradoPDI}`,
                            boxShadow: "0 5px 30px 0 #0e2042a1"
                        }}
                    >
                        <Card.Body>
                            <h3
                                className="fw-bold mb-2 text-uppercase"
                                style={{
                                    color: doradoPDI,
                                    fontSize: "1.26rem",
                                    letterSpacing: ".09em",
                                    borderLeft: `5px solid ${doradoPDI}`,
                                    paddingLeft: "1rem"
                                }}
                            >
                                {definicion.nombre}
                            </h3>
                            <div style={{ color: "#b8becd", fontSize: ".99rem", marginBottom: "1.4rem" }}>
                                {definicion.descripcion}
                            </div>
                            {/* Si prefieres solo Toast, puedes quitar esto: */}
                            {msg && <Alert variant="success">{msg}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                {definicion.campos
                                    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                                    .map((campo, idx) => (
                                        <Form.Group key={idx} className="mb-3">
                                            <Form.Label className="text-light fw-semibold">
                                                {campo.etiqueta} {campo.requerido && <span style={{ color: doradoPDI }}>*</span>}
                                            </Form.Label>
                                            {campo.tipo === "text" && (
                                                <Form.Control
                                                    type="text"
                                                    name={campo.nombre}
                                                    value={valores[campo.nombre]}
                                                    onChange={handleChange}
                                                    required={campo.requerido}
                                                    style={{
                                                        background: grisOscuro,
                                                        color: "#fff",
                                                        border: `1.5px solid ${doradoPDI}`,
                                                        borderRadius: ".5rem"
                                                    }}
                                                />
                                            )}
                                            {campo.tipo === "datetime-local" && (
                                                <Form.Control
                                                    type="datetime-local"
                                                    name={campo.nombre}
                                                    value={valores[campo.nombre]}
                                                    onChange={handleChange}
                                                    required={campo.requerido}
                                                    style={{
                                                        background: grisOscuro,
                                                        color: "#fff",
                                                        border: `1.5px solid ${doradoPDI}`,
                                                        borderRadius: ".5rem"
                                                    }}
                                                />
                                            )}
                                            {campo.tipo === "boolean" && (
                                                <div>
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Sí"
                                                        name={campo.nombre}
                                                        checked={valores[campo.nombre]}
                                                        onChange={e => handleChange(e, campo)}
                                                        style={{ color: doradoPDI }}
                                                    />
                                                </div>
                                            )}
                                            {campo.tipo === "select" && (
                                                <Form.Select
                                                    name={campo.nombre}
                                                    value={valores[campo.nombre]}
                                                    onChange={handleChange}
                                                    required={campo.requerido}
                                                    style={{
                                                        background: grisOscuro,
                                                        color: "#fff",
                                                        border: `1.5px solid ${doradoPDI}`,
                                                        borderRadius: ".5rem"
                                                    }}
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {(campo.opciones || "")
                                                        .split(",")
                                                        .map((opt, i) => (
                                                            <option key={i} value={opt.trim()}>
                                                                {opt.trim()}
                                                            </option>
                                                        ))}
                                                </Form.Select>
                                            )}
                                            {campo.tipo === "radio" && (
                                                <div>
                                                    {(campo.opciones || "")
                                                        .split(",")
                                                        .map((opt, i) => (
                                                            <Form.Check
                                                                key={i}
                                                                type="radio"
                                                                name={campo.nombre}
                                                                value={opt.trim()}
                                                                label={opt.trim()}
                                                                checked={valores[campo.nombre] === opt.trim()}
                                                                onChange={handleChange}
                                                                required={campo.requerido && i === 0} // El primero marca el required, evita duplicados
                                                                style={{ color: doradoPDI, marginRight: "1.7rem" }}
                                                            />
                                                        ))}
                                                </div>
                                            )}
                                            {/* Selectores especiales */}
                                            {campo.tipo === "funcionario" && (
                                                <AsyncFuncionarioSelect
                                                    user={user}
                                                    value={
                                                        valores[campo.nombre]
                                                            ? { value: valores[campo.nombre], label: valores[`${campo.nombre}_label`] }
                                                            : null
                                                    }
                                                    onChange={selected => setValores(vals => ({
                                                        ...vals,
                                                        [campo.nombre]: selected ? selected.value : "",
                                                        [`${campo.nombre}_label`]: selected ? selected.label : ""
                                                    }))}
                                                />
                                            )}
                                            {campo.tipo === "unidad" && (
                                                <AsyncUnidadesSelect
                                                    user={user}
                                                    value={
                                                        valores[campo.nombre]
                                                            ? { value: valores[campo.nombre], label: valores[`${campo.nombre}_label`] }
                                                            : null
                                                    }
                                                    onChange={selected => setValores(vals => ({
                                                        ...vals,
                                                        [campo.nombre]: selected ? selected.value : "",
                                                        [`${campo.nombre}_label`]: selected ? selected.label : ""
                                                    }))}
                                                />
                                            )}
                                            {campo.tipo === "repol" && (
                                                <AsyncRegionesPolicialesSelect
                                                    user={user}
                                                    value={
                                                        valores[campo.nombre]
                                                            ? { value: valores[campo.nombre], label: valores[`${campo.nombre}_label`] }
                                                            : null
                                                    }
                                                    onChange={selected => setValores(vals => ({
                                                        ...vals,
                                                        [campo.nombre]: selected ? selected.value : "",
                                                        [`${campo.nombre}_label`]: selected ? selected.label : ""
                                                    }))}
                                                />
                                            )}
                                        </Form.Group>
                                    ))}
                                <div className="d-flex justify-content-end mt-3">
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        className="fw-bold px-4"
                                        style={{
                                            background: doradoPDI,
                                            color: azulPDI,
                                            border: `2px solid ${doradoPDI}`,
                                            borderRadius: "2rem",
                                            fontSize: "1.07rem",
                                            letterSpacing: ".05em",
                                            boxShadow: "0 2px 10px #ffd80033"
                                        }}
                                    >
                                        Enviar
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        </>
    );
};

export default FormularioDinamico;
