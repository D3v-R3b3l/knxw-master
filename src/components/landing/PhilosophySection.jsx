import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function PhilosophySection() {
  const container = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={container} className="py-20 md:py-32 bg-black relative overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-4xl md:text-8xl font-bold text-white tracking-tighter leading-[1] md:leading-[0.9] mb-8 md:mb-12 break-words">
              From Data to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Understanding</span>
            </h2>
            
            <div className="space-y-8 text-xl text-gray-400 font-light leading-relaxed">
              <p>
                Redefine engagement across every domain: marketing becomes intuitive, education adapts to every learner, communication grows more empathetic, and decision-making becomes informed by understanding rather than assumption.
              </p>
            </div>
          </div>

          <motion.div style={{ y }} className="space-y-6">
            <div className="p-8 bg-[#111] rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-2">The Limits</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Demographics tell you who, not why</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Clickstreams show actions, not intent</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Traditional analytics can't decode motivation</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-white mb-2">The knXw Advantage</h3>
              <ul className="space-y-4 text-gray-300">
                 <li className="flex items-center gap-3"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Translate behavior into understanding</li>
                 <li className="flex items-center gap-3"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Understand cognitive styles and core motivations</li>
                 <li className="flex items-center gap-3"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Clear reasoning behind every insight</li>
                 <li className="flex items-center gap-3"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span>Direct recommendations for engagement</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}