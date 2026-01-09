import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, Brain, Sparkles, Target, TrendingUp, Zap, Activity, Settings, BarChart3, AlertTriangle, Users, Clock, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function AIJourneyOrchestratorDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <Route className="w-7 h-7 text-[#ec4899]" />
        AI Journey Orchestrator
      </h3>
      <p className="text-[#a3a3a3] mb-6">
        Proactive AI-powered journey suggestions based on psychographic patterns and engagement performance. The orchestrator continuously analyzes user behavior to recommend new journeys, timing optimizations, and content personalization strategies. Now includes real-time insights, dynamic optimization, and an AI assistant panel.
      </p>

      <div className="bg-gradient-to-r from-[#ec4899]/10 to-[#8b5cf6]/10 border border-[#ec4899]/30 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#ec4899] mb-3">🎯 Proactive Intelligence</h4>
        <p className="text-[#a3a3a3] text-sm">
          Unlike reactive analytics, the Journey Orchestrator proactively identifies opportunities and generates actionable suggestions before you even know to look for them.
        </p>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Suggestion Types</h4>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { 
            type: 'new_journey', 
            title: 'New Journey Suggestions', 
            desc: 'AI identifies user segments without dedicated journeys and recommends new flows.',
            color: '#10b981',
            example: 'Create a Risk-Taker Conversion Flow for 150 aggressive-risk users'
          },
          { 
            type: 'journey_optimization', 
            title: 'Journey Optimization', 
            desc: 'Improvements to existing journeys based on performance data.',
            color: '#3b82f6',
            example: 'Reduce step 3 friction—45% drop-off detected'
          },
          { 
            type: 'timing_adjustment', 
            title: 'Timing Adjustments', 
            desc: 'Optimal engagement windows based on cognitive style analysis.',
            color: '#fbbf24',
            example: 'Analytical users show 45% higher engagement 2-4pm'
          },
          { 
            type: 'content_personalization', 
            title: 'Content Personalization', 
            desc: 'Content-profile mismatch detection with personalization recommendations.',
            color: '#ec4899',
            example: 'Enable deeper personalization—high negative feedback rate detected'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 hover:border-[#ec4899]/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Badge style={{ backgroundColor: `${item.color}30`, color: item.color, border: `1px solid ${item.color}50` }}>
                {item.type}
              </Badge>
            </div>
            <h5 className="font-semibold text-white mb-1">{item.title}</h5>
            <p className="text-sm text-[#a3a3a3] mb-2">{item.desc}</p>
            <p className="text-xs text-[#6b7280] italic">Example: "{item.example}"</p>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">AI Reasoning Structure</h4>
      <p className="text-[#a3a3a3] mb-4">
        Every suggestion includes explainable AI reasoning so you understand exactly why it was generated:
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`{
  "ai_reasoning": {
    "pattern_detected": "Anxious emotional state users need reassurance to convert",
    "supporting_data_points": 45,
    "confidence_score": 0.81,
    "time_period_analyzed": "Last 14 days",
    "key_user_segments_affected": ["anxious_emotional", "conservative_risk"],
    "expected_impact": {
      "metric": "conversion_rate",
      "predicted_improvement_percent": 15,
      "confidence_range": [10, 22]
    }
  }
}`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Suggestion Workflow</h4>
      
      <div className="space-y-3 mb-6">
        {[
          { step: 1, title: 'AI Analysis', desc: 'System continuously analyzes profiles, deliveries, and feedback data' },
          { step: 2, title: 'Pattern Detection', desc: 'Machine learning identifies high-potential segments and optimization opportunities' },
          { step: 3, title: 'Suggestion Generation', desc: 'AI creates actionable suggestions with pre-configured journey templates' },
          { step: 4, title: 'Human Review', desc: 'You review, modify, accept or reject suggestions with feedback' },
          { step: 5, title: 'Implementation', desc: 'Accepted suggestions deploy automatically and track performance' }
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-4 bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-[#ec4899]/20 flex items-center justify-center flex-shrink-0 text-[#ec4899] font-bold text-sm">
              {item.step}
            </div>
            <div>
              <h5 className="font-semibold text-white">{item.title}</h5>
              <p className="text-sm text-[#a3a3a3]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        New Journey Builder Enhancements
        <Badge className="bg-[#10b981]/20 text-[#10b981] text-xs">UPDATED</Badge>
      </h4>

      <div className="space-y-4 mb-6">
        {/* AI Journey Assistant */}
        <div className="bg-[#111111] border border-[#8b5cf6]/30 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#8b5cf6]/20">
              <Brain className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-semibold text-white">AI Journey Assistant</h5>
                <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs">NEW</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3] mb-3">
                Full-screen modal assistant that analyzes your user base and suggests personalized journey paths.
              </p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Three Tabs:</strong> AI Suggestions, User Segments, Profile Insights</li>
                <li>• <strong className="text-white">Generate Suggestions:</strong> Click to analyze profiles and generate journey recommendations</li>
                <li>• <strong className="text-white">One-Click Apply:</strong> Apply suggested nodes/edges directly to canvas</li>
                <li>• <strong className="text-white">Segment Discovery:</strong> Auto-identifies segments like "Conservative High-Performers" or "At-Risk Users"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic Journey Optimizer */}
        <div className="bg-[#111111] border border-[#10b981]/30 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#10b981]/20">
              <Settings className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-semibold text-white">Dynamic Journey Optimizer</h5>
                <Badge className="bg-[#10b981]/20 text-[#10b981] text-xs">NEW</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3] mb-3">
                Enable continuous, real-time journey optimization based on user engagement patterns.
              </p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Optimization Rules:</strong> Adaptive Timing, Content Personalization, Path Optimization, Churn Prevention, Conversion Boost</li>
                <li>• <strong className="text-white">Sensitivity Control:</strong> Adjust how aggressively optimizations are applied</li>
                <li>• <strong className="text-white">Min Confidence Threshold:</strong> Only apply changes above a confidence level</li>
                <li>• <strong className="text-white">Toggle Per-Rule:</strong> Enable/disable individual optimization strategies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-time Journey Insights */}
        <div className="bg-[#111111] border border-[#00d4ff]/30 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#00d4ff]/20">
              <Activity className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-semibold text-white">Real-time Journey Insights</h5>
                <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] text-xs">NEW</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3] mb-3">
                Live metrics panel showing journey health and performance as you build.
              </p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Status Badge:</strong> Complete/Incomplete based on trigger + goal presence</li>
                <li>• <strong className="text-white">Psychographic Coverage:</strong> % of conditions using psychographic data</li>
                <li>• <strong className="text-white">Estimated Reach:</strong> User count based on profile analysis</li>
                <li>• <strong className="text-white">Path Complexity:</strong> Visual indicator of journey complexity</li>
                <li>• <strong className="text-white">Smart Warnings:</strong> Alerts for missing triggers, goals, or low psychographic coverage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Link to={createPageUrl("Journeys")}>
        <Button className="bg-[#ec4899] hover:bg-[#db2777] text-white mr-3">
          <Route className="w-4 h-4 mr-2" />
          Open Journey Builder
        </Button>
      </Link>
      <Link to={createPageUrl("AIJourneyOrchestrator")}>
        <Button variant="outline" className="border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/10">
          View Orchestrator Dashboard
        </Button>
      </Link>
    </div>
  );
}