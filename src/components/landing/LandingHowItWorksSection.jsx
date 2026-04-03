import React from 'react';

const steps = [
  {
    title: 'Sense',
    description: 'Collect the interaction signal already moving through your product: behavior, pacing, friction, and sequence.'
  },
  {
    title: 'Infer',
    description: 'Convert that signal into a live interpretation of decision state: confidence, hesitation, intent, motivation, and risk posture.'
  },
  {
    title: 'Adapt',
    description: 'Feed that interpretation back into the system so the product can change what it says, shows, or does while the session is still active.'
  },
  {
    title: 'Govern',
    description: 'Keep every adaptation inspectable, explainable, and controlled so runtime intelligence remains operational infrastructure, not opaque behavior.'
  }
];

export default function LandingHowItWorksSection() {
  return (
    <section className="py-24 md:py-28 bg-[#050505] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06),transparent_55%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 inline-block mb-6">
            Runtime Loop
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">From behavioral signal to system action.</h2>
          <p className="text-lg text-gray-400">
            knXw turns live user behavior into interpretable runtime input your product can execute against.
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