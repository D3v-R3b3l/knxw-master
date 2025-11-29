import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Target, Activity, Globe, Lock, Smartphone } from 'lucide-react';

const BentoCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 overflow-hidden hover:bg-white/[0.05] transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

export default function FeatureBento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Main Large Card - 4 cols */}
      <BentoCard className="md:col-span-4 min-h-[300px] relative group">
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Psychographic Intelligence</h3>
            <p className="text-gray-400 max-w-md">
              Go beyond demographics. Our AI analyzes behavioral patterns to construct accurate psychological profiles in real-time, revealing motivation, risk tolerance, and cognitive style.
            </p>
          </div>
          <div className="mt-8 flex gap-2">
            {['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].map((trait, i) => (
              <span key={trait} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                {trait}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
      </BentoCard>

      {/* Tall Card - 2 cols */}
      <BentoCard className="md:col-span-2 md:row-span-2 min-h-[300px] flex flex-col" delay={0.1}>
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Adaptive UX</h3>
        <p className="text-gray-400 mb-6 flex-grow">
          Automatically modify your interface based on user psychology. Show social proof to validation-seekers, and data specs to analytical minds.
        </p>
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="h-2 w-20 bg-white/10 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="h-2 w-16 bg-white/10 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="h-2 w-24 bg-white/10 rounded-full" />
          </div>
        </div>
      </BentoCard>

      {/* Medium Card - 2 cols */}
      <BentoCard className="md:col-span-2" delay={0.2}>
        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 text-green-400">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Privacy First</h3>
        <p className="text-sm text-gray-400">
          GDPR & CCPA compliant. Data is anonymized and encrypted at rest.
        </p>
      </BentoCard>

      {/* Medium Card - 2 cols */}
      <BentoCard className="md:col-span-2" delay={0.3}>
        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 text-orange-400">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Precision Targeting</h3>
        <p className="text-sm text-gray-400">
          Create segments based on psychological traits, not just clicks.
        </p>
      </BentoCard>

      {/* Wide Card - 3 cols */}
      <BentoCard className="md:col-span-3" delay={0.4}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-pink-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Real-time Ingestion</h3>
            <p className="text-sm text-gray-400">
              Sub-100ms latency from event to insight. Process millions of events without performance impact on your client apps.
            </p>
          </div>
        </div>
      </BentoCard>

      {/* Wide Card - 3 cols */}
      <BentoCard className="md:col-span-3" delay={0.5}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-cyan-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Universal SDK</h3>
            <p className="text-sm text-gray-400">
              Drop-in support for React, Vue, React Native, and vanilla JS. Single line of code to start tracking.
            </p>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}