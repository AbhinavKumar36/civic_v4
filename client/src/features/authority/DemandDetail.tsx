import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { EvidenceContextView } from './EvidenceContextView';

interface DemandDetailProps {
  demandId: string;
  onBack: () => void;
}

export const DemandDetail: React.FC<DemandDetailProps> = ({ demandId, onBack }) => {
  const [demand, setDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:4000/api/v1/civic-inputs/normalized-demands/${demandId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDemand(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDemand();
  }, [demandId]);

  if (loading) return <div>Loading demand details...</div>;
  if (!demand) return <div>Demand not found</div>;

  if (showEvidence) {
    return <EvidenceContextView demandId={demand._id} onBack={() => setShowEvidence(false)} />;
  }

  const civicInput = demand.civicInputId;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
        <Button onClick={() => setShowEvidence(true)} className="bg-green-600 hover:bg-green-700">
          Analyze Contextual Evidence
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{demand.title}</h2>
          <p className="text-sm text-muted uppercase tracking-widest">{demand.category} • {demand.subCategory}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-foreground">AI Confidence</div>
          <div className="text-xl text-primary">{(demand.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Citizen Raw Input side */}
        <Card className="p-6 bg-background">
          <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">CITIZEN-PROVIDED INFORMATION</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted uppercase">Input Type</div>
              <div className="font-medium">{civicInput.inputType}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase">Original Language</div>
              <div className="font-medium">{civicInput.originalLanguage}</div>
            </div>
            {civicInput.text && (
              <div>
                <div className="text-xs text-muted uppercase">Raw Text / Transcript</div>
                <div className="p-3 bg-surface border-border border rounded text-sm italic mt-1">{civicInput.text}</div>
              </div>
            )}
            {civicInput.media && civicInput.media.length > 0 && (
              <div>
                <div className="text-xs text-muted uppercase mb-2">Attached Media</div>
                <div className="flex gap-2 flex-wrap">
                  {civicInput.media.map((url: string, i: number) => (
                    <img key={i} src={`http://localhost:4000${url}`} alt="Citizen upload" className="w-32 h-32 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
            {civicInput.location && (
              <div>
                <div className="text-xs text-muted uppercase">Location Provided</div>
                <div className="font-mono text-sm">
                  Lng: {civicInput.location.coordinates[0]}, Lat: {civicInput.location.coordinates[1]}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* AI Interpretation side */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4">AI-INTERPRETED INFORMATION</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-blue-500 uppercase">Summary</div>
              <div className="font-medium text-blue-900">{demand.summary}</div>
            </div>
            <div>
              <div className="text-xs text-blue-500 uppercase">Demand Statement</div>
              <div className="font-medium text-blue-900">{demand.demandStatement}</div>
            </div>
            <div>
              <div className="text-xs text-blue-500 uppercase">Problem Statement</div>
              <div className="font-medium text-blue-900">{demand.problemStatement}</div>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="text-xs text-blue-500 uppercase">Urgency</div>
                <div className="font-bold text-red-700">{demand.urgency}</div>
              </div>
              <div>
                <div className="text-xs text-blue-500 uppercase">Severity</div>
                <div className="font-bold text-orange-700">{demand.severity}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-500 uppercase">Affected Groups</div>
              <div className="flex gap-2 flex-wrap mt-1">
                {demand.affectedGroups.map((group: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">{group}</span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-blue-200 mt-4 text-xs text-blue-400 text-right">
              Processed by: {demand.aiProvider} ({demand.aiModel})
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
