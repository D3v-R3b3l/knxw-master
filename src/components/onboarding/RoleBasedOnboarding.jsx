import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Sparkles, Code, TrendingUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ROLE_ONBOARDING_FLOWS = {
  admin: {
    title: 'Admin Onboarding',
    icon: Shield,
    color: '#8b5cf6',
    description: 'Set up your organization and manage team access',
    steps: [
      {
        id: 'create-app',
        title: 'Create Your First Application',
        description: 'Generate API keys and configure authorized domains',
        page: 'MyApps',
        action: 'Create an application to get started',
        completionCriteria: 'app_created'
      },
      {
        id: 'invite-team',
        title: 'Invite Your Team',
        description: 'Add team members and assign roles',
        page: 'OrgAdmin',
        action: 'Set up team access control',
        completionCriteria: 'team_invited'
      },
      {
        id: 'configure-integrations',
        title: 'Connect Integrations',
        description: 'Link HubSpot, GA4, or other platforms',
        page: 'IntegrationsManagement',
        action: 'Connect your first integration',
        completionCriteria: 'integration_connected'
      },
      {
        id: 'setup-billing',
        title: 'Configure Billing',
        description: 'Choose your plan and set up payment',
        page: 'Settings',
        action: 'Review subscription plans',
        completionCriteria: 'billing_configured'
      },
      {
        id: 'review-security',
        title: 'Security & Compliance',
        description: 'Configure SSO, audit logs, and compliance rules',
        page: 'EnterpriseSecurityDashboard',
        action: 'Review security settings',
        completionCriteria: 'security_reviewed'
      }
    ]
  },
  
  marketer: {
    title: 'Marketer Onboarding',
    icon: TrendingUp,
    color: '#ec4899',
    description: 'Learn to create psychographic segments and campaigns',
    steps: [
      {
        id: 'view-dashboard',
        title: 'Explore Analytics Dashboard',
        description: 'Understand your key metrics and user insights',
        page: 'Dashboard',
        action: 'Review your dashboard',
        completionCriteria: 'dashboard_viewed'
      },
      {
        id: 'understand-profiles',
        title: 'Understand User Psychology',
        description: 'Learn how psychographic profiles work',
        page: 'Profiles',
        action: 'Explore user profiles',
        completionCriteria: 'profiles_explored'
      },
      {
        id: 'create-segment',
        title: 'Create Your First Segment',
        description: 'Build audience segments based on psychology',
        page: 'AudienceBuilder',
        action: 'Use AI to suggest segments',
        completionCriteria: 'segment_created'
      },
      {
        id: 'setup-ab-test',
        title: 'Launch an A/B Test',
        description: 'Test different messaging for different personalities',
        page: 'ABTestingStudio',
        action: 'Create your first test',
        completionCriteria: 'test_created'
      },
      {
        id: 'create-engagement',
        title: 'Design Adaptive Engagements',
        description: 'Personalize user experiences based on psychology',
        page: 'Engagements',
        action: 'Create engagement rule',
        completionCriteria: 'engagement_created'
      }
    ]
  },
  
  developer: {
    title: 'Developer Onboarding',
    icon: Code,
    color: '#00d4ff',
    description: 'Integrate the knXw SDK and start tracking',
    steps: [
      {
        id: 'get-api-key',
        title: 'Get Your API Key',
        description: 'Create an app and copy your API credentials',
        page: 'MyApps',
        action: 'Create application and get API key',
        completionCriteria: 'api_key_obtained'
      },
      {
        id: 'install-sdk',
        title: 'Install the SDK',
        description: 'Add the tracking script to your application',
        page: 'Documentation',
        action: 'View SDK installation guide',
        completionCriteria: 'sdk_docs_viewed'
      },
      {
        id: 'test-events',
        title: 'Test Event Tracking',
        description: 'Verify events are being captured correctly',
        page: 'Events',
        action: 'View event stream',
        completionCriteria: 'events_verified'
      },
      {
        id: 'explore-api',
        title: 'Explore the REST API',
        description: 'Learn about profiles, insights, and recommendation endpoints',
        page: 'Developers',
        action: 'Test API endpoints',
        completionCriteria: 'api_tested'
      },
      {
        id: 'setup-webhooks',
        title: 'Configure Webhooks',
        description: 'Receive real-time notifications of psychographic changes',
        page: 'Documentation',
        action: 'Learn about webhooks',
        completionCriteria: 'webhooks_configured'
      }
    ]
  }
};

