import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface EvidenceContextViewProps {
  demandId: string;
  onBack: () => void;
}

export const EvidenceContextView: React.FC<EvidenceContextViewProps> = ({ demandId, onBack }) => {
  const [evidenceRecords, setEvidenceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchEvidence = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/evidence/demand/${demandId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvidenceRecords(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateEvidence = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/v1/evidence/demand/${demandId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchEvidence();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [demandId]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>← Back to Demand</Button>
        <Button onClick={generateEvidence} disabled={generating}>
          {generating ? 'Analyzing Context...' : 'Generate Contextual Evidence'}
        </Button>
      </div>

      <h2 className="text-2xl font-bold">Contextual Evidence</h2>
      <p className="text-gray-600">Reconciling citizen perception with documented public data.</p>

      {loading ? (
        <p>Loading evidence...</p>
      ) : evidenceRecords.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No contextual evidence generated yet. Click "Generate Contextual Evidence".
        </Card>
      ) : (
        <div className="space-y-6">
          {evidenceRecords.map((evidence) => {
            const isSupporting = evidence.evidenceType === 'SUPPORTING';
            const isContradicting = evidence.evidenceType === 'CONTRADICTING';
            const isInsufficient = evidence.evidenceType === 'INSUFFICIENT_DATA';

            return (
              <Card key={evidence._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{evidence.datasetId?.name || 'Unknown Dataset'}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    isSupporting ? 'bg-green-100 text-green-800' :
                    isContradicting ? 'bg-red-100 text-red-800' :
                    isInsufficient ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {evidence.evidenceType}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="block text-gray-500 text-sm font-semibold mb-1">Calculated Indicator</span>
                    {evidence.indicator}
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="block text-gray-500 text-sm font-semibold mb-1">Observed Value</span>
                    <span className="font-mono">{evidence.observedValue}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-2">AI Interpretation</h4>
                  <p className="font-medium text-gray-800 mb-2">{evidence.relationship}</p>
                  <p className="text-gray-600">{evidence.explanation}</p>
                </div>

                <div className="border-t pt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span><strong>Source:</strong> {evidence.source}</span>
                  <span><strong>Confidence:</strong> {evidence.confidence}/10</span>
                  <span><strong>Strength:</strong> {evidence.evidenceStrength}/10</span>
                  <span><strong>Generated:</strong> {new Date(evidence.generatedAt).toLocaleString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
