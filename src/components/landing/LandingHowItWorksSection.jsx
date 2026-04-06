import React from 'react';

const steps = [
  {
    title: 'Sense',
    description: 'Capture the behavioral and interaction signal your product already generates, the instrumented trace of how people move through it.'
  },
  {
    title: 'Infer',
    description: 'Interpret what that signal means: motivation, hesitation, cognitive load, decision posture, risk orientation. Not what happened, what it indicates.'
  },
  {
    title: 'Adapt',
    description: 'Enable the system to respond to live decision context, adjusting messaging, pacing, interface logic, and experience flow in real time.'
  },
  {
    title: 'Govern',
    description: 'Ensure every adaptation remains visible, explainable, and constrained. Intelligence without accountability is not infrastructure. It is drift.'
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
          <p className="text-lg text-gray-400">
            Sense, infer, adapt, and govern in one runtime layer.
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