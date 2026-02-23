import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroShader from '@/components/landing/HeroShader';
import SEOHead from '@/components/system/SEOHead';
import BrainVisualization from '@/components/landing/BrainVisualization';
import { ArrowDown } from 'lucide-react';
import PhilosophySection from '@/components/landing/PhilosophySection';
import AnimatedPaths from '@/components/landing/AnimatedPaths';
import ArchitecturalBuildAnimation from '@/components/landing/ArchitecturalBuildAnimation';
import PlatformFeatures from '@/components/landing/PlatformFeatures';
import IntegrationsMarquee from '@/components/landing/IntegrationsMarquee';
import UseCasesGrid from '@/components/landing/UseCasesGrid';
import AnimatedStats from '@/components/landing/AnimatedStats';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import FooterSection from '@/components/landing/FooterSection';
import SectionNavDots from '@/components/landing/SectionNavDots';
import CustomCursor from '@/components/ui/CustomCursor';
import { ConsentProvider } from '@/components/privacy/ConsentManager';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { HelmetProvider } from 'react-helmet-async';
import AdaptiveSDKShowcaseSection from '@/components/landing/AdaptiveSDKShowcaseSection';
import AdaptiveUIIndustryShowcase from '@/components/landing/AdaptiveUIIndustryShowcase';
import AdaptiveLandingDemo from '@/components/landing/AdaptiveLandingDemo';
import { LandingPsychographicProvider } from '@/components/landing/LandingPsychographicContext';
import VisitorProfileReveal from '@/components/landing/VisitorProfileReveal';
import AdaptiveHeroContent from '@/components/landing/AdaptiveHeroContent';

// HeroContent is now handled by AdaptiveHeroContent (psychographic-aware)

