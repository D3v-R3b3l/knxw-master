import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Target, Zap } from 'lucide-react';
import AnimatedLine from '../charts/AnimatedLine';
import { base44 } from '@/api/base44Client';

export default function TrendForecastEngine({ topic, industry, timeframe = '90d' }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (topic) {
      generateForecast();
    }
  }, [topic, industry, timeframe]);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze market trends and generate a 90-day forecast for "${topic}" in the "${industry}" industry.

Provide:
1. Historical trend pattern (last 30 days)
2. Current momentum and velocity
3. Predicted trajectory (next 60 days)
4. Key inflection points and dates
5. Confidence intervals
6. Risk factors and catalysts

Return structured JSON with:
- historical_data: array of {date, value, sentiment}
- forecast_data: array of {date, predicted_value, confidence_lower, confidence_upper}
- momentum: "accelerating" | "stable" | "decelerating"
- key_events: array of {date, event, impact_score}
- recommendation: strategic action recommendation`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            historical_data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  value: { type: 'number' },
                  sentiment: { type: 'number' }
                }
              }
            },
            forecast_data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  predicted_value: { type: 'number' },
                  confidence_lower: { type: 'number' },
                  confidence_upper: { type: 'number' }
                }
              }
            },
            momentum: { type: 'string' },
            key_events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  event: { type: 'string' },
                  impact_score: { type: 'number' }
                }
              }
            },
            recommendation: { type: 'string' }
          }
        }
      });

      setForecastData(response);
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Generating AI-powered forecast...</p>
        </CardContent>
      </Card>
    );
  }

  if (!forecastData) {
    return null;
  }

  const combinedData = [
    ...forecastData.historical_data.map(d => ({
      date: d.date,
      actual: d.value,
      sentiment: d.sentiment
    })),
    ...forecastData.forecast_data.map(d => ({
      date: d.date,
      forecast: d.predicted_value,
      lower: d.confidence_lower,
      upper: d.confidence_upper
    }))
  ];

  const getMomentumIcon = () => {
    switch (forecastData.momentum) {
      case 'accelerating': return <TrendingUp className="w-5 h-5 text-[#10b981]" />;
      case 'decelerating': return <TrendingDown className="w-5 h-5 text-[#ef4444]" />;
      default: return <Activity className="w-5 h-5 text-[#fbbf24]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Momentum Indicator */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getMomentumIcon()}
              <div>
                <h3 className="text-white font-semibold capitalize">{forecastData.momentum} Momentum</h3>
                <p className="text-sm text-[#a3a3a3]">Market trend velocity analysis</p>
              </div>
            </div>
            <Badge className={`
              ${forecastData.momentum === 'accelerating' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : ''}
              ${forecastData.momentum === 'decelerating' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' : ''}
              ${forecastData.momentum === 'stable' ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' : ''}
            `}>
              {forecastData.momentum}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">90-Day Trend Forecast</CardTitle>
          <p className="text-sm text-[#a3a3a3]">
            Historical data + AI-predicted trajectory with confidence intervals
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <AnimatedLine
              data={combinedData}
              lines={[
                { key: 'actual', color: '#00d4ff', name: 'Historical' },
                { key: 'forecast', color: '#10b981', name: 'Forecast' },
                { key: 'lower', color: '#6b7280', name: 'Lower Bound' },
                { key: 'upper', color: '#6b7280', name: 'Upper Bound' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Events Timeline */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00d4ff]" />
            Key Inflection Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecastData.key_events.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                <AlertCircle className="w-5 h-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{event.event}</span>
                    <Badge variant="outline" className={`text-xs ${
                      event.impact_score > 0.7 ? 'text-[#10b981] border-[#10b981]/30' :
                      event.impact_score < 0.3 ? 'text-[#ef4444] border-[#ef4444]/30' :
                      'text-[#fbbf24] border-[#fbbf24]/30'
                    }`}>
                      Impact: {(event.impact_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-[#a3a3a3]">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendation */}
      <Card className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0ea5e9]/10 border-[#00d4ff]/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00d4ff]" />
            Strategic Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white leading-relaxed">{forecastData.recommendation}</p>
        </CardContent>
      </Card>
    </div>
  );
}