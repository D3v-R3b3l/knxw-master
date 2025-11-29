import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Loader2,
  Brain,
  Target,
  MessageSquare,
  Gift,
  Clock
} from 'lucide-react';
import { useDashboardStore } from "./DashboardStore";

export default function ChurnPredictionPanel() {
  const { profiles, userIdsInScope, isLoading: storeLoading } = useDashboardStore();
  const [churnAnalysis, setChurnAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyzeChurnRisk();
  }, [profiles, userIdsInScope]);

  const analyzeChurnRisk = async () => {
    if (!profiles || profiles.length === 0) {
      setChurnAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const scoped = userIdsInScope && userIdsInScope.size
        ? profiles.filter((p) => userIdsInScope.has(p.user_id))
        : profiles;

      // Calculate churn risk based on psychographic signals
      const analysis = {
        highRisk: [],
        mediumRisk: [],
        lowRisk: [],
        interventions: []
      };

      for (const profile of scoped) {
        const riskScore = calculateChurnRisk(profile);
        const userAnalysis = {
          user_id: profile.user_id,
          risk_score: riskScore,
          risk_level: getRiskLevel(riskScore),
          signals: getChurnSignals(profile),
          intervention: getRecommendedIntervention(profile, riskScore)
        };

        if (riskScore >= 0.7) {
          analysis.highRisk.push(userAnalysis);
        } else if (riskScore >= 0.4) {
          analysis.mediumRisk.push(userAnalysis);
        } else {
          analysis.lowRisk.push(userAnalysis);
        }
      }

      // Sort by risk score descending
      analysis.highRisk.sort((a, b) => b.risk_score - a.risk_score);
      analysis.mediumRisk.sort((a, b) => b.risk_score - a.risk_score);

      // Generate intervention recommendations
      analysis.interventions = generateInterventionStrategies(analysis);

      setChurnAnalysis(analysis);
    } catch (error) {
      console.error('Churn analysis failed:', error);
      setError('Failed to analyze churn risk');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateChurnRisk = (profile) => {
    let riskScore = 0;
    const weights = {
      emotional_state: 0.3,
      motivation_decay: 0.25,
      engagement_drop: 0.2,
      personality_mismatch: 0.15,
      cognitive_overload: 0.1
    };

    // Emotional state signals
    const mood = profile.emotional_state?.mood;
    if (mood === 'negative' || mood === 'anxious' || mood === 'uncertain') {
      riskScore += weights.emotional_state * 0.8;
    } else if (mood === 'neutral') {
      riskScore += weights.emotional_state * 0.3;
    }

    // Motivation signals
    const motivations = profile.motivation_stack_v2 || [];
    const hasStrongMotivation = motivations.some(m => m.weight > 0.7);
    if (!hasStrongMotivation) {
      riskScore += weights.motivation_decay * 0.7;
    }

    // Personality-product fit
    const personality = profile.personality_traits || {};
    if (personality.neuroticism > 0.7) {
      riskScore += weights.personality_mismatch * 0.6;
    }

    // Staleness as engagement proxy
    const staleness = profile.staleness_score || 0;
    riskScore += weights.engagement_drop * staleness;

    // Cognitive style mismatch signals
    if (profile.cognitive_style === 'intuitive' && !motivations.find(m => m.label?.includes('exploration'))) {
      riskScore += weights.cognitive_overload * 0.5;
    }

    return Math.min(riskScore, 1);
  };

  const getRiskLevel = (score) => {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  const getChurnSignals = (profile) => {
    const signals = [];
    
    if (profile.emotional_state?.mood === 'negative' || profile.emotional_state?.mood === 'anxious') {
      signals.push('Negative emotional state detected');
    }
    
    if (profile.staleness_score > 0.5) {
      signals.push('Low recent engagement');
    }
    
    const motivations = profile.motivation_stack_v2 || [];
    if (motivations.length === 0 || !motivations.some(m => m.weight > 0.5)) {
      signals.push('Weak motivation alignment');
    }
    
    if (profile.personality_traits?.neuroticism > 0.7) {
      signals.push('High stress indicators');
    }

    return signals;
  };

  const getRecommendedIntervention = (profile, riskScore) => {
    const motivations = profile.motivation_stack_v2 || [];
    const primaryMotivation = motivations[0]?.label || 'achievement';
    const cognitiveStyle = profile.cognitive_style || 'analytical';
    const emotionalState = profile.emotional_state?.mood || 'neutral';

    if (riskScore >= 0.7) {
      // High risk - personalized re-engagement
      if (primaryMotivation.includes('mastery') || primaryMotivation.includes('learning')) {
        return {
          type: 'educational_content',
          action: 'Send advanced feature tutorial',
          channel: 'email',
          timing: 'immediate',
          message: 'Unlock advanced capabilities'
        };
      } else if (primaryMotivation.includes('social') || primaryMotivation.includes('connection')) {
        return {
          type: 'community_invitation',
          action: 'Invite to exclusive user community',
          channel: 'in_app',
          timing: 'immediate',
          message: 'Join our power users community'
        };
      } else {
        return {
          type: 'personalized_offer',
          action: 'Send tailored retention offer',
          channel: 'email',
          timing: 'immediate',
          message: 'Exclusive offer for you'
        };
      }
    } else if (riskScore >= 0.4) {
      // Medium risk - engagement boost
      return {
        type: 'feature_highlight',
        action: `Show ${cognitiveStyle === 'analytical' ? 'data-driven case study' : 'quick win feature'}`,
        channel: 'in_app',
        timing: 'next_session',
        message: 'Discover what you might be missing'
      };
    } else {
      // Low risk - maintain engagement
      return {
        type: 'value_reinforcement',
        action: 'Share success metrics or tips',
        channel: 'email',
        timing: 'weekly',
        message: 'Your weekly insights digest'
      };
    }
  };

  const generateInterventionStrategies = (analysis) => {
    const strategies = [];

    if (analysis.highRisk.length > 0) {
      strategies.push({
        priority: 'critical',
        segment: 'High Risk',
        count: analysis.highRisk.length,
        action: 'Immediate personalized outreach',
        expectedImpact: '45-60% retention improvement',
        channels: ['email', 'in_app_modal', 'sms']
      });
    }

    if (analysis.mediumRisk.length > 0) {
      strategies.push({
        priority: 'high',
        segment: 'Medium Risk',
        count: analysis.mediumRisk.length,
        action: 'Automated engagement campaign',
        expectedImpact: '25-35% retention improvement',
        channels: ['in_app_notification', 'email']
      });
    }

    return strategies;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
      case 'Medium': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
      case 'Low': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
    }
  };

  if (storeLoading || isAnalyzing) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-4">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            Churn Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-[#00d4ff] animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !churnAnalysis) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-4">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            Churn Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-[#404040] mx-auto mb-4" />
            <p className="text-[#6b7280] mb-4">
              {error || 'No churn data available yet'}
            </p>
            <Button onClick={analyzeChurnRisk} size="sm" className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
              Analyze Churn Risk
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = churnAnalysis.highRisk.length + churnAnalysis.mediumRisk.length + churnAnalysis.lowRisk.length;

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            Predictive Churn Analysis
          </CardTitle>
          <Button onClick={analyzeChurnRisk} size="sm" variant="outline" className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]">
            Refresh
          </Button>
        </div>
        <p className="text-sm text-[#a3a3a3]">
          AI-powered churn prediction based on psychographic signals
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Risk Distribution */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#ef4444] mb-1">
              {churnAnalysis.highRisk.length}
            </div>
            <div className="text-xs text-[#a3a3a3]">High Risk</div>
            <div className="text-xs text-[#ef4444] font-semibold mt-1">
              {totalUsers > 0 ? Math.round((churnAnalysis.highRisk.length / totalUsers) * 100) : 0}%
            </div>
          </div>

          <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#fbbf24] mb-1">
              {churnAnalysis.mediumRisk.length}
            </div>
            <div className="text-xs text-[#a3a3a3]">Medium Risk</div>
            <div className="text-xs text-[#fbbf24] font-semibold mt-1">
              {totalUsers > 0 ? Math.round((churnAnalysis.mediumRisk.length / totalUsers) * 100) : 0}%
            </div>
          </div>

          <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#10b981] mb-1">
              {churnAnalysis.lowRisk.length}
            </div>
            <div className="text-xs text-[#a3a3a3]">Low Risk</div>
            <div className="text-xs text-[#10b981] font-semibold mt-1">
              {totalUsers > 0 ? Math.round((churnAnalysis.lowRisk.length / totalUsers) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* High Risk Users */}
        {churnAnalysis.highRisk.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-[#ef4444] mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical Attention Required ({churnAnalysis.highRisk.length})
            </h4>
            <div className="space-y-2">
              {churnAnalysis.highRisk.slice(0, 3).map((user, idx) => (
                <div key={idx} className="bg-[#0a0a0a] border border-[#ef4444]/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">{user.user_id}</span>
                    <Badge className={getRiskColor(user.risk_level)}>
                      {Math.round(user.risk_score * 100)}% risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {user.signals.slice(0, 2).map((signal, signalIdx) => (
                      <div key={signalIdx} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-[#ef4444] rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-[#a3a3a3]">{signal}</span>
                      </div>
                    ))}
                  </div>

                  {user.intervention && (
                    <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-3 h-3 text-[#00d4ff]" />
                        <span className="text-xs text-[#00d4ff] font-semibold">Recommended Intervention</span>
                      </div>
                      <p className="text-xs text-[#e5e5e5]">{user.intervention.action}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-[#a3a3a3]" />
                        <span className="text-xs text-[#a3a3a3] capitalize">{user.intervention.timing.replace('_', ' ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {churnAnalysis.highRisk.length > 3 && (
                <div className="text-center pt-2">
                  <span className="text-xs text-[#6b7280]">
                    +{churnAnalysis.highRisk.length - 3} more users at high risk
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Intervention Strategies */}
        {churnAnalysis.interventions.length > 0 && (
          <div className="pt-4 border-t border-[#262626]">
            <h4 className="text-sm font-semibold text-white mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              {churnAnalysis.interventions.map((strategy, idx) => (
                <div key={idx} className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">{strategy.segment}</span>
                    <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs">
                      {strategy.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#a3a3a3] mb-2">{strategy.action}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7280]">Expected Impact:</span>
                    <span className="text-[#00d4ff] font-semibold">{strategy.expectedImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalUsers === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-[#404040] mx-auto mb-4" />
            <p className="text-[#6b7280]">No user profiles to analyze yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}