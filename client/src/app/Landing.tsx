import React from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate(user.role === 'AUTHORITY' ? '/authority' : '/citizen');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold tracking-tight text-primary">CIVIC PULSE</h1>
        <Button onClick={handleCTA} variant="outline">
          {user ? 'Go to Dashboard' : 'Login / Register'}
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-5xl font-extrabold mb-4">Cleaner Cities. Brighter Tomorrow.</h2>
        <p className="text-xl max-w-2xl text-gray-600 dark:text-gray-300 mb-8">
          Consolidating the Voice of the Many into the Decisions of the Few. Civic Pulse transforms collective citizen demand into evidence-backed development priorities.
        </p>
        <div className="flex gap-4">
          <Button size="lg" onClick={handleCTA}>Get Started</Button>
          <Button size="lg" variant="secondary">Learn More</Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl opacity-80 text-sm font-medium">
          <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800">Voice &rarr;</div>
          <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800">Demand &rarr;</div>
          <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800">Evidence &rarr;</div>
          <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800">Priority &rarr;</div>
          <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800">Action</div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm border-t">
        <p>&copy; {new Date().getFullYear()} Civic Pulse. PEOPLE • PLACES • PROGRESS</p>
      </footer>
    </div>
  );
};
