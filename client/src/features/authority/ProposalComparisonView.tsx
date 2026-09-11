import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface ProposalComparisonViewProps {
  proposals: any[];
  onBack: () => void;
  onSelectProposal: (id: string) => void;
}

export const ProposalComparisonView: React.FC<ProposalComparisonViewProps> = ({ 
  proposals, 
  onBack, 
  onSelectProposal 
}) => {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted">Please select at least 2 proposals to compare.</p>
        <Button onClick={onBack}>← Back to Proposals</Button>
      </div>
    );
  }

  // Comparison chart data
  const chartData = proposals.map(p => ({
    name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
    'Priority Score': p.priorityScore || 0,
    'Social Impact': p.socialImpactScore || 0,
    'Economic Impact': p.economicImpactScore || 0
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-surface border-border p-4 rounded-lg border">
        <div>
          <h2 className="text-xl font-bold text-foreground">Comparative Development Proposal Matrix</h2>
          <p className="text-xs text-muted">Side-by-side multidimensional comparison for objective decision-support</p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to Proposals
        </Button>
      </div>

      {/* Comparison Chart */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-base font-bold text-foreground">
            Cross-Proposal Priority & Impact Valuation
          </CardTitle>
        </CardHeader>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Priority Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Social Impact" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Economic Impact" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Comparative Matrix Table */}
      <Card className="p-6 overflow-x-auto">
        <h3 className="text-base font-bold text-foreground mb-4">Factor Matrix Breakdown</h3>
        <table className="min-w-full text-xs text-left border">
          <thead className="bg-gray-100 text-foreground font-bold border-b">
            <tr>
              <th className="py-3 px-4 w-48">Decision Criteria</th>
              {proposals.map(p => (
                <th key={p._id} className="py-3 px-4 min-w-[200px]">
                  <div className="font-bold text-foreground text-sm">{p.title}</div>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase block">{p.category} | {p.wardId}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-indigo-50/50 font-bold">
              <td className="py-2.5 px-4 text-indigo-900 font-bold">Priority Score (Rank)</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 font-extrabold text-indigo-700 text-sm">
                  {p.priorityScore || 0}/100 <span className="text-xs text-muted font-normal">(Rank #{p.priorityRank || '-'})</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Estimated Cost</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 font-mono font-bold text-gray-800">
                  ₹{((p.estimatedCost || 0) / 100000).toFixed(1)} Lakhs
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Target Beneficiaries</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 text-gray-800">
                  ~{(p.beneficiaries || 0).toLocaleString()} residents
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Social Impact Score</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 font-bold text-emerald-700">
                  {p.socialImpactScore || 0}/100
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Economic Impact</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 font-medium text-blue-700">
                  {p.economicImpactScore ? `${p.economicImpactScore}/100` : 'Grounded Level'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Evidence Confidence</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 font-medium text-amber-700">
                  {p.impactConfidence ? `${(p.impactConfidence * 100).toFixed(0)}%` : 'Standard'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Connected Demands</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4 text-muted">
                  {p.relatedDemandIds?.length || 0} citizen demands
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-semibold text-foreground">Detailed Inspection</td>
              {proposals.map(p => (
                <td key={p._id} className="py-2.5 px-4">
                  <Button size="sm" variant="outline" onClick={() => onSelectProposal(p._id)}>
                    Inspect Proposal →
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};
