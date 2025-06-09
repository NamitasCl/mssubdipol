import React, { useState } from "react";
import { Button, Badge, Spinner } from "react-bootstrap";
import axios from "axios";

export default function AbrirCerrarCalendarioTurnos({ calendario, onEstadoCambiado }) {
    const [loading, setLoading] = useState(false);

    const handleCambiarEstado = async (nuevoEstado) => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_TURNOS_API_URL}/open-close`, {
                nombreCalendario: calendario.nombreCalendario,
                mes: calendario.mes,
                anio: calendario.anio,
                open: nuevoEstado,
                ids: calendario.plantillasUsadas.map(p => p.id),
                idUnidad: calendario.idUnidad || null,
                idComplejo: calendario.idComplejo || null,
                creador: calendario.idFuncionarioCreador
            });
            alert(nuevoEstado ? "Calendario abierto." : "Calendario cerrado.");
            if (onEstadoCambiado) onEstadoCambiado();
        } catch (error) {
            alert("Error al cambiar el estado del calendario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-2">
                <span className="fw-bold">Estado actual: </span>
                <Badge bg={calendario.activo ? "success" : "danger"}>
                    {calendario.activo ? "Abierto" : "Cerrado"}
                </Badge>
            </div>
            <Button
                variant={calendario.activo ? "outline-warning" : "success"}
                onClick={() => handleCambiarEstado(!calendario.activo)}
                disabled={loading}
            >
                {loading ? <Spinner size="sm" /> : calendario.activo ? "Cerrar Calendario" : "Abrir Calendario"}
            </Button>
        </div>
    );
}
