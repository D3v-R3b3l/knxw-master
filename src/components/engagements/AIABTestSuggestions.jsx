import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, Sparkles, RefreshCw, ArrowRight, TrendingUp,
  Target, Brain, Zap, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIABTestSuggestions({ currentContent, onCreateTest }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [manualContent, setManualContent] = useState("");

  const analyzeAndSuggest = async (content) => {
    const contentToAnalyze = content || manualContent;
    if (!contentToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setSuggestions(null);

    try {
      const prompt = `You are an A/B testing expert specializing in user engagement optimization.

Analyze this engagement content and suggest A/B test variations:

CURRENT CONTENT:
${contentToAnalyze}

Generate 3 strategic A/B test suggestions. Each should test a specific hypothesis about what might improve engagement.

For each suggestion:
1. Explain what element you're testing (headline, CTA, tone, length, urgency, etc.)
2. Provide the variant B content
3. Explain the hypothesis (why this might perform better)
4. Predict the expected lift percentage
5. Suggest the minimum sample size needed
6. Identify the psychographic segment this variant targets`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: {
              type: "object",
              properties: {
                current_strengths: { type: "array", items: { type: "string" } },
                improvement_areas: { type: "array", items: { type: "string" } }
              }
            },
            tests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  test_name: { type: "string" },
                  element_tested: { type: "string" },
                  variant_b_content: { type: "string" },
                  hypothesis: { type: "string" },
                  expected_lift: { type: "string" },
                  min_sample_size: { type: "number" },
                  target_segment: { type: "string" },
                  confidence_level: { type: "string" }
                }
              }
            },
            priority_recommendation: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTest = (test) => {
    if (onCreateTest) {
      onCreateTest({
        name: test.test_name,
        hypothesis: test.hypothesis,
        variantB: test.variant_b_content,
        expectedLift: test.expected_lift,
        minSampleSize: test.min_sample_size
      });
    }
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669]">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          AI A/B Test Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!currentContent && (
          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">
              Paste your current engagement content
            </label>
            <Textarea
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              placeholder="Title: Welcome back!&#10;Body: We've missed you. Check out what's new..."
              className="bg-[#1a1a1a] border-[#262626] text-white min-h-[120px]"
            />
          </div>
        )}

        {currentContent && (
          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <p className="text-xs text-[#6b7280] mb-2">Analyzing:</p>
            <p className="text-white">{currentContent}</p>
          </div>
        )}

        <Button
          onClick={() => analyzeAndSuggest(currentContent)}
          disabled={isAnalyzing || (!currentContent && !manualContent.trim())}
          className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857]"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate A/B Test Ideas
            </>
          )}
        </Button>

        <AnimatePresence>
          {suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Analysis */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span className="text-sm font-medium text-white">Strengths</span>
                  </div>
                  <ul className="space-y-2">
                    {suggestions.analysis?.current_strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-[#a3a3a3] flex items-start gap-2">
                        <span className="text-[#10b981]">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-sm font-medium text-white">Improvement Areas</span>
                  </div>
                  <ul className="space-y-2">
                    {suggestions.analysis?.improvement_areas?.map((s, i) => (
                      <li key={i} className="text-sm text-[#a3a3a3] flex items-start gap-2">
                        <span className="text-[#f59e0b]">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Priority Recommendation */}
              {suggestions.priority_recommendation && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-[#10b981]/10 to-[#059669]/10 border border-[#10b981]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[#10b981]" />
                    <span className="text-sm font-medium text-white">Priority Recommendation</span>
                  </div>
                  <p className="text-sm text-[#a3a3a3]">{suggestions.priority_recommendation}</p>
                </div>
              )}

              {/* Test Suggestions */}
              <h4 className="text-white font-medium flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#10b981]" />
                Suggested A/B Tests
              </h4>

              {suggestions.tests?.map((test, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626] hover:border-[#10b981]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h5 className="text-white font-medium">{test.test_name}</h5>
                      <Badge className="bg-[#262626] text-[#a3a3a3] mt-1">
                        Testing: {test.element_tested}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCreateTest(test)}
                      className="bg-[#10b981] text-white hover:bg-[#059669]"
                    >
                      Create Test
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[#6b7280] mb-1">Variant B Content</p>
                      <p className="text-[#e5e5e5] bg-[#0a0a0a] p-3 rounded-lg border border-[#262626]">
                        {test.variant_b_content}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#6b7280] mb-1">Hypothesis</p>
                      <p className="text-sm text-[#a3a3a3] italic">{test.hypothesis}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#262626]">
                      <div>
                        <p className="text-xs text-[#6b7280]">Expected Lift</p>
                        <p className="text-lg font-bold text-[#10b981]">{test.expected_lift}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6b7280]">Min Sample</p>
                        <p className="text-lg font-bold text-white">
                          {test.min_sample_size?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6b7280]">Target Segment</p>
                        <Badge className="bg-[#8b5cf6]/20 text-[#a78bfa] mt-1">
                          {test.target_segment}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}