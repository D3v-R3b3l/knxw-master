import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Landing Page Engagement System
 * Renders autonomous engagements triggered by psychographic analysis
 */

const EngagementRenderer = ({ engagement, onResponse, onDismiss }) => {
  const { engagement_type, content, style = {} } = engagement;

  const handleAction = (action, actionValue) => {
    if (action === 'dismiss') {
      onDismiss();
    } else if (action === 'redirect') {
      window.location.href = actionValue;
    } else if (action === 'track_event') {
      // Track custom event
      if (window.knXw) {
        window.knXw.track('engagement_action', { 
          action: actionValue,
          engagement_id: engagement.delivery_id 
        });
      }
      onResponse({ action_taken: action, response_data: { event: actionValue } });
    }
  };

  const getPositionClasses = (position) => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6 max-w-sm';
      case 'bottom-left':
        return 'fixed bottom-6 left-6 max-w-sm';
      case 'top-center':
        return 'fixed top-24 left-1/2 transform -translate-x-1/2 max-w-md';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg';
      default:
        return 'fixed bottom-6 right-6 max-w-sm';
    }
  };

  if (engagement_type === 'tooltip') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className={`${getPositionClasses(style.position)} z-50`}
      >
        <Card className="bg-[#111111]/95 border-[#00d4ff]/30 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00d4ff]" />
                <h4 className="text-sm font-semibold text-white">{content.title}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-[#a3a3a3] hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-[#e5e5e5] mb-3 leading-relaxed">{content.message}</p>
            {content.buttons && (
              <div className="flex gap-2 flex-wrap">
                {content.buttons.map((button, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
                    onClick={() => handleAction(button.action, button.action_value)}
                    className={index === 0 ? 
                      "bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#38bdf8]" : 
                      "border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#00d4ff]/30"
                    }
                  >
                    {button.text}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (engagement_type === 'notification') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`${getPositionClasses(style.position)} z-50`}
      >
        <Card className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] border-[#262626] shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#fbbf24]" />
                <h4 className="text-sm font-semibold text-white">{content.title}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-[#a3a3a3] hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-[#e5e5e5] mb-3">{content.message}</p>
            {content.buttons && (
              <div className="flex gap-2">
                {content.buttons.map((button, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={index === 0 ? "default" : "ghost"}
                    onClick={() => handleAction(button.action, button.action_value)}
                    className={index === 0 ? 
                      "bg-[#fbbf24] text-[#0a0a0a] hover:bg-[#f59e0b]" : 
                      "text-[#a3a3a3] hover:text-white"
                    }
                  >
                    {button.text}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (engagement_type === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-md w-full"
        >
          <Card className="bg-[#111111] border-[#262626] shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  <h4 className="text-lg font-semibold text-white">{content.title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0 text-[#a3a3a3] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[#e5e5e5] mb-6 leading-relaxed">{content.message}</p>
              {content.buttons && (
                <div className="flex gap-3 justify-end">
                  {content.buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant={index === 0 ? "default" : "outline"}
                      onClick={() => handleAction(button.action, button.action_value)}
                      className={index === 0 ? 
                        "bg-[#10b981] text-white hover:bg-[#059669]" : 
                        "border-[#262626] text-[#a3a3a3] hover:text-white"
                      }
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  if (engagement_type === 'checkin') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-lg w-full"
        >
          <Card className="bg-[#111111] border-[#00d4ff]/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{content.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0 text-[#a3a3a3] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[#e5e5e5] mb-4">{content.message}</p>
              {content.questions && (
                <div className="space-y-2 mb-6">
                  {content.questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => onResponse({ 
                        action_taken: 'responded', 
                        response_data: { selected_answer: question }
                      })}
                      className="w-full text-left p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-colors text-sm text-[#e5e5e5] hover:text-white border border-transparent hover:border-[#00d4ff]/30"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default function LandingPageEngagements({ profile, userId }) {
  const [activeEngagements, setActiveEngagements] = useState([]);
  const [dismissedEngagements, setDismissedEngagements] = useState(new Set());

  useEffect(() => {
    if (!profile || !userId) return;

    // Check for triggered engagements
    const checkEngagements = async () => {
      try {
        // This would normally call the evaluateEngagementRules function
        // For demo purposes, we'll simulate engagement triggers based on profile
        const context = {
          session_id: sessionStorage.getItem('knxw_session_id'),
          page_url: window.location.href,
          last_activity: new Date().toISOString()
        };

        // Simulate engagement evaluation (in production, this would be a backend call)
        const potentialEngagements = simulateEngagementEvaluation(profile, context);
        
        // Filter out already dismissed engagements
        const newEngagements = potentialEngagements.filter(
          eng => !dismissedEngagements.has(eng.rule_name)
        );

        if (newEngagements.length > 0) {
          setActiveEngagements(prev => [...prev, ...newEngagements]);
        }
      } catch (error) {
        console.warn('Engagement evaluation failed:', error);
      }
    };

    // Check for engagements after profile is available
    const timer = setTimeout(checkEngagements, 5000);
    return () => clearTimeout(timer);
  }, [profile, userId, dismissedEngagements]);

  const handleEngagementResponse = (engagementId, response) => {
    // Track engagement response
    if (window.knXw) {
      window.knXw.track('engagement_response', {
        engagement_id: engagementId,
        response
      });
    }

    // Remove engagement from active list
    setActiveEngagements(prev => 
      prev.filter(eng => eng.delivery_id !== engagementId)
    );
  };

  const handleEngagementDismiss = (engagementId, ruleName) => {
    // Track dismissal
    if (window.knXw) {
      window.knXw.track('engagement_dismissed', {
        engagement_id: engagementId,
        rule_name: ruleName
      });
    }

    // Add to dismissed set and remove from active
    setDismissedEngagements(prev => new Set([...prev, ruleName]));
    setActiveEngagements(prev => 
      prev.filter(eng => eng.delivery_id !== engagementId)
    );
  };

  return (
    <AnimatePresence>
      {activeEngagements.map((engagement) => (
        <EngagementRenderer
          key={engagement.delivery_id}
          engagement={engagement}
          onResponse={(response) => handleEngagementResponse(engagement.delivery_id, response)}
          onDismiss={() => handleEngagementDismiss(engagement.delivery_id, engagement.rule_name)}
        />
      ))}
    </AnimatePresence>
  );
}

// Simulate engagement rule evaluation for demo purposes
function simulateEngagementEvaluation(profile, context) {
  const engagements = [];
  
  // Analytical users get technical tooltips
  if (profile.cognitive_style === 'analytical') {
    engagements.push({
      delivery_id: `demo_analytical_${Date.now()}`,
      rule_name: 'Analytical Landing Page Engagement',
      engagement_type: 'tooltip',
      priority: 'medium',
      content: {
        title: 'Technical Details Available',
        message: 'Want to see the data behind our claims? Check out our comprehensive documentation and case studies.',
        buttons: [
          { text: 'View Documentation', action: 'redirect', action_value: '/Documentation' },
          { text: 'Maybe Later', action: 'dismiss' }
        ],
        style: { theme: 'dark', position: 'bottom-right', auto_dismiss_seconds: 8 }
      }
    });
  }

  // Conservative users get trust-building modals
  if (profile.risk_profile === 'conservative') {
    engagements.push({
      delivery_id: `demo_conservative_${Date.now()}`,
      rule_name: 'Conservative User Trust Building',
      engagement_type: 'modal',
      priority: 'high',
      content: {
        title: 'Security & Privacy First',
        message: 'We understand your concerns about data privacy. knXw is built with enterprise-grade security and complete transparency. See exactly how we protect your data.',
        buttons: [
          { text: 'View Security Details', action: 'redirect', action_value: '/Privacy' },
          { text: 'Continue Browsing', action: 'dismiss' }
        ],
        style: { theme: 'dark', position: 'center' }
      }
    });
  }

  // High-energy users get quick-start prompts
  if (profile.emotional_state?.energy_level === 'high') {
    engagements.push({
      delivery_id: `demo_energy_${Date.now()}`,
      rule_name: 'High Energy Quick Start',
      engagement_type: 'notification',
      priority: 'critical',
      content: {
        title: '🚀 Ready to Get Started?',
        message: 'You seem excited about our capabilities! Skip the queue and get instant access to your psychographic dashboard.',
        buttons: [
          { text: 'Start Free Now', action: 'redirect', action_value: '/Onboarding' },
          { text: 'Keep Exploring', action: 'dismiss' }
        ],
        style: { theme: 'dark', position: 'bottom-right', auto_dismiss_seconds: 10 }
      }
    });
  }

  return engagements;
}