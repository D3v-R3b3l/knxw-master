import React from 'react';
import { motion } from 'framer-motion';

export default function PlatformFeatures() {
  return (
    <section id="platform" className="py-20 md:py-24 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center">
           <span className="text-cyan-500 font-mono text-sm uppercase tracking-[0.2em] mb-4 block">Infrastructure</span>
           <h2 className="text-5xl md:text-7xl font-bold mb-8">Complete Intelligence Platform</h2>
           <p className="text-xl text-gray-400">From tracking to activation, everything you need for psychographic intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[minmax(200px,auto)]">
          {/* Large Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-[#111] rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-colors relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-6 text-blue-500">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">Psychographic Profiling</h3>
              <p className="text-gray-400 text-lg max-w-md">Automatically generate psychological profiles revealing motivations and personality traits.</p>
              <span className="inline-block mt-6 text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-300">ALL PLANS</span>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          </motion.div>

          {/* Medium Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-4 bg-[#111] rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 text-purple-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">GameDev Intelligence</h3>
            <p className="text-sm text-gray-400 mb-4">Player motivation, adaptive difficulty, and churn prediction for games.</p>
            <span className="text-xs font-bold text-purple-400">GROWTH+</span>
          </motion.div>

          {/* Medium Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
             className="md:col-span-4 bg-[#111] rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-colors"
          >
             <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center mb-4 text-green-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Market Intelligence</h3>
            <p className="text-sm text-gray-400 mb-4">Analyze competitors and trends through a psychographic lens.</p>
            <span className="text-xs font-bold text-green-400">PRO</span>
          </motion.div>

           {/* Large Card */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-[#111] rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-colors relative overflow-hidden group"
          >
            <div className="relative z-10">
               <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center mb-6 text-orange-500">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">Developer Platform</h3>
              <p className="text-gray-400 text-lg max-w-md">RESTful APIs, SDKs, webhooks, and playground for rapid integration.</p>
              <span className="inline-block mt-6 text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-300">FREE TIER</span>
            </div>
             <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-orange-600/10 to-transparent pointer-events-none" />
          </motion.div>
          
          {/* Other features */}
          <motion.div className="md:col-span-6 bg-[#111] rounded-3xl p-8 border border-white/10">
             <h3 className="text-xl font-bold mb-2">Content Engine</h3>
             <p className="text-gray-400 text-sm">Auto-recommend content based on unique psychological profiles.</p>
          </motion.div>
          <motion.div className="md:col-span-6 bg-[#111] rounded-3xl p-8 border border-white/10">
             <h3 className="text-xl font-bold mb-2">AI Automation</h3>
             <p className="text-gray-400 text-sm">Deploy intelligent agents for personalized engagements.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}