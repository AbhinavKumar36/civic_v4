import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';

export const DemandList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = new URL('http://localhost:4000/api/v1/civic-inputs/normalized-demands');
        if (categoryFilter) url.searchParams.append('category', categoryFilter);

        const res = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDemands(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDemands();
  }, [categoryFilter]);

  if (loading) return <div>Loading demand intelligence...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface border-border p-4 rounded border shadow-sm">
        <h2 className="text-xl font-bold">Demand Intelligence</h2>
        <select 
          className="border rounded p-2" 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="ROADS_AND_TRANSPORT">Roads & Transport</option>
          <option value="WATER_AND_SANITATION">Water & Sanitation</option>
          <option value="EDUCATION">Education</option>
          <option value="HEALTHCARE">Healthcare</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demands.map(demand => (
          <Card key={demand._id} className="p-4 flex flex-col justify-between hover:shadow-md cursor-pointer" onClick={() => onSelect(demand._id)}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{demand.category}</span>
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  demand.urgency === 'HIGH' || demand.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {demand.urgency} URGENCY
                </span>
              </div>
              <h3 className="font-semibold text-lg line-clamp-1">{demand.title}</h3>
              <p className="text-sm text-muted line-clamp-2 mt-2">{demand.summary}</p>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-muted border-t pt-2">
              <span>Confidence: {(demand.confidence * 100).toFixed(0)}%</span>
              <span>{new Date(demand.createdAt).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
      </div>
      {demands.length === 0 && <p className="text-center text-muted mt-8">No normalized demands found.</p>}
    </div>
  );
};