export default function RoleBasedOnboarding({ isOpen, onClose, userRole = 'marketer' }) {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [onboardingState, setOnboardingState] = useState(null);

  const flow = ROLE_ONBOARDING_FLOWS[userRole] || ROLE_ONBOARDING_FLOWS.marketer;
  const currentStep = flow.steps[currentStepIndex];
  const progress = (completedSteps.size / flow.steps.length) * 100;
  const Icon = flow.icon;

  useEffect(() => {
    if (isOpen) {
      loadOnboardingState();
    }
  }, [isOpen]);

  const loadOnboardingState = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        return; // Silently return if not authenticated
      }

      const user = await base44.auth.me();
      const state = user?.onboarding_state?.[`${userRole}_flow`] || {};
      setOnboardingState(state);
      
      if (state.completedSteps) {
        setCompletedSteps(new Set(state.completedSteps));
      }
      
      if (state.currentStep !== undefined) {
        setCurrentStepIndex(state.currentStep);
      }
    } catch (error) {
      // Fail silently if user not authenticated
      console.info('Onboarding state not loaded - user not authenticated');
    }
  };

  const saveOnboardingState = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        return; // Can't save if not authenticated
      }

      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          [`${userRole}_flow`]: {
            completedSteps: Array.from(completedSteps),
            currentStep: currentStepIndex,
            lastUpdated: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const markStepComplete = () => {
    const stepId = currentStep.id;
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      return newSet;
    });
  };

  const goToNextStep = async () => {
    markStepComplete();
    
    if (currentStepIndex < flow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      await saveOnboardingState();
    } else {
      await saveOnboardingState();
      
      // Mark onboarding as complete
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          const user = await base44.auth.me();
          await base44.auth.updateMe({
            onboarding_state: {
              ...user.onboarding_state,
              [`${userRole}_completed`]: true,
              completed_at: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error('Failed to mark onboarding complete:', error);
      }
      
      onClose?.();
    }
  };

  const goToStep = (index) => {
    setCurrentStepIndex(index);
  };

  const navigateToCurrentPage = () => {
    if (currentStep.page) {
      navigate(createPageUrl(currentStep.page));
      // Don't close the modal - keep it open so user can continue
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-[#111111] border-[#00d4ff]/30">
          {/* Header */}
          <CardHeader className="p-6 border-b border-[#262626]">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${flow.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: flow.color }} />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">{flow.title}</CardTitle>
                <p className="text-[#a3a3a3] mt-1">{flow.description}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#a3a3a3]">Progress</span>
                <span className="text-white font-semibold">
                  {completedSteps.size} / {flow.steps.length} completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step List */}
              <div className="space-y-2">
                {flow.steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.id);
                  const isActive = index === currentStepIndex;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => goToStep(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30'
                          : isCompleted
                          ? 'bg-[#10b981]/10 border border-[#10b981]/30'
                          : 'bg-[#1a1a1a] border border-[#262626] hover:border-[#00d4ff]/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? 'bg-[#10b981] text-white'
                              : isActive
                              ? 'bg-[#00d4ff] text-[#0a0a0a]'
                              : 'bg-[#262626] text-[#a3a3a3]'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-white truncate">{step.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Current Step Detail */}
              <div className="md:col-span-2">
                <div className="bg-[#0a0a0a] rounded-xl p-6 border border-[#262626]">
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[#0a0a0a] font-bold flex-shrink-0"
                      style={{ backgroundColor: flow.color }}
                    >
                      {currentStepIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {currentStep.title}
                      </h3>
                      <p className="text-[#e5e5e5] leading-relaxed">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-[#00d4ff] font-medium mb-3">
                      👉 {currentStep.action}
                    </p>
                    {currentStep.page && (
                      <Button
                        onClick={navigateToCurrentPage}
                        className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] w-full"
                      >
                        Go to {currentStep.page.replace(/([A-Z])/g, ' $1').trim()}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    <p className="text-xs text-[#6b7280] mt-2">
                      Tip: This modal will stay open while you complete this step
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
                    <Button
                      onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                      disabled={currentStepIndex === 0}
                      variant="outline"
                      className="border-[#262626] text-white hover:bg-[#262626]"
                    >
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          await saveOnboardingState();
                          onClose?.();
                        }}
                        variant="outline"
                        className="border-[#262626] bg-[#1a1a1a] text-white hover:bg-[#262626] hover:text-white"
                      >
                        Close for Now
                      </Button>

                      <Button
                        onClick={goToNextStep}
                        className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                      >
                        {currentStepIndex === flow.steps.length - 1
                          ? 'Complete Onboarding'
                          : 'Next Step'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export function detectUserRole(user) {
  if (!user) return 'marketer';
  
  // Check explicit role
  if (user.role === 'admin') return 'admin';
  
  // Check onboarding preferences
  if (user.onboarding_state?.preferred_role) {
    return user.onboarding_state.preferred_role;
  }
  
  // Infer from email patterns
  const email = user.email?.toLowerCase() || '';
  if (email.includes('dev') || email.includes('engineer')) return 'developer';
  if (email.includes('admin') || email.includes('owner')) return 'admin';
  if (email.includes('market') || email.includes('growth')) return 'marketer';
  
  // Default to marketer as it's the most common use case
  return 'marketer';
}