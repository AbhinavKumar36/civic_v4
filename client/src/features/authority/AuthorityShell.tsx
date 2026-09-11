import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ProposalsListView } from './ProposalsListView';
import { ProposalDetailAnalysisView } from './ProposalDetailAnalysisView';
import { ProposalComparisonView } from './ProposalComparisonView';
import { DemandList } from './DemandList';
import { DemandDetail } from './DemandDetail';
import { ThemesView } from './ThemesView';
import { HotspotsView } from './HotspotsView';
import { PortfolioPlanningView } from './PortfolioPlanningView';
import { DecisionWorkspaceView } from './DecisionWorkspaceView';

export const AuthorityShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'proposals' | 'themes' | 'hotspots' | 'demands' | 'portfolio'>('proposals');
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [comparisonProposals, setComparisonProposals] = useState<any[] | null>(null);
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clearSelection = () => {
    setSelectedDemandId(null);
    setSelectedProposalId(null);
    setComparisonProposals(null);
    setCurrentPortfolioId(null);
  };

  const renderContent = () => {
    if (selectedProposalId) {
      return (
        <ProposalDetailAnalysisView 
          proposalId={selectedProposalId} 
          onBack={() => setSelectedProposalId(null)} 
        />
      );
    }

    if (currentPortfolioId) {
      return (
        <DecisionWorkspaceView
          portfolioId={currentPortfolioId}
          onDecisionComplete={() => {
            alert('Portfolio Approved and Decision Record Created Successfully!');
            setCurrentPortfolioId(null);
            setActiveView('proposals');
          }}
        />
      );
    }

    if (comparisonProposals) {
      return (
        <ProposalComparisonView 
          proposals={comparisonProposals} 
          onBack={() => setComparisonProposals(null)}
          onSelectProposal={(id) => {
            setComparisonProposals(null);
            setSelectedProposalId(id);
          }}
        />
      );
    }

    if (selectedDemandId) {
      return (
        <DemandDetail 
          demandId={selectedDemandId} 
          onBack={() => setSelectedDemandId(null)} 
        />
      );
    }
    
    switch (activeView) {
      case 'proposals':
        return (
          <ProposalsListView 
            onSelectProposal={setSelectedProposalId}
            onCompareProposals={setComparisonProposals}
          />
        );
      case 'themes':
        return <ThemesView />;
      case 'hotspots':
        return <HotspotsView />;
      case 'portfolio':
        return <PortfolioPlanningView onPortfolioOptimized={(p) => setCurrentPortfolioId(p._id)} />;
      case 'demands':
      default:
        return <DemandList onSelect={setSelectedDemandId} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-64 bg-surface border-r border-border p-4 flex flex-col flex-shrink-0">
        <h2 className="text-xl font-bold text-primary mb-6">Civic Pulse Authority</h2>
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          <Button 
            variant={activeView === 'proposals' && !selectedProposalId && !comparisonProposals ? 'default' : 'ghost'} 
            className="w-full justify-start font-semibold" 
            onClick={() => { setActiveView('proposals'); clearSelection(); }}
          >
            🏛️ Development Proposals
          </Button>
          <Button 
            variant={activeView === 'portfolio' && !currentPortfolioId ? 'default' : 'ghost'} 
            className="w-full justify-start font-semibold" 
            onClick={() => { setActiveView('portfolio'); clearSelection(); }}
          >
            📊 Portfolio Planning
          </Button>
          <Button 
            variant={activeView === 'themes' && !selectedDemandId && !selectedProposalId ? 'default' : 'ghost'} 
            className="w-full justify-start font-semibold" 
            onClick={() => { setActiveView('themes'); clearSelection(); }}
          >
            🧠 Thematic Intelligence
          </Button>
          <Button 
            variant={activeView === 'hotspots' && !selectedDemandId && !selectedProposalId ? 'default' : 'ghost'} 
            className="w-full justify-start font-semibold" 
            onClick={() => { setActiveView('hotspots'); clearSelection(); }}
          >
            🔥 Demand Hotspots
          </Button>
          <Button 
            variant={activeView === 'demands' && !selectedDemandId && !selectedProposalId ? 'default' : 'ghost'} 
            className="w-full justify-start font-semibold" 
            onClick={() => { setActiveView('demands'); clearSelection(); }}
          >
            📋 Raw Demands
          </Button>
        </nav>
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-semibold uppercase text-muted mb-1">Authenticated As</p>
          <p className="text-sm font-bold text-foreground mb-3">{user?.phone || user?.email} ({user?.role})</p>
          <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};
