import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X, Brain, User, Loader2 } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

export default function AIHelpChat({ context, initialQuestion, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (context) {
      const initialMessage = {
        role: 'ai',
        content: `I'm ready to help! Ask me anything about: **${context}**.`,
      };
      setMessages([initialMessage]);
      if (initialQuestion) {
        handleSendMessage(initialQuestion);
      }
    }
  }, [context, initialQuestion]);

  const handleSendMessage = async (predefinedQuery = null) => {
    const query = predefinedQuery || input;
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const systemPrompt = `You are a helpful AI assistant for a complex psychographics analytics app called "knXw". Your goal is to provide concise, helpful, and friendly answers to user questions. Your knowledge base should be focused *only* on the knXw application and its features. Do not answer questions outside of this scope.`;

        const fullPrompt = `${systemPrompt}\n\n**Current User Context:** The user is looking at a feature related to "${context}".\n\n**User's Question:** "${query}"\n\nProvide a clear and helpful answer. You can use markdown for formatting.`;

        const response = await InvokeLLM({
            prompt: fullPrompt,
            add_context_from_internet: false,
        });

      const aiMessage = { role: 'ai', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        role: 'ai',
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl w-full flex flex-col" style={{ height: 'calc(100% - 20px)' }}>
      {/* Chat Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-[#262626] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-[#00d4ff]" />
          <span className="text-base font-medium text-white">AI Assistant</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-[#a3a3a3] hover:text-white h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex-shrink-0 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#0a0a0a]" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#00d4ff] text-[#0a0a0a] rounded-br-none'
                    : 'bg-[#262626] text-white rounded-bl-none'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex-shrink-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-[#0a0a0a] animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#262626] text-white rounded-bl-none">
              <p className="text-sm italic">Thinking...</p>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#262626] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="bg-[#0a0a0a] border-[#262626] focus:border-[#00d4ff] text-white text-sm flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="bg-[#00d4ff] hover:bg-[#0ea5e9] h-10 px-4 flex-shrink-0" 
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4 text-[#0a0a0a]" />
          </Button>
        </form>
      </div>
    </div>
  );
}