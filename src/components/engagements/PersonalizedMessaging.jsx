import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Bell, MessageSquare, Sparkles, Loader2, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PersonalizedMessaging({ template, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState({
    analytical: template?.content?.analytical_variant || '',
    intuitive: template?.content?.intuitive_variant || '',
    systematic: template?.content?.systematic_variant || '',
    creative: template?.content?.creative_variant || '',
    conservative: template?.content?.conservative_variant || '',
    aggressive: template?.content?.aggressive_variant || ''
  });

  const generateVariants = async (baseMessage) => {
    if (!baseMessage) return;

    setIsGenerating(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate personalized message variants for different psychographic profiles.

Base message:
"${baseMessage}"

Create 6 variants tailored to:
1. Analytical cognitive style (data-driven, logical, detail-oriented)
2. Intuitive cognitive style (big picture, vision-focused, emotional)
3. Systematic cognitive style (process-oriented, structured, methodical)
4. Creative cognitive style (novel, imaginative, experimental)
5. Conservative risk profile (safety-focused, proven solutions, cautious)
6. Aggressive risk profile (bold, innovative, first-mover advantage)

Each variant should:
- Maintain the core message intent
- Adapt tone, structure, and emphasis to the psychological profile
- Use vocabulary and framing that resonates with that profile
- Be approximately the same length as the base message

Return JSON with variants.`,
        response_json_schema: {
          type: "object",
          properties: {
            analytical: { type: "string" },
            intuitive: { type: "string" },
            systematic: { type: "string" },
            creative: { type: "string" },
            conservative: { type: "string" },
            aggressive: { type: "string" }
          }
        }
      });

      setVariants(response);
      
      if (onUpdate) {
        onUpdate({
          ...template,
          content: {
            ...template.content,
            ...response,
            base_message: baseMessage
          }
        });
      }
    } catch (error) {
      console.error('Failed to generate variants:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#fbbf24]" />
            AI-Powered Message Personalization
          </CardTitle>
          <p className="text-sm text-[#a3a3a3] mt-2">
            Generate message variants optimized for different psychological profiles
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Base Message</label>
            <Textarea
              placeholder="Enter your base message here. AI will create personalized variants..."
              className="bg-[#0a0a0a] border-[#262626] text-white min-h-[100px]"
              defaultValue={template?.content?.base_message || ''}
              onBlur={(e) => {
                if (e.target.value && e.target.value !== template?.content?.base_message) {
                  generateVariants(e.target.value);
                }
              }}
            />
          </div>

          <Button
            onClick={() => {
              const baseMsg = document.querySelector('textarea').value;
              if (baseMsg) generateVariants(baseMsg);
            }}
            disabled={isGenerating}
            className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a] font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Variants...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Psychographic Variants
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {Object.values(variants).some(v => v) && (
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base">Message Variants</CardTitle>
            <p className="text-sm text-[#a3a3a3]">
              These variants will be automatically shown to users based on their psychographic profile
            </p>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="analytical">
              <TabsList className="bg-[#0a0a0a] border border-[#262626] w-full justify-start flex-wrap h-auto">
                <TabsTrigger value="analytical" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  Analytical
                </TabsTrigger>
                <TabsTrigger value="intuitive" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  Intuitive
                </TabsTrigger>
                <TabsTrigger value="systematic" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  Systematic
                </TabsTrigger>
                <TabsTrigger value="creative" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  Creative
                </TabsTrigger>
                <TabsTrigger value="conservative" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  Conservative
                </TabsTrigger>
                <TabsTrigger value="aggressive" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  Aggressive
                </TabsTrigger>
              </TabsList>

              {Object.entries(variants).map(([profile, message]) => (
                <TabsContent key={profile} value={profile} className="mt-4">
                  <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-none capitalize">
                        {profile} Users
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-[#a3a3a3] hover:text-white">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                    <Textarea
                      value={message}
                      onChange={(e) => {
                        const updated = { ...variants, [profile]: e.target.value };
                        setVariants(updated);
                        if (onUpdate) {
                          onUpdate({
                            ...template,
                            content: { ...template.content, ...updated }
                          });
                        }
                      }}
                      className="bg-[#111111] border-[#262626] text-white min-h-[120px]"
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#00d4ff]/10 border-[#00d4ff]/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#00d4ff] mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-2">How It Works</p>
              <ul className="space-y-1 text-sm text-[#e5e5e5]">
                <li>• AI analyzes your base message for intent and key points</li>
                <li>• Generates variants optimized for each psychological profile</li>
                <li>• Automatically delivers the right variant to each user</li>
                <li>• Tracks performance by psychographic segment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}