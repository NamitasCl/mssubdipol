import React, { useEffect, useState } from "react";
import { listarCalendarios } from "../../api/calendarApi";
import { listarFuncionariosAportados } from "../../api/funcionariosAporteApi";
import { Button, Table, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import IngresoFuncionariosAporte from "./IngresoFuncionariosAporte"; // El componente de ingreso
import ListaFuncionariosAportados from "./ListaFuncionariosAportados";
import IngresoFuncionarioConDiasNoDisponibles from "./IngresoFuncionarioConDiasNoDisponibles.jsx";

export default function MisCalendariosParaAportar() {
    const { user } = useAuth();
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [aportesPorCalendario, setAportesPorCalendario] = useState({});
    const [funcionariosPorCalendario, setFuncionariosPorCalendario] = useState({});
    const [showIngreso, setShowIngreso] = useState(false);
    const [showLista, setShowLista] = useState(false);
    const [showDiasNoDisponibles, setShowDiasNoDisponibles] = useState(false);
    const [calendarioParaVer, setCalendarioParaVer] = useState(null);
    const [calendarioView, setCalendarioView] = useState(null);


    const cargarDatos = async () => {
        setLoading(true);
        listarCalendarios().then(async (todos) => {
            // Filtra solo los calendarios donde la unidad del usuario debe aportar

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
                if (c.tipo === "RONDA") {
                    return (user.roles).some(r => r === "ROLE_TURNOS_RONDA")
                }
                return false;
            });


            // Para cada calendario, consulta los aportes de unidades
            const aportesData = {};
            const funcionariosData = {};
            await Promise.all(mios.map(async (cal) => {
                let miAporte = null;
                if (cal.tipo === "COMPLEJO") {
                    miAporte = (cal.aporteUnidadTurnos || []).find(a => a.idUnidad === user.idUnidad) || null;
                }
                if (cal.tipo === "UNIDAD") {
                    // Para unidad, crea un objeto "dummy" solo para uniformidad visual
                    miAporte = {
                        idUnidad: user.idUnidad,
                        cantidadFuncionarios: null // O 'Infinity' o '—' si lo prefieres en la tabla
                    };
                }
                aportesData[cal.id] = miAporte;

                // Consulta funcionarios ya aportados (en ambos casos puedes consultar)
                const funcionarios = await listarFuncionariosAportados(cal.id, user.idUnidad);
                funcionariosData[cal.id] = funcionarios;
            }));

            setAportesPorCalendario(aportesData);
            setFuncionariosPorCalendario(funcionariosData);
            setCalendarios(mios);
            setLoading(false);
        });
    }

    useEffect(() => {
        cargarDatos();
    }, [user.idUnidad]);

    if (loading) return <Spinner />;

    // Verifica si hay aportes pendientes
    const pendientes = calendarios.filter(cal => {
        const aporte = aportesPorCalendario[cal.id];
        const funcionarios = funcionariosPorCalendario[cal.id] || [];
        return aporte && (funcionarios.length < aporte.cantidadFuncionarios);
    });

    return (
        <div style={{padding:'2%'}}>
            <div style={{marginBottom: '20px'}}>
                <h2>Calendarios</h2>
            </div>
            <Table striped bordered>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Mes/Año</th>
                    <th>Tipo</th>
                    <th>Unidad/Complejo</th>
                    <th>Servicios a cubrir</th>
                    <th>Personal aportado</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
                </thead>
                <tbody>
                {calendarios.map(cal => {



                    const puedeAportar =
                        user.roles.includes('ROLE_JEFE') ||
                        user.roles.includes('ROLE_SUBJEFE') ||
                        user.roles.includes('ROLE_TURNOS') ||
                        user.roles.includes("ROLE_TURNOS_RONDA");


                    if(cal.tipo === "COMPLEJO" && !puedeAportar) {
                        return null; // Solo muestra si el usuario es Jefe o Subjefe
                    }

                    const aporte = aportesPorCalendario[cal.id];

                    // Si es COMPLEJO, pero no hay aporte para esta unidad, no muestra (la unidad no tiene asignación)
                    if (cal.tipo === "COMPLEJO" && !aporte) return null;

                    const funcionarios = funcionariosPorCalendario[cal.id] || [];

                    // Lógica del estado y cuota según tipo
                    let estado, cupoRequerido;
                    if (cal.tipo === "COMPLEJO") {
                        estado = funcionarios.length >= (aporte?.cantidadFuncionarios || 0) ? "Completado" : "Pendiente";
                        cupoRequerido = aporte?.cantidadFuncionarios;
                    } else {
                        // UNIDAD: cupo libre, siempre pendiente si no hay ninguno, completado si hay al menos uno (o como quieras definirlo)
                        estado = funcionarios.length > 0 ? "Completado" : "Pendiente";
                        cupoRequerido = "Sin límite";
                    }

                    const esComplejo = cal.tipo === "COMPLEJO";
                    let badgeColor, badgeText;

                    if (esComplejo) {
                        // Estado normal para complejos (hay cuota)
                        /*estado = funcionarios.length >= cupoRequerido ? "Completado" : "Pendiente";*/
                        estado = cal.estado
                        badgeColor = cal.estado === "CERRADO" ? "danger" : "success";
                        badgeText = estado;
                    } else {
                        // Para unidad: siempre gestión libre, sin cuota
                        estado = "Gestión libre";
                        badgeColor = "secondary";
                        badgeText = "Sin límite";
                    }


                    return (
                        <tr key={cal.id}>
                            <td>{cal.nombre}</td>
                            <td>{cal.mes}/{cal.anio}</td>
                            <td>{cal.tipo}</td>
                            <td>{esComplejo ? cal.nombreComplejo : cal.nombreUnidad}</td>
                            <td>{esComplejo ? cupoRequerido : "—"}</td>
                            <td>{funcionarios.length}</td>
                            <td>
                                <span className={`badge bg-${badgeColor}`}>
                                    {badgeText}
                                </span>
                            </td>
                            <td>
                                <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                                    <Button
                                        variant={esComplejo && estado === "Completado" ? "outline-secondary" : "primary"}
                                        onClick={() => {
                                            setCalendarioSeleccionado({ ...cal, aporte });
                                            setShowIngreso(true);
                                        }}
                                        disabled={!puedeAportar || (esComplejo && cal.estado === "CERRADO")}
                                    >
                                        {esComplejo && cal.estado === "CERRADO" ? "Calendario cerrado" : "Ingresar funcionarios"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setCalendarioView({ ...cal, aporte });
                                            setShowDiasNoDisponibles(true);
                                        }}
                                    >
                                        Registrar Actividad / Citación
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => {
                                            setCalendarioParaVer({ ...cal, aporte });
                                            setShowLista(true);
                                        }}
                                    >
                                        Ver funcionarios
                                    </Button>
                                </div>
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
                    onGuardado={() => {
                        setShowIngreso(false);
                        cargarDatos(); // Recargar datos después de guardar
                    }}
                />
            )}
            {/* Modal para ingresar dias no disponibles citacion / actividad */}
            {showDiasNoDisponibles && calendarioView && (
                <IngresoFuncionarioConDiasNoDisponibles
                    show={showDiasNoDisponibles}
                    onHide={() => setShowDiasNoDisponibles(false)}
                    calendario={calendarioView}
                    onGuardado={() => {
                        setShowDiasNoDisponibles(false);
                        cargarDatos(); // Recargar datos después de guardar
                    }}
                />
            )}
            {showLista && calendarioParaVer && (
                <ListaFuncionariosAportados
                    show={showLista}
                    onHide={() => {
                        setShowLista(false);
                        cargarDatos(); // Recargar datos al cerrar
                    }}
                    calendarioId={calendarioParaVer.id}
                    idUnidad={user.idUnidad}
                />
            )}
        </div>
    );
}