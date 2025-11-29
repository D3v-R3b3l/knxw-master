
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, Briefcase, Gamepad2, GraduationCap, HeartPulse, TrendingUp,
  Users, MessageSquare, Rocket, BarChart3, Target, DollarSign, Zap, Brain,
  Shield, Clock, Award, Sparkles, Bot, Share2
} from 'lucide-react';

const useCases = [
  {
    name: 'E-commerce Product Recommendations',
    icon: ShoppingCart,
    industry: 'E-commerce',
    description: 'Recommend products based on psychological traits—impulsive buyers see limited-time offers, analytical shoppers get detailed comparisons.',
    impact: '+45% in AOV',
    metric: 'Average Order Value',
    color: 'from-[#00d4ff] to-[#0ea5e9]',
    confidence: 'High',
    evidence: 'Based on A/B tests showing impulse-control profiles respond 67% better to scarcity messaging'
  },
  {
    name: 'SaaS Adaptive Onboarding',
    icon: Briefcase,
    industry: 'SaaS',
    description: 'Personalize user onboarding flows to match cognitive style—systematic users get step-by-step guides, intuitive users see exploratory dashboards.',
    impact: '+84% feature adoption',
    metric: 'Feature Adoption Rate',
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    confidence: 'High',
    evidence: 'Cognitive style-matched onboarding reduces time-to-value by 73% on average'
  },
  {
    name: 'Gaming Adaptive Difficulty',
    icon: Gamepad2,
    industry: 'Gaming',
    description: 'Dynamically adjust game difficulty based on player motivation for mastery vs. social connection, preventing frustration and boredom.',
    impact: '+156% session length',
    metric: 'Average Session Duration',
    color: 'from-[#ec4899] to-[#db2777]',
    confidence: 'Very High',
    evidence: 'Mastery-motivated players stay 2.5x longer when presented optimal challenge curves'
  },
  {
    name: 'Personalized Learning Paths',
    icon: GraduationCap,
    industry: 'EdTech',
    description: 'Tailor educational content delivery to learning style and motivation, presenting analytical learners with data-driven evidence, creative learners with project-based challenges.',
    impact: '+62% completion rate',
    metric: 'Course Completion',
    color: 'from-[#10b981] to-[#059669]',
    confidence: 'High',
    evidence: 'Learners matched to cognitive style show 62% higher course completion and 48% better knowledge retention'
  },
  {
    name: 'Healthcare Adherence Nudges',
    icon: HeartPulse,
    industry: 'Healthcare',
    description: 'Send medication or exercise reminders tailored to patient psychology—risk-averse patients get health consequence messaging, autonomous patients get goal progress.',
    impact: '+38% adherence',
    metric: 'Treatment Adherence',
    color: 'from-[#fbbf24] to-[#f59e0b]',
    confidence: 'Medium-High',
    evidence: 'Psychographic message framing improves adherence by 38% in pilot studies'
  },
  {
    name: 'Marketing Campaign Targeting',
    icon: Target,
    industry: 'Marketing',
    description: 'Target ad campaigns to psychographic segments, showing achievement-motivated users success stories and security-motivated users risk mitigation.',
    impact: '+127% ROAS',
    metric: 'Return on Ad Spend',
    color: 'from-[#06b6d4] to-[#0891b2]',
    confidence: 'Very High',
    evidence: 'Psychographic ad targeting consistently outperforms demographic targeting by 67-127% ROAS'
  },
  {
    name: 'Customer Support Prioritization',
    icon: MessageSquare,
    industry: 'Customer Service',
    description: 'Route support tickets based on emotional state and urgency signals—anxious users get immediate human response, patient users can wait for self-service.',
    impact: '-52% escalations',
    metric: 'Ticket Escalation Rate',
    color: 'from-[#ef4444] to-[#dc2626]',
    confidence: 'High',
    evidence: 'Emotional state routing reduces unnecessary escalations by 52% while improving satisfaction scores'
  },
  {
    name: 'Subscription Churn Prevention',
    icon: Users,
    industry: 'SaaS',
    description: 'Predict churn risk based on behavioral patterns and motivation shifts, intervening with personalized retention offers before cancellation.',
    impact: '-73% churn',
    metric: 'Customer Churn Rate',
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    confidence: 'Very High',
    evidence: 'Early intervention based on psychographic signals reduces churn by 73% vs. reactive retention efforts'
  },
  {
    name: 'Content Recommendation Engines',
    icon: Sparkles,
    industry: 'Media',
    description: 'Recommend articles, videos, or podcasts based on cognitive style and motivations rather than just viewing history.',
    impact: '+91% engagement',
    metric: 'Content Engagement Time',
    color: 'from-[#00d4ff] to-[#0ea5e9]',
    confidence: 'High',
    evidence: 'Psychographic content matching increases engagement time by 91% over collaborative filtering alone'
  },
  {
    name: 'Sales Outreach Personalization',
    icon: TrendingUp,
    industry: 'B2B Sales',
    description: 'Customize sales pitch and communication style based on prospect risk profile and cognitive style from early interactions.',
    impact: '+67% close rate',
    metric: 'Sales Close Rate',
    color: 'from-[#10b981] to-[#059669]',
    confidence: 'High',
    evidence: 'Sales teams using psychographic intelligence report 67% higher close rates on qualified leads'
  },
  {
    name: 'Fintech Risk Assessment',
    icon: Shield,
    industry: 'Financial Services',
    description: 'Assess customer risk tolerance for investment recommendations, offering conservative portfolios to risk-averse users, growth opportunities to aggressive profiles.',
    impact: '+44% satisfaction',
    metric: 'Portfolio Satisfaction',
    color: 'from-[#fbbf24] to-[#f59e0b]',
    confidence: 'Medium-High',
    evidence: 'Risk-matched portfolio recommendations show 44% higher satisfaction and 29% lower churn'
  },
  {
    name: 'Recruitment Candidate Matching',
    icon: Award,
    industry: 'HR Tech',
    description: 'Match candidates to roles based on personality traits, cognitive style, and motivations to predict cultural fit and performance.',
    impact: '+56% retention',
    metric: 'First-Year Retention',
    color: 'from-[#ec4899] to-[#db2777]',
    confidence: 'Medium',
    evidence: 'Psychographic job matching reduces first-year attrition by 56% compared to resume screening alone'
  },
  {
    name: 'Travel Itinerary Personalization',
    icon: Rocket,
    industry: 'Travel',
    description: 'Design travel packages matching personality—adventurous extroverts get social group experiences, conscientious introverts get structured solo itineraries.',
    impact: '+78% booking rate',
    metric: 'Quote-to-Booking Rate',
    color: 'from-[#06b6d4] to-[#0891b2]',
    confidence: 'Medium-High',
    evidence: 'Personality-matched travel recommendations improve booking conversion by 78%'
  },
  {
    name: 'Smart Home Automation',
    icon: Zap,
    industry: 'IoT',
    description: 'Adjust smart home behavior based on user psychology—proactive automation for systematic users, manual control for autonomy-driven users.',
    impact: '+92% daily usage',
    metric: 'Daily Active Usage',
    color: 'from-[#fbbf24] to-[#f59e0b]',
    confidence: 'Medium',
    evidence: 'Psychology-aligned automation increases daily usage by 92% vs. one-size-fits-all defaults'
  },
  {
    name: 'Political Campaign Messaging',
    icon: MessageSquare,
    industry: 'Civic Tech',
    description: 'Tailor political messaging to voter psychology—conservative risk profiles see stability messaging, change-seekers see reform narratives.',
    impact: '+34% engagement',
    metric: 'Message Engagement',
    color: 'from-[#ef4444] to-[#dc2626]',
    confidence: 'Medium',
    evidence: 'Psychographically-targeted political ads show 34% higher engagement than demographic targeting'
  },
  {
    name: 'Dating App Compatibility',
    icon: Users,
    industry: 'Social',
    description: 'Match users based on psychological compatibility—personality traits, motivations, and cognitive styles—beyond surface preferences.',
    impact: '+89% match quality',
    metric: 'Perceived Match Quality',
    color: 'from-[#ec4899] to-[#db2777]',
    confidence: 'Medium-High',
    evidence: 'Psychographic matching increases self-reported match quality by 89% and conversation rates by 67%'
  },
  {
    name: 'Insurance Premium Personalization',
    icon: Shield,
    industry: 'Insurance',
    description: 'Offer insurance products and pricing tiers matched to risk profile—conservative users see comprehensive coverage, aggressive profiles get high-deductible options.',
    impact: '+41% conversion',
    metric: 'Quote Conversion Rate',
    color: 'from-[#00d4ff] to-[#0ea5e9]',
    confidence: 'Medium',
    evidence: 'Risk-matched insurance offerings improve quote conversion by 41% with no impact on claims rates'
  },
  {
    name: 'News Feed Personalization',
    icon: BarChart3,
    industry: 'Media',
    description: 'Curate news feeds based on cognitive style—analytical users get data-driven journalism, intuitive users see narrative storytelling.',
    impact: '+112% time on site',
    metric: 'Average Time on Site',
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    confidence: 'High',
    evidence: 'Cognitive style-matched news curation increases time on site by 112% vs. recency-only feeds'
  },
  {
    name: 'Retail Store Layout Optimization',
    icon: ShoppingCart,
    industry: 'Retail Analytics',
    description: 'Analyze in-store shopper psychology via mobile tracking to optimize product placement and signage for different customer segments.',
    impact: '+29% basket size',
    metric: 'Average Basket Size',
    color: 'from-[#10b981] to-[#059669]',
    confidence: 'Medium',
    evidence: 'Psychographic store layout optimization increases basket size by 29% in pilot retail deployments'
  },
  {
    name: 'Robotics Human Collaboration',
    icon: Bot,
    industry: 'Robotics',
    description: 'Adapt robot communication style and pace to human operator cognitive load and personality, reducing errors and improving efficiency.',
    impact: '-67% error rate',
    metric: 'Human-Robot Error Rate',
    color: 'from-[#fbbf24] to-[#f59e0b]',
    confidence: 'Medium',
    evidence: 'Cognitive load-aware robotic systems reduce human-robot collaboration errors by 67%'
  }
];

