import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Loader2, Lightbulb, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PredictiveABTesting({ test, variants, onUpdateTest }) {
  const [aiHypotheses, setAiHypotheses] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [banditAllocation, setBanditAllocation] = useState(null);
  const [earlyStoppingRecommendation, setEarlyStoppingRecommendation] = useState(null);

  const generateAIHypotheses = async () => {
    setIsGenerating(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate AI-driven A/B test hypotheses for a psychographic analytics platform.

Current test: ${test.name}
Test type: ${test.test_type}
Target segments: ${JSON.stringify(test.targeting_conditions)}

Analyze psychographic and behavioral data to suggest 3 specific test hypotheses that could improve engagement or conversion.

For each hypothesis:
1. Describe the hypothesis clearly
2. Explain the psychological rationale
3. Identify target psychographic segments
4. Predict expected impact (lift percentage)
5. Suggest specific variants to test
6. Estimate confidence level (0-1)

Return JSON:
{
  "hypotheses": [
    {
      "id": "hyp_1",
      "hypothesis": "Users with analytical cognitive style respond better to data-driven messaging",
      "psychological_rationale": "Analytical users trust numbers and logic over emotional appeals",
      "target_segments": ["analytical cognitive style", "high conscientiousness"],
      "predicted_lift": 15,
      "confidence": 0.78,
      "variant_suggestions": [
        { "name": "Control", "description": "Current messaging" },
        { "name": "Data-Heavy", "description": "Include statistics and metrics" }
      ]
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            hypotheses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  hypothesis: { type: "string" },
                  psychological_rationale: { type: "string" },
                  target_segments: { type: "array", items: { type: "string" } },
                  predicted_lift: { type: "number" },
                  confidence: { type: "number" },
                  variant_suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setAiHypotheses(response?.data?.hypotheses || []);
    } catch (error) {
      console.error('Failed to generate AI hypotheses:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateBanditAllocation = async () => {
    if (!variants || variants.length === 0) return;

    // Multi-armed bandit allocation using Thompson Sampling
    const totalParticipants = variants.reduce((sum, v) => sum + (v.performance_metrics?.participants || 0), 0);
    
    if (totalParticipants < 100) {
      // Not enough data - use equal allocation
      setBanditAllocation({
        strategy: 'equal',
        message: 'Insufficient data for bandit allocation. Using equal traffic split.',
        allocations: variants.map(v => ({
          variant_id: v.id,
          name: v.name,
          current_weight: v.traffic_weight,
          recommended_weight: 1 / variants.length,
          reasoning: 'Exploration phase'
        }))
      });
      return;
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate multi-armed bandit traffic allocation for A/B test variants.

Variants performance:
${variants.map(v => `- ${v.name}: ${v.performance_metrics?.participants || 0} participants, ${v.performance_metrics?.conversion_rate || 0}% conversion`).join('\n')}

Use Thompson Sampling to recommend traffic allocation that balances:
1. Exploitation (sending more traffic to winning variants)
2. Exploration (gathering more data on uncertain variants)

Return JSON:
{
  "strategy": "thompson_sampling",
  "allocations": [
    {
      "variant_id": "var_1",
      "name": "Control",
      "current_weight": 0.5,
      "recommended_weight": 0.3,
      "reasoning": "Underperforming, reduce allocation"
    }
  ],
  "expected_improvement": 12,
  "confidence": 0.85
}`,
        response_json_schema: {
          type: "object",
          properties: {
            strategy: { type: "string" },
            allocations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_id: { type: "string" },
                  name: { type: "string" },
                  current_weight: { type: "number" },
                  recommended_weight: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            expected_improvement: { type: "number" },
            confidence: { type: "number" }
          }
        }
      });

      setBanditAllocation(response?.data);
    } catch (error) {
      console.error('Failed to calculate bandit allocation:', error);
    }
  };

  const checkEarlyStopping = async () => {
    if (!variants || variants.length === 0) return;

    const totalParticipants = variants.reduce((sum, v) => sum + (v.performance_metrics?.participants || 0), 0);
    
    if (totalParticipants < (test.statistical_settings?.minimum_sample_size || 100)) {
      setEarlyStoppingRecommendation({
        recommendation: 'continue',
        confidence: 0,
        reasoning: 'Minimum sample size not reached yet'
      });
      return;
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze A/B test results to recommend early stopping decision.

Test configuration:
- Confidence level: ${test.statistical_settings?.confidence_level || 0.95}
- Minimum sample size: ${test.statistical_settings?.minimum_sample_size || 100}
- Current participants: ${totalParticipants}

Variant performance:
${variants.map(v => `- ${v.name}: ${v.performance_metrics?.conversion_rate || 0}% conversion (${v.performance_metrics?.participants || 0} participants)`).join('\n')}

Determine if:
1. There's a statistically significant winner
2. The test should continue for more data
3. The test should stop due to no significant difference

Return JSON:
{
  "recommendation": "stop_winner" | "stop_no_difference" | "continue",
  "confidence": 0.95,
  "reasoning": "Variant B shows 15% lift with 95% confidence",
  "winner_variant_id": "var_2",
  "statistical_power": 0.82,
  "days_to_significance": 3
}`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
            winner_variant_id: { type: "string" },
            statistical_power: { type: "number" },
            days_to_significance: { type: "number" }
          }
        }
      });

      setEarlyStoppingRecommendation(response?.data);
    } catch (error) {
      console.error('Failed to check early stopping:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Hypothesis Generation */}
      <Card className="bg-[#1a1a1a] border-[#262626]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#fbbf24]" />
                AI-Generated Test Hypotheses
              </CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-2">
                AI-driven hypotheses based on psychographic segment analysis
              </p>
            </div>
            <Button
              onClick={generateAIHypotheses}
              disabled={isGenerating}
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a] font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Hypotheses
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {aiHypotheses && aiHypotheses.length > 0 && (
          <CardContent className="space-y-4">
            {aiHypotheses.map((hypothesis, index) => (
              <motion.div
                key={hypothesis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111111] rounded-lg p-4 border border-[#262626]"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white">{hypothesis.hypothesis}</h4>
                  <Badge className="bg-[#10b981]/20 text-[#10b981] border-none">
                    +{hypothesis.predicted_lift}% lift
                  </Badge>
                </div>

                <p className="text-sm text-[#a3a3a3] mb-3">
                  <strong className="text-[#fbbf24]">Rationale:</strong> {hypothesis.psychological_rationale}
                </p>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#6b7280] mb-2">Target Segments:</p>
                  <div className="flex flex-wrap gap-1">
                    {hypothesis.target_segments.map((segment, idx) => (
                      <Badge key={idx} className="bg-[#00d4ff]/20 text-[#00d4ff] border-none text-xs">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">Confidence:</span>
                    <span className="text-sm font-semibold text-white">
                      {Math.round(hypothesis.confidence * 100)}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    Apply Hypothesis
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Multi-Armed Bandit Allocation */}
      <Card className="bg-[#1a1a1a] border-[#262626]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#8b5cf6]" />
                Dynamic Traffic Allocation
              </CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-2">
                Multi-armed bandit optimization for traffic distribution
              </p>
            </div>
            <Button
              onClick={calculateBanditAllocation}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Calculate Allocation
            </Button>
          </div>
        </CardHeader>

        {banditAllocation && (
          <CardContent className="space-y-4">
            <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-4">
              <p className="text-sm text-white mb-2">
                <strong>Strategy:</strong> {banditAllocation.strategy}
              </p>
              {banditAllocation.expected_improvement && (
                <p className="text-sm text-[#a3a3a3]">
                  Expected improvement: <strong className="text-[#10b981]">+{banditAllocation.expected_improvement}%</strong>
                </p>
              )}
            </div>

            {banditAllocation.allocations?.map((allocation, index) => (
              <div key={index} className="bg-[#111111] rounded-lg p-4 border border-[#262626]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{allocation.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#a3a3a3]">
                      {Math.round(allocation.current_weight * 100)}% → {Math.round(allocation.recommended_weight * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#6b7280]">{allocation.reasoning}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Early Stopping Recommendation */}
      <Card className="bg-[#1a1a1a] border-[#262626]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                Early Stopping Analysis
              </CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-2">
                Statistical significance and stopping recommendations
              </p>
            </div>
            <Button
              onClick={checkEarlyStopping}
              className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Check Status
            </Button>
          </div>
        </CardHeader>

        {earlyStoppingRecommendation && (
          <CardContent>
            <div className={`rounded-lg p-4 ${
              earlyStoppingRecommendation.recommendation === 'stop_winner'
                ? 'bg-[#10b981]/10 border border-[#10b981]/30'
                : earlyStoppingRecommendation.recommendation === 'stop_no_difference'
                ? 'bg-[#fbbf24]/10 border border-[#fbbf24]/30'
                : 'bg-[#00d4ff]/10 border border-[#00d4ff]/30'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    {earlyStoppingRecommendation.recommendation === 'stop_winner'
                      ? '✓ Stop Test - Winner Found'
                      : earlyStoppingRecommendation.recommendation === 'stop_no_difference'
                      ? '⚠ Stop Test - No Significant Difference'
                      : '→ Continue Test'}
                  </h4>
                  <p className="text-sm text-[#e5e5e5]">{earlyStoppingRecommendation.reasoning}</p>
                </div>
                <Badge className="bg-white/10 text-white border-none">
                  {Math.round(earlyStoppingRecommendation.confidence * 100)}% confidence
                </Badge>
              </div>

              {earlyStoppingRecommendation.statistical_power && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-[#6b7280] mb-1">Statistical Power</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(earlyStoppingRecommendation.statistical_power * 100)}%
                    </p>
                  </div>
                  {earlyStoppingRecommendation.days_to_significance && (
                    <div>
                      <p className="text-xs text-[#6b7280] mb-1">Days to Significance</p>
                      <p className="text-lg font-semibold text-white">
                        ~{earlyStoppingRecommendation.days_to_significance} days
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}