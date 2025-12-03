import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Wand2, Copy, RefreshCw, MessageSquare, Mail, Bell,
  Lightbulb, Target, Zap, CheckCircle, ArrowRight, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHANNEL_CONFIGS = {
  in_app: {
    icon: MessageSquare,
    label: "In-App Message",
    maxTitle: 50,
    maxBody: 200,
    placeholder: "Welcome modal, feature announcement, upgrade prompt..."
  },
  push: {
    icon: Bell,
    label: "Push Notification",
    maxTitle: 65,
    maxBody: 240,
    placeholder: "Re-engagement, reminder, breaking news..."
  },
  email: {
    icon: Mail,
    label: "Email",
    maxTitle: 60,
    maxBody: 500,
    placeholder: "Welcome series, cart abandonment, newsletter..."
  }
};

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
  { value: "playful", label: "Playful" },
  { value: "empathetic", label: "Empathetic" }
];

const GOALS = [
  { value: "conversion", label: "Drive Conversion" },
  { value: "engagement", label: "Increase Engagement" },
  { value: "retention", label: "Improve Retention" },
  { value: "education", label: "Educate Users" },
  { value: "feedback", label: "Collect Feedback" }
];

export default function AIEngagementAssistant({ onSelectContent, initialChannel = "in_app" }) {
  const [channel, setChannel] = useState(initialChannel);
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("friendly");
  const [goal, setGoal] = useState("engagement");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [variations, setVariations] = useState([]);

  const generateContent = async () => {
    if (!context.trim()) return;
    
    setIsGenerating(true);
    setGeneratedContent(null);
    setVariations([]);

    try {
      const channelConfig = CHANNEL_CONFIGS[channel];
      
      const prompt = `You are an expert engagement copywriter. Generate compelling ${channelConfig.label} content.

CONTEXT: ${context}
GOAL: ${goal}
TONE: ${tone}
TARGET AUDIENCE: ${targetAudience || "General users"}
CHANNEL: ${channel}

CHARACTER LIMITS:
- Title/Subject: max ${channelConfig.maxTitle} characters
- Body: max ${channelConfig.maxBody} characters

Generate 3 variations of the content. Each variation should have a slightly different approach while maintaining the same goal and tone.

For each variation, also suggest:
- A compelling CTA button text (max 20 chars)
- The best time to send (e.g., "Morning", "After purchase", "Day 3 of trial")
- A psychographic insight about why this message works`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  body: { type: "string" },
                  cta: { type: "string" },
                  best_time: { type: "string" },
                  psychographic_insight: { type: "string" },
                  approach: { type: "string" }
                }
              }
            },
            overall_strategy: { type: "string" }
          }
        }
      });

      setGeneratedContent(response);
      setVariations(response.variations || []);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSelectVariation = (variation) => {
    if (onSelectContent) {
      onSelectContent({
        title: variation.title,
        message: variation.body,
        cta: variation.cta,
        channel
      });
    }
  };

  const ChannelIcon = CHANNEL_CONFIGS[channel].icon;

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6366f1]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Selection */}
        <div className="flex gap-2">
          {Object.entries(CHANNEL_CONFIGS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={channel === key ? "default" : "outline"}
                onClick={() => setChannel(key)}
                className={channel === key 
                  ? "bg-[#00d4ff] text-black" 
                  : "border-[#262626] text-[#a3a3a3]"
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Goal</label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm text-[#a3a3a3] mb-2 block">Target Audience (optional)</label>
          <Input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., New users, Power users, Churning customers..."
            className="bg-[#1a1a1a] border-[#262626] text-white"
          />
        </div>

        <div>
          <label className="text-sm text-[#a3a3a3] mb-2 block">
            Describe your campaign
          </label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={CHANNEL_CONFIGS[channel].placeholder}
            className="bg-[#1a1a1a] border-[#262626] text-white min-h-[100px]"
          />
        </div>

        <Button
          onClick={generateContent}
          disabled={isGenerating || !context.trim()}
          className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        {/* Generated Variations */}
        <AnimatePresence>
          {variations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {generatedContent?.overall_strategy && (
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#8b5cf6]" />
                    <span className="text-sm font-medium text-white">Strategy Insight</span>
                  </div>
                  <p className="text-sm text-[#a3a3a3]">{generatedContent.overall_strategy}</p>
                </div>
              )}

              <h4 className="text-white font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                Generated Variations
              </h4>

              {variations.map((variation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626] hover:border-[#00d4ff]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-[#262626] text-[#a3a3a3]">
                      Variation {index + 1}: {variation.approach}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${variation.title}\n\n${variation.body}`)}
                        className="text-[#a3a3a3] hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectVariation(variation)}
                        className="bg-[#00d4ff] text-black hover:bg-[#00b3cc]"
                      >
                        Use This
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#6b7280] mb-1">
                        {channel === 'email' ? 'Subject' : 'Title'}
                      </p>
                      <p className="text-white font-medium">{variation.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b7280] mb-1">Body</p>
                      <p className="text-[#e5e5e5]">{variation.body}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-[#262626]">
                      <div>
                        <p className="text-xs text-[#6b7280]">CTA</p>
                        <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] mt-1">
                          {variation.cta}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-[#6b7280]">Best Time</p>
                        <p className="text-sm text-white">{variation.best_time}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-[#6b7280]">Why This Works</p>
                      <p className="text-sm text-[#8b5cf6] italic">{variation.psychographic_insight}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}