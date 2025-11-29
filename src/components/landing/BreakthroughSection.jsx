import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Fingerprint, Brain, Zap, ArrowUpRight } from 'lucide-react';

const Card = ({ title, subtitle, description, icon: Icon, delay }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="relative min-h-[500px] w-full rounded-[2rem] bg-gradient-to-br from-[#111] to-black border border-white/10 p-8 md:p-12 group cursor-none perspective-1000"
    >
      {/* Floating Content Layer */}
      <div style={{ transform: "translateZ(40px)" }} className="relative z-20 h-full flex flex-col justify-between pointer-events-none">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400 transition-all duration-500">
            <Icon className="w-8 h-8" />
          </div>
          <div className="font-mono text-xs text-cyan-500 mb-4 tracking-widest uppercase">{subtitle}</div>
          <h3 className="text-4xl font-bold text-white mb-6">{title}</h3>
          <p className="text-lg text-gray-400 leading-relaxed">{description}</p>
        </div>
        
        <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
          <span className="text-sm font-medium">Deep Dive</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Glow Layer */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl" />
    </motion.div>
  );
};

export default function BreakthroughSection() {
  return (
    <section className="py-32 bg-black overflow-visible">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-8xl font-bold text-white mb-8">
            The Breakthrough.
          </h2>
          <div className="h-px w-full bg-white/10" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card 
            title="Identity"
            subtitle="Foundation"
            icon={Fingerprint}
            description="knXw builds a living, evolving understanding of every user. Not just demographics, but motivations, anxieties, and cognitive traits."
            delay={0}
          />
          <Card 
            title="Interpretation"
            subtitle="Processing"
            icon={Brain}
            description="Real-time translation of raw behavioral data into psychological context. We answer the 'why' behind the click."
            delay={0.2}
          />
          <Card 
            title="Interaction"
            subtitle="Execution"
            icon={Zap}
            description="Systems that adapt their interface, tone, and flow instantly. Technology that meets the user where they are."
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
}