import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import sgeApi from '../../api/sgeApi';
import { MapPin, Shield, Type, User, Clipboard, Calendar, Truck, Users, Save, X } from 'lucide-react';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}


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

    // Disponibilidad data from regions/jefaturas
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [solicitudes, setSolicitudes] = useState({}); // {regionOJefatura: {funcionarios: X, vehiculos: Y}}

    useEffect(() => {
        // Fetch event to center map and show context
        sgeApi.get(`/eventos/${eventId}`).then(res => {
            setEvento(res.data);
            setFormData(prev => ({
                ...prev,
                latitud: res.data.latitud,
                longitud: res.data.longitud
            }));
        });

        // Fetch disponibilidad reportada
        sgeApi.get('/disponibilidad/disponibles').then(res => {
            setDisponibilidad(res.data);
            // Initialize solicitudes state
            const initialSolicitudes = {};
            res.data.forEach(disp => {
                initialSolicitudes[disp.id] = { // Key by ID now
                    funcionarios: 0,
                    vehiculos: 0,
                    disponibilidadId: disp.id
                };
            });
            setSolicitudes(initialSolicitudes);
        }).catch(err => {
            console.error('Error fetching disponibilidad:', err);
        });
    }, [eventId]);

    const handleSolicitudChange = (id, field, value) => {
        const disponible = disponibilidad.find(d => d.id === id); // Find by ID
        if (!disponible) return;

        const numValue = parseInt(value) || 0;
        const maxValue = field === 'funcionarios' ? disponible.funcionariosDisponibles : disponible.vehiculosDisponibles;

        // Validate: cannot request more than available
        const finalValue = Math.min(numValue, maxValue);

        setSolicitudes(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: finalValue
            }
        }));
    };

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
            const formattedSolicitud = formData.fechaSolicitud.split('.')[0];
            const formatLocal = (val) => val && val.length === 16 ? `${val}:00` : val;

            // Calculate totals from solicitudes
            const totalFuncionarios = Object.values(solicitudes).reduce((acc, sol) => acc + (sol.funcionarios || 0), 0);
            const totalVehiculos = Object.values(solicitudes).reduce((acc, sol) => acc + (sol.vehiculos || 0), 0);

            const payload = {
                ...formData,
                fechaSolicitud: formattedSolicitud,
                fechaInicio: formatLocal(formData.fechaInicio),
                fechaTermino: formatLocal(formData.fechaTermino),
                evento: { id: eventId },
                cantidadFuncionariosRequeridos: totalFuncionarios,
                cantidadVehiculosRequeridos: totalVehiculos
            };

            const resDespliegue = await sgeApi.post(`/eventos/${eventId}/despliegues`, payload);
            const despliegueId = resDespliegue.data.id;

            // Create SolicitudRecurso for each unit with requested resources
            const solicitudesToSave = Object.entries(solicitudes)
                .filter(([_, sol]) => (sol.funcionarios > 0 || sol.vehiculos > 0))
                .map(([dispId, sol]) => {
                    const dispData = disponibilidad.find(d => d.id === parseInt(dispId)); // Lookup by ID
                    return {
                        despliegue: { id: despliegueId },
                        regionDestino: dispData ? dispData.regionOJefatura : 'Desconocida', // Still save region
                        unidadDestino: dispData ? dispData.unidad : null, // Save specific unit
                        funcionariosRequeridos: sol.funcionarios,
                        vehiculosRequeridos: sol.vehiculos,
                        estado: 'PENDIENTE'
                    };
                });

            if (solicitudesToSave.length > 0) {
                // Save all solicitudes
                await Promise.all(
                    solicitudesToSave.map(sol => sgeApi.post('/solicitudes', sol))
                );
            }

            navigate(`/sge/eventos/${eventId}`);
        } catch (error) {
            console.error("Error creating deployment request", error);
            alert('Error al crear el despliegue: ' + (error.response?.data?.message || error.message));
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
                            <Type size={18} className="text-blue-500" /> Información General
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
                            <Calendar size={18} className="text-orange-500" /> Logística y Vigencia
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                                <label className="block text-xs font-bold text-orange-800 uppercase mb-2">Ventana Operativa</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            {/* Regional Requirements Matrix */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Users size={16} className="text-green-600" /> Disponibilidad Reportada
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">Seleccione cuántos recursos solicitar basándose en su disponibilidad reportada.</p>

                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <div className="overflow-x-auto max-h-64">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gradient-to-r from-green-50 to-blue-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-700">Región / Jefatura</th>
                                                    <th className="px-4 py-3 text-center font-bold text-green-700">Disponible Func.</th>
                                                    <th className="px-4 py-3 text-center font-bold text-green-700">Disponible Veh.</th>
                                                    <th className="px-4 py-3 text-center font-bold text-blue-700">Solicitar Func.</th>
                                                    <th className="px-4 py-3 text-center font-bold text-blue-700">Solicitar Veh.</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {disponibilidad.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-8 text-center text-yellow-700 bg-yellow-50">
                                                            ⚠️ No hay disponibilidad reportada aún.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    Object.entries(disponibilidad.reduce((groups, item) => {
                                                        const group = item.regionOJefatura || 'Sin Clasificar';
                                                        groups[group] = groups[group] || [];
                                                        groups[group].push(item);
                                                        return groups;
                                                    }, {})).map(([jefatura, units]) => (
                                                        <React.Fragment key={jefatura}>
                                                            {/* Group Header */}
                                                            <tr className="bg-gray-50 border-y border-gray-200">
                                                                <td colSpan="5" className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-100/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield size={12} /> {jefatura}
                                                                        <span className="bg-gray-200 text-gray-600 px-1.5 rounded-full text-[10px]">{units.length} Unidades</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {/* Unit Rows */}
                                                            {units.map(disp => {
                                                                const solicitud = solicitudes[disp.id] || {};
                                                                return (
                                                                    <tr key={disp.id} className="hover:bg-blue-50 transition group">
                                                                        <td className="px-4 py-3 pl-8 border-l-4 border-transparent hover:border-blue-300">
                                                                            <div className="font-bold text-gray-800 text-sm">{disp.unidad}</div>
                                                                            {disp.observaciones && (
                                                                                <div className="text-[10px] text-gray-500 italic truncate max-w-[200px]" title={disp.observaciones}>
                                                                                    "{disp.observaciones}"
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <span className={`px-2 py-1 rounded-full font-bold text-xs ${disp.funcionariosDisponibles > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                                                                {disp.funcionariosDisponibles}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <span className={`px-2 py-1 rounded-full font-bold text-xs ${disp.vehiculosDisponibles > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                                                                {disp.vehiculosDisponibles}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max={disp.funcionariosDisponibles}
                                                                                value={solicitud.funcionarios || 0}
                                                                                onChange={(e) => handleSolicitudChange(disp.id, 'funcionarios', e.target.value)}
                                                                                className={`w-20 p-1.5 border rounded text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none
                                                                                    ${(solicitud.funcionarios || 0) > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400'}`}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max={disp.vehiculosDisponibles}
                                                                                value={solicitud.vehiculos || 0}
                                                                                onChange={(e) => handleSolicitudChange(disp.id, 'vehiculos', e.target.value)}
                                                                                className={`w-20 p-1.5 border rounded text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none
                                                                                    ${(solicitud.vehiculos || 0) > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400'}`}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
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
                            <MapPin size={16} className="text-red-500" />
                            Georeferenciación del Despliegue
                        </h3>
                        <div className="text-xs text-gray-500 mb-2">
                            🔴 Área roja = Evento original. Haga clic para colocar el marcador de despliegue.
                        </div>
                        <div className="h-[400px] w-full rounded-lg overflow-hidden border">
                            <MapContainer
                                center={[evento.latitud || -33.4489, evento.longitud || -70.6693]}
                                zoom={12}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Show evento zona afectada if available */}
                                {evento.zonaAfectada && (() => {
                                    try {
                                        const geoJson = JSON.parse(evento.zonaAfectada);
                                        return (
                                            <GeoJSON
                                                data={geoJson}
                                                style={{
                                                    color: '#ef4444',
                                                    weight: 2,
                                                    opacity: 0.6,
                                                    fillColor: '#fee2e2',
                                                    fillOpacity: 0.2
                                                }}
                                            />
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                })()}

                                {/* Deployment marker */}
                                {formData.latitud && formData.longitud && (
                                    <Marker position={[formData.latitud, formData.longitud]} />
                                )}

                                {/* Click handler */}
                                <MapClickHandler onLocationSelect={handleLocationSelect} />
                            </MapContainer>
                        </div>
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
