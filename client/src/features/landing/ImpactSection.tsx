import { motion } from 'framer-motion';
import { BarChart3, Zap, ShieldCheck } from 'lucide-react';

export const ImpactSection = () => {
  return (
    <section id="impact" className="py-24 bg-background relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-foreground leading-tight"
          >
            Better Data.<br/>
            <span className="text-primary">Faster Decisions.</span><br/>
            Real-World Change.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-surface p-10 rounded-3xl border border-border group hover:border-primary/30 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Smarter Cities</h3>
            <p className="text-muted leading-relaxed">
              Data-driven understanding of civic problems. Move from reactive guesswork to proactive, intelligent urban planning.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-surface p-10 rounded-3xl border border-border group hover:border-primary/30 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Faster Response</h3>
            <p className="text-muted leading-relaxed">
              Prioritize what matters most and allocate resources intelligently using our MILP-based optimization engine.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-surface p-10 rounded-3xl border border-border group hover:border-primary/30 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Accountable Action</h3>
            <p className="text-muted leading-relaxed">
              Track work from citizen report to verified resolution. AI checks before-and-after evidence to ensure work is actually done.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
