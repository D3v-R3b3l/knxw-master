import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroShader from '@/components/landing/HeroShader';
import SEOHead from '@/components/system/SEOHead';
import BrainVisualization from '@/components/landing/BrainVisualization';
import { ArrowDown } from 'lucide-react';
import ArchitecturalBuildAnimation from '@/components/landing/ArchitecturalBuildAnimation';
import PlatformFeatures from '@/components/landing/PlatformFeatures';
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
import LandingBlindSpotSection from '@/components/landing/LandingBlindSpotSection';
import LandingExplainerSection from '@/components/landing/LandingExplainerSection';
import LandingHowItWorksSection from '@/components/landing/LandingHowItWorksSection';
import LandingPossibilitySection from '@/components/landing/LandingPossibilitySection';
import LandingGovernanceSection from '@/components/landing/LandingGovernanceSection';
import LandingBusinessImpactSection from '@/components/landing/LandingBusinessImpactSection';

function HeroContent({ heroRef }) {
  const contentRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const heroSection = heroRef?.current;
    const content = contentRef.current;

    if (heroSection && content) {
      // Hero content parallax with scale and opacity
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 0.5
        }
      });

      // Layer 1 - Title (slowest, scales down)
      tl.to(content.querySelectorAll('[data-parallax-layer="1"]'), {
        yPercent: 50,
        scale: 0.9,
        opacity: 0,
        ease: "none"
      }, 0);

      // Layer 2 - Description
      tl.to(content.querySelectorAll('[data-parallax-layer="2"]'), {
        yPercent: 70,
        scale: 0.85,
        opacity: 0,
        ease: "none"
      }, 0);

      // Layer 3 - Buttons
      tl.to(content.querySelectorAll('[data-parallax-layer="3"]'), {
        yPercent: 90,
        scale: 0.8,
        opacity: 0,
        ease: "none"
      }, 0);

      // Layer 4 - Tags (fastest)
      tl.to(content.querySelectorAll('[data-parallax-layer="4"]'), {
        yPercent: 120,
        scale: 0.75,
        opacity: 0,
        ease: "none"
      }, 0);
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [heroRef]);

  return (
    <div ref={contentRef} className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Title - Layer 1 (Slowest) */}
      <motion.div
        data-parallax-layer="1"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-white mix-blend-difference leading-tight md:leading-none break-words">
          The Missing <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
            Intelligence Layer
          </span>
        </h1>
      </motion.div>
      
      {/* Description - Layer 2 */}
      <motion.div
        data-parallax-layer="2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      >
        <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto font-light leading-relaxed mb-12">
          knXw gives digital systems a new perceptual and adaptive capability, turning behavioral, contextual, and psychographic signal into explainable, governed, real-time system behavior.
        </p>
      </motion.div>

      {/* Buttons - Layer 3 */}
      <motion.div
        data-parallax-layer="3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <button
          onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
          className="group relative overflow-hidden px-8 py-4 font-bold text-lg text-white rounded-lg transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] w-full sm:w-auto"
          style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)', boxShadow: '0 0 30px rgba(0,212,255,0.35), 0 4px 20px rgba(0,0,0,0.5)' }}
        >
          Start Building
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
        </button>
        <button
          onClick={() => window.location.href = createPageUrl('Documentation')}
          className="px-8 py-4 font-bold text-lg text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 w-full sm:w-auto"
        >
          API Docs
        </button>
      </motion.div>

      {/* Tags - Layer 4 (Fastest) */}
      <motion.div
        data-parallax-layer="4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-mono uppercase tracking-widest"
      >
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>Instrumentation</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>Runtime inference</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Adaptive UI SDK</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>Governed adaptation</span>
      </motion.div>
    </div>
  );
}

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
      'hero', 'blind-spot', 'missing-layer', 'mechanism', 'possibility', 'sdk', 'governance', 'outcomes', 'enterprise', 'pricing', 'faq', 'cta'
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
        <SEOHead 
        title="knXw - The Missing Intelligence Layer in Modern Software"
        description="knXw is the infrastructure layer that turns human signal into real-time, explainable system adaptation."
        keywords="human-aware software, runtime intelligence layer, psychographic inference, adaptive systems infrastructure, explainable adaptation"
      />
      
      {/* Noscript fallback for search engines and no-JS browsers */}
      <noscript>
        <div style={{ backgroundColor: '#000', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <header style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>knXw - The Missing Intelligence Layer</h1>
            <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '800px', margin: '0 auto 40px' }}>
              knXw turns human signal into live system intelligence, helping software interpret decision dynamics and adapt in real time.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/Dashboard" style={{ padding: '16px 32px', backgroundColor: '#fff', color: '#000', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>Get Started</a>
              <a href="/Documentation" style={{ padding: '16px 32px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>API Docs</a>
            </div>
          </header>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>What current software still misses</h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '20px' }}>
              Existing systems record actions. They do not understand the human logic producing them. knXw adds that missing layer.
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
              <HeroContent heroRef={heroSectionRef} />
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

          <div id="blind-spot" data-scroll-section>
            <LandingBlindSpotSection />
          </div>

          <div id="missing-layer" data-scroll-section>
            <LandingExplainerSection />
          </div>

          <div id="mechanism" data-scroll-section>
            <LandingHowItWorksSection />
          </div>

          <div id="possibility" data-scroll-section>
            <LandingPossibilitySection />
          </div>

          <div id="sdk" data-scroll-section>
            <AdaptiveSDKShowcaseSection />
          </div>

          <div id="platform" data-scroll-section>
            <PlatformFeatures />
          </div>
          
          <div id="governance" data-scroll-section>
            <LandingGovernanceSection />
          </div>

          <div id="ui-examples" data-scroll-section>
            <AdaptiveUIIndustryShowcase />
          </div>

          <div id="outcomes" data-scroll-section>
            <LandingBusinessImpactSection />
          </div>
          
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
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Enterprise readiness</h2>
                  <p className="text-xl text-gray-400 mb-10">Security posture, integration reality, observability, privacy controls, and auditability for serious deployment environments.</p>
                  
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


          <div id="pricing" data-scroll-section>
            <PricingSection />
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
                      Add the missing intelligence layer
                   </h2>
                   <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-3xl mx-auto">Turn human signal into governed, real-time system adaptation.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">
                  <button
                     onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
                     className="group relative overflow-hidden px-12 py-6 font-bold text-xl text-white rounded-lg transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97]"
                     style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)', boxShadow: '0 0 40px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.5)' }}
                  >
                     Start Building Free
                     <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                     <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                  </button>
                  <button
                     onClick={() => window.location.href = createPageUrl('Documentation')}
                     className="px-12 py-6 font-bold text-xl text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300"
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
      </ConsentProvider>
    </HelmetProvider>
  );
}