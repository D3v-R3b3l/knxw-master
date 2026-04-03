import React from 'react';

const points = [
  'Explainable intervention logic',
  'Traceable adaptation decisions',
  'Governance-aware optimization',
  'Controls against manipulative drift'
];

export default function LandingGovernanceSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#050505] py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05),transparent_58%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="mb-6 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
              Intelligence With Restraint
            </span>
            <h2 className="mb-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">Power without drift</h2>
            <p className="max-w-3xl text-lg leading-8 text-white/62 md:text-xl md:leading-9">
              Infrastructure requires accountability. Interventions must remain observable, explainable, and governable. Intelligence without accountability is not infrastructure. It is drift.
            </p>
          </div>

          <div className="grid gap-4">
            {points.map((point) => (
              <div key={point} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-white/84 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}