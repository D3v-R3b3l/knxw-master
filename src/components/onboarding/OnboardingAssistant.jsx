import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_STEPS = [
  {
    id: 'create_app',
    title: 'Create your first application',
    page: 'MyApps',
    check: async () => {
      const apps = await base44.entities.ClientApp.list();
      return apps.length > 0;
    },
    guidance: "Let's start by creating your first application. This will give you an API key to integrate knXw into your product. Click 'My Apps' in the sidebar to get started."
  },
  {
    id: 'explore_dashboard',
    title: 'Explore the dashboard',
    page: 'Dashboard',
    check: async (state) => state.visited_dashboard,
    guidance: "Great! Now let's check out your analytics dashboard. This is where you'll see real-time psychographic insights about your users."
  },
  {
    id: 'view_profiles',
    title: 'View user profiles',
    page: 'Profiles',
    check: async (state) => state.visited_profiles,
    guidance: "User profiles show deep psychological insights - motivations, personality traits, emotional states, and behavioral patterns. Let's take a look!"
  },
  {
    id: 'check_events',
    title: 'Check event stream',
    page: 'Events',
    check: async (state) => state.visited_events,
    guidance: "The event stream captures every user interaction in real-time. Once you integrate the SDK, you'll see clicks, scrolls, and form submissions here."
  },
  {
    id: 'build_segment',
    title: 'Build an audience segment',
    page: 'AudienceBuilder',
    check: async (state) => state.visited_segments,
    guidance: "Now let's explore audience segments. You can target users based on psychology, behavior, and engagement patterns."
  },
  {
    id: 'review_insights',
    title: 'Review AI insights',
    page: 'Insights',
    check: async (state) => state.visited_insights,
    guidance: "AI-generated insights provide actionable recommendations based on user behavior patterns. Let's see what the AI can discover!"
  },
  {
    id: 'complete_tour',
    title: 'Complete the guided tour',
    page: 'Dashboard',
    check: async (state) => state.tour_completed,
    guidance: "Excellent work! You've explored the key features. You're ready to integrate knXw into your product. Check out the Documentation for SDK setup instructions."
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
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = (completedSteps.size / ONBOARDING_STEPS.length) * 100;
  const allComplete = completedSteps.size === ONBOARDING_STEPS.length;

  useEffect(() => {
    if (!isOpen) return;
    
    // Load state and initialize
    loadOnboardingState();
    
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "👋 Welcome to knXw! I'm your AI guide. I'll help you get started with psychographic intelligence. Ready to create your first application?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

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
    try {
      const user = await base44.auth.me();
      const state = user?.onboarding_state || {};
      setUserState(state);

      // Check which steps are already complete
      const completed = new Set();
      for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
        const step = ONBOARDING_STEPS[i];
        const isComplete = await step.check(state);
        if (isComplete) {
          completed.add(step.id);
        }
      }
      setCompletedSteps(completed);

      // Find first incomplete step
      const firstIncomplete = ONBOARDING_STEPS.findIndex(s => !completed.has(s.id));
      if (firstIncomplete !== -1) {
        setCurrentStepIndex(firstIncomplete);
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    }
  };

  const checkStepCompletion = async () => {
    if (completedSteps.has(currentStep.id)) return;

    try {
      const isComplete = await currentStep.check(userState);
      if (isComplete) {
        const newCompleted = new Set(completedSteps);
        newCompleted.add(currentStep.id);
        setCompletedSteps(newCompleted);

        // Add congratulations message
        addMessage('assistant', `✅ Great job! You completed: ${currentStep.title}`);

        // Move to next step
        if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          const nextStep = ONBOARDING_STEPS[nextIndex];
          
          setTimeout(() => {
            addMessage('assistant', `Next step: ${nextStep.guidance}`);
          }, 1000);
        } else {
          // All done!
          setTimeout(() => {
            addMessage('assistant', "🎉 Congratulations! You've completed the onboarding tour. You're now ready to unlock psychographic intelligence in your product!");
          }, 1000);
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

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsSending(true);

    try {
      // Call AI assistant for contextual help
      const response = await base44.functions.invoke('assistantSessionStartV2', {
        message: userMessage,
        context: {
          currentStep: currentStep.id,
          completedSteps: Array.from(completedSteps),
          userState
        }
      });

      const aiResponse = response?.data?.response || "I'm here to help! What would you like to know?";
      addMessage('assistant', aiResponse);
    } catch (e) {
      console.error('AI response error:', e);
      addMessage('assistant', "I'm having trouble connecting right now, but I'm still here to guide you through the onboarding steps!");
    } finally {
      setIsSending(false);
    }
  };

  const goToStep = (step) => {
    navigate(createPageUrl(step.page));
    markPageVisited(step.page);
    addMessage('assistant', step.guidance);
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
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-[#00d4ff] text-[#0a0a0a]'
                          : 'bg-[#1a1a1a] text-white border border-white/10'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
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