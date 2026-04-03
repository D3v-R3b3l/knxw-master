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
import { ArrowDown, ChevronRight } from 'lucide-react';
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

      tl.to(content.querySelectorAll('[data-parallax-layer="1"]'), { yPercent: 20, opacity: 0.18, ease: 'none' }, 0);
      tl.to(content.querySelectorAll('[data-parallax-layer="2"]'), { yPercent: 28, opacity: 0.12, ease: 'none' }, 0);
      tl.to(content.querySelectorAll('[data-parallax-layer="3"]'), { yPercent: 36, opacity: 0, ease: 'none' }, 0);
      tl.to(content.querySelectorAll('[data-parallax-layer="4"]'), { yPercent: 44, opacity: 0, ease: 'none' }, 0);
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [heroRef]);

  return (
    <div ref={contentRef} className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto w-full">
      <motion.div
        data-parallax-layer="1"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-white/70" />
          Runtime Intelligence Layer
        </div>
      </motion.div>

      <motion.div data-parallax-layer="1" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: 'easeOut' }}>
        <h1 className="mx-auto mt-10 mb-8 max-w-5xl text-balance text-[clamp(3rem,9vw,7.5rem)] font-semibold tracking-[-0.06em] leading-[0.95] text-white">
          Finally, your product
          <span className="block text-white/72">understands why.</span>
        </h1>
      </motion.div>

      <motion.div data-parallax-layer="2" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}>
        <p className="mx-auto mb-12 max-w-3xl text-lg font-normal leading-8 text-white/62 md:text-[22px] md:leading-9">
          knXw is a runtime intelligence layer that interprets user behavior and feeds that understanding back into your system so it can adapt what it does in real time.
        </p>
      </motion.div>

      <motion.div data-parallax-layer="3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={() => document.getElementById('sdk')?.scrollIntoView({ behavior: 'smooth' })}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(255,255,255,0.14)] sm:w-auto"
        >
          See How It Executes
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={() => window.location.href = createPageUrl('Documentation')}
          className="inline-flex w-full items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-7 py-4 text-base font-semibold text-white/88 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1] sm:w-auto"
        >
          Read the SDK
        </button>
      </motion.div>

      <motion.div data-parallax-layer="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.6 }} className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-white/48">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl">Not analytics</span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl">Not personalization</span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl">Runtime interpretation</span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl">System execution</span>
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
            style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)', boxShadow: '0 0 40px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.5)' }}>
            
            Get Started
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
          </button>
          <button
            onClick={() => window.location.href = createPageUrl('Pricing')}
            className="px-12 py-6 font-bold text-xl text-[#00d4ff] rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/70 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300">
            
            Request Access
          </button>
        </div>
      </div>
    </section>);

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
        infinite: false
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
        setTimeout(() => {isSnapping = false;}, 800);
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
            invalidateOnRefresh: true
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
            invalidateOnRefresh: true
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
            scrub: true
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
          keywords="runtime intelligence layer, behavior interpretation, real-time system adaptation, adaptive runtime sdk, execution layer" />
        

        <div className="bg-black min-h-screen text-white cursor-none selection:bg-cyan-500/30">
          <CustomCursor />
          <Navbar />
          <SectionNavDots />

          <main ref={mainRef} className="relative z-10" id="landing-main">
            <section id="hero" ref={heroSectionRef} className="relative min-h-screen w-full overflow-hidden bg-[#050505] pt-20 md:pt-0">
              <div className="fixed inset-0 h-screen w-full" style={{ zIndex: 1 }}>
                <HeroShader />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_32%)] pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
              </div>
              <div className="relative flex min-h-screen items-center justify-center pt-16 md:pt-0" style={{ zIndex: 5 }}>
                <div className="absolute inset-x-4 top-28 mx-auto hidden max-w-6xl lg:block">
                  <div className="grid grid-cols-3 gap-4 opacity-90">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Signal</div>
                      <div className="mt-3 text-sm leading-6 text-white/72">Read behavior as it forms, not after it gets reduced to a chart.</div>
                    </div>
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Inference</div>
                      <div className="mt-3 text-sm leading-6 text-white/72">Interpret hesitation, confidence, urgency, and intent in-session.</div>
                    </div>
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Execution</div>
                      <div className="mt-3 text-sm leading-6 text-white/72">Feed that understanding back into the product while there is still time to act.</div>
                    </div>
                  </div>
                </div>
                <HeroContent heroRef={heroSectionRef} />
              </div>
              <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/42" style={{ zIndex: 6 }} animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
                <ArrowDown className="w-5 h-5" />
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
    </HelmetProvider>);

}