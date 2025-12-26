import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Gamepad2, TrendingUp, Code, FileText, Bot, AlertTriangle, Sliders } from 'lucide-react';

export default function PlatformFeatures() {
  return (
    <section id="platform" className="py-24 md:py-32 bg-[#050505] text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.04),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
           <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
              Platform
           </span>
           <h2 className="text-4xl md:text-6xl font-bold mb-6">Complete Intelligence Platform</h2>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto">From tracking to activation, everything you need for psychographic intelligence</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
          {/* Large Card - Psychographic Profiling */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden group"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-600/10 flex items-center justify-center mb-6 border border-blue-500/20">
                 <Brain className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Psychographic Profiling</h3>
              <p className="text-gray-400 text-lg max-w-lg leading-relaxed">Automatically generate psychological profiles revealing motivations, cognitive styles, and personality traits.</p>
              <span className="inline-block mt-6 text-xs font-mono bg-white/5 px-4 py-2 rounded-full text-gray-400 border border-white/10">ALL PLANS</span>
            </div>
          </motion.div>

          {/* Medium Card - GameDev */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-600/10 flex items-center justify-center mb-5 border border-purple-500/20">
                 <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">GameDev Intelligence</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Player motivation, adaptive difficulty, and churn prediction for games.</p>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">GROWTH+</span>
            </div>
          </motion.div>

          {/* Medium Card - Market Intelligence */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-600/10 flex items-center justify-center mb-5 border border-emerald-500/20">
                 <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Market Intelligence</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">Analyze competitors and trends through a psychographic lens.</p>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">PRO</span>
            </div>
          </motion.div>

          {/* Large Card - Developer Platform */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-8 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600/30 to-orange-600/10 flex items-center justify-center mb-6 border border-orange-500/20">
                 <Code className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Developer Platform</h3>
              <p className="text-gray-400 text-lg max-w-lg leading-relaxed">RESTful APIs, SDKs, webhooks, and playground for rapid integration.</p>
              <span className="inline-block mt-6 text-xs font-mono bg-white/5 px-4 py-2 rounded-full text-gray-400 border border-white/10">FREE TIER</span>
            </div>
          </motion.div>
          
          {/* Other features - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="md:col-span-6 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Content Engine</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Auto-recommend content based on unique psychological profiles.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-6 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-pink-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0 border border-pink-500/20">
                <Bot className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI Automation</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Deploy intelligent agents for personalized engagements.</p>
              </div>
            </div>
          </motion.div>

          {/* New Advanced Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-yellow-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Cognitive Bias Detection</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Identify anchoring, confirmation, and loss aversion biases.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-rose-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                <TrendingUp className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Emotional Shift Tracking</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Monitor subtle emotional changes with volatility analysis.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="md:col-span-4 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Custom Dimensions</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Define industry-specific psychographic traits and metrics.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}