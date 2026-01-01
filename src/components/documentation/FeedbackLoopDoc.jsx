import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Brain, Target, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function FeedbackLoopDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <RefreshCcw className="w-7 h-7 text-[#f59e0b]" />
        Self-Learning AI Feedback Loop
      </h3>
      <p className="text-[#a3a3a3] mb-6">
        knXw's feedback loop system creates a closed-loop AI optimization cycle where engagement outcomes continuously improve psychographic predictions. Every user interaction makes the AI smarter without manual intervention.
      </p>

      <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#ef4444]/10 border border-[#f59e0b]/30 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#f59e0b] mb-3">🔄 Autonomous Optimization</h4>
        <p className="text-[#a3a3a3] text-sm">
          The system automatically adjusts confidence thresholds, refines inference weights, and optimizes engagement timing based on real-world performance data—no manual tuning required.
        </p>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">How It Works</h4>

      <div className="space-y-4 mb-8">
        {[
          { 
            step: 1, 
            title: 'Engagement Delivery', 
            desc: 'User receives a personalized engagement based on their psychographic profile' 
          },
          { 
            step: 2, 
            title: 'Outcome Tracking', 
            desc: 'System captures user response: converted, engaged, dismissed, ignored, or negative feedback' 
          },
          { 
            step: 3, 
            title: 'Learning Signal Extraction', 
            desc: 'AI calculates psychographic accuracy, content relevance, and timing effectiveness scores' 
          },
          { 
            step: 4, 
            title: 'Model Adjustment', 
            desc: 'Inference models automatically update confidence thresholds and weights based on accumulated learnings' 
          }
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-4 bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0 text-[#f59e0b] font-bold">
              {item.step}
            </div>
            <div>
              <h5 className="font-semibold text-white">{item.title}</h5>
              <p className="text-sm text-[#a3a3a3]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Learning Signals</h4>
      
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`{
  "learning_signals": {
    "psychographic_accuracy": 0.85,
    "content_relevance_score": 0.78,
    "timing_effectiveness": 0.92,
    "suggested_adjustments": [
      {
        "field": "content_length",
        "current_value": "short",
        "suggested_value": "detailed",
        "confidence": 0.7
      },
      {
        "field": "message_tone",
        "current_value": "urgent",
        "suggested_value": "reassuring",
        "confidence": 0.8
      }
    ]
  }
}`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Automatic Model Updates</h4>
      <p className="text-[#a3a3a3] mb-4">
        When sufficient feedback accumulates (default: 50+ samples), the system automatically applies learnings to active inference models:
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { 
            icon: TrendingUp, 
            title: 'High Performance', 
            desc: 'When accuracy > 80%, confidence thresholds increase to allow more assertive predictions.',
            color: '#10b981'
          },
          { 
            icon: Target, 
            title: 'Low Performance', 
            desc: 'When accuracy < 50%, confidence thresholds decrease to require more evidence before inference.',
            color: '#ef4444'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <h5 className="font-semibold text-white">{item.title}</h5>
            </div>
            <p className="text-sm text-[#a3a3a3]">{item.desc}</p>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Backend Functions</h4>
      
      <div className="space-y-3 mb-6">
        {[
          { name: 'processEngagementFeedback', desc: 'Captures engagement outcomes and generates learning signals' },
          { name: 'applyModelFeedback', desc: 'Aggregates learnings and updates inference model parameters' }
        ].map((fn) => (
          <div key={fn.name} className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <code className="text-[#00d4ff]">{fn.name}</code>
            <p className="text-sm text-[#a3a3a3] mt-1">{fn.desc}</p>
          </div>
        ))}
      </div>

      <Link to={createPageUrl("Dashboard")}>
        <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-black">
          <RefreshCcw className="w-4 h-4 mr-2" />
          View Feedback Loop Panel
        </Button>
      </Link>
    </div>
  );
}