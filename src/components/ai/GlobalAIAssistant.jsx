
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, X, Send, Sparkles, Loader2, Lightbulb, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAdaptiveContext } from '../onboarding/AdaptiveOnboardingEngine';
import { Badge } from '@/components/ui/badge';

// Assuming a simple logger for console.error or a more robust one.
const logger = console;

const PAGE_CONTEXTS = {
  '/dashboard': 'Dashboard - Analytics overview and key metrics',
  '/profiles': 'User Profiles - Psychographic profiles and behavior analysis',
  '/events': 'Event Stream - Real-time user activity tracking',
  '/insights': 'AI Insights - Psychographic intelligence and recommendations',
  '/engagements': 'Adaptive Engagements - Rule builder and template management',
  '/batch-analytics': 'Batch Analytics - Deep analysis and reporting',
  '/audience-builder': 'Audience Builder - Segment creation and management',
  '/ab-testing-studio': 'A/B Testing Studio - Experiment management',
  '/integrations-management': 'Integrations - External tool connections',
  '/executive-dashboard': 'Executive Dashboard - Board-level KPIs and insights',
  '/journeys': 'Journey Builder - Automated user workflows',
  '/my-apps': 'My Applications - App and API key management',
  '/documentation': 'Documentation - API guides and tutorials',
  '/settings': 'Settings - Account and app configuration',
};

