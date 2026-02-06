import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Check, ChevronDown, ChevronUp, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const ONBOARDING_STEPS = [
  {
    id: 'create_app',
    title: 'Create your first application',
    page: 'MyApps',
    check: async () => {
      try {
        const response = await base44.functions.invoke('getMyClientApps');
        return response?.data?.apps?.length > 0;
      } catch {
        return false;
      }
    },
    getGuidance: (state) => {
      if (!state.apps || state.apps.length === 0) {
        return {
          message: "👋 Welcome to knXw! I'm your AI guide. Let's create your first application to get your unique API key.",
          action: {
            label: "Create Application",
            page: "MyApps"
          }
        };
      }
      return {
        message: "✅ Great! You've created your first application. Now let's explore what knXw can do.",
        action: null
      };
    }
  },
  {
    id: 'explore_dashboard',
    title: 'Explore the dashboard',
    page: 'Dashboard',
    check: async (state) => state.visited_dashboard,
    getGuidance: (state) => ({
      message: "Let's explore your analytics dashboard. This is command center for all psychographic intelligence about your users.",
      action: {
        label: "View Dashboard",
        page: "Dashboard"
      }
    })
  },
  {
    id: 'view_profiles',
    title: 'View user profiles',
    page: 'Profiles',
    check: async (state) => state.visited_profiles,
    getGuidance: (state) => ({
      message: "User profiles reveal deep psychological insights - motivations, personality traits, emotional states, and cognitive patterns.",
      action: {
        label: "Explore Profiles",
        page: "Profiles"
      }
    })
  },
  {
    id: 'check_events',
    title: 'Check event stream',
    page: 'Events',
    check: async (state) => state.visited_events,
    getGuidance: (state) => ({
      message: "The event stream captures every user interaction in real-time. See how behavioral data flows into psychographic profiles.",
      action: {
        label: "View Events",
        page: "Events"
      }
    })
  },
  {
    id: 'integrate_sdk',
    title: 'Integrate the SDK',
    page: 'Documentation',
    check: async (state) => state.sdk_integrated || state.visited_documentation,
    getGuidance: (state) => ({
      message: "Ready to capture real user data? Follow the SDK integration guide to start tracking psychographic insights in your app.",
      action: {
        label: "View Integration Guide",
        page: "Documentation"
      }
    })
  },
  {
    id: 'review_insights',
    title: 'Review AI insights',
    page: 'Insights',
    check: async (state) => state.visited_insights,
    getGuidance: (state) => ({
      message: "AI-generated insights provide actionable recommendations based on behavioral patterns. Discover what your users really want.",
      action: {
        label: "See Insights",
        page: "Insights"
      }
    })
  }
];

