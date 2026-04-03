import React from 'react';

const blocks = [
  {
    title: 'Interpretation layer',
    description: 'knXw sits between raw behavior and system response, turning observed activity into usable runtime meaning.'
  },
  {
    title: 'Live behavioral reading',
    description: 'It reads behavioral signal as decision context, not just as events to store or chart later.'
  },
  {
    title: 'System adaptation',
    description: 'Your product can use that interpretation to change messaging, pacing, flows, and interface behavior in real time.'
  }
];

export default function LandingExplainerSection() {
  return (
    <section className="py-20 md:py-24 bg-black border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            Runtime Positioning
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            knXw is the layer between behavior and execution.
          </h2>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-4">
            It takes the behavioral signal your product already generates, interprets what that signal means about the user’s decision state, and returns that understanding to the system while there is still time to act on it.
          </p>
          <p className="text-lg md:text-xl text-white leading-relaxed">
            Not analytics. Not segmentation. Not post-hoc personalization. A runtime intelligence layer for live system adaptation.
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