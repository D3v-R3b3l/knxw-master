import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function VisionStatement() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0.3, 0.6], [0.8, 1.1]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="h-[150vh] bg-black relative flex items-center justify-center overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]" />
      
      <motion.div 
        style={{ scale, opacity, y }}
        className="relative z-10 max-w-7xl mx-auto px-6 text-center"
      >
        <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tighter mb-12 mix-blend-difference">
          When everything <br />
          understands <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300">why</span>,
          <br />
          efficiency becomes <br />
          <span className="italic font-serif font-light text-cyan-200/80">exponential.</span>
        </h2>

        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-24 mt-24 text-left md:text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Resources</div>
            <div className="text-2xl text-white">Optimized</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Friction</div>
            <div className="text-2xl text-white">Eliminated</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Trust</div>
            <div className="text-2xl text-white">Restored</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
         {[...Array(20)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute w-1 h-1 bg-white rounded-full"
             style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
             animate={{ scale: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
             transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 5 }}
           />
         ))}
      </div>
    </section>
  );
}