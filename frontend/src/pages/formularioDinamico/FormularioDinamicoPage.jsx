import React, { useEffect, useState } from "react";
import {
    useParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import {
    Spinner,
    Alert,
    Button,
} from "react-bootstrap";
import axios from "axios";
import FormularioDinamico from "./FormularioDinamico";
import { useAuth } from "../../AuthContext.jsx";

export default function FormularioDinamicoPage() {
    const { id: formularioId } = useParams();
    const [searchParams] = useSearchParams();
    const registroId = searchParams.get("registroId"); // null si no viene
    const navigate = useNavigate();
    const { user } = useAuth();

    /* ---------- estado ---------- */
    const [fields, setFields] = useState([]);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [registro, setRegistro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enviado, setEnviado] = useState(false);

    /* ---------- carga definición ---------- */
    useEffect(() => {
        setLoading(true);
        setError("");

        axios
            .get(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${formularioId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            .then((r) => {
                setFields(r.data.campos || []);
                setNombre(r.data.nombre);
                setDescripcion(r.data.descripcion);
            })
            .catch(() => setError("No se pudo cargar el formulario."))
            .finally(() => setLoading(false));
    }, [formularioId, user.token]);

    /* ---------- carga registro si edita ---------- */
    useEffect(() => {
        if (!registroId) return;

        setLoading(true);
        axios
            .get(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/registros/registro/${registroId}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            .then((r) => setRegistro(r.data))
            .catch(() => setError("No se pudo cargar el registro."))
            .finally(() => setLoading(false));
    }, [registroId, user.token]);

    /* ---------- submit ---------- */
    const guardar = (values, regId) => {
        const url = regId
            ? `${import.meta.env.VITE_FORMS_API_URL}/dinamico/registros/${regId}`
            : `${import.meta.env.VITE_FORMS_API_URL}/dinamico/registros`;

        const metodo = regId ? "put" : "post";

        axios[metodo](
            url,
            {
                formularioId: Number(formularioId),
                datos: values,
            },
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(() => setEnviado(true))
            .catch(() => setError("Error al guardar el formulario"));
    };

    /* ---------- renders de estado ---------- */
    if (loading)
        return (
            <div className="text-center mt-5">
                <Spinner />
            </div>
        );

    if (error)
        return (
            <Alert variant="danger" className="mt-5 text-center">
                {error}
            </Alert>
        );

    if (enviado)
        return (
            <div className="text-center mt-5">
                <Alert variant="success">
                    ¡Formulario guardado correctamente!
                </Alert>
                <Button onClick={() => navigate("/servicios-especiales")}>
                    Volver a formularios
                </Button>
            </div>
        );

    /* ---------- render normal ---------- */
    return (
        <div style={{ maxWidth: 700, margin: "32px auto" }}>
            <h2 className="fw-bold mb-2" style={{ color: "#23395d" }}>
                {nombre}
            </h2>
            <p className="mb-4" style={{ color: "#4a5975" }}>
                {descripcion}
            </p>

            <FormularioDinamico
                fields={fields}
                initialValues={registro?.datos ?? {}}
                registroId={registroId}
                onSubmit={guardar}
            />

            <div className="mt-4 text-end">
                <Button
                    variant="secondary"
                    onClick={() => navigate("/servicios-especiales")}
                >
                    Volver
                </Button>
            </div>
        </div>
    );
}
