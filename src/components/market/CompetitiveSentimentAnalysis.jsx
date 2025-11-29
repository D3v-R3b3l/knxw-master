import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smile, Meh, Frown, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle } from 'lucide-react';
import AnimatedLine from '../charts/AnimatedLine';
import { base44 } from '@/api/base44Client';

export default function CompetitiveSentimentAnalysis({ competitors = [], topic }) {
  const [sentimentData, setSentimentData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  useEffect(() => {
    if (competitors.length > 0) {
      analyzeSentiment();
    }
  }, [competitors, topic]);

  const analyzeSentiment = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze competitive sentiment for these companies regarding "${topic}":
${competitors.map((c, i) => `${i + 1}. ${c}`).join('\n')}

For each competitor, provide:
1. Current sentiment score (-1 to +1)
2. Sentiment trend (improving/declining/stable)
3. Key sentiment drivers (what's causing positive/negative sentiment)
4. Recent sentiment shifts and catalysts
5. 30-day sentiment timeline

Also provide:
- Sentiment leaderboard ranking
- Sentiment volatility scores
- Competitive positioning insights

Return structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            competitors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  current_score: { type: 'number' },
                  trend: { type: 'string' },
                  drivers: {
                    type: 'object',
                    properties: {
                      positive: { type: 'array', items: { type: 'string' } },
                      negative: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  volatility: { type: 'number' },
                  timeline: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        score: { type: 'number' }
                      }
                    }
                  }
                }
              }
            },
            insights: { type: 'string' }
          }
        }
      });

      setSentimentData(response);
      
      // Build timeline for visualization
      if (response.competitors?.length > 0) {
        const timeline = response.competitors[0].timeline.map((point, index) => {
          const dataPoint = { date: point.date };
          response.competitors.forEach((comp) => {
            dataPoint[comp.name] = comp.timeline[index]?.score || 0;
          });
          return dataPoint;
        });
        setTimelineData(timeline);
      }
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (score) => {
    if (score > 0.3) return <Smile className="w-5 h-5 text-[#10b981]" />;
    if (score < -0.3) return <Frown className="w-5 h-5 text-[#ef4444]" />;
    return <Meh className="w-5 h-5 text-[#fbbf24]" />;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-[#10b981]" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-[#ef4444]" />;
    return <Minus className="w-4 h-4 text-[#6b7280]" />;
  };

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
    if (score < -0.3) return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
    return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
  };

  if (loading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Analyzing competitive sentiment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!sentimentData) {
    return null;
  }

  const sortedCompetitors = [...sentimentData.competitors].sort((a, b) => b.current_score - a.current_score);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Competitive Sentiment Analysis</h3>
        <Button
          onClick={analyzeSentiment}
          variant="outline"
          size="sm"
          className="border-[#262626] text-[#a3a3a3]"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Sentiment Timeline */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">30-Day Sentiment Trends</CardTitle>
          <p className="text-sm text-[#a3a3a3]">
            Comparative sentiment scores over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <AnimatedLine
              data={timelineData}
              lines={sortedCompetitors.map((comp, index) => ({
                key: comp.name,
                color: ['#00d4ff', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6'][index % 5],
                name: comp.name
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Competitor Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCompetitors.map((competitor, index) => (
          <Card
            key={competitor.name}
            className={`bg-[#111111] border-[#262626] cursor-pointer transition-all ${
              selectedCompetitor === competitor.name ? 'border-[#00d4ff] shadow-lg' : 'hover:border-[#00d4ff]/40'
            }`}
            onClick={() => setSelectedCompetitor(competitor.name)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#6b7280]">#{index + 1}</span>
                  <div>
                    <h4 className="text-white font-semibold">{competitor.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getSentimentIcon(competitor.current_score)}
                      <Badge className={getSentimentColor(competitor.current_score)}>
                        {(competitor.current_score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                {getTrendIcon(competitor.trend)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Volatility */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#a3a3a3]">Volatility</span>
                <div className="flex items-center gap-2">
                  {competitor.volatility > 0.6 && <AlertTriangle className="w-3 h-3 text-[#fbbf24]" />}
                  <span className="text-white font-medium">{(competitor.volatility * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Positive Drivers */}
              {competitor.drivers.positive.length > 0 && (
                <div>
                  <p className="text-xs text-[#10b981] font-medium mb-1">Positive Drivers:</p>
                  <ul className="space-y-1">
                    {competitor.drivers.positive.slice(0, 2).map((driver, idx) => (
                      <li key={idx} className="text-xs text-[#a3a3a3] line-clamp-1">• {driver}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negative Drivers */}
              {competitor.drivers.negative.length > 0 && (
                <div>
                  <p className="text-xs text-[#ef4444] font-medium mb-1">Challenges:</p>
                  <ul className="space-y-1">
                    {competitor.drivers.negative.slice(0, 2).map((driver, idx) => (
                      <li key={idx} className="text-xs text-[#a3a3a3] line-clamp-1">• {driver}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0ea5e9]/10 border-[#00d4ff]/30">
        <CardHeader>
          <CardTitle className="text-white">Competitive Positioning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white leading-relaxed whitespace-pre-line">{sentimentData.insights}</p>
        </CardContent>
      </Card>
    </div>
  );
}