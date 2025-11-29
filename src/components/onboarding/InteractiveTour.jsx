import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to knXw!',
    description: 'Let\'s take a quick tour of the platform to help you get started with psychographic intelligence.',
    page: 'Dashboard',
    target: null,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Your Analytics Dashboard',
    description: 'This is your command center. See real-time metrics, user insights, and key performance indicators at a glance.',
    page: 'Dashboard',
    target: '.metric-cards',
    position: 'bottom'
  },
  {
    id: 'app-selector',
    title: 'Manage Multiple Apps',
    description: 'Switch between different applications you\'re tracking. Each app has its own analytics and settings.',
    page: 'Dashboard',
    target: '.app-selector',
    position: 'bottom'
  },
  {
    id: 'events',
    title: 'Event Stream',
    description: 'View all captured user interactions in real-time. Every click, scroll, and interaction is tracked here.',
    page: 'Events',
    target: '.events-table',
    position: 'top'
  },
  {
    id: 'profiles',
    title: 'User Psychographic Profiles',
    description: 'AI-powered psychological profiles for each user. Understand motivations, personality traits, and cognitive styles.',
    page: 'Profiles',
    target: '.profiles-grid',
    position: 'top'
  },
  {
    id: 'insights',
    title: 'AI Insights',
    description: 'Get actionable recommendations based on user psychology. These insights help you optimize engagement and retention.',
    page: 'Insights',
    target: '.insights-list',
    position: 'top'
  },
  {
    id: 'integrations',
    title: 'Powerful Integrations',
    description: 'Connect knXw with your existing tools: CRM, analytics, marketing platforms, and more.',
    page: 'Integrations',
    target: '.integrations-grid',
    position: 'top'
  },
  {
    id: 'documentation',
    title: 'API Documentation',
    description: 'Everything you need to integrate knXw into your application. SDKs, API references, and guides.',
    page: 'Documentation',
    target: '.docs-content',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tour. Start exploring and building amazing experiences with psychographic intelligence.',
    page: 'Dashboard',
    target: null,
    position: 'center'
  }
];

export default function InteractiveTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    // Check if user has completed tour
    base44.auth.me().then(user => {
      const tourCompleted = user?.onboarding_state?.tour_completed;
      if (!tourCompleted) {
        setIsActive(true);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isActive || !step.target) return;

    const updateHighlight = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [isActive, step]);

  const handleNext = useCallback(async () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStep + 1];
      
      // Navigate to next page if needed
      if (nextStep.page !== step.page) {
        window.location.href = createPageUrl(nextStep.page);
        // Store progress before navigation
        await base44.auth.updateMe({
          onboarding_state: {
            tour_step: currentStep + 1,
            tour_completed: false
          }
        });
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      await completeTour();
    }
  }, [currentStep, step]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = TOUR_STEPS[currentStep - 1];
      if (prevStep.page !== step.page) {
        window.location.href = createPageUrl(prevStep.page);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  }, [currentStep, step]);

  const completeTour = async () => {
    try {
      await base44.auth.updateMe({
        onboarding_state: {
          tour_completed: true,
          tour_completed_at: new Date().toISOString()
        }
      });
      setIsActive(false);
      onComplete?.();
    } catch (error) {
      console.error('Failed to save tour completion:', error);
      setIsActive(false);
      onComplete?.();
    }
  };

  const handleSkip = async () => {
    await completeTour();
    onSkip?.();
  };

  if (!isActive) return null;

  const isCenter = step.position === 'center';
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={isCenter ? undefined : handleSkip}
        />

        {/* Highlight */}
        {highlightPosition && !isCenter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-4 border-[#00d4ff] rounded-lg shadow-2xl pointer-events-none"
            style={{
              top: highlightPosition.top - 8,
              left: highlightPosition.left - 8,
              width: highlightPosition.width + 16,
              height: highlightPosition.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
            }}
          />
        )}

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute ${
            isCenter 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'bottom-8 right-8'
          }`}
        >
          <Card className="bg-[#0a0a0a] border-[#00d4ff] w-96 shadow-2xl">
            <CardContent className="p-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#a3a3a3]">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="text-[#a3a3a3] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full h-1 bg-[#262626] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {step.id === 'complete' && (
                    <CheckCircle className="w-6 h-6 text-[#10b981]" />
                  )}
                  {step.title}
                </h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="border-[#262626] text-[#a3a3a3] hover:text-white disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep === TOUR_STEPS.length - 1 ? (
                  <Button
                    onClick={completeTour}
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finish Tour
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Skip Button */}
              {currentStep < TOUR_STEPS.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-xs text-[#6b7280] hover:text-[#a3a3a3] mt-3 transition-colors"
                >
                  Skip tour
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}