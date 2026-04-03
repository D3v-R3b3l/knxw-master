import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroShader from '@/components/landing/HeroShader';
import SEOHead from '@/components/system/SEOHead';
import ArchitecturalBuildAnimation from '@/components/landing/ArchitecturalBuildAnimation';
import FooterSection from '@/components/landing/FooterSection';
import SectionNavDots from '@/components/landing/SectionNavDots';
import CustomCursor from '@/components/ui/CustomCursor';
import { ConsentProvider } from '@/components/privacy/ConsentManager';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { HelmetProvider } from 'react-helmet-async';
import LandingBlindSpotSection from '@/components/landing/LandingBlindSpotSection';
import LandingExplainerSection from '@/components/landing/LandingExplainerSection';
import LandingHowItWorksSection from '@/components/landing/LandingHowItWorksSection';
import AdaptiveSDKShowcaseSection from '@/components/landing/AdaptiveSDKShowcaseSection';
import LandingBusinessImpactSection from '@/components/landing/LandingBusinessImpactSection';

function HeroContent({ heroRef }) {
  const contentRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const heroSection = heroRef?.current;
    const content = contentRef.current;

    if (heroSection && content) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });

      tl.to(content.querySelectorAll('[data-parallax-layer="1"]'), { yPercent: 50, scale: 0.9, opacity: 0, ease: 'none' }, 0);
      tl.to(content.querySelectorAll('[data-parallax-layer="2"]'), { yPercent: 70, scale: 0.85, opacity: 0, ease: 'none' }, 0);
      tl.to(content.querySelectorAll('[data-parallax-layer="3"]'), { yPercent: 90, scale: 0.8, opacity: 0, ease: 'none' }, 0);
      tl.to(content.querySelectorAll('[data-parallax-layer="4"]'), { yPercent: 120, scale: 0.75, opacity: 0, ease: 'none' }, 0);
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [heroRef]);

  return (
    <div ref={contentRef} className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <motion.div data-parallax-layer="1" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: 'easeOut' }}>
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-white mix-blend-difference leading-tight md:leading-none break-words">
          Finally, your product <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
            understands why.
          </span>
        </h1>
      </motion.div>

      <motion.div data-parallax-layer="2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}>
        <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto font-light leading-relaxed mb-12">
          knXw is a runtime intelligence layer that interprets user behavior and feeds that understanding back into your system so it can adapt what it does in real time.
        </p>
      </motion.div>

      <motion.div data-parallax-layer="3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={() => document.getElementById('sdk')?.scrollIntoView({ behavior: 'smooth' })}
          className="group relative overflow-hidden px-8 py-4 font-bold text-lg text-white rounded-lg transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] w-full sm:w-auto"
          style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)', boxShadow: '0 0 30px rgba(0,212,255,0.35), 0 4px 20px rgba(0,0,0,0.5)' }}
        >
          See How It Executes
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
        </button>
        <button
          onClick={() => window.location.href = createPageUrl('Documentation')}
          className="px-8 py-4 font-bold text-lg text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 w-full sm:w-auto"
        >
          Read the SDK
        </button>
      </motion.div>

      <motion.div data-parallax-layer="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }} className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-mono uppercase tracking-widest">
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>Not analytics</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>Not personalization</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Runtime interpretation</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>System execution</span>
      </motion.div>
    </div>
  );
}

function ClosingSection() {
  return (
    <section id="closing" className="py-28 md:py-40 bg-gradient-to-b from-black via-[#080808] to-[#111] text-center border-t border-white/10 overflow-hidden relative">
      <ArchitecturalBuildAnimation />
      <div data-parallax-bg className="absolute inset-0 h-[150%] -top-[25%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.12),transparent_50%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/8 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h2 data-parallax="slow" className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
          Understanding is only useful if it changes behavior.
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-3xl mx-auto">
          knXw connects interpretation to execution so your system can act with context, not just data.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">
          <button
            onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
            className="group relative overflow-hidden px-12 py-6 font-bold text-xl text-white rounded-lg transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)', boxShadow: '0 0 40px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.5)' }}
          >
            Get Started
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
          </button>
          <button
            onClick={() => window.location.href = createPageUrl('Pricing')}
            className="px-12 py-6 font-bold text-xl text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300"
          >
            Request Access
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const heroSectionRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
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

    const snapSections = ['hero', 'blind-spot', 'missing-layer', 'mechanism', 'sdk', 'outcomes', 'closing'];
    let isSnapping = false;
    let snapTimeout;

    const snapToNearestSection = () => {
      if (isSnapping) return;
      const windowHeight = window.innerHeight;
      let closestSection = null;
      let closestDistance = Infinity;

      snapSections.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distanceFromViewport = Math.abs(rect.top);
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

    const initTimeout = setTimeout(() => {
      const main = mainRef.current || document.getElementById('landing-main');
      if (!main) return;

      const sections = main.querySelectorAll('[data-scroll-section]');
      sections.forEach((section) => {
        gsap.set(section, { opacity: 0, y: 80, visibility: 'visible' });
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            end: 'top 45%',
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
      });

      const parallaxBgs = main.querySelectorAll('[data-parallax-bg]');
      parallaxBgs.forEach((bg) => {
        const parentSection = bg.closest('section') || bg.parentElement;
        gsap.to(bg, {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: parentSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
      });

      const parallaxSlow = main.querySelectorAll('[data-parallax="slow"]');
      parallaxSlow.forEach((el) => {
        gsap.to(el, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      });

      setTimeout(() => ScrollTrigger.refresh(true), 100);
    }, 400);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(snapTimeout);
      window.removeEventListener('scroll', handleScrollEnd);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis?.destroy();
    };
  }, []);

  return (
    <HelmetProvider>
      <ConsentProvider>
        <SEOHead
          title="knXw - Runtime Intelligence Layer"
          description="knXw is a runtime intelligence layer that interprets user behavior and feeds that understanding back into your system so it can adapt what it does in real time."
          keywords="runtime intelligence layer, behavior interpretation, real-time system adaptation, adaptive runtime sdk, execution layer"
        />

        <div className="bg-black min-h-screen text-white cursor-none selection:bg-cyan-500/30">
          <CustomCursor />
          <Navbar />
          <SectionNavDots />

          <main ref={mainRef} className="relative z-10" id="landing-main">
            <section id="hero" ref={heroSectionRef} className="relative h-screen w-full overflow-hidden bg-[#050505] pt-20 md:pt-0">
              <div className="fixed inset-0 h-screen w-full" style={{ zIndex: 1 }}>
                <HeroShader />
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>
              <div className="relative h-full flex items-center justify-center pt-16 md:pt-0" style={{ zIndex: 5 }}>
                <HeroContent heroRef={heroSectionRef} />
              </div>
              <motion.div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50" style={{ zIndex: 6 }} animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ArrowDown className="w-6 h-6" />
              </motion.div>
            </section>

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
              <div id="sdk" data-scroll-section>
                <AdaptiveSDKShowcaseSection />
              </div>
              <div id="outcomes" data-scroll-section>
                <LandingBusinessImpactSection />
              </div>
              <div id="closing" data-scroll-section>
                <ClosingSection />
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