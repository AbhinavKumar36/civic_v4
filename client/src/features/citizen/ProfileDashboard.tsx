import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { CheckCircle2, ShieldCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardMap } from '../map/DashboardMap';

export const ProfileDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hotspots, setHotspots] = useState<any[]>([]);

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
      }
    };
    fetchHotspots();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground dark:text-white">Citizen Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 
              Identity Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className="font-bold text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> VERIFIED
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Method</span>
              <span className="font-semibold text-gray-800">AADHAAR (e-KYC)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Full Name</span>
              <span className="font-semibold text-gray-800">{user.name || 'Citizen'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Phone</span>
              <span className="font-semibold text-gray-800">{user.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted">
              Submit a new civic need or check the status of your past submissions.
            </p>
            <div className="flex gap-4">
              <Link to="/citizen/submit" className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90">
                Submit Need
              </Link>
              <Link to="/citizen/history" className="px-4 py-2 bg-surface border-border border border-gray-300 text-foreground rounded-md font-medium hover:bg-background">
                View History
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Live Civic Hotspots</h3>
        <p className="text-sm text-muted mb-4">View areas with high concentration of civic demands in your city.</p>
        <div className="bg-surface border-border p-2 rounded-lg shadow h-[400px] z-0 relative">
          <DashboardMap 
            hotspots={hotspots.map(h => ({
              cluster_id: h._id,
              category_archetype: h.themeId?.category || 'General',
              sub_category_archetype: h.themeId?.name || 'Unknown',
              centroid: { lat: h.center.coordinates[1], lng: h.center.coordinates[0] },
              priority_score: h.intensity * 10
            })) as any}
          />
        </div>
      </div>
    </div>
  );
};
