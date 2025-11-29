import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Layers, TrendingUp, Shield } from 'lucide-react';
import Section from './Section';
import Callout from './Callout';
import CodeBlock from './CodeBlock';

export default function InferenceOverviewDoc() {
  return (
    <div className="space-y-8">
      <Section title="Inference Architecture Overview" icon={Brain}>
        <p className="text-[#a3a3a3] mb-4">
          knXw employs a sophisticated multi-layered inference system that combines heuristic analysis, 
          machine learning models, and large language models (LLMs) to generate comprehensive psychographic profiles.
        </p>

        <Callout type="info" title="Hybrid Approach">
          Our three-layer architecture ensures both speed and accuracy: heuristics provide instant baseline 
          inferences, ML models add statistical rigor, and LLMs contribute nuanced psychological understanding.
        </Callout>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00d4ff]" />
                Layer 1: Heuristics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                Fast, rule-based inference from behavioral patterns. Provides instant baseline profile 
                with 60-70% confidence.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#10b981]" />
                Layer 2: ML Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                Statistical classification using trained models. Refines profile with 75-85% confidence 
                based on historical patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#ec4899]" />
                Layer 3: LLM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                Deep contextual analysis using GPT-4. Adds nuanced reasoning and achieves 85-95% 
                confidence with full explanations.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Fusion Process" icon={Shield}>
        <p className="text-[#a3a3a3] mb-4">
          After all three layers complete their analysis, a weighted fusion algorithm combines the results 
          into a single, high-confidence profile. The fusion process:
        </p>

        <ul className="list-disc list-inside space-y-2 text-[#a3a3a3] ml-4">
          <li>Weights each layer based on its historical accuracy for specific traits</li>
          <li>Resolves conflicts by prioritizing higher-confidence inferences</li>
          <li>Generates an aggregate confidence score for the final profile</li>
          <li>Produces human-readable evidence explaining the reasoning</li>
        </ul>

        <CodeBlock language="javascript" code={`// Example: Fusion weights for motivation stack
const fusionWeights = {
  heuristic: 0.3,  // 30% weight
  ml: 0.3,         // 30% weight
  llm: 0.4         // 40% weight (highest for nuanced traits)
};

// Final motivation = weighted average
const finalMotivation = {
  label: 'achievement',
  weight: (
    heuristic.achievement * 0.3 +
    ml.achievement * 0.3 +
    llm.achievement * 0.4
  ),
  confidence: averageConfidence(layers)
};`} />

        <Callout type="success" title="Production Ready">
          The fusion process is battle-tested and handles edge cases like missing layer results, 
          conflicting inferences, and low-confidence scenarios gracefully.
        </Callout>
      </Section>

      <Section title="Profile Schema" icon={Layers}>
        <p className="text-[#a3a3a3] mb-4">
          The resulting fused profile follows the <code className="bg-[#1a1a1a] px-2 py-1 rounded text-[#00d4ff]">HybridUserProfile</code> schema:
        </p>

        <CodeBlock language="json" code={`{
  "user_id": "usr_12345",
  "app_id": "app_67890",
  "heuristic_inference": { /* Layer 1 results */ },
  "ml_inference": { /* Layer 2 results */ },
  "llm_inference": { /* Layer 3 results */ },
  "fused_profile": {
    "motivation_stack": [
      { "label": "achievement", "weight": 0.85, "confidence": 0.92 },
      { "label": "social_connection", "weight": 0.72, "confidence": 0.88 }
    ],
    "emotional_state": {
      "mood": "confident",
      "confidence": 0.89
    },
    "cognitive_style": {
      "style": "analytical",
      "confidence": 0.91
    },
    "risk_profile": {
      "profile": "moderate",
      "confidence": 0.87
    }
  },
  "evidence": "User exhibits strong achievement-oriented behavior...",
  "version": 1,
  "updated_date": "2025-01-19T10:30:00Z"
}`} />
      </Section>

      <Section title="Performance Characteristics" icon={TrendingUp}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">Latency</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#a3a3a3] ml-4">
              <li>Heuristic Layer: &lt; 50ms</li>
              <li>ML Layer: 100-200ms</li>
              <li>LLM Layer: 1-3 seconds</li>
              <li>Total (all layers + fusion): 2-4 seconds</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Accuracy</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#a3a3a3] ml-4">
              <li>Heuristic Only: 60-70%</li>
              <li>Heuristic + ML: 75-85%</li>
              <li>Full Stack (incl. LLM): 85-95%</li>
              <li>Human-Expert Baseline: ~80-85%</li>
            </ul>
          </div>
        </div>

        <Callout type="warning" title="Cost Consideration">
          LLM inference is the most expensive layer. For high-volume scenarios, consider using 
          heuristic+ML only and reserving LLM for high-value users or low-confidence cases.
        </Callout>
      </Section>
    </div>
  );
}