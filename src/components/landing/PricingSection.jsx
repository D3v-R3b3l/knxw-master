import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import { toast } from '@/components/ui/use-toast';

export default function PricingSection() {
  const plans = [
    {
      name: "Developer",
      price: "Free",
      description: "Perfect for getting started",
      features: ["1,000 monthly credits", "Real-time profiling", "Basic dashboards", "JavaScript SDK"],
      cta: "Start Free",
      key: "developer",
      mode: "subscription", 
      highlight: false
    },
    {
      name: "Growth",
      price: "$99",
      period: "/mo",
      description: "For growing businesses",
      features: ["10K-50K monthly credits", "Content engine", "AI feedback analysis", "Advanced segmentation", "Full integrations"],
      cta: "Start Growth",
      key: "growth",
      mode: "subscription",
      highlight: true,
      badge: "MOST POPULAR"
    },
    {
      name: "Pro",
      price: "$499",
      period: "/mo",
      description: "For serious scale",
      features: ["100K-500K monthly credits", "Market intelligence", "Unlimited segments", "Batch analytics", "Priority support"],
      cta: "Start Pro",
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
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Simple Pricing
          </motion.h2>
          <p className="text-lg md:text-xl text-gray-400">Choose the plan that fits your scale</p>
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

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, f) => (
                  <div key={f} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="flex-1">{feature}</span>
                  </div>
                ))}
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
            <p className="text-gray-400">Tailored solutions for large-scale deployments with custom requirements</p>
          </div>
          <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-colors whitespace-nowrap w-full md:w-auto">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}