import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Users, Truck, Package, Hammer, Calendar, MapPin, UserCheck, AlertTriangle } from 'lucide-react';

const EventReport = () => {
    const { id } = useParams();
    const [evento, setEvento] = useState(null);
    const [despliegues, setDespliegues] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Event
                const resEvento = await axios.get(`/api/eventos/${id}`);
                setEvento(resEvento.data);

                // Fetch All Deployments for this Event
                const resDespliegues = await axios.get(`/api/eventos/${id}/despliegues`);
                setDespliegues(resDespliegues.data);
                
                const desplieguesIds = resDespliegues.data.map(d => d.id);

                // Fetch All Assignments for these Deployments
                let aggregatedAssignments = [];
                for (let depId of desplieguesIds) {
                    const resAsig = await axios.get(`/api/asignaciones/despliegue/${depId}`);
                    // Tag assignments with their deployment ID for grouping if needed
                    const tagged = resAsig.data.map(a => ({...a, despliegueId: depId}));
                    aggregatedAssignments = [...aggregatedAssignments, ...tagged];
                }
                setAsignaciones(aggregatedAssignments);
                setLoading(false);
            } catch (error) {
                console.error("Error loading report", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-10 text-center font-mono">Generando reporte operativo...</div>;
    if (!evento) return <div className="p-10 text-center text-red-500 font-bold">Evento no encontrado en registros.</div>;

    // Process Data
    const vehiculos = asignaciones.filter(a => a.vehiculo).map(a => a.vehiculo);
    
    // Personnel processing
    let allFuncionarios = [];
    asignaciones.forEach(a => {
        if (a.funcionarios) {
            allFuncionarios = [...allFuncionarios, ...a.funcionarios];
        }
    });
    // Unique officials
    const uniqueFuncionarios = Array.from(new Map(allFuncionarios.map(f => [f.id, f])).values());
    
    // Stats
    const totalDespliegues = despliegues.length;
    const totalFuncionarios = uniqueFuncionarios.length;
    const totalVehiculos = vehiculos.length;

    return (
        <div className="bg-gray-100 min-h-screen text-gray-900 font-sans print:bg-white">
            {/* Header / No Print */}
            <div className="bg-white shadow p-4 mb-6 print:hidden flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
                    <ArrowLeft size={18} /> Volver al Tablero
                </Link>
                <div className="flex gap-4">
                     <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-sm"
                    >
                        <Printer size={18} /> Imprimir Informe Oficial
                    </button>
                </div>
            </div>

            {/* Document Container */}
            <div className="max-w-[210mm] mx-auto bg-white p-[15mm] shadow-xl print:shadow-none print:p-0 print:max-w-none">
                
                {/* Official Header */}
                <div className="border-b-4 border-black pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight text-black">Informe de Situación</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">SGE-CHILE / SISTEMA DE GESTIÓN DE EMERGENCIAS</p>
                    </div>
                    <div className="text-right">
                         <div className="text-3xl font-mono font-bold text-gray-300">#{evento.id.toString().padStart(6, '0')}</div>
                         <div className="text-xs text-gray-500 font-bold">FECHA EMISIÓN: {new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Event Summary */}
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8">
                     <div className="grid grid-cols-2 gap-8">
                         <div>
                             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Evento Principal</h2>
                             <div className="text-2xl font-bold text-gray-900">{evento.descripcion}</div>
                             <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${evento.tipo === 'Incendio' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                    {evento.tipo}
                                </span>
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin size={14}/> {evento.region}
                                </span>
                             </div>
                         </div>
                         <div className="flex items-end justify-end gap-6 text-right">
                             <div>
                                 <div className="text-3xl font-black text-blue-600">{totalDespliegues}</div>
                                 <div className="text-xs font-bold text-gray-400 uppercase">Zonas Activas</div>
                             </div>
                             <div>
                                 <div className="text-3xl font-black text-gray-800">{totalFuncionarios}</div>
                                 <div className="text-xs font-bold text-gray-400 uppercase">Personal Total</div>
                             </div>
                             <div>
                                 <div className="text-3xl font-black text-gray-800">{totalVehiculos}</div>
                                 <div className="text-xs font-bold text-gray-400 uppercase">Móviles</div>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Deployments Detail */}
                <div className="mb-8">
                    <h3 className="text-lg font-black uppercase border-b-2 border-gray-200 pb-2 mb-6 flex items-center gap-2">
                        <MapPin size={20} /> Despliegue Operativo
                    </h3>
                    
                    <div className="space-y-6">
                        {despliegues.map((d, index) => {
                             // Filter assignments for this specific deployment
                             const depAssignments = asignaciones.filter(a => a.despliegueId === d.id);
                             const depVehiculos = depAssignments.filter(a => a.vehiculo).map(a => a.vehiculo);
                             const depFuncionarios = depAssignments.flatMap(a => a.funcionarios || []);
                             
                             return (
                                <div key={d.id} className="break-inside-avoid border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-black text-white text-xs px-2 py-0.5 rounded font-bold">ZONA {index + 1}</span>
                                                <h4 className="font-bold text-lg">{d.descripcion}</h4>
                                            </div>
                                            {d.encargado && (
                                                <div className="text-sm text-gray-700 flex items-center gap-1">
                                                    <UserCheck size={14} className="text-blue-600"/> 
                                                    <strong>Mando:</strong> {d.encargado}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right text-xs">
                                            <div className="font-bold text-gray-500">PERIODO OPERACIONAL</div>
                                            <div>{d.fechaInicio ? new Date(d.fechaInicio).toLocaleString() : 'N/A'}</div>
                                            <div className="text-gray-400">hasta</div>
                                            <div>{d.fechaTermino ? new Date(d.fechaTermino).toLocaleString() : 'Indefinido'}</div>
                                        </div>
                                    </div>

                                    {d.instrucciones && (
                                        <div className="p-4 bg-yellow-50 text-sm border-b border-yellow-100 text-yellow-900 flex items-start gap-2">
                                            <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                                            <div>
                                                <strong>Instrucciones:</strong> {d.instrucciones}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 grid grid-cols-2 gap-6">
                                        {/* Left: Vehicles & Resources */}
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Recursos Asignados</h5>
                                            {depVehiculos.length > 0 ? (
                                                <ul className="text-sm space-y-1">
                                                    {depVehiculos.map(v => (
                                                        <li key={v.sigla} className="flex justify-between border-b border-gray-100 last:border-0 pb-1">
                                                            <span className="font-mono font-bold text-gray-700">{v.sigla}</span>
                                                            <span className="text-gray-500">{v.tipo}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <span className="text-xs text-gray-400 italic">Sin vehículos asignados</span>}
                                        </div>

                                        {/* Right: Personnel Summary */}
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Dotación ({depFuncionarios.length})</h5>
                                            {depFuncionarios.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.from(new Set(depFuncionarios.map(f => `${f.grado.charAt(0)}.${f.apellido}`))).map((name, i) => (
                                                        <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                                                            {name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-xs text-gray-400 italic">Sin personal asignado</span>}
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t-2 border-gray-200 flex justify-between text-xs text-gray-400">
                    <div>SGE-CHILE // DOCUMENTO OFICIAL</div>
                    <div>PÁGINA 1 DE 1</div>
                </div>

            </div>
        </div>
    );
};

export default EventReport;
