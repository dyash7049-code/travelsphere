import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically update map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function InteractiveMap({ locations, city }) {
  // Default to center of India if no city/locations
  let center = [20.5937, 78.9629];
  let zoom = 5;

  if (locations && locations.length > 0) {
    center = [locations[0].lat, locations[0].lng];
    zoom = 12;
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0 relative">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        
        {locations?.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup className="rounded-lg shadow-xl border-none">
              <div className="text-center font-sans p-1">
                <h3 className="font-bold text-gray-900 mb-1">{loc.name}</h3>
                <p className="text-brand-primary font-bold text-lg">₹{loc.price}</p>
                <button className="mt-2 text-xs bg-gray-100 text-gray-700 hover:bg-brand-primary hover:text-white px-4 py-1 rounded-full transition w-full">
                  View
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