export default function OnboardingAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userState, setUserState] = useState({});
  const [isCheckingState, setIsCheckingState] = useState(false);
  const [currentGuidance, setCurrentGuidance] = useState(null);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = (completedSteps.size / ONBOARDING_STEPS.length) * 100;
  const allComplete = completedSteps.size === ONBOARDING_STEPS.length;

  useEffect(() => {
    if (!isOpen) return;
    loadOnboardingState();
  }, [isOpen]);

  // Track page visits
  useEffect(() => {
    if (!isOpen) return;
    
    const currentPage = location.pathname.split('/').pop() || 'Dashboard';
    const pageKey = `visited_${currentPage.toLowerCase()}`;
    
    if (!userState[pageKey]) {
      markPageVisited(currentPage);
    }
  }, [location.pathname, isOpen, userState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check step completion periodically
  useEffect(() => {
    if (!isOpen || allComplete) return;

    const interval = setInterval(async () => {
      await checkStepCompletion();
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, currentStepIndex, userState, allComplete]);

  const loadOnboardingState = async () => {
    setIsCheckingState(true);
    try {
      const user = await base44.auth.me();
      const state = user?.onboarding_state || {};
      
      // Check for existing apps
      let apps = [];
      try {
        const appsResponse = await base44.functions.invoke('getMyClientApps');
        apps = appsResponse?.data?.apps || [];
      } catch (e) {
        console.error('Failed to load apps:', e);
      }
      
      const enrichedState = {
        ...state,
        apps,
        has_apps: apps.length > 0
      };
      
      setUserState(enrichedState);

      // Check which steps are already complete
      const completed = new Set();
      for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
        const step = ONBOARDING_STEPS[i];
        const isComplete = await step.check(enrichedState);
        if (isComplete) {
          completed.add(step.id);
        }
      }
      setCompletedSteps(completed);

      // Find first incomplete step
      const firstIncomplete = ONBOARDING_STEPS.findIndex(s => !completed.has(s.id));
      if (firstIncomplete !== -1) {
        setCurrentStepIndex(firstIncomplete);
        const step = ONBOARDING_STEPS[firstIncomplete];
        const guidance = step.getGuidance ? step.getGuidance(enrichedState) : { message: step.guidance };
        setCurrentGuidance(guidance);
        
        // Add initial guidance message
        if (messages.length === 0) {
          setMessages([{
            role: 'assistant',
            content: guidance.message,
            action: guidance.action,
            timestamp: new Date()
          }]);
        }
      } else {
        // All complete
        if (messages.length === 0) {
          setMessages([{
            role: 'assistant',
            content: "🎉 Congratulations! You've completed all onboarding steps. You're ready to unlock psychographic intelligence in your product!",
            timestamp: new Date()
          }]);
        }
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    } finally {
      setIsCheckingState(false);
    }
  };

  const checkStepCompletion = async () => {
    if (completedSteps.has(currentStep.id)) return;

    try {
      // Reload state to get fresh data
      const user = await base44.auth.me();
      let apps = [];
      try {
        const appsResponse = await base44.functions.invoke('getMyClientApps');
        apps = appsResponse?.data?.apps || [];
      } catch (e) {
        console.error('Failed to load apps:', e);
      }
      
      const freshState = {
        ...user?.onboarding_state,
        apps,
        has_apps: apps.length > 0
      };
      setUserState(freshState);

      const isComplete = await currentStep.check(freshState);
      if (isComplete) {
        const newCompleted = new Set(completedSteps);
        newCompleted.add(currentStep.id);
        setCompletedSteps(newCompleted);

        // Add congratulations message
        addMessage('assistant', `✅ Excellent! You completed: ${currentStep.title}`, null);

        // Move to next step
        if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          const nextStep = ONBOARDING_STEPS[nextIndex];
          const guidance = nextStep.getGuidance ? nextStep.getGuidance(freshState) : { message: nextStep.guidance };
          setCurrentGuidance(guidance);
          
          setTimeout(() => {
            addMessage('assistant', guidance.message, guidance.action);
          }, 1500);
        } else {
          // All done!
          setTimeout(() => {
            addMessage('assistant', "🎉 Amazing work! You've completed the full onboarding. You're ready to integrate knXw and start capturing psychographic insights!", null);
          }, 1500);
        }

        // Save progress
        await saveProgress(newCompleted);
      }
    } catch (e) {
      console.error('Error checking step completion:', e);
    }
  };

  const saveProgress = async (completed) => {
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          onboarding_completed_steps: Array.from(completed),
          onboarding_progress: (completed.size / ONBOARDING_STEPS.length) * 100,
          last_onboarding_interaction: new Date().toISOString()
        }
      });
    } catch (e) {
      console.error('Failed to save onboarding progress:', e);
    }
  };

  const markPageVisited = async (page) => {
    const key = `visited_${page.toLowerCase()}`;
    const newState = { ...userState, [key]: true };
    setUserState(newState);

    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          [key]: true
        }
      });
    } catch (e) {
      console.error('Failed to mark page visited:', e);
    }
  };

  const addMessage = (role, content, action = null) => {
    setMessages(prev => [...prev, { role, content, action, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage, null);
    setIsSending(true);

    try {
      // Build comprehensive context for AI
      const contextMessage = `You are an onboarding assistant for knXw, a psychographic intelligence platform.

Current onboarding state:
- Current step: ${currentStep.title} (${currentStep.id})
- Completed steps: ${Array.from(completedSteps).join(', ') || 'none'}
- Progress: ${Math.round(progress)}%
- User has apps: ${userState.has_apps ? 'yes' : 'no'}
- Pages visited: ${Object.keys(userState).filter(k => k.startsWith('visited_') && userState[k]).map(k => k.replace('visited_', '')).join(', ') || 'none'}

Available onboarding steps:
${ONBOARDING_STEPS.map((s, i) => `${i + 1}. ${s.title} ${completedSteps.has(s.id) ? '✓' : ''}`).join('\n')}

User question: ${userMessage}

Provide a helpful, concise answer (2-3 sentences max). If the user needs to take action, suggest the next step clearly.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextMessage,
        add_context_from_internet: false
      });

      const aiResponse = response || "I'm here to guide you through the onboarding! What would you like help with?";
      
      // Check if we should suggest an action
      let action = null;
      if (!completedSteps.has(currentStep.id) && currentGuidance?.action) {
        action = currentGuidance.action;
      }
      
      addMessage('assistant', aiResponse, action);
    } catch (e) {
      console.error('AI error:', e);
      addMessage('assistant', `I'm here to help you get started! Currently, you need to: ${currentStep.title}.`, currentGuidance?.action);
    } finally {
      setIsSending(false);
    }
  };

  const goToStep = (step) => {
    navigate(createPageUrl(step.page));
    markPageVisited(step.page);
    const guidance = step.getGuidance ? step.getGuidance(userState) : { message: step.guidance };
    addMessage('assistant', guidance.message, guidance.action);
  };

  const handleActionClick = (action) => {
    if (action?.page) {
      navigate(createPageUrl(action.page));
      markPageVisited(action.page);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 20, x: 20 }}
        className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
      >
        <Card className="bg-[#0a0a0a] border-[#00d4ff]/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00d4ff]/20 to-[#0ea5e9]/20 p-4 border-b border-[#00d4ff]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0a0a0a]" />
                </div>
                <span className="font-semibold text-white">Getting Started</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs text-[#00d4ff] font-bold">{Math.round(progress)}%</span>
            </div>
          </div>

          {!isCollapsed && (
            <>
              {/* Steps Checklist */}
              <div className="p-4 bg-[#111111] border-b border-white/5 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {ONBOARDING_STEPS.map((step, i) => {
                    const isComplete = completedSteps.has(step.id);
                    const isCurrent = i === currentStepIndex;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => goToStep(step)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                          isCurrent 
                            ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isComplete 
                            ? 'bg-emerald-500' 
                            : isCurrent 
                            ? 'bg-[#00d4ff]' 
                            : 'bg-white/10'
                        }`}>
                          {isComplete ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <span className="text-xs text-white font-bold">{i + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm flex-1 ${
                          isComplete 
                            ? 'text-emerald-400 line-through' 
                            : 'text-white'
                        }`}>
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Messages */}
              <CardContent className="p-4 max-h-64 overflow-y-auto space-y-3 bg-[#0a0a0a]">
                {isCheckingState && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-[#00d4ff] text-[#0a0a0a]'
                            : 'bg-[#1a1a1a] text-white border border-white/10'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.action && msg.role === 'assistant' && (
                        <Button
                          onClick={() => handleActionClick(msg.action)}
                          size="sm"
                          className="mt-2 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] text-xs"
                        >
                          {msg.action.label}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/10">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00d4ff]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-3 bg-[#111111] border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d4ff]/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    size="icon"
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}