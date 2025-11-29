import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    base44.auth.me().then(setUser).catch(() => {});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: "Platform", href: "#platform" },
    { name: "Features", href: "#features" },
    { name: "Use Cases", href: "#use-cases" },
    { name: "Docs", href: "/Documentation" }, // Direct route
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white tracking-tighter relative z-50">
          knXw
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link to={createPageUrl('Dashboard')} className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
              Dashboard <ChevronRight className="inline w-4 h-4" />
            </Link>
          ) : (
            <>
              <button onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
                Sign In
              </button>
              <button onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden relative z-50 text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 h-screen bg-black flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {links.map(link => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white"
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-4 mt-8">
               <button onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} className="text-lg font-bold text-white">
                Sign In
              </button>
              <button onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} className="px-8 py-4 bg-white text-black font-bold rounded-full">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}