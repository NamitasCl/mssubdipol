import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Shield, Truck, Users } from 'lucide-react';

const EventoDetail = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [despliegues, setDespliegues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, deployRes] = await Promise.all([
          axios.get(`/api/eventos/${id}`),
          axios.get(`/api/eventos/${id}/despliegues`) // Fixed endpoint to match Controller
        ]);
        setEvento(eventRes.data);
        setDespliegues(deployRes.data);
      } catch (error) {
        console.error("Error fetching details", error);
      }
    };
    fetchData();
  }, [id]);

  if (!evento) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">{evento.tipo}</span>
              <h1 className="text-2xl font-bold text-gray-900">{evento.descripcion}</h1>
            </div>
            <p className="text-gray-600">{evento.region}</p>
          </div>
          <Link to={`/sge/eventos/${id}/despliegues/new`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2">
            <Shield size={18} />
            Solicitar Despliegue
          </Link>
        </div>
      </div>

      {/* Map View */}
      <div className="h-96 w-full rounded-lg overflow-hidden border shadow-inner">
        <MapContainer center={[evento.latitud, evento.longitud]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Main Event Marker */}
          <Marker position={[evento.latitud, evento.longitud]}>
            <Popup>
              <strong>{evento.descripcion}</strong><br />
              {evento.tipo}
            </Popup>
          </Marker>

          {/* Deployment Zones */}
          {despliegues.map(d => (
             d.latitud && d.longitud && (
               <Circle 
                 key={d.id} 
                 center={[d.latitud, d.longitud]} 
                 pathOptions={{ color: 'blue', fillColor: 'blue' }} 
                 radius={500}
               >
                 <Popup>
                   <strong>{d.descripcion}</strong><br/>
                   Req: {d.cantidadFuncionariosRequeridos} Func., {d.cantidadVehiculosRequeridos} Veh.
                 </Popup>
               </Circle>
             )
          ))}
        </MapContainer>
      </div>

      {/* Deployments List */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <AlertTriangle size={20} className="text-orange-500"/>
           Despliegues Solicitados
        </h3>
        <div className="grid gap-4">
          {despliegues.map((d) => (
            <div key={d.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center">
               <div>
                  <h4 className="font-bold text-gray-800">{d.descripcion}</h4>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                     <span className="flex items-center gap-1"><Users size={14}/> {d.cantidadFuncionariosRequeridos} Personas</span>
                     <span className="flex items-center gap-1"><Truck size={14}/> {d.cantidadVehiculosRequeridos} Vehículos</span>
                  </div>
               </div>
               <Link to={`/sge/despliegues/${d.id}/asignar`} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                 Gestionar / Asignar
               </Link>
            </div>
          ))}
          {despliegues.length === 0 && <p className="text-gray-500">No hay solicitudes de despliegue aún.</p>}
        </div>
      </div>
    </div>
  );
};

export default EventoDetail;
