import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, ChevronLeft, X, Sparkles, Code, TrendingUp, Shield, ExternalLink, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ROLE_FLOWS = {
  admin: {
    title: 'Admin Setup',
    icon: Shield,
    color: '#8b5cf6',
    steps: [
      { id: 'create-app', title: 'Create Application', desc: 'Get your API keys', page: 'MyApps', highlight: '[data-tour="create-app"], .create-app-btn, button:has-text("Create")' },
      { id: 'invite-team', title: 'Invite Team', desc: 'Add team members', page: 'OrgAdmin', highlight: '[data-tour="invite-user"]' },
      { id: 'integrations', title: 'Connect Tools', desc: 'Link HubSpot, GA4, etc.', page: 'IntegrationsManagement', highlight: '[data-tour="add-integration"]' },
      { id: 'billing', title: 'Setup Billing', desc: 'Choose your plan', page: 'Settings', highlight: '[data-tour="billing"]' },
      { id: 'security', title: 'Review Security', desc: 'Configure compliance', page: 'EnterpriseSecurityDashboard', highlight: null }
    ]
  },
  marketer: {
    title: 'Marketer Guide',
    icon: TrendingUp,
    color: '#ec4899',
    steps: [
      { id: 'dashboard', title: 'Your Dashboard', desc: 'Key metrics at a glance', page: 'Dashboard', highlight: '[data-tour="metrics"]' },
      { id: 'profiles', title: 'User Profiles', desc: 'Understand psychology', page: 'Profiles', highlight: '[data-tour="profile-card"]' },
      { id: 'segments', title: 'Build Segments', desc: 'Target by psychology', page: 'AudienceBuilder', highlight: '[data-tour="create-segment"]' },
      { id: 'ab-test', title: 'A/B Testing', desc: 'Test personalization', page: 'ABTestingStudio', highlight: '[data-tour="create-test"]' },
      { id: 'engagements', title: 'Engagements', desc: 'Adaptive experiences', page: 'Engagements', highlight: '[data-tour="create-engagement"]' }
    ]
  },
  developer: {
    title: 'Developer Guide',
    icon: Code,
    color: '#00d4ff',
    steps: [
      { id: 'api-key', title: 'Get API Key', desc: 'Create your app', page: 'MyApps', highlight: '[data-tour="api-key"]' },
      { id: 'docs', title: 'SDK Docs', desc: 'Installation guide', page: 'Documentation', highlight: '[data-tour="sdk-section"]' },
      { id: 'events', title: 'Test Events', desc: 'Verify tracking', page: 'Events', highlight: '[data-tour="event-stream"]' },
      { id: 'api', title: 'REST API', desc: 'Explore endpoints', page: 'Developers', highlight: '[data-tour="api-playground"]' },
      { id: 'webhooks', title: 'Webhooks', desc: 'Real-time updates', page: 'Documentation', highlight: '[data-tour="webhooks"]' }
    ]
  }
};

export function detectUserRole(user) {
  if (!user) return 'marketer';
  if (user.role === 'admin') return 'admin';
  if (user.onboarding_state?.preferred_role) return user.onboarding_state.preferred_role;
  const email = user.email?.toLowerCase() || '';
  if (email.includes('dev') || email.includes('engineer')) return 'developer';
  if (email.includes('admin') || email.includes('owner')) return 'admin';
  return 'marketer';
}

