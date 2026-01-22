import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const sectionData = [
  { id: 'hero', label: 'Home' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'features', label: 'Architecture' },
  { id: 'platform', label: 'Platform' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'demo-section', label: 'Demo' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'stats', label: 'Stats' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'cta', label: 'Get Started' },
];

export default function SectionNavDots() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show after scrolling past hero
      setIsVisible(scrollY > windowHeight * 0.5);

      // Find active section
      const sections = sectionData.map(s => document.getElementById(s.id)).filter(Boolean);
      
      let currentIndex = 0;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionMiddle = rect.top + rect.height / 2;
        if (sectionMiddle < windowHeight * 0.6) {
          currentIndex = index;
        }
      });
      
      setActiveIndex(currentIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : -20 
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-0"
    >
      {/* Vertical line container */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        
        {/* Active progress line */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-cyan-400 via-teal-400 to-cyan-400 rounded-full"
          style={{
            top: 0,
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.6), 0 0 24px rgba(6, 182, 212, 0.3)',
          }}
          animate={{
            height: `${((activeIndex + 1) / sectionData.length) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Dots */}
        <div className="relative flex flex-col gap-5 py-2">
          {sectionData.map((section, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            const isHovered = hoveredIndex === index;

            return (
              <div key={section.id} className="relative flex items-center">
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.9 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0, 
                    x: isHovered ? 0 : -10,
                    scale: isHovered ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-8 whitespace-nowrap px-3 py-1.5 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg text-xs font-medium text-white pointer-events-none"
                >
                  {section.label}
                  {/* Arrow */}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/90 border-l border-b border-white/10 rotate-45" />
                </motion.div>

                {/* Dot button */}
                <motion.button
                  onClick={() => scrollToSection(section.id)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative w-4 h-4 flex items-center justify-center cursor-pointer group"
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Outer glow ring for active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-cyan-400/20"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  
                  {/* Dot */}
                  <motion.div
                    className="rounded-full"
                    animate={{
                      width: isActive ? 10 : isPast ? 6 : 5,
                      height: isActive ? 10 : isPast ? 6 : 5,
                      backgroundColor: isActive 
                        ? '#06b6d4' 
                        : isPast 
                          ? '#14b8a6' 
                          : 'rgba(255,255,255,0.25)',
                      boxShadow: isActive 
                        ? '0 0 12px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4)' 
                        : isPast
                          ? '0 0 8px rgba(20, 184, 166, 0.5)'
                          : 'none',
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section counter */}
      <motion.div
        className="mt-4 text-[10px] font-mono text-white/40 tracking-wider"
        key={activeIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {String(activeIndex + 1).padStart(2, '0')}/{String(sectionData.length).padStart(2, '0')}
      </motion.div>
    </motion.div>
  );
}