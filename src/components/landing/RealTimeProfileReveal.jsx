import React, { useState, useEffect } from 'react';
import { usePsychographic } from '@/components/sdk/KnxwSDK';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronUp, ChevronDown, User, Activity, Zap } from 'lucide-react';

export default function RealTimeProfileReveal() {
  const { profile, loading } = usePsychographic();
  const [isOpen, setIsOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (profile && (profile.motivation_labels?.length > 0 || profile.risk_profile)) {
      setHasProfile(true);
      // Auto-open briefly when profile is first detected to draw attention
      if (!hasProfile) {
        setIsOpen(true);
        const timer = setTimeout(() => setIsOpen(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [profile]);

  if (loading || !hasProfile) return null;

  const riskColor = {
    conservative: 'text-blue-400',
    moderate: 'text-yellow-400',
    aggressive: 'text-red-400'
  }[profile.risk_profile] || 'text-gray-400';

  const moodColor = {
    positive: 'text-green-400',
    neutral: 'text-gray-400',
    negative: 'text-red-400',
    excited: 'text-purple-400',
    anxious: 'text-orange-400',
    confident: 'text-blue-400',
    uncertain: 'text-yellow-400'
  }[profile.emotional_state?.mood] || 'text-gray-400';

  return (
    <div className="fixed bottom-4 left-4 z-50 font-sans">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#111]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 w-72 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Live Profiling</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Inferred Motivation</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.motivation_labels?.slice(0, 3).map(m => (
                    <span key={m} className="text-xs bg-white/10 px-2 py-1 rounded-md text-white capitalize border border-white/5">
                      {m}
                    </span>
                  )) || <span className="text-xs text-gray-500 italic">Analyzing...</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Risk</span>
                  </div>
                  <div className={`text-sm font-semibold capitalize ${riskColor}`}>
                    {profile.risk_profile || 'Unknown'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Mood</span>
                  </div>
                  <div className={`text-sm font-semibold capitalize ${moodColor}`}>
                    {profile.emotional_state?.mood || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-[10px] text-gray-600 leading-tight">
                  This panel is visible to show you the live data. Real deployments typically adapt silently.
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg hover:border-cyan-500/50 transition-all duration-300"
          >
            <div className="relative">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">
              Profile Active
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}