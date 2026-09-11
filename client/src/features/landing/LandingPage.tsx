import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Workflow } from './Workflow';
import { AIIntelligence } from './AIIntelligence';
import { MetricsStrip } from './MetricsStrip';
import { ImpactSection } from './ImpactSection';
import { CivicMap } from './CivicMap';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <MetricsStrip />
        <Workflow />
        <AIIntelligence />
        <ImpactSection />
        <CivicMap />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};
