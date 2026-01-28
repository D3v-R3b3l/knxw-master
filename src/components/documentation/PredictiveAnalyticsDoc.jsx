import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function PredictiveAnalyticsDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        Predictive Analytics
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        AI-powered forecasting for churn risk, behavioral anomalies, and engagement trends. 
        Identify at-risk users and opportunities before they surface.
      </p>

      <Section title="Churn Prediction">
        <p className="text-[#cbd5e1] mb-4">
          The churn prediction engine analyzes behavioral patterns and psychographic profiles to forecast user churn risk:
        </p>
        <CodeBlock language="javascript">
{`const prediction = await base44.functions.invoke('predictChurn', {
  user_id: "user_123",
  client_app_id: "app_456"
});

// Returns:
{
  "churn_risk": "medium",
  "confidence": 0.72,
  "reason": "Declining engagement detected",
  "factors": {
    "event_count": 8,
    "days_inactive": 4,
    "emotional_state": "neutral"
  }
}`}
        </CodeBlock>

        <p className="text-[#cbd5e1] mt-4">
          <strong>Risk Levels:</strong>
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-1">
          <li><strong>Low:</strong> User is actively engaged with positive signals</li>
          <li><strong>Medium:</strong> Some warning signs detected (declining activity, negative emotions)</li>
          <li><strong>High:</strong> Strong churn indicators (prolonged inactivity, stale profile)</li>
        </ul>
      </Section>

      <Section title="Anomaly Detection">
        <p className="text-[#cbd5e1] mb-4">
          Detect unusual patterns in psychographic profiles to identify data quality issues or exceptional user behaviors:
        </p>
        <CodeBlock language="javascript">
{`const anomalies = await base44.functions.invoke('detectAnomalies', {
  client_app_id: "app_456",
  lookback_days: 7
});

// Returns:
{
  "total_profiles": 1250,
  "anomalies_detected": 18,
  "anomalies": [
    {
      "user_id": "user_789",
      "profile_id": "prof_123",
      "anomaly_count": 2,
      "signals": [
        {
          "type": "unusual_motivation_count",
          "description": "User has 7 motivations (typically 2-4)",
          "severity": "medium"
        },
        {
          "type": "stale_high_confidence",
          "description": "Profile is stale but confidence remains high",
          "severity": "high"
        }
      ]
    }
  ],
  "baselines": {
    "motivation_distribution": {...},
    "risk_distribution": {...}
  }
}`}
        </CodeBlock>

        <p className="text-[#cbd5e1] mt-4">
          <strong>Anomaly Types:</strong>
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-1">
          <li><strong>unusual_motivation_count:</strong> Abnormal number of detected motivations</li>
          <li><strong>conflicting_traits:</strong> Contradictory psychological attributes</li>
          <li><strong>stale_high_confidence:</strong> Old profile with unexpectedly high confidence scores</li>
          <li><strong>extreme_anxiety:</strong> Very high confidence in negative emotional states</li>
        </ul>
      </Section>

      <Section title="AI-Generated Marketing Copy">
        <p className="text-[#cbd5e1] mb-4">
          Generate personalized marketing messages tailored to individual user psychology:
        </p>
        <CodeBlock language="javascript">
{`const copy = await base44.functions.invoke('generateMarketingCopy', {
  user_id: "user_123",
  campaign_goal: "Upgrade to Pro plan",
  tone: "professional",
  max_length: 200
});

// Returns:
{
  "user_id": "user_123",
  "profile_summary": {
    "motivations": ["achievement", "mastery"],
    "emotional_state": "confident",
    "cognitive_style": "analytical",
    "risk_profile": "moderate"
  },
  "generated_copy": [
    "Unlock advanced analytics and take control of your growth metrics...",
    "Your data-driven approach deserves enterprise-grade tools...",
    "Join thousands of analytical leaders who've upgraded..."
  ],
  "rationale": "Copy emphasizes achievement and mastery with data-focused language...",
  "confidence": 0.85
}`}
        </CodeBlock>
      </Section>

      <Section title="Engagement Forecasting">
        <p className="text-[#cbd5e1] mb-4">
          Predict future engagement trends based on historical patterns and psychographic evolution:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li>7-day, 30-day, and 90-day engagement forecasts</li>
          <li>Confidence intervals and prediction uncertainty</li>
          <li>Segment-level trend analysis</li>
          <li>Seasonal pattern detection</li>
        </ul>
      </Section>

      <Callout type="warning">
        <p>
          <strong>Model Accuracy:</strong> Predictive models improve over time as more data is collected. 
          Initial predictions may have lower confidence scores until sufficient behavioral history is available.
        </p>
      </Callout>

      <Section title="Best Practices">
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li>Run churn prediction daily or weekly to catch early warning signs</li>
          <li>Use anomaly detection to validate data quality and identify outliers</li>
          <li>A/B test AI-generated copy variations against human-written baselines</li>
          <li>Monitor prediction confidence scores and retrain models when accuracy drops</li>
          <li>Combine predictions with engagement rules for automated interventions</li>
        </ul>
      </Section>
    </div>
  );
}