
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Zap, TrendingUp, Target, Sparkles } from 'lucide-react';

const LivePersonalizationDemo = ({ className = "" }) => {
  const [profile, setProfile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const intervalRef = useRef(null);

  // Check if we're in development
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname.includes('dev') ||
     window.location.hostname.includes('preview'));

  // Generate or get user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem('knxw_demo_user_id');
    if (!storedUserId) {
      storedUserId = 'demo_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('knxw_demo_user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Track user interactions
  const trackEvent = useCallback(async (eventType, payload = {}) => {
    if (!userId) return;

    const eventData = {
      user_id: userId,
      event_type: eventType,
      event_payload: {
        ...payload,
        url: window.location.href,
        timestamp: Date.now()
      },
      device_info: {
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    try {
      const response = await fetch('/functions/captureEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        setEvents(prev => [...prev, { ...eventData, id: Math.random() }].slice(-10));
        console.log('Event tracked:', eventType);
      } else {
        console.warn('Event tracking failed:', response.status, await response.text());
      }
    } catch (error) {
      console.warn('Event tracking failed:', error);
    }
  }, [userId]);

  // Get user profile
  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/functions/getProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        console.log('Profile received:', profileData);
        return profileData;
      } else {
        console.warn('Profile fetch failed:', response.status);
      }
    } catch (error) {
      console.warn('Profile fetch failed:', error);
    }
    return null;
  }, [userId]);

  const getDefaultContent = useCallback(() => ({
    headline: "Understand the psychology behind every user decision.",
    subheading: "knXw doesn't just show what users do — it reveals why they do it, giving you clarity and instantly actionable insights.",
    cta: "See My Users' Motives →",
    urgency: "Free Analysis",
    style: 'default'
  }), []);

  // Content variations based on psychographic profile
  const getPersonalizedContent = useCallback((profileData) => {
    if (!profileData) return getDefaultContent();

    const { risk_profile, cognitive_style, emotional_state, motivation_stack_v2 } = profileData;
    
    // Determine primary motivation
    const primaryMotivation = motivation_stack_v2?.[0]?.label || 'achievement';
    
    // Risk-based content
    if (risk_profile === 'aggressive') {
      return {
        headline: "Breakthrough Your Revenue Ceiling with AI",
        subheading: "Stop leaving money on the table. Revolutionary psychographic targeting delivers 300%+ ROAS improvements for growth-focused businesses.",
        cta: "Unlock Growth Potential →",
        urgency: "Limited Beta Access",
        style: 'aggressive'
      };
    }
    
    if (risk_profile === 'conservative') {
      return {
        headline: "Proven, Data-Driven Growth for Established Businesses",
        subheading: "Fortune 500-trusted psychographic intelligence helps you understand customers deeply while maintaining compliance and security standards.",
        cta: "View Case Studies →",
        urgency: "Trusted by 500+ Companies",
        style: 'conservative'
      };
    }

    // Motivation-based content
    if (primaryMotivation === 'security') {
      return {
        headline: "Build Sustainable, Predictable Revenue Growth",
        subheading: "Reduce customer acquisition risk with psychographic intelligence that identifies your most valuable prospects before you spend a dollar.",
        cta: "See ROI Calculator →",
        urgency: "Risk-Free 30-Day Trial",
        style: 'security'
      };
    }

    if (primaryMotivation === 'achievement') {
      return {
        headline: "Dominate Your Market with Psychological Advantage",
        subheading: "Top performers use psychographic targeting to outmaneuver competitors and capture market share others can't even see.",
        cta: "Claim Your Advantage →",
        urgency: "Join the 1%",
        style: 'achievement'
      };
    }

    // Cognitive style adaptations
    if (cognitive_style === 'analytical') {
      return {
        headline: "The Mathematical Approach to Customer Psychology",
        subheading: "Quantified behavioral science meets machine learning. See exactly how psychographic variables correlate with conversion rates, LTV, and churn.",
        cta: "Explore the Data →",
        urgency: "Full API Documentation",
        style: 'analytical'
      };
    }

    if (cognitive_style === 'intuitive') {
      return {
        headline: "Finally, Technology That Understands Human Nature",
        subheading: "Discover the hidden emotional patterns that drive customer decisions. Turn intuition into measurable competitive advantage.",
        cta: "Experience the Demo →",
        urgency: "See It In Action",
        style: 'intuitive'
      };
    }

    return getDefaultContent();
  }, [getDefaultContent]); // Include getDefaultContent in dependency array to satisfy exhaustive-deps

  // Initialize tracking and analysis
  useEffect(() => {
    if (!userId) return;

    // Track page view
    trackEvent('page_view', { page: 'landing' });

    let mouseEvents = [];
    const trackMouseMovement = (e) => {
      mouseEvents.push({
        x: e.clientX, y: e.clientY, timestamp: Date.now()
      });

      if (mouseEvents.length > 50) {
        trackEvent('mouse_pattern', { movements: mouseEvents.slice(-20) });
        mouseEvents = [];
      }
    };

    document.addEventListener('mousemove', trackMouseMovement, { passive: true });

    const analysisTimeout = setTimeout(() => {
      setIsAnalyzing(true);
      const profileTimeout = setTimeout(async () => {
        const profileData = await fetchProfile();
        if (profileData) {
          setCurrentContent(getPersonalizedContent(profileData));
        } else {
          setCurrentContent(getDefaultContent());
        }
        setIsAnalyzing(false);
      }, 2000);

      return () => clearTimeout(profileTimeout);
    }, 3000);

    // Periodic profile updates
    intervalRef.current = setInterval(async () => {
      const profileData = await fetchProfile();
      if (profileData) {
        const newContent = getPersonalizedContent(profileData);
        setCurrentContent(prev => {
          if (JSON.stringify(newContent) !== JSON.stringify(prev)) {
            return newContent;
          }
          return prev;
        });
      }
    }, 15000);

    return () => {
      document.removeEventListener('mousemove', trackMouseMovement);
      clearTimeout(analysisTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // Add missing dependencies for consistency and to avoid stale closures
  }, [userId, trackEvent, fetchProfile, getPersonalizedContent, getDefaultContent]);

  // Click handlers
  const handleCTAClick = useCallback(() => {
    trackEvent('cta_click', { 
      content_version: currentContent?.style || 'default',
      headline: currentContent?.headline
    });
  }, [trackEvent, currentContent]);

  const handleSectionClick = useCallback((section) => {
    trackEvent('section_view', { section });
  }, [trackEvent]);

  // Set default content if none is set
  if (!currentContent) {
    return (
      <div className={`relative ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Analyzing your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Analysis Indicator */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg px-4 py-2 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#00d4ff] animate-pulse" />
              <span className="text-sm text-white">Analyzing behavior...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Debug Panel (only in dev) */}
      {isDevelopment && profile && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 border border-[#262626] rounded-lg p-3 max-w-sm text-xs">
          <div className="text-[#00d4ff] font-bold mb-1">Live Profile Debug:</div>
          <div className="text-white space-y-1">
            <div>Risk: {profile.risk_profile}</div>
            <div>Cognitive: {profile.cognitive_style}</div>
            <div>Motivation: {profile.motivation_stack_v2?.[0]?.label}</div>
            <div>Events: {events.length}</div>
          </div>
        </div>
      )}

      {/* Dynamic Hero Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentContent.style}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
            layoutId="headline"
          >
            {currentContent.headline}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-[#a3a3a3] mb-8 max-w-4xl mx-auto leading-relaxed"
            layoutId="subheading"
          >
            {currentContent.subheading}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            layoutId="cta-section"
          >
            <button
              onClick={handleCTAClick}
              className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-white rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-[#00d4ff]/25 relative overflow-hidden group"
            >
              <span className="relative z-10">{currentContent.cta}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00c4ef] to-[#00a5d9] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <div className="flex items-center gap-2 text-[#00d4ff] text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {currentContent.urgency}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Subtle personalization indicators for different styles */}
      {currentContent.style !== 'default' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse"
          title={`Personalized for ${currentContent.style} users`}
        />
      )}
    </div>
  );
};

export default LivePersonalizationDemo;
