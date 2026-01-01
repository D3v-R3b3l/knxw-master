import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Brain, TrendingUp, Target, Zap, CheckCircle, XCircle,
  ThumbsUp, ThumbsDown, Play, Eye, Clock, Users, ArrowRight,
  RefreshCw, Lightbulb, Route
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const SUGGESTION_TYPES = {
  new_journey: { label: 'New Journey', icon: Route, color: '#00d4ff' },
  journey_optimization: { label: 'Optimization', icon: TrendingUp, color: '#10b981' },
  segment_opportunity: { label: 'Segment Opportunity', icon: Users, color: '#8b5cf6' },
  timing_adjustment: { label: 'Timing', icon: Clock, color: '#f59e0b' },
  content_personalization: { label: 'Content', icon: Sparkles, color: '#ec4899' }
};

export default function AIJourneyOrchestrator() {
  const queryClient = useQueryClient();
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: apps = [] } = useQuery({
    queryKey: ['client-apps'],
    queryFn: () => base44.entities.ClientApp.list('-created_date', 50)
  });

  useEffect(() => {
    if (apps.length > 0 && !selectedAppId) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps, selectedAppId]);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['ai-journey-suggestions', selectedAppId],
    queryFn: () => base44.entities.AIJourneySuggestion.filter(
      { client_app_id: selectedAppId, status: { $in: ['pending', 'reviewed'] } },
      '-created_date',
      50
    ),
    enabled: !!selectedAppId
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIJourneySuggestion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-journey-suggestions']);
    }
  });

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      // In production, this would call an AI backend function
      const mockSuggestions = [
        {
          client_app_id: selectedAppId,
          suggestion_type: 'new_journey',
          title: 'High-Intent User Conversion Flow',
          description: 'Users with aggressive risk profiles and high openness traits are 3.2x more likely to convert when presented with time-limited offers. This journey targets that segment.',
          priority: 'high',
          ai_reasoning: {
            pattern_detected: 'Aggressive risk profile users show 67% higher click-through on urgency messaging',
            supporting_data_points: 1247,
            confidence_score: 0.89,
            time_period_analyzed: 'Last 30 days',
            key_user_segments_affected: ['aggressive_risk', 'high_openness', 'achievement_motivated'],
            expected_impact: {
              metric: 'conversion_rate',
              predicted_improvement_percent: 23,
              confidence_range: [18, 28]
            }
          },
          suggested_journey_config: {
            name: 'Urgency Conversion Flow',
            estimated_reach: 2340
          }
        },
        {
          client_app_id: selectedAppId,
          suggestion_type: 'timing_adjustment',
          title: 'Optimal Engagement Window Shift',
          description: 'Analysis shows your analytical cognitive style users are most responsive between 2-4pm, not the current 10am targeting.',
          priority: 'medium',
          ai_reasoning: {
            pattern_detected: 'Analytical users show 45% higher engagement in afternoon hours',
            supporting_data_points: 892,
            confidence_score: 0.76,
            time_period_analyzed: 'Last 14 days',
            key_user_segments_affected: ['analytical_cognitive'],
            expected_impact: {
              metric: 'engagement_rate',
              predicted_improvement_percent: 15,
              confidence_range: [10, 20]
            }
          }
        },
        {
          client_app_id: selectedAppId,
          suggestion_type: 'content_personalization',
          title: 'Emotional State-Based Messaging',
          description: 'Users in anxious emotional states respond better to reassurance messaging. Current copy uses urgency which increases bounce rates.',
          priority: 'high',
          ai_reasoning: {
            pattern_detected: 'Anxious users bounce 2.1x more with urgency messaging',
            supporting_data_points: 567,
            confidence_score: 0.82,
            time_period_analyzed: 'Last 7 days',
            key_user_segments_affected: ['anxious_emotional', 'conservative_risk'],
            expected_impact: {
              metric: 'bounce_rate',
              predicted_improvement_percent: -18,
              confidence_range: [-25, -12]
            }
          }
        }
      ];

      for (const suggestion of mockSuggestions) {
        await base44.entities.AIJourneySuggestion.create(suggestion);
      }

      queryClient.invalidateQueries(['ai-journey-suggestions']);
      toast.success('Generated 3 new AI suggestions');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    }
    setIsGenerating(false);
  };

  const handleAccept = async (suggestion) => {
    await updateMutation.mutateAsync({ 
      id: suggestion.id, 
      data: { 
        status: 'accepted',
        user_feedback: { rating: 5 }
      } 
    });
    toast.success('Suggestion accepted! Navigate to Journeys to implement.');
  };

  const handleReject = async (suggestion, reason) => {
    await updateMutation.mutateAsync({ 
      id: suggestion.id, 
      data: { 
        status: 'rejected',
        user_feedback: { rating: 1, reason_if_rejected: reason }
      } 
    });
    toast.success('Suggestion rejected');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-500/20 text-gray-400',
      medium: 'bg-amber-500/20 text-amber-400',
      high: 'bg-red-500/20 text-red-400',
      critical: 'bg-purple-500/20 text-purple-400'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="AI Journey Orchestrator"
          description="AI-powered suggestions for proactive journey optimization"
          icon={Route}
          docSection="journeys"
          actions={
            <Button
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-black"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Suggestions
            </Button>
          }
        />

        {/* App Selector */}
        {apps.length > 0 && (
          <div className="mb-6">
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger className="w-80 bg-[#111] border-[#262626] text-white">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                {apps.map(app => (
                  <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Suggestions', value: suggestions.filter(s => s.status === 'pending').length, icon: Lightbulb, color: '#f59e0b' },
            { label: 'Avg. Confidence', value: `${((suggestions.reduce((acc, s) => acc + (s.ai_reasoning?.confidence_score || 0), 0) / Math.max(suggestions.length, 1)) * 100).toFixed(0)}%`, icon: Brain, color: '#8b5cf6' },
            { label: 'Est. Total Impact', value: `+${suggestions.reduce((acc, s) => acc + Math.abs(s.ai_reasoning?.expected_impact?.predicted_improvement_percent || 0), 0)}%`, icon: TrendingUp, color: '#10b981' },
            { label: 'Users Affected', value: suggestions.reduce((acc, s) => acc + (s.suggested_journey_config?.estimated_reach || 0), 0).toLocaleString(), icon: Users, color: '#00d4ff' }
          ].map((stat, i) => (
            <Card key={i} className="bg-[#111] border-[#262626]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-[#a3a3a3]">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Suggestions Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Suggestions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-[#111] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <Card className="bg-[#111] border-[#262626]">
                <CardContent className="p-8 text-center">
                  <Lightbulb className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                  <p className="text-[#a3a3a3]">No suggestions yet</p>
                  <p className="text-sm text-[#6b7280] mt-1">Click "Generate Suggestions" to get AI-powered journey recommendations</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {suggestions.map((suggestion, idx) => {
                  const typeConfig = SUGGESTION_TYPES[suggestion.suggestion_type] || SUGGESTION_TYPES.new_journey;
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card 
                        className={`bg-[#111] border-[#262626] cursor-pointer transition-all hover:border-[#00d4ff]/30 ${
                          selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-[#00d4ff]/50' : ''
                        }`}
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${typeConfig.color}20` }}>
                                <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
                              </div>
                              <Badge style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color, borderColor: `${typeConfig.color}40` }}>
                                {typeConfig.label}
                              </Badge>
                            </div>
                            <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>
                          </div>
                          
                          <h4 className="font-semibold text-white mb-2">{suggestion.title}</h4>
                          <p className="text-sm text-[#a3a3a3] line-clamp-2">{suggestion.description}</p>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                              <Brain className="w-3 h-3" />
                              <span>{((suggestion.ai_reasoning?.confidence_score || 0) * 100).toFixed(0)}% confidence</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleReject(suggestion, 'Not applicable'); }}
                                className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleAccept(suggestion); }}
                                className="bg-[#10b981] hover:bg-[#059669] text-white h-8"
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Detail Panel */}
          <div>
            {selectedSuggestion ? (
              <Card className="bg-[#111] border-[#262626] sticky top-6">
                <CardHeader>
                  <CardTitle className="text-white">{selectedSuggestion.title}</CardTitle>
                  <CardDescription>{selectedSuggestion.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Reasoning */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-[#8b5cf6]" />
                      AI Reasoning
                    </h4>
                    <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626] space-y-3">
                      <div>
                        <p className="text-xs text-[#a3a3a3]">Pattern Detected</p>
                        <p className="text-sm text-white">{selectedSuggestion.ai_reasoning?.pattern_detected}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#a3a3a3]">Data Points</p>
                          <p className="text-sm text-white">{selectedSuggestion.ai_reasoning?.supporting_data_points?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#a3a3a3]">Time Period</p>
                          <p className="text-sm text-white">{selectedSuggestion.ai_reasoning?.time_period_analyzed}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#a3a3a3]">Confidence Score</span>
                      <span className="text-[#00d4ff]">{((selectedSuggestion.ai_reasoning?.confidence_score || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={(selectedSuggestion.ai_reasoning?.confidence_score || 0) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Expected Impact */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#10b981]" />
                      Expected Impact
                    </h4>
                    <div className="p-4 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30">
                      <p className="text-2xl font-bold text-[#10b981]">
                        {selectedSuggestion.ai_reasoning?.expected_impact?.predicted_improvement_percent > 0 ? '+' : ''}
                        {selectedSuggestion.ai_reasoning?.expected_impact?.predicted_improvement_percent}%
                      </p>
                      <p className="text-sm text-[#a3a3a3] capitalize">
                        {selectedSuggestion.ai_reasoning?.expected_impact?.metric?.replace('_', ' ')}
                      </p>
                      {selectedSuggestion.ai_reasoning?.expected_impact?.confidence_range && (
                        <p className="text-xs text-[#6b7280] mt-1">
                          Range: {selectedSuggestion.ai_reasoning.expected_impact.confidence_range[0]}% to {selectedSuggestion.ai_reasoning.expected_impact.confidence_range[1]}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Affected Segments */}
                  {selectedSuggestion.ai_reasoning?.key_user_segments_affected?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Affected Segments</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSuggestion.ai_reasoning.key_user_segments_affected.map((segment, i) => (
                          <Badge key={i} className="bg-[#262626] text-[#a3a3a3] border-[#333]">
                            {segment.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-[#262626]">
                    <Button
                      onClick={() => handleReject(selectedSuggestion, 'Not applicable')}
                      variant="outline"
                      className="flex-1 border-[#262626] text-[#a3a3a3]"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAccept(selectedSuggestion)}
                      className="flex-1 bg-[#10b981] hover:bg-[#059669]"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept & Implement
                    </Button>
                  </div>

                  <Link to={createPageUrl('Journeys')}>
                    <Button variant="ghost" className="w-full text-[#00d4ff]">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Open Journey Builder
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#111] border-[#262626]">
                <CardContent className="p-8 text-center">
                  <Eye className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                  <p className="text-[#a3a3a3]">Select a suggestion to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}