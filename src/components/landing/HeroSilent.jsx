import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import HeroNeuralGraph from '@/components/visuals/HeroNeuralGraph';

export default function HeroSilent() {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  
  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-black">
      {/* 3D Graph Background */}
      <div className="absolute inset-0 z-0">
        <HeroNeuralGraph 
          nodeCount={180}
          distance={1500}
          palette={['#00d4ff', '#ffffff', '#a855f7']}
          orbitSpeed={0.05}
        />
      </div>

      {/* Atmospheric Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] z-10 pointer-events-none" />

      {/* Hero Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-20 h-full flex flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter mb-6 mix-blend-difference">
            The Universal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200">
              Intelligence Layer
            </span>
          </h1>
          
          <div className="h-px w-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-8 animate-expand-width" style={{ animation: 'expandWidth 1.5s ease-out forwards 0.5s' }} />
          <style>{`@keyframes expandWidth { to { width: 12rem; } }`}</style>

          <p className="text-xl md:text-3xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed mix-blend-plus-lighter">
            Infrastructure that <span className="text-white font-normal">thinks</span>.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll Prompt */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-white/30 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Initiate</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}