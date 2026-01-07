import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Users, Target, Clock, 
  AlertTriangle, CheckCircle2, Activity
} from 'lucide-react';

export default function RealtimeJourneyInsights({ 
  nodes, 
  edges, 
  profiles = [], 
  feedbackData = [] 
}) {
  // Calculate journey health metrics
  const calculateMetrics = () => {
    if (!nodes.length) return null;

    const triggers = nodes.filter(n => n.type === 'trigger');
    const conditions = nodes.filter(n => n.type === 'condition');
    const actions = nodes.filter(n => n.type === 'action');
    const goals = nodes.filter(n => n.type === 'goal');

    // Psychographic coverage
    const psychographicConditions = conditions.filter(c => 
      c.data?.field?.includes('personality') || 
      c.data?.field?.includes('motivation') ||
      c.data?.field?.includes('risk_profile') ||
      c.data?.field?.includes('cognitive') ||
      c.data?.field?.includes('emotional')
    );

    const psychographicCoverage = conditions.length > 0 
      ? (psychographicConditions.length / conditions.length) * 100 
      : 0;

    // Estimated reach based on profiles
    const estimatedReach = profiles.length > 0 ? Math.min(profiles.length, 1000) : 0;

    // Path complexity
    const pathComplexity = edges.length > 0 
      ? Math.min(100, (edges.length / nodes.length) * 50) 
      : 0;

    // Engagement feedback metrics
    const avgEngagement = feedbackData.length > 0
      ? feedbackData.reduce((sum, f) => sum + (f.learning_signals?.content_relevance_score || 0), 0) / feedbackData.length
      : 0;

    return {
      triggers: triggers.length,
      conditions: conditions.length,
      actions: actions.length,
      goals: goals.length,
      psychographicCoverage,
      estimatedReach,
      pathComplexity,
      avgEngagement: avgEngagement * 100,
      hasGoal: goals.length > 0,
      hasTrigger: triggers.length > 0,
      isComplete: triggers.length > 0 && goals.length > 0 && actions.length > 0
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return (
      <div className="absolute bottom-4 right-4 bg-[#1a1a1a]/90 backdrop-blur border border-[#333] rounded-lg p-3 z-[100]">
        <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
          <Activity className="w-4 h-4" />
          <span>Add nodes to see insights</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 bg-[#1a1a1a]/95 backdrop-blur border border-[#333] rounded-lg p-4 z-[100] w-64">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-[#00d4ff]" />
        <span className="text-sm font-medium text-white">Journey Insights</span>
      </div>

      <div className="space-y-3">
        {/* Journey Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">Status</span>
          {metrics.isComplete ? (
            <Badge className="bg-green-500/20 text-green-400 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-400 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Incomplete
            </Badge>
          )}
        </div>

        {/* Psychographic Coverage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#9ca3af]">Psychographic Coverage</span>
            <span className="text-xs text-white">{metrics.psychographicCoverage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                metrics.psychographicCoverage >= 50 ? 'bg-green-500' : 
                metrics.psychographicCoverage >= 25 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.psychographicCoverage}%` }}
            />
          </div>
        </div>

        {/* Estimated Reach */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#9ca3af]" />
            <span className="text-xs text-[#9ca3af]">Est. Reach</span>
          </div>
          <span className="text-xs text-white">{metrics.estimatedReach.toLocaleString()} users</span>
        </div>

        {/* Path Complexity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-[#9ca3af]" />
            <span className="text-xs text-[#9ca3af]">Complexity</span>
          </div>
          <span className="text-xs text-white">{metrics.pathComplexity.toFixed(0)}%</span>
        </div>

        {/* Engagement Score */}
        {metrics.avgEngagement > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-[#9ca3af]">Avg Engagement</span>
            </div>
            <span className="text-xs text-green-400">{metrics.avgEngagement.toFixed(1)}%</span>
          </div>
        )}

        {/* Node Summary */}
        <div className="pt-2 border-t border-[#333] flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <span className="text-[#9ca3af]">T:{metrics.triggers}</span>
            <span className="text-[#9ca3af]">C:{metrics.conditions}</span>
            <span className="text-[#9ca3af]">A:{metrics.actions}</span>
            <span className="text-[#9ca3af]">G:{metrics.goals}</span>
          </div>
        </div>

        {/* Warnings */}
        {!metrics.hasTrigger && (
          <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-amber-400 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Add a trigger to start</span>
          </div>
        )}
        {!metrics.hasGoal && metrics.hasTrigger && (
          <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-amber-400 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Add a goal to complete</span>
          </div>
        )}
        {metrics.psychographicCoverage < 25 && metrics.conditions > 0 && (
          <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 text-blue-400 text-xs">
            <Target className="w-3 h-3" />
            <span>Add psychographic conditions</span>
          </div>
        )}
      </div>
    </div>
  );
}