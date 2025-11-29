import React from 'react';
import { motion } from 'framer-motion';

export default function IntegrationsMarquee() {
  const integrations = [
    { name: "Google Analytics 4", category: "Analytics", stat: "+45% attribution accuracy" },
    { name: "Google Ads & Meta CAPI", category: "Advertising", stat: "+67% ROAS improvement" },
    { name: "Meta Pages & Comments", category: "Social Analytics", stat: "Coming Soon" },
    { name: "HubSpot CRM", category: "Customer Data", stat: "+52% close rates" },
    { name: "Journey Builder", category: "Automation", stat: "+84% conversion rates" },
    { name: "AI Agents Suite", category: "AI Automation", stat: "+156% productivity boost" },
    { name: "Multi-Channel Messaging", category: "Engagement", stat: "-73% churn reduction" },
    { name: "Executive Dashboard", category: "Reporting", stat: "+91% faster insights" },
    { name: "Audience Builder", category: "Segmentation", stat: "+67% campaign effectiveness" },
    { name: "AWS & Azure Integration", category: "Enterprise", stat: "+73% deployment speed" },
    { name: "Compliance Suite", category: "Security", stat: "-44% compliance overhead" },
  ];

  return (
    <section className="py-20 bg-[#080808] overflow-hidden relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Connect Your Entire Stack</h2>
        <p className="text-gray-400">Seamless integration with your existing tools for unified psychographic intelligence</p>
      </div>

      <div className="flex gap-8 w-max animate-marquee hover:[animation-play-state:paused]">
        {[...integrations, ...integrations, ...integrations].map((item, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-80 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group hover:scale-105 transform duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
              <span className="text-xs font-mono text-gray-500 uppercase border border-white/10 px-2 py-1 rounded">{item.category}</span>
            </div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
              {item.stat}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
}