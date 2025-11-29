import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Statement = ({ text, index }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.4"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.1, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["10px", "0px"]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, x, filter: blur }}
      className="flex items-baseline gap-6 md:gap-12 group"
    >
      <span className="font-mono text-sm text-cyan-500/50 pt-2 md:pt-6">0{index}</span>
      <h2 className="text-4xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl group-hover:text-cyan-50 transition-colors duration-500">
        {text}
      </h2>
    </motion.div>
  );
};

export default function ReasonSection() {
  return (
    <section className="py-32 md:py-64 bg-black relative overflow-hidden">
      {/* Interactive Noise Background */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay">
         <svg className='w-full h-full'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#noise)'/></svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-32 md:gap-48">
        <Statement index={1} text="Software is deaf to context." />
        <Statement index={2} text="Data is blind to humanity." />
        
        <div className="relative">
          <Statement index={3} text="Experiences feel dead." />
          
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-24 mb-24"
          />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center"
          >
             <p className="text-xl md:text-3xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
               knXw is the <span className="text-white font-medium">bridge</span>. <br />
               Fixing the broken relationship between <span className="text-cyan-400">humans</span> and <span className="text-purple-400">machines</span>.
             </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}