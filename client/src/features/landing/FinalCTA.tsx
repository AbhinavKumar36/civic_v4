import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-background relative z-10 overflow-hidden border-t border-border">
      
      {/* Background Radar / Pulse Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[800px] h-[800px] border border-primary rounded-full absolute animate-[ping_10s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="w-[600px] h-[600px] border border-primary rounded-full absolute animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="w-[400px] h-[400px] border border-primary rounded-full absolute animate-[ping_6s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="w-[200px] h-[200px] border border-primary bg-primary/10 rounded-full absolute" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold text-foreground mb-8"
        >
          Your City Is Speaking.<br/>
          <span className="text-primary">Are We Listening?</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted mb-12 max-w-2xl mx-auto"
        >
          Report an issue. Track the response. Help build a better city.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-5 bg-primary text-background font-bold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-lg shadow-[0_0_30px_rgba(24,182,106,0.3)] hover:shadow-[0_0_40px_rgba(24,182,106,0.5)] w-full sm:w-auto"
          >
            Report an Issue <ArrowRight className="w-5 h-5" />
          </button>
          <a 
            href="#intelligence"
            className="px-10 py-5 bg-transparent border border-border text-foreground font-bold rounded-full hover:bg-surface transition-all flex items-center justify-center gap-2 text-lg w-full sm:w-auto"
          >
            Explore Civic Pulse
          </a>
        </motion.div>
      </div>
    </section>
  );
};
