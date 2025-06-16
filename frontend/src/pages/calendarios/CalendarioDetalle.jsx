import React, { useEffect, useState } from "react";
import { buscarCalendario } from "../../api/calendarApi";
import { Button, Spinner, Card } from "react-bootstrap";

export default function CalendarioDetalle({ id, onVolver }) {
    const [cal, setCal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        buscarCalendario(id)
            .then(setCal)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner animation="border" />;
    if (!cal) return <div>No encontrado</div>;

    return (
        <Card>
            <Card.Header>
                <Button variant="secondary" size="sm" onClick={onVolver}>
                    ← Volver
                </Button>{" "}
                Detalle de Calendario
            </Card.Header>
            <Card.Body>
                <div><b>Nombre:</b> {cal.nombre}</div>
                <div><b>Mes/Año:</b> {cal.mes} / {cal.anio}</div>
                <div><b>Tipo:</b> {cal.tipo}</div>
                <div><b>Unidad:</b> {cal.siglasUnidad ?? cal.idUnidad}</div>
                <div><b>Estado:</b> {cal.estado}</div>
                {/* Muestra más detalles si necesitas */}
            </Card.Body>
        </Card>
    );
}