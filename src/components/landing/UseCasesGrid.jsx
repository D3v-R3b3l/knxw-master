import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function UseCasesGrid() {
  const useCases = [
    { title: "E-commerce Product Recommendations", cat: "E-commerce", stat: "+45% in AOV" },
    { title: "SaaS Adaptive Onboarding", cat: "SaaS", stat: "+84% feature adoption" },
    { title: "Gaming Adaptive Difficulty", cat: "Gaming", stat: "+156% session length" },
    { title: "Personalized Learning Paths", cat: "EdTech", stat: "+62% completion rate" },
    { title: "Healthcare Adherence Nudges", cat: "Healthcare", stat: "+38% adherence" },
    { title: "Marketing Campaign Targeting", cat: "Marketing", stat: "+127% ROAS" },
    { title: "Customer Support Prioritization", cat: "Customer Service", stat: "-52% escalations" },
    { title: "Subscription Churn Prevention", cat: "SaaS", stat: "-73% churn" },
    { title: "Content Recommendation Engines", cat: "Media", stat: "+91% engagement" },
  ];

  const [expandedId, setExpandedId] = React.useState(null);

  return (
    <section id="use-cases" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-white mb-6"
          >
            Proven Impact Across Industries
          </motion.h2>
          <p className="text-xl text-gray-400">From e-commerce to gaming, knXw drives measurable results through psychological intelligence</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((item, i) => (
            <motion.div
              layoutId={`card-${i}`}
              key={i}
              onClick={() => setExpandedId(expandedId === i ? null : i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group relative p-8 rounded-2xl bg-[#111] border border-white/5 hover:border-cyan-500/50 transition-all duration-500 cursor-pointer overflow-hidden ${expandedId === i ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#111] to-[#0d1117] border-cyan-500/50' : 'hover:-translate-y-1'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-mono text-cyan-500 uppercase tracking-wider">{item.cat}</span>
                <motion.div
                  animate={{ rotate: expandedId === i ? 90 : -45 }}
                >
                  <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className={`font-bold text-white mb-4 transition-all duration-300 ${expandedId === i ? 'text-3xl' : 'text-xl'} group-hover:text-cyan-50`}>
                  {item.title}
                </h3>
                
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all mb-4">
                  {item.stat}
                </div>

                {expandedId === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-gray-400 pt-4 border-t border-white/10"
                  >
                    <p className="mb-4">Detailed breakdown of how our psychographic engine optimized this metric:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                       <li>Real-time behavioral pattern matching</li>
                       <li>Adaptive interface modification (latency &lt; 50ms)</li>
                       <li>Sentiment-aware copy adjustment</li>
                    </ul>
                  </motion.div>
                )}
              </div>
              
              {/* Background Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}