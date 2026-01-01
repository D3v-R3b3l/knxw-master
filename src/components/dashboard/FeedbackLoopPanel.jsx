import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, TrendingUp, TrendingDown, Brain, Zap, 
  CheckCircle, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackLoopPanel({ clientAppId }) {
  const { data: feedbackData = [], isLoading } = useQuery({
    queryKey: ['engagement-feedback', clientAppId],
    queryFn: () => base44.entities.EngagementFeedbackLoop.filter(
      { client_app_id: clientAppId },
      '-created_date',
      100
    ),
    enabled: !!clientAppId
  });

  // Calculate aggregate metrics
  const metrics = React.useMemo(() => {
    if (feedbackData.length === 0) return null;

    const outcomes = feedbackData.reduce((acc, f) => {
      acc[f.outcome?.user_action] = (acc[f.outcome?.user_action] || 0) + 1;
      return acc;
    }, {});

    const avgPsychographicAccuracy = feedbackData
      .filter(f => f.learning_signals?.psychographic_accuracy !== undefined)
      .reduce((acc, f, _, arr) => acc + (f.learning_signals.psychographic_accuracy / arr.length), 0);

    const avgContentRelevance = feedbackData
      .filter(f => f.learning_signals?.content_relevance_score !== undefined)
      .reduce((acc, f, _, arr) => acc + (f.learning_signals.content_relevance_score / arr.length), 0);

    const appliedCount = feedbackData.filter(f => f.applied_to_model).length;

    return {
      total: feedbackData.length,
      outcomes,
      avgPsychographicAccuracy,
      avgContentRelevance,
      appliedCount,
      conversionRate: ((outcomes.converted || 0) / feedbackData.length) * 100,
      engagementRate: (((outcomes.engaged || 0) + (outcomes.converted || 0)) / feedbackData.length) * 100
    };
  }, [feedbackData]);

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-[#a3a3a3]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading feedback data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-6 text-center">
          <Brain className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
          <p className="text-[#a3a3a3]">No feedback data yet</p>
          <p className="text-xs text-[#6b7280] mt-1">Feedback will appear as engagements are delivered</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#00d4ff]" />
          AI Learning Feedback Loop
        </CardTitle>
        <CardDescription>How engagement outcomes improve AI predictions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accuracy Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a3a3a3]">Psychographic Accuracy</span>
              <Brain className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {(metrics.avgPsychographicAccuracy * 100).toFixed(0)}%
            </div>
            <Progress value={metrics.avgPsychographicAccuracy * 100} className="h-2" />
          </div>

          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a3a3a3]">Content Relevance</span>
              <Zap className="w-4 h-4 text-[#fbbf24]" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {(metrics.avgContentRelevance * 100).toFixed(0)}%
            </div>
            <Progress value={metrics.avgContentRelevance * 100} className="h-2" />
          </div>
        </div>

        {/* Outcome Distribution */}
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Engagement Outcomes</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(metrics.outcomes).map(([action, count]) => {
              const config = {
                converted: { icon: CheckCircle, color: '#10b981' },
                engaged: { icon: TrendingUp, color: '#00d4ff' },
                dismissed: { icon: XCircle, color: '#6b7280' },
                ignored: { icon: AlertCircle, color: '#f59e0b' },
                negative_feedback: { icon: TrendingDown, color: '#ef4444' }
              }[action] || { icon: AlertCircle, color: '#6b7280' };

              const Icon = config.icon;
              const percentage = ((count / metrics.total) * 100).toFixed(0);

              return (
                <div 
                  key={action}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                  <span className="text-sm text-white capitalize">{action.replace('_', ' ')}</span>
                  <Badge style={{ backgroundColor: `${config.color}30`, color: config.color }}>
                    {percentage}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Status */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-[#8b5cf6]/10 to-[#00d4ff]/10 border border-[#8b5cf6]/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Model Learning</h4>
              <p className="text-sm text-[#a3a3a3]">
                {metrics.appliedCount} of {metrics.total} feedback signals applied to improve AI
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#8b5cf6]">
                {((metrics.appliedCount / metrics.total) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-[#a3a3a3]">Applied</p>
            </div>
          </div>
          <Progress 
            value={(metrics.appliedCount / metrics.total) * 100} 
            className="h-2 mt-3"
          />
        </div>

        {/* Key Performance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30">
            <div className="text-2xl font-bold text-[#10b981]">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-[#a3a3a3]">Conversion Rate</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30">
            <div className="text-2xl font-bold text-[#00d4ff]">{metrics.engagementRate.toFixed(1)}%</div>
            <p className="text-xs text-[#a3a3a3]">Engagement Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}