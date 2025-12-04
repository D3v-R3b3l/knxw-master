import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ShoppingCart, Code, Gamepad2, GraduationCap, Heart, Megaphone, Headphones, RefreshCcw, Tv } from 'lucide-react';

const categoryIcons = {
  "E-commerce": ShoppingCart,
  "SaaS": Code,
  "Gaming": Gamepad2,
  "EdTech": GraduationCap,
  "Healthcare": Heart,
  "Marketing": Megaphone,
  "Customer Service": Headphones,
  "Media": Tv,
};

const categoryColors = {
  "E-commerce": { from: "#06b6d4", to: "#0891b2" },
  "SaaS": { from: "#8b5cf6", to: "#7c3aed" },
  "Gaming": { from: "#f59e0b", to: "#d97706" },
  "EdTech": { from: "#10b981", to: "#059669" },
  "Healthcare": { from: "#ec4899", to: "#db2777" },
  "Marketing": { from: "#3b82f6", to: "#2563eb" },
  "Customer Service": { from: "#f97316", to: "#ea580c" },
  "Media": { from: "#a855f7", to: "#9333ea" },
};

export default function UseCasesGrid() {
  const useCases = [
    { title: "E-commerce Product Recommendations", cat: "E-commerce", stat: "+45%", statLabel: "in AOV", details: ["AI-driven product sorting by buyer intent", "Real-time cart optimization", "Personalized upsell timing"] },
    { title: "SaaS Adaptive Onboarding", cat: "SaaS", stat: "+84%", statLabel: "feature adoption", details: ["Cognitive style-matched tutorials", "Progressive disclosure based on confidence", "Contextual help triggers"] },
    { title: "Gaming Adaptive Difficulty", cat: "Gaming", stat: "+156%", statLabel: "session length", details: ["Frustration detection & difficulty adjustment", "Flow state optimization", "Reward timing personalization"] },
    { title: "Personalized Learning Paths", cat: "EdTech", stat: "+62%", statLabel: "completion rate", details: ["Learning style detection", "Adaptive content pacing", "Motivation-based nudges"] },
    { title: "Healthcare Adherence Nudges", cat: "Healthcare", stat: "+38%", statLabel: "adherence", details: ["Literacy-matched instructions", "Empathetic reminder timing", "Anxiety-aware messaging"] },
    { title: "Marketing Campaign Targeting", cat: "Marketing", stat: "+127%", statLabel: "ROAS", details: ["Psychographic audience segments", "Motivation-aligned creatives", "Optimal send time prediction"] },
    { title: "Customer Support Prioritization", cat: "Customer Service", stat: "-52%", statLabel: "escalations", details: ["Frustration level detection", "Proactive intervention triggers", "Agent matching by personality"] },
    { title: "Subscription Churn Prevention", cat: "SaaS", stat: "-73%", statLabel: "churn", details: ["Early warning signals", "Personalized retention offers", "Re-engagement timing optimization"] },
    { title: "Content Recommendation Engines", cat: "Media", stat: "+91%", statLabel: "engagement", details: ["Mood-based content matching", "Attention span optimization", "Discovery vs comfort balance"] },
  ];

  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <section id="use-cases" className="py-32 bg-black relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              Use Cases
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Proven Impact Across{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              Industries
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            From e-commerce to gaming, knXw drives measurable results through psychological intelligence
          </motion.p>
        </div>

        {/* Stable Grid - No Layout Animation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((item, i) => {
            const IconComponent = categoryIcons[item.cat] || Code;
            const colors = categoryColors[item.cat] || { from: "#06b6d4", to: "#0891b2" };
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                onClick={() => setSelectedCard(i)}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ willChange: 'transform' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Glow Effect on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ 
                    background: `radial-gradient(circle at 50% 0%, ${colors.from}15, transparent 60%)`,
                    filter: 'blur(20px)'
                  }}
                />
                
                {/* Category Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}20)` }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color: colors.from }} />
                    </div>
                    <span 
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: colors.from }}
                    >
                      {item.cat}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-white transition-colors leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span 
                      className="text-4xl font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {item.stat}
                    </span>
                    <span className="text-sm text-gray-500">{item.statLabel}</span>
                  </div>
                </div>
                
                {/* Bottom Accent Line */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${colors.from}, transparent)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal for Expanded Card */}
      <AnimatePresence>
        {selectedCard !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setSelectedCard(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
            >
              {(() => {
                const item = useCases[selectedCard];
                const IconComponent = categoryIcons[item.cat] || Code;
                const colors = categoryColors[item.cat] || { from: "#06b6d4", to: "#0891b2" };
                
                return (
                  <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    {/* Glow */}
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 opacity-30 blur-3xl pointer-events-none"
                      style={{ background: `linear-gradient(180deg, ${colors.from}, transparent)` }}
                    />
                    
                    {/* Close Button */}
                    <button 
                      onClick={() => setSelectedCard(null)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                    
                    {/* Category */}
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors.from}30, ${colors.to}30)` }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: colors.from }} />
                      </div>
                      <span 
                        className="text-sm font-mono uppercase tracking-wider"
                        style={{ color: colors.from }}
                      >
                        {item.cat}
                      </span>
                    </div>
                    
                    {/* Title & Stat */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{item.title}</h3>
                    <div className="flex items-baseline gap-3 mb-8">
                      <span 
                        className="text-5xl font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {item.stat}
                      </span>
                      <span className="text-lg text-gray-400">{item.statLabel}</span>
                    </div>
                    
                    {/* Details */}
                    <div className="border-t border-white/10 pt-6">
                      <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">How we achieved this:</p>
                      <ul className="space-y-3">
                        {item.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ background: colors.from }}
                            />
                            <span className="text-gray-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}