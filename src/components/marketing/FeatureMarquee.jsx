
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Globe, BarChart3, Megaphone, Zap, Database, Cloud, Target, Users, Shield, TrendingUp, Activity, DollarSign, Brain, Sparkles, MousePointer, Clock, GitBranch } from 'lucide-react';

const integrations = [
  { 
    name: 'Google Analytics 4', 
    icon: BarChart3, 
    category: 'Analytics',
    description: 'Pull comprehensive user behavior data, session flows, and conversion funnels to enrich psychographic profiles with real engagement patterns. Teams see up to 45% improvement in attribution accuracy.',
    benefits: ['Enhanced user journey mapping', 'Conversion path analysis', 'Behavioral segmentation data'],
    color: 'from-[#4285f4] to-[#34a853]',
    metrics: '+45% attribution accuracy'
  },
  { 
    name: 'Google Ads & Meta CAPI', 
    icon: Target, 
    category: 'Advertising',
    description: 'Send conversion data with psychographic context to optimize ad targeting, improve ROAS, and reduce acquisition costs. Average ROAS improvement of 67% through better audience understanding.',
    benefits: ['Psychographic ad targeting', 'Improved ROAS', 'Smarter audience insights'],
    color: 'from-[#fbbc04] to-[#ea4335]',
    metrics: '+67% ROAS improvement'
  },
  { 
    name: 'Meta Pages & Comments', 
    icon: Megaphone, 
    category: 'Social Analytics',
    description: 'Analyze Facebook Page posts, comments, and engagement patterns to understand your audience\'s motivations, interests, and communication styles. Currently undergoing Meta app approval process.',
    benefits: ['Social sentiment analysis', 'Content optimization', 'Audience psychology insights'],
    color: 'from-[#1877f2] to-[#42a5f5]',
    metrics: 'Coming Soon',
    comingSoon: true
  },
  { 
    name: 'HubSpot CRM', 
    icon: Users, 
    category: 'Customer Data',
    description: 'Sync psychographic insights directly to contact records, enabling sales teams to personalize outreach and marketing. Sales teams report 52% higher close rates with psychographic data.',
    benefits: ['Personalized sales outreach', 'Enhanced lead scoring', 'Behavioral segmentation'],
    color: 'from-[#ff7a59] to-[#ff5722]',
    metrics: '+52% close rates'
  },
  { 
    name: 'Journey Builder', 
    icon: GitBranch, 
    category: 'Automation',
    description: 'Create sophisticated multi-step user journeys triggered by psychological states and behaviors. Design adaptive experiences that respond to real-time profile changes and increase conversion by 84%.',
    benefits: ['Visual journey design', 'Psychographic triggers', 'Multi-channel flows'],
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    metrics: '+84% conversion rates'
  },
  { 
    name: 'AI Agents Suite', 
    icon: Brain, 
    category: 'AI Automation',
    description: 'Deploy intelligent agents for growth orchestration, compliance monitoring, and content personalization. AI agents handle complex optimization tasks automatically, boosting team productivity by 156%.',
    benefits: ['Automated optimization', 'Compliance monitoring', 'Content generation'],
    color: 'from-[#10b981] to-[#059669]',
    metrics: '+156% productivity boost'
  },
  { 
    name: 'Multi-Channel Messaging', 
    icon: Zap, 
    category: 'Engagement',
    description: 'Send personalized messages across email, SMS, push notifications, and in-app engagements based on real-time psychological state changes. Reduce churn by 73% with proactive interventions.',
    benefits: ['Cross-channel consistency', 'Real-time triggers', 'Adaptive messaging'],
    color: 'from-[#ec4899] to-[#db2777]',
    metrics: '-73% churn reduction'
  },
  { 
    name: 'Executive Dashboard', 
    icon: TrendingUp, 
    category: 'Reporting',
    description: 'Generate board-ready reports with psychographic insights, automated scheduling to S3/email, and batch analytics. Improve executive decision-making with 91% faster insights delivery.',
    benefits: ['Automated reporting', 'Executive insights', 'Batch analytics'],
    color: 'from-[#fbbf24] to-[#f59e0b]',
    metrics: '+91% faster insights'
  },
  { 
    name: 'Audience Builder', 
    icon: Users, 
    category: 'Segmentation',
    description: 'Build precise audience segments using psychological traits, motivations, and behavioral patterns with visual drag-and-drop tools. Increase campaign effectiveness by 67% with better targeting.',
    benefits: ['Visual segment builder', 'Psychographic filters', 'Real-time preview'],
    color: 'from-[#06b6d4] to-[#0891b2]',
    metrics: '+67% campaign effectiveness'
  },
  { 
    name: 'AWS & Azure Integration', 
    icon: Cloud, 
    category: 'Enterprise',
    description: 'Seamlessly export data to AWS S3, Azure Blob, EventBridge, and SES. Enterprise-grade infrastructure with automated data pipelines reduces deployment time by 73%.',
    benefits: ['Cloud-native architecture', 'Automated pipelines', 'Enterprise security'],
    color: 'from-[#ff9900] to-[#ff6b35]',
    metrics: '+73% deployment speed'
  },
  { 
    name: 'Compliance Suite', 
    icon: Shield, 
    category: 'Security',
    description: 'Built-in audit logging, data export tools, consent management, and SOC2-ready architecture. Reduce compliance overhead by 44% with automated governance tools.',
    benefits: ['Automated compliance', 'Audit trails', 'Data sovereignty'],
    color: 'from-[#0078d4] to-[#106ebe]',
    metrics: '-44% compliance overhead'
  }
];

