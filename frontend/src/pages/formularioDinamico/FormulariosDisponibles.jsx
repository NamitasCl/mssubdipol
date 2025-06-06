import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Table, Spinner } from 'react-bootstrap';
import {useAuth} from "../../components/contexts/AuthContext.jsx";

const FormulariosDisponibles = forwardRef((props, ref) => {
    const {user} = useAuth();
    const [formularios, setFormularios] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarFormularios = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(`${import.meta.env.VITE_FORMS_API_URL}/disponibles`, {headers: { Authorization: `Bearer ${user.token}` }});
            setFormularios(resp.data);
        } catch (error) {
            setFormularios([]);
        }
        setLoading(false);
    };

    useImperativeHandle(ref, () => ({
        recargar: cargarFormularios
    }));

    useEffect(() => {
        cargarFormularios();
    }, []);

    if (loading) return <Spinner animation="border" />;

    return (
        <Table striped bordered hover responsive>
            <thead>
            <tr>
                <th>ID</th>
                <th>Región Policial</th>
                <th>Brigada</th>
                <th>Nombre Servicio</th>
                <th>Inicio</th>
                <th>Término</th>
                <th>Sigla Carro</th>
            </tr>
            </thead>
            <tbody>
            {formularios.map(f => (
                <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.regionPolicial}</td>
                    <td>{f.brigada}</td>
                    <td>{f.nombreServicio}</td>
                    <td>{f.fechaHoraInicio}</td>
                    <td>{f.fechaHoraTermino}</td>
                    <td>{f.siglaCarro}</td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
});

export default FormulariosDisponibles;
