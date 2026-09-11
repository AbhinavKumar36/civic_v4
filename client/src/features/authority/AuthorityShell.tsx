import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { DemandList } from './DemandList';
import { DemandDetail } from './DemandDetail';
import { ThemesView } from './ThemesView';
import { HotspotsView } from './HotspotsView';

export const AuthorityShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'demands' | 'themes' | 'hotspots'>('themes');
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    if (selectedDemandId) {
      return <DemandDetail demandId={selectedDemandId} onBack={() => setSelectedDemandId(null)} />;
    }
    
    switch (activeView) {
      case 'themes':
        return <ThemesView />;
      case 'hotspots':
        return <HotspotsView />;
      case 'demands':
      default:
        return <DemandList onSelect={setSelectedDemandId} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold text-primary mb-8">Authority Portal</h2>
        <nav className="flex-1 space-y-2">
          <Button 
            variant={activeView === 'themes' && !selectedDemandId ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => { setActiveView('themes'); setSelectedDemandId(null); }}
          >
            Thematic Intelligence
          </Button>
          <Button 
            variant={activeView === 'hotspots' && !selectedDemandId ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => { setActiveView('hotspots'); setSelectedDemandId(null); }}
          >
            Demand Hotspots
          </Button>
          <Button 
            variant={activeView === 'demands' && !selectedDemandId ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => { setActiveView('demands'); setSelectedDemandId(null); }}
          >
            Raw Demands
          </Button>
        </nav>
        <div className="pt-4 border-t">
          <p className="text-sm mb-2 text-gray-600">Role: {user?.role}</p>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};
