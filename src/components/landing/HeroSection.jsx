import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Globe, Gamepad2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import HeroNeuralGraph from '../visuals/HeroNeuralGraph';
import LivePersonalizationDemo from '../marketing/LivePersonalizationDemo';

export default function HeroSection({ onGetStarted, adaptations = {}, profile = null }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  const headline = adaptations.headline || "The Universal Intelligence Layer";
  const description = adaptations.heroDescription || "Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment.";
  const ctaText = adaptations.ctaText || "Get Started";

  const handleStartBuilding = () => {
    window.location.href = createPageUrl('Dashboard');
  };

  const handleViewDocs = () => {
    window.location.href = createPageUrl('Documentation');
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Updated shader with white/soft glow instead of cyan */}
      <HeroNeuralGraph
        className="absolute inset-0 -z-10"
        nodeCount={420}
        distance={950}
        palette={["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.2)"]}
        orbitSpeed={0.0004} />

      <motion.div 
        style={{ opacity: prefersReducedMotion ? 1 : opacity }}
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 -z-5" />

      {profile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-24 right-6 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl p-3 z-20 hidden lg:block">
          <div className="text-xs text-white/80 font-medium mb-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            Live Personalization
          </div>
          <div className="text-xs text-[#a3a3a3]">
            {profile.cognitive_style} • {profile.risk_profile}
          </div>
          <LivePersonalizationDemo profile={profile} />
        </motion.div>
      )}

      <motion.div 
        style={{ y: prefersReducedMotion ? 0 : y }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="text-center max-w-5xl mx-auto">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            style={{ 
              textShadow: '0 0 60px rgba(255, 255, 255, 0.1), 0 4px 30px rgba(0, 0, 0, 0.8)'
            }}>
            {headline}
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#a3a3a3] mb-10 sm:mb-12 leading-relaxed max-w-3xl mx-auto"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}>
            {description}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.4 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                onClick={handleStartBuilding}
                className="bg-white text-[#0a0a0a] hover:bg-white/90 font-black px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-2xl shadow-white/20 w-full sm:w-auto"
                style={{ boxShadow: '0 0 40px rgba(255, 255, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.5)' }}>
                {ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                onClick={handleViewDocs}
                className="px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full border-2 border-white/20 bg-transparent text-white hover:bg-white/5 font-bold w-full sm:w-auto">
                <Code className="w-5 h-5 mr-2" />
                API Docs
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}>
            {[
              { icon: Globe, label: "Web & Mobile", sub: "JS/React SDK" },
              { icon: Gamepad2, label: "Game Engines", sub: "Unity/Unreal" },
              { icon: Code, label: "REST API", sub: "Any Platform" }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                whileHover={{ y: -4 }}>
                <item.icon className="w-6 h-6 text-white/80" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-[#6b7280]">{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-8 sm:mt-10 text-xs sm:text-sm text-[#6b7280]"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Free tier</span>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">No credit card</span>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Full access</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}