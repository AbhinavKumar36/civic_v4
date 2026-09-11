import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

interface ProposalDetailAnalysisViewProps {
  proposalId: string;
  onBack: () => void;
}

export const ProposalDetailAnalysisView: React.FC<ProposalDetailAnalysisViewProps> = ({ proposalId, onBack }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'priority' | 'evidence' | 'impact' | 'traceability'>('overview');

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/proposals/${proposalId}/analysis`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reEvaluate = async () => {
    setEvaluating(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/v1/proposals/${proposalId}/evaluate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      await fetch(`http://localhost:4000/api/v1/proposals/${proposalId}/impact`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      await fetchAnalysis();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [proposalId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        Loading proposal intelligence analysis...
      </div>
    );
  }

  if (!data || !data.proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Proposal analysis not found.</p>
        <Button onClick={onBack}>← Back to Proposals</Button>
      </div>
    );
  }

  const { proposal, priority, impact, traceabilityLineage } = data;

  // Prepare chart data for Priority Factor contributions
  const priorityChartData = priority?.factors ? Object.entries(priority.factors).map(([, f]: [string, any]) => ({
    name: f.label,
    Contribution: f.contribution,
    'Normalized Score': f.normalizedValue,
    Weight: `${(f.weight * 100).toFixed(0)}%`
  })) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-surface border-border p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Back to Proposals
          </Button>
          <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full uppercase tracking-wider">
            {proposal.category}
          </span>
          {proposal.wardId && (
            <span className="text-xs px-2.5 py-1 bg-gray-100 text-foreground font-medium rounded-full">
              📍 {proposal.wardId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={reEvaluate} disabled={evaluating}>
            {evaluating ? 'Evaluating Engine...' : '⚡ Re-Calculate Priority & Impact'}
          </Button>
        </div>
      </div>

      {/* Header Banner */}
      <Card className="border-l-4 border-l-indigo-600 p-6 bg-surface border-border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{proposal.title}</h1>
              {proposal.priorityRank && (
                <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-sm rounded-full">
                  Rank #{proposal.priorityRank}
                </span>
              )}
            </div>
            <p className="text-muted text-sm max-w-3xl leading-relaxed">{proposal.description}</p>
          </div>

          <div className="flex items-center gap-4 bg-background p-4 rounded-xl border">
            <div className="text-center px-3 border-r">
              <span className="block text-xs font-semibold text-muted uppercase">Priority</span>
              <span className="text-3xl font-extrabold text-indigo-700">{priority?.totalScore || 0}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
            <div className="text-center px-3 border-r">
              <span className="block text-xs font-semibold text-muted uppercase">Social</span>
              <span className="text-3xl font-extrabold text-emerald-600">{impact?.socialImpactScore || 0}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xs font-semibold text-muted uppercase">Confidence</span>
              <span className="text-3xl font-extrabold text-amber-600">
                {((impact?.confidence || 0) * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400 block uppercase font-bold text-[10px]">
                {impact?.uncertainty || 'MED'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t text-sm text-muted">
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase">Est. Outlay</span>
            <span className="font-bold text-gray-800">
              ₹{((proposal.estimatedCost || 0) / 100000).toFixed(1)} Lakhs
            </span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase">Timeline</span>
            <span className="font-bold text-gray-800">{proposal.estimatedTimeline || '12 months'}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase">Target Beneficiaries</span>
            <span className="font-bold text-gray-800">~{(proposal.beneficiaries || 0).toLocaleString()} residents</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase">Source</span>
            <span className="font-bold text-gray-800">{proposal.source || 'DEMO_PROPOSAL'}</span>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border bg-surface border-border rounded-t-lg px-4 gap-2">
        {[
          { id: 'overview', label: '1. Why This Proposal?' },
          { id: 'priority', label: '2. Priority Factor Breakdown' },
          { id: 'evidence', label: '3. Contextual Evidence Grounding' },
          { id: 'impact', label: '4. Social & Economic Impact' },
          { id: 'traceability', label: '5. Lineage & Traceability' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted hover:text-foreground hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WHY THIS PROPOSAL? (CIVIC DEMAND ROOTS) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Citizen Demand Submissions</span>
              <p className="text-3xl font-extrabold text-foreground mt-2">{traceabilityLineage?.demandsCount || 0}</p>
              <p className="text-xs text-muted mt-1">Directly related citizen complaints registered</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Thematic Aggregations</span>
              <p className="text-3xl font-extrabold text-foreground mt-2">{traceabilityLineage?.themesCount || 0}</p>
              <p className="text-xs text-muted mt-1">Clustered semantic recurring patterns</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Demand Hotspots</span>
              <p className="text-3xl font-extrabold text-foreground mt-2">{traceabilityLineage?.hotspotsCount || 0}</p>
              <p className="text-xs text-muted mt-1">Geographic high-density clusters</p>
            </Card>
          </div>

          {/* Related Demands */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Connected Citizen Voices ({proposal.relatedDemandIds?.length || 0})
              </CardTitle>
            </CardHeader>
            {proposal.relatedDemandIds && proposal.relatedDemandIds.length > 0 ? (
              <div className="space-y-3">
                {proposal.relatedDemandIds.map((demand: any) => (
                  <div key={demand._id || demand} className="p-4 rounded-lg bg-background border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{demand.title || 'Civic Demand'}</h4>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          demand.urgency === 'CRITICAL' || demand.urgency === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {demand.urgency} URGENCY
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-foreground uppercase">
                          {demand.language || 'en'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-1">{demand.demandStatement || demand.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No direct single demands linked. Linked by category and municipal spatial radius.</p>
            )}
          </Card>

          {/* Target Groups & Dependencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold uppercase text-muted mb-3">Target Demographic Cohorts</h3>
              <div className="flex flex-wrap gap-2">
                {proposal.targetGroups?.map((tg: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                    👥 {tg}
                  </span>
                )) || <span className="text-xs text-gray-400">General population</span>}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold uppercase text-muted mb-3">Project Execution Dependencies</h3>
              <div className="flex flex-wrap gap-2">
                {proposal.dependencies?.map((dep: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                    ⚙️ {dep}
                  </span>
                )) || <span className="text-xs text-gray-400">No external dependencies specified</span>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PRIORITY FACTOR BREAKDOWN (PHASE 4) */}
      {activeTab === 'priority' && (
        <div className="space-y-6">
          {/* Executive Summary & Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-50/20">
              <h3 className="text-sm font-bold uppercase text-emerald-800 mb-2">⭐ Top Positive Scoring Drivers</h3>
              <ul className="space-y-2 text-xs text-foreground">
                {priority?.explanation?.topStrengths?.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                )) || <li>Balanced multidimensional factors.</li>}
              </ul>
            </Card>

            <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/20">
              <h3 className="text-sm font-bold uppercase text-amber-800 mb-2">⚠️ Key Score Limitations</h3>
              <ul className="space-y-2 text-xs text-foreground">
                {priority?.explanation?.limitations?.map((l: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{l}</span>
                  </li>
                )) || <li>No severe constraints identified.</li>}
              </ul>
            </Card>
          </div>

          {/* Factor Contribution Chart */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Transparent Factor Contribution to Overall Priority ({priority?.totalScore || 0}/100)
              </CardTitle>
              <p className="text-xs text-muted">
                Each bar illustrates the exact calculated mathematical contribution (+points) and normalized dimension score (0-100).
              </p>
            </CardHeader>
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      name === 'Contribution' ? `+${value} pts to final score` : `${value}/100`,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="Contribution" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Score Contribution (+pts)" />
                  <Bar dataKey="Normalized Score" fill="#cbd5e1" radius={[0, 4, 4, 0]} name="Normalized Dimension (0-100)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Comprehensive Factors Table */}
          <Card className="p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-foreground mb-3">Auditable Priority Factors Formula</h3>
            <table className="min-w-full text-xs text-left border">
              <thead className="bg-gray-100 text-foreground font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Factor Dimension</th>
                  <th className="py-2.5 px-3">Observed Raw Value</th>
                  <th className="py-2.5 px-3 text-center">Normalized (0-100)</th>
                  <th className="py-2.5 px-3 text-center">Configured Weight</th>
                  <th className="py-2.5 px-3 text-right">Contribution (+pts)</th>
                  <th className="py-2.5 px-3">Auditable Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {priority?.factors && Object.entries(priority.factors).map(([key, f]: [string, any]) => (
                  <tr key={key} className="hover:bg-background">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{f.label}</td>
                    <td className="py-2.5 px-3 font-mono text-muted">{String(f.rawValue)}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-indigo-700">{f.normalizedValue}/100</td>
                    <td className="py-2.5 px-3 text-center font-mono">{(f.weight * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{f.contribution.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-muted italic max-w-xs truncate">{f.explanation || 'Calculated via deterministic pipeline'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-background font-bold border-t">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right text-gray-800">Total Deterministic Priority Score:</td>
                  <td className="py-3 px-3 text-right text-base text-indigo-700">{priority?.totalScore || 0} / 100</td>
                  <td className="py-3 px-3 text-xs text-muted">Sum of (Normalized × Weight)</td>
                </tr>
              </tfoot>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 3: CONTEXTUAL EVIDENCE GROUNDING (PHASE 3) */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Documented Public Evidence Corroboration</h3>
            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full font-semibold">
              {priority?.evidenceIds?.length || 0} Records Found
            </span>
          </div>

          {priority?.evidenceIds && priority.evidenceIds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priority.evidenceIds.map((ev: any) => {
                const isSupporting = ev.evidenceType === 'SUPPORTING';
                const isContradicting = ev.evidenceType === 'CONTRADICTING';
                const isInsufficient = ev.evidenceType === 'INSUFFICIENT_DATA';

                return (
                  <Card key={ev._id} className="p-5 border bg-surface border-border shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-foreground">{ev.indicator}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSupporting ? 'bg-emerald-100 text-emerald-800' :
                          isContradicting ? 'bg-red-100 text-red-800' :
                          isInsufficient ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ev.evidenceType}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-foreground mb-1">{ev.relationship}</p>
                      <p className="text-xs text-muted leading-relaxed">{ev.explanation}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-[11px] text-gray-400">
                      <span>Source: <strong>{ev.source || 'Public Portal'}</strong></span>
                      <span>Confidence: <strong>{ev.confidence}/10</strong></span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted">
              No specific evidence records linked to this proposal yet. Public datasets (OSM amenities, roads, wards) are factored in dynamically.
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: SOCIAL & ECONOMIC IMPACT (PHASE 5) */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          {/* Social vs Economic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-50/40 to-white border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">Social Impact Valuation</h3>
                  <p className="text-xs text-muted">Multi-criteria citizen welfare & equity enhancement</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-600">{impact?.socialImpactScore || 0}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {impact?.socialFactors && Object.entries(impact.socialFactors).map(([key, f]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-medium">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${f.normalizedValue}%` }}></div>
                      </div>
                      <span className="font-bold text-gray-800 w-8 text-right">{f.normalizedValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50/40 to-white border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-950">Economic Impact Valuation</h3>
                  <p className="text-xs text-muted">Evidence-grounded productivity & efficiency (Zero false precision)</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    impact?.economicImpactLevel === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                    impact?.economicImpactLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-foreground'
                  }`}>
                    {impact?.economicImpactLevel || 'NOT_AVAILABLE'} TIER
                  </span>
                  {impact?.economicImpactScore && (
                    <span className="block text-2xl font-black text-blue-600 mt-1">{impact.economicImpactScore}/100</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {impact?.economicFactors && Object.entries(impact.economicFactors).map(([key, f]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-medium">{f.label}</span>
                    {f.status === 'CALCULATED' ? (
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {f.normalizedValue}/100
                      </span>
                    ) : (
                      <span className="text-gray-400 font-mono text-[10px] bg-background px-1.5 py-0.5 rounded">
                        NOT_AVAILABLE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Scenario Estimates */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Catchment Scenario Projections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Conservative Scenario</span>
                <p className="text-2xl font-black text-gray-800 mt-2">
                  ~{impact?.scenarios?.conservative?.beneficiaries?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-muted mt-1">{impact?.scenarios?.conservative?.description}</p>
                <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-foreground rounded">
                  {impact?.scenarios?.conservative?.economicBenefitLevel} ECONOMIC TIER
                </span>
              </div>

              <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-200">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Baseline Scenario</span>
                <p className="text-2xl font-black text-indigo-900 mt-2">
                  ~{impact?.scenarios?.baseline?.beneficiaries?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-indigo-800 mt-1">{impact?.scenarios?.baseline?.description}</p>
                <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded">
                  {impact?.scenarios?.baseline?.economicBenefitLevel} ECONOMIC TIER
                </span>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Optimistic Scenario</span>
                <p className="text-2xl font-black text-emerald-900 mt-2">
                  ~{impact?.scenarios?.optimistic?.beneficiaries?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-emerald-800 mt-1">{impact?.scenarios?.optimistic?.description}</p>
                <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded">
                  {impact?.scenarios?.optimistic?.economicBenefitLevel} ECONOMIC TIER
                </span>
              </div>
            </div>
          </Card>

          {/* Uncertainty & Assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold uppercase text-foreground">Uncertainty Drivers</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  impact?.uncertainty === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                  impact?.uncertainty === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {impact?.uncertainty} UNCERTAINTY
                </span>
              </div>
              <ul className="space-y-2 text-xs text-muted">
                {impact?.uncertaintyReasons?.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                )) || <li>Sufficient empirical evidence available.</li>}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold uppercase text-foreground mb-3">Key Model Assumptions</h3>
              <ul className="space-y-2 text-xs text-muted">
                {impact?.assumptions?.map((a: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">→</span>
                    <span>{a}</span>
                  </li>
                )) || <li>Standard municipal execution assumptions apply.</li>}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: LINEAGE & TRACEABILITY */}
      {activeTab === 'traceability' && (
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-bold text-foreground">
                End-to-End Decision Support Lineage
              </CardTitle>
              <p className="text-xs text-muted">
                Full auditable provenance chain from citizen intake to municipal development proposal prioritization.
              </p>
            </CardHeader>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-background rounded-xl border">
              <div className="text-center p-3 bg-surface border-border rounded-lg border shadow-xs w-full md:w-44">
                <span className="text-2xl block mb-1">🗣️</span>
                <span className="text-[11px] font-bold uppercase text-gray-400 block">Citizen Voices</span>
                <span className="text-sm font-bold text-gray-800">{traceabilityLineage?.demandsCount || 0} Demands</span>
              </div>
              <span className="text-gray-400 font-bold hidden md:inline">→</span>
              
              <div className="text-center p-3 bg-surface border-border rounded-lg border shadow-xs w-full md:w-44">
                <span className="text-2xl block mb-1">🧠</span>
                <span className="text-[11px] font-bold uppercase text-gray-400 block">Themes & Hotspots</span>
                <span className="text-sm font-bold text-gray-800">{traceabilityLineage?.themesCount || 0} Themes</span>
              </div>
              <span className="text-gray-400 font-bold hidden md:inline">→</span>

              <div className="text-center p-3 bg-surface border-border rounded-lg border shadow-xs w-full md:w-44">
                <span className="text-2xl block mb-1">📊</span>
                <span className="text-[11px] font-bold uppercase text-gray-400 block">Public Datasets</span>
                <span className="text-sm font-bold text-gray-800">{traceabilityLineage?.evidenceRecordsCount || 0} Records</span>
              </div>
              <span className="text-gray-400 font-bold hidden md:inline">→</span>

              <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200 shadow-xs w-full md:w-44">
                <span className="text-2xl block mb-1">🏛️</span>
                <span className="text-[11px] font-bold uppercase text-indigo-600 block">Proposal Priority</span>
                <span className="text-sm font-bold text-indigo-900">{priority?.totalScore || 0}/100 (Rank #{proposal.priorityRank || '-'})</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
