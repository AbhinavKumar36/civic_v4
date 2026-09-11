import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ProposalsListViewProps {
  onSelectProposal: (id: string) => void;
  onCompareProposals: (proposals: any[]) => void;
}

export const ProposalsListView: React.FC<ProposalsListViewProps> = ({ 
  onSelectProposal, 
  onCompareProposals 
}) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedCategory === 'ALL' 
        ? `http://localhost:4000/api/v1/proposals?sort=rank`
        : `http://localhost:4000/api/v1/proposals?category=${selectedCategory}&sort=rank`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProposals(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const evaluateAll = async () => {
    setEvaluatingAll(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/v1/proposals/evaluate-all`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      await fetchProposals();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingAll(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [selectedCategory]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    const selectedProposals = proposals.filter(p => selectedIds.includes(p._id));
    onCompareProposals(selectedProposals);
  };

  // KPI calculations
  const totalCount = proposals.length;
  const topProposal = proposals.length > 0 ? proposals[0] : null;
  const avgPriority = totalCount > 0 
    ? (proposals.reduce((sum, p) => sum + (p.priorityScore || 0), 0) / totalCount).toFixed(1) 
    : '0';

  const categories = [
    'ALL', 'HEALTHCARE', 'EDUCATION', 'DRAINAGE', 'WATER', 
    'ROADS', 'TRANSPORT', 'SANITATION', 'ENVIRONMENT'
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Development Proposals & Prioritization</h2>
          <p className="text-xs text-muted">Objective decision-support ranking competing civic capital works for Bhubaneswar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length >= 2 && (
            <Button variant="secondary" onClick={handleCompare}>
              📊 Compare ({selectedIds.length}) Proposals
            </Button>
          )}
          <Button onClick={evaluateAll} disabled={evaluatingAll}>
            {evaluatingAll ? 'Evaluating & Ranking...' : '⚡ Batch Evaluate & Rank All'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-surface border-border border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Evaluated Proposals</span>
          <p className="text-2xl font-black text-foreground mt-1">{totalCount}</p>
          <p className="text-xs text-muted">Bhubaneswar municipal wards</p>
        </Card>

        <Card className="p-4 bg-surface border-border border">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Top Priority Proposal</span>
          <p className="text-lg font-bold text-indigo-900 mt-1 truncate">
            {topProposal ? topProposal.title : 'None'}
          </p>
          <p className="text-xs text-indigo-600 font-semibold">
            {topProposal ? `Score: ${topProposal.priorityScore}/100 (Rank #1)` : '-'}
          </p>
        </Card>

        <Card className="p-4 bg-surface border-border border">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Mean Priority Score</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{avgPriority} / 100</p>
          <p className="text-xs text-muted">Deterministic multi-criteria engine</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center pb-2 border-b">
        <span className="text-xs font-bold text-gray-400 uppercase mr-2">Category:</span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 text-muted hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="py-12 text-center text-muted">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          No proposals found in this category.
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => {
            const isSelected = selectedIds.includes(proposal._id);

            return (
              <Card 
                key={proposal._id} 
                className={`p-5 transition-all hover:shadow-md cursor-pointer border ${
                  isSelected ? 'border-indigo-500 bg-indigo-50/20' : 'bg-surface border-border'
                }`}
                onClick={() => onSelectProposal(proposal._id)}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Left Column: Title & Metadata */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center h-full pt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(proposal._id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {proposal.priorityRank && (
                          <span className="px-2.5 py-0.5 bg-indigo-700 text-white font-black text-xs rounded-full">
                            #{proposal.priorityRank}
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 text-foreground uppercase tracking-wider">
                          {proposal.category}
                        </span>
                        {proposal.wardId && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            📍 {proposal.wardId}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-indigo-600">
                        {proposal.title}
                      </h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                        {proposal.description}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
                        <span>Est: <strong>₹{((proposal.estimatedCost || 0)/100000).toFixed(1)}L</strong></span>
                        <span>Timeline: <strong>{proposal.estimatedTimeline || '12m'}</strong></span>
                        <span>Beneficiaries: <strong>~{(proposal.beneficiaries || 0).toLocaleString()}</strong></span>
                        <span>Demands: <strong>{proposal.relatedDemandIds?.length || 0}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Priority & Impact Scores */}
                  <div className="flex items-center gap-6 self-end lg:self-center bg-background p-3 rounded-xl border">
                    <div className="text-center w-20">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Priority</span>
                      <span className="text-2xl font-black text-indigo-700">{proposal.priorityScore || 0}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1 rounded-full" 
                          style={{ width: `${proposal.priorityScore || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-center w-16">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Social</span>
                      <span className="text-lg font-bold text-emerald-600">{proposal.socialImpactScore || 0}</span>
                    </div>

                    <div className="text-center w-16">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Confidence</span>
                      <span className="text-xs font-bold text-amber-600">
                        {proposal.impactConfidence ? `${(proposal.impactConfidence * 100).toFixed(0)}%` : 'Std'}
                      </span>
                    </div>

                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      onSelectProposal(proposal._id);
                    }}>
                      Inspect →
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