export default function RoleBasedOnboarding({ isOpen, onClose, userRole = 'marketer' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [minimized, setMinimized] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const flow = ROLE_FLOWS[userRole] || ROLE_FLOWS.marketer;
  const step = flow.steps[currentStep];
  const Icon = flow.icon;
  const progress = (completed.size / flow.steps.length) * 100;
  const allDone = completed.size === flow.steps.length;

  // Load state on mount
  useEffect(() => {
    if (!isOpen) return;
    loadState();
  }, [isOpen]);

  // Auto-detect when user navigates to correct page
  useEffect(() => {
    if (!isOpen || !step) return;
    
    const currentPath = location.pathname;
    const expectedPath = createPageUrl(step.page);
    
    if (currentPath === expectedPath) {
      // User is on the right page - mark as visited after a short delay
      const timer = setTimeout(() => {
        markStepComplete(step.id);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, step, isOpen]);

  // Highlight elements on current page
  useEffect(() => {
    if (!isOpen || minimized || !step?.highlight) return;
    
    const highlights = step.highlight.split(',').map(s => s.trim());
    const cleanup = [];
    
    highlights.forEach(selector => {
      try {
        const el = document.querySelector(selector);
        if (el) {
          el.style.boxShadow = `0 0 0 3px ${flow.color}, 0 0 20px ${flow.color}40`;
          el.style.borderRadius = '8px';
          el.style.transition = 'box-shadow 0.3s ease';
          el.style.position = 'relative';
          el.style.zIndex = '100';
          cleanup.push(() => {
            el.style.boxShadow = '';
            el.style.borderRadius = '';
            el.style.position = '';
            el.style.zIndex = '';
          });
        }
      } catch (e) {}
    });
    
    return () => cleanup.forEach(fn => fn());
  }, [step, isOpen, minimized, flow.color]);

  const loadState = async () => {
    try {
      const user = await base44.auth.me();
      const state = user?.onboarding_state?.[`${userRole}_progress`];
      if (state?.completed) {
        setCompleted(new Set(state.completed));
      }
      if (state?.currentStep !== undefined) {
        setCurrentStep(state.currentStep);
      }
      setLoaded(true);
    } catch (e) {
      setLoaded(true);
    }
  };

  const saveState = async (newCompleted, newStep) => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          [`${userRole}_progress`]: {
            completed: Array.from(newCompleted),
            currentStep: newStep,
            updated: new Date().toISOString()
          }
        }
      });
    } catch (e) {}
  };

  const markStepComplete = (stepId) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(stepId);
      saveState(next, currentStep);
      return next;
    });
  };

  const goToStep = (index) => {
    setCurrentStep(index);
    const targetStep = flow.steps[index];
    if (targetStep.page) {
      navigate(createPageUrl(targetStep.page));
    }
  };

  const nextStep = () => {
    markStepComplete(step.id);
    if (currentStep < flow.steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const resetProgress = async () => {
    setCompleted(new Set());
    setCurrentStep(0);
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          [`${userRole}_progress`]: null,
          [`${userRole}_completed`]: false,
          [`${userRole}_dismissed`]: false
        }
      });
    } catch (e) {}
  };

  const finishOnboarding = async () => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          [`${userRole}_completed`]: true,
          completed_at: new Date().toISOString()
        }
      });
    } catch (e) {}
    onClose?.();
  };

  if (!isOpen || !loaded) return null;

  // Minimized floating pill
  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-xl border"
          style={{ 
            background: `linear-gradient(135deg, ${flow.color}20, #111)`,
            borderColor: `${flow.color}40`
          }}
        >
          <Icon className="w-4 h-4" style={{ color: flow.color }} />
          <span className="text-sm font-medium text-white">{flow.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white">
            {completed.size}/{flow.steps.length}
          </span>
          <Maximize2 className="w-3 h-3 text-white/60" />
        </button>
      </motion.div>
    );
  }

  // Full floating panel
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-4 right-4 z-40 w-80 max-h-[80vh] overflow-hidden"
    >
      <div 
        className="rounded-2xl shadow-2xl border overflow-hidden"
        style={{ 
          background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)',
          borderColor: `${flow.color}30`
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10" style={{ background: `${flow.color}10` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: `${flow.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: flow.color }} />
              </div>
              <span className="font-semibold text-white text-sm">{flow.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(true)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-white/60">{completed.size}/{flow.steps.length}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="p-3 max-h-64 overflow-y-auto space-y-1">
          {flow.steps.map((s, i) => {
            const isComplete = completed.has(s.id);
            const isCurrent = i === currentStep;
            
            return (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                  isCurrent 
                    ? 'bg-white/10 border border-white/20' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isComplete 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                      ? 'text-black' 
                      : 'bg-white/10 text-white/60'
                  }`}
                  style={isCurrent && !isComplete ? { background: flow.color } : {}}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                    {s.title}
                  </div>
                  <div className="text-xs text-white/50 truncate">{s.desc}</div>
                </div>
                {isCurrent && (
                  <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Current Step Action */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          {allDone ? (
            <div className="text-center">
              <div className="text-emerald-400 font-semibold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                All steps complete!
              </div>
              <Button onClick={finishOnboarding} className="w-full" style={{ background: flow.color }}>
                Finish Setup
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-white/50">Step {currentStep + 1}:</span>
                <span className="text-sm text-white font-medium">{step.title}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="sm"
                  onClick={nextStep}
                  className="flex-1 text-black font-semibold"
                  style={{ background: flow.color }}
                >
                  {location.pathname === createPageUrl(step.page) ? (
                    <>Mark Complete<Check className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Go to Page<ExternalLink className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Reset */}
        <div className="px-4 pb-3">
          <button 
            onClick={resetProgress}
            className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" /> Reset progress
          </button>
        </div>
      </div>
    </motion.div>
  );
}