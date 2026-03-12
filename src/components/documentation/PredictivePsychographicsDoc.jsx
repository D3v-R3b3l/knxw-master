import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function PredictivePsychographicsDoc() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Predictive Psychographics combines profile-level psychographic data with behavior signals to surface churn cohorts,
          interaction divergence across cognitive styles, and projected risk movement over time.
        </p>

        <Callout type="info" icon={Brain}>
          <strong>Current implementation:</strong> the product now includes a dedicated churn analytics dashboard with
          psychographic filters, leading-indicator summaries, cohort projections, and an interaction heatmap segmented by cognitive style.
        </Callout>
      </Section>

      <Section title="Prediction Types">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
              <h4 className="text-white font-semibold">Behavior Forecasts</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Predict how different psychographic segments will behave over the next 30-90 days, 
              including engagement patterns, feature adoption, and content preferences.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              <h4 className="text-white font-semibold">Churn Predictions</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Identify which psychological profiles are at highest risk of churning, with specific 
              intervention strategies tailored to each profile's motivations.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[#10b981]" />
              <h4 className="text-white font-semibold">Conversion Likelihood</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Predict which users are most likely to convert and estimate time-to-conversion, 
              enabling prioritized sales outreach and personalized nurture sequences.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-[#8b5cf6]" />
              <h4 className="text-white font-semibold">Engagement Timing</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Forecast optimal engagement channels and timing for each psychographic segment to maximize response rates.
            </p>
          </div>
        </div>
      </Section>

      <Section title="How It Works">
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
          <ol className="space-y-4 text-[#e5e5e5]">
            <li className="flex gap-3">
              <span className="text-[#00d4ff] font-bold">1.</span>
              <div>
                <strong className="text-white">Profile Analysis:</strong> AI analyzes 100+ recent psychographic profiles 
                to identify behavioral patterns correlated with specific psychological traits.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00d4ff] font-bold">2.</span>
              <div>
                <strong className="text-white">Pattern Detection:</strong> Machine learning models detect which 
                combinations of traits predict specific future behaviors (churn, conversion, engagement).
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00d4ff] font-bold">3.</span>
              <div>
                <strong className="text-white">Forecast Generation:</strong> AI generates detailed predictions with 
                confidence scores, recommended actions, and expected outcomes for each segment.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00d4ff] font-bold">4.</span>
              <div>
                <strong className="text-white">Actionable Insights:</strong> Receive specific intervention strategies 
                tailored to each psychological profile for maximum effectiveness.
              </div>
            </li>
          </ol>
        </div>
      </Section>

      <Section title="Current Dashboards">
        <div className="space-y-3">
          <div className="bg-[#111111] border border-[#00d4ff]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Psychographic Interaction Heatmap</h5>
            <p className="text-[#a3a3a3] text-sm">
              Compare the top interaction zones across analytical, intuitive, systematic, and creative users to spot behavioral divergence.
            </p>
          </div>
          
          <div className="bg-[#111111] border border-[#10b981]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Churn Cohort Dashboard</h5>
            <p className="text-[#a3a3a3] text-sm">
              Filter at-risk cohorts by psychographic traits, inspect leading indicators, and visualize projected cohort risk over 7, 14, and 30 days.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#8b5cf6]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Risk Breakdown by Cognitive Style</h5>
            <p className="text-[#a3a3a3] text-sm">
              Review cohort size, current risk, and projected 30-day risk for each cognitive-style segment.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}