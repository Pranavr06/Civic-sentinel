import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, GeoJSON } from 'react-leaflet';
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
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
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
  const { projects, role } = useAppContext();
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('/india.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Could not load India GeoJSON:", err));
  }, []);

  // Center roughly on India
  const center: [number, number] = [21.5937, 78.9629];
  
  // Strict bounds for Bharat
  const indiaBounds: L.LatLngBoundsExpression = [
    [6.0, 68.0], // SW
    [37.5, 97.5] // NE
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Geospatial Risk Intelligence - Bharat</h1>
        <div className="flex space-x-3 text-sm font-medium">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1 border border-white"></span> Safe</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1 border border-white"></span> Low</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-1 border border-white"></span> Medium</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1 border border-white"></span> High</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-rose-500 mr-1 border border-white"></span> Critical</div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden relative border-2 border-indigo-100 bg-[#f8fafc]">
        <MapContainer 
          center={center} 
          zoom={5} 
          minZoom={4}
          maxBounds={indiaBounds}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%', background: 'transparent' }}
          zoomControl={true}
        >
          {geoData && (
            <GeoJSON 
              data={geoData} 
              style={{
                color: '#4f46e5', // Indigo border
                weight: 1.5,
                fillColor: '#e0e7ff', // Light indigo fill
                fillOpacity: 0.6
              }}
            />
          )}
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
                    onClick={() => navigate(`/${role === 'Public' ? 'citizen' : role.toLowerCase()}/project/${project.id}`)}
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
