import React from 'react';

const blocks = [
  {
    title: 'Where knXw sits',
    description: 'knXw sits between what your users do and what that behavior indicates.'
  },
  {
    title: 'What it reads',
    description: 'It reads live behavioral input, not what was clicked, but what that click signals about decision state.'
  },
  {
    title: 'What it enables',
    description: 'Applications can act on that interpretation through messaging, pacing, interface logic, and experience flow.'
  }
];

export default function LandingExplainerSection() {
  return (
    <section className="py-20 md:py-24 bg-black border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            The Missing Layer
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The Missing Layer
          </h2>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-4">
            knXw sits between what your users do and what that behavior indicates. It reads live behavioral input, not what was clicked, but what that click signals about decision state, and gives applications a runtime layer to act on that interpretation.
          </p>
          <p className="text-lg md:text-xl text-white leading-relaxed">
            This is not a feature. This is not a dashboard. It is a new class of infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blocks.map((block) => (
            <div key={block.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
              <h3 className="text-xl font-semibold text-white mb-3">{block.title}</h3>
              <p className="text-gray-400 leading-relaxed">{block.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}