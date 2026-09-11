import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Network, LocateFixed } from 'lucide-react';
import { LocationMarker } from './LocationMarker';
export interface HotspotCluster {
  cluster_id: string;
  category_archetype: string;
  sub_category_archetype: string;
  centroid: { lat: number, lng: number };
  priority_score: number;
  assigned_to?: string | null;
}

interface DashboardMapProps {
  hotspots: HotspotCluster[];
  onDispatchClick?: (clusterId: string) => void;
}

const ICONS = {
  infrastructure: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  sanitation: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  traffic: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 21v-2"/><path d="M17 21v-2"/><path d="M7 11h10"/><path d="M9 7h6"/></svg>`,
  safety: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  noise: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
};

const getIconHtml = (category: string, color: string) => {
  const catLower = category.toLowerCase();
  let iconSvg = ICONS.safety;
  if (catLower.includes('infrastructure')) iconSvg = ICONS.infrastructure;
  else if (catLower.includes('sanitation')) iconSvg = ICONS.sanitation;
  else if (catLower.includes('traffic') || catLower.includes('transport')) iconSvg = ICONS.traffic;
  else if (catLower.includes('noise')) iconSvg = ICONS.noise;

  return `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; background: radial-gradient(circle, ${color}90 0%, ${color}00 70%); filter: blur(4px); transform: scale(1.5);"></div>
      <div style="position: relative; background-color: ${color}20; border: 1.5px solid ${color}; color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color}80, inset 0 0 10px ${color}40; z-index: 10; backdrop-filter: blur(4px);">
        ${iconSvg}
      </div>
    </div>
  `;
}

export function DashboardMap({ hotspots, onDispatchClick }: DashboardMapProps) {
  const [locateTrigger, setLocateTrigger] = useState(0);

  return (
    <div className="relative w-full h-full">
      {/* Locate Me */}
      <div className="absolute bottom-10 right-6 z-[1000] flex flex-col items-end gap-4">
        <button 
          onClick={() => setLocateTrigger(prev => prev + 1)}
          className="w-12 h-12 rounded-full bg-[#0b0e14] border border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.35)] flex items-center justify-center text-muted hover:text-foreground hover:scale-105 transition-all group relative"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 blur-md pointer-events-none"></div>
          <LocateFixed size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      <MapContainer 
        center={[20.296, 85.824]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
          className="map-tiles-dark"
        />
        
        <LocationMarker locateTrigger={locateTrigger} />
        
        {hotspots.map(spot => {
          const color = spot.priority_score > 80 ? '#ef4444' : spot.priority_score > 40 ? '#f59e0b' : '#3b82f6';
          
          const customIcon = L.divIcon({
            html: getIconHtml(spot.category_archetype, color),
            className: 'custom-div-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          });
          
          return (
            <Marker 
              key={spot.cluster_id}
              position={[spot.centroid.lat, spot.centroid.lng]} 
              icon={customIcon}
            >
              <Popup className="civic-popup custom-dark-popup" closeButton={false}>
                <div className="bg-[#0b0e14]/95 backdrop-blur-md text-foreground p-5 rounded-2xl border border-border shadow-2xl min-w-[280px] font-sans">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-[10px] font-black tracking-widest px-2 py-1 rounded uppercase bg-white/10" style={{ color: color }}>
                      {spot.priority_score > 80 ? 'CRITICAL PRIORITY' : spot.priority_score > 40 ? 'HIGH PRIORITY' : 'LOW PRIORITY'}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-4 leading-tight">{spot.sub_category_archetype}</h3>
                  
                  <div className="flex items-start gap-2 text-muted text-xs font-mono mb-4">
                    <MapPin size={14} className="mt-0.5" />
                    <div>
                      <p>Lat: {spot.centroid.lat.toFixed(4)}</p>
                      <p>Lng: {spot.centroid.lng.toFixed(4)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-border">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm font-semibold truncate" title={spot.category_archetype}>{spot.category_archetype}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-border">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Reported At</p>
                      <p className="text-sm font-semibold">12:34 pm</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl p-3 text-xs font-medium flex items-center gap-2 mb-4">
                    <Network size={14} /> Route calculated via dispatch node.
                  </div>

                  {onDispatchClick && (
                    <button 
                      onClick={() => !spot.assigned_to && onDispatchClick(spot.cluster_id)}
                      disabled={!!spot.assigned_to}
                      className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                        spot.assigned_to 
                          ? 'bg-[#1E1E1E] text-green-400 border border-green-500/20 shadow-none cursor-default'
                          : 'bg-[#1E1E1E] hover:bg-white/10 text-foreground border border-border shadow-black/50'
                      }`}
                    >
                      {spot.assigned_to ? 'Live Details' : 'Dispatch Unit'}
                    </button>
                  )}
                  
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}