const IntegrationCard = ({ integration, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 mx-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#262626] bg-gradient-to-br from-[#111111] to-[#0a0a0a] cursor-pointer",
          "transition-all duration-300 ease-out",
          integration.comingSoon ? "opacity-90" : ""
        )}
        animate={{
          width: isHovered ? 380 : 280,
          height: isHovered ? 320 : 180,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Background gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-8 transition-opacity duration-300",
          integration.color,
          isHovered ? "opacity-15" : "opacity-8"
        )} />
        
        {/* Coming Soon Badge */}
        {integration.comingSoon && (
          <div className="absolute top-3 right-3 z-10">
            <div className="px-2 py-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full text-xs font-bold text-[#0a0a0a]">
              Coming Soon
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2.5 rounded-xl bg-gradient-to-br transition-transform duration-300",
              integration.color,
              isHovered ? "scale-110" : "scale-100"
            )}>
              <integration.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base leading-tight">
                {integration.name}
              </h3>
              <p className="text-[#00d4ff] text-xs font-medium">
                {integration.category}
              </p>
            </div>
          </div>

          {/* Metrics Badge - Always Visible */}
          <div className="mb-3">
            <div className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r",
              integration.comingSoon ? "from-[#fbbf24] to-[#f59e0b] text-[#0a0a0a]" : integration.color + " text-white",
              "shadow-lg"
            )}>
              {integration.metrics}
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <p className="text-[#e5e5e5] text-xs leading-relaxed mb-3">
                  {integration.description}
                </p>
                
                <div className="space-y-1.5">
                  <p className="text-[#00d4ff] text-xs font-semibold uppercase tracking-wider">
                    {integration.comingSoon ? 'Planned Features' : 'Key Benefits'}
                  </p>
                  {integration.benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.03 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-[#00d4ff] rounded-full flex-shrink-0" />
                      <span className="text-[#a3a3a3] text-xs">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle border glow on hover */}
        <div className={cn(
          "absolute inset-0 rounded-2xl border transition-opacity duration-300 pointer-events-none",
          isHovered ? "opacity-30 border-[#00d4ff]/50" : "opacity-0"
        )} />
      </motion.div>
    </motion.div>
  );
};

export default function FeatureMarquee() {
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Create seamless infinite scroll by tripling the content
  const extendedIntegrations = [...integrations, ...integrations, ...integrations];
  const cardWidth = 286; // 280px width + 6px margin
  const totalWidth = integrations.length * cardWidth;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Auto-scroll animation
    const autoScroll = () => {
      if (!isScrolling && !isPaused) {
        setScrollPosition(prev => {
          const newPos = prev + 0.5; // Slow, smooth scroll
          // Reset when we've scrolled one full set
          return newPos >= totalWidth ? 0 : newPos;
        });
      }
    };

    const interval = setInterval(autoScroll, 16); // ~60fps

    // Handle wheel scrolling
    const handleWheel = (e) => {
      e.preventDefault();
      setIsScrolling(true);
      
      setScrollPosition(prev => {
        const newPos = prev + e.deltaX + e.deltaY * 0.5;
        // Keep position within bounds, allowing seamless wrapping
        if (newPos >= totalWidth) return 0;
        if (newPos < 0) return totalWidth - 1;
        return newPos;
      });

      // Resume auto-scroll after wheel stops
      clearTimeout(handleWheel.timeout);
      handleWheel.timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

    // Touch handling
    const handleTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe || isRightSwipe) {
        setIsScrolling(true);
        setScrollPosition(prev => {
          const newPos = prev + (isLeftSwipe ? 100 : -100);
          if (newPos >= totalWidth) return 0;
          if (newPos < 0) return totalWidth - 1;
          return newPos;
        });

        setTimeout(() => {
          setIsScrolling(false);
        }, 1000);
      }
    };

    // Tap to pause/resume
    const handleTap = (e) => {
      // Only trigger on direct container tap, not card tap
      if (e.target === container || e.target.closest('[data-marquee-container]')) {
        setIsPaused(!isPaused);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('click', handleTap, { passive: true });

    // Proper cleanup with all event listeners
    return () => {
      clearInterval(interval);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('click', handleTap);
      clearTimeout(handleWheel.timeout);
    };
  }, [isScrolling, totalWidth, isPaused, touchStart, touchEnd]);

  return (
    <div 
      ref={containerRef}
      className="relative py-16 overflow-hidden cursor-grab active:cursor-grabbing"
      data-marquee-container
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-[#0a0a0a] to-[#111111]" />
      
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
      
      {/* Scrolling container */}
      <div 
        className="flex transition-transform ease-linear"
        style={{ 
          transform: `translateX(-${scrollPosition}px)`,
          width: 'max-content'
        }}
      >
        {extendedIntegrations.map((integration, index) => (
          <IntegrationCard
            key={`${integration.name}-${Math.floor(index / integrations.length)}-${index % integrations.length}`}
            integration={integration}
            index={index % integrations.length}
          />
        ))}
      </div>
    </div>
  );
}
