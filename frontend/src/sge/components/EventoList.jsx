import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Flame, AlertOctagon, Activity } from 'lucide-react'; 

const EventoList = () => {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Mock data if API fails or is empty for dev
    const fetchEventos = async () => {
      try {
        const response = await axios.get('/api/eventos');
        setEventos(response.data);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };
    fetchEventos();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-red-600 opacity-10 blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-sm font-semibold border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              Sistema de Gestión de Emergencias
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Centro de Mando Nacional
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Plataforma crítica para la declaración y gestión de catástrofes. 
              Toda operación de respuesta y despliegue de recursos comienza aquí.
            </p>
          </div>
          
          <Link 
            to="/sge/eventos/new" 
            className="group relative flex items-center gap-4 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-2xl transition-all hover:scale-105 hover:shadow-red-600/30 animate-heartbeat"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="bg-white/20 p-2 rounded-lg">
               <AlertOctagon size={28} className="text-white" />
            </div>
            <span>Reportar Catástrofe</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Activity size={20}/>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Operaciones en Curso</h2>
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Fecha</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Evento</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción / Misión</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {eventos.map((evento) => (
                    <tr key={evento.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-mono text-xs font-bold text-slate-400">#{evento.id}</div>
                            <div className="flex items-center gap-1 text-slate-600 font-medium mt-1">
                                <Calendar size={12}/> {new Date(evento.fecha).toLocaleDateString()}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`
                                inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${evento.tipo === 'Incendio' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                                  evento.tipo === 'Terremoto' ? 'bg-red-100 text-red-700 border border-red-200' :
                                  'bg-blue-100 text-blue-700 border border-blue-200'}
                            `}>
                                <Flame size={12} /> {evento.tipo}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-base">{evento.descripcion}</div>
                            <div className="text-xs text-slate-500 mt-1">Operación Nivel 1 - Respuesta Inmediata</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                                <MapPin size={16} className="text-slate-400" />
                                <span className="font-medium">{evento.region}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-700 text-xs font-bold border border-green-500/20 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                EN CURSO
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                             <Link to={`/sge/eventos/${evento.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Gestionar
                             </Link>
                        </td>
                    </tr>
                ))}
                {eventos.length === 0 && (
                    <tr>
                         <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic bg-slate-50/50">
                            No hay operaciones activas en este momento.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventoList;
