
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Lightbulb, 
  MessageCircle, 
  MousePointerClick,
  Sparkles,
  Brain,
  Target,
  Zap,
  Users,
  Activity
} from 'lucide-react';
import AIChatModal from './AIChatModal';
import { createPageUrl } from "@/utils";

// Contextual help content for different pages and scenarios
const CONTEXTUAL_HELP = {
  Dashboard: {
    icon: Brain,
    title: 'Dashboard Overview',
    description: 'Your analytics command center',
    tips: [
      'Monitor key metrics like total profiles, active users, and engagement rates',
      'The emotional state chart shows the mood distribution of your users',
      'Real-time activity displays live user interactions as they happen',
      'Click on any metric card to dive deeper into that specific data'
    ],
    quickActions: [
      { label: 'View User Profiles', action: 'navigate', target: 'Profiles' },
      { label: 'Check Live Events', action: 'navigate', target: 'Events' },
      { label: 'Generate Demo Data', action: 'navigate', target: 'DemoData' }
    ]
  },
  Profiles: {
    icon: Users,
    title: 'User Profiles',
    description: 'Deep psychographic analysis of your users',
    tips: [
      'Each profile shows personality traits, emotional state, and motivations',
      'Profiles are built automatically from user behavior patterns',
      'Risk profiles (conservative, moderate, aggressive) help predict user actions',
      'Cognitive styles show how users prefer to process information'
    ],
    quickActions: [
      { label: 'View Events Stream', action: 'navigate', target: 'Events' },
      { label: 'Check AI Insights', action: 'navigate', target: 'Insights' },
      { label: 'Setup Tracking', action: 'navigate', target: 'Settings' }
    ]
  },
  Events: {
    icon: Activity,
    title: 'Event Stream',
    description: 'Real-time user behavior tracking',
    tips: [
      'Events capture every user interaction: clicks, page views, form submissions',
      'Each event contributes to building comprehensive user profiles',
      'Filter by event type or user to focus on specific behaviors',
      'Events appear in real-time as they happen on your website'
    ],
    quickActions: [
      { label: 'Install Tracking Code', action: 'navigate', target: 'Settings' },
      { label: 'View User Profiles', action: 'navigate', target: 'Profiles' },
      { label: 'Generate Demo Data', action: 'navigate', target: 'DemoData' }
    ]
  },
  Insights: {
    icon: Lightbulb,
    title: 'AI Insights',
    description: 'Automated behavioral analysis and recommendations',
    tips: [
      'AI automatically identifies patterns in user behavior',
      'Insights include actionable recommendations for optimization',
      'Confidence scores show how reliable each insight is',
      'Click any insight to see detailed supporting evidence'
    ],
    quickActions: [
      { label: 'Run Batch Analytics', action: 'navigate', target: 'BatchAnalytics' },
      { label: 'Setup Engagements', action: 'navigate', target: 'Engagements' },
      { label: 'View User Profiles', action: 'navigate', target: 'Profiles' }
    ]
  },
  Agents: {
    icon: Sparkles,
    title: 'AI Agents',
    description: 'Autonomous optimization and automation',
    tips: [
      'AI agents work continuously to optimize your user experience',
      'Each agent specializes in different aspects of user engagement',
      'Agents can automatically adjust rules, content, and recommendations',
      'Monitor agent activity and results in real-time'
    ],
    quickActions: [
      { label: 'Setup Engagements', action: 'navigate', target: 'Engagements' },
      { label: 'View AI Insights', action: 'navigate', target: 'Insights' },
      { label: 'Check Documentation', action: 'navigate', target: 'Documentation' }
    ]
  },
  Engagements: {
    icon: Zap,
    title: 'Adaptive Engagement',
    description: 'Personalized user experiences based on psychology',
    tips: [
      'Create rules that trigger based on user behavior and personality',
      'Templates define how engagements look and what they say',
      'Target specific emotional states or personality traits',
      'A/B test different approaches to optimize conversion rates'
    ],
    quickActions: [
      { label: 'View User Profiles', action: 'navigate', target: 'Profiles' },
      { label: 'Check AI Insights', action: 'navigate', target: 'Insights' },
      { label: 'Setup Integrations', action: 'navigate', target: 'Integrations' }
    ]
  },
  Settings: {
    icon: Target,
    title: 'Settings & Configuration',
    description: 'Configure your knXw setup',
    tips: [
      'Create and manage your client applications',
      'Get JavaScript tracking codes for your websites',
      'Configure integrations with other tools',
      'Manage your account preferences and billing'
    ],
    quickActions: [
      { label: 'View Dashboard', action: 'navigate', target: 'Dashboard' },
      { label: 'Check Events', action: 'navigate', target: 'Events' },
      { label: 'Generate Demo Data', action: 'navigate', target: 'DemoData' }
    ]
  },
  // Add more pages as needed
  default: {
    icon: Lightbulb,
    title: 'knXw Help',
    description: 'Get assistance with your psychographic analytics',
    tips: [
      'knXw analyzes user behavior to understand psychological motivations',
      'Start by setting up tracking, then explore profiles and insights',
      'Use the AI assistant for personalized help and recommendations',
      'Check the documentation for detailed guides and API references'
    ],
    quickActions: [
      { label: 'View Dashboard', action: 'navigate', target: 'Dashboard' },
      { label: 'Setup Tracking', action: 'navigate', target: 'Settings' },
      { label: 'Read Documentation', action: 'navigate', target: 'Documentation' }
    ]
  }
};

