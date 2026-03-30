import React, { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardStore } from "../components/dashboard/DashboardStore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Brain, Sparkles, RefreshCw, Trash2, Database, AppWindow } from "lucide-react";
import { motion } from "framer-motion";
import ExplainabilityView from "../components/insights/ExplainabilityView";
import { safeFormatDate } from "../components/utils/datetime";
import PageHeader from '../components/ui/PageHeader';
import { markOnboardingStep } from '../components/onboarding/OnboardingHelper';

export default function InsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedInsightIds, setSelectedInsightIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { selectedAppId, apps } = useDashboardStore();

  const { data: insights = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['insights', selectedAppId],
    queryFn: async () => {
      const rawInsights = selectedAppId ?
      await base44.entities.PsychographicInsight.filter({ client_app_id: selectedAppId }, '-created_date', 200) :
      await base44.entities.PsychographicInsight.list('-created_date', 200);
      const appMap = new Map((apps || []).map((app) => [app.id, app]));
      return rawInsights.filter((insight) => !insight.client_app_id || appMap.has(insight.client_app_id));
    }
  });

  const getInsightIcon = (type) => {
    const icons = {
      behavioral_pattern: TrendingUp,
      emotional_trigger: AlertCircle,
      motivation_shift: Sparkles,
      engagement_optimization: CheckCircle,
      risk_assessment: Brain
    };
    return icons[type] || Lightbulb;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      critical: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[priority] || colors.medium;
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'general';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(insight);
    return acc;
  }, {});

  const selectedCount = selectedInsightIds.length;

  const toggleInsightSelection = (insightId) => {
    setSelectedInsightIds((current) =>
    current.includes(insightId) ?
    current.filter((id) => id !== insightId) :
    [...current, insightId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedInsightIds((current) =>
    current.length === insights.length ? [] : insights.map((insight) => insight.id)
    );
  };

  const deleteInsights = async (ids) => {
    if (!ids.length || isDeleting) return;
    setIsDeleting(true);

    for (const id of ids) {
      let deleted = false;

      for (let attempt = 0; attempt < 4 && !deleted; attempt += 1) {
        try {
          await base44.entities.PsychographicInsight.delete(id);
          deleted = true;
        } catch (error) {
          const isRateLimit = error?.message?.includes('Rate limit exceeded');
          if (!isRateLimit || attempt === 3) {
            setIsDeleting(false);
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setSelectedInsightIds([]);
    if (selectedInsight && ids.includes(selectedInsight.id)) {
      setSelectedInsight(null);
    }
    await queryClient.invalidateQueries({ queryKey: ['insights'] });
    await refetch();
    setIsDeleting(false);
  };

  const appNameById = useMemo(() => new Map((apps || []).map((app) => [app.id, app.name])), [apps]);

  useEffect(() => {
    markOnboardingStep('view_insights');
  }, []);

  useEffect(() => {
    setSelectedInsightIds([]);
  }, [selectedAppId]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8" data-tour="insights-list">
        <PageHeader
          title="AI Insights"
          description="Psychographic intelligence and behavioral patterns"
          icon={Brain}
          docSection="ai-inference"
          actions={
          <Button
            onClick={() => refetch()}
            variant="ghost"
            className="border border-[#262626] bg-[#1a1a1a] text-white hover:bg-[#262626] hover:text-white">
            
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          } />
        

        <div className="max-w-7xl mx-auto">
          {!isLoading && insights.length > 0 &&
          <Card className="bg-[#1a1a1a] border-[#262626] mb-6">
              <CardContent className="py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#a3a3a3]">
                  <Button
                  variant="outline"
                  onClick={toggleSelectAll} className="bg-background text-[hsl(var(--foreground))] px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm h-9 border-[#262626] hover:bg-[#262626] hover:text-white">

                  
                    {selectedCount === insights.length ? 'Clear selection' : 'Select all'}
                  </Button>
                  <span>{insights.length} visible insights</span>
                  <span>{selectedCount} selected</span>
                </div>
                <Button
                onClick={() => deleteInsights(selectedInsightIds)}
                disabled={selectedCount === 0 || isDeleting}
                variant="destructive"
                className="gap-2">
                
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting slowly...' : 'Delete selected'}
                </Button>
              </CardContent>
            </Card>
          }
          {isLoading ?
          <div className="text-center py-12">
              <Brain className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-4" />
              <p className="text-[#a3a3a3]">Analyzing insights...</p>
            </div> :
          error ?
          <Card className="bg-[#1a1a1a] border-[#262626]">
              <CardContent className="py-12 text-center">
                <p className="text-red-400">Error loading insights: {error.message}</p>
              </CardContent>
            </Card> :
          insights.length === 0 ?
          <Card className="bg-[#1a1a1a] border-[#262626]">
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                <p className="text-[#a3a3a3]">No insights generated yet</p>
                <p className="text-sm text-[#6b7280] mt-2">
                  Insights will appear as we analyze user behavior patterns
                </p>
              </CardContent>
            </Card> :

          <div className="space-y-6">
              {Object.entries(groupedInsights).map(([type, typeInsights]) => {
              const IconComponent = getInsightIcon(type);
              return (
                <div key={type}>
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className="w-6 h-6 text-[#00d4ff]" />
                      <h2 className="text-xl font-bold text-white capitalize">
                        {type.replace(/_/g, ' ')}
                      </h2>
                      <Badge variant="outline" className="border-[#00d4ff]/30 text-[#00d4ff]">
                        {typeInsights.length}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {typeInsights.map((insight, index) =>
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}>
                      
                          <Card className="bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedInsight(insight)}>
                            <CardHeader>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div onClick={(e) => e.stopPropagation()} className="pt-1">
                                    <Checkbox
                                  checked={selectedInsightIds.includes(insight.id)}
                                  onCheckedChange={() => toggleInsightSelection(insight.id)} />
                                
                                  </div>
                                  <div className="min-w-0">
                                    <CardTitle className="text-white text-lg">{insight.title || 'Untitled Insight'}</CardTitle>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                      <Badge variant="outline" className="border-[#00d4ff]/30 text-[#00d4ff] gap-1">
                                        <AppWindow className="w-3 h-3" />
                                        {insight.source_app_name || appNameById.get(insight.client_app_id) || 'Unknown app'}
                                      </Badge>
                                      <Badge variant="outline" className="border-[#262626] text-[#a3a3a3] gap-1">
                                        <Database className="w-3 h-3" />
                                        {insight.source_event_count || insight.supporting_events?.length || 0} source events
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`${getPriorityColor(insight.priority)}`}>
                                  {insight.priority || 'medium'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-[#a3a3a3] text-sm mb-4">{insight.description || 'No description available'}</p>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-[#00d4ff]" />
                                  <span className="text-[#a3a3a3]">
                                    Confidence: {((insight.confidence_score || 0) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <span className="text-[#6b7280]">
                                  {safeFormatDate(insight.created_date)}
                                </span>
                              </div>

                              {insight.actionable_recommendations && insight.actionable_recommendations.length > 0 &&
                          <div className="mt-4 pt-4 border-t border-[#262626]">
                                  <p className="text-xs text-[#a3a3a3] mb-2">Recommendations:</p>
                                  <ul className="space-y-1">
                                    {insight.actionable_recommendations.slice(0, 2).map((rec, idx) =>
                              <li key={idx} className="text-sm text-white flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                              )}
                                  </ul>
                                  <div className="flex items-center justify-between gap-3 mt-3">
                                    {insight.actionable_recommendations.length > 2 ?
                              <Button
                                variant="link"
                                className="text-[#00d4ff] p-0 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInsight(insight);
                                }}>
                                
                                        View all {insight.actionable_recommendations.length} recommendations
                                      </Button> :
                              <span />}
                                    <Button
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                disabled={isDeleting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteInsights([insight.id]);
                                }}>
                                
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                          }
                            </CardContent>
                          </Card>
                        </motion.div>
                    )}
                    </div>
                  </div>);

            })}
            </div>
          }

          {selectedInsight &&
          <ExplainabilityView
            insight={selectedInsight}
            onClose={() => setSelectedInsight(null)} />

          }
        </div>
      </div>
    </div>);

}