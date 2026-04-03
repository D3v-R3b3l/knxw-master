import React from 'react';

const points = [
  'Explainable intervention logic',
  'Traceable adaptation decisions',
  'Governance-aware optimization',
  'Controls against manipulative drift'
];

export default function LandingGovernanceSection() {
  return (
    <section className="py-24 md:py-28 bg-[#050505] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_55%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 inline-block mb-6">
              Intelligence With Restraint
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Power without drift</h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
              Infrastructure requires accountability. Interventions must remain observable, explainable, and governable. Intelligence without accountability is not infrastructure. It is drift.
            </p>
          </div>

          <div className="grid gap-4">
            {points.map((point) => (
              <div key={point} className="rounded-2xl border border-white/10 bg-black/40 p-5 text-white/90">
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}