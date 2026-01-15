import React from 'react';
import { motion } from 'framer-motion';

export default function IntegrationsMarquee() {
  const integrations = [
    { name: "Google Analytics 4", category: "Analytics", stat: "+45%", label: "attribution" },
    { name: "Google Ads & Meta CAPI", category: "Advertising", stat: "+67%", label: "ROAS" },
    { name: "Meta Pages & Comments", category: "Social", stat: "Live", label: "analysis" },
    { name: "HubSpot CRM", category: "CRM", stat: "+52%", label: "close rates" },
    { name: "Zoho CRM", category: "CRM", stat: "+48%", label: "lead scoring" },
    { name: "Pipedrive", category: "CRM", stat: "+61%", label: "deal velocity" },
    { name: "Salesforce", category: "CRM", stat: "+55%", label: "forecast accuracy" },
    { name: "Shopify", category: "E-commerce", stat: "+72%", label: "AOV" },
    { name: "Magento", category: "E-commerce", stat: "+58%", label: "conversions" },
    { name: "Tableau & Power BI", category: "BI Tools", stat: "Native", label: "exports" },
    { name: "Twilio SMS", category: "Communication", stat: "+89%", label: "engagement" },
    { name: "Journey Builder", category: "Automation", stat: "+84%", label: "conversions" },
    { name: "AI Agents Suite", category: "AI", stat: "+156%", label: "productivity" },
    { name: "Multi-Channel Messaging", category: "Engagement", stat: "-73%", label: "churn" },
    { name: "Executive Dashboard", category: "Reporting", stat: "+91%", label: "faster" },
    { name: "Audience Builder", category: "Segments", stat: "+67%", label: "effectiveness" },
    { name: "AWS & Azure", category: "Enterprise", stat: "+73%", label: "speed" },
    { name: "Compliance Suite", category: "Security", stat: "-44%", label: "overhead" },
  ];

  return (
    <section className="py-24 bg-[#080808] overflow-hidden relative border-y border-white/5">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03),transparent_60%)]" />
      
      <div className="max-w-7xl mx-auto px-6 mb-14 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            Integrations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Connect Your Entire Stack</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Seamless integration with your existing tools for unified psychographic intelligence</p>
        </motion.div>
      </div>

      {/* Marquee Row 1 */}
      <div className="relative mb-5">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#080808] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#080808] to-transparent z-10" />
        
        <div className="flex gap-5 w-max animate-marquee hover:[animation-play-state:paused]">
          {[...integrations, ...integrations, ...integrations].map((item, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-72 p-5 bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors text-sm">{item.name}</h3>
                <span className="text-[10px] font-mono text-gray-500 uppercase bg-white/5 px-2 py-1 rounded border border-white/5">{item.category}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:from-white group-hover:to-gray-300 transition-all">
                  {item.stat}
                </span>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 - Reverse */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#080808] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#080808] to-transparent z-10" />
        
        <div className="flex gap-5 w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...integrations.slice().reverse(), ...integrations.slice().reverse(), ...integrations.slice().reverse()].map((item, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-72 p-5 bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 rounded-xl hover:border-purple-500/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors text-sm">{item.name}</h3>
                <span className="text-[10px] font-mono text-gray-500 uppercase bg-white/5 px-2 py-1 rounded border border-white/5">{item.category}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 group-hover:from-white group-hover:to-gray-300 transition-all">
                  {item.stat}
                </span>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 50s linear infinite;
        }
      `}</style>
    </section>
  );
}