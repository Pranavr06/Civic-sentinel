import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../data/store';
import { Card, Badge } from '../components/ui';
import L from 'leaflet';

// Fix leaflet default icons issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons based on risk
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const icons = {
  Safe: createIcon('#3b82f6'), // blue
  Low: createIcon('#10b981'), // emerald
  Medium: createIcon('#f59e0b'), // amber
  High: createIcon('#f97316'), // orange
  Critical: createIcon('#ef4444'), // rose
};

export const MapView = () => {
  const { projects } = useAppContext();
  const navigate = useNavigate();

  // Center roughly on India
  const center: [number, number] = [20.5937, 78.9629];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Geospatial Risk Intelligence</h1>
        <div className="flex space-x-3 text-sm font-medium">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1 border border-white"></span> Low</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-1 border border-white"></span> Medium</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1 border border-white"></span> High</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-rose-500 mr-1 border border-white"></span> Critical</div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden relative">
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Satellite View (ESRI)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Administrative View (Light)">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {projects.map((project) => (
            <Marker 
              key={project.id} 
              position={[project.lat, project.lng]}
              icon={icons[project.riskCategory || 'Low']}
            >
              <Popup className="rounded-lg">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{project.district}, {project.state}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold">Risk Score:</span>
                    <Badge variant={project.riskCategory === 'Critical' ? 'danger' : project.riskCategory === 'High' ? 'warning' : 'success'}>
                      {project.riskScore}/100
                    </Badge>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="w-full text-center bg-indigo-600 text-white py-1.5 rounded text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Investigate Project
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
    </div>
  );
}
