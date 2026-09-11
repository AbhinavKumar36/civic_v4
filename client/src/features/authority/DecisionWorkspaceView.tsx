import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface DecisionWorkspaceViewProps {
  portfolioId: string;
  onDecisionComplete: () => void;
}

export const DecisionWorkspaceView: React.FC<DecisionWorkspaceViewProps> = ({ portfolioId, onDecisionComplete }) => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [justification, setJustification] = useState('');
  const [selectedForOverride, setSelectedForOverride] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, [portfolioId]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/v1/portfolios/${portfolioId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = (proposal: any, action: 'ADDED' | 'REMOVED') => {
    setSelectedForOverride({ proposal, action });
    setJustification('');
  };

  const submitOverride = () => {
    if (!justification) return;
    
    setOverrides([...overrides, {
      proposalId: selectedForOverride.proposal._id,
      action: selectedForOverride.action,
      justification,
      _proposalTitle: selectedForOverride.proposal.title, // for display only
      _proposalCost: selectedForOverride.proposal.estimatedCost || 0
    }]);

    setSelectedForOverride(null);
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      // Reconstruct final selected proposals based on overrides
      let finalSelected = new Set(portfolio.selectedProposals.map((p: any) => p._id));
      overrides.forEach(o => {
        if (o.action === 'ADDED') finalSelected.add(o.proposalId);
        if (o.action === 'REMOVED') finalSelected.delete(o.proposalId);
      });

      const res = await fetch(`/api/v1/portfolios/${portfolioId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          approvedProposalIds: Array.from(finalSelected),
          humanOverrides: overrides
        })
      });

      const data = await res.json();
      if (data.success) {
        onDecisionComplete();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !portfolio) return <div>Loading Workspace...</div>;

  let currentCost = portfolio.metrics.totalCost;
  overrides.forEach(o => {
    if (o.action === 'ADDED') currentCost += o._proposalCost;
    if (o.action === 'REMOVED') currentCost -= o._proposalCost;
  });

  const maxBudget = portfolio.constraints.maxBudget;
  const isOverBudget = currentCost > maxBudget;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Decision Workspace</h1>
          <p className="text-gray-500 mt-1">Review AI Portfolio and apply Human Overrides</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Budget Constraint</p>
          <p className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            ₹{(currentCost / 100000).toFixed(2)}L / ₹{(maxBudget / 100000).toFixed(2)}L
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
            <CardTitle className="text-green-800">Selected by Engine</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {portfolio.selectedProposals.map((p: any) => {
              const isOverridden = overrides.find(o => o.proposalId === p._id && o.action === 'REMOVED');
              if (isOverridden) return null;
              
              return (
                <div key={p._id} className="p-3 bg-white border rounded shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{p.title}</h4>
                    <p className="text-xs text-gray-500">Score: {p.priorityScore} | ₹{(p.estimatedCost/100000).toFixed(2)}L</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={() => handleOverride(p, 'REMOVED')}>
                    Remove
                  </Button>
                </div>
              );
            })}
            
            {/* Show Manually Added ones here */}
            {overrides.filter(o => o.action === 'ADDED').map(o => (
              <div key={o.proposalId} className="p-3 bg-blue-50 border border-blue-200 rounded shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">{o._proposalTitle}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">MANUAL OVERRIDE</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
            <CardTitle className="text-red-800">Excluded due to Constraints</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {portfolio.excludedProposals.map((ep: any) => {
              const p = ep.proposalId;
              if (!p) return null; // Sometimes populate might fail if DB inconsistent
              const isOverridden = overrides.find(o => o.proposalId === p._id && o.action === 'ADDED');
              if (isOverridden) return null;

              return (
                <div key={p._id} className="p-3 bg-white border rounded shadow-sm flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{p.title}</h4>
                    <p className="text-xs text-red-500 mt-1">{ep.reason}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOverride(p, 'ADDED')}>
                    Force Add
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {selectedForOverride && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Human Override Justification
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You are {selectedForOverride.action === 'ADDED' ? 'adding a proposal that violates constraints' : 'removing an AI-selected proposal'}.
              This action requires a justification for the audit trail.
            </p>
            <textarea
              className="w-full border rounded p-2 mb-4 h-24"
              placeholder="Enter justification..."
              value={justification}
              onChange={e => setJustification(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedForOverride(null)}>Cancel</Button>
              <Button onClick={submitOverride} disabled={!justification.trim()}>Submit Override</Button>
            </div>
          </div>
        </div>
      )}

      {overrides.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 pb-3">
            <CardTitle className="text-blue-800 text-sm">Audit Trail: Human Overrides</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <ul className="space-y-2">
              {overrides.map((o, idx) => (
                <li key={idx} className="text-sm bg-white p-2 border rounded">
                  <span className="font-bold">{o.action}</span> - {o._proposalTitle} 
                  <p className="text-gray-500 italic mt-1">Reason: {o.justification}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="pt-4 border-t flex justify-end">
        <Button size="lg" onClick={handleApprove} disabled={saving}>
          {saving ? 'Locking Decision...' : 'Lock & Approve Portfolio'}
        </Button>
      </div>
    </div>
  );
};
