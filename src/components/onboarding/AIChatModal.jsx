import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, X, Loader2 } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";

export default function AIChatModal({ open, onClose, context, instance }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with context message if provided
  useEffect(() => {
    if (open && context && instance) {
      const greeting = buildContextualGreeting(context);
      setMessages([{
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [open, context, instance]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const buildContextualGreeting = (ctx) => {
    if (!ctx) return "Hi! I'm your knXw AI assistant. How can I help you today?";

    let greeting = "Hi! I'm analyzing your current context. ";

    if (ctx.currentMetric) {
      greeting += `I see you're looking at **${ctx.currentMetric.name}** which is currently at **${ctx.currentMetric.value}**. `;
    }

    if (ctx.dashboardState) {
      const ds = ctx.dashboardState;
      greeting += `\n\nYour app currently has:\n`;
      greeting += `• **${ds.totalUsers}** total user profiles\n`;
      greeting += `• **${ds.activeUsers}** active users today\n`;
      greeting += `• **${ds.totalEvents}** captured events\n`;
      greeting += `• **${ds.avgEngagement}%** average engagement rate\n`;
      greeting += `• **${ds.totalInsights}** AI-generated insights\n`;
    }

    if (ctx.appContext) {
      greeting += `\n\nYou're working with the **${ctx.appContext.appName}** application.`;
    }

    greeting += "\n\nWhat would you like to know or improve?";
    return greeting;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build comprehensive system context
      let systemContext = `You are knXw's AI assistant, an expert in psychographic analytics and user behavior insights.

You are helping a user who is currently on their knXw analytics dashboard.`;

      if (context?.currentMetric) {
        systemContext += `\n\nThe user is specifically asking about the "${context.currentMetric.name}" metric, which currently shows: ${context.currentMetric.value}.`;
      }

      if (context?.dashboardState) {
        const ds = context.dashboardState;
        systemContext += `\n\nCurrent Dashboard Statistics:
- Total User Profiles: ${ds.totalUsers}
- Active Users (Today): ${ds.activeUsers}
- Total Captured Events: ${ds.totalEvents}
- Average Engagement Rate: ${ds.avgEngagement}%
- AI-Generated Insights: ${ds.totalInsights}
- Recent Events in View: ${ds.recentEventsCount}
- Profiles Analyzed: ${ds.profilesCount}`;
      }

      if (context?.appContext) {
        systemContext += `\n\nApplication Context:
- App Name: ${context.appContext.appName}
- App ID: ${context.appContext.appId}
- Authorized Domains: ${context.appContext.domains.join(', ') || 'None configured'}`;
      }

      if (context?.page) {
        systemContext += `\n\nUser is currently on page: ${context.page}`;
      }

      // Include conversation history
      const conversationHistory = messages.slice(-6).map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');

      const fullPrompt = `${systemContext}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}Current user question: ${userMessage.content}

Instructions:
1. Be specific and actionable based on the actual metrics and data shown above
2. Reference specific numbers when giving advice
3. Suggest concrete next steps the user can take
4. If metrics seem low or unusual, explain why and what to do about it
5. Keep responses concise but thorough
6. Use markdown formatting for readability

Provide your response:`;

      const response = await InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: "assistant",
        content: response || "I apologize, but I'm having trouble generating a response right now. Please try again.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-[#262626] text-white max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-[#262626]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                <Brain className="w-5 h-5 text-[#0a0a0a]" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">knXw AI Assistant</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#a3a3a3] hover:text-white hover:bg-[#262626]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#00d4ff] text-[#0a0a0a]'
                      : 'bg-[#1a1a1a] border border-[#262626] text-white'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    {msg.content.split('\n').map((line, i) => {
                      // Simple markdown parsing for bold
                      const parts = line.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <p key={i} className="mb-2 last:mb-0">
                          {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
                          })}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-[#262626]">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask me anything about your analytics..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-[#1a1a1a] border-[#262626] text-white placeholder:text-[#6b7280] focus:border-[#00d4ff]"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}