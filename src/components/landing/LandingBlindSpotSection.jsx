import React from 'react';

export default function LandingBlindSpotSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-black py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_58%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/[0.035] px-8 py-12 text-center backdrop-blur-2xl md:px-14 md:py-16 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <span className="mb-6 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
            The Blind Spot
          </span>
          <h2 className="mb-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
            Software records actions. It does not read decision state.
          </h2>
          <p className="mx-auto mb-6 max-w-3xl text-lg leading-8 text-white/68 md:text-2xl md:leading-10">
            Analytics shows what happened after the fact. It does not tell a system what a user is signaling right now.
          </p>
          <p className="mx-auto max-w-4xl text-base leading-8 text-white/48 md:text-xl md:leading-9">
            Clicks, sessions, funnels, and segments capture surface behavior. They do not expose hesitation, confidence, urgency, cognitive load, or the shift in intent that shaped the action. That missing layer is why systems can measure users without understanding them, and why most software still cannot adapt with precision in the moment.
          </p>
        </div>
      </div>
    </section>
  );
}