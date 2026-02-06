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
    { name: "Docs", href: "/Documentation" },
    { name: "Blog", href: "/Blog" },
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
        <button className="md:hidden relative text-white" style={{ zIndex: 10000 }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a] md:hidden"
            style={{ zIndex: 9999, height: '100vh', height: '100dvh', overflowY: 'auto' }}
          >
            {/* Gradient overlay effects - fixed */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" style={{ zIndex: 1 }} />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" style={{ zIndex: 1 }} />
            
            <div className="relative min-h-full flex flex-col px-6 py-20" style={{ zIndex: 2 }}>
              {/* Navigation Links */}
              <nav className="flex-1 flex flex-col justify-center gap-2 my-auto">
                {links.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      setIsOpen(false);
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(link.href);
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative py-4 px-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-cyan-500/30 hover:bg-white/10 transition-all"
                  >
                    <span className="text-xl font-light text-white group-hover:text-cyan-400 transition-colors tracking-wide">
                      {link.name}
                    </span>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </motion.a>
                ))}
              </nav>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 pt-6 border-t border-white/10"
              >
                {user ? (
                  <Link 
                    to={createPageUrl('Dashboard')} 
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-lg rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all"
                  >
                    Dashboard
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <button 
                      onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
                      className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-lg rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all"
                    >
                      Get Started
                    </button>
                    <button 
                      onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
                      className="w-full py-4 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 hover:border-white/40 transition-all"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}