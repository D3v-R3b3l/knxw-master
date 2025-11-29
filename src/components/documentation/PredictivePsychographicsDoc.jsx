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
          Predictive Psychographics uses AI to forecast future user behavior based on psychological profiles, 
          enabling proactive engagement strategies before users churn, converting high-potential leads faster, 
          and optimizing engagement timing.
        </p>

        <Callout type="info" icon={Brain}>
          <strong>Key Insight:</strong> By understanding the psychology behind behavior patterns, we can predict 
          future actions with 70-85% accuracy - significantly higher than traditional behavioral models alone.
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

      <Section title="Use Cases">
        <div className="space-y-3">
          <div className="bg-[#111111] border border-[#00d4ff]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Proactive Churn Prevention</h5>
            <p className="text-[#a3a3a3] text-sm">
              Identify users at risk 14-30 days before they churn, with psychology-specific retention strategies.
            </p>
          </div>
          
          <div className="bg-[#111111] border border-[#10b981]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Prioritized Sales Outreach</h5>
            <p className="text-[#a3a3a3] text-sm">
              Focus sales efforts on leads with high conversion probability based on their psychological profile match.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#8b5cf6]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Optimized Campaign Timing</h5>
            <p className="text-[#a3a3a3] text-sm">
              Send marketing messages at the predicted optimal time for each psychographic segment.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}