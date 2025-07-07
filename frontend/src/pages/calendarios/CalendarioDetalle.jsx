import React, { useEffect, useState } from "react";
import { buscarCalendario } from "../../api/calendarApi";
import { Button, Spinner, Card } from "react-bootstrap";
import ConfigurarUnidadesAportantesModal from "./ConfigurarUnidadesAportantesModal"; // importa tu modal

export default function CalendarioDetalle({ id, onVolver }) {
    const [cal, setCal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAportes, setShowAportes] = useState(false); // ← NUEVO

    useEffect(() => {
        buscarCalendario(id)
            .then(setCal)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner animation="border" />;
    if (!cal) return <div>No encontrado</div>;

    console.log("Calendario cargado:", cal);

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
                <div><b>Unidad:</b> {cal.tipo === "COMPLEJO" ? cal.nombre : cal.siglasUnidad}</div>
                <div><b>Estado:</b> {cal.estado}</div>

                {/* SOLO si es COMPLEJO muestra el botón */}
                {cal.tipo === "COMPLEJO" && (
                    <>
                        <Button
                            variant="primary"
                            className="mt-3"
                            onClick={() => setShowAportes(true)}
                        >
                            Configurar unidades colaboradoras
                        </Button>
                        {/* Aquí va el modal */}
                        <ConfigurarUnidadesAportantesModal
                            show={showAportes}
                            onHide={() => setShowAportes(false)}
                            idCalendario={cal.id}
                        />
                    </>
                )}
            </Card.Body>
        </Card>
    );
}