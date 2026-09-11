import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Intelligence', href: '#intelligence' },
    { name: 'Impact', href: '#impact' },
    { name: 'About', href: '/about' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-xl border-b border-primary/20 py-3 shadow-lg' 
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(24,182,106,0.3)] bg-white/5">
              <img src="/logo.png" alt="Civic Pulse Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="font-bold text-xl tracking-tight flex gap-1">
              <span className="text-foreground">CIVIC</span>
              <span className="text-primary group-hover:text-primary-container transition-colors">PULSE</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-bold text-foreground border border-border rounded-full hover:bg-surface transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-bold bg-primary text-background rounded-full hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(24,182,106,0.3)] hover:shadow-[0_0_25px_rgba(24,182,106,0.5)] flex items-center gap-2"
            >
              Get Started <span>&rarr;</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-24 px-4 flex flex-col md:hidden">
          <div className="flex flex-col gap-6 items-center text-lg">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 text-center font-bold border border-border rounded-xl"
              >
                Login
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 text-center font-bold bg-primary text-background rounded-xl"
              >
                Get Started &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
