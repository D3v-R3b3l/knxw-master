import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const outcomes = [
  'Activation improves when onboarding responds to live decision state instead of static user assumptions',
  'Completion and retention improve when friction is interpreted early enough for the system to intervene',
  'Conversion quality improves when messaging and flow adapt to context instead of using generic optimization tactics',
  'Churn pressure decreases when the product experience reflects user intent before disconnect and regret accumulate'
];

export default function LandingBusinessImpactSection() {
  return (
    <section className="relative overflow-hidden bg-black py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.05),transparent_52%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
            Business Impact
          </span>
          <h2 className="mb-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">What changes when systems understand behavior in motion.</h2>
          <p className="text-lg leading-8 text-white/62">
            When behavioral interpretation becomes part of runtime, product outcomes shift from measurement after the fact to intervention during the moment.
          </p>
          <p className="mt-4 text-sm text-white/38">
            Outcomes depend on implementation depth and product context.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {outcomes.map((outcome) => (
            <div key={outcome} className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white/72" />
              <span className="text-white/84">{outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}