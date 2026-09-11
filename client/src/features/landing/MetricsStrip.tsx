import { motion } from 'framer-motion';

const metrics = [
  { value: '1,284+', label: 'Citizen Reports' },
  { value: '47', label: 'Active Hotspots' },
  { value: '892', label: 'Issues Resolved' },
  { value: '2.3 days', label: 'Avg. Resolution Time' },
];

export const MetricsStrip = () => {
  return (
    <section className="bg-surface-light border-y border-border py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <div className="text-3xl md:text-5xl font-bold text-foreground mb-2">
                {metric.value}
              </div>
              <div className="text-sm md:text-base font-semibold text-muted uppercase tracking-wider">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
