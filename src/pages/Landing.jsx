import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroShader from '@/components/landing/HeroShader';
import { ArrowDown } from 'lucide-react';
import PhilosophySection from '@/components/landing/PhilosophySection';
import PlatformFeatures from '@/components/landing/PlatformFeatures';
import IntegrationsMarquee from '@/components/landing/IntegrationsMarquee';
import UseCasesGrid from '@/components/landing/UseCasesGrid';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import FooterSection from '@/components/landing/FooterSection';
import CustomCursor from '@/components/ui/CustomCursor';
import { ConsentProvider } from '@/components/privacy/ConsentManager';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";

export default function LandingPage() {
  return (
    <ConsentProvider>
      <div className="bg-black min-h-screen text-white cursor-none selection:bg-cyan-500/30">
        <CustomCursor />
        <Navbar />
        
        <main className="relative z-10">
          {/* Hero Section with Shader */}
          <section className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center py-20 md:py-0">
            <HeroShader />
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full"
            >
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-white mix-blend-difference leading-tight md:leading-none break-words">
                The Universal <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                  Intelligence Layer
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
                Psychographic intelligence that understands <span className="text-white font-medium">why</span> users do what they do—across web, mobile, games, and any digital environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] w-full sm:w-auto">
                  Get Started
                </button>
                <button onClick={() => window.location.href = '/Documentation'} className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto">
                  API Docs
                </button>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/50"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-6 h-6" />
            </motion.div>
          </section>
          <PhilosophySection />
          
          {/* Infrastructure Section - Quick Insert */}
          <section id="features" className="py-20 md:py-24 bg-[#050505] border-b border-white/5 overflow-hidden">
             <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16">
                   <h2 className="text-4xl font-bold mb-8">Built as Universal Infrastructure</h2>
                   <p className="text-xl text-gray-400">Foundational cognitive layer for human understanding across every digital touchpoint</p>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                   {[
                     { title: "Event Ingestion", desc: "Real-time data capture from any source with sub-100ms latency." },
                     { title: "AI Intelligence", desc: "Multi-layer inference engine for psychographic profiling." },
                     { title: "Developer APIs", desc: "RESTful APIs and SDKs for seamless integration." },
                     { title: "Activation", desc: "Turn insights into adaptive experiences instantly." }
                   ].map((item, i) => (
                      <div key={i} className="border-l border-white/20 pl-6">
                         <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                         <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                   ))}
                </div>
             </div>
          </section>

          <PlatformFeatures />
          
          {/* Enterprise Section */}
          <section className="py-20 md:py-24 bg-black border-y border-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
               <div>
                  <span className="text-purple-500 font-bold text-sm uppercase tracking-wider mb-2 block">BUSINESS+</span>
                  <h2 className="text-5xl font-bold mb-6">Enterprise-Grade Infrastructure</h2>
                  <p className="text-xl text-gray-400 mb-8">Security, reliability, and compliance built for mission-critical deployments</p>
                  
                  <div className="grid gap-6">
                     {[
                       { title: "Advanced Security", items: ["SOC 2 Ready", "End-to-end encryption", "GDPR Ready"] },
                       { title: "System Monitoring", items: ["99.9% uptime SLA", "Real-time health checks", "Auto-scaling"] },
                       { title: "Enterprise Integration", items: ["SAML/OIDC SSO", "Data warehouse sync", "SIEM integration"] }
                     ].map((grp, i) => (
                        <div key={i}>
                           <h4 className="font-bold text-white mb-2">{grp.title}</h4>
                           <div className="flex gap-4 flex-wrap">
                              {grp.items.map((it, j) => (
                                 <span key={j} className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">{it}</span>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="relative">
                   {/* Abstract visual representation of security/infrastructure */}
                   <div className="aspect-square rounded-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_70%)]" />
                      <div className="w-2/3 h-2/3 rounded-full border border-purple-500/30 animate-pulse" />
                      <div className="w-1/3 h-1/3 rounded-full border border-cyan-500/30 animate-ping" style={{ animationDuration: '3s' }} />
                   </div>
               </div>
            </div>
          </section>

          <IntegrationsMarquee />

          {/* Interactive Demo Teaser */}
          <section className="py-20 md:py-24 bg-[#080808] text-center overflow-hidden">
             <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-5xl font-bold mb-6">Intuitive Intelligence</h2>
                <p className="text-xl text-gray-400 mb-12">Complex psychological analytics made beautifully simple</p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12 text-left">
                   <div className="bg-[#111] p-8 rounded-2xl border border-white/10">
                      <h3 className="text-xl font-bold text-white mb-2">Real-Time Dashboard</h3>
                      <p className="text-gray-400">Live psychographic insights with actionable metrics at a glance.</p>
                   </div>
                   <div className="bg-[#111] p-8 rounded-2xl border border-white/10">
                      <h3 className="text-xl font-bold text-white mb-2">Deep User Profiles</h3>
                      <p className="text-gray-400">Understand individual psychology, motivations, and cognitive patterns.</p>
                   </div>
                </div>

                <button 
                  onClick={() => window.location.href = '/InteractiveDemo'}
                  className="px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform"
                >
                   Try Interactive Demo
                </button>
             </div>
          </section>

          <UseCasesGrid />
          <PricingSection />
          
          {/* Vision Text */}
          <section className="py-20 md:py-24 bg-black text-center px-6 overflow-hidden">
             <p className="text-2xl md:text-4xl font-light text-gray-400 max-w-5xl mx-auto leading-normal">
               "knXw is not just another analytics tool or AI assistant; it is the framework for a more <span className="text-white">connected, intelligent, and human-centered</span> digital world."
             </p>
          </section>

          <FAQSection />

          {/* Final CTA */}
          <section className="py-20 md:py-24 bg-gradient-to-b from-black to-[#111] text-center border-t border-white/10 overflow-hidden">
             <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter">
                   Start Building Today
                </h2>
                <p className="text-xl text-gray-400 mb-12">Join developers deploying psychographic intelligence at scale</p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                   <button onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} className="px-10 py-5 bg-cyan-500 text-black font-bold text-xl rounded-full hover:bg-cyan-400 transition-colors shadow-[0_0_50px_-10px_rgba(6,182,212,0.5)]">
                      Start Building Free
                   </button>
                   <button onClick={() => window.location.href = '/Documentation'} className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold text-xl rounded-full hover:bg-white/10 transition-colors">
                      View Docs
                   </button>
                </div>
                
                <div className="flex gap-8 justify-center text-sm text-gray-500 font-mono uppercase tracking-wider">
                   <span>No credit card required</span>
                   <span>•</span>
                   <span>Full API access</span>
                   <span>•</span>
                   <span>Free forever plan</span>
                </div>
             </div>
          </section>
        </main>

        <FooterSection />
      </div>
    </ConsentProvider>
  );
}