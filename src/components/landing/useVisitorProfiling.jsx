import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useVisitorProfiling
 * 
 * Tracks real visitor behavior on the landing page and infers a psychographic
 * profile using client-side heuristics — exactly as knXw does for customers.
 * 
 * Signals tracked:
 * - Time spent on each section (attention depth)
 * - Scroll velocity & depth (urgency vs deliberation)
 * - Click targets (pricing-seeking, docs-seeking, demo-seeking)
 * - Hover dwell on feature cards (curiosity patterns)
 * - Number of return visits (commitment vs casual browsing)
 */

function inferProfile(signals) {
  const {
    pricingDwell,    // ms on pricing section
    docsDwell,       // ms on docs / developer section
    demoDwell,       // ms on demo section
    featureClicks,   // count
    pricingClicks,   // count
    docsClicks,      // count
    scrollVelocity,  // avg px/s
    scrollDepth,     // 0-1
    totalDwell,      // total ms on page
    sessionCount,    // from localStorage
    hoverCount,      // feature card hovers
  } = signals;

  // ── Motivation inference ──────────────────────────────────────────────────
  const motivations = [];

  // Pricing-focused → ROI / achievement
  if (pricingDwell > 8000 || pricingClicks > 0) motivations.push('achievement');
  // Developer / docs focus → autonomy / mastery
  if (docsDwell > 6000 || docsClicks > 0) motivations.push('autonomy');
  // Deep scrolling with low velocity → curiosity / exploration
  if (scrollDepth > 0.6 && scrollVelocity < 300) motivations.push('curiosity');
  // Long total dwell + many hovers → thoroughness / mastery
  if (totalDwell > 60000 && hoverCount > 4) motivations.push('mastery');
  // Demo-focused → learning / exploration
  if (demoDwell > 5000) motivations.push('learning');
  // Return visitor → commitment / belonging
  if (sessionCount > 2) motivations.push('belonging');

  if (motivations.length === 0) motivations.push('curiosity'); // default

  // ── Risk profile ──────────────────────────────────────────────────────────
  let risk_profile = 'moderate';
  if (pricingClicks > 0 || sessionCount > 3) risk_profile = 'aggressive';
  else if (totalDwell > 90000 && featureClicks === 0) risk_profile = 'conservative';

  // ── Cognitive style ───────────────────────────────────────────────────────
  let cognitive_style = 'analytical';
  if (scrollVelocity > 500 && hoverCount < 3) cognitive_style = 'intuitive';
  else if (docsClicks > 0 || docsDwell > 8000) cognitive_style = 'systematic';
  else if (demoDwell > 8000 && hoverCount > 6) cognitive_style = 'creative';

  // ── Mood ──────────────────────────────────────────────────────────────────
  let mood = 'neutral';
  if (pricingClicks > 0 && totalDwell < 45000) mood = 'confident';
  else if (totalDwell > 120000 && featureClicks === 0) mood = 'uncertain';
  else if (scrollDepth > 0.8) mood = 'positive';
  else if (hoverCount > 8 && featureClicks === 0) mood = 'anxious';

  // ── Confidence score (how much data we have) ──────────────────────────────
  let confidence = 0;
  if (totalDwell > 5000) confidence += 0.2;
  if (scrollDepth > 0.2) confidence += 0.15;
  if (hoverCount > 0) confidence += 0.15;
  if (featureClicks + pricingClicks + docsClicks > 0) confidence += 0.25;
  if (sessionCount > 1) confidence += 0.25;
  confidence = Math.min(confidence, 1);

  return {
    motivation_labels: motivations,
    risk_profile,
    cognitive_style,
    emotional_state: { mood, confidence_score: confidence },
    personality_traits: {
      openness: motivations.includes('curiosity') || motivations.includes('learning') ? 0.8 : 0.5,
      conscientiousness: risk_profile === 'conservative' ? 0.85 : 0.6,
      extraversion: motivations.includes('belonging') ? 0.75 : 0.4,
    },
    confidence,
    signals, // expose raw signals for the reveal panel
  };
}

