
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, X, Play, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const WALKTHROUGH_MODULES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of knXw',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to knXw',
        content: 'knXw is a psychographic analytics platform that helps you understand user psychology and behavior.',
        page: null,
        highlights: []
      },
      {
        id: 'create-app',
        title: 'Create Your First Application',
        content: 'Create an application to get your API key and start tracking user events.',
        page: 'MyApps',
        highlights: ['[data-tour="create-app"]'],
        actionRequired: true
      },
      {
        id: 'view-dashboard',
        title: 'Explore Your Dashboard',
        content: 'The dashboard shows real-time analytics and psychographic insights.',
        page: 'Dashboard',
        highlights: ['[data-tour="dashboard-metrics"]', '[data-tour="dashboard-header"]']
      }
    ]
  },
  {
    id: 'core-features',
    title: 'Master key platform capabilities',
    description: 'Master key platform capabilities',
    steps: [
      {
        id: 'events',
        title: 'Understanding Events',
        content: 'Events capture user interactions. View them in the Event Stream.',
        page: 'Events',
        highlights: ['[data-tour="event-stream"]']
      },
      {
        id: 'profiles',
        title: 'User Profiles',
        content: 'Profiles show psychographic data for each user including personality traits, motivations, and cognitive style.',
        page: 'Profiles',
        highlights: ['[data-tour="profiles-list"]']
      },
      {
        id: 'insights',
        title: 'AI Insights',
        content: 'AI-generated insights provide actionable recommendations based on user psychology.',
        page: 'Insights',
        highlights: ['[data-tour="insights-list"]']
      }
    ]
  },
  {
    id: 'segmentation',
    title: 'Audience Segmentation',
    description: 'Create and manage user segments',
    steps: [
      {
        id: 'audience-builder',
        title: 'Audience Builder',
        content: 'Create psychographic segments using behavioral and trait-based filters.',
        page: 'AudienceBuilder',
        highlights: ['[data-tour="filter-builder"]', '[data-tour="ai-suggestions"]']
      },
      {
        id: 'ai-segments',
        title: 'AI-Powered Segments',
        content: 'Use pre-built segments or let AI suggest custom segments based on your users.',
        page: 'AudienceBuilder',
        highlights: ['[data-tour="ai-suggestions"]']
      }
    ]
  },
  {
    id: 'engagements',
    title: 'Adaptive Engagements',
    description: 'Create personalized user experiences',
    steps: [
      {
        id: 'engagement-templates',
        title: 'Engagement Templates',
        content: 'Create templates that define the appearance and content of your engagements.',
        page: 'Engagements',
        highlights: ['[data-tour="engagement-templates"]']
      },
      {
        id: 'engagement-rules',
        title: 'Engagement Rules',
        content: 'Define when and how to engage users based on psychographic and behavioral conditions.',
        page: 'Engagements',
        highlights: ['[data-tour="engagement-rules"]']
      }
    ]
  },
  {
    id: 'testing',
    title: 'A/B Testing',
    description: 'Run psychographic experiments',
    steps: [
      {
        id: 'ab-testing',
        title: 'A/B Testing Studio',
        content: 'Create and manage A/B tests to optimize your engagement strategies.',
        page: 'ABTestingStudio',
        highlights: ['[data-tour="test-list"]', '[data-tour="create-test"]']
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Deep dive into your data',
    steps: [
      {
        id: 'batch-analytics',
        title: 'Batch Analytics',
        content: 'Run comprehensive analysis on your user base to discover patterns and trends.',
        page: 'BatchAnalytics',
        highlights: ['[data-tour="analysis-types"]']
      },
      {
        id: 'executive-dashboard',
        title: 'Executive Dashboard',
        content: 'View high-level KPIs and business metrics for stakeholder reporting.',
        page: 'ExecutiveDashboard',
        highlights: ['[data-tour="executive-metrics"]']
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect external tools',
    steps: [
      {
        id: 'integrations-hub',
        title: 'Integrations Management',
        content: 'Connect knXw with HubSpot, Google Analytics, Meta, and more.',
        page: 'IntegrationsManagement',
        highlights: ['[data-tour="integrations-grid"]']
      }
    ]
  }
];

export default function ComprehensiveWalkthrough({ isOpen, onClose, onComplete }) {
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set()); // This stores step IDs that have been completed
  const [walkthroughState, setWalkthroughState] = useState(null);

  const currentModule = WALKTHROUGH_MODULES[currentModuleIndex];
  const currentStep = currentModule?.steps[currentStepIndex];
  const totalSteps = WALKTHROUGH_MODULES.reduce((acc, module) => acc + module.steps.length, 0);
  const completedCount = completedSteps.size;
  const progress = (completedCount / totalSteps) * 100;

  useEffect(() => {
    if (isOpen) {
      loadWalkthroughState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentStep?.highlights?.length > 0) {
      currentStep.highlights.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.classList.add('walkthrough-highlight');
        });
      });

      return () => {
        currentStep.highlights.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.classList.remove('walkthrough-highlight');
          });
        });
      };
    }
  }, [currentStep]);

  const loadWalkthroughState = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        return; // Silently return if not authenticated
      }

      const user = await base44.auth.me();
      const state = user?.onboarding_state?.walkthrough || {};
      
      if (state.completedModules) { // Using completedModules as per outline
        setCompletedSteps(new Set(state.completedModules)); // Storing in completedSteps state
      }
      
      if (state.currentModule !== undefined) {
        setCurrentModuleIndex(state.currentModule);
      }
      
      if (state.currentStep !== undefined) {
        setCurrentStepIndex(state.currentStep);
      }
    } catch (error) {
      // Fail silently if user not authenticated or other loading error
      console.info('Walkthrough state not loaded or failed to authenticate:', error);
    }
  };

  const saveWalkthroughState = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        return; // Can't save if not authenticated
      }

      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          walkthrough: {
            completedModules: Array.from(completedSteps), // Saving completedSteps as completedModules
            currentModule: currentModuleIndex,
            currentStep: currentStepIndex,
            lastUpdated: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to save walkthrough state:', error);
    }
  };

  const markStepComplete = () => {
    const stepId = `${currentModule.id}-${currentStep.id}`;
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      return newSet;
    });
  };

  const goToNextStep = async () => {
    markStepComplete();
    
    if (currentStepIndex < currentModule.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentModuleIndex < WALKTHROUGH_MODULES.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentStepIndex(0);
    } else {
      await saveWalkthroughState();
      onComplete?.();
      return;
    }
    
    await saveWalkthroughState();
    
    const nextModule = currentStepIndex < currentModule.steps.length - 1 
      ? currentModule 
      : WALKTHROUGH_MODULES[currentModuleIndex + 1];
    const nextStepIndex = currentStepIndex < currentModule.steps.length - 1 
      ? currentStepIndex + 1 
      : 0;
    const nextStep = nextModule.steps[nextStepIndex];
    
    if (nextStep.page) {
      navigate(createPageUrl(nextStep.page));
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentStepIndex(WALKTHROUGH_MODULES[currentModuleIndex - 1].steps.length - 1);
    }
  };

  const skipToModule = (moduleIndex) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentStepIndex(0);
    
    const module = WALKTHROUGH_MODULES[moduleIndex];
    const firstStep = module.steps[0];
    
    if (firstStep.page) {
      navigate(createPageUrl(firstStep.page));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .walkthrough-highlight {
          position: relative;
          box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2);
          border-radius: 8px;
          z-index: 1000;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(0, 212, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.4);
          }
        }
      `}</style>

      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl mx-4"
          >
            <Card className="bg-[#111111] border-[#00d4ff]/30">
              {/* Header */}
              <div className="p-6 border-b border-[#262626]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Interactive Walkthrough</h2>
                    <p className="text-[#a3a3a3] mt-1">
                      Module {currentModuleIndex + 1} of {WALKTHROUGH_MODULES.length}: {currentModule.title}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className="text-[#a3a3a3] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#a3a3a3]">Overall Progress</span>
                    <span className="text-white font-semibold">{completedCount} / {totalSteps} steps</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Module Navigation */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3">
                    Modules
                  </h3>
                  {WALKTHROUGH_MODULES.map((module, moduleIndex) => {
                    const moduleSteps = module.steps.map(step => `${module.id}-${step.id}`);
                    const completedInModule = moduleSteps.filter(id => completedSteps.has(id)).length;
                    const isActive = moduleIndex === currentModuleIndex;
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => skipToModule(moduleIndex)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-white'
                            : 'bg-[#1a1a1a] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#00d4ff]/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{module.title}</span>
                          <span className="text-xs">
                            {completedInModule}/{module.steps.length}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1">{module.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Current Step */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex items-center justify-center text-[#0a0a0a] font-bold text-sm">
                        {currentStepIndex + 1}
                      </div>
                      <h3 className="text-xl font-bold text-white">{currentStep.title}</h3>
                    </div>
                    
                    <p className="text-[#e5e5e5] leading-relaxed mb-6">
                      {currentStep.content}
                    </p>

                    {currentStep.actionRequired && (
                      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-[#fbbf24] flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Action required to continue
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-[#262626]">
                    <Button
                      onClick={goToPreviousStep}
                      disabled={currentModuleIndex === 0 && currentStepIndex === 0}
                      variant="outline"
                      className="border-[#262626] text-white hover:bg-[#262626]"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          saveWalkthroughState();
                          onClose();
                        }}
                        variant="ghost"
                        className="text-[#a3a3a3] hover:text-white"
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip for Now
                      </Button>

                      <Button
                        onClick={goToNextStep}
                        className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                      >
                        {currentStepIndex === currentModule.steps.length - 1 &&
                        currentModuleIndex === WALKTHROUGH_MODULES.length - 1
                          ? 'Complete Walkthrough'
                          : 'Next Step'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
