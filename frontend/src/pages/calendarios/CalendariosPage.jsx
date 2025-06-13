import React, { useEffect, useState } from "react";
import { Button, Table, Spinner } from "react-bootstrap";
import { fetchCalendarios } from "../../api/turnosApi.js";
import CalendarioFormModal from "./CalendarioFormModal";
import AbrirCerrarCalendarioTurnos from "../turnos/AbrirCerrarCalendarioTurnos.jsx"; // reutilizas

export default function CalendariosPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = async () => {
        setLoading(true);
        const res = await fetchCalendarios();
        setData(res.data);
        console.log(res.data)
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    return (
        <div>
            <h3 className="mb-3">Calendarios de Turnos</h3>

            <Button className="mb-3" onClick={() => setShowModal(true)}>
                Nuevo Calendario
            </Button>

            {loading ? <Spinner /> : (
                <Table striped bordered>
                    <thead>
                    <tr>
                        <th>#</th><th>Nombre</th><th>Periodo</th><th>Tipo</th><th>Estado</th><th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((c, idx) => (
                        <tr key={c.id}>
                            <td>{idx+1}</td>
                            <td>{c.name}</td>
                            <td>{c.month}/{c.year}</td>
                            <td>{c.type}</td>
                            <td>
                                <AbrirCerrarCalendarioTurnos
                                    calendario={c}
                                    onEstadoCambiado={load}
                                />
                            </td>
                            <td>
                                {/* link a unidades / indisponibilidad / generar */}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            <CalendarioFormModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSaved={load}
            />
        </div>
    );
}