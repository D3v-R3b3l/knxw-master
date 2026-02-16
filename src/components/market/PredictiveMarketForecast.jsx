import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2, Sparkles, AlertTriangle, Target, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PredictiveMarketForecast({ currentAnalysis }) {
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateForecast = useCallback(async () => {
    setIsLoading(true);
    const context = currentAnalysis
      ? `Current analysis topic: ${currentAnalysis.title || 'N/A'}\nIndustry: ${currentAnalysis.industry_category || 'General'}\nMarket size: ${currentAnalysis.psychographic_analysis?.market_dynamics?.market_size || 'Unknown'}\nGrowth rate: ${currentAnalysis.psychographic_analysis?.market_dynamics?.growth_rate || 'Unknown'}`
      : "No specific market analysis loaded. Generate general market intelligence forecasts.";

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a strategic market intelligence forecaster. ${context}

Generate predictive forecasts for the next 6 months:
1. 3 market trend predictions with probability and timeline
2. 2 competitive shift predictions
3. 2 consumer behavior shifts
4. 1 disruptive risk scenario
5. Strategic recommendations based on these predictions

Be specific, data-driven, and actionable.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          market_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prediction: { type: "string" },
                probability: { type: "number" },
                timeline: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                evidence: { type: "string" }
              }
            }
          },
          competitive_shifts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                shift: { type: "string" },
                affected_players: { type: "string" },
                probability: { type: "number" },
                recommended_response: { type: "string" }
              }
            }
          },
          consumer_behavior_shifts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                shift: { type: "string" },
                psychographic_impact: { type: "string" },
                probability: { type: "number" },
                opportunity: { type: "string" }
              }
            }
          },
          disruptive_risk: {
            type: "object",
            properties: {
              scenario: { type: "string" },
              probability: { type: "number" },
              mitigation: { type: "string" }
            }
          },
          strategic_recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    setForecast(response);
    setIsLoading(false);
  }, [currentAnalysis]);

  const getProbabilityColor = (p) => {
    if (p >= 0.7) return "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30";
    if (p >= 0.4) return "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30";
    return "bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30";
  };

  const getImpactColor = (impact) => {
    if (impact === "high") return "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30";
    if (impact === "medium") return "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30";
    return "bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30";
  };

  if (!forecast && !isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-10 h-10 text-[#00d4ff] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Predictive Market Forecast</h3>
          <p className="text-sm text-[#a3a3a3] mb-4">
            AI-powered 6-month forecast of market trends, competitive shifts, and consumer behavior changes.
          </p>
          <Button onClick={generateForecast} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Forecast
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-3" />
          <p className="text-[#a3a3a3]">Scanning market signals and generating forecast...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Trend Predictions */}
      <Card className="bg-[#111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
            Market Trend Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forecast.market_trends?.map((t, i) => (
            <div key={i} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold flex-1">{t.prediction}</h4>
                <div className="flex gap-2 flex-shrink-0 ml-2">
                  <Badge className={getProbabilityColor(t.probability)}>
                    {Math.round(t.probability * 100)}% likely
                  </Badge>
                  <Badge className={getImpactColor(t.impact)}>{t.impact}</Badge>
                </div>
              </div>
              <p className="text-xs text-[#6b7280] mb-1">Timeline: {t.timeline}</p>
              <p className="text-sm text-[#a3a3a3]">{t.evidence}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Competitive Shifts */}
      <Card className="bg-[#111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#ec4899]" />
            Predicted Competitive Shifts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forecast.competitive_shifts?.map((s, i) => (
            <div key={i} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">{s.shift}</h4>
                <Badge className={getProbabilityColor(s.probability)}>
                  {Math.round(s.probability * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-[#6b7280] mb-2">Affected: {s.affected_players}</p>
              <div className="p-2 bg-[#111] rounded border border-[#00d4ff]/20">
                <p className="text-xs text-[#00d4ff]">
                  <Zap className="w-3 h-3 inline mr-1" />
                  {s.recommended_response}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consumer Behavior Shifts */}
      <Card className="bg-[#111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
            Consumer Behavior Shifts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forecast.consumer_behavior_shifts?.map((s, i) => (
            <div key={i} className="p-4 bg-[#0a0a0a] rounded-lg border border-[#262626]">
              <h4 className="text-white font-semibold mb-1">{s.shift}</h4>
              <p className="text-sm text-[#a3a3a3] mb-2">{s.psychographic_impact}</p>
              <div className="flex items-center justify-between">
                <Badge className={getProbabilityColor(s.probability)}>
                  {Math.round(s.probability * 100)}% likely
                </Badge>
                <span className="text-xs text-[#10b981]">{s.opportunity}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Disruptive Risk */}
      {forecast.disruptive_risk?.scenario && (
        <Card className="bg-[#111] border-[#ef4444]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              Disruptive Risk Scenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white mb-2">{forecast.disruptive_risk.scenario}</p>
            <Badge className={getProbabilityColor(forecast.disruptive_risk.probability)}>
              {Math.round(forecast.disruptive_risk.probability * 100)}% probability
            </Badge>
            <div className="mt-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#262626]">
              <p className="text-sm text-[#a3a3a3]">
                <span className="text-white font-semibold">Mitigation: </span>
                {forecast.disruptive_risk.mitigation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Recommendations */}
      {forecast.strategic_recommendations?.length > 0 && (
        <Card className="bg-[#111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#fbbf24]" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecast.strategic_recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#fbbf24] rounded-full flex items-center justify-center text-[#0a0a0a] text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-white text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button size="sm" variant="ghost" onClick={generateForecast} className="text-[#a3a3a3] hover:text-white">
          <Sparkles className="w-3 h-3 mr-1" /> Regenerate Forecast
        </Button>
      </div>
    </div>
  );
}