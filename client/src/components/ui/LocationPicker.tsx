import React, { useState } from 'react';
import { Button } from './Button';
import { MapPin } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(coords);
        onLocationSelect(coords);
        setLoading(false);
      },
      () => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    onLocationSelect(null);
  };

  return (
    <div className="flex items-center space-x-4">
      <Button type="button" variant="outline" onClick={handleGetLocation} disabled={loading}>
        <MapPin size={16} className="mr-2" />
        {loading ? 'Getting location...' : 'Use My Location'}
      </Button>
      {location && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <span>Location captured ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</span>
          <button type="button" onClick={clearLocation} className="text-red-500 hover:underline">Clear</button>
        </div>
      )}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
