import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Sliders, Target, RefreshCcw, Brain, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function InferenceStudioDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <Cpu className="w-7 h-7 text-[#8b5cf6]" />
        AI Inference Studio
      </h3>
      <p className="text-[#a3a3a3] mb-6">
        Fine-tune and customize how knXw's AI generates psychographic inferences from behavioral data. The Inference Studio gives you complete control over model weights, confidence thresholds, and temporal decay settings.
      </p>

      <div className="bg-gradient-to-r from-[#8b5cf6]/10 to-[#00d4ff]/10 border border-[#8b5cf6]/30 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#8b5cf6] mb-3">🧠 Explainable AI</h4>
        <p className="text-[#a3a3a3] text-sm">
          Every inference includes detailed reasoning explaining why the AI made specific predictions. Understand the behavioral signals, confidence factors, and temporal weighting behind each psychographic profile.
        </p>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Key Capabilities</h4>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { 
            icon: Sliders, 
            title: 'Base Weight Configuration', 
            desc: 'Adjust the importance of different behavioral signals (page views, clicks, time on page, scroll depth, exit intent).',
            color: '#8b5cf6'
          },
          { 
            icon: Target, 
            title: 'Confidence Thresholds', 
            desc: 'Set minimum confidence levels for high, medium, and low certainty inferences.',
            color: '#00d4ff'
          },
          { 
            icon: RefreshCcw, 
            title: 'Temporal Decay', 
            desc: 'Configure how recent vs. older events are weighted with customizable half-life and max age.',
            color: '#10b981'
          },
          { 
            icon: Brain, 
            title: 'Cognitive Bias Detection', 
            desc: 'Enable detection of anchoring, confirmation, recency, and loss aversion biases.',
            color: '#fbbf24'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 hover:border-[#8b5cf6]/30 transition-colors">
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

      <h4 className="text-xl font-semibold text-white mb-4">Creating an Inference Model</h4>
      
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Example: Creating a motivation-focused model
{
  "name": "E-Commerce Motivation Model",
  "model_type": "motivation",
  "base_weights": {
    "page_views": 0.25,
    "clicks": 0.35,
    "time_on_page": 0.20,
    "scroll_depth": 0.10,
    "exit_intent": 0.10
  },
  "temporal_decay": {
    "enabled": true,
    "half_life_days": 7,
    "max_age_days": 60
  },
  "confidence_thresholds": {
    "high_confidence": 0.85,
    "medium_confidence": 0.60,
    "low_confidence": 0.35
  },
  "bias_detection_config": {
    "enabled": true,
    "sensitivity": "medium",
    "bias_types": ["anchoring", "confirmation", "loss_aversion"]
  }
}`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Custom Inference Rules</h4>
      <p className="text-[#a3a3a3] mb-4">
        Define custom rules to enhance the AI's inference logic based on your specific use case:
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`"custom_rules": [
  {
    "name": "High Cart Value Indicator",
    "condition": "$.cart_value > 500",
    "output_field": "motivation_stack",
    "output_value": "value_seeker",
    "weight": 0.8
  },
  {
    "name": "Comparison Shopper",
    "condition": "$.product_views > 10 && $.cart_adds < 2",
    "output_field": "cognitive_style",
    "output_value": "analytical",
    "weight": 0.7
  }
]`}
        </pre>
      </div>

      <Link to={createPageUrl("InferenceStudio")}>
        <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
          <Cpu className="w-4 h-4 mr-2" />
          Open Inference Studio
        </Button>
      </Link>
    </div>
  );
}