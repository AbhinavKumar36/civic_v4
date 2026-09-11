import { motion } from 'framer-motion';
import { Cpu, MessageSquare, ArrowRight, Check } from 'lucide-react';

export const AIIntelligence = () => {
  return (
    <section className="py-24 bg-background relative z-10 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Cpu className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
          >
            AI That Understands the City
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted"
          >
            Messy, unstructured citizen reports are instantly translated into clean, categorized, and prioritized data.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-5xl mx-auto">
          
          {/* Input Report */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-96 bg-surface p-6 rounded-3xl border border-border relative"
          >
            <div className="flex items-center gap-3 mb-4 text-muted">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Citizen Voice Report</span>
            </div>
            <p className="text-lg text-foreground italic leading-relaxed">
              "There is a huge pothole near the college gate on MG Road. Several bikes have fallen here over the last two days."
            </p>
          </motion.div>

          {/* Transformation Arrow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden lg:flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/30"
          >
            <ArrowRight className="w-6 h-6 text-primary" />
          </motion.div>

          {/* AI Output */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-full lg:w-[450px] bg-[#0A120E] p-6 rounded-3xl border border-primary/30 shadow-[0_0_50px_rgba(24,182,106,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex items-center gap-3 mb-6 text-primary">
              <Cpu className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Structured Intelligence</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-3 rounded-xl border border-border">
                  <div className="text-xs text-muted font-bold mb-1">CATEGORY</div>
                  <div className="text-sm text-foreground font-semibold">Road Infrastructure</div>
                </div>
                <div className="bg-background/50 p-3 rounded-xl border border-border">
                  <div className="text-xs text-muted font-bold mb-1">SUBCATEGORY</div>
                  <div className="text-sm text-foreground font-semibold">Pothole</div>
                </div>
                <div className="bg-background/50 p-3 rounded-xl border border-red-500/20">
                  <div className="text-xs text-red-400 font-bold mb-1">SEVERITY</div>
                  <div className="text-sm text-foreground font-semibold">HIGH</div>
                </div>
                <div className="bg-background/50 p-3 rounded-xl border border-primary/20">
                  <div className="text-xs text-primary font-bold mb-1">CONFIDENCE</div>
                  <div className="text-sm text-foreground font-semibold">91%</div>
                </div>
              </div>

              <div className="bg-background/50 p-4 rounded-xl border border-border mt-4">
                <div className="text-xs text-muted font-bold mb-3">VERIFIED EVIDENCE</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary" /> Road damage detected
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary" /> Active vehicle hazard
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary" /> Public location confirmed
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
