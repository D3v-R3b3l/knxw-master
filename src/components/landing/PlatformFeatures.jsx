import React from 'react';
import { Brain, Gamepad2, TrendingUp, Code, FileText, Bot, Cpu, Route, UserCheck, RefreshCcw, BarChart3, Store, Users, Sparkles, Activity, Layers } from 'lucide-react';

const FeatureCard = ({ icon: Icon, color, title, description, badge, badgeColor, large }) => {
  const colorMap = {
    blue:    { border: 'hover:border-blue-500/30',    glow: 'bg-blue-500/10',    icon: 'from-blue-600/30 to-blue-600/10 border-blue-500/20',    text: 'text-blue-400'    },
    cyan:    { border: 'hover:border-cyan-500/30',    glow: 'bg-cyan-500/10',    icon: 'from-cyan-600/30 to-cyan-600/10 border-cyan-500/20',    text: 'text-cyan-400'    },
    purple:  { border: 'hover:border-purple-500/30',  glow: 'bg-purple-500/10',  icon: 'from-purple-600/30 to-purple-600/10 border-purple-500/20',  text: 'text-purple-400'  },
    emerald: { border: 'hover:border-emerald-500/30', glow: 'bg-emerald-500/10', icon: 'from-emerald-600/30 to-emerald-600/10 border-emerald-500/20', text: 'text-emerald-400' },
    orange:  { border: 'hover:border-orange-500/30',  glow: 'bg-orange-500/10',  icon: 'from-orange-600/30 to-orange-600/10 border-orange-500/20',  text: 'text-orange-400'  },
    pink:    { border: 'hover:border-pink-500/30',    glow: 'bg-pink-500/10',    icon: 'from-pink-600/30 to-pink-600/10 border-pink-500/20',    text: 'text-pink-400'    },
    violet:  { border: 'hover:border-violet-500/30',  glow: 'bg-violet-500/10',  icon: 'from-violet-600/30 to-violet-600/10 border-violet-500/20',  text: 'text-violet-400'  },
    fuchsia: { border: 'hover:border-fuchsia-500/30', glow: 'bg-fuchsia-500/10', icon: 'from-fuchsia-600/30 to-fuchsia-600/10 border-fuchsia-500/20', text: 'text-fuchsia-400' },
    teal:    { border: 'hover:border-teal-500/30',    glow: 'bg-teal-500/10',    icon: 'from-teal-600/30 to-teal-600/10 border-teal-500/20',    text: 'text-teal-400'    },
    rose:    { border: 'hover:border-rose-500/30',    glow: 'bg-rose-500/10',    icon: 'from-rose-600/30 to-rose-600/10 border-rose-500/20',    text: 'text-rose-400'    },
    yellow:  { border: 'hover:border-yellow-500/30',  glow: 'bg-yellow-500/10',  icon: 'from-yellow-600/30 to-yellow-600/10 border-yellow-500/20',  text: 'text-yellow-400'  },
    indigo:  { border: 'hover:border-indigo-500/30',  glow: 'bg-indigo-500/10',  icon: 'from-indigo-600/30 to-indigo-600/10 border-indigo-500/20',  text: 'text-indigo-400'  },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div data-feature-card={title} className={`bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl border border-white/5 ${c.border} transition-all duration-500 relative overflow-hidden group ${large ? 'p-8 md:p-10' : 'p-7'}`}>
      <div className={`absolute top-0 right-0 w-48 h-48 ${c.glow} rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div className="relative z-10">
        <div className={`${large ? 'w-14 h-14' : 'w-11 h-11'} rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center mb-5 border`}>
          <Icon className={`${large ? 'w-7 h-7' : 'w-5 h-5'} ${c.text}`} />
        </div>
        <h3 className={`${large ? 'text-2xl md:text-3xl' : 'text-lg'} font-bold mb-3`}>{title}</h3>
        <p className={`text-gray-400 leading-relaxed ${large ? 'text-base max-w-lg' : 'text-sm'}`}>{description}</p>
        {badge && (
          <span className={`inline-block mt-5 text-xs font-mono px-3 py-1.5 rounded-full border ${badgeColor || 'bg-white/5 text-gray-400 border-white/10'}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

import { usePsychographic } from '@/components/sdk/KnxwSDK';

export default function PlatformFeatures() {
  const { profile } = usePsychographic();
  
  // Reorder features based on cognitive style or motivation
  const isAnalytical = profile?.cognitive_style === 'analytical' || profile?.motivation_labels?.includes('achievement');
  const isSocial = profile?.motivation_labels?.includes('belonging') || profile?.personality_traits?.extraversion > 0.7;

  return (
    <section id="platform" className="py-24 md:py-32 bg-[#050505] text-white overflow-hidden relative">
      <div data-parallax-bg className="absolute inset-0 h-[130%] -top-[15%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.06),transparent_50%)]" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/4 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            Platform
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Complete Intelligence Platform</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">From tracking to activation, everything you need for psychographic intelligence</p>
        </div>

        {/* Row 1: Two hero cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <FeatureCard large icon={Brain} color="blue" title="Psychographic Profiling" description="Automatically generate psychological profiles revealing motivations, cognitive styles, and personality traits from behavioral signals." badge="ALL PLANS" />
          <FeatureCard large icon={Sparkles} color="cyan" title="Adaptive UI SDK" description="React components that automatically adapt to user psychology — buttons, text, and entire sections personalized in real-time." badge="ALL PLANS · NEW" badgeColor="bg-cyan-500/15 text-cyan-300 border-cyan-500/30" />
        </div>

        {/* Dynamic Rows: Reorder based on profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {isAnalytical ? (
             // Show highly technical/analytical features first for analytical users
             <>
               <FeatureCard icon={Code} color="orange" title="Developer APIs" description="RESTful APIs, webhooks, and a developer playground for rapid, flexible integration." badge="FREE TIER" badgeColor="bg-orange-500/10 text-orange-400 border-orange-500/20" />
               <FeatureCard icon={Cpu} color="violet" title="AI Inference Studio" description="Fine-tune psychographic models with custom weights and confidence thresholds." badge="GROWTH+" badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20" />
               <FeatureCard icon={TrendingUp} color="emerald" title="Market Intelligence" description="Analyze competitors and market trends through a psychographic lens to sharpen positioning." badge="PRO" badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
             </>
          ) : isSocial ? (
             // Show user-centric and journey features first for social/empathetic users
             <>
               <FeatureCard icon={Route} color="fuchsia" title="AI Journey Orchestrator" description="Proactive AI suggestions for journey optimization based on behavioral patterns." badge="PRO" badgeColor="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" />
               <FeatureCard icon={UserCheck} color="teal" title="User Data Portal" description="End-user transparency and full control over their psychographic data." badge="ALL PLANS" badgeColor="bg-teal-500/10 text-teal-400 border-teal-500/20" />
               <FeatureCard icon={Gamepad2} color="purple" title="GameDev Intelligence" description="Player motivation, adaptive difficulty, and churn prediction tailored for gaming experiences." badge="GROWTH+" badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20" />
             </>
          ) : (
             // Default ordering
             <>
               <FeatureCard icon={Gamepad2} color="purple" title="GameDev Intelligence" description="Player motivation, adaptive difficulty, and churn prediction tailored for gaming experiences." badge="GROWTH+" badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20" />
               <FeatureCard icon={TrendingUp} color="emerald" title="Market Intelligence" description="Analyze competitors and market trends through a psychographic lens to sharpen positioning." badge="PRO" badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
               <FeatureCard icon={Code} color="orange" title="Developer APIs" description="RESTful APIs, webhooks, and a developer playground for rapid, flexible integration." badge="FREE TIER" badgeColor="bg-orange-500/10 text-orange-400 border-orange-500/20" />
             </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {isAnalytical ? (
             <>
               <FeatureCard icon={Route} color="fuchsia" title="AI Journey Orchestrator" description="Proactive AI suggestions for journey optimization based on behavioral patterns." badge="PRO" badgeColor="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" />
               <FeatureCard icon={UserCheck} color="teal" title="User Data Portal" description="End-user transparency and full control over their psychographic data." badge="ALL PLANS" badgeColor="bg-teal-500/10 text-teal-400 border-teal-500/20" />
               <FeatureCard icon={Gamepad2} color="purple" title="GameDev Intelligence" description="Player motivation, adaptive difficulty, and churn prediction tailored for gaming experiences." badge="GROWTH+" badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20" />
             </>
          ) : isSocial ? (
             <>
               <FeatureCard icon={Code} color="orange" title="Developer APIs" description="RESTful APIs, webhooks, and a developer playground for rapid, flexible integration." badge="FREE TIER" badgeColor="bg-orange-500/10 text-orange-400 border-orange-500/20" />
               <FeatureCard icon={Cpu} color="violet" title="AI Inference Studio" description="Fine-tune psychographic models with custom weights and confidence thresholds." badge="GROWTH+" badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20" />
               <FeatureCard icon={TrendingUp} color="emerald" title="Market Intelligence" description="Analyze competitors and market trends through a psychographic lens to sharpen positioning." badge="PRO" badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
             </>
          ) : (
             <>
               <FeatureCard icon={Cpu} color="violet" title="AI Inference Studio" description="Fine-tune psychographic models with custom weights and confidence thresholds." badge="GROWTH+" badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20" />
               <FeatureCard icon={Route} color="fuchsia" title="AI Journey Orchestrator" description="Proactive AI suggestions for journey optimization based on behavioral patterns." badge="PRO" badgeColor="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" />
               <FeatureCard icon={UserCheck} color="teal" title="User Data Portal" description="End-user transparency and full control over their psychographic data." badge="ALL PLANS" badgeColor="bg-teal-500/10 text-teal-400 border-teal-500/20" />
             </>
          )}
        </div>

        {/* Row 4: Four compact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-5">
          <FeatureCard icon={FileText} color="cyan" title="Content Engine" description="Auto-recommend content based on unique psychological profiles." />
          <FeatureCard icon={Bot} color="pink" title="AI Automation" description="Deploy intelligent agents for personalized, timely engagements." />
          <FeatureCard icon={Activity} color="rose" title="Emotional Shift Tracking" description="Monitor subtle emotional changes with volatility analysis." />
          <FeatureCard icon={Layers} color="indigo" title="Custom Dimensions" description="Define industry-specific psychographic traits and metrics." />
        </div>

        {/* Row 5: Full-width feedback loop */}
        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden group mb-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/8 rounded-full blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-600/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <RefreshCcw className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Self-Learning AI Feedback Loop</h3>
              <p className="text-gray-400 text-base max-w-3xl leading-relaxed">Engagement outcomes continuously train and improve psychographic predictions. Every interaction makes the AI smarter — automatically adjusting confidence thresholds and refining inference models based on real-world performance.</p>
            </div>
            <span className="text-xs font-mono bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-5 py-2.5 rounded-full text-amber-300 border border-amber-500/30 whitespace-nowrap flex-shrink-0">🧠 AUTONOMOUS OPTIMIZATION</span>
          </div>
        </div>

        {/* Row 6: Integrations */}
        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl p-8 md:p-10 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/8 rounded-full blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600/30 to-cyan-600/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                <Code className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Enterprise Integration Ecosystem</h3>
                <p className="text-gray-400 text-base max-w-3xl leading-relaxed">Connect psychographic intelligence to your entire tech stack with native SDKs and seamless integrations across CRM, e-commerce, BI, and communication platforms.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, color: 'text-red-400', title: 'CRM Platforms', desc: 'HubSpot, Salesforce, Zoho, Pipedrive' },
                { icon: Store, color: 'text-green-400', title: 'E-commerce', desc: 'Shopify, Magento' },
                { icon: BarChart3, color: 'text-purple-400', title: 'BI Tools', desc: 'Tableau, Power BI, Looker' },
                { icon: Bot, color: 'text-blue-400', title: 'Communication', desc: 'Email, SMS, Push' },
              ].map(({ icon: I, color, title, desc }) => (
                <div key={title} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
                  <I className={`w-5 h-5 ${color} mb-3`} />
                  <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}