import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { SubmitNeed } from './SubmitNeed';
import { SubmissionHistory } from './SubmissionHistory';
import { ProfileDashboard } from './ProfileDashboard';

export const CitizenShell: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <header className="bg-surface border-border dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary">Civic Pulse - Citizen</div>
          <nav className="space-x-4 flex items-center">
            <Link to="/citizen" className="text-muted hover:text-foreground dark:text-gray-300">Dashboard</Link>
            <Link to="/citizen/submit" className="text-muted hover:text-foreground dark:text-gray-300">Submit Need</Link>
            <Link to="/citizen/history" className="text-muted hover:text-foreground dark:text-gray-300">History</Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ProfileDashboard />} />
          <Route path="/submit" element={<SubmitNeed />} />
          <Route path="/history" element={<SubmissionHistory />} />
        </Routes>
      </main>
    </div>
  );
};
