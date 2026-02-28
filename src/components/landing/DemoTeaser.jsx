import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, MousePointer } from 'lucide-react';
import { createPageUrl } from '@/utils';
import PredictiveFlowAnimation from './PredictiveFlowAnimation';

export default function DemoTeaser() {
  return (
    <section className="py-32 md:py-48 bg-black relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-cyan-900/10 rounded-full blur-[200px] pointer-events-none" />
      
      {/* Predictive Flow Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <PredictiveFlowAnimation />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-[3rem] blur-3xl" />
          
          <div className="relative p-12 md:p-20 rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-xl text-center overflow-hidden">
            {/* Animated particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-8"
              >
                <Sparkles className="w-20 h-20 text-cyan-400" strokeWidth={1} />
              </motion.div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                See Your Own Mind
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Experience knXw analyzing <em className="text-white not-italic">your</em> interaction patterns in real time. 
                Watch as it builds a psychographic snapshot of your cognitive state.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.location.href = createPageUrl('InteractiveDemo')}
                  className="group relative overflow-hidden inline-flex items-center gap-2 px-10 py-5 font-bold text-lg text-white rounded-lg transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
                    boxShadow: '0 0 35px rgba(0,212,255,0.35), 0 4px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  <Play className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110" />
                  Launch Interactive Demo
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.location.href = createPageUrl('Dashboard')}
                  className="inline-flex items-center gap-2 px-10 py-5 font-medium text-lg text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 transition-all duration-300"
                >
                  <MousePointer className="w-5 h-5" />
                  Start Building
                </motion.button>
              </div>

              <p className="text-sm text-gray-600 mt-8">
                No signup required • Live inference in your browser
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}