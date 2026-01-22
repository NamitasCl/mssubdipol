import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';
import axios from 'axios';
import { MapPin, Shield, Type, User, Clipboard, Calendar, Truck, Users, Save, X } from 'lucide-react';

const DespliegueCreate = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    encargado: '',
    instrucciones: '',
    latitud: null,
    longitud: null,
    cantidadFuncionariosRequeridos: 0,
    cantidadVehiculosRequeridos: 0,
    fechaSolicitud: new Date().toISOString(),
    fechaInicio: '',
    fechaTermino: ''
  });

  useEffect(() => {
    // Fetch event to center map and show context
    axios.get(`/api/eventos/${eventId}`).then(res => {
        setEvento(res.data);
        // Default location to event location
        setFormData(prev => ({
            ...prev,
            latitud: res.data.latitud,
            longitud: res.data.longitud
        }));
    });
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (latlng) => {
    setFormData({
      ...formData,
      latitud: latlng.lat,
      longitud: latlng.lng
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        evento: { id: eventId } // Link to event
      };
      await axios.post(`/api/eventos/${eventId}/despliegues`, payload);
      navigate(`/sge/eventos/${eventId}`);
    } catch (error) {
      console.error("Error creating deployment request", error);
    }
  };

  if (!evento) return <div className="p-8 text-center text-gray-500">Iniciando protocolo de despliegue...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-l-4 border-blue-600 p-6 rounded-lg shadow-sm flex justify-between items-center">
             <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs mb-1">
                    <Shield size={14} /> Protocolo de Despliegue Operativo
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Nueva Operación de Despliegue</h1>
                <p className="text-gray-500">Definición de parámetros para el evento: <strong>{evento.descripcion}</strong></p>
             </div>
             <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
             </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Form Data */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* General Information Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <Type size={18} className="text-blue-500"/> Información General
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Misión / Zona Operativa</label>
                            <input 
                                type="text" 
                                name="descripcion" 
                                value={formData.descripcion} 
                                onChange={handleChange}
                                placeholder="Ej: Zona Alpha - Control de perímetro norte"
                                className="w-full p-2.5 rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Comandante a Cargo (Encargado)</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="encargado" 
                                        value={formData.encargado} 
                                        onChange={handleChange}
                                        placeholder="Grado y Apellido"
                                        className="w-full pl-10 p-2.5 rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridad (Visual)</label>
                                <select className="w-full p-2.5 rounded-lg border-gray-300 border bg-gray-50 text-gray-600 cursor-not-allowed" disabled>
                                    <option>Alta - Respuesta Inmediata</option>
                                </select>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Instrucciones Especiales</label>
                            <div className="relative">
                                <Clipboard size={18} className="absolute left-3 top-3 text-gray-400" />
                                <textarea 
                                    name="instrucciones"
                                    value={formData.instrucciones}
                                    onChange={handleChange}
                                    placeholder="Detalles específicos, riesgos, protocolos de comunicación..."
                                    rows="3"
                                    className="w-full pl-10 p-2.5 rounded-lg border-gray-300 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logistics & Time Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <Calendar size={18} className="text-orange-500"/> Logística y Vigencia
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Recursos Solicitados</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                            <span className="flex items-center gap-2"><Users size={14}/> Funcionarios</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            name="cantidadFuncionariosRequeridos" 
                                            value={formData.cantidadFuncionariosRequeridos} 
                                            onChange={handleChange}
                                            className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                            <span className="flex items-center gap-2"><Truck size={14}/> Vehículos</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            name="cantidadVehiculosRequeridos" 
                                            value={formData.cantidadVehiculosRequeridos} 
                                            onChange={handleChange}
                                            className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <label className="block text-xs font-bold text-orange-800 uppercase mb-2">Ventana Operativa</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Inicio de Operaciones</label>
                                        <input 
                                            type="datetime-local" 
                                            name="fechaInicio" 
                                            value={formData.fechaInicio} 
                                            onChange={handleChange}
                                            className="w-full p-2 rounded border border-orange-200 bg-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Término Estimado</label>
                                        <input 
                                            type="datetime-local" 
                                            name="fechaTermino" 
                                            value={formData.fechaTermino} 
                                            onChange={handleChange}
                                            className="w-full p-2 rounded border border-orange-200 bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block">
                     <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1 font-bold text-lg flex justify-center items-center gap-2"
                    >
                        <Save size={24} />
                        Confirmar y Crear Despliegue
                    </button>
                </div>
            </div>

            {/* Right Column: Map */}
            <div className="lg:col-span-1">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                     <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-red-500"/>
                        Georeferenciación del Despliegue
                     </h3>
                     <div className="text-xs text-gray-500 mb-2">
                        Marque en el mapa la ubicación central del puesto de mando o zona de despliegue.
                     </div>
                     <MapPicker 
                        onLocationSelect={handleLocationSelect} 
                        initialLat={evento.latitud} 
                        initialLng={evento.longitud} 
                    />
                    <div className="mt-4 p-3 bg-gray-50 rounded border text-xs text-gray-600 space-y-1">
                        <p><strong>Latitud:</strong> {formData.latitud?.toFixed(6) || 'No definida'}</p>
                        <p><strong>Longitud:</strong> {formData.longitud?.toFixed(6) || 'No definida'}</p>
                    </div>

                    <div className="lg:hidden mt-6">
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 font-bold"
                        >
                            Confirmar Despliegue
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
  );
};

export default DespliegueCreate;
