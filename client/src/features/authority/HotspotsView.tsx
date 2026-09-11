import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DashboardMap } from '../map/DashboardMap';
import 'leaflet/dist/leaflet.css';

export const HotspotsView: React.FC = () => {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [hotspotRes, datasetRes] = await Promise.all([
        fetch(`http://localhost:4000/api/v1/intelligence/hotspots`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`http://localhost:4000/api/v1/datasets`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const hotspotData = await hotspotRes.json();
      const datasetData = await datasetRes.json();

      if (hotspotData.success) setHotspots(hotspotData.data);
      if (datasetData.success) {
        // For demo purposes, we will fetch the first 50 records of each dataset if toggled.
        // We'll store datasets here to render the toggles.
        setDatasets(datasetData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [layerData, setLayerData] = useState<Record<string, any[]>>({});

  const toggleLayer = async (datasetId: string) => {
    const isActive = activeLayers[datasetId];
    if (!isActive && !layerData[datasetId]) {
      // Fetch layer data
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:4000/api/v1/datasets/${datasetId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setLayerData(prev => ({ ...prev, [datasetId]: data.data.records }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    setActiveLayers(prev => ({ ...prev, [datasetId]: !isActive }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading hotspots...</div>;



  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Demand Hotspots & Contextual Data</h2>
      <p className="text-muted">Geographic concentration of recurring civic themes with supporting public data.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-surface border-border p-2 rounded-lg shadow h-[600px] z-0 relative">
          <DashboardMap 
            hotspots={hotspots.map(h => ({
              cluster_id: h._id,
              category_archetype: h.themeId?.category || 'General',
              sub_category_archetype: h.themeId?.name || 'Unknown',
              centroid: { lat: h.center.coordinates[1], lng: h.center.coordinates[0] },
              priority_score: h.intensity * 10, // approximate mapping
              assigned_to: null
            })) as any}
          />
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          <Card className="p-4">
            <h3 className="font-semibold text-lg border-b pb-2 mb-3">Contextual Layers</h3>
            {datasets.length === 0 ? (
              <p className="text-xs text-muted">No contextual datasets available. Run seed script.</p>
            ) : (
              <div className="space-y-2">
                {datasets.map(ds => (
                  <label key={ds._id} className="flex items-start space-x-2 cursor-pointer text-sm">
                    <input 
                      type="checkbox" 
                      className="mt-1"
                      checked={activeLayers[ds._id] || false} 
                      onChange={() => toggleLayer(ds._id)} 
                    />
                    <div>
                      <span className="font-semibold block">{ds.name}</span>
                      <span className="text-xs text-muted">{ds.recordCount} records</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>

          <h3 className="font-semibold text-lg mt-6">Top Hotspots</h3>
          {hotspots.map(h => (
            <Card key={h._id} className="p-4 border-l-4 border-red-500">
              <h4 className="font-bold mb-1">{h.themeId?.name || 'Unknown Theme'}</h4>
              <div className="text-sm text-muted space-y-1">
                <p><strong>Demands:</strong> {h.demandCount}</p>
                <p><strong>Intensity:</strong> {h.intensity.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
