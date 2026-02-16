import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Users, TrendingUp, Target, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PredictiveSegmentSuggestions({ onApplySegment }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = useCallback(async () => {
    setIsLoading(true);
    const profiles = await base44.entities.UserPsychographicProfile.filter(
      { is_demo: false }, '-last_analyzed', 100
    );

    const summary = {
      total: profiles.length,
      risk: { conservative: 0, moderate: 0, aggressive: 0 },
      cognitive: { analytical: 0, intuitive: 0, systematic: 0, creative: 0 },
      moods: {}
    };
    profiles.forEach(p => {
      if (p.risk_profile) summary.risk[p.risk_profile] = (summary.risk[p.risk_profile] || 0) + 1;
      if (p.cognitive_style) summary.cognitive[p.cognitive_style] = (summary.cognitive[p.cognitive_style] || 0) + 1;
      if (p.emotional_state?.mood) summary.moods[p.emotional_state.mood] = (summary.moods[p.emotional_state.mood] || 0) + 1;
    });

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a psychographic segmentation expert. Based on this user base data, predict 4 high-value audience segments that will emerge or grow in the next 30 days.

User base summary:
- Total profiles: ${summary.total}
- Risk distribution: ${JSON.stringify(summary.risk)}
- Cognitive styles: ${JSON.stringify(summary.cognitive)}
- Emotional moods: ${JSON.stringify(summary.moods)}

For each predicted segment, provide:
- A catchy segment name
- Description of the behavioral pattern
- Which psychographic filters define it (motivation_labels, risk_profile, cognitive_style)
- Predicted growth rate (percentage)
- Recommended engagement strategy
- Confidence score (0-1)`,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_segments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                filters: {
                  type: "object",
                  properties: {
                    motivation_labels: { type: "array", items: { type: "string" } },
                    risk_profile: { type: "array", items: { type: "string" } },
                    cognitive_style: { type: "array", items: { type: "string" } }
                  }
                },
                predicted_growth: { type: "number" },
                engagement_strategy: { type: "string" },
                confidence: { type: "number" },
                estimated_size: { type: "number" }
              }
            }
          }
        }
      }
    });

    setSuggestions(response);
    setIsLoading(false);
  }, []);

  if (!suggestions && !isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-10 h-10 text-[#ec4899] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">AI Segment Predictions</h3>
          <p className="text-sm text-[#a3a3a3] mb-4">
            Discover emerging audience segments predicted from behavioral trends.
          </p>
          <Button onClick={generateSuggestions} className="bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Predict Segments
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#ec4899] animate-spin mx-auto mb-3" />
          <p className="text-[#a3a3a3]">Analyzing behavioral patterns...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ec4899]" />
            Predicted Segments (30-Day)
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={generateSuggestions} className="text-[#a3a3a3] hover:text-white">
            <Sparkles className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.predicted_segments?.map((seg, i) => (
          <div key={i} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626] hover:border-[#ec4899]/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white">{seg.name}</h4>
                <p className="text-xs text-[#a3a3a3] mt-1">{seg.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{seg.predicted_growth}%
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 my-2">
              {seg.filters?.motivation_labels?.map((m, j) => (
                <Badge key={`m-${j}`} variant="outline" className="text-xs border-[#00d4ff]/30 text-[#00d4ff]">{m}</Badge>
              ))}
              {seg.filters?.risk_profile?.map((r, j) => (
                <Badge key={`r-${j}`} variant="outline" className="text-xs border-[#fbbf24]/30 text-[#fbbf24]">{r}</Badge>
              ))}
              {seg.filters?.cognitive_style?.map((c, j) => (
                <Badge key={`c-${j}`} variant="outline" className="text-xs border-[#8b5cf6]/30 text-[#8b5cf6]">{c}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> ~{seg.estimated_size} users
                </span>
                <span>{Math.round((seg.confidence || 0) * 100)}% confidence</span>
              </div>
              {onApplySegment && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApplySegment(seg.name, { psychographic: seg.filters })}
                  className="border-[#ec4899]/30 text-[#ec4899] hover:bg-[#ec4899]/10"
                >
                  <ArrowRight className="w-3 h-3 mr-1" /> Apply
                </Button>
              )}
            </div>

            <div className="mt-2 p-2 bg-[#111] rounded border border-[#262626]">
              <p className="text-xs text-[#a3a3a3]">
                <Target className="w-3 h-3 inline mr-1 text-[#ec4899]" />
                <span className="font-medium text-white">Strategy: </span>{seg.engagement_strategy}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}