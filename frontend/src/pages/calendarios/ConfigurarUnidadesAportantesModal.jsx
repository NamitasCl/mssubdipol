import React, { useState, useEffect } from "react";
import AsyncUnidadesSelect from "../../components/ComponentesAsyncSelect/AsyncUnidadesSelect";
import { agregarAporteUnidad, getAportesPorCalendario } from "../../api/aporteTurnosGuardiasApi.js";
import { getResumenSlots } from "../../api/slotApi";
import { Modal, Button, Table, Form, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

export default function ConfigurarUnidadesAportantesModal({ show, onHide, idCalendario }) {
    const { user } = useAuth();
    const [aportes, setAportes] = useState([]);
    const [cantidad, setCantidad] = useState(1);
    const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
    const [slots, setSlots] = useState(0);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (show) {
            setBusy(true);
            Promise.all([
                getAportesPorCalendario(idCalendario),
                getResumenSlots(idCalendario),
            ])
                .then(([aportes, resumen]) => {
                    setAportes(aportes);
                    setSlots(resumen.totalSlots);
                })
                .finally(() => setBusy(false));
        }
    }, [show, idCalendario]);

    const agregarAporte = async () => {
        if (!unidadSeleccionada) return;
        await agregarAporteUnidad({
            idCalendario,
            idUnidad: unidadSeleccionada.value,
            siglasUnidad: unidadSeleccionada.siglasUnidad || "",
            nombreUnidad: unidadSeleccionada.label,
            cantidadFuncionarios: cantidad,
            registradoPor: user.idFuncionario, // O el campo de tu auth
        });
        // Actualizar aportes
        const aportesActualizados = await getAportesPorCalendario(idCalendario);
        setAportes(aportesActualizados);
        setUnidadSeleccionada(null);
        setCantidad(1);
    };

    const totalAportado = aportes.reduce((sum, a) => sum + a.cantidadFuncionarios, 0);

    if (busy) return <Spinner />;

    return (
        <Modal show={show} onHide={onHide} size={"lg"} centered>
            <Modal.Header closeButton>
                <Modal.Title>Unidades colaboradoras - Aporte de personal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant={totalAportado < slots ? "warning" : "success"}>
                    Total puestos a cubrir: <b>{slots}</b> <br/>
                    Total comprometido: <b>{totalAportado}</b> <br/>
                    {totalAportado < slots
                        ? "⚠️ Aún faltan funcionarios por aportar."
                        : "✅ ¡Cupos cubiertos!"}
                </Alert>
                <Table size="sm" striped>
                    <thead>
                    <tr>
                        <th>Unidad</th>
                        <th>Cantidad</th>
                    </tr>
                    </thead>
                    <tbody>
                    {aportes.map(a => (
                        <tr key={a.id}>
                            <td>{a.nombreUnidad}</td>
                            <td>{a.cantidadFuncionarios}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                <Form className="d-flex align-items-end gap-2 mt-3 w-100">
                    <Form.Group style={{width: '50%'}}>
                        <Form.Label>Unidad</Form.Label>
                        <AsyncUnidadesSelect
                            value={unidadSeleccionada}
                            onChange={setUnidadSeleccionada}
                            user={user}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={cantidad}
                            onChange={e => setCantidad(Number(e.target.value))}
                        />
                    </Form.Group>
                    <Button onClick={agregarAporte} disabled={!unidadSeleccionada}>
                        Agregar
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}