export default function ContextualHelpOverlay({ 
  currentPageName, 
  userContext, 
  trigger 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [helpContent, setHelpContent] = useState(null);

  // Show contextual help when triggered
  useEffect(() => {
    if (trigger && trigger.timestamp) {
      const content = CONTEXTUAL_HELP[currentPageName] || CONTEXTUAL_HELP.default;
      setHelpContent({
        ...content,
        context: trigger.context,
        reason: trigger.reason
      });
      setIsVisible(true);
    }
  }, [trigger, currentPageName]);

  // Auto-hide after some time
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 30000); // Hide after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleQuickAction = (action) => {
    if (action.action === 'navigate' && action.target) {
      // Use the proper page URL helper to avoid case-sensitive route issues
      window.location.href = createPageUrl(action.target);
    }
    setIsVisible(false);
  };

  const handleAIHelp = () => {
    setShowAIChat(true);
    setIsVisible(false);
  };

  if (!isVisible || !helpContent) {
    return null;
  }

  return (
    <>
      {/* Contextual Help Overlay */}
      <div className="fixed top-20 right-6 z-40 max-w-sm">
        <Card className="bg-[#111111] border-[#262626] shadow-2xl animate-in slide-in-from-right duration-300">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <helpContent.icon className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{helpContent.title}</h3>
                  <p className="text-xs text-[#a3a3a3]">{helpContent.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-[#a3a3a3] hover:text-white hover:bg-[#262626] p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Context reason */}
            {helpContent.reason && (
              <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                <p className="text-sm text-[#a3a3a3]">
                  <MousePointerClick className="w-4 h-4 inline mr-2 text-[#00d4ff]" />
                  {helpContent.reason}
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                <span className="text-sm font-medium text-[#fbbf24]">Quick Tips</span>
              </div>
              <ul className="space-y-2">
                {helpContent.tips.slice(0, 3).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[#a3a3a3]">
                    <span className="text-[#00d4ff] mt-1 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm font-medium text-[#10b981]">Quick Actions</span>
              </div>
              
              <div className="grid gap-2">
                {helpContent.quickActions.slice(0, 2).map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] justify-start text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* AI Help Button */}
              <Button
                onClick={handleAIHelp}
                className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-medium text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask AI Assistant
              </Button>
            </div>

            {/* User context indicator */}
            {userContext && (
              <div className="mt-4 pt-3 border-t border-[#262626]">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30 text-xs">
                    {userContext.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  {userContext.onboardingCompleted && (
                    <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs">
                      Onboarded
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Modal */}
      <AIChatModal
        open={showAIChat}
        onClose={() => setShowAIChat(false)}
        context={{
          page: currentPageName,
          help_reason: helpContent.reason,
          user_context: userContext,
          contextual_request: true
        }}
      />
    </>
  );
}
