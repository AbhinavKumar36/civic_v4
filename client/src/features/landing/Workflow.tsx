import { motion } from 'framer-motion';
import { User, MessageSquare, Brain, Map, AlertTriangle, GitMerge, HardHat, CheckCircle } from 'lucide-react';

const workflowSteps = [
  { icon: User, label: 'CITIZEN' },
  { icon: MessageSquare, label: 'REPORT' },
  { icon: Brain, label: 'AI ANALYSIS' },
  { icon: Map, label: 'INTELLIGENCE' },
  { icon: AlertTriangle, label: 'PRIORITY' },
  { icon: GitMerge, label: 'OPTIMIZATION' },
  { icon: HardHat, label: 'FIELD WORKER' },
  { icon: CheckCircle, label: 'RESOLUTION' },
];

export const Workflow = () => {
  return (
    <section className="py-24 bg-surface-light relative z-10 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
        >
          An End-to-End Civic Engine
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted mb-20 max-w-2xl mx-auto"
        >
          Not just a complaint app. Civic Pulse is a complete pipeline for urban resolution.
        </motion.p>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-0 relative z-10">
            {workflowSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col items-center group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 border ${
                  idx === 0 || idx === 7 
                    ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_20px_rgba(24,182,106,0.2)]' 
                    : 'bg-background border-border text-muted group-hover:text-foreground group-hover:border-primary/50'
                }`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted group-hover:text-foreground transition-colors">
                  {step.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
