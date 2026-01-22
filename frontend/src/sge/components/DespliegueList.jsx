import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, MapPin, FileText, Truck, Calendar, Activity, ExternalLink } from 'lucide-react';

const DespliegueList = () => {
    const [despliegues, setDespliegues] = useState([]);
    
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/despliegues');
            setDespliegues(res.data);
        } catch (error) {
            console.error("Error loading data", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este despliegue?")) return;
        try {
            await axios.delete(`/api/despliegues/${id}`);
            fetchData();
        } catch (error) { console.error(error); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monitor de Despliegues</h1>
                    <p className="text-gray-500 mt-1">Visión global de operaciones y recursos desplegados</p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Activity size={20} className="text-primary-600"/> 
                        Despliegues Activos
                    </h2>
                    <div className="text-sm text-gray-500 italic hidden md:block">
                        * Nuevas solicitudes se gestionan vía Eventos
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-3 border-b border-gray-100">ID / Fecha</th>
                                <th className="px-6 py-3 border-b border-gray-100">Evento Asociado</th>
                                <th className="px-6 py-3 border-b border-gray-100">Misión y Zona</th>
                                <th className="px-6 py-3 border-b border-gray-100">Requerimientos</th>
                                <th className="px-6 py-3 border-b border-gray-100 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {despliegues.map(d => (
                                <tr key={d.id} className="hover:bg-blue-50/50 transition-colors group text-sm">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-xs font-bold text-gray-400">#{d.id}</div>
                                        <div className="text-gray-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12}/>
                                            {d.fechaSolicitud ? new Date(d.fechaSolicitud).toLocaleDateString() : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {d.evento ? (
                                            <Link to={`/eventos/${d.evento.id}`} className="font-semibold text-primary-700 hover:text-primary-900 hover:underline flex items-center gap-1">
                                                {d.evento.descripcion}
                                                <ExternalLink size={10} />
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Sin Evento</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{d.descripcion}</div>
                                        {/* Placeholder for zone if available in backend, otherwise just description is fine */}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100" title="Funcionarios">
                                                <Activity size={12}/> {d.cantidadFuncionariosRequeridos} Pers.
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100" title="Vehículos">
                                                <Truck size={12}/> {d.cantidadVehiculosRequeridos} Veh.
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/despliegues/${d.id}`} 
                                                className="text-primary-600 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-50 transition-colors" 
                                                title="Ver Detalle">
                                                <FileText size={18}/>
                                            </Link>
                                            <Link to={`/despliegues/${d.id}/asignar`} 
                                                className="text-secondary-600 hover:text-secondary-800 p-2 rounded-lg hover:bg-secondary-50 transition-colors" 
                                                title="Asignar Recursos">
                                                <Truck size={18}/>
                                            </Link>
                                            <button onClick={() => handleDelete(d.id)} 
                                                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" 
                                                title="Eliminar">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {despliegues.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 bg-gray-50/50">
                                        <div className="flex flex-col items-center gap-2">
                                            <Activity size={48} className="text-gray-200"/>
                                            <p>No hay despliegues activos.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DespliegueList;
