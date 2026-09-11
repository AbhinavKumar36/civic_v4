import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { CheckCircle2, ShieldCheck, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfileDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Citizen Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 
              Identity Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-bold text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> VERIFIED
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-semibold text-gray-800">AADHAAR (e-KYC)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name</span>
              <span className="font-semibold text-gray-800">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-semibold text-gray-800">{user.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Submit a new civic need or check the status of your past submissions.
            </p>
            <div className="flex gap-4">
              <Link to="/citizen/submit" className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90">
                Submit Need
              </Link>
              <Link to="/citizen/history" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">
                View History
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