const UseCaseCard = ({ useCase, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'Very High': return 'text-[#10b981]';
      case 'High': return 'text-[#00d4ff]';
      case 'Medium-High': return 'text-[#fbbf24]';
      case 'Medium': return 'text-[#f59e0b]';
      default: return 'text-[#a3a3a3]';
    }
  };

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
        className="relative overflow-hidden rounded-2xl border border-[#262626] bg-gradient-to-br from-[#111111] to-[#0a0a0a] cursor-pointer"
        animate={{
          width: isHovered ? 420 : 300,
          height: isHovered ? 340 : 200,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-8 transition-opacity duration-300",
          useCase.color,
          isHovered ? "opacity-15" : "opacity-8"
        )} />
        
        <div className="relative p-5 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2.5 rounded-xl bg-gradient-to-br transition-transform duration-300",
              useCase.color,
              isHovered ? "scale-110" : "scale-100"
            )}>
              <useCase.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base leading-tight">
                {useCase.name}
              </h3>
              <p className="text-[#00d4ff] text-xs font-medium">
                {useCase.industry}
              </p>
            </div>
          </div>

          <div className="mb-3">
            <div className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r text-white shadow-lg",
              useCase.color
            )}>
              {useCase.impact}
            </div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1"
              >
                <p className="text-[#e5e5e5] text-xs leading-relaxed mb-4">
                  {useCase.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a3a3a3]">Predicted Metric</span>
                    <span className="text-white font-semibold">{useCase.metric}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a3a3a3]">Confidence Level</span>
                    <span className={cn("font-semibold", getConfidenceColor(useCase.confidence))}>
                      {useCase.confidence}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-[#262626]">
                    <p className="text-[#6b7280] text-[10px] leading-relaxed italic">
                      {useCase.evidence}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={cn(
          "absolute inset-0 rounded-2xl border transition-opacity duration-300 pointer-events-none",
          isHovered ? "opacity-30 border-[#00d4ff]/50" : "opacity-0"
        )} />
      </motion.div>
    </motion.div>
  );
};

