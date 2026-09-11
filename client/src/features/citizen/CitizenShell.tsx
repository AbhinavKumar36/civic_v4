import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const CitizenShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold text-primary mb-8">Citizen Portal</h2>
        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start">Overview</Button>
          <Button variant="ghost" className="w-full justify-start">My Civic Inputs</Button>
          <Button variant="ghost" className="w-full justify-start">Submit Idea</Button>
          <Button variant="ghost" className="w-full justify-start">Notifications</Button>
        </nav>
        <div className="pt-4 border-t">
          <p className="text-sm mb-2">Phone: {user?.phone}</p>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, Citizen!</h1>
        <p className="text-gray-600">This is the Phase 0 foundation. Civic demand submission and tracking will be implemented here in future phases.</p>
      </main>
    </div>
  );
};
