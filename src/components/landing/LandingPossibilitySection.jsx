import React from 'react';

const possibilities = [
  'Experiences that respond to why a user is acting, not just what they clicked',
  'Systems that reduce decision friction without relying on blunt segmentation',
  'Interfaces that adapt to cognitive style, hesitation, trust needs, and motivational state',
  'Products that become materially more relevant, responsive, and behavior-aware'
];

export default function LandingPossibilitySection() {
  return (
    <section className="py-24 md:py-28 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            What Changes Once This Layer Exists
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">One mechanism. Many consequences.</h2>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
            knXw is not universal because it lists many industries. It is universal because the same intelligence layer can change how any digital system senses, interprets, and responds to human behavior.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {possibilities.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/90">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}