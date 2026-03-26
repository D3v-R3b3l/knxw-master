import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const outcomes = [
  'Higher activation quality',
  'Better retention and completion rates',
  'Improved feature discovery',
  'Reduced decision friction',
  'Stronger conversion quality',
  'Lower regret-driven churn'
];

export default function LandingBusinessImpactSection() {
  return (
    <section className="py-24 md:py-28 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.05),transparent_50%)]" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            System Consequences
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What this changes</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            knXw is built to improve the quality of system response and the quality of user outcomes. Teams typically aim to improve activation quality, retention, completion, trust, conversion quality, and reduced friction across key journeys.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Outcome areas are directional and depend on implementation context. This section does not present audited customer proof.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {outcomes.map((outcome) => (
            <div key={outcome} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
              <span className="text-white/90">{outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}