import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useConsent } from '@/components/privacy/ConsentManager';
import { Shield, RotateCcw } from 'lucide-react';

export default function FooterSection() {
  const { resetConsent } = useConsent();

  return (
    <footer className="bg-black text-gray-400 py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-3xl font-bold text-white tracking-tighter mb-6 block">
              knXw
            </Link>
            <p className="text-lg max-w-sm mb-8">
              The psychographic intelligence platform for understanding user psychology.
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Shield className="w-3 h-3 text-green-500" />
                  SOC 2 Type II
               </div>
               <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Shield className="w-3 h-3 text-blue-500" />
                  GDPR Ready
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

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            © 2025 knXw • Intelligence Platform
          </div>
          <div className="flex gap-6 text-sm">
             {/* Social links or other footer items can go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}