import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Heart, AlertTriangle, Sparkles, Loader2, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PREDICTIVE_SEGMENT_TYPES = [
  {
    id: 'churn_high',
    name: 'High Churn Risk',
    icon: TrendingDown,
    color: '#ef4444',
    description: 'Users with high likelihood of churning in the next 30 days',
    interventions: [
      'Send personalized re-engagement email with value reminders',
      'Offer limited-time discount or feature upgrade',
      'Schedule check-in call from customer success',
      'Present case studies aligned with their motivation stack',
      'Activate retention engagement rules'
    ]
  },
  {
    id: 'churn_medium',
    name: 'Moderate Churn Risk',
    icon: AlertTriangle,
    color: '#fbbf24',
    description: 'Users showing early signs of disengagement',
    interventions: [
      'Trigger educational content about underutilized features',
      'Send usage tips tailored to their cognitive style',
      'Invite to community events or webinars',
      'Request feedback on their experience',
      'Gradually increase engagement touchpoints'
    ]
  },
  {
    id: 'advocacy_high',
    name: 'High Advocacy Potential',
    icon: Heart,
    color: '#ec4899',
    description: 'Satisfied users likely to become brand advocates',
    interventions: [
      'Request testimonial or case study participation',
      'Invite to referral program with incentives',
      'Ask for product review on relevant platforms',
      'Offer early access to new features',
      'Nominate for community leadership role'
    ]
  },
  {
    id: 'expansion_ready',
    name: 'Expansion Ready',
    icon: TrendingUp,
    color: '#10b981',
    description: 'Users showing signals for upsell/cross-sell opportunities',
    interventions: [
      'Present advanced features matching their needs',
      'Share ROI calculator for premium tier',
      'Offer personalized demo of enterprise capabilities',
      'Provide limited-time upgrade discount',
      'Schedule strategic planning session'
    ]
  },
  {
    id: 'power_user_potential',
    name: 'Power User Potential',
    icon: Zap,
    color: '#8b5cf6',
    description: 'Users capable of deep platform engagement',
    interventions: [
      'Provide advanced tutorials and documentation',
      'Invite to beta testing programs',
      'Offer API access or developer resources',
      'Connect with other power users',
      'Request feature feedback and suggestions'
    ]
  }
];

export default function PredictiveSegments({ appId }) {
  const [predictions, setPredictions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze user psychographic profiles and behavioral data to predict future user behavior.

For a SaaS application, analyze users across these dimensions:
1. Churn Risk (High/Medium/Low)
2. Advocacy Potential (High/Medium/Low) 
3. Expansion Readiness (Ready/Potential/Not Ready)
4. Power User Potential (High/Medium/Low)

For each prediction:
- Estimate the percentage of users in each category
- Identify key psychographic indicators
- Provide confidence score (0-1)
- List specific behavioral signals
- Recommend personalized intervention strategies

Return JSON with this structure:
{
  "churn_high": {
    "percentage": 15,
    "estimated_users": 45,
    "confidence": 0.82,
    "key_indicators": ["low engagement frequency", "negative emotional signals", "high uncertainty"],
    "psychographic_profile": "Conservative risk profile with declining confidence scores",
    "behavioral_signals": ["Less than 5 logins in 14 days", "No feature adoption in 30 days"],
    "interventions": ["Personalized re-engagement", "Value reminder campaign"]
  },
  ... (repeat for other segments)
}`,
        response_json_schema: {
          type: "object",
          properties: {
            churn_high: {
              type: "object",
              properties: {
                percentage: { type: "number" },
                estimated_users: { type: "number" },
                confidence: { type: "number" },
                key_indicators: { type: "array", items: { type: "string" } },
                psychographic_profile: { type: "string" },
                behavioral_signals: { type: "array", items: { type: "string" } },
                interventions: { type: "array", items: { type: "string" } }
              }
            },
            churn_medium: { type: "object" },
            advocacy_high: { type: "object" },
            expansion_ready: { type: "object" },
            power_user_potential: { type: "object" }
          }
        }
      });

      setPredictions(response?.data || response);
    } catch (error) {
      console.error('Predictive analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#8b5cf6]/10 to-[#ec4899]/10 border-[#8b5cf6]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                Predictive Segmentation
              </CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-2">
                AI-powered predictions of future user behavior based on psychographic and behavioral patterns
              </p>
            </div>
            <Button
              onClick={runPredictiveAnalysis}
              disabled={isAnalyzing}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Prediction Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {predictions && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREDICTIVE_SEGMENT_TYPES.map((segmentType, index) => {
            const prediction = predictions[segmentType.id];
            if (!prediction) return null;

            const Icon = segmentType.icon;

            return (
              <motion.div
                key={segmentType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-[#1a1a1a] border-[#262626] hover:border-[#8b5cf6]/40 transition-all cursor-pointer"
                  onClick={() => setSelectedSegment(segmentType.id === selectedSegment ? null : segmentType.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${segmentType.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: segmentType.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">{segmentType.name}</CardTitle>
                          <p className="text-xs text-[#6b7280] mt-1">{segmentType.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#111111] rounded-lg p-3">
                        <p className="text-xs text-[#6b7280] mb-1">Estimated Users</p>
                        <p className="text-2xl font-bold text-white">{prediction.estimated_users || 0}</p>
                        <p className="text-xs text-[#a3a3a3] mt-1">{prediction.percentage || 0}% of base</p>
                      </div>
                      <div className="bg-[#111111] rounded-lg p-3">
                        <p className="text-xs text-[#6b7280] mb-1">Confidence</p>
                        <p className="text-2xl font-bold text-white">
                          {Math.round((prediction.confidence || 0) * 100)}%
                        </p>
                        <Progress 
                          value={(prediction.confidence || 0) * 100} 
                          className="mt-2 h-1"
                        />
                      </div>
                    </div>

                    {/* Key Indicators */}
                    {prediction.key_indicators && prediction.key_indicators.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#a3a3a3] mb-2">Key Indicators</p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.key_indicators.slice(0, 3).map((indicator, idx) => (
                            <Badge key={idx} className="bg-[#262626] text-[#e5e5e5] border-none text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded View */}
                    {selectedSegment === segmentType.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t border-[#262626]"
                      >
                        {/* Psychographic Profile */}
                        {prediction.psychographic_profile && (
                          <div>
                            <p className="text-xs font-semibold text-[#a3a3a3] mb-2">Psychographic Profile</p>
                            <p className="text-sm text-[#e5e5e5]">{prediction.psychographic_profile}</p>
                          </div>
                        )}

                        {/* Behavioral Signals */}
                        {prediction.behavioral_signals && prediction.behavioral_signals.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[#a3a3a3] mb-2">Behavioral Signals</p>
                            <ul className="space-y-1">
                              {prediction.behavioral_signals.map((signal, idx) => (
                                <li key={idx} className="text-xs text-[#a3a3a3] flex items-start gap-2">
                                  <Target className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: segmentType.color }} />
                                  {signal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommended Interventions */}
                        <div>
                          <p className="text-xs font-semibold text-[#a3a3a3] mb-2">Recommended Interventions</p>
                          <div className="space-y-2">
                            {segmentType.interventions.map((intervention, idx) => (
                              <div key={idx} className="bg-[#111111] rounded-lg p-2">
                                <p className="text-xs text-[#e5e5e5]">{intervention}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create engagement rule for this segment
                            }}
                          >
                            Create Engagement Rule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#262626] text-white hover:bg-[#262626]"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Export segment
                            }}
                          >
                            Export Segment
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}