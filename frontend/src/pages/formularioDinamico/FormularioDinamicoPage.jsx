import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormularioDinamico from "./FormularioDinamico";
import { Spinner, Alert, Button } from "react-bootstrap";
import axios from "axios";
import {useAuth} from "../../AuthContext.jsx";

export default function FormularioDinamicoPage() {
    const {id} = useParams(); // Obtiene el ID desde la URL
    const [fields, setFields] = useState([]);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enviado, setEnviado] = useState(false);
    const navigate = useNavigate();

    const { user } = useAuth();

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${import.meta.env.VITE_FORMS_API_URL}/dinamico/definicion/${id}`, {headers: {Authorization: `Bearer ${user.token}`}})
            .then((res) => {
                setFields(res.data.campos || []);
                setNombre(res.data.nombre);
                setDescripcion(res.data.descripcion);
                setLoading(false);
                console.log("Resdata: ", res.data)
            })
            .catch(() => {
                setError("No se pudo cargar el formulario.");
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = (values) => {
        // Aquí deberías guardar los datos. Esto es solo un ejemplo:
        axios
            .post(`${import.meta.env.VITE_FORMS_API_URL}/dinamicos/registros`, {
                formularioId: parseInt(id),
                datos: values,
            },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                })
            .then(() => setEnviado(true))
            .catch(() => setError("Error al enviar el formulario"));
    };

    if (loading)
        return (
            <div className="text-center mt-5">
                <Spinner/>
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
                <Alert variant="success">¡Formulario enviado correctamente!</Alert>
                <Button onClick={() => navigate("/servicios-especiales")}>Volver a formularios</Button>
            </div>
        );

    return (
        <div style={{maxWidth: 700, margin: "32px auto"}}>
            <h2 className="fw-bold mb-2" style={{color: "#23395d"}}>{nombre}</h2>
            <p className="mb-4" style={{color: "#4a5975"}}>{descripcion}</p>
            <FormularioDinamico fields={fields} onSubmit={handleSubmit}/>
            <div className="mt-4 text-end">
                <Button variant="secondary" onClick={() => navigate("/servicios-especiales")}>
                    Volver
                </Button>
            </div>
        </div>
    );

}