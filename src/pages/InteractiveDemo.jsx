import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Sparkles, Send, RotateCcw, Loader2,
  ChevronDown, Eye, ArrowRight, User, X, Code2,
  TrendingUp, Target, Zap, Lightbulb
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOHead from '@/components/system/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import AdaptiveUIShowcase from '@/components/sdk/AdaptiveUIShowcase';
import { PsychographicProvider, AdaptiveButton, AdaptiveText, AdaptiveContainer } from '@/components/sdk/KnxwSDK';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import ProfileFeedback from '@/components/demo/ProfileFeedback';
import AdaptiveElementRenderer from '@/components/demo/AdaptiveElementRenderer';
import { deriveTheme } from '@/components/demo/useDemoTheme';
import DemoThemeIndicator from '@/components/demo/DemoThemeIndicator';

export default function InteractiveDemoPage() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [mobileAnalysisOpen, setMobileAnalysisOpen] = useState(false);
  const [showAdaptiveUI, setShowAdaptiveUI] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState(null); // feedback to send on next message
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Derive interface theme from live psychographic profile
  const theme = deriveTheme(currentProfile);

  // Helper to handle various score scales (0-1, 0-10, 0-100) and prevent "700%" errors
  const normalizeScore = (val) => {
    if (val == null) return 0;
    if (val <= 1) return Math.round(val * 100);
    if (val <= 10) return Math.round(val * 10);
    return Math.min(Math.round(val), 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    // Generate session ID locally - no backend call needed
    const newSessionId = 'demo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    setSessionId(newSessionId);
    setSessionStarted(true);
    setMessages([{
      id: `init-${Date.now()}`,
      role: 'assistant',
      content: "Hello! I'm knXw's AI assistant. I'll help demonstrate our psychographic analysis capabilities. Tell me about yourself, your business goals, or any challenges you're facing—and watch as I build a real-time psychological profile based on your responses."
    }]);
  };

  const resetDemo = async () => {
    setSessionId(null);
    setMessages([]);
    setCurrentProfile(null);
    setSessionStarted(false);
    setInput('');
    setMobileAnalysisOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return;

    const userMessageContent = input.trim();
    
    setInput('');
    setLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessageContent, id: `temp-user-${Date.now()}` }]);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content || '',
        adaptive_ui_elements: m.adaptiveElements || []
      }));

      const response = await base44.functions.invoke('demoMessage', {
        session_id: sessionId,
        content: userMessageContent,
        history: historyPayload,
        current_profile: currentProfile,
        feedback: pendingFeedback || null
      });
      setPendingFeedback(null);
      
      const { assistant_message, adaptive_ui_elements, current_profile: updatedProfile } = response.data;
      
      setMessages(prev => [...prev, { 
        id: `asst-${Date.now()}`,
        role: 'assistant', 
        content: assistant_message,
        adaptiveElements: adaptive_ui_elements || []
      }]);

      if (updatedProfile) {
        setCurrentProfile(updatedProfile);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { 
        id: `err-${Date.now()}`,
        role: 'assistant', 
        content: 'I apologize, but I had trouble processing your message. Please check your connection and try again.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    "I'm launching a SaaS product",
    "I want to improve conversion rates",
    "Our marketing isn't resonating",
    "I'm trying to reduce churn",
    "We struggle with actionable insights"
  ];

  const applySuggestion = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleGetStarted = () => {
    window.location.href = createPageUrl('Onboarding');
  };

  // Profile Analysis Component (reusable for desktop and mobile)
  const ProfileAnalysisContent = () => {
    if (!currentProfile) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Brain className="w-16 h-16 text-[#262626] mb-4" />
          <p className="text-[#6b7280] text-sm">
            Start chatting to see your psychographic profile build in real-time
          </p>
        </div>
      );
    }

    if (!profileExpanded) return null;

    return (
      <div className="space-y-6">
        {/* Overall Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a3a3a3] font-medium">OVERALL CONFIDENCE</span>
            <span className="text-sm font-bold text-[#00d4ff]">
              {normalizeScore(currentProfile.overall_confidence)}%
            </span>
          </div>
          <Progress 
            value={normalizeScore(currentProfile.overall_confidence)} 
            className="h-2 bg-[#262626]"
          />
        </div>

        {/* Cognitive Style */}
        {currentProfile.cognitive_style && currentProfile.cognitive_style.style && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00d4ff]" />
              Cognitive Style
            </h4>
            <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
              {currentProfile.cognitive_style.style}
            </Badge>
            <div className="mt-2">
              <Progress 
                value={normalizeScore(currentProfile.cognitive_style.confidence)} 
                className="h-1.5 bg-[#262626]"
              />
              <p className="text-xs text-[#6b7280] mt-1">
                {normalizeScore(currentProfile.cognitive_style.confidence)}% confidence
              </p>
            </div>
          </div>
        )}

        {/* Risk Profile */}
        {currentProfile.risk_profile && currentProfile.risk_profile.profile && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
              Risk Profile
            </h4>
            <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">
              {currentProfile.risk_profile.profile}
            </Badge>
            <div className="mt-2">
              <Progress 
                value={normalizeScore(currentProfile.risk_profile.confidence)} 
                className="h-1.5 bg-[#262626]"
              />
              <p className="text-xs text-[#6b7280] mt-1">
                {normalizeScore(currentProfile.risk_profile.confidence)}% confidence
              </p>
            </div>
          </div>
        )}

        {/* Motivations */}
        {currentProfile.motivation_stack && currentProfile.motivation_stack.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#fbbf24]" />
              Top Motivations
            </h4>
            <div className="space-y-3">
              {currentProfile.motivation_stack.slice(0, 3).map((motive, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#e5e5e5] capitalize">
                      {motive.label}
                    </span>
                    <span className="text-xs text-[#a3a3a3]">
                      {normalizeScore(motive.weight)}%
                    </span>
                  </div>
                  <Progress 
                    value={normalizeScore(motive.weight)} 
                    className="h-1.5 bg-[#262626]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personality Traits */}
        {currentProfile.personality_traits && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              Personality (Big Five)
            </h4>
            <div className="space-y-2">
              {Object.entries(currentProfile.personality_traits).map(([trait, value]) => (
                <div key={trait}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#a3a3a3] capitalize">{trait}</span>
                    <span className="text-xs text-white">{normalizeScore(value)}%</span>
                  </div>
                  <Progress 
                    value={normalizeScore(value)} 
                    className="h-1 bg-[#262626]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remembered Preferences */}
        {currentProfile.user_preferences && (currentProfile.user_preferences.colors_disliked?.length > 0 || currentProfile.user_preferences.colors_preferred?.length > 0 || currentProfile.user_preferences.ui_style_preferences?.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#ec4899]" />
              Remembered Preferences
            </h4>
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-3 space-y-2">
              {currentProfile.user_preferences.industry_context && (
                <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Industry:</strong> {currentProfile.user_preferences.industry_context}</p>
              )}
              {currentProfile.user_preferences.colors_preferred?.length > 0 && (
                <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Likes Colors:</strong> {currentProfile.user_preferences.colors_preferred.join(', ')}</p>
              )}
              {currentProfile.user_preferences.colors_disliked?.length > 0 && (
                <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Avoids Colors:</strong> {currentProfile.user_preferences.colors_disliked.join(', ')}</p>
              )}
              {currentProfile.user_preferences.ui_style_preferences?.length > 0 && (
                <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Styles:</strong> {currentProfile.user_preferences.ui_style_preferences.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Reasoning/Evidence */}
        {currentProfile.reasoning && currentProfile.reasoning.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#fbbf24]"/>
               AI Reasoning
            </h4>
            <div className="space-y-2">
              {currentProfile.reasoning.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#00d4ff] mb-1 capitalize">
                    {reason.trait}
                  </p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    {reason.inference}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SEOHead
        title="knXw Interactive Demo - See Psychographic AI in Action"
        description="Experience knXw's real-time psychographic analysis firsthand. Chat with our AI assistant and watch as it builds your psychological profile in real-time. No signup required."
        keywords="AI demo, interactive demo, psychographic analysis, live demo, AI assistant, personality analysis"
      />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(0, 212, 255, 0);
          }
        }
        .pulse-glow-animation {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{
          ...theme.cssVars,
          background: `linear-gradient(135deg, var(--demo-bg-from), var(--demo-bg-via), var(--demo-bg-to))`,
          fontWeight: theme.cog.fontWeight,
          letterSpacing: theme.cog.letterSpacing,
          transition: `background ${theme.anim.duration} ease`,
        }}
      >
        <DemoThemeIndicator theme={theme} profile={currentProfile} />

        {/* Header - Mobile Optimized */}
        <div
          className="border-b sticky top-0 z-50"
          style={{
            borderColor: 'var(--demo-border)',
            background: `hsla(0,0%,4%, 0.85)`,
            backdropFilter: `blur(var(--demo-blur))`,
            transition: `border-color var(--demo-transition) ease, backdrop-filter var(--demo-transition) ease`,
          }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-2">
              {/* Logo Section */}
              <div className="flex items-center gap-2 min-w-0 flex-shrink">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, var(--demo-accent), var(--demo-accent))`,
                    borderRadius: 'var(--demo-radius)',
                    boxShadow: `0 0 16px var(--demo-accent-glow)`,
                    transition: `all var(--demo-transition) ease`,
                  }}
                >
                  <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-xl font-bold text-white truncate">knXw Demo</h1>
                  <p className="text-[10px] sm:text-xs text-[#a3a3a3] hidden sm:block">Psychographic AI</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                {sessionStarted && (
                  <>
                    {/* Mobile Analysis Toggle Button with Pulsing Glow */}
                    <Button
                      onClick={() => setMobileAnalysisOpen(true)}
                      variant="outline"
                      size="sm"
                      style={{
                        borderColor: 'var(--demo-accent)',
                        color: 'var(--demo-accent)',
                        borderRadius: 'var(--demo-radius)',
                      }}
                      className={`lg:hidden px-2 sm:px-3 ${messages.length > 1 && !mobileAnalysisOpen ? 'pulse-glow-animation' : ''}`}>
                      <Brain className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={handleGetStarted}
                      size="sm"
                      style={{
                        background: 'var(--demo-accent)',
                        color: '#0a0a0a',
                        borderRadius: 'var(--demo-radius)',
                        fontWeight: 600,
                        boxShadow: `0 0 20px var(--demo-accent-glow)`,
                        transition: `all var(--demo-transition) ease`,
                      }}
                      className="hidden sm:flex px-3 text-xs">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Get Started</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetDemo}
                      className="hidden sm:flex border-[#262626] text-[#a3a3a3] hover:text-white hover:bg-[#262626] px-3 text-xs">
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Reset
                    </Button>
                  </>
                )}
                {/* Mobile Back to Home button */}
                <a href={createPageUrl('Landing')} className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#a3a3a3] hover:text-white text-xs px-2">
                    Home
                  </Button>
                </a>
                {/* Desktop Back to Home button */}
                <a href={createPageUrl('Landing')} className="hidden lg:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#a3a3a3] hover:text-white text-xs">
                    Back to Home
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {!sessionStarted ? (
          /* Start Screen */
          <div className="max-w-2xl mx-auto px-4 py-8 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                See knXw's AI in Action
              </h2>
              <p className="text-base sm:text-lg text-[#a3a3a3] mb-6 sm:mb-8">
                Chat with our AI assistant and watch as it analyzes your responses to build a
                real-time psychographic profile. No signup required.
              </p>
              
              <Button
                onClick={startSession}
                disabled={loading}
                className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl"
                size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Starting Demo...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Start Interactive Demo
                  </>
                )}
              </Button>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {[
                { icon: Brain, title: "Live Analysis", desc: "Watch profile build in real-time" },
                { icon: Eye, title: "Full Transparency", desc: "See every AI inference explained" },
                { icon: Zap, title: "Instant Insights", desc: "Get actionable recommendations" }
              ].map((feature, idx) => (
                <Card key={idx} className="bg-[#111111] border-[#262626]">
                  <CardContent className="pt-6 text-center">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00d4ff] mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-[#a3a3a3]">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Adaptive UI SDK Showcase */}
            <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#00d4ff]/30 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-5 h-5 text-[#00d4ff]" />
                      <CardTitle className="text-white">Adaptive UI SDK Preview</CardTitle>
                      <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">New</Badge>
                    </div>
                    <p className="text-sm text-[#a3a3a3]">
                      See how UI components automatically adapt to user psychology
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAdaptiveUI(!showAdaptiveUI)}
                    variant="outline"
                    size="sm"
                    className="border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10"
                  >
                    {showAdaptiveUI ? 'Hide' : 'Try It'}
                  </Button>
                </div>
              </CardHeader>
              {showAdaptiveUI && (
                <CardContent className="pt-0">
                  <AdaptiveUIShowcase />
                </CardContent>
              )}
            </Card>
          </div>
        ) : (
          /* Demo Interface */
          <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] flex relative">
            {/* Main Chat Interface */}
            <div
              className="flex-1 flex flex-col w-full lg:border-r"
              style={{ borderColor: 'var(--demo-border)', transition: `border-color var(--demo-transition) ease` }}
            >
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                  <PsychographicProvider mockMode={true} mockProfile={currentProfile}>
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          
                          {message.role === 'assistant' && (
                            <div
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `var(--demo-accent)`,
                                borderRadius: '50%',
                                boxShadow: `0 0 10px var(--demo-accent-glow)`,
                                transition: `all var(--demo-transition) ease`,
                              }}
                            >
                              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                          )}

                          {message.role === 'user' && (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#334155] flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                          )}
                          
                          <div
                            className="max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 sm:py-3"
                            style={{
                              background: message.role === 'user' ? 'var(--demo-user-bubble)' : 'var(--demo-surface)',
                              border: message.role === 'user'
                                ? '1px solid transparent'
                                : `1px solid var(--demo-border)`,
                              borderRadius: 'var(--demo-radius)',
                              color: message.role === 'user' ? '#fff' : '#e5e5e5',
                              transition: `background var(--demo-transition) ease, border-color var(--demo-transition) ease`,
                            }}
                          >
                           {message.role === 'user' ? (
                             <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap mb-2">{message.content}</p>
                           ) : (
                             <div className="text-xs sm:text-sm leading-relaxed mb-2 prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_strong]:text-white [&_code]:bg-[#1a1a1a] [&_code]:px-1 [&_code]:rounded [&_code]:text-[#00d4ff] [&_code]:text-[10px]">
                               <ReactMarkdown>{message.content}</ReactMarkdown>
                             </div>
                           )}
                            
                            {/* Feedback for assistant messages (after first) */}
                            {message.role === 'assistant' && message.id && !message.id.startsWith('init-') && !message.id.startsWith('err-') && (
                              <ProfileFeedback
                                messageId={message.id}
                                onSubmit={(fb) => setPendingFeedback(fb)}
                              />
                            )}

                            {/* Render Adaptive UI Elements - outside bubble, full width below */}
                            {message.role === 'assistant' && message.adaptiveElements && message.adaptiveElements.length > 0 && (
                              <div className="mt-4 -mx-3 sm:-mx-4">
                                <div className="flex items-center gap-1.5 mb-3 px-1">
                                  <Sparkles className="w-3 h-3" style={{ color: 'var(--demo-accent)' }} />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--demo-accent)' }}>Adaptive UI</span>
                                  <span className="text-[9px] text-[#4b5563]">· responding to your inferred profile</span>
                                </div>
                                <div className="space-y-3">
                                  {message.adaptiveElements.filter(el => el && el.type).map((element, elIdx) => (
                                    <AdaptiveElementRenderer key={elIdx} element={element} idx={elIdx} totalCount={message.adaptiveElements.length} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </PsychographicProvider>
                  
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 sm:gap-3 justify-start">
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'var(--demo-accent)',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px var(--demo-accent-glow)',
                        }}
                      >
                        <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div
                        className="px-3 sm:px-4 py-2 sm:py-3"
                        style={{
                          background: 'var(--demo-surface)',
                          border: '1px solid var(--demo-border)',
                          borderRadius: 'var(--demo-radius)',
                        }}
                      >
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#a3a3a3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-[#a3a3a3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-[#a3a3a3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Suggested Prompts - Mobile Optimized */}
              {messages.length <= 1 && (
                <div className="border-t border-[#262626] px-3 sm:px-6 lg:px-8 py-2 sm:py-3 bg-[#0a0a0a]">
                  <div className="max-w-3xl mx-auto">
                    <p className="text-[10px] sm:text-xs text-[#a3a3a3] mb-2">Try asking about:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => applySuggestion(prompt)}
                          className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#262626] bg-[#111111] hover:bg-[#1a1a1a] hover:border-[#00d4ff]/50 transition-colors text-[#e5e5e5]">
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area - Mobile Optimized */}
              <div className="border-t border-[#262626] px-3 sm:px-6 lg:px-8 py-3 sm:py-4 bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-1 bg-[#111111] border-[#262626] text-white placeholder:text-[#6b7280] focus:border-[#00d4ff] text-sm"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-white flex-shrink-0 px-3 sm:px-4">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="w-[400px] flex-shrink-0 flex-col bg-[#0a0a0a] border-l border-[#262626] hidden lg:flex">
              <div className="px-6 py-4 border-b border-[#262626] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#00d4ff]" />
                    <h3 className="font-semibold text-white">Live Psychographic Analysis</h3>
                  </div>
                  <button
                    onClick={() => setProfileExpanded(!profileExpanded)}
                    className="text-[#a3a3a3] hover:text-white">
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-[#a3a3a3]">
                  Watch as knXw builds your profile in real-time
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ProfileAnalysisContent />
              </div>
            </div>

            {/* Mobile Slide-out Panel */}
            <AnimatePresence>
              {mobileAnalysisOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileAnalysisOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />
                  
                  {/* Slide-out Panel */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="lg:hidden fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[#0a0a0a] border-l border-[#262626] z-50 flex flex-col"
                  >
                    {/* Mobile Panel Header */}
                    <div className="px-4 py-3 border-b border-[#262626] flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-[#00d4ff]" />
                          <h3 className="font-semibold text-white text-sm">Live Analysis</h3>
                        </div>
                        <button
                          onClick={() => setMobileAnalysisOpen(false)}
                          className="text-[#a3a3a3] hover:text-white p-1">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#a3a3a3]">
                        Your real-time psychographic profile
                      </p>
                    </div>

                    {/* Mobile Panel Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <ProfileAnalysisContent />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}