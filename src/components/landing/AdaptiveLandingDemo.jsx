import React, { useState } from 'react';
import { PsychographicProvider, AdaptiveText, AdaptiveButton, usePsychographic } from '@/components/sdk/KnxwSDK';
import { Sparkles, ChevronRight, Brain, RefreshCw } from 'lucide-react';

const PERSONAS = [
  {
    key: 'achiever',
    label: 'Achiever',
    emoji: '🏆',
    color: 'cyan',
    profile: {
      motivation_labels: ['achievement', 'mastery'],
      risk_profile: 'aggressive',
      cognitive_style: 'analytical',
      emotional_state: { mood: 'confident', confidence_score: 0.91 },
      personality_traits: { openness: 0.8, conscientiousness: 0.9, extraversion: 0.6 }
    }
  },
  {
    key: 'explorer',
    label: 'Explorer',
    emoji: '🔭',
    color: 'purple',
    profile: {
      motivation_labels: ['curiosity', 'autonomy'],
      risk_profile: 'moderate',
      cognitive_style: 'creative',
      emotional_state: { mood: 'excited', confidence_score: 0.75 },
      personality_traits: { openness: 0.95, conscientiousness: 0.55, extraversion: 0.7 }
    }
  },
  {
    key: 'cautious',
    label: 'Pragmatist',
    emoji: '🛡️',
    color: 'emerald',
    profile: {
      motivation_labels: ['security', 'reliability'],
      risk_profile: 'conservative',
      cognitive_style: 'systematic',
      emotional_state: { mood: 'neutral', confidence_score: 0.65 },
      personality_traits: { openness: 0.4, conscientiousness: 0.88, extraversion: 0.35 }
    }
  },
  {
    key: 'social',
    label: 'Connector',
    emoji: '🤝',
    color: 'pink',
    profile: {
      motivation_labels: ['belonging', 'collaboration'],
      risk_profile: 'moderate',
      cognitive_style: 'intuitive',
      emotional_state: { mood: 'positive', confidence_score: 0.82 },
      personality_traits: { openness: 0.7, conscientiousness: 0.65, extraversion: 0.92 }
    }
  },
];

const colorMap = {
  cyan:    { ring: 'ring-cyan-500',    bg: 'bg-cyan-500/15',    text: 'text-cyan-300',    border: 'border-cyan-500/40',    dot: 'bg-cyan-400'    },
  purple:  { ring: 'ring-purple-500',  bg: 'bg-purple-500/15',  text: 'text-purple-300',  border: 'border-purple-500/40',  dot: 'bg-purple-400'  },
  emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40', dot: 'bg-emerald-400' },
  pink:    { ring: 'ring-pink-500',    bg: 'bg-pink-500/15',    text: 'text-pink-300',    border: 'border-pink-500/40',    dot: 'bg-pink-400'    },
};

