import React from 'react';

const steps = [
  {
    title: 'Observe',
    description: 'Capture behavioral signals across product interactions, decision points, and engagement patterns.'
  },
  {
    title: 'Infer',
    description: 'Translate those signals into psychographic indicators such as motivation, cognitive style, hesitation, and decision friction.'
  },
  {
    title: 'Adapt',
    description: 'Trigger real-time changes to messaging, pacing, prompts, trust cues, and interface emphasis.'
  },
  {
    title: 'Measure',
    description: 'Track product outcomes, explain intervention logic, and monitor governance and user-quality signals.'
  }
];

export default function LandingHowItWorksSection() {
  return (
    <section className="py-24 md:py-28 bg-[#050505] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06),transparent_55%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 inline-block mb-6">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">A simple operating model for adaptive products</h2>
          <p className="text-lg text-gray-400">
            Lead with mechanism before outcomes: knXw observes behavior, infers context, activates changes, and helps teams measure what happened.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="text-sm font-mono text-cyan-400 mb-4">0{index + 1}</div>
              <h3 className="text-2xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}