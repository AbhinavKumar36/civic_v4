import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SubmissionHistory: React.FC = () => {
  const [inputs, setInputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInputs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/civic-inputs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInputs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/v1/civic-inputs/${id}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInputs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewResult = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/civic-inputs/${id}/normalized-result`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedResult(data.data);
        setIsModalOpen(true);
      } else {
        alert('Could not fetch result');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch result');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  useEffect(() => {
    fetchInputs();
  }, []);

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Your Submission History</h2>
      {inputs.length === 0 ? (
        <p className="text-muted">You haven't submitted any needs yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {inputs.map(input => (
            <Card key={input._id} className="p-4 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-foreground uppercase tracking-wide">
                    {input.inputType}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    input.status === 'NORMALIZED' ? 'bg-green-100 text-green-700' :
                    input.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {input.status}
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-800 dark:text-gray-200 line-clamp-3">
                  {input.text || "No text provided (Media/Location only)"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-muted">
                <span>{new Date(input.createdAt).toLocaleDateString()}</span>
                {input.status === 'FAILED' && (
                  <Button variant="outline" size="sm" onClick={() => handleRetry(input._id)}>
                    Retry Processing
                  </Button>
                )}
                {input.status === 'NORMALIZED' && (
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleViewResult(input._id)}
                  >
                    View Result
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Result Modal */}
      {isModalOpen && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full p-6 bg-surface border-border dark:bg-gray-800 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-foreground dark:text-white">AI Normalized Demand</h3>
              <button onClick={closeModal} className="text-muted hover:text-foreground">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted uppercase">Title</h4>
                <p className="text-lg font-medium">{selectedResult.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-muted uppercase">Summary</h4>
                <p className="text-foreground dark:text-gray-300">{selectedResult.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted uppercase">Category</h4>
                  <p className="font-medium">{selectedResult.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted uppercase">Severity</h4>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    selectedResult.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    selectedResult.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedResult.severity}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted uppercase">Demand Statement</h4>
                <p className="text-foreground dark:text-gray-300 bg-background dark:bg-gray-900 p-3 rounded border">
                  {selectedResult.demandStatement}
                </p>
              </div>

              {selectedResult.entities && selectedResult.entities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted uppercase mb-2">Detected Entities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.entities.map((ent: string, idx: number) => (
                      <span key={idx} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end border-t pt-4">
              <Button onClick={closeModal}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
