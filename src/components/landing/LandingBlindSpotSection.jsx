import React from 'react';

export default function LandingBlindSpotSection() {
  return (
    <section className="py-20 md:py-24 bg-black border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_55%)]" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            The Blind Spot
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Software records actions. It does not read decision state.
          </h2>
          <p className="text-lg md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-6">
            Analytics shows what happened after the fact. It does not tell a system what a user is signaling right now.
          </p>
          <p className="text-base md:text-xl text-gray-500 leading-relaxed max-w-4xl mx-auto">
            Clicks, sessions, funnels, and segments capture surface behavior. They do not expose hesitation, confidence, urgency, cognitive load, or the shift in intent that shaped the action. That missing layer is why systems can measure users without understanding them, and why most software still cannot adapt with precision in the moment.
          </p>
        </div>
      </div>
    </section>
  );
}