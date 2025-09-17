import React, { useEffect, useState } from "react";
import { Table, Button, ProgressBar, Alert } from "react-bootstrap";
import axios from "axios";
import DelegarCuotaFormulario from "./DelegarCuotaFormulario";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

export default function VisualizadorCuotasFormulario({ formularioId }) {
    const { user } = useAuth();
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargar = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_FORMS_API_URL}/dinamico/cuotas/formulario/${formularioId}`,
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            setCuotas(data);
        } catch (e) {
            setError("Error al cargar cuotas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [formularioId]);

    return (
        <>
            <h4>Cuotas/Asignaciones del formulario</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Destino</th>
                    <th>Cuota</th>
                    <th>Avance</th>
                    <th>Delegar</th>
                </tr>
                </thead>
                <tbody>
                {cuotas.map((cuota, i) => (
                    <tr key={cuota.id}>
                        <td>{i + 1}</td>
                        <td>
                            {cuota.idUnidad ? `Unidad ID: ${cuota.idUnidad}` : ""}
                            {cuota.idFuncionario ? `Funcionario ID: ${cuota.idFuncionario}` : ""}
                        </td>
                        <td>{cuota.cuotaAsignada}</td>
                        <td>
                            <ProgressBar now={0} max={cuota.cuotaAsignada || 1} label={`0/${cuota.cuotaAsignada}`} />
                        </td>
                        <td>
                            {/* Puedes condicionar esto según permisos */}
                            <DelegarCuotaFormulario cuotaPadre={cuota} onDelegado={cargar} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </>
    );
}