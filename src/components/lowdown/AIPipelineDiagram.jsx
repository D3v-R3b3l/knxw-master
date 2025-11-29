import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Brain, Zap, CheckCircle } from 'lucide-react';

const Layer = ({ icon: Icon, title, description, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`flex items-start gap-4 p-5 rounded-xl border-2 ${color.border} bg-[#111111] shadow-xl shadow-black/40`}
  >
    <div className={`p-3 rounded-lg bg-gradient-to-br ${color.gradient} self-start`}>
      <Icon className="w-6 h-6 text-black/80" />
    </div>
    <div>
      <h4 className="text-lg font-bold text-white">{title}</h4>
      <p className="text-sm text-[#a3a3a3] mt-1">{description}</p>
    </div>
  </motion.div>
);

const Arrow = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="h-10 w-px bg-gradient-to-b from-[#00d4ff]/0 via-[#00d4ff]/50 to-[#00d4ff]/0 my-2"
  />
);

const colors = {
  cyan: { border: 'border-[#00d4ff]/40', gradient: 'from-[#00d4ff] to-[#0ea5e9]' },
  green: { border: 'border-[#10b981]/40', gradient: 'from-[#34d399] to-[#10b981]' },
  purple: { border: 'border-[#8b5cf6]/40', gradient: 'from-[#a78bfa] to-[#8b5cf6]' },
  pink: { border: 'border-[#ec4899]/40', gradient: 'from-[#f472b6] to-[#ec4899]' },
};

export default function AIPipelineDiagram() {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center my-8 p-4">
      <Layer 
        icon={Activity} 
        title="Event Windowing"
        description="Gathers recent user events into a behavioral snapshot for analysis."
        delay={0.2}
        color={colors.cyan}
      />
      <Arrow delay={0.5} />
      <Layer 
        icon={TrendingUp} 
        title="Heuristics & ML"
        description="Fast, low-cost analysis. Provides initial scores for engagement, risk, and cognitive style."
        delay={0.7}
        color={colors.green}
      />
      <Arrow delay={1.0} />
      <Layer 
        icon={Brain} 
        title="Deep Inference (LLM)"
        description="Triggered for ambiguity. Provides deep reasoning, nuance, and human-readable evidence."
        delay={1.2}
        color={colors.purple}
      />
      <Arrow delay={1.5} />
      <Layer 
        icon={Zap} 
        title="Profile Fusion Engine"
        description="Intelligently combines outputs from all layers, weighted by confidence, into a single unified profile."
        delay={1.7}
        color={colors.pink}
      />
       <Arrow delay={2.0} />
       <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 2.2 }}
        className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 rounded-full border border-[#10b981]/40"
       >
        <CheckCircle className="w-7 h-7 text-[#34d399]" />
        <span className="text-lg font-semibold text-white">Actionable Psychographic Profile</span>
       </motion.div>
    </div>
  );
}