import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const outcomes = [
  'Activation improves, because onboarding adapts to live decision context, not median-user assumptions',
  'Completion and retention improve, because friction is addressed before it becomes abandonment',
  'Conversion quality improves, because adaptation is contextual, not cosmetic',
  'Regret-driven churn decreases, because the system that sold the product understood the person buying it'
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">System Consequences</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            When a system can read decision context in real time, the outcome categories shift.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Outcomes depend on implementation depth and product context.
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