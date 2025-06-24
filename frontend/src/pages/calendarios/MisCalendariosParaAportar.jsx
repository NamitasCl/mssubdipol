import React, { useEffect, useState } from "react";
import { listarCalendarios } from "../../api/calendarApi";
import { listarFuncionariosAportados } from "../../api/funcionariosAporteApi";
import { listar as listarAportes } from "../../api/funcionariosAporteApi.js"; // Debes crear este archivo o método según tu backend
import { Button, Table, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import IngresoFuncionariosAporte from "./IngresoFuncionariosAporte"; // El componente de ingreso

export default function MisCalendariosParaAportar() {
    const { user } = useAuth();
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [aportesPorCalendario, setAportesPorCalendario] = useState({});
    const [funcionariosPorCalendario, setFuncionariosPorCalendario] = useState({});
    const [showIngreso, setShowIngreso] = useState(false);

    useEffect(() => {
        setLoading(true);
        listarCalendarios().then(async (todos) => {
            // Filtra solo los calendarios donde la unidad del usuario debe aportar
            console.log("Todos: ", todos);
            const mios = todos.filter(c => {
                if (c.tipo === "UNIDAD") {
                    // El calendario es exclusivo de tu unidad
                    return c.idUnidad === user.idUnidad;
                }
                if (c.tipo === "COMPLEJO") {
                    // El calendario es de un complejo y debes buscar tu unidad en los aportes
                    return (c.aporteUnidadTurnos || []).some(
                        a => a.idUnidad === user.idUnidad
                    );
                }
                return false;
            });

            // Para cada calendario, consulta los aportes de unidades
            const aportesData = {};
            const funcionariosData = {};
            await Promise.all(mios.map(async (cal) => {
                const aportes = await listarAportes(cal.id); // [{idUnidad, cantidadFuncionarios, ...}]
                const miAporte = (cal.aporteUnidadTurnos || []).find(a => a.idUnidad === user.idUnidad);
                aportesData[cal.id] = miAporte || null;

                // Consulta funcionarios ya aportados solo si hay aporte
                if (miAporte) {
                    const funcionarios = await listarFuncionariosAportados(cal.id, user.idUnidad);
                    funcionariosData[cal.id] = funcionarios;
                }
            }));
            setAportesPorCalendario(aportesData);
            setFuncionariosPorCalendario(funcionariosData);
            setCalendarios(mios);
            setLoading(false);
        });
    }, [user.idUnidad]);

    if (loading) return <Spinner />;

    // Verifica si hay aportes pendientes
    const pendientes = calendarios.filter(cal => {
        const aporte = aportesPorCalendario[cal.id];
        const funcionarios = funcionariosPorCalendario[cal.id] || [];
        return aporte && (funcionarios.length < aporte.cantidadFuncionarios);
    });

    return (
        <div>
            <h2>Mis calendarios donde debo aportar personal</h2>
            {pendientes.length > 0 && (
                <Alert variant="warning">
                    ¡Tienes calendarios con cupos de personal pendientes de aportar!
                </Alert>
            )}
            <Table striped bordered>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Mes/Año</th>
                    <th>Tipo</th>
                    <th>Unidad/Complejo</th>
                    <th>Cupos requeridos</th>
                    <th>Cupos aportados</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
                </thead>
                <tbody>
                {calendarios.map(cal => {
                    const aporte = aportesPorCalendario[cal.id];
                    const funcionarios = funcionariosPorCalendario[cal.id] || [];
                    if (!aporte) return null; // Solo muestra si la unidad tiene aporte asignado

                    const estado = funcionarios.length >= aporte.cantidadFuncionarios ? "Completado" : "Pendiente";

                    return (
                        <tr key={cal.id}>
                            <td>{cal.nombre}</td>
                            <td>{cal.mes}/{cal.anio}</td>
                            <td>{cal.tipo}</td>
                            <td>{cal.tipo === "COMPLEJO" ? cal.nombreComplejo : cal.nombreUnidad}</td>
                            <td>{aporte.cantidadFuncionarios}</td>
                            <td>{funcionarios.length}</td>
                            <td>
                                    <span className={`badge bg-${estado === "Completado" ? "success" : "danger"}`}>
                                        {estado}
                                    </span>
                            </td>
                            <td>
                                <Button
                                    variant={estado === "Completado" ? "outline-secondary" : "primary"}
                                    onClick={() => {
                                        setCalendarioSeleccionado({ ...cal, aporte });
                                        setShowIngreso(true);
                                    }}
                                >
                                    {estado === "Completado" ? "Ver / Editar" : "Aportar Personal"}
                                </Button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </Table>

            {/* Modal para ingresar funcionarios */}
            {showIngreso && calendarioSeleccionado && (
                <IngresoFuncionariosAporte
                    show={showIngreso}
                    onHide={() => setShowIngreso(false)}
                    calendario={calendarioSeleccionado}
                    aporte={calendarioSeleccionado.aporte}
                />
            )}
        </div>
    );
}