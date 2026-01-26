import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, Polygon as ReactLeafletPolygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const MapPicker = ({ onLocationSelect, initialLat, initialLng, radius = 0 }) => {
  const [mode, setMode] = useState('point'); // point, polygon
  const [position, setPosition] = useState(initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Notify parent of changes
  useEffect(() => {
    if (mode === 'point' && position) {
      // Return simple latlng for point/circle (backward compatibility + new logic handles resizing radius)
      onLocationSelect({
        type: 'Point',
        lat: position.lat,
        lng: position.lng
      });
    } else if (mode === 'polygon' && polygonPoints.length >= 3) {
      // Return Polygon GeoJSON structure
      const coordinates = [...polygonPoints, polygonPoints[0]].map(p => [p.lng, p.lat]); // Close loop
      onLocationSelect({
        type: 'Polygon',
        coordinates: [coordinates]
      });
    }
  }, [position, polygonPoints, mode]);

  // Map events handler
  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        if (mode === 'point') {
          setPosition(e.latlng);
          setPolygonPoints([]); // Clear polygon if switching to point
        } else if (mode === 'polygon') {
          setPolygonPoints(prev => [...prev, e.latlng]);
        }
      },
    });

    // Force invalidation on load/resize to fix grey tiles
    useEffect(() => {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }, [map]);

    return null;
  };

  const clearMap = () => {
    setPosition(null);
    setPolygonPoints([]);
    setMode('point');
  };

  return (
    <div className="relative h-full w-full min-h-[300px] overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-lg flex flex-col gap-2 p-2 border border-gray-200">
        <button
          type="button"
          onClick={() => { setMode('point'); setPolygonPoints([]); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'point'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          title="Modo Marcador: Haga clic para colocar un punto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-xs font-medium">Punto</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('polygon'); setPosition(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'polygon'
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          title="Modo Polígono: Haga clic para dibujar un área irregular"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span className="text-xs font-medium">Polígono</span>
        </button>

        <div className="border-t border-gray-200 my-1"></div>

        <button
          type="button"
          onClick={clearMap}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-red-600 hover:bg-red-50 transition-all"
          title="Limpiar todas las marcas del mapa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
          <span className="text-xs font-medium">Limpiar</span>
        </button>
      </div>


      <div className="h-full w-full rounded-md overflow-hidden border z-0">
        <MapContainer center={[-33.4489, -70.6693]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />

          {/* Render Point/Circle */}
          {mode === 'point' && position && (
            <>
              <Marker position={position} />
              {radius > 0 && (
                <Circle
                  center={position}
                  radius={radius}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                />
              )}
            </>
          )}

          {/* Render Polygon */}
          {mode === 'polygon' && polygonPoints.length > 0 && (
            <>
              {polygonPoints.map((pos, idx) => (
                <Marker key={idx} position={pos} opacity={0.6} /> // Helper markers for vertices
              ))}
              <ReactLeafletPolygon positions={polygonPoints} pathOptions={{ color: 'orange', fillColor: 'orange' }} />
            </>
          )}
        </MapContainer>
      </div>

      {mode === 'polygon' && (
        <div className="text-xs text-gray-500 mt-1">
          Haga clic en el mapa para añadir vértices. Se requiere al menos 3 puntos.
        </div>
      )}
    </div>
  );
};

export default MapPicker;
