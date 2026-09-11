import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DashboardMap } from '../map/DashboardMap';
import { useAuth } from '../auth/AuthContext';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/v1/intelligence/hotspots', {
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
    fetchHotspots();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Field Tasks</h2>
      <p className="text-muted">View and manage tasks assigned to you based on demand hotspots.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-surface border-border p-2 rounded-lg shadow h-[600px] z-0 relative">
          {loading ? (
            <div className="h-full flex items-center justify-center">Loading map...</div>
          ) : (
            <DashboardMap 
              hotspots={hotspots.map(h => ({
                cluster_id: h._id,
                category_archetype: h.themeId?.category || 'General',
                sub_category_archetype: h.themeId?.name || 'Unknown',
                centroid: { lat: h.center.coordinates[1], lng: h.center.coordinates[0] },
                priority_score: h.intensity * 10,
                assigned_to: h.assigned_to // Map to worker if any
              })) as any}
            />
          )}
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Worker ID</span>
                <span className="font-bold">{user?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Name</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="font-semibold text-green-500">ON DUTY</span>
              </div>
            </CardContent>
          </Card>

          <h3 className="font-semibold text-lg mt-6">Assigned Hotspots</h3>
          {hotspots.length === 0 && !loading && (
            <p className="text-sm text-muted">No hotspots currently detected in your area.</p>
          )}
          {hotspots.map(h => (
            <Card key={h._id} className="p-4 border-l-4 border-blue-500">
              <h4 className="font-bold mb-1">{h.themeId?.name || 'Unknown Task'}</h4>
              <div className="text-sm text-muted space-y-1">
                <p><strong>Reports:</strong> {h.demandCount}</p>
                <p><strong>Priority:</strong> {h.intensity > 8 ? 'CRITICAL' : h.intensity > 4 ? 'HIGH' : 'LOW'}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
