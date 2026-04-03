import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useConsent } from '@/components/privacy/ConsentManager';
import { Shield, RotateCcw } from 'lucide-react';

export default function FooterSection() {
  const { resetConsent } = useConsent();

  return (
    <footer className="border-t border-white/10 bg-[#020202] py-20 text-white/48">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-12 rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-10 backdrop-blur-2xl"
        >
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.24em] text-white/45 mb-4">Built for runtime adaptation</div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-white mb-4">A calmer, clearer interface for a more powerful idea.</h3>
            <p className="text-base md:text-lg text-white/60 leading-8">knXw turns behavioral signal into usable runtime meaning so software can respond with context while decisions are still in motion.</p>
          </div>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="mb-6 inline-flex items-center gap-3 text-white tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                <span className="text-sm font-semibold">k</span>
              </span>
              <span className="text-2xl font-semibold">knXw</span>
            </Link>
            <p className="mb-8 max-w-sm text-lg leading-8 text-white/52">
              The psychographic intelligence platform for understanding user psychology.
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Shield className="w-3 h-3 text-green-500" />
                  Data Encrypted
               </div>
               <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Shield className="w-3 h-3 text-blue-500" />
                  Privacy Focused
               </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><Link to={createPageUrl('Documentation')} className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
              <li><Link to={createPageUrl('Blog')} className="hover:text-cyan-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to={createPageUrl('Support')} className="hover:text-cyan-400 transition-colors">Contact</Link></li>
              <li><Link to={createPageUrl('Privacy')} className="hover:text-cyan-400 transition-colors">Privacy</Link></li>
              <li><Link to={createPageUrl('Terms')} className="hover:text-cyan-400 transition-colors">Terms</Link></li>
              <li>
                <button onClick={resetConsent} className="flex items-center gap-2 hover:text-white transition-colors text-sm">
                  <RotateCcw className="w-3 h-3" /> Reset Cookie Consent
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex justify-center md:justify-start items-center">
          <div className="text-sm">
            © 2026 knXw • Intelligence Platform
          </div>
        </div>
      </div>
    </footer>
  );
}