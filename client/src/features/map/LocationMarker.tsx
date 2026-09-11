import { useEffect, useState } from 'react';
import { CircleMarker, useMap, Popup } from 'react-leaflet';

export function LocationMarker({ locateTrigger }: { locateTrigger: number }) {
  const map = useMap();
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (locateTrigger > 0) {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
    }
  }, [locateTrigger, map]);

  return position ? (
    <>
      <CircleMarker 
        center={position} 
        radius={8} 
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
      >
        <Popup className="custom-popup bg-surface border-border text-foreground rounded p-2">
          You are here
        </Popup>
      </CircleMarker>
      <CircleMarker 
        center={position} 
        radius={24} 
        pathOptions={{ color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.2 }}
      />
    </>
  ) : null;
}