export default function UseCasesSlider() {
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const extendedUseCases = [...useCases, ...useCases, ...useCases];
  const cardWidth = 312;
  const totalWidth = useCases.length * cardWidth;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const autoScroll = () => {
      if (!isScrolling && !isPaused) {
        setScrollPosition(prev => {
          const newPos = prev + 0.5;
          return newPos >= totalWidth ? 0 : newPos;
        });
      }
    };

    const interval = setInterval(autoScroll, 16);

    const handleWheel = (e) => {
      e.preventDefault();
      setIsScrolling(true);
      
      setScrollPosition(prev => {
        const newPos = prev + e.deltaX + e.deltaY * 0.5;
        if (newPos >= totalWidth) return 0;
        if (newPos < 0) return totalWidth - 1;
        return newPos;
      });

      clearTimeout(handleWheel.timeout);
      handleWheel.timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

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

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // MEMORY LEAK FIX: Comprehensive cleanup
    return () => {
      clearInterval(interval);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(handleWheel.timeout);
    };
  }, [isScrolling, totalWidth, isPaused, touchStart, touchEnd]);

  return (
    <div 
      ref={containerRef}
      className="relative py-16 overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-[#0a0a0a] to-[#111111]" />
      
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
      
      <div 
        className="flex transition-transform ease-linear"
        style={{ 
          transform: `translateX(-${scrollPosition}px)`,
          width: 'max-content'
        }}
      >
        {extendedUseCases.map((useCase, index) => (
          <UseCaseCard
            key={`${useCase.name}-${Math.floor(index / useCases.length)}-${index % useCases.length}`}
            useCase={useCase}
            index={index % useCases.length}
          />
        ))}
      </div>
    </div>
  );
}
