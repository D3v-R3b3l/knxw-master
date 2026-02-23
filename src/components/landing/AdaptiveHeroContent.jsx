import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowDown } from 'lucide-react';
import { useLandingProfile, adaptText } from './LandingPsychographicContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// All copy variants keyed by psychographic signal
const HEADLINE_VARIANTS = {
  baseText: 'The Universal\nIntelligence Layer',
  motivationVariants: {
    achievement:  'The Platform Built\nfor Results',
    mastery:      'The Platform Built\nfor Mastery',
    autonomy:     'Intelligence You\nControl Completely',
    curiosity:    'What If Your Product\nUnderstood Everyone?',
    learning:     'Build Products That\nLearn Their Users',
    belonging:    'Intelligence That Brings\nYour Team Together',
  },
  riskVariants: {
    aggressive:   'Start Building.\nResults from Day One.',
    conservative: 'The Reliable\nIntelligence Layer',
  },
};

const SUBHEAD_VARIANTS = {
  baseText: 'Psychographic intelligence that understands why users do what they do — across web, mobile, games, and any digital environment.',
  motivationVariants: {
    achievement:  'Stop guessing. Start knowing. knXw converts behavioral signals into actionable psychographic profiles that drive measurable outcomes.',
    mastery:      'Deep behavioral inference, custom dimensions, and a self-learning AI loop — built for teams who demand precision.',
    autonomy:     'Full API access, no lock-in, and open SDKs. Connect psychographic intelligence to exactly the stack you choose.',
    curiosity:    'Real-time profiling reveals the motivations, cognitive styles, and emotional states hidden beneath every click and scroll.',
    learning:     'Adaptive UI components, psychographic APIs, and a feedback loop that makes your product smarter every single day.',
    belonging:    'A shared intelligence layer your entire team can build on — from product to marketing to engineering.',
  },
  riskVariants: {
    aggressive:   'Deploy in minutes. Psychographic profiles update in real time. Your first insight lands before you finish your coffee.',
    conservative: 'Enterprise-grade reliability. GDPR-compliant, fully auditable, and built for mission-critical deployments.',
  },
};

const CTA_PRIMARY_VARIANTS = {
  baseText: 'Get Started',
  motivationVariants: {
    achievement:  'Unlock Performance →',
    mastery:      'Start Building →',
    autonomy:     'Explore the API →',
    curiosity:    'See How It Works →',
    learning:     'Try the Demo →',
    belonging:    'Join the Platform →',
  },
  riskVariants: {
    aggressive:   'Start Free — Now →',
    conservative: 'Book a Demo →',
  },
};

const CTA_SECONDARY_VARIANTS = {
  baseText: 'API Docs',
  motivationVariants: {
    achievement:  'View Pricing',
    mastery:      'Read the Docs',
    autonomy:     'API Reference',
    curiosity:    'Interactive Demo',
    learning:     'See the SDK',
    belonging:    'Read Case Studies',
  },
};

export default function AdaptiveHeroContent({ heroRef }) {
  const contentRef = useRef(null);
  const { profile } = useLandingProfile();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const heroSection = heroRef?.current;
    const content = contentRef.current;
    if (!heroSection || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: 0.5 }
    });
    tl.to(content.querySelectorAll('[data-parallax-layer="1"]'), { yPercent: 50, scale: 0.9, opacity: 0, ease: 'none' }, 0);
    tl.to(content.querySelectorAll('[data-parallax-layer="2"]'), { yPercent: 70, scale: 0.85, opacity: 0, ease: 'none' }, 0);
    tl.to(content.querySelectorAll('[data-parallax-layer="3"]'), { yPercent: 90, scale: 0.8, opacity: 0, ease: 'none' }, 0);
    tl.to(content.querySelectorAll('[data-parallax-layer="4"]'), { yPercent: 120, scale: 0.75, opacity: 0, ease: 'none' }, 0);

    return () => ScrollTrigger.getAll().forEach(st => st.kill());
  }, [heroRef]);

  const headline = adaptText(profile, HEADLINE_VARIANTS);
  const subhead = adaptText(profile, SUBHEAD_VARIANTS);
  const ctaPrimary = adaptText(profile, CTA_PRIMARY_VARIANTS);
  const ctaSecondary = adaptText(profile, CTA_SECONDARY_VARIANTS);

  // Determine primary CTA action based on profile
  const primaryAction = () => {
    const mot = profile?.motivation_labels?.[0];
    if (mot === 'curiosity' || mot === 'learning') {
      window.location.href = createPageUrl('InteractiveDemo');
    } else if (mot === 'autonomy') {
      window.location.href = createPageUrl('Documentation');
    } else if (profile?.risk_profile === 'conservative') {
      document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const secondaryAction = () => {
    const mot = profile?.motivation_labels?.[0];
    if (mot === 'achievement') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else if (mot === 'curiosity' || mot === 'learning') {
      window.location.href = createPageUrl('InteractiveDemo');
    } else {
      window.location.href = createPageUrl('Documentation');
    }
  };

  return (
    <div ref={contentRef} className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Headline */}
      <motion.div
        data-parallax-layer="1"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-white mix-blend-difference leading-tight md:leading-none break-words transition-all duration-700">
          {headline.split('\n').map((line, i) => (
            <span key={i}>
              {i === 1 ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                  {line}
                </span>
              ) : line}
              {i < headline.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h1>
      </motion.div>

      {/* Subhead */}
      <motion.div
        data-parallax-layer="2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        key={subhead} // re-animate when text changes
      >
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-12 transition-all duration-700">
          {subhead}
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        data-parallax-layer="3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <button
          onClick={primaryAction}
          className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] w-full sm:w-auto"
        >
          {ctaPrimary}
        </button>
        <button
          onClick={secondaryAction}
          className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
        >
          {ctaSecondary}
        </button>
      </motion.div>

      {/* Tags */}
      <motion.div
        data-parallax-layer="4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-mono uppercase tracking-widest"
      >
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />Web & Mobile</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />Game Engines</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />REST API</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />Any Platform</span>
      </motion.div>
    </div>
  );
}