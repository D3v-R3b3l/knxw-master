import React, { useState } from 'react';
import { Check, Info } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import { toast } from '@/components/ui/use-toast';

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-1 cursor-default"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <Info className="w-3 h-3 text-gray-500 shrink-0" />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-xs text-gray-300 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 z-50 shadow-xl pointer-events-none leading-relaxed">
          {text}
        </span>
      )}
    </span>
  );
};

const plans = [
  {
    name: "Developer",
    price: "Free",
    period: null,
    positioning: "Build and test your first adaptive experience.",
    description: "Instrument your first environment, capture behavioral events, test the SDK, and see how knXw interprets user behavior before moving into production.",
    features: [
      "Core behavioral intelligence",
      "Basic event tracking",
      "JavaScript and React SDK access",
      "Sandbox environment",
      "Community support",
    ],
    usageProfiles: "Up to 1,000 Active User Profiles",
    usageEvents: "5,000 events/month",
    usageNote: "Sandbox use only",
    overage: null,
    cta: "Start Building for Free",
    key: "developer",
    highlight: false,
    badge: null,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    positioning: "Launch live behavioral intelligence.",
    description: "Use knXw to understand user intent, personalize journeys, test experiences, and improve conversion without rebuilding your product.",
    features: [
      "Advanced decision-pattern insights",
      "Full journey builder",
      "A/B testing and real-time engagement",
      "Unlimited custom segments",
      "Priority email support",
    ],
    usageProfiles: "Up to 25,000 Active User Profiles",
    usageEvents: "250,000 events/month",
    usageNote: null,
    overage: "$5 per additional 1,000 profiles",
    cta: "Start Growing",
    key: "growth",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Professional",
    price: "$499",
    period: "/mo",
    positioning: "Scale prediction, personalization, and retention.",
    description: "For teams using knXw to detect churn risk, adapt customer journeys, connect intelligence across systems, and improve conversion at scale.",
    features: [
      "Predictive analytics and churn signals",
      "Market intelligence and trend signals",
      "Full API access, read/write",
      "Priority implementation support",
      "Priority support response",
    ],
    usageProfiles: "Up to 100,000 Active User Profiles",
    usageEvents: "1,000,000 events/month",
    usageNote: null,
    overage: "$3 per additional 1,000 profiles",
    cta: "Go Professional",
    key: "pro",
    highlight: false,
    badge: null,
  },
];

const enterpriseFeatures = [
  "Dedicated infrastructure options",
  "Advanced data controls",
  "Custom usage limits",
  "Governance review",
  "Security and compliance support",
  "Custom integrations",
  "Dedicated onboarding",
  "Enterprise support terms",
];

export default function PricingSection() {
  const handleCheckout = async (planKey) => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      await base44.auth.redirectToLogin(createPageUrl('Landing') + '#pricing');
      return;
    }
    try {
      toast({ title: "Processing…", description: "Preparing checkout session." });
      const response = await base44.functions.invoke('createCheckout', { plan_key: planKey, mode: 'subscription' });
      const { data } = response;
      if (data.checkout_url) window.location.href = data.checkout_url;
      else if (data.redirect_url) window.location.href = data.redirect_url;
      else if (data.error) toast({ variant: "destructive", title: "Error", description: data.error });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to start checkout." });
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
      {/* Background */}
      <div data-parallax-bg className="absolute inset-0 h-[130%] -top-[15%] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.06),transparent_50%)]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/4 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
            Pricing that scales from first integration<br className="hidden md:block" /> to full infrastructure.
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Start free, launch live intelligence when the signal is proven, then scale into prediction, personalization, and enterprise deployment as usage grows.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 md:p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'bg-white/[0.07] border-cyan-500/40 shadow-[0_0_40px_rgba(0,212,255,0.08)]'
                  : 'bg-white/[0.03] border-white/[0.08]'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.price}</span>
                  {plan.period && <span className="text-gray-400 text-base">{plan.period}</span>}
                </div>
                <p className={`text-sm font-medium mb-3 ${plan.highlight ? 'text-cyan-400' : 'text-gray-300'}`}>{plan.positioning}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.08] mb-6" />

              {/* Features */}
              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Usage */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 mb-6 space-y-1.5 text-xs text-gray-500 leading-relaxed">
                <div>
                  <Tooltip text="Active User Profiles are profiles evaluated by knXw during the current billing period.">
                    {plan.usageProfiles}
                  </Tooltip>
                </div>
                <div>
                  <Tooltip text="Events are behavioral, journey, product, or interaction signals sent to knXw for analysis.">
                    {plan.usageEvents}
                  </Tooltip>
                </div>
                {plan.usageNote && <div className="text-gray-600">{plan.usageNote}</div>}
                {plan.overage && <div className="text-gray-600 pt-1 border-t border-white/[0.06]">Overage: {plan.overage}</div>}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(plan.key)}
                className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] ${
                  plan.highlight
                    ? 'text-white'
                    : plan.name === 'Developer'
                      ? 'text-gray-200 border border-white/20 bg-white/[0.05] hover:bg-white/[0.1]'
                      : 'text-[#00d4ff] border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/12 hover:border-[#00d4ff]/60'
                }`}
                style={plan.highlight ? {
                  background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
                  boxShadow: '0 0 28px rgba(0,212,255,0.25), 0 4px 16px rgba(0,0,0,0.3)'
                } : {}}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise Band */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d0d1a] via-[#0a0a12] to-[#0d1020] p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Enterprise</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-white">Custom</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Starts at $2,500/mo for qualified deployments</p>
              <p className="text-sm font-medium text-purple-300 mb-3">Deploy knXw as intelligence infrastructure.</p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                For high-scale teams that need private infrastructure, security review, governance controls, custom integrations, implementation support, and usage terms built around real deployment conditions.
              </p>
            </div>

            <div className="shrink-0">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                {enterpriseFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.href = createPageUrl('Support')}
                className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3.5 font-semibold text-sm text-purple-300 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/12 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.97] whitespace-nowrap"
              >
                Talk to Architecture →
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-600 mt-8 max-w-2xl mx-auto leading-relaxed">
          Pricing is based on active user profiles, monthly event volume, and deployment complexity. Enterprise terms are shaped around security, governance, infrastructure, integrations, and support needs.
        </p>
      </div>
    </section>
  );
}