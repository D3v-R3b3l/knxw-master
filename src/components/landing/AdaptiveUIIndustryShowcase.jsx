import React, { useState } from 'react';
import { ShoppingCart, Gamepad2, Rocket, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function AdaptiveUIIndustryShowcase() {
  const [activeIndustry, setActiveIndustry] = useState('ecommerce');

  const industries = {
    ecommerce: {
      icon: ShoppingCart,
      title: 'E-commerce',
      tagline: 'Personalize every touchpoint',
      stats: [
      { value: '+47%', label: 'Conversion Rate' },
      { value: '+62%', label: 'Cart Completion' },
      { value: '-34%', label: 'Return Rate' }],

      examples: [
      {
        title: 'Product Cards',
        description: 'Headlines adapt from "Premium Headphones" to "Award-Winning Audio" for achievement-motivated shoppers'
      },
      {
        title: 'Checkout CTAs',
        description: 'Conservative buyers see "Secure Checkout - 100% Protected", aggressive see "Claim Deal Now"'
      },
      {
        title: 'Trust Signals',
        description: 'Risk-averse customers see guarantees and badges, innovation-seekers see new features'
      }],

      gradient: 'from-[#10b981] to-[#00d4ff]'
    },
    gaming: {
      icon: Gamepad2,
      title: 'Gaming',
      tagline: 'Adaptive player experiences',
      stats: [
      { value: '+58%', label: 'Engagement' },
      { value: '+73%', label: 'IAP Conversion' },
      { value: '-41%', label: 'Day 7 Churn' }],

      examples: [
      {
        title: 'Reward Systems',
        description: 'Mastery players see skill achievements, social players see team milestones'
      },
      {
        title: 'Difficulty Prompts',
        description: 'Conservative: "Find comfort zone", Aggressive: "Maximum challenge mode"'
      },
      {
        title: 'IAP Offers',
        description: 'Achievement: "Join Elite 5%", Social: "Exclusive team features"'
      }],

      gradient: 'from-[#8b5cf6] to-[#ec4899]'
    },
    saas: {
      icon: Rocket,
      title: 'SaaS',
      tagline: 'Intelligent onboarding',
      stats: [
      { value: '+67%', label: 'Activation' },
      { value: '+84%', label: 'Feature Adoption' },
      { value: '-52%', label: 'Time to Value' }],

      examples: [
      {
        title: 'Onboarding Flows',
        description: 'Analytical: detailed walkthroughs, Pragmatic: 60-second quick start'
      },
      {
        title: 'Feature Nudges',
        description: 'Achievement: "Boost productivity 3x", Autonomy: "Maintain full control"'
      },
      {
        title: 'Upgrade Prompts',
        description: 'Conservative: "30-day money-back", Aggressive: "Unlock all - limited offer"'
      }],

      gradient: 'from-[#00d4ff] to-[#0ea5e9]'
    }
  };

  const active = industries[activeIndustry];
  const Icon = active.icon;

  return (
    <section className="py-24 md:py-32 bg-[#050505] overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_60%)]" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-xs font-mono text-[#fbbf24] uppercase tracking-[0.3em] bg-[#fbbf24]/10 px-4 py-2 rounded-full border border-[#fbbf24]/20">
              Industry Applications
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Adaptive UI Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Every Industry</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-world examples of psychographic intelligence driving measurable business impact
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {Object.entries(industries).map(([key, industry]) => {
            const IndustryIcon = industry.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveIndustry(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeIndustry === key ?
                `bg-gradient-to-r ${industry.gradient} text-white shadow-[0_0_30px_rgba(0,212,255,0.3)]` :
                'bg-[#111111] border border-[#262626] text-[#a3a3a3] hover:border-[#00d4ff]/30'}`
                }>

                <IndustryIcon className="w-5 h-5" />
                {industry.title}
              </button>);

          })}
        </div>

        {/* Industry Content */}
        <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#262626] rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${active.gradient} flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{active.title}</h3>
              <p className="text-[#a3a3a3]">{active.tagline}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {active.stats.map((stat, idx) =>
            <div key={idx} className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${active.gradient}`}>
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm text-[#a3a3a3]">{stat.label}</div>
              </div>
            )}
          </div>

          {/* Examples */}
          <div className="space-y-4 mb-8">
            {active.examples.map((example, idx) =>
            <div key={idx} className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 hover:border-[#00d4ff]/30 transition-colors">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                  {example.title}
                </h4>
                <p className="text-sm text-[#a3a3a3]">{example.description}</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = createPageUrl('Documentation')}
              className={`bg-gradient-to-r ${active.gradient} hover:opacity-90 text-white font-bold px-8 py-6 text-lg rounded-xl`}>

              View Full Documentation
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => window.location.href = createPageUrl('InteractiveDemo')}
              variant="outline" className="bg-background text-slate-900 px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-9 border-white/20 hover:bg-white/5">


              Try Live Demo
            </Button>
          </div>
        </div>
      </div>
    </section>);

}