export default function GlobalAIAssistant({ isOpen, onClose }) {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // isMinimized state removed as the UI is now a fixed-width panel
  const [currentContext, setCurrentContext] = useState('');

  const adaptiveContext = useAdaptiveContext();
  const [proactiveSuggestions, setProactiveSuggestions] = useState([]);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false); // New state for summarization loading
  const [user, setUser] = useState(null); // New state for user information

  const loadUser = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    } catch (error) {
      console.info('AI Assistant: User not authenticated');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  // Effect for setting current context and handling initial welcome message
  useEffect(() => {
    const pathContextFromLocation = PAGE_CONTEXTS[location.pathname] || 'knXw Platform';
    // Prioritize adaptive context for display in the header, fall back to location-based context
    const effectiveContextForDisplay = adaptiveContext.currentPage || pathContextFromLocation;
    setCurrentContext(effectiveContextForDisplay);

    // Initial welcome message: Only show if the assistant is open, no messages exist, no proactive suggestions are being generated or are available.
    // This ensures proactive suggestions take precedence, or a default message is shown if no suggestions.
    if (isOpen && messages.length === 0 && proactiveSuggestions.length === 0 && !isGeneratingSuggestion) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your knXw AI assistant. I can help you with **${effectiveContextForDisplay}**.\n\nI can:\n- Explain features and concepts\n- Guide you through workflows\n- Answer questions about psychographic data\n- Suggest best practices\n- Help with troubleshooting\n\nWhat would you like to know?`
      }]);
    }
  }, [location.pathname, isOpen, messages.length, proactiveSuggestions.length, isGeneratingSuggestion, adaptiveContext.currentPage]);


  // Generate proactive suggestions based on current context
  useEffect(() => {
    // Only generate if assistant is open and adaptive context page is known
    if (!isOpen || !adaptiveContext.currentPage) return;

    generateProactiveSuggestions();
  }, [isOpen, adaptiveContext.currentPage]);

  const generateProactiveSuggestions = async () => {
    if (isGeneratingSuggestion || messages.length > 0) return; // Prevent re-generation or if user has interacted

    setIsGeneratingSuggestion(true);
    setProactiveSuggestions([]); // Clear any stale suggestions

    try {
      const contextualPrompt = buildContextualPrompt();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextualPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  action: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["title", "description", "action", "priority"]
              }
            }
          },
          required: ["suggestions"]
        },
        add_context_from_internet: false
      });

      if (response?.suggestions && Array.isArray(response.suggestions)) {
        setProactiveSuggestions(response.suggestions.slice(0, 3));
      } else {
        setProactiveSuggestions([]);
      }
    } catch (error) {
      logger.error('Failed to generate proactive suggestions:', error);
      setProactiveSuggestions([]);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const buildContextualPrompt = () => {
    const page = adaptiveContext.currentPage;

    const prompts = {
      AudienceBuilder: `The user is currently in the Audience Builder page. Based on common workflow patterns, suggest 3 specific, actionable next steps they could take to maximize value. Consider:
        - Creating predictive segments for churn or high-value users
        - Using AI segment suggestions to discover hidden patterns
        - Exporting segments to marketing platforms like HubSpot or Meta

        Provide practical suggestions that would benefit most users at this stage. Format as a JSON array of objects with 'title', 'description', 'action', and 'priority' (low/medium/high).`,

      ABTestingStudio: `The user is in the A/B Testing Studio. Provide 3 expert recommendations for:
        - New A/B test hypotheses based on common psychographic patterns
        - Implementing multi-armed bandit optimization for faster results
        - Setting up early stopping criteria to save time and budget

        Focus on actionable, high-impact suggestions. Format as a JSON array of objects with 'title', 'description', 'action', and 'priority' (low/medium/high).`,

      Dashboard: `The user is viewing the main Analytics Dashboard. Suggest 3 insights they should investigate:
        - Analyzing churn risk patterns across their user base
        - Reviewing predictive segment opportunities
        - Generating an executive summary report

        Prioritize suggestions that drive business decisions. Format as a JSON array of objects with 'title', 'description', 'action', and 'priority' (low/medium/high).`,

      IntegrationsManagement: `The user is managing integrations. Recommend 3 advanced integration strategies:
        - Setting up HubSpot psychographic email automation
        - Configuring Meta lookalike audiences from psychographic data
        - Enabling Salesforce lead scoring with psychological insights

        Focus on high-ROI integration use cases. Format as a JSON array of objects with 'title', 'description', 'action', and 'priority' (low/medium/high).`,

      default: `The user is exploring the application. Provide 3 general suggestions to help them:
        - Discover powerful but underused features
        - Optimize their current workflow
        - Unlock new insights from their data

        Make suggestions universally helpful and actionable. Format as a JSON array of objects with 'title', 'description', 'action', and 'priority' (low/medium/high).`
    };

    return prompts[page] || prompts.default;
  };

  const applySuggestion = (suggestion) => {
    // Add the suggestion as an assistant message
    const suggestionMessage = {
      role: 'assistant',
      content: `I noticed you might be interested in: **${suggestion.title}**\n\n${suggestion.description}\n\nWould you like me to guide you through this?`
    };

    setMessages(prev => [...prev, suggestionMessage]);
    setProactiveSuggestions([]); // Clear proactive suggestions once one is applied
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || summaryLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProactiveSuggestions([]); // Clear proactive suggestions once user sends a message

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI assistant for knXw, a psychographic analytics platform.

Current context: ${currentContext}
Recent conversation: ${messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

User question: ${input}

Provide a helpful, concise response. Use markdown formatting. If suggesting actions, be specific about where to find features in the UI.`,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: response?.data || response || 'I apologize, but I encountered an error. Please try again.'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, currentContext, isLoading, summaryLoading]);

  // New function to summarize visualizations
  const summarizeVisualization = async (chartType, chartData) => {
    try {
      setSummaryLoading(true);

      const prompt = `Analyze this ${chartType} chart and provide a concise, actionable summary for a business user:

Data: ${JSON.stringify(chartData, null, 2)}

Provide:
1. Key insight (1 sentence)
2. Notable patterns or anomalies
3. Recommended action

Keep it under 100 words, focus on business impact.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const summaryMessage = {
        role: 'assistant',
        content: `📊 **Chart Summary:**\n\n${response?.data || response || 'Could not generate summary.'}`
      };

      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      logger.error('Failed to summarize visualization:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error summarizing the visualization. Please try again.'
      }]);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }} // Animate from right
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }} // Animate out to right
          className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#0a0a0a] border-l border-[#262626] shadow-2xl z-50 flex flex-col"
        >
          <Card className="bg-[#111111] border-[#00d4ff]/30 shadow-2xl flex flex-col h-full rounded-none md:rounded-l-lg">
            {/* Header */}
            <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-gradient-to-r from-[#00d4ff]/10 to-[#0ea5e9]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg">
                  <Bot className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Assistant</h2>
                  <p className="text-xs text-[#a3a3a3]">Context-aware help & insights</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#262626] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#a3a3a3]" />
              </button>
            </div>

            {/* Proactive Suggestions */}
            {proactiveSuggestions.length > 0 && messages.length === 0 && ( // Only show if suggestions exist and no user interaction yet
              <div className="p-4 border-b border-[#262626] bg-[#111111]">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                  <span className="text-sm font-semibold text-white">Suggestions for You</span>
                  {isGeneratingSuggestion && <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin" />}
                </div>
                <div className="space-y-2">
                  {proactiveSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full text-left p-3 rounded-lg bg-[#1a1a1a] border border-[#262626] hover:border-[#00d4ff]/40 transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-[#00d4ff] transition-colors">
                            {suggestion.title}
                          </p>
                          <p className="text-xs text-[#a3a3a3] mt-1 line-clamp-2">
                            {suggestion.description}
                          </p>
                        </div>
                        {suggestion.priority === 'high' && (
                          <Badge className="bg-[#ef4444]/20 text-[#ef4444] text-xs">High Impact</Badge>
                        )}
                        {suggestion.priority === 'medium' && (
                          <Badge className="bg-[#facc15]/20 text-[#facc15] text-xs">Medium Impact</Badge>
                        )}
                        {suggestion.priority === 'low' && (
                          <Badge className="bg-[#a3a3a3]/20 text-[#a3a3a3] text-xs">Low Impact</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-[#00d4ff] text-[#0a0a0a]'
                        : 'bg-[#1a1a1a] border border-[#262626] text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {(isLoading || summaryLoading || isGeneratingSuggestion) && ( // Show loader for any background AI task
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3">
                    <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#262626]">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything about knXw..."
                  className="bg-[#1a1a1a] border-[#262626] text-white resize-none"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || summaryLoading || isGeneratingSuggestion} // Disable if any AI task is running
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
