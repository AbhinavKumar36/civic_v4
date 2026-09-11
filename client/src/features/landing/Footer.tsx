import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background py-12 border-t border-border relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(24,182,106,0.3)] bg-white/5">
              <img src="/logo-pulse.png" alt="Civic Pulse Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <div className="font-bold text-foreground text-lg tracking-tight">CIVIC PULSE</div>
              <div className="text-sm text-muted">Cleaner Cities. Brighter Tomorrow.</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted">
            <Link to="/public" className="hover:text-primary transition-colors">Platform</Link>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-primary transition-colors">Impact</a>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>

        </div>
        
        <div className="mt-12 text-center text-xs text-muted/50">
          &copy; {new Date().getFullYear()} Civic Pulse. A Civic Tech Initiative.
        </div>
      </div>
    </footer>
  );
};
