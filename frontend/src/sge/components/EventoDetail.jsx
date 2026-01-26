import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import sgeApi from '../../api/sgeApi';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Shield, Truck, Users, MapPin, Calendar, Flame, Info, Trash2 } from 'lucide-react';

const EventoDetail = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [despliegues, setDespliegues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, deployRes] = await Promise.all([
          sgeApi.get(`/eventos/${id}`),
          sgeApi.get(`/eventos/${id}/despliegues`)
        ]);
        setEvento(eventRes.data);
        setDespliegues(deployRes.data);
      } catch (error) {
        console.error("Error fetching details", error);
      }
    };
    fetchData();
  }, [id]);

  if (!evento) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  // Parse GeoJSON if available
  let geoJsonData = null;
  let mapCenter = [evento.latitud, evento.longitud];

  if (evento.zonaAfectada) {
    try {
      geoJsonData = JSON.parse(evento.zonaAfectada);
      // If it's a polygon, center on first coordinate
      if (geoJsonData.geometry?.type === 'Polygon' && geoJsonData.geometry.coordinates?.[0]?.[0]) {
        mapCenter = [geoJsonData.geometry.coordinates[0][0][1], geoJsonData.geometry.coordinates[0][0][0]];
      }
    } catch (e) {
      console.warn("Could not parse zonaAfectada:", e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase border border-white/30">
                  {evento.tipo}
                </span>
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  {evento.estado}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold mb-2">{evento.descripcion}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(evento.fecha).toLocaleString('es-CL')}</span>
                </div>
                {evento.regiones && evento.regiones.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{evento.regiones.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            <Link
              to={`/sge/eventos/${id}/despliegues/new`}
              className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-red-50 transition flex items-center gap-2 font-bold shadow-lg"
            >
              <Shield size={20} />
              Solicitar Despliegue
            </Link>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Info size={16} />
            <span className="font-semibold">Tipo de Emergencia</span>
          </div>
          <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            {evento.tipo}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Calendar size={16} />
            <span className="font-semibold">Fecha de Reporte</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {new Date(evento.fecha).toLocaleDateString('es-CL')}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(evento.fecha).toLocaleTimeString('es-CL')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertTriangle size={16} />
            <span className="font-semibold">Despliegues Activos</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {despliegues.length}
          </p>
          <p className="text-sm text-gray-500">
            {despliegues.length === 0 ? 'Sin despliegues' : `${despliegues.length} operación(es)`}
          </p>
        </div>
      </div>

      {/* Map View with GeoJSON support */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={20} className="text-red-500" />
          Zona Afectada y Despliegues
        </h3>
        <div className="h-[500px] w-full rounded-lg overflow-hidden border shadow-inner">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render GeoJSON zona afectada if available */}
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={{
                  color: '#ef4444',
                  weight: 3,
                  opacity: 0.8,
                  fillColor: '#fee2e2',
                  fillOpacity: 0.3
                }}
              >
                <Popup>
                  <strong>{evento.descripcion}</strong><br />
                  Zona Afectada - {evento.tipo}
                </Popup>
              </GeoJSON>
            )}

            {/* Fallback: Show marker if no GeoJSON */}
            {!geoJsonData && evento.latitud && evento.longitud && (
              <>
                <Marker position={[evento.latitud, evento.longitud]}>
                  <Popup>
                    <strong>{evento.descripcion}</strong><br />
                    {evento.tipo}
                  </Popup>
                </Marker>
                {evento.radio && (
                  <Circle
                    center={[evento.latitud, evento.longitud]}
                    radius={evento.radio}
                    pathOptions={{ color: '#ef4444', fillColor: '#fee2e2', fillOpacity: 0.3 }}
                  >
                    <Popup>Radio de afectación: {evento.radio}m</Popup>
                  </Circle>
                )}
              </>
            )}

            {/* Deployment Zones */}
            {despliegues.map(d => (
              d.latitud && d.longitud && (
                <Circle
                  key={d.id}
                  center={[d.latitud, d.longitud]}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
                  radius={500}
                >
                  <Popup>
                    <strong>{d.descripcion}</strong><br />
                    Req: {d.cantidadFuncionariosRequeridos} Func., {d.cantidadVehiculosRequeridos} Veh.
                  </Popup>
                </Circle>
              )
            ))}
          </MapContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Use la rueda del mouse para hacer zoom. Las zonas rojas muestran el área afectada, las azules son despliegues.
        </p>
      </div>

      {/* Deployments List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500" />
          Despliegues Solicitados
        </h3>
        <div className="grid gap-4">
          {despliegues.map((d) => (
            <div key={d.id} className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center hover:shadow-md transition">
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{d.descripcion}</h4>
                <div className="flex gap-6 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Users size={16} className="text-blue-600" />
                    {d.cantidadFuncionariosRequeridos} Personas
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Truck size={16} className="text-blue-600" />
                    {d.cantidadVehiculosRequeridos} Vehículos
                  </span>
                </div>
                {d.encargado && (
                  <p className="text-xs text-gray-500 mt-1">Encargado: {d.encargado}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/sge/despliegues/${d.id}/asignar`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold transition"
                >
                  Gestionar / Asignar
                </Link>
                <button
                  onClick={async () => {
                    if (window.confirm("¿Está seguro de eliminar este despliegue? Esta acción no se puede deshacer.")) {
                      try {
                        await sgeApi.delete(`/despliegues/${d.id}`);
                        setDespliegues(despliegues.filter(item => item.id !== d.id));
                      } catch (error) {
                        console.error("Error deleting despliegue", error);
                        alert("No se pudo eliminar el despliegue.");
                      }
                    }
                  }}
                  className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition border border-red-100"
                  title="Eliminar Solicitud"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {despliegues.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Shield size={48} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">No hay solicitudes de despliegue aún.</p>
              <p className="text-sm mt-1">Cree una nueva solicitud para organizar la respuesta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventoDetail;
