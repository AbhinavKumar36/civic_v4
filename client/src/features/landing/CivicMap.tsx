import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Info, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const hotspots = [
  { id: 1, x: 20, y: 30, type: 'Road Damage', title: 'POTHOLE', location: 'Sahadev Nagar', priority: 'HIGH PRIORITY', color: '#FF3B30', reports: 3, conf: 91 },
  { id: 2, x: 70, y: 40, type: 'Waste', title: 'WASTE ACCUMULATION', location: 'Sector 4', priority: 'MEDIUM PRIORITY', color: '#FF9500', reports: 5, conf: 88 },
  { id: 3, x: 45, y: 70, type: 'Water', title: 'WATERLOGGING', location: 'MG Road', priority: 'CRITICAL', color: '#007AFF', reports: 12, conf: 95 },
  { id: 4, x: 80, y: 80, type: 'Resolved', title: 'STREETLIGHT FIXED', location: 'Kalyan Vihar', priority: 'RESOLVED', color: '#34C759', reports: 1, conf: 99 },
];

export const CivicMap = () => {
  const navigate = useNavigate();
  const [activeSpot, setActiveSpot] = useState<number | null>(1);

  return (
    <section id="intelligence" className="py-24 bg-surface relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              LIVE CIVIC INTELLIGENCE
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight"
            >
              From Complaints<br/>to Cleaner Communities
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted mb-8"
            >
              See how Civic Pulse transforms individual reports into city-wide intelligence. Hotspots are automatically identified, prioritized, and dispatched to the right field workers.
            </motion.p>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/public')}
              className="px-6 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-background transition-colors flex items-center gap-2"
            >
              <Map className="w-5 h-5" /> View Live Map &rarr;
            </motion.button>
          </div>

          {/* Right Map Simulation */}
          <div className="lg:col-span-7 relative h-[500px] w-full rounded-3xl bg-[#0a120e] border border-border overflow-hidden shadow-2xl">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'linear-gradient(#18B66A 1px, transparent 1px), linear-gradient(90deg, #18B66A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {/* Map lines/roads (Simulated) */}
            <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
              <path d="M0,100 Q200,150 400,50 T800,200" fill="none" stroke="#18B66A" strokeWidth="2" />
              <path d="M200,0 L300,500" fill="none" stroke="#18B66A" strokeWidth="1" />
              <path d="M500,0 L450,500" fill="none" stroke="#18B66A" strokeWidth="1" />
            </svg>

            {/* Hotspots */}
            {hotspots.map((spot) => (
              <div 
                key={spot.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onMouseEnter={() => setActiveSpot(spot.id)}
              >
                <div className="relative">
                  <div className="w-4 h-4 rounded-full z-10 relative shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: spot.color }} />
                  <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: spot.color }} />
                </div>
              </div>
            ))}

            {/* Active Info Card */}
            <AnimatePresence>
              {activeSpot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-2xl"
                >
                  {hotspots.map(spot => spot.id === activeSpot && (
                    <div key={spot.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">{spot.location}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: `${spot.color}20`, color: spot.color }}>
                          {spot.priority}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-foreground mb-4">{spot.title}</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted"><ShieldAlert className="w-4 h-4" /> Similar Reports</span>
                          <span className="font-bold text-foreground">{spot.reports}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted"><Info className="w-4 h-4" /> AI Confidence</span>
                          <span className="font-bold text-primary">{spot.conf}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
