import React, { useEffect, useState } from "react";
import { listarCalendarios } from "../../api/calendarApi";
import { listarFuncionariosAportados } from "../../api/funcionariosAporteApi";
import { useAuth } from "../../components/contexts/AuthContext.jsx";
import IngresoFuncionariosAporte from "./IngresoFuncionariosAporte";
import ListaFuncionariosAportados from "./ListaFuncionariosAportados";
import IngresoFuncionarioConDiasNoDisponibles from "./IngresoFuncionarioConDiasNoDisponibles.jsx";
import { Calendar, Users, Briefcase, ChevronRight, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function MisCalendariosParaAportar() {
    const { user } = useAuth();
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarioSeleccionado, setCalendarioSeleccionado] = useState(null);
    const [aportesPorCalendario, setAportesPorCalendario] = useState({});
    const [funcionariosPorCalendario, setFuncionariosPorCalendario] = useState({});
    
    // Modals
    const [showIngreso, setShowIngreso] = useState(false);
    const [showLista, setShowLista] = useState(false);
    const [showDiasNoDisponibles, setShowDiasNoDisponibles] = useState(false);
    const [calendarioParaVer, setCalendarioParaVer] = useState(null);
    const [calendarioView, setCalendarioView] = useState(null);


    const cargarDatos = async () => {
        setLoading(true);
        listarCalendarios().then(async (todos) => {
            const mios = todos.filter(c => {
                if (c.tipo === "UNIDAD") return c.idUnidad === user.idUnidad;
                if (c.tipo === "COMPLEJO") return (c.aporteUnidadTurnos || []).some(a => a.idUnidad === user.idUnidad);
                if (c.tipo === "RONDA") return (user.roles).some(r => r === "ROLE_TURNOS_RONDA");
                return false;
            });

            const aportesData = {};
            const funcionariosData = {};
            
            await Promise.all(mios.map(async (cal) => {
                let miAporte = null;
                if (cal.tipo === "COMPLEJO") miAporte = (cal.aporteUnidadTurnos || []).find(a => a.idUnidad === user.idUnidad) || null;
                if (cal.tipo === "UNIDAD") miAporte = { idUnidad: user.idUnidad, cantidadFuncionarios: null };
                
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

    useEffect(() => { cargarDatos(); }, [user.idUnidad]);

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-gray-100"></div>
                <div className="h-12 w-12 rounded-full border-4 border-pdi-base border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                     <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Aportes</h2>
                    <p className="text-gray-500 mt-2 text-lg">Administra el personal designado para los servicios del mes.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {calendarios.map(cal => {
                    const puedeAportar = user.roles.some(r => ['ROLE_JEFE','ROLE_SUBJEFE','ROLE_TURNOS','ROLE_TURNOS_RONDA'].includes(r));
                    if(cal.tipo === "COMPLEJO" && !puedeAportar) return null;
                    
                    const aporte = aportesPorCalendario[cal.id];
                    if (cal.tipo === "COMPLEJO" && !aporte) return null;

                    const funcionarios = funcionariosPorCalendario[cal.id] || [];
                    const esComplejo = cal.tipo === "COMPLEJO";
                    const cupoRequerido = esComplejo ? (aporte?.cantidadFuncionarios || 0) : 0;
                    const porcentaje = cupoRequerido > 0 ? Math.min(100, Math.round((funcionarios.length / cupoRequerido) * 100)) : 0;
                    
                    let estado = "En curso";
                    if (esComplejo && cal.estado === "CERRADO") estado = "Cerrado";
                    else if (esComplejo && funcionarios.length >= cupoRequerido) estado = "Completado";
                    else if (!esComplejo && funcionarios.length === 0) estado = "Pendiente";

                    return (
                        <div key={cal.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 overflow-hidden flex flex-col">
                            {/* Header Card */}
                            <div className="p-6 pb-4 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex items-start justify-between mb-4">
                                     <span className={clsx(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                        estado === "Completado" ? "bg-emerald-100 text-emerald-700" :
                                        estado === "Cerrado" ? "bg-rose-100 text-rose-700" :
                                        "bg-blue-100 text-pdi-base"
                                     )}>
                                        {estado}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{cal.tipo}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-pdi-base transition-colors">
                                    {cal.nombreCalendario || cal.nombre}
                                </h3>
                                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                     <Calendar className="w-4 h-4 text-gray-400" />
                                     {cal.mes} / {cal.anio}
                                </div>
                            </div>

                             {/* Body Card */}
                            <div className="p-6 flex-1 flex flex-col justify-end">
                                {esComplejo ? (
                                    <div className="mb-6">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-semibold text-gray-500">Progreso de Cuota</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {funcionarios.length}<span className="text-gray-400 text-lg">/{cupoRequerido}</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={clsx("h-full rounded-full transition-all duration-500 ease-out", 
                                                    porcentaje >= 100 ? "bg-emerald-500" : "bg-pdi-base"
                                                )} 
                                                style={{ width: `${porcentaje}%` }} 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6 flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-50">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{funcionarios.length}</div>
                                            <div className="text-xs text-blue-600 font-medium">Funcionarios Asignados</div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <button 
                                        onClick={() => {
                                            if (esComplejo && cal.estado === "CERRADO") return;
                                            setCalendarioSeleccionado({ ...cal, aporte });
                                            setShowIngreso(true);
                                        }}
                                        disabled={!puedeAportar || (esComplejo && cal.estado === "CERRADO")}
                                        className="col-span-2 py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        Ingresar Personal
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                             setCalendarioView({ ...cal, aporte });
                                             setShowDiasNoDisponibles(true);
                                        }}
                                        className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Novedades
                                    </button>
                                    <button 
                                        onClick={() => {
                                             setCalendarioParaVer({ ...cal, aporte });
                                             setShowLista(true);
                                        }}
                                        className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Ver Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {calendarios.length === 0 && (
                <div className="text-center py-24">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Estás al día</h3>
                    <p className="text-gray-500 mt-2">No tienes calendarios pendientes de gestión por el momento.</p>
                </div>
            )}

            {/* Modales (se mantienen igual lógica) */}
            {showIngreso && <IngresoFuncionariosAporte show={showIngreso} onHide={() => setShowIngreso(false)} calendario={calendarioSeleccionado} aporte={calendarioSeleccionado.aporte} onGuardado={() => { setShowIngreso(false); cargarDatos(); }} />}
            {showDiasNoDisponibles && <IngresoFuncionarioConDiasNoDisponibles show={showDiasNoDisponibles} onHide={() => setShowDiasNoDisponibles(false)} calendario={calendarioView} onGuardado={() => { setShowDiasNoDisponibles(false); cargarDatos(); }} />}
            {showLista && <ListaFuncionariosAportados show={showLista} onHide={() => { setShowLista(false); cargarDatos(); }} calendarioId={calendarioParaVer.id} idUnidad={user.idUnidad} />}
        </div>
    );
}