import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ThemesView: React.FC = () => {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [themeDetail, setThemeDetail] = useState<any | null>(null);

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/intelligence/themes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setThemes(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processIntelligence = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/v1/intelligence/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchThemes();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const fetchThemeDetail = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/v1/intelligence/themes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setThemeDetail(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    if (selectedThemeId) {
      fetchThemeDetail(selectedThemeId);
    } else {
      setThemeDetail(null);
    }
  }, [selectedThemeId]);

  if (loading) return <div>Loading themes...</div>;

  if (themeDetail) {
    const { theme, demands } = themeDetail;
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="outline" onClick={() => setSelectedThemeId(null)}>← Back to Themes</Button>
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{theme.name}</h2>
            <span className={`px-2 py-1 text-xs font-bold rounded ${
              theme.recurrenceStatus === 'RECURRING' ? 'bg-purple-100 text-purple-800' :
              theme.recurrenceStatus === 'EMERGING' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {theme.recurrenceStatus}
            </span>
          </div>
          <p className="text-foreground text-lg mb-6">{theme.summary}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div className="bg-background p-3 rounded">
              <span className="block text-muted font-semibold mb-1">Category</span>
              {theme.category}
            </div>
            <div className="bg-background p-3 rounded">
              <span className="block text-muted font-semibold mb-1">Total Demands</span>
              {theme.demandCount}
            </div>
            <div className="bg-background p-3 rounded">
              <span className="block text-muted font-semibold mb-1">Unique Citizens</span>
              {theme.uniqueCitizenCount}
            </div>
            <div className="bg-background p-3 rounded">
              <span className="block text-muted font-semibold mb-1">Coherence</span>
              {(theme.coherenceScore * 100).toFixed(1)}%
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Language Distribution</h3>
            <div className="flex gap-4">
              {Object.entries(theme.languageDistribution || {}).map(([lang, count]: any) => (
                <div key={lang} className="text-sm">
                  <span className="font-semibold">{lang}:</span> {count}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Associated Demands</h3>
            <div className="space-y-3">
              {demands?.map((d: any) => (
                <div key={d._id} className="p-3 border rounded bg-surface border-border text-sm">
                  <p className="font-semibold text-gray-800 mb-1">{d.title}</p>
                  <p className="text-muted">{d.demandStatement}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thematic Intelligence</h2>
        <Button onClick={processIntelligence} disabled={processing}>
          {processing ? 'Processing Intelligence...' : 'Run Intelligence Pipeline'}
        </Button>
      </div>

      {themes.length === 0 ? (
        <p className="text-muted">No themes generated yet. Run the intelligence pipeline.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map(theme => (
            <Card key={theme._id} className="p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedThemeId(theme._id)}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-foreground uppercase">
                    {theme.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    theme.recurrenceStatus === 'RECURRING' ? 'bg-purple-100 text-purple-800' :
                    theme.recurrenceStatus === 'EMERGING' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {theme.recurrenceStatus}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{theme.name}</h3>
                <p className="text-sm text-muted line-clamp-3">{theme.summary}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-muted">
                <span>{theme.demandCount} demands</span>
                <span>{theme.uniqueCitizenCount} citizens</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
