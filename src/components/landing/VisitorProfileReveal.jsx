import React, { useState } from 'react';
import { useLandingProfile } from './LandingPsychographicContext';
import { Sparkles, ChevronUp, ChevronDown, Brain, Zap, Target, Heart, Activity } from 'lucide-react';

const moodEmoji = { confident: '😎', positive: '😊', neutral: '😐', uncertain: '🤔', anxious: '😰', excited: '🤩' };
const riskLabel = { aggressive: 'High Intent', moderate: 'Evaluating', conservative: 'Research Phase' };
const cogLabel = { analytical: 'Analytical', intuitive: 'Intuitive', systematic: 'Systematic', creative: 'Creative' };

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-gray-500">{pct}%</span>
    </div>
  );
}

export default function VisitorProfileReveal() {
  const { profile, confidence } = useLandingProfile();
  const [open, setOpen] = useState(false);

  // Don't show until we have meaningful data
  if (!profile || confidence < 0.1) return null;

  const mood = profile.emotional_state?.mood || 'neutral';
  const motivations = profile.motivation_labels?.slice(0, 2) || [];

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-xs">
      {/* Collapsed chip */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 bg-[#0f0f0f]/95 backdrop-blur-xl border border-cyan-500/30 rounded-full px-4 py-2.5 text-sm text-white shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all duration-300 group"
        >
          <div className="relative">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60" />
          </div>
          <span className="font-mono text-xs text-cyan-400">knXw</span>
          <span className="text-gray-400 text-xs">is profiling you</span>
          <ChevronUp className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition-colors" />
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="bg-[#0f0f0f]/98 backdrop-blur-xl border border-cyan-500/25 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.12)] overflow-hidden w-72">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60" />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">LIVE VISITOR PROFILE</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Inference Confidence</span>
              </div>
              <ConfidenceBar value={confidence} />
            </div>

            {/* Key traits */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Intent</span>
                </div>
                <div className="text-xs font-semibold text-white capitalize">{riskLabel[profile.risk_profile] || 'Evaluating'}</div>
              </div>

              <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                <div className="flex items-center gap-1.5 mb-1">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Style</span>
                </div>
                <div className="text-xs font-semibold text-white">{cogLabel[profile.cognitive_style] || '—'}</div>
              </div>

              <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart className="w-3 h-3 text-pink-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Mood</span>
                </div>
                <div className="text-xs font-semibold text-white capitalize">
                  {moodEmoji[mood] || '😐'} {mood}
                </div>
              </div>

              <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Drive</span>
                </div>
                <div className="text-xs font-semibold text-white capitalize">
                  {motivations[0] || 'Exploring'}
                </div>
              </div>
            </div>

            {/* Motivations */}
            {motivations.length > 0 && (
              <div>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Detected Motivations</div>
                <div className="flex flex-wrap gap-1.5">
                  {motivations.map(m => (
                    <span key={m} className="text-[11px] px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-full capitalize font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What changed note */}
            <div className="pt-1 border-t border-white/5">
              <div className="flex items-start gap-2">
                <Activity className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  This page is adapting its headlines, CTAs, and feature emphasis in real time based on your browsing behavior — powered by knXw's Adaptive UI SDK.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}