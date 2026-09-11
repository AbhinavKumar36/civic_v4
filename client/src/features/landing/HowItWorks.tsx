import { motion } from 'framer-motion';
import { FileText, Brain, MapPin, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'REPORT',
    desc: 'Submit issues with text, image or voice in seconds.',
  },
  {
    icon: Brain,
    title: 'AI ANALYSIS',
    desc: 'Automatically detect category, severity, location and supporting evidence.',
  },
  {
    icon: MapPin,
    title: 'PRIORITIZE & ASSIGN',
    desc: 'Identify hotspots, calculate priority and optimally assign field workers.',
  },
  {
    icon: CheckCircle2,
    title: 'TRACK IMPACT',
    desc: 'Monitor progress, verify resolutions and measure real civic impact.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
          >
            A Smarter Way to Build Better Cities
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted"
          >
            Civic Pulse turns scattered civic complaints into structured, actionable intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -10 }}
              className="bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] hover:border-primary/30 p-8 rounded-[2rem] transition-all group shadow-lg hover:shadow-[0_0_30px_rgba(24,182,106,0.1)] backdrop-blur-xl"
            >
              <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 tracking-wide">{step.title}</h3>
              <p className="text-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
