import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const HotspotsView: React.FC = () => {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotspots = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/intelligence/hotspots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHotspots(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  if (loading) return <div>Loading hotspots...</div>;

  const defaultCenter: [number, number] = [28.6139, 77.2090]; // Default to Delhi if no hotspots
  const mapCenter = hotspots.length > 0 
    ? [hotspots[0].center.coordinates[1], hotspots[0].center.coordinates[0]] as [number, number]
    : defaultCenter;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Demand Hotspots</h2>
      <p className="text-gray-600">Geographic concentration of recurring civic themes.</p>

      {hotspots.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No geographic hotspots detected yet. Ensure demands have location data and run the intelligence pipeline.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-2 rounded-lg shadow h-[600px] z-0 relative">
            <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {hotspots.map((h, i) => {
                const [lng, lat] = h.center.coordinates;
                return (
                  <Circle 
                    key={i} 
                    center={[lat, lng]} 
                    radius={h.radius}
                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                  >
                    <Popup>
                      <div className="font-sans">
                        <h4 className="font-bold text-sm mb-1">{h.themeId?.name || 'Unknown Theme'}</h4>
                        <p className="text-xs text-gray-600 mb-2">{h.demandCount} demands • {h.uniqueCitizenCount} citizens</p>
                        <p className="text-xs"><strong>Intensity:</strong> {h.intensity.toFixed(2)}</p>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </MapContainer>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-semibold text-lg">Top Hotspots</h3>
            {hotspots.map(h => (
              <Card key={h._id} className="p-4 border-l-4 border-red-500">
                <h4 className="font-bold mb-1">{h.themeId?.name || 'Unknown Theme'}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Demands:</strong> {h.demandCount}</p>
                  <p><strong>Citizens:</strong> {h.uniqueCitizenCount}</p>
                  <p><strong>Intensity:</strong> {h.intensity.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-2">Last observed: {new Date(h.lastObservedAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
