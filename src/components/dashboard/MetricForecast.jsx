import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Loader2, Sparkles, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AnimatedLine from "../charts/AnimatedLine";

export default function MetricForecast({ metrics, profiles, events }) {
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateForecast = useCallback(async () => {
    setIsLoading(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a data analyst. Based on these current platform metrics, generate a 4-week forecast.

Current metrics:
- Total profiles: ${metrics.totalUsers || 0}
- Active today: ${metrics.activeUsers || 0}
- Recent events: ${metrics.totalEvents || 0}
- Engagement rate: ${metrics.avgEngagement || 0}%
- AI Insights generated: ${metrics.totalInsights || 0}
- Total profiles in system: ${profiles?.length || 0}
- Total events captured: ${events?.length || 0}

Generate realistic weekly forecasts for the next 4 weeks based on typical growth patterns.
For each metric provide current value and 4 weekly projections.
Also provide 2-3 key growth drivers and 2-3 risk factors.`,
      response_json_schema: {
        type: "object",
        properties: {
          weekly_forecast: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week: { type: "string" },
                profiles: { type: "number" },
                active_users: { type: "number" },
                events: { type: "number" },
                engagement_rate: { type: "number" },
                insights: { type: "number" }
              }
            }
          },
          growth_drivers: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } },
          overall_trend: { type: "string", enum: ["accelerating", "steady", "decelerating", "declining"] },
          confidence: { type: "number" }
        }
      }
    });
    setForecast(response);
    setIsLoading(false);
  }, [metrics, profiles, events]);

  const trendConfig = {
    accelerating: { color: "text-[#10b981]", icon: ArrowUpRight, label: "Accelerating" },
    steady: { color: "text-[#00d4ff]", icon: Minus, label: "Steady Growth" },
    decelerating: { color: "text-[#fbbf24]", icon: ArrowDownRight, label: "Decelerating" },
    declining: { color: "text-[#ef4444]", icon: ArrowDownRight, label: "Declining" }
  };

  if (!forecast && !isLoading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-10 h-10 text-[#8b5cf6] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Predictive Forecast</h3>
          <p className="text-sm text-[#a3a3a3] mb-4 max-w-md mx-auto">
            AI-powered 4-week forecast of key metrics based on current trends and behavioral patterns.
          </p>
          <Button onClick={generateForecast} className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Forecast
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin mx-auto mb-3" />
          <p className="text-[#a3a3a3]">Analyzing trends and generating forecast...</p>
        </CardContent>
      </Card>
    );
  }

  const trend = trendConfig[forecast.overall_trend] || trendConfig.steady;
  const TrendIcon = trend.icon;

  const chartData = forecast.weekly_forecast?.map(w => ({
    week: w.week,
    Profiles: w.profiles,
    "Active Users": w.active_users,
    Events: w.events
  })) || [];

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
            4-Week Predictive Forecast
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${trend.color} bg-white/5 border-white/10`}>
              <TrendIcon className="w-3 h-3 mr-1" />
              {trend.label}
            </Badge>
            <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">
              {Math.round((forecast.confidence || 0) * 100)}% confidence
            </Badge>
            <Button size="sm" variant="ghost" onClick={generateForecast} className="text-[#a3a3a3] hover:text-white">
              <Sparkles className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length > 0 && (
          <div className="h-56">
            <AnimatedLine
              data={chartData}
              xKey="week"
              lines={[
                { key: "Profiles", color: "#00d4ff", name: "Profiles" },
                { key: "Active Users", color: "#10b981", name: "Active Users" },
              ]}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#10b981] mb-2">Growth Drivers</h4>
            <ul className="space-y-1">
              {forecast.growth_drivers?.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#a3a3a3]">
                  <ArrowUpRight className="w-3 h-3 text-[#10b981] mt-1 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#ef4444] mb-2">Risk Factors</h4>
            <ul className="space-y-1">
              {forecast.risk_factors?.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#a3a3a3]">
                  <ArrowDownRight className="w-3 h-3 text-[#ef4444] mt-1 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}