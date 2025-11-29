import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Tv, Gamepad2, DollarSign, Heart, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';

const metrics = [
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    stat: '+18%',
    context: 'Conversion Lift',
    desc: 'Adaptive sorting based on buyer intent.',
    icon: ShoppingCart,
    color: '#06b6d4' // cyan-500
  },
  {
    id: 'gaming',
    label: 'Gaming',
    stat: '+24%',
    context: 'D7 Retention',
    desc: 'Difficulty tuning via frustration signals.',
    icon: Gamepad2,
    color: '#8b5cf6' // violet-500
  },
  {
    id: 'fintech',
    label: 'Fintech',
    stat: '-32%',
    context: 'Support Tickets',
    desc: 'Proactive reassurance during friction.',
    icon: DollarSign,
    color: '#10b981' // emerald-500
  },
  {
    id: 'health',
    label: 'Healthcare',
    stat: '+40%',
    context: 'Adherence',
    desc: 'Literacy-matched patient instructions.',
    icon: Heart,
    color: '#ec4899' // pink-500
  },
  {
    id: 'media',
    label: 'Media',
    stat: '+15%',
    context: 'Watch Time',
    desc: 'Content pacing aligned with mood.',
    icon: Tv,
    color: '#f59e0b' // amber-500
  },
  {
    id: 'b2b',
    label: 'B2B Sales',
    stat: '2.5x',
    context: 'Pipeline Velocity',
    desc: 'Psychographic lead scoring.',
    icon: TrendingUp,
    color: '#3b82f6' // blue-500
  }
];

export default function ImpactMetrics() {
  return (
    <section className="py-32 bg-[#050505] relative">
      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-bold text-white mb-4"
            >
              Measured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Impact.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl"
            >
              Real-world ROI across 35+ industries.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-cyan-400 font-mono text-sm uppercase tracking-wider"
          >
            View Case Studies <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              className="group bg-white/5 border border-white/10 rounded-2xl p-8 transition-colors duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <item.icon className="w-6 h-6 text-white" />
              </div>

              <div className="mb-8">
                <div className="text-5xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {item.stat}
                </div>
                <div className="text-sm font-mono text-gray-500 uppercase tracking-widest">{item.context}</div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  {item.label}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${item.color}, transparent 70%)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}