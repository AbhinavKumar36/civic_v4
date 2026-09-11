import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { WorkerDashboard } from './WorkerDashboard';

export const WorkerShell: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <header className="bg-surface border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary">Civic Pulse - Worker Portal</div>
          <nav className="space-x-4 flex items-center">
            <span className="text-muted text-sm mr-4 hidden sm:inline">Worker ID: {user?.phone}</span>
            <Link to="/worker" className="text-muted hover:text-foreground">Dashboard</Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<WorkerDashboard />} />
        </Routes>
      </main>
    </div>
  );
};
