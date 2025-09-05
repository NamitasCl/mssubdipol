import React, { useEffect, useState } from "react";
import { buscarCalendario } from "../../api/calendarApi";
import { Button, Spinner, Card } from "react-bootstrap";
import ConfigurarUnidadesAportantesModal from "./ConfigurarUnidadesAportantesModal";
import ConfigurarProcepolModal from "./ConfigurarProcepolModal.jsx"; // importa tu modal

export default function CalendarioDetalle({ id, onVolver }) {
    const [cal, setCal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAportes, setShowAportes] = useState(false); // ← NUEVO
    const [showAporteProcepol, setShowAporteProcepol] = useState(false);

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
                <div><b>Unidad:</b> {(cal.tipo === "COMPLEJO" || cal.tipo === "PROCEPOL") ? cal.nombre : cal.siglasUnidad}</div>
                <div><b>Estado:</b> {cal.estado}</div>

                {/* SOLO si es COMPLEJO muestra el botón */}
                {(cal.tipo === "COMPLEJO" || cal.tipo === "PROCEPOL") && (
                    <>
                        <div className={ "d-flex gap-2 align-items-center"}>

                            {/*Botón para configurar unidades colaboradoras*/}

                            {cal.tipo === "COMPLEJO" && (
                                <Button
                                    variant="primary"
                                    className="mt-3"
                                    onClick={() => setShowAportes(true)}
                                >
                                    Configurar unidades colaboradoras
                                </Button>
                            )}

                            {/*Botón para configurar unidades para PROCEPOL*/}

                            {cal.tipo === "PROCEPOL" && (
                                <Button
                                    variant="primary"
                                    className="mt-3"
                                    onClick={() => setShowAporteProcepol(true)}
                                >
                                    Configurar unidades para PROCEPOL
                                </Button>
                            )}
                        </div>
                        {/* Aquí va el modal */}
                        <ConfigurarUnidadesAportantesModal
                            show={showAportes}
                            onHide={() => setShowAportes(false)}
                            idCalendario={cal.id}
                        />

                        <ConfigurarProcepolModal
                            show={showAporteProcepol}
                            onHide={() => setShowAporteProcepol(false)}
                            idCalendario={cal.id}
                        />
                    </>
                )}
            </Card.Body>
        </Card>
    );
}