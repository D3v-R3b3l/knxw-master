
import React from 'react';
import { Target, Database, TrendingUp, RefreshCw, CheckCircle, Shield, BarChart3, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrainingValidationDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <Target className="w-8 h-8 text-[#10b981]" />
          Training, Validation & Continuous Learning
        </h2>
        <p className="text-[#a3a3a3] text-lg">
          How we build, validate, and continuously improve knXw's psychographic AI models.
        </p>
      </div>

      {/* Data Sources & Processing */}
      <Card className="bg-[#111111] border-[#262626] mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00d4ff]" />
            Data Sources & Privacy-First Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">Event Capture Mechanisms</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3">
                <h5 className="text-[#00d4ff] font-semibold text-sm mb-1">JavaScript SDK</h5>
                <p className="text-[#a3a3a3] text-xs">Client-side tracking for web apps • Auto-capture page views, clicks, scrolls, forms</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3">
                <h5 className="text-[#8b5cf6] font-semibold text-sm mb-1">GameDev SDK</h5>
                <p className="text-[#a3a3a3] text-xs">Specialized for games • Player actions, difficulty adjustments, churn prediction</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3">
                <h5 className="text-[#10b981] font-semibold text-sm mb-1">REST API & Webhooks</h5>
                <p className="text-[#a3a3a3] text-xs">Server-to-server ingestion • Batch imports, CRM sync, custom integrations</p>
              </div>
            </div>
          </div>

          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00d4ff]" />
              Privacy-First Design
            </h4>
            <ul className="text-[#a3a3a3] text-sm space-y-1">
              <li>• <strong className="text-white">PII Hashing:</strong> Email addresses and identifiers are SHA-256 hashed before storage</li>
              <li>• <strong className="text-white">Consent Management:</strong> Users control psychographic analysis via granular consent flags</li>
              <li>• <strong className="text-white">Anonymization for Training:</strong> Training datasets use synthetic or fully anonymized data</li>
              <li>• <strong className="text-white">GDPR/CCPA Compliance:</strong> Right to access, export, and deletion fully supported</li>
              <li>• <strong className="text-white">Data Minimization:</strong> We collect only what's necessary for psychographic inference</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Real-Time vs. Batch Processing</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border border-[#10b981]/30 rounded-lg p-4">
                <h5 className="text-[#10b981] font-semibold text-sm mb-2">⚡ Real-Time Mode</h5>
                <p className="text-[#a3a3a3] text-xs mb-2">Triggered on every event capture (sub-second latency)</p>
                <ul className="text-[#a3a3a3] text-xs space-y-1">
                  <li>• Heuristic layer always runs</li>
                  <li>• ML layer for high-value users</li>
                  <li>• LLM layer for text-rich events</li>
                  <li>• Powers adaptive engagements</li>
                </ul>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#8b5cf6]/30 rounded-lg p-4">
                <h5 className="text-[#8b5cf6] font-semibold text-sm mb-2">📊 Batch Mode</h5>
                <p className="text-[#a3a3a3] text-xs mb-2">Scheduled jobs (hourly/daily) for deep analysis</p>
                <ul className="text-[#a3a3a3] text-xs space-y-1">
                  <li>• Clustering & segmentation</li>
                  <li>• Cohort analysis</li>
                  <li>• Trend detection</li>
                  <li>• Model retraining</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Datasets */}
      <Card className="bg-[#111111] border-[#262626] mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8b5cf6]" />
            Training Dataset Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#a3a3a3] text-sm">
            Our ML models are trained on a diverse, carefully curated dataset that balances scale, quality, and ethical considerations:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-2">1. Synthetic Data</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">~40% of training set</p>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• Simulated user journeys</li>
                <li>• Behavioral archetypes</li>
                <li>• Edge case generation</li>
              </ul>
              <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30 text-xs mt-2">Zero privacy risk</Badge>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-2">2. Anonymized Customer Data</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">~45% of training set</p>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• Opt-in only</li>
                <li>• Fully de-identified</li>
                <li>• Aggregated patterns</li>
              </ul>
              <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30 text-xs mt-2">Consent-based</Badge>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-2">3. Public Datasets</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">~15% of training set</p>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• Academic repositories</li>
                <li>• Open behavioral data</li>
                <li>• Psychological studies</li>
              </ul>
              <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs mt-2">Open source</Badge>
            </div>
          </div>

          <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-4 mt-4">
            <h5 className="text-white font-semibold text-sm mb-2">Dataset Diversity & Bias Mitigation</h5>
            <ul className="text-[#a3a3a3] text-sm space-y-1">
              <li>• <strong className="text-white">Geographic Diversity:</strong> Data from 50+ countries across 6 continents</li>
              <li>• <strong className="text-white">Demographic Balance:</strong> Age, gender, socioeconomic status stratified sampling</li>
              <li>• <strong className="text-white">Industry Coverage:</strong> SaaS, e-commerce, gaming, fintech, healthcare, education</li>
              <li>• <strong className="text-white">Bias Audits:</strong> Quarterly fairness assessments using IBM AI Fairness 360</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Psychological Ground Truth */}
      <Card className="bg-[#111111] border-[#262626] mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#10b981]" />
            Psychological Ground Truth Alignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#a3a3a3] text-sm">
            knXw's psychographic inferences are validated against established psychological frameworks and expert assessments:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] border border-[#10b981]/30 rounded-lg p-4">
              <h5 className="text-[#10b981] font-semibold text-sm mb-2">Psychological Models</h5>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• <strong className="text-white">Big Five (OCEAN):</strong> Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism</li>
                <li>• <strong className="text-white">Risk Perception Theory:</strong> Conservative, Moderate, Aggressive profiles</li>
                <li>• <strong className="text-white">Cognitive Styles:</strong> Analytical, Intuitive, Systematic, Creative (based on Kirton's KAI)</li>
                <li>• <strong className="text-white">Self-Determination Theory:</strong> Intrinsic vs. extrinsic motivation vectors</li>
              </ul>
            </div>

            <div className="bg-[#0a0a0a] border border-[#00d4ff]/30 rounded-lg p-4">
              <h5 className="text-[#00d4ff] font-semibold text-sm mb-2">Expert Validation</h5>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• <strong className="text-white">Behavioral Science Advisors:</strong> PhD-level psychologists review model outputs</li>
                <li>• <strong className="text-white">Inter-Rater Reliability:</strong> Multiple experts label ground truth, Cohen's Kappa &gt; 0.75</li>
                <li>• <strong className="text-white">Clinical Validation:</strong> Comparison with standardized assessments (NEO-PI-R, Myers-Briggs)</li>
                <li>• <strong className="text-white">Longitudinal Studies:</strong> Track prediction stability over 3-12 months</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4">
            <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#10b981]" />
              Validation Results (Latest Benchmark: Q1 2024)
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#10b981]">87.3%</p>
                <p className="text-xs text-[#a3a3a3]">Overall Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#10b981]">89.1%</p>
                <p className="text-xs text-[#a3a3a3]">Precision</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#10b981]">85.6%</p>
                <p className="text-xs text-[#a3a3a3]">Recall</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#10b981]">87.3%</p>
                <p className="text-xs text-[#a3a3a3]">F1 Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continuous Learning */}
      <Card className="bg-[#111111] border-[#262626] mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#fbbf24]" />
            Continuous Learning & Model Drift Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#a3a3a3] text-sm">
            Behavioral patterns evolve. knXw's models adapt through continuous monitoring and periodic retraining:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-2">1. Drift Detection</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">Real-time monitoring</p>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• Statistical tests (KS, PSI)</li>
                <li>• Confidence score trends</li>
                <li>• Prediction error rates</li>
              </ul>
              <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30 text-xs mt-2">Daily checks</Badge>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-2">2. Incremental Updates</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">Small, frequent adjustments</p>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• Online learning algorithms</li>
                <li>• Rolling window retraining</li>
                <li>• A/B testing new weights</li>
              </ul>
              <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs mt-2">Weekly</Badge>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-2">3. Full Retraining</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">Comprehensive model refresh</p>
              <ul className="text-[#a3a3a3] text-xs space-y-1">
                <li>• New architecture evaluation</li>
                <li>• Expanded training set</li>
                <li>• Hyperparameter tuning</li>
              </ul>
              <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30 text-xs mt-2">Quarterly</Badge>
            </div>
          </div>

          <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-4 mt-4">
            <h5 className="text-white font-semibold text-sm mb-2">Human-in-the-Loop Quality Assurance</h5>
            <p className="text-[#a3a3a3] text-sm">
              Before any model update reaches production:
            </p>
            <ul className="text-[#a3a3a3] text-sm space-y-1 mt-2">
              <li>• <strong className="text-white">Shadow Mode Deployment:</strong> New model runs in parallel, predictions logged but not used</li>
              <li>• <strong className="text-white">Expert Review:</strong> Behavioral scientists manually review sample predictions</li>
              <li>• <strong className="text-white">Statistical Significance:</strong> Improvement must be statistically significant (p &lt; 0.05)</li>
              <li>• <strong className="text-white">Gradual Rollout:</strong> Canary deployment to 5% → 25% → 100% of traffic</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Metrics */}
      <Card className="bg-[#111111] border-[#262626] mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
            Evaluation Metrics & What They Mean
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#a3a3a3] text-sm">
            We track industry-standard ML metrics, adapted for psychographic analysis:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-1">Accuracy</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">
                % of correct predictions across all traits. Our target: <strong className="text-[#10b981]">&gt;85%</strong>
              </p>
              <code className="text-xs text-[#00d4ff] bg-[#0a0a0a] px-2 py-1 rounded">
                (True Positives + True Negatives) / Total Predictions
              </code>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-1">Precision</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">
                When we predict a trait, how often are we correct? Target: <strong className="text-[#10b981]">&gt;88%</strong>
              </p>
              <code className="text-xs text-[#00d4ff] bg-[#0a0a0a] px-2 py-1 rounded">
                True Positives / (True Positives + False Positives)
              </code>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-1">Recall</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">
                Of all users with a trait, what % do we correctly identify? Target: <strong className="text-[#10b981]">&gt;83%</strong>
              </p>
              <code className="text-xs text-[#00d4ff] bg-[#0a0a0a] px-2 py-1 rounded">
                True Positives / (True Positives + False Negatives)
              </code>
            </div>

            <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
              <h5 className="text-white font-semibold text-sm mb-1">F1 Score</h5>
              <p className="text-[#a3a3a3] text-xs mb-2">
                Harmonic mean of Precision & Recall. Balanced metric. Target: <strong className="text-[#10b981]">&gt;85%</strong>
              </p>
              <code className="text-xs text-[#00d4ff] bg-[#0a0a0a] px-2 py-1 rounded">
                2 × (Precision × Recall) / (Precision + Recall)
              </code>
            </div>
          </div>

          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4 mt-4">
            <h5 className="text-white font-semibold text-sm mb-2">Additional Metrics Tracked</h5>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[#00d4ff] font-semibold">Latency (p95)</p>
                <p className="text-[#a3a3a3]">95th percentile inference time</p>
                <p className="text-white mt-1">Target: &lt;500ms</p>
              </div>
              <div>
                <p className="text-[#00d4ff] font-semibold">Cost per Inference</p>
                <p className="text-[#a3a3a3]">Avg API/compute cost per profile</p>
                <p className="text-white mt-1">Target: &lt;$0.02</p>
              </div>
              <div>
                <p className="text-[#00d4ff] font-semibold">Confidence Calibration</p>
                <p className="text-[#a3a3a3]">Do confidence scores match actual accuracy?</p>
                <p className="text-white mt-1">Target: ECE &lt;0.1</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Evaluation Dashboard */}
      <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#10b981]/10 border-[#00d4ff]/30 rounded-lg p-6 text-center">
        <h4 className="text-white font-semibold mb-2">See Our Validation in Action</h4>
        <p className="text-[#a3a3a3] text-sm mb-4">
          View real evaluation runs, benchmark datasets, and model performance over time.
        </p>
        <Link to={createPageUrl("LlmEvaluation")}>
          <Badge className="bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9] cursor-pointer px-4 py-2 text-sm">
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Open LLM Evaluation Dashboard
          </Badge>
        </Link>
      </div>
    </div>
  );
}
