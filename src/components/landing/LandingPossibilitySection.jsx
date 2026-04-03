import React from 'react';

const possibilities = [
  'Systems that respond to decision state, not just recorded action',
  'Friction that gets addressed in the moment it forms, not after it causes a drop',
  'Interfaces that infer decision state and respond to it, without asking the user to explain themselves',
  'Products that adapt to decision context instead of demographic assumptions'
];

export default function LandingPossibilitySection() {
  return (
    <section className="relative overflow-hidden bg-black py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_56%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-4xl">
          <span className="mb-6 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
            One Mechanism. Many Consequences.
          </span>
          <h2 className="mb-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">One Mechanism. Many Consequences.</h2>
          <p className="max-w-3xl text-lg leading-8 text-white/62 md:text-xl md:leading-9">
            Every digital system, regardless of what it sells, teaches, or enables, has the same gap: it responds to action, but not to the decision context behind it. knXw is the layer that closes it. The same mechanism applies anywhere software meets human behavior.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {possibilities.map((item) => (
            <div key={item} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 text-white/84 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}