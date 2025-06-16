import React, { useEffect, useState } from "react";
import { listarCalendarios, eliminarCalendario } from "../../api/calendarApi";
import { Button, Table, Spinner, Modal } from "react-bootstrap";
import CalendarioForm from "./CalendarioForm";

export default function CalendarioList({ onSeleccionar }) {
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [eliminarId, setEliminarId] = useState(null);
    const [editarCalendario, setEditarCalendario] = useState(null);

    useEffect(() => {
        setLoading(true);
        listarCalendarios()
            .then(setCalendarios)
            .finally(() => setLoading(false));
        console.log("Calendarios cargados:", calendarios);
    }, [refresh]);

    const handleEliminar = async (id) => {
        await eliminarCalendario(id, 1); // Cambia por usuario real
        setRefresh((r) => !r);
        setEliminarId(null);
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <>
            <Button onClick={() => setShowForm(true)} variant="success" className="mb-3">
                Nuevo Calendario
            </Button>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Mes/Año</th>
                    <th>Tipo</th>
                    <th>Unidad / Complejo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {calendarios.map((cal) => (
                    <tr key={cal.id}>
                        <td>{cal.nombre}</td>
                        <td>{cal.mes}/{cal.anio}</td>
                        <td>{cal.tipo}</td>
                        <td>
                            {cal.tipo === "COMPLEJO"
                                ? cal.nombreComplejo
                                : cal.siglasUnidad ?? cal.idUnidad}
                        </td>
                        <td>{cal.estado}</td>
                        <td>
                            <Button variant="info" size="sm" onClick={() => onSeleccionar(cal.id)}>
                                Ver
                            </Button>{" "}
                            <Button variant="danger" size="sm" onClick={() => setEliminarId(cal.id)}>
                                Eliminar
                            </Button>{" "}
                            <Button variant="warning" size="sm" onClick={() => {
                                    setEditarCalendario(cal);
                                    setShowForm(true);
                                }}
                            >
                                Editar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <CalendarioForm
                show={showForm}
                onHide={() => {
                    setShowForm(false);
                    setEditarCalendario(null);
                }}
                onSuccess={() => {
                    setShowForm(false);
                    setEditarCalendario(null);
                    setRefresh((r) => !r);
                }}
                calendarioEditar={editarCalendario}
            />
            <Modal show={!!eliminarId} onHide={() => setEliminarId(null)} centered>
                <Modal.Body>¿Seguro que quieres eliminar este calendario?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEliminarId(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={() => handleEliminar(eliminarId)}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}