export default function useVisitorProfiling() {
  const [profile, setProfile] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const signals = useRef({
    pricingDwell: 0,
    docsDwell: 0,
    demoDwell: 0,
    featureClicks: 0,
    pricingClicks: 0,
    docsClicks: 0,
    scrollVelocity: 0,
    scrollDepth: 0,
    totalDwell: 0,
    sessionCount: 1,
    hoverCount: 0,
  });
  const sectionTimers = useRef({});
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const velocities = useRef([]);
  const pageEnterTime = useRef(Date.now());
  const updateTimer = useRef(null);

  const recompute = useCallback(() => {
    signals.current.totalDwell = Date.now() - pageEnterTime.current;
    const inferred = inferProfile(signals.current);
    setProfile(inferred);
    setConfidence(inferred.confidence);
  }, []);

  const scheduleUpdate = useCallback(() => {
    clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(recompute, 800);
  }, [recompute]);

  useEffect(() => {
    // Session count from localStorage
    try {
      const count = parseInt(localStorage.getItem('knxw_visit_count') || '0') + 1;
      localStorage.setItem('knxw_visit_count', String(count));
      signals.current.sessionCount = count;
    } catch {}

    // ── Scroll tracking ───────────────────────────────────────────────────
    const handleScroll = () => {
      const now = Date.now();
      const y = window.scrollY;
      const dt = (now - lastScrollTime.current) / 1000;
      if (dt > 0) {
        const v = Math.abs(y - lastScrollY.current) / dt;
        velocities.current.push(v);
        if (velocities.current.length > 20) velocities.current.shift();
        signals.current.scrollVelocity =
          velocities.current.reduce((a, b) => a + b, 0) / velocities.current.length;
      }
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      signals.current.scrollDepth = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      lastScrollY.current = y;
      lastScrollTime.current = now;
      scheduleUpdate();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ── Section dwell tracking via IntersectionObserver ───────────────────
    const sectionMap = {
      pricing: 'pricingDwell',
      developers: 'docsDwell',
      'demo-section': 'demoDwell',
      docs: 'docsDwell',
    };

    const observers = [];
    Object.entries(sectionMap).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            sectionTimers.current[key] = Date.now();
          } else if (sectionTimers.current[key]) {
            signals.current[key] += Date.now() - sectionTimers.current[key];
            delete sectionTimers.current[key];
            scheduleUpdate();
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    // ── Click tracking ────────────────────────────────────────────────────
    const handleClick = (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      const text = (target.textContent || '').toLowerCase();
      const href = (target.getAttribute('href') || '').toLowerCase();
      if (text.includes('pric') || href.includes('pric')) signals.current.pricingClicks++;
      else if (text.includes('doc') || text.includes('api') || href.includes('doc')) signals.current.docsClicks++;
      else if (text.includes('demo') || text.includes('start') || text.includes('build')) signals.current.featureClicks++;
      scheduleUpdate();
    };
    document.addEventListener('click', handleClick);

    // ── Hover tracking on feature cards ──────────────────────────────────
    let hoverDebounce = null;
    const handleMouseover = (e) => {
      const card = e.target.closest('[data-feature-card]');
      if (!card) return;
      clearTimeout(hoverDebounce);
      hoverDebounce = setTimeout(() => {
        signals.current.hoverCount++;
        scheduleUpdate();
      }, 600); // only count hovers > 600ms
    };
    document.addEventListener('mouseover', handleMouseover);

    // ── Periodic total dwell update ───────────────────────────────────────
    const dwellInterval = setInterval(recompute, 8000);

    // Initial profile after 3s of data
    const initTimeout = setTimeout(recompute, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseover);
      observers.forEach(obs => obs.disconnect());
      clearInterval(dwellInterval);
      clearTimeout(initTimeout);
      clearTimeout(updateTimer.current);
    };
  }, [scheduleUpdate, recompute]);

  return { profile, confidence };
}