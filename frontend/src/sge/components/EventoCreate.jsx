import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';
import sgeApi from '../../api/sgeApi';

const EventoCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    descripcion: '',
    tipo: 'Incendio',
    regiones: [],
    latitud: null,
    longitud: null,
    radio: 1000,
    // NEW: GeoJSON for flexible geometry
    zonaAfectada: null,
    estado: 'ACTIVO',
    // Send local time formatted for LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    fecha: new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19)
  });

  const regionsList = [
    "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso",
    "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
  ];



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (geometryData) => {
    let geoJson;
    let lat = null;
    let lon = null;

    if (geometryData.type === 'Point') {
      lat = geometryData.lat;
      lon = geometryData.lng;
      geoJson = JSON.stringify({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat]
        },
        properties: {
          radius: formData.radio
        }
      });
    } else if (geometryData.type === 'Polygon') {
      const coords = geometryData.coordinates;
      // Set lat/lon to first point for legacy support
      if (coords && coords.length > 0 && coords[0].length > 0) {
        lon = coords[0][0][0];
        lat = coords[0][0][1];
      }

      geoJson = JSON.stringify({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: coords
        },
        properties: {}
      });
    }

    setFormData({
      ...formData,
      latitud: lat,
      longitud: lon,
      zonaAfectada: geoJson
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resEvento = await sgeApi.post('/eventos', formData);
      const eventoId = resEvento.data.id;

      alert('Evento creado exitosamente. Ahora puede proceder a crear despliegues.');
      navigate(`/sge/eventos/${eventoId}`);
    } catch (error) {
      console.error("Error creating event", error);
      const backendError = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
      alert(`Error al crear el evento:\n${backendError}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Crear Nuevo Evento (Catástrofe)</h2>
        <p className="text-gray-600 mt-2">Defina los detalles del evento, visualice el área afectada en el mapa y solicite recursos a las regiones.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-1 space-y-6">

            {/* 1. General Info Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Información General
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Evento</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Incendio Forestal Reserva Peñuelas"
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Emergencia</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option>Incendio</option>
                    <option>Terremoto</option>
                    <option>Inundación</option>
                    <option>Accidente Vehicular</option>
                    <option>Orden Público</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regiones Afectadas</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                    {regionsList.map(r => (
                      <label key={r} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-white p-1 rounded transition">
                        <input
                          type="checkbox"
                          checked={formData.regiones.includes(r)}
                          onChange={() => {
                            const current = formData.regiones;
                            const newRegiones = current.includes(r)
                              ? current.filter(item => item !== r)
                              : [...current, r];

                            setFormData({
                              ...formData,
                              regiones: newRegiones
                            });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Seleccione una o más regiones afectadas.</p>
                </div>
              </div>
            </div>

            {/* 2. Radius Control Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Zona de Impacto
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                Utilice el mapa interactivo para marcar el punto cero o dibujar un polígono del área afectada.
              </p>

              <div className="space-y-3">
                <label className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Radio de Afectación (Si usa punto)</span>
                  <span className="bg-gray-100 px-2 rounded text-gray-600">{formData.radio || 0} m</span>
                </label>
                <input
                  type="range"
                  name="radio"
                  min="0"
                  max="10000"
                  step="100"
                  value={formData.radio || 0}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0m</span>
                  <span>10km</span>
                </div>
              </div>

              {formData.latitud && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-100 text-xs text-green-800">
                  <strong>Ubicación Fijada:</strong> <br />
                  Lat: {formData.latitud.toFixed(5)}, Lon: {formData.longitud.toFixed(5)}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Map */}
          <div className="lg:col-span-2">
            <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-200 h-full min-h-[500px] flex flex-col">
              <div className="flex-1 rounded-lg overflow-hidden relative">
                <MapPicker onLocationSelect={handleLocationSelect} radius={formData.radio} />
              </div>
              <div className="mt-2 text-xs text-center text-gray-400">
                Haga clic en el icono ⬠ (arriba derecha del mapa) para dibujar polígonos irregulares.
              </div>
            </div>
          </div>
        </div>



        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200 flex items-center gap-2 text-lg transform hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Crear Evento
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventoCreate;
