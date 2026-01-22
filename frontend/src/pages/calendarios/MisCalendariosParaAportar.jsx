import React, { useEffect, useState } from "react";
import { listarCalendarios } from "../../api/calendarApi";
import { listarFuncionariosAportados } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import IngresoFuncionariosAporte from "./IngresoFuncionariosAporte";
import ListaFuncionariosAportados from "./ListaFuncionariosAportados";
import IngresoFuncionarioConDiasNoDisponibles from "./IngresoFuncionarioConDiasNoDisponibles.jsx";
import { Calendar, Users, Briefcase, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';

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
            const mios = todos.filter(c => {
                if (c.tipo === "UNIDAD") {
                    return c.idUnidad === user.idUnidad;
                }
                if (c.tipo === "COMPLEJO") {
                    return (c.aporteUnidadTurnos || []).some(
                        a => a.idUnidad === user.idUnidad
                    );
                }
                if (c.tipo === "RONDA") {
                    return (user.roles).some(r => r === "ROLE_TURNOS_RONDA")
                }
                return false;
            });

            const aportesData = {};
            const funcionariosData = {};
            await Promise.all(mios.map(async (cal) => {
                let miAporte = null;
                if (cal.tipo === "COMPLEJO") {
                    miAporte = (cal.aporteUnidadTurnos || []).find(a => a.idUnidad === user.idUnidad) || null;
                }
                if (cal.tipo === "UNIDAD") {
                    miAporte = {
                        idUnidad: user.idUnidad,
                        cantidadFuncionarios: null
                    };
                }
                aportesData[cal.id] = miAporte;
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

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pdi-base border-t-transparent"></div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-pdi-base mb-2">Gestión por Unidad</h2>
                <p className="text-gray-500">Administra los calendarios y aportes de funcionarios de tu unidad.</p>
            </div>

            <div className="grid gap-6">
                {calendarios.map(cal => {
                    const puedeAportar =
                        user.roles.includes('ROLE_JEFE') ||
                        user.roles.includes('ROLE_SUBJEFE') ||
                        user.roles.includes('ROLE_TURNOS') ||
                        user.roles.includes("ROLE_TURNOS_RONDA");

                    if(cal.tipo === "COMPLEJO" && !puedeAportar) return null;

                    const aporte = aportesPorCalendario[cal.id];
                    if (cal.tipo === "COMPLEJO" && !aporte) return null;

                    const funcionarios = funcionariosPorCalendario[cal.id] || [];
                    const esComplejo = cal.tipo === "COMPLEJO";
                    
                    let estado = "Pendiente";
                    let badgeClass = "bg-amber-100 text-amber-700";
                    let cupoRequerido = esComplejo ? aporte?.cantidadFuncionarios : "—";

                    if (esComplejo) {
                         if (cal.estado === "CERRADO") {
                             estado = "Cerrado";
                             badgeClass = "bg-rose-100 text-rose-700";
                         } else if (funcionarios.length >= (cupoRequerido || 0)) {
                             estado = "Completado";
                             badgeClass = "bg-emerald-100 text-emerald-700";
                         }
                    } else {
                        estado = funcionarios.length > 0 ? "En curso" : "Sin iniciar";
                        badgeClass = funcionarios.length > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";
                    }


                    return (
                        <div key={cal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                            <div className="p-6 md:flex md:items-center md:justify-between gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                                            {estado === "Completado" && <CheckCircle size={12} className="mr-1" />}
                                            {estado === "Cerrado" && <AlertCircle size={12} className="mr-1" />}
                                            {estado}
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{cal.tipo}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{cal.nombre}</h3>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>{cal.mes}/{cal.anio}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span>{esComplejo ? cal.nombreComplejo : cal.nombreUnidad}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={16} className="text-gray-400" />
                                            <span>Aportados: <strong className="text-gray-900">{funcionarios.length}</strong> {esComplejo ? `/ ${cupoRequerido}` : ""}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3 md:items-center md:justify-end">
                                    <button 
                                        onClick={() => {
                                            setCalendarioSeleccionado({ ...cal, aporte });
                                            setShowIngreso(true);
                                        }}
                                        disabled={!puedeAportar || (esComplejo && cal.estado === "CERRADO")}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-pdi-base hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {esComplejo && cal.estado === "CERRADO" ? "Cerrado" : "Ingresar"}
                                    </button>
                                     <button 
                                        onClick={() => {
                                            setCalendarioView({ ...cal, aporte });
                                            setShowDiasNoDisponibles(true);
                                        }}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Novedades
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCalendarioParaVer({ ...cal, aporte });
                                            setShowLista(true);
                                        }}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-amber-200 text-sm font-medium rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
                                    >
                                        Ver Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {calendarios.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay calendarios disponibles</h3>
                        <p className="text-gray-500">No se encontraron calendarios activos para tu unidad.</p>
                    </div>
                )}
            </div>

            {/* Modales */}
            {showIngreso && calendarioSeleccionado && (
                <IngresoFuncionariosAporte
                    show={showIngreso}
                    onHide={() => setShowIngreso(false)}
                    calendario={calendarioSeleccionado}
                    aporte={calendarioSeleccionado.aporte}
                    onGuardado={() => {
                        setShowIngreso(false);
                        cargarDatos();
                    }}
                />
            )}
            {showDiasNoDisponibles && calendarioView && (
                <IngresoFuncionarioConDiasNoDisponibles
                    show={showDiasNoDisponibles}
                    onHide={() => setShowDiasNoDisponibles(false)}
                    calendario={calendarioView}
                    onGuardado={() => {
                        setShowDiasNoDisponibles(false);
                        cargarDatos();
                    }}
                />
            )}
            {showLista && calendarioParaVer && (
                <ListaFuncionariosAportados
                    show={showLista}
                    onHide={() => {
                        setShowLista(false);
                        cargarDatos();
                    }}
                    calendarioId={calendarioParaVer.id}
                    idUnidad={user.idUnidad}
                />
            )}
        </div>
    );
}