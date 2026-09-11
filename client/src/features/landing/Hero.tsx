import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { CityScene } from './CityScene';
import { ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden bg-background">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 8, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <CityScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Radial Gradient overlay to blend with edges */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07110D_100%)] opacity-80" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pointer-events-auto">
        <div className="max-w-3xl mt-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI FOR CLEANER, SMARTER CITIES
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            <span className="block text-foreground">See a Problem.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
              Make a Difference.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed mb-10"
          >
            Civic Pulse connects citizens, authorities and field workers through AI to identify, prioritize and resolve civic issues — faster, smarter, together.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-primary text-background font-bold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-lg shadow-[0_0_30px_rgba(24,182,106,0.3)] hover:shadow-[0_0_40px_rgba(24,182,106,0.5)]"
            >
              Report an Issue <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#intelligence"
              className="px-8 py-4 bg-surface/50 backdrop-blur-md border border-border text-foreground font-bold rounded-full hover:bg-surface transition-all flex items-center justify-center gap-2 text-lg"
            >
              Explore Civic Intelligence
            </a>
          </motion.div>

        </div>

        {/* Floating HUD Elements */}
        <div className="hidden lg:block absolute right-8 top-1/3 space-y-6">
          <HUDCard value="47" label="Active Hotspots" delay={0.6} />
          <HUDCard value="94%" label="AI Verification Accuracy" delay={0.7} />
          <HUDCard value="2.3 days" label="Avg. Resolution" delay={0.8} />
        </div>

      </div>
    </section>
  );
};

const HUDCard = ({ value, label, delay }: { value: string, label: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-surface/40 backdrop-blur-xl border border-border p-4 rounded-2xl flex items-center gap-4 w-64 shadow-2xl"
  >
    <div className="p-3 bg-primary/10 rounded-xl text-primary">
      <Activity className="w-5 h-5" />
    </div>
    <div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted uppercase tracking-wider font-semibold">{label}</div>
    </div>
  </motion.div>
);
