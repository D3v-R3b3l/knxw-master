import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { XCircle, Brain, Lightbulb, Zap } from 'lucide-react';

export default function ApproachSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const problems = [
    { text: "Demographics tell you who, not why" },
    { text: "Clickstreams show actions, not intent" },
    { text: "Traditional analytics can't decode motivation" }
  ];

  const solutions = [
    {
      icon: Brain,
      title: "Psychographic Intelligence",
      description: "Understand cognitive styles and core motivations"
    },
    {
      icon: Lightbulb,
      title: "Explainable AI",
      description: "Clear reasoning behind every insight"
    },
    {
      icon: Zap,
      title: "Action-Ready",
      description: "Direct recommendations for engagement"
    }
  ];

  return (
    <motion.section 
      id="approach" 
      ref={ref} 
      style={{ opacity: prefersReducedMotion ? 1 : opacity }}
      className="py-20 sm:py-32 bg-gradient-to-b from-[#111111] to-[#0a0a0a] relative overflow-hidden">
      
      <motion.div 
        style={{ y: prefersReducedMotion ? 0 : y }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0,_transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            From Data to Understanding
          </h2>
          <p className="text-base sm:text-lg text-[#a3a3a3] max-w-2xl mx-auto">
            Bridge the gap where traditional analytics fail
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start max-w-6xl mx-auto">
          <motion.div
            className="space-y-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}>
            <h3 className="text-xl sm:text-2xl font-bold text-white/60 mb-6">The Limits</h3>
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/10"
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}>
                <XCircle className="w-5 h-5 text-white/40 flex-shrink-0" />
                <span className="text-sm sm:text-base text-[#a3a3a3]">{problem.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 relative"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}>
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">The knXw Advantage</h3>
              <p className="text-sm sm:text-base text-[#a3a3a3] mb-6">
                Translate behavior into understanding
              </p>
              <div className="space-y-5">
                {solutions.map((solution, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4"
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}>
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                      <solution.icon className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{solution.title}</h4>
                      <p className="text-sm text-[#a3a3a3]">{solution.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}