import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, XCircle, Activity, Brain, Zap, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const clarificationPoints = [
  'Analytics tells you what happened.',
  'Personalization applies predefined rules.',
  'Models generate predictions.',
  'None of these change how your system behaves in real time.',
  'knXw does.'
];

const mechanismSteps = [
  {
    title: 'Behavior',
    description: 'Every interaction, signal, hesitation, and action is captured as live context.'
  },
  {
    title: 'Interpretation',
    description: 'knXw infers intent, decision state, and underlying behavioral patterns in real time.'
  },
  {
    title: 'Execution',
    description: 'That interpretation is immediately applied to the system, changing what it does next.'
  }
];

const sdkPoints = [
  'Adapt interfaces based on user decision state',
  'Adjust flows, timing, and messaging dynamically',
  'Apply intelligent friction or acceleration where needed',
  'Operate without static rules or delayed processing',
  'Run continuously at runtime, not in batches'
];

const outcomePoints = [
  'More precise decisions at the moment they matter',
  'Reduced user friction without sacrificing control',
  'Higher quality engagement, not just more activity',
  'Improved retention driven by better experiences',
  'Alignment between system behavior and user intent'
];

function SectionShell({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} className="py-24 md:py-32 border-t border-white/8 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          {eyebrow && <div className="text-xs uppercase tracking-[0.24em] text-[#6b7280] mb-4">{eyebrow}</div>}
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight">{title}</h2>
          {description && <p className="text-lg text-[#a3a3a3] leading-relaxed mt-5">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export default function RuntimeHomepageSections() {
  return (
    <>
      <section id="hero" className="min-h-screen bg-[#050505] border-b border-white/8 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full pt-28 pb-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-5xl">
            <div className="text-xs uppercase tracking-[0.28em] text-[#6b7280] mb-6">Runtime intelligence infrastructure</div>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight text-white leading-[0.95] max-w-5xl">
              Finally, your product understands why.
            </h1>
            <p className="text-xl md:text-2xl text-[#a3a3a3] leading-relaxed max-w-4xl mt-8">
              knXw is a runtime intelligence layer that interprets user behavior and feeds that understanding back into your system so it can adapt what it does in real time.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-10 max-w-5xl">
              {[
                'Not analytics. Not personalization. Not a model.',
                'A live layer between behavior and decision.',
                'Built for systems that need to act, not just observe.'
              ].map((point) => (
                <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-5 text-sm md:text-base text-[#d4d4d4] leading-relaxed">
                  {point}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={() => document.getElementById('sdk')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-[#e5e5e5] transition-colors"
              >
                Explore the Platform
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.location.href = createPageUrl('Documentation')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/12 bg-white/[0.03] text-white font-semibold hover:bg-white/[0.06] transition-colors"
              >
                <Code2 className="w-4 h-4" />
                View SDK
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionShell
        id="clarification"
        eyebrow="Clarification"
        title="This is not another analytics layer."
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="space-y-4">
            {clarificationPoints.map((point, index) => (
              <div key={point} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-[#0b0b0b] px-5 py-5">
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs text-[#6b7280] flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-lg text-white leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 text-white mb-5">
              <XCircle className="w-5 h-5 text-[#a3a3a3]" />
              <span className="font-medium">Positioning boundary</span>
            </div>
            <p className="text-[#a3a3a3] leading-relaxed text-lg">
              knXw is infrastructure that sits between observed behavior and system action. It does not stop at reporting, segmentation, or prediction. It changes execution while the interaction is still unfolding.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="mechanism"
        eyebrow="Core mechanism"
        title="From behavior to decision, in real time."
        description="knXw continuously interprets user behavior as it happens, identifies intent, decision context, and cognitive state, and connects that interpretation directly to system execution."
      >
        <div className="grid md:grid-cols-3 gap-6">
          {mechanismSteps.map((step, index) => {
            const Icon = [Activity, Brain, Zap][index];
            return (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-8">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#6b7280] mb-3">0{index + 1}</div>
                <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-[#a3a3a3] text-base leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell
        id="sdk"
        eyebrow="SDK"
        title="Delivered as an adaptive runtime SDK."
        description="The knXw SDK integrates directly into your product and allows your system to respond to interpreted behavior in real time."
      >
        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-8 items-start">
          <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-8">
            <div className="text-xs uppercase tracking-[0.24em] text-[#6b7280] mb-4">Execution surface</div>
            <div className="space-y-4">
              {sdkPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 text-[#d4d4d4]">
                  <ChevronRight className="w-4 h-4 mt-1 text-white/60 flex-shrink-0" />
                  <span className="text-base leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#090909] p-8 overflow-hidden">
            <div className="text-xs uppercase tracking-[0.24em] text-[#6b7280] mb-4">Runtime pattern</div>
            <pre className="text-sm md:text-[15px] leading-7 text-[#d4d4d4] whitespace-pre-wrap font-mono">
{`knxw.capture(behavior)
  -> interpret(intent, decision_state, cognitive_context)
  -> apply(system_execution)

interface adapts
flow timing changes
friction increases or decreases
messaging updates
system behavior shifts in real time`}
            </pre>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="outcomes"
        eyebrow="Outcomes"
        title="Systems that behave differently because they understand."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          {outcomePoints.map((point) => (
            <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 text-[#e5e5e5] leading-relaxed text-base">
              {point}
            </div>
          ))}
        </div>
      </SectionShell>

      <section id="closing" className="py-28 md:py-36 border-t border-white/8 bg-[#050505]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-xs uppercase tracking-[0.28em] text-[#6b7280] mb-5">Closing positioning</div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Understanding is only useful if it changes behavior.
          </h2>
          <p className="text-xl text-[#a3a3a3] leading-relaxed max-w-3xl mx-auto mt-6">
            knXw connects interpretation to execution so your system can act with context, not just data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-[#e5e5e5] transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => window.location.href = createPageUrl('Pricing')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/12 bg-white/[0.03] text-white font-semibold hover:bg-white/[0.06] transition-colors"
            >
              Request Access
            </button>
          </div>
        </div>
      </section>
    </>
  );
}