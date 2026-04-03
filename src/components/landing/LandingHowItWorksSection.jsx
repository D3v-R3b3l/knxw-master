import React from 'react';

const steps = [
  {
    title: 'Sense',
    description: 'Collect the interaction signal already moving through your product: behavior, pacing, friction, and sequence.'
  },
  {
    title: 'Infer',
    description: 'Convert that signal into a live interpretation of decision state: confidence, hesitation, intent, motivation, and risk posture.'
  },
  {
    title: 'Adapt',
    description: 'Feed that interpretation back into the system so the product can change what it says, shows, or does while the session is still active.'
  },
  {
    title: 'Govern',
    description: 'Keep every adaptation inspectable, explainable, and controlled so runtime intelligence remains operational infrastructure, not opaque behavior.'
  }
];

export default function LandingHowItWorksSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#050505] py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_56%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-white/62">
            Runtime Loop
          </span>
          <h2 className="mb-6 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">From behavioral signal to system action.</h2>
          <p className="text-lg leading-8 text-white/62">
            knXw turns live user behavior into interpretable runtime input your product can execute against.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
              <div className="mb-4 text-sm font-medium tracking-[0.2em] text-white/42">0{index + 1}</div>
              <h3 className="mb-3 text-2xl font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
              <p className="leading-7 text-white/56">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}