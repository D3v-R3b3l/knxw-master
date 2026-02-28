import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code } from 'lucide-react';
import { createPageUrl } from '@/utils';
import CTABackgroundAnimation from './CTABackgroundAnimation';

export default function FinalCTA() {
  return (
    <section className="py-32 md:py-48 bg-gradient-to-b from-black via-[#0a0014] to-black relative overflow-hidden">
      {/* Atmospheric data flow background */}
      <CTABackgroundAnimation />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px]">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Build the future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400">
              where software understands.
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join the developers deploying psychographic intelligence at scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="group relative overflow-hidden inline-flex items-center gap-2 px-12 py-5 font-bold text-lg text-white rounded-lg transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
                boxShadow: '0 0 40px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.5)'
              }}
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = createPageUrl('Documentation')}
              className="inline-flex items-center gap-2 px-12 py-5 font-medium text-lg text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 transition-all duration-300"
            >
              <Code className="w-5 h-5" />
              View Documentation
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600"
          >
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              Free forever plan
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Full API access
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}