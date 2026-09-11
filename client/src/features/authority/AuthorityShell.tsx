import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const AuthorityShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-8">Authority Dashboard</h2>
        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-gray-800">Overview</Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-gray-800">Demand Intelligence</Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-gray-800">Hotspots</Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-gray-800">Proposals</Button>
        </nav>
        <div className="pt-4 border-t border-gray-700">
          <p className="text-sm mb-2 text-gray-400">ID: {user?.phone}</p>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Authority Control Center</h1>
        <p className="text-gray-600">This is the Phase 0 foundation. Data fusion, portfolio optimization, and impact analysis will be implemented here in future phases.</p>
      </main>
    </div>
  );
};
