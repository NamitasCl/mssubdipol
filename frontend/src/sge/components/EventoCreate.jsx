import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';
import axios from 'axios';

const EventoCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    descripcion: '',
    tipo: 'Incendio',
    region: 'Metropolitana',
    latitud: null,
    longitud: null,
    radio: 1000,
    // Send local time formatted for LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    fecha: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19)
  });

  const regionsList = [
      "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", 
      "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
  ];
  
  // Regional Requirements State
  const [regionalReqs, setRegionalReqs] = useState(
      regionsList.reduce((acc, region) => ({
          ...acc,
          [region]: { active: false, funcionarios: 0, vehiculos: 0 }
      }), {})
  );

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
  
  const handleReqChange = (region, field, value) => {
      setRegionalReqs(prev => ({
          ...prev,
          [region]: {
              ...prev[region],
              [field]: value
          }
      }));
  };

  const toggleRegion = (region) => {
      setRegionalReqs(prev => ({
          ...prev,
          [region]: {
              ...prev[region],
              active: !prev[region].active
          }
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create Event
      const resEvento = await axios.post('/api/eventos', formData);
      const eventoId = resEvento.data.id;
      
      // 2. Create Regional Requirements
      const reqsToSave = Object.entries(regionalReqs)
          .filter(([_, data]) => data.active && (data.funcionarios > 0 || data.vehiculos > 0))
          .map(([region, data]) => ({
              evento: { id: eventoId },
              region: region,
              cantidadFuncionarios: parseInt(data.funcionarios),
              cantidadVehiculos: parseInt(data.vehiculos)
          }));
          
      if (reqsToSave.length > 0) {
          await axios.post('/api/requerimientos-regionales/batch', reqsToSave);
      }

      alert('Evento y requerimientos creados exitosamente');
      navigate('/sge/eventos'); 
    } catch (error) {
      console.error("Error creating event", error);
      // Show detailed error from backend if available
      const backendError = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
      alert(`Error al crear el evento:\n${backendError}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Evento (Catástrofe)</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info Section */}
        <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-700">1. Información General</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input 
                type="text" 
                name="descripcion" 
                value={formData.descripcion} 
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                <select 
                  name="tipo" 
                  value={formData.tipo} 
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  <option>Incendio</option>
                  <option>Terremoto</option>
                  <option>Inundación</option>
                  <option>Accidente Vehicular</option>
                  <option>Otro</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Región Afectada</label>
                <select 
                  name="region" 
                  value={formData.region} 
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación y Área de Afectación</label>
                <div className="h-64 bg-gray-100 rounded border mb-4">
                    <MapPicker onLocationSelect={handleLocationSelect} radius={formData.radio} />
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                    <label className="text-sm font-medium text-gray-700 w-32">Radio (Metros):</label>
                    <input 
                        type="range" 
                        name="radio" 
                        min="0" 
                        max="5000" 
                        step="100" 
                        value={formData.radio || 0} 
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-bold w-16 text-right">{formData.radio || 0} m</span>
                </div>

                {formData.latitud && (
                    <p className="text-sm text-gray-500 mt-1">Lat: {formData.latitud.toFixed(4)}, Lon: {formData.longitud.toFixed(4)}</p>
                )}
            </div>
        </div>
        
        {/* Regional Distribution Section */}
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Distribución de Requerimientos por Región</h3>
            <p className="text-sm text-gray-500 mb-4">Seleccione las regiones a las que solicitará apoyo y defina cantidades.</p>
            
            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Región</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitar Apoyo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionarios</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículos</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {regionsList.map(region => (
                            <tr key={region} className={regionalReqs[region].active ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="checkbox" 
                                        checked={regionalReqs[region].active} 
                                        onChange={() => toggleRegion(region)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="number" 
                                        min="0"
                                        disabled={!regionalReqs[region].active}
                                        value={regionalReqs[region].funcionarios}
                                        onChange={(e) => handleReqChange(region, 'funcionarios', e.target.value)}
                                        className="w-24 p-1 border rounded disabled:bg-gray-100 disabled:text-gray-400"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input 
                                        type="number" 
                                        min="0"
                                        disabled={!regionalReqs[region].active}
                                        value={regionalReqs[region].vehiculos}
                                        onChange={(e) => handleReqChange(region, 'vehiculos', e.target.value)}
                                        className="w-24 p-1 border rounded disabled:bg-gray-100 disabled:text-gray-400"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition font-bold shadow-lg"
        >
          Crear Evento y Enviar Solicitudes
        </button>
      </form>
    </div>
  );
};

export default EventoCreate;
