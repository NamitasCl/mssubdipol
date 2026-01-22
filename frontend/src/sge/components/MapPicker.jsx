import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
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
  const [position, setPosition] = useState(initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null);

  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  }, [position]);

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border">
      <MapContainer center={[-33.4489, -70.6693]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        {position && radius > 0 && (
            <Circle 
                center={position} 
                radius={radius} 
                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} 
            />
        )}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
