import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface PortfolioPlanningViewProps {
  onPortfolioOptimized: (portfolio: any) => void;
}

export const PortfolioPlanningView: React.FC<PortfolioPlanningViewProps> = ({ onPortfolioOptimized }) => {
  const [maxBudget, setMaxBudget] = useState<number>(50000000); // Default 5 Crores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/portfolios/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: `Phase 6 Demo Portfolio - ₹${(maxBudget / 100000).toFixed(0)}L Budget`,
          constraints: {
            maxBudget,
            minWards: 2,
            categoryLimits: [
              { category: 'ROADS', maxCount: 2 },
              { category: 'HEALTHCARE', maxCount: 3 }
            ]
          }
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error.message);

      onPortfolioOptimized(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Optimization</h1>
          <p className="text-gray-500 mt-1">Constraint-aware capital allocation engine</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Constraints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Budget Limit (INR)
            </label>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              step="100000"
            />
            <p className="text-xs text-gray-500 mt-1">Current: ₹{(maxBudget / 100000).toFixed(2)} Lakhs</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Default Category Limits (Hardcoded for Demo)</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>ROADS: Max 2 projects</li>
              <li>HEALTHCARE: Max 3 projects</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Geographic Constraints</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Minimum Wards Covered: 2</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 border-t">
            <Button onClick={handleOptimize} disabled={loading} className="w-full">
              {loading ? 'Running Knapsack Optimizer...' : 'Generate Optimal Portfolio'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
