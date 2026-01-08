import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import { toast } from '@/components/ui/use-toast';
import KineticText from '@/components/landing/KineticText';

export default function PricingSection() {
  const plans = [
    {
      name: "Builder",
      price: "Free",
      description: "Launch psychographic intelligence into your app",
      outcomes: [
        "Real-time user profiling",
        "Behavioral event tracking",
        "Basic cognitive insights",
        "JavaScript SDK"
      ],
      limits: "1,000 credits/month • No content engine • Limited horizons",
      cta: "Start Building",
      key: "developer",
      mode: "subscription", 
      highlight: false
    },
    {
      name: "Scale",
      price: "$99",
      period: "/mo",
      description: "Where behavior starts to affect money",
      outcomes: [
        "Increase conversion rates",
        "Reduce churn with insights",
        "Personalize user experiences",
        "Optimize customer journeys",
        "AI-powered content engine"
      ],
      limits: "50,000 credits/month included • $0.015 per 1,000 after",
      cta: "Scale Now",
      key: "growth",
      mode: "subscription",
      highlight: true,
      badge: "MOST POPULAR"
    },
    {
      name: "Infrastructure",
      price: "$499",
      period: "/mo",
      description: "knXw becomes a system dependency",
      outcomes: [
        "Predict user churn before it happens",
        "Market intelligence & trends",
        "Unlimited behavioral segments",
        "Batch analytics at scale",
        "Priority support & SLA"
      ],
      limits: "250,000 credits/month included • $0.012 per 1,000 after",
      cta: "Deploy Infrastructure",
      key: "pro",
      mode: "subscription",
      highlight: false
    }
  ];

  const handleCheckout = async (planKey, mode = 'subscription') => {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        await base44.auth.redirectToLogin(createPageUrl('Landing') + '#pricing');
        return;
      }
  
      try {
        toast({ title: "Processing...", description: "Preparing checkout session." });
        
        const response = await base44.functions.invoke('createCheckout', { 
          plan_key: planKey,
          mode: mode
        });
        
        const { data } = response;
        
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else if (data.error) {
          toast({ variant: "destructive", title: "Error", description: data.error });
        }
      } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Error", description: "Failed to start checkout." });
      }
  };

  return (
    <section id="pricing" className="py-20 md:py-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <KineticText trigger="inView" staggerDelay={0.04} duration={0.7} y={80}>
              Pricing by Economic Posture
            </KineticText>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Choose based on how behavior intelligence affects your business outcomes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 md:p-8 rounded-3xl border ${plan.highlight ? 'bg-white/10 border-cyan-500/50' : 'bg-white/5 border-white/10'} flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-400 mt-4 text-sm">{plan.description}</p>
              </div>

              <div className="flex-1 mb-8">
                <div className="space-y-3 mb-6">
                  {plan.outcomes.map((outcome, f) => (
                    <div key={f} className="flex items-start gap-3 text-sm text-gray-300">
                      <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="flex-1">{outcome}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs text-gray-500 leading-relaxed">{plan.limits}</p>
                </div>
              </div>

              <button
                onClick={() => handleCheckout(plan.key, plan.mode)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                  plan.highlight 
                    ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 shadow-lg shadow-cyan-500/20' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise & Custom</h3>
            <p className="text-gray-400 mb-3">knXw becomes organizational intelligence</p>
            <p className="text-sm text-gray-500">
              Custom credits • Dedicated infrastructure • Multi-tenant • White-label • SLA guarantees
            </p>
          </div>
          <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-colors whitespace-nowrap w-full md:w-auto">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}