function AdaptiveHeroContent({ persona }) {
  const { profile } = usePsychographic();
  const c = colorMap[persona.color];

  return (
    <div className="transition-all duration-500">
      {/* Adaptive headline */}
      <div className="mb-3">
        <span className={`text-xs font-mono uppercase tracking-widest ${c.text} opacity-80`}>
          Rendering for: {persona.emoji} {persona.label}
        </span>
      </div>

      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug transition-all duration-500">
        <AdaptiveText
          baseText="Understand Every User. Instantly."
          motivationVariants={{
            achievement: "Turn Performance Into Mastery.",
            mastery:     "Turn Performance Into Mastery.",
            curiosity:   "Discover What Drives Your Users.",
            autonomy:    "Intelligence That Works Your Way.",
            security:    "Reliable Intelligence. Zero Guesswork.",
            reliability: "Reliable Intelligence. Zero Guesswork.",
            belonging:   "Build Products People Actually Love.",
            collaboration: "Build Products People Actually Love.",
          }}
        />
      </h3>

      <p className="text-gray-400 text-sm leading-relaxed mb-6 transition-all duration-500">
        <AdaptiveText
          baseText="Psychographic AI that reveals motivations and personalizes every experience."
          motivationVariants={{
            achievement: "Optimize for peak performance. Identify what drives your highest-value users and double down.",
            mastery:     "Optimize for peak performance. Identify what drives your highest-value users and double down.",
            curiosity:   "Explore the full psychological landscape of your audience with rich, real-time profiling.",
            autonomy:    "Plug in anywhere. Full API access, custom dimensions, and no-lock-in architecture.",
            security:    "Enterprise-grade reliability. GDPR-compliant, auditable, and transparently explainable.",
            reliability: "Enterprise-grade reliability. GDPR-compliant, auditable, and transparently explainable.",
            belonging:   "Connect your entire team to shared user intelligence. Collaborate, not just analyze.",
            collaboration: "Connect your entire team to shared user intelligence. Collaborate, not just analyze.",
          }}
        />
      </p>

      {/* Adaptive CTA */}
      <AdaptiveButton
        baseText="Get Started"
        motivationVariants={{
          achievement:   "Unlock Peak Performance →",
          mastery:       "Unlock Peak Performance →",
          curiosity:     "Explore the Platform →",
          autonomy:      "Start Building →",
          security:      "See How It Works →",
          reliability:   "See How It Works →",
          belonging:     "Join the Community →",
          collaboration: "Join the Community →",
        }}
        riskVariants={{
          aggressive:   "Start Free — Scale Fast →",
          moderate:     "Try It Free →",
          conservative: "Book a Demo →",
        }}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold ${c.bg} ${c.text} border ${c.border} transition-all duration-500 cursor-pointer`}
      />

      {/* Live trait display */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {[
          { label: 'Motivation',  value: profile?.motivation_labels?.[0] || '—' },
          { label: 'Mood',        value: profile?.emotional_state?.mood || '—' },
          { label: 'Risk',        value: profile?.risk_profile || '—' },
          { label: 'Cognition',   value: profile?.cognitive_style || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
            <div className={`text-xs font-semibold capitalize ${c.text}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdaptiveLandingDemo() {
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);

  return (
    <section className="py-20 md:py-28 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.04),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-5">
            Live Demo
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The Proof Is In The Pudding
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            This page is already using our Adaptive UI SDK. Switch personas below and watch the copy adapt in real time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          {/* Left: Persona Switcher */}
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Select a visitor persona</p>
            <div className="space-y-3">
              {PERSONAS.map((p) => {
                const c = colorMap[p.color];
                const isActive = activePersona.key === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setActivePersona(p)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 text-left ${
                      isActive
                        ? `${c.bg} ${c.border} ring-1 ${c.ring}`
                        : 'bg-white/3 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? c.text : 'text-white'}`}>{p.label}</div>
                      <div className="text-xs text-gray-500 capitalize mt-0.5">
                        {p.profile.motivation_labels.join(' · ')} · {p.profile.risk_profile}
                      </div>
                    </div>
                    {isActive && (
                      <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-gray-600">
              <RefreshCw className="w-3 h-3" />
              <span>Powered by <code className="text-cyan-600">&lt;AdaptiveText&gt;</code> + <code className="text-cyan-600">&lt;AdaptiveButton&gt;</code></span>
            </div>
          </div>

          {/* Right: Adaptive Content Preview */}
          <div className={`relative rounded-2xl border ${colorMap[activePersona.color].border} bg-gradient-to-br from-[#0f0f0f] to-[#151515] p-8 transition-all duration-500 overflow-hidden`}>
            {/* Corner label */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center gap-1.5 text-[10px] font-mono ${colorMap[activePersona.color].text} ${colorMap[activePersona.color].bg} px-2.5 py-1 rounded-full border ${colorMap[activePersona.color].border}`}>
                <Sparkles className="w-3 h-3" />
                ADAPTIVE
              </div>
            </div>

            <PsychographicProvider mockMode mockProfile={activePersona.profile}>
              <AdaptiveHeroContent persona={activePersona} />
            </PsychographicProvider>
          </div>
        </div>

        {/* SDK hint */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            3 components. Zero backend calls.{' '}
            <span className="text-cyan-600 cursor-pointer hover:text-cyan-400 transition-colors">
              View the SDK docs →
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}