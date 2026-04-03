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
    <section className="relative overflow-hidden border-b border-white/5 bg-black py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_52%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl md:mb-16">
          <span className="mb-6 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
            Runtime Positioning
          </span>
          <h2 className="mb-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
            knXw is the layer between behavior and execution.
          </h2>
          <p className="mb-4 text-lg leading-8 text-white/64 md:text-xl md:leading-9">
            It takes the behavioral signal your product already generates, interprets what that signal means about the user’s decision state, and returns that understanding to the system while there is still time to act on it.
          </p>
          <p className="text-lg leading-8 text-white md:text-xl md:leading-9">
            Not analytics. Not segmentation. Not post-hoc personalization. A runtime intelligence layer for live system adaptation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {blocks.map((block) => (
            <div key={block.title} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
              <h3 className="mb-3 text-xl font-semibold tracking-[-0.03em] text-white">{block.title}</h3>
              <p className="leading-7 text-white/56">{block.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}