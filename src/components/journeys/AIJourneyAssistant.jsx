import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Sparkles, Target, Users, TrendingUp, AlertTriangle, 
  RefreshCcw, ChevronRight, Zap, Clock, ArrowRight, Lightbulb,
  BarChart3, UserCheck, Timer, Play, X, Loader2
} from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const SUGGESTION_TYPES = {
  new_journey: { label: 'New Journey', icon: Sparkles, color: 'bg-purple-500' },
  optimization: { label: 'Optimization', icon: TrendingUp, color: 'bg-green-500' },
  segment_opportunity: { label: 'Segment Opportunity', icon: Users, color: 'bg-blue-500' },
  timing_adjustment: { label: 'Timing', icon: Clock, color: 'bg-amber-500' },
  content_personalization: { label: 'Personalization', icon: UserCheck, color: 'bg-pink-500' },
  reengagement: { label: 'Re-engagement', icon: RefreshCcw, color: 'bg-cyan-500' }
};

export default function AIJourneyAssistant({ 
  isOpen, 
  onClose, 
  onApplySuggestion, 
  currentNodes, 
  currentEdges,
  clientAppId 
}) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Fetch existing AI suggestions from database
  const { data: storedSuggestions = [], refetch: refetchSuggestions } = useQuery({
    queryKey: ['ai-journey-suggestions', clientAppId],
    queryFn: async () => {
      if (!clientAppId) return [];
      const suggestions = await base44.entities.AIJourneySuggestion.filter(
        { client_app_id: clientAppId, status: 'pending' },
        '-created_date',
        20
      );
      return suggestions;
    },
    enabled: !!clientAppId
  });

  // Fetch psychographic profiles for analysis
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-for-journey', clientAppId],
    queryFn: () => base44.entities.UserPsychographicProfile.filter({ is_demo: false }, '-last_analyzed', 100),
    enabled: isOpen
  });

  // Fetch engagement feedback for optimization
  const { data: feedbackData = [] } = useQuery({
    queryKey: ['engagement-feedback', clientAppId],
    queryFn: async () => {
      if (!clientAppId) return [];
      return base44.entities.EngagementFeedbackLoop.filter(
        { client_app_id: clientAppId },
        '-created_date',
        50
      );
    },
    enabled: !!clientAppId && isOpen
  });

  useEffect(() => {
    if (storedSuggestions.length > 0) {
      setAiSuggestions(storedSuggestions);
    }
  }, [storedSuggestions]);

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    try {
      // Analyze profiles to find patterns
      const profileAnalysis = analyzeProfiles(profiles);
      const feedbackAnalysis = analyzeFeedback(feedbackData);
      const currentJourneyAnalysis = analyzeCurrentJourney(currentNodes, currentEdges);

      // Generate suggestions using LLM
      const prompt = buildAnalysisPrompt(profileAnalysis, feedbackAnalysis, currentJourneyAnalysis);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  confidence: { type: "number" },
                  target_segments: { type: "array", items: { type: "string" } },
                  expected_impact: { type: "string" },
                  reasoning: { type: "string" },
                  suggested_nodes: { type: "array", items: { type: "object" } },
                  suggested_edges: { type: "array", items: { type: "object" } }
                }
              }
            }
          }
        }
      });

      const newSuggestions = response.suggestions || [];
      
      // Store suggestions in database
      for (const suggestion of newSuggestions) {
        await base44.entities.AIJourneySuggestion.create({
          client_app_id: clientAppId,
          suggestion_type: suggestion.type || 'new_journey',
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority || 'medium',
          status: 'pending',
          ai_reasoning: {
            pattern_detected: suggestion.reasoning,
            confidence_score: suggestion.confidence || 0.75,
            key_user_segments_affected: suggestion.target_segments || [],
            expected_impact: {
              metric: 'engagement',
              predicted_improvement_percent: parseFloat(suggestion.expected_impact) || 15
            }
          },
          suggested_journey_config: {
            nodes: suggestion.suggested_nodes || [],
            edges: suggestion.suggested_edges || [],
            target_segment: suggestion.target_segments?.[0] || 'all'
          }
        });
      }

      await refetchSuggestions();
      
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeProfiles = (profiles) => {
    if (!profiles.length) return { segments: [], patterns: [] };
    
    const riskDistribution = {};
    const cognitiveDistribution = {};
    const motivationPatterns = {};
    const emotionalStates = {};

    profiles.forEach(profile => {
      // Risk profile distribution
      riskDistribution[profile.risk_profile] = (riskDistribution[profile.risk_profile] || 0) + 1;
      
      // Cognitive style distribution
      cognitiveDistribution[profile.cognitive_style] = (cognitiveDistribution[profile.cognitive_style] || 0) + 1;
      
      // Motivation patterns
      profile.motivation_stack_v2?.forEach(m => {
        motivationPatterns[m.label] = (motivationPatterns[m.label] || 0) + m.weight;
      });

      // Emotional states
      if (profile.emotional_state?.mood) {
        emotionalStates[profile.emotional_state.mood] = (emotionalStates[profile.emotional_state.mood] || 0) + 1;
      }
    });

    return {
      totalProfiles: profiles.length,
      riskDistribution,
      cognitiveDistribution,
      motivationPatterns,
      emotionalStates,
      segments: identifySegments(profiles)
    };
  };

  const identifySegments = (profiles) => {
    const segments = [];
    
    // High-value conservative users
    const conservativeHighEngagement = profiles.filter(p => 
      p.risk_profile === 'conservative' && 
      p.personality_traits?.conscientiousness > 0.7
    );
    if (conservativeHighEngagement.length > profiles.length * 0.1) {
      segments.push({
        name: 'Conservative High-Performers',
        count: conservativeHighEngagement.length,
        characteristics: ['Risk-averse', 'Detail-oriented', 'Methodical'],
        opportunity: 'Trust-building journey with social proof'
      });
    }

    // Achievement-driven users
    const achievementDriven = profiles.filter(p => 
      p.motivation_stack_v2?.some(m => m.label?.toLowerCase().includes('achievement') && m.weight > 0.3)
    );
    if (achievementDriven.length > profiles.length * 0.15) {
      segments.push({
        name: 'Achievement Seekers',
        count: achievementDriven.length,
        characteristics: ['Goal-oriented', 'Competitive', 'Progress-focused'],
        opportunity: 'Gamified progression journey'
      });
    }

    // At-risk users (anxious/uncertain)
    const atRiskUsers = profiles.filter(p => 
      p.emotional_state?.mood === 'anxious' || 
      p.emotional_state?.mood === 'uncertain'
    );
    if (atRiskUsers.length > 0) {
      segments.push({
        name: 'At-Risk Users',
        count: atRiskUsers.length,
        characteristics: ['Uncertain', 'Need reassurance', 'Potential churn'],
        opportunity: 'Nurture and support journey'
      });
    }

    return segments;
  };

  const analyzeFeedback = (feedback) => {
    if (!feedback.length) return { avgAccuracy: 0, avgRelevance: 0, topOutcomes: {} };

    let totalAccuracy = 0;
    let totalRelevance = 0;
    const outcomes = {};

    feedback.forEach(f => {
      totalAccuracy += f.learning_signals?.psychographic_accuracy || 0;
      totalRelevance += f.learning_signals?.content_relevance_score || 0;
      const action = f.outcome?.user_action || 'unknown';
      outcomes[action] = (outcomes[action] || 0) + 1;
    });

    return {
      avgAccuracy: totalAccuracy / feedback.length,
      avgRelevance: totalRelevance / feedback.length,
      topOutcomes: outcomes,
      totalFeedback: feedback.length
    };
  };

  const analyzeCurrentJourney = (nodes, edges) => {
    if (!nodes.length) return { hasJourney: false };

    const triggers = nodes.filter(n => n.type === 'trigger');
    const conditions = nodes.filter(n => n.type === 'condition');
    const actions = nodes.filter(n => n.type === 'action');
    const waits = nodes.filter(n => n.type === 'wait');
    const goals = nodes.filter(n => n.type === 'goal');

    return {
      hasJourney: true,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      triggers: triggers.length,
      conditions: conditions.length,
      actions: actions.length,
      waits: waits.length,
      goals: goals.length,
      psychographicConditions: conditions.filter(c => 
        c.data?.field?.includes('personality') || 
        c.data?.field?.includes('motivation') ||
        c.data?.field?.includes('risk_profile')
      ).length
    };
  };

  const buildAnalysisPrompt = (profileAnalysis, feedbackAnalysis, journeyAnalysis) => {
    return `You are an AI journey optimization expert for a psychographic intelligence platform. Analyze the following data and suggest personalized user journeys.

## User Profile Analysis
- Total profiles analyzed: ${profileAnalysis.totalProfiles}
- Risk distribution: ${JSON.stringify(profileAnalysis.riskDistribution)}
- Cognitive styles: ${JSON.stringify(profileAnalysis.cognitiveDistribution)}
- Top motivations: ${JSON.stringify(profileAnalysis.motivationPatterns)}
- Emotional states: ${JSON.stringify(profileAnalysis.emotionalStates)}
- Identified segments: ${JSON.stringify(profileAnalysis.segments)}

## Engagement Feedback Analysis
- Average psychographic accuracy: ${(feedbackAnalysis.avgAccuracy * 100).toFixed(1)}%
- Average content relevance: ${(feedbackAnalysis.avgRelevance * 100).toFixed(1)}%
- User action distribution: ${JSON.stringify(feedbackAnalysis.topOutcomes)}

## Current Journey State
${journeyAnalysis.hasJourney ? `
- Total nodes: ${journeyAnalysis.nodeCount}
- Psychographic conditions: ${journeyAnalysis.psychographicConditions}
- Actions configured: ${journeyAnalysis.actions}
` : 'No journey currently configured'}

## Task
Generate 3-5 actionable journey suggestions that:
1. Target specific psychographic segments
2. Optimize timing based on emotional states
3. Personalize content based on cognitive styles and motivations
4. Include re-engagement opportunities for at-risk users
5. Drive conversions through psychologically-informed pathways

For each suggestion, provide:
- type: one of "new_journey", "optimization", "segment_opportunity", "timing_adjustment", "content_personalization", "reengagement"
- title: concise name
- description: detailed explanation
- priority: "low", "medium", "high", or "critical"
- confidence: 0-1 score
- target_segments: array of segment names
- expected_impact: percentage improvement expected
- reasoning: why this suggestion matters
- suggested_nodes: array of journey node configurations (with id, type, x, y, data)
- suggested_edges: array of edge configurations (with id, source, target, label)`;
  };

  const handleApplySuggestion = async (suggestion) => {
    if (suggestion.suggested_journey_config?.nodes?.length > 0) {
      onApplySuggestion(
        suggestion.suggested_journey_config.nodes,
        suggestion.suggested_journey_config.edges || []
      );
      
      // Mark as accepted
      await base44.entities.AIJourneySuggestion.update(suggestion.id, {
        status: 'accepted',
        user_feedback: { rating: 5, feedback_text: 'Applied to journey' }
      });
      
      await refetchSuggestions();
    }
  };

  const handleDismissSuggestion = async (suggestion) => {
    await base44.entities.AIJourneySuggestion.update(suggestion.id, {
      status: 'rejected',
      user_feedback: { reason_if_rejected: 'Dismissed by user' }
    });
    await refetchSuggestions();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-[#1a1a1a] border-[#333] text-white overflow-hidden flex flex-col">
        <CardHeader className="border-b border-[#333] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899]">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Journey Assistant</CardTitle>
                <p className="text-sm text-[#9ca3af]">
                  Intelligent suggestions based on psychographic analysis
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#9ca3af] hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 flex-shrink-0">
            <TabsList className="bg-[#262626] w-full">
              <TabsTrigger value="suggestions" className="flex-1 data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Suggestions
              </TabsTrigger>
              <TabsTrigger value="segments" className="flex-1 data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
                <Users className="w-4 h-4 mr-2" />
                Segments
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex-1 data-[state=active]:bg-[#00d4ff] data-[state=active]:text-black">
                <BarChart3 className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="flex-1 overflow-hidden p-4">
            <TabsContent value="suggestions" className="h-full m-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-[#9ca3af]">
                    {aiSuggestions.length} suggestions available
                  </p>
                  <Button 
                    onClick={generateAISuggestions} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white hover:opacity-90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Suggestions
                      </>
                    )}
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  {aiSuggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Lightbulb className="w-12 h-12 text-[#9ca3af] mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No suggestions yet</h3>
                      <p className="text-sm text-[#9ca3af] max-w-md">
                        Click "Generate Suggestions" to analyze your user profiles and get AI-powered journey recommendations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion) => {
                        const typeConfig = SUGGESTION_TYPES[suggestion.suggestion_type] || SUGGESTION_TYPES.new_journey;
                        const TypeIcon = typeConfig.icon;
                        
                        return (
                          <div
                            key={suggestion.id}
                            className={`p-4 rounded-lg border transition-all cursor-pointer ${
                              selectedSuggestion?.id === suggestion.id
                                ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                                : 'border-[#333] bg-[#262626] hover:border-[#555]'
                            }`}
                            onClick={() => setSelectedSuggestion(suggestion)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                                  <TypeIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-white truncate">{suggestion.title}</h4>
                                    <Badge className={`text-xs ${
                                      suggestion.priority === 'critical' ? 'bg-red-500' :
                                      suggestion.priority === 'high' ? 'bg-orange-500' :
                                      suggestion.priority === 'medium' ? 'bg-yellow-500' :
                                      'bg-gray-500'
                                    }`}>
                                      {suggestion.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-[#9ca3af] line-clamp-2">
                                    {suggestion.description}
                                  </p>
                                  
                                  {suggestion.ai_reasoning && (
                                    <div className="flex items-center gap-4 mt-2 text-xs text-[#6b7280]">
                                      <span className="flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        {Math.round((suggestion.ai_reasoning.confidence_score || 0) * 100)}% confidence
                                      </span>
                                      {suggestion.ai_reasoning.expected_impact?.predicted_improvement_percent && (
                                        <span className="flex items-center gap-1 text-green-400">
                                          <TrendingUp className="w-3 h-3" />
                                          +{suggestion.ai_reasoning.expected_impact.predicted_improvement_percent}% expected
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDismissSuggestion(suggestion);
                                  }}
                                  className="text-[#9ca3af] hover:text-red-400"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplySuggestion(suggestion);
                                  }}
                                  className="bg-[#00d4ff] text-black hover:bg-[#0ea5e9]"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Apply
                                </Button>
                              </div>
                            </div>

                            {selectedSuggestion?.id === suggestion.id && suggestion.ai_reasoning && (
                              <div className="mt-4 pt-4 border-t border-[#333]">
                                <h5 className="text-sm font-medium text-white mb-2">AI Reasoning</h5>
                                <p className="text-sm text-[#9ca3af] mb-3">
                                  {suggestion.ai_reasoning.pattern_detected}
                                </p>
                                
                                {suggestion.ai_reasoning.key_user_segments_affected?.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-[#6b7280]">Target segments:</span>
                                    {suggestion.ai_reasoning.key_user_segments_affected.map((seg, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs border-[#555] text-[#9ca3af]">
                                        {seg}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="segments" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <p className="text-sm text-[#9ca3af] mb-4">
                    Automatically identified user segments based on psychographic analysis
                  </p>
                  
                  {analyzeProfiles(profiles).segments.map((segment, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-[#333] bg-[#262626]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">{segment.name}</h4>
                          <p className="text-sm text-[#9ca3af]">{segment.count} users</p>
                        </div>
                        <Badge className="bg-[#00d4ff] text-black">
                          {((segment.count / profiles.length) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {segment.characteristics.map((char, cidx) => (
                          <Badge key={cidx} variant="outline" className="text-xs border-[#555] text-[#9ca3af]">
                            {char}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span className="text-[#9ca3af]">{segment.opportunity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="insights" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-[#333] bg-[#262626]">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-[#9ca3af]">Avg Psychographic Accuracy</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {(analyzeFeedback(feedbackData).avgAccuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-[#333] bg-[#262626]">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-[#9ca3af]">Content Relevance</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {(analyzeFeedback(feedbackData).avgRelevance * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-[#333] bg-[#262626]">
                    <h4 className="font-medium text-white mb-3">Profile Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(analyzeProfiles(profiles).riskDistribution).map(([risk, count]) => (
                        <div key={risk} className="flex items-center justify-between">
                          <span className="text-sm text-[#9ca3af] capitalize">{risk}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-[#333] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#00d4ff] rounded-full"
                                style={{ width: `${(count / profiles.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-white w-12 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-[#333] bg-[#262626]">
                    <h4 className="font-medium text-white mb-3">Top Motivations</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analyzeProfiles(profiles).motivationPatterns)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([motivation, weight]) => (
                          <Badge 
                            key={motivation} 
                            className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white"
                          >
                            {motivation}: {weight.toFixed(1)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}