export default function LandingPage() {
  const heroSectionRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis for smooth scrolling with snap
    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
      });

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('Lenis init failed:', e);
    }

    // Section snap functionality
    const snapSections = [
      'hero', 'philosophy', 'features', 'platform', 'enterprise', 
      'integrations', 'demo-section', 'use-cases', 'stats', 'pricing', 'faq', 'cta'
    ];

    let isSnapping = false;
    let snapTimeout;

    const snapToNearestSection = () => {
      if (isSnapping) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      let closestSection = null;
      let closestDistance = Infinity;

      snapSections.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const distanceFromViewport = Math.abs(rect.top);

        // Only snap if section is close to viewport top (within 40% of window height)
        if (distanceFromViewport < windowHeight * 0.4 && distanceFromViewport < closestDistance) {
          closestDistance = distanceFromViewport;
          closestSection = el;
        }
      });

      if (closestSection && closestDistance > 20) {
        isSnapping = true;
        closestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isSnapping = false; }, 800);
      }
    };

    const handleScrollEnd = () => {
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(snapToNearestSection, 150);
    };

    window.addEventListener('scroll', handleScrollEnd, { passive: true });

    // Wait for DOM and all components to mount
    const initTimeout = setTimeout(() => {
      // Use document.getElementById as fallback
      const main = mainRef.current || document.getElementById('landing-main');
      if (!main) {
        console.warn('Main ref not found');
        return;
      }

      // Section fade-in animations
      const sections = main.querySelectorAll('[data-scroll-section]');
      
      sections.forEach((section, index) => {
        // Set initial hidden state
        gsap.set(section, { 
          opacity: 0, 
          y: 80,
          visibility: 'visible'
        });
        
        // Create scroll-triggered animation
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            end: "top 45%",
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
      });

      // Parallax backgrounds
      const parallaxBgs = main.querySelectorAll('[data-parallax-bg]');
      
      parallaxBgs.forEach((bg) => {
        const parentSection = bg.closest('section') || bg.parentElement;
        gsap.to(bg, {
          yPercent: -25,
          ease: "none",
          scrollTrigger: {
            trigger: parentSection,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
      });

      // Slow parallax elements
      const parallaxSlow = main.querySelectorAll('[data-parallax="slow"]');
      parallaxSlow.forEach((el) => {
        gsap.to(el, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      });

      // Fast parallax elements
      const parallaxFast = main.querySelectorAll('[data-parallax="fast"]');
      parallaxFast.forEach((el) => {
        gsap.to(el, {
          yPercent: -35,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      });

      // Force refresh after setup
      setTimeout(() => {
        ScrollTrigger.refresh(true);
        // ScrollTrigger refreshed
      }, 100);
    }, 400);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(snapTimeout);
      window.removeEventListener('scroll', handleScrollEnd);
      ScrollTrigger.getAll().forEach(st => st.kill());
      gsap.ticker.remove(lenis?.raf);
      lenis?.destroy();
    };
    }, []);

  return (
    <HelmetProvider>
      <ConsentProvider>
        <LandingPsychographicProvider>
        <SEOHead 
        title="knXw - Universal Intelligence Layer for Digital Environments"
        description="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI."
        keywords="psychographic intelligence, user analytics, behavioral analysis, AI insights, customer intelligence, user profiling, adaptive experiences"
      />
      
      {/* Noscript fallback for search engines and no-JS browsers */}
      <noscript>
        <div style={{ backgroundColor: '#000', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <header style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>knXw - The Universal Intelligence Layer</h1>
            <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '800px', margin: '0 auto 40px' }}>
              Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/Dashboard" style={{ padding: '16px 32px', backgroundColor: '#fff', color: '#000', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>Get Started</a>
              <a href="/Documentation" style={{ padding: '16px 32px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>API Docs</a>
            </div>
          </header>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>From Data to Understanding</h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '20px' }}>
              Redefine engagement across every domain: marketing becomes intuitive, education adapts to every learner, communication grows more empathetic, and decision-making becomes informed by understanding rather than assumption.
            </p>
          </section>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>Built as Universal Infrastructure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Event Ingestion</h3>
                <p style={{ color: '#9ca3af' }}>Real-time data capture from any source with sub-100ms latency.</p>
              </div>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>AI Intelligence</h3>
                <p style={{ color: '#9ca3af' }}>Multi-layer inference engine for psychographic profiling.</p>
              </div>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Developer APIs</h3>
                <p style={{ color: '#9ca3af' }}>RESTful APIs and SDKs for seamless integration.</p>
              </div>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Activation</h3>
                <p style={{ color: '#9ca3af' }}>Turn insights into adaptive experiences instantly.</p>
              </div>
            </div>
          </section>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>Enterprise-Grade Infrastructure</h2>
            <ul style={{ fontSize: '18px', color: '#9ca3af', lineHeight: '2' }}>
              <li>Encryption at rest & transit, Privacy focused, Data ownership</li>
              <li>Real-time health checks, Auto-scaling</li>
              <li>SSO support, Data warehouse sync, SIEM integration</li>
            </ul>
          </section>
          
          <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Join developers deploying psychographic intelligence at scale</p>
            <a href="/Dashboard" style={{ padding: '16px 32px', backgroundColor: '#06b6d4', color: '#000', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>Start Building Free</a>
          </footer>
        </div>
      </noscript>
      
      <div className="bg-black min-h-screen text-white cursor-none selection:bg-cyan-500/30">
        <CustomCursor />
        <Navbar />
        <SectionNavDots />
        
        <main ref={mainRef} className="relative z-10" id="landing-main">
          {/* Hero Section with Shader - Fixed Background */}
          <section id="hero" ref={heroSectionRef} className="relative h-screen w-full overflow-hidden bg-[#050505] pt-20 md:pt-0">
            {/* Fixed shader background - stays in place while content scrolls */}
            <div className="fixed inset-0 h-screen w-full" style={{ zIndex: 1 }}>
              <HeroShader />
              {/* Gradient fade at bottom for smooth transition */}
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
            
            {/* Hero content container - scrolls with parallax */}
            <div className="relative h-full flex items-center justify-center pt-16 md:pt-0" style={{ zIndex: 5 }}>
              <AdaptiveHeroContent heroRef={heroSectionRef} />
            </div>

            <motion.div 
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50"
              style={{ zIndex: 6 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-6 h-6" />
            </motion.div>
          </section>
          
          {/* Content sections container - sits above the fixed shader */}
          <div className="relative bg-black" style={{ zIndex: 10 }}>

          <div id="philosophy" data-scroll-section>
            <PhilosophySection />
          </div>

          {/* Infrastructure Section - Enhanced */}
          <div data-scroll-section>
          <section id="features" className="py-16 md:py-20 bg-[#050505] border-b border-white/5 overflow-hidden relative">
             {/* Parallax Background */}
             <div data-parallax-bg className="absolute inset-0 h-[130%] -top-[15%]">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_60%)]" />
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
               <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
             </div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]" />
             
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-16 text-center">
                   <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
                      Architecture
                   </span>
                   <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Built as Universal Infrastructure</h2>
                   <p className="text-xl text-gray-400 max-w-2xl mx-auto">Foundational cognitive layer for human understanding across every digital touchpoint</p>
                </div>
                <div className="grid md:grid-cols-4 gap-6">
                   {[
                     { title: "Event Ingestion", desc: "Real-time data capture from any source with sub-100ms latency.", num: "01" },
                     { title: "AI Intelligence", desc: "Multi-layer inference engine for psychographic profiling.", num: "02" },
                     { title: "Developer APIs", desc: "RESTful APIs and SDKs for seamless integration.", num: "03" },
                     { title: "Activation", desc: "Turn insights into adaptive experiences instantly.", num: "04" }
                   ].map((item, i) => (
                      <div 
                         key={i} 
                         className="group relative p-6 rounded-xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 hover:border-cyan-500/30 transition-all duration-500"
                      >
                         <div className="absolute top-4 right-4 text-4xl font-bold text-white/5 group-hover:text-cyan-500/10 transition-colors">{item.num}</div>
                         <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-transparent rounded-full mb-4" />
                         <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                         <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                   ))}
                </div>
             </div>
          </section>
          </div>

          <div data-scroll-section>
            <PlatformFeatures />
          </div>

          <div data-scroll-section>
            <AdaptiveLandingDemo />
          </div>
          
          {/* Enterprise Section - Enhanced */}
          <div id="enterprise" data-scroll-section>
          <section className="py-24 md:py-32 bg-black border-y border-white/10 overflow-hidden relative">
            {/* Parallax Background */}
            <div data-parallax-bg className="absolute inset-0 h-[140%] -top-[20%]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)]" />
              <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
              <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-[100px]" />
            </div>
            
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
               <div>
                  <span data-parallax="slow" className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 inline-block mb-6">
                     Enterprise
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Enterprise-Grade Infrastructure</h2>
                  <p className="text-xl text-gray-400 mb-10">Security, reliability, and compliance built for mission-critical deployments</p>
                  
                  <div className="space-y-6">
                    {[
                      { title: "Data Protection", items: ["Encryption at rest & transit", "Privacy focused", "Data ownership"], color: "#8b5cf6" },
                      { title: "System Monitoring", items: ["Real-time health checks", "Auto-scaling", "Performance monitoring"], color: "#06b6d4" },
                      { title: "Enterprise Integration", items: ["SSO support", "Data warehouse sync", "API access"], color: "#10b981" }
                    ].map((grp, i) => (
                        <div key={i} className="group">
                           <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: grp.color }} />
                              {grp.title}
                           </h4>
                           <div className="flex gap-3 flex-wrap">
                              {grp.items.map((it, j) => (
                                 <span 
                                    key={j} 
                                    className="text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors cursor-default"
                                 >
                                    {it}
                                 </span>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="relative hidden md:flex items-center justify-center h-[500px] w-full">
                   <div className="w-[450px] h-[450px]">
                     <BrainVisualization key="enterprise-brain" />
                   </div>
               </div>
            </div>
          </section>
          </div>

          <div id="integrations" data-scroll-section>
            <IntegrationsMarquee />
          </div>

          {/* Interactive Demo Teaser - Enhanced */}
          <div data-scroll-section>
          <section id="demo-section" className="py-24 md:py-32 bg-[#080808] text-center overflow-hidden relative">
          {/* Animated Paths Background */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatedPaths />
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-10">
             <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
                   Experience
                </span>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Intuitive Intelligence</h2>
                <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">Build adaptive UIs that automatically personalize to user psychology</p>
             </div>

             <div className="grid md:grid-cols-2 gap-6 mb-16 text-left">
                {[
                   { title: "Adaptive UI SDK", desc: "React components that automatically adapt to user motivations and psychology.", gradient: "from-cyan-500/20 to-blue-500/20" },
                   { title: "Real-Time Insights", desc: "Live psychographic analysis with explainable AI reasoning.", gradient: "from-purple-500/20 to-pink-500/20" }
                ].map((item, i) => (
                   <div 
                      key={i}
                      className={`group bg-gradient-to-br ${item.gradient} p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 relative overflow-hidden`}
                   >
                      <div className="absolute inset-0 bg-[#111] opacity-80 group-hover:opacity-70 transition-opacity" />
                      <div className="relative z-10">
                         <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                         <p className="text-gray-400">{item.desc}</p>
                      </div>
                   </div>
                ))}
             </div>

                <button 
                  onClick={() => window.location.href = createPageUrl('InteractiveDemo')}
                  className="group px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]"
                >
                   Try Interactive Demo
                   <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
             </div>
          </section>
          </div>

          <div id="use-cases" data-scroll-section>
            <UseCasesGrid />
          </div>
          
          {/* Adaptive UI SDK Showcase */}
          <div data-scroll-section>
            <AdaptiveSDKShowcaseSection />
          </div>
          
          {/* Adaptive UI Industry Use Cases */}
          <div data-scroll-section>
            <AdaptiveUIIndustryShowcase />
          </div>
          
          <div id="stats" data-scroll-section>
            <AnimatedStats />
          </div>
          <div data-scroll-section>
            <PricingSection />
          </div>
          
          {/* Vision Text - Enhanced */}
          <div data-scroll-section>
          <section className="py-24 md:py-32 bg-black text-center px-6 overflow-hidden relative">
             <div data-parallax-bg className="absolute inset-0 h-[130%] -top-[15%]">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_50%)]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-[150px]" />
             </div>
             <div className="relative z-10">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
                <p data-parallax="slow" className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-400 max-w-5xl mx-auto leading-relaxed">
                  "knXw is not just another analytics tool or AI assistant; it is the framework for a more{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400">
                     connected, intelligent, and human-centered
                  </span>{' '}
                  digital world."
                </p>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-12" />
             </div>
          </section>
          </div>

          <div id="faq" data-scroll-section>
            <FAQSection />
          </div>

          {/* Final CTA - Enhanced */}
          <div id="cta" data-scroll-section>
          <section className="py-28 md:py-40 bg-gradient-to-b from-black via-[#080808] to-[#111] text-center border-t border-white/10 overflow-hidden relative">
             {/* Architectural Build Animation */}
             <ArchitecturalBuildAnimation />
             
             {/* Parallax Background */}
             <div data-parallax-bg className="absolute inset-0 h-[150%] -top-[25%]">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.12),transparent_50%)]" />
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/8 rounded-full blur-[180px]" />
               <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
             </div>
             
             <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div>
                   <h2 data-parallax="slow" className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
                      Start Building{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Today</span>
                   </h2>
                   <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-2xl mx-auto">Join developers deploying psychographic intelligence at scale</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">
                   <button 
                      onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
                      className="group px-12 py-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-xl rounded-full hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] transition-all duration-300 transform hover:scale-105"
                   >
                      Start Building Free
                      <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                   <button 
                      onClick={() => window.location.href = createPageUrl('Documentation')} 
                      className="px-12 py-6 bg-transparent border-2 border-white/20 text-white font-bold text-xl rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                   >
                      View Docs
                   </button>
                </div>
                
                <div className="flex flex-wrap gap-6 md:gap-10 justify-center text-sm text-gray-500 font-mono uppercase tracking-wider">
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      No credit card required
                   </span>
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                      Full API access
                   </span>
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      Free forever plan
                   </span>
                </div>
             </div>
          </section>
          </div>
          </div>
        </main>

        <div className="relative" style={{ zIndex: 20 }}>
          <FooterSection />
        </div>
      </div>
        <VisitorProfileReveal />
        </LandingPsychographicProvider>
      </ConsentProvider>
    </HelmetProvider>
  );
}