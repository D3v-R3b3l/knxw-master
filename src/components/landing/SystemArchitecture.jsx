import React from 'react';
import { motion } from 'framer-motion';
import { Database, Cpu, Zap, Network, GitBranch, Radio } from 'lucide-react';

const Connection = () => (
  <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 -z-10">
    <motion.div
      className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
      animate={{ x: ["-100%", "400%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const Node = ({ icon: Icon, title, label, items, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="relative flex-1 bg-neutral-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group"
  >
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-${color}-500/30 bg-black text-xs font-mono text-${color}-400 uppercase tracking-widest`}>
      {label}
    </div>
    
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-6 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-7 h-7" />
    </div>

    <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>

    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-3 text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
          <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500/50`} />
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);

export default function SystemArchitecture() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">One Infrastructure.</h2>
          <p className="text-xl text-gray-400">From raw data to adaptive reality in milliseconds.</p>
        </motion.div>

        <div className="relative grid lg:grid-cols-3 gap-8 lg:gap-16">
          <Connection />
          
          <Node 
            label="Ingest"
            title="Unified Input"
            icon={Database}
            color="blue"
            items={["Clickstream & Events", "CRM & CDP Data", "IoT & Voice", "Contextual Metadata"]}
            delay={0}
          />

          <Node 
            label="Process"
            title="Cognitive Core"
            icon={Cpu}
            color="purple"
            items={["Intent Recognition", "Emotion Analysis", "Predictive Modeling", "Real-time Inference"]}
            delay={0.2}
          />

          <Node 
            label="Act"
            title="Adaptive Output"
            icon={Zap}
            color="cyan"
            items={["Dynamic UI Generation", "Personalized Nudges", "Smart Routing", "Content Adaptation"]}
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}