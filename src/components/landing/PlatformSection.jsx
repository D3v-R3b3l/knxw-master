import React from 'react';
import { Cpu, Layers, GitBranch, Shield } from 'lucide-react';

const pillars = [
  {
    icon: Cpu,
    title: 'Signal Ingestion',
    description: 'A lightweight SDK captures behavioral signals — pacing, friction, focus, scroll depth, and interaction sequences — without altering your product architecture.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    glow: 'rgba(6,182,212,0.08)',
  },
  {
    icon: Layers,
    title: 'Runtime Inference Engine',
    description: 'The inference layer converts raw signals into a live psychographic state: confidence, hesitation, motivation, risk posture, and cognitive style — updated per session.',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    glow: 'rgba(139,92,246,0.08)',
  },
  {
    icon: GitBranch,
    title: 'Adaptive Execution Layer',
    description: 'Your product reads the inferred state and adapts content, messaging, flows, and triggers in real time — while the session is still active and malleable.',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    glow: 'rgba(59,130,246,0.08)',
  },
  {
    icon: Shield,
    title: 'Governance & Observability',
    description: 'Every inference decision is logged, explainable, and auditable. Full compliance controls, role-based access, and transparent reasoning at every layer.',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'rgba(16,185,129,0.08)',
  },
];

export default function PlatformSection() {
  return (
    <section id="platform" className="py-24 md:py-32 bg-[#030303] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            Platform
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Four layers. One runtime intelligence system.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            knXw is not an analytics tool. It is an execution layer that sits between your product and the humans using it — reading decision state and acting on it in real time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`group relative rounded-3xl border ${pillar.border} bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-300`}
                style={{ boxShadow: `inset 0 0 60px ${pillar.glow}` }}
              >
                <div className="flex items-start gap-5">
                  <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border ${pillar.border} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-mono uppercase tracking-[0.22em] ${pillar.color} mb-2`}>0{i + 1}</div>
                    <h3 className="text-xl font-semibold text-white mb-3">{pillar.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}