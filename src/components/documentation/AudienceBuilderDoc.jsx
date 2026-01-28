import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function AudienceBuilderDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        Audience Builder
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        Create dynamic audience segments by combining psychographic traits, behavioral patterns, and engagement metrics. 
        Export segments for targeted campaigns or use them within knXw's engagement engine.
      </p>

      <Section title="Overview">
        <p className="text-[#cbd5e1] mb-4">
          The Audience Builder allows you to create sophisticated user segments based on:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Psychographic Filters:</strong> Motivations, risk profiles, cognitive styles, emotional states</li>
          <li><strong>Behavioral Filters:</strong> Event types, frequency, recency, and patterns</li>
          <li><strong>Engagement Metrics:</strong> Activity levels, churn risk, engagement scores</li>
        </ul>
      </Section>

      <Section title="Creating a Segment">
        <p className="text-[#cbd5e1] mb-4">
          Build segments visually in the UI or programmatically via API:
        </p>
        <CodeBlock language="javascript">
{`const segment = await base44.entities.AudienceSegment.create({
  name: "High-Value Risk Takers",
  description: "Users with aggressive risk profile and achievement motivation",
  client_app_id: "your-app-id",
  filters: {
    psychographic: {
      motivation_labels: ["achievement", "autonomy"],
      risk_profile: ["aggressive"],
      cognitive_style: ["analytical", "systematic"]
    },
    behavioral: {
      min_events: 10,
      date_range: {
        from: "2026-01-01T00:00:00Z",
        to: "2026-01-31T23:59:59Z"
      }
    },
    engagement: {
      min_engagement_score: 0.7,
      churn_risk: ["low", "medium"]
    }
  },
  is_dynamic: true
});`}
        </CodeBlock>
      </Section>

      <Section title="Dynamic vs Static Segments">
        <p className="text-[#cbd5e1] mb-4">
          <strong>Dynamic Segments (is_dynamic: true):</strong> Automatically update as users enter or exit the filter criteria. Perfect for ongoing campaigns.
        </p>
        <p className="text-[#cbd5e1] mb-4">
          <strong>Static Segments (is_dynamic: false):</strong> Lock the membership at creation time. Useful for historical analysis and controlled experiments.
        </p>
      </Section>

      <Section title="Exporting Segments">
        <p className="text-[#cbd5e1] mb-4">
          Export segment members for use in external marketing platforms, CRM systems, or data warehouses:
        </p>
        <CodeBlock language="javascript">
{`// Export to CSV
const response = await fetch('/api/v1/audience/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    segment_id: "seg_123",
    format: "csv",
    fields: ["email", "motivation_labels", "risk_profile", "churn_risk"]
  })
});

const blob = await response.blob();
// Download file...`}
        </CodeBlock>
      </Section>

      <Section title="Using Segments in Engagements">
        <p className="text-[#cbd5e1] mb-4">
          Target engagement rules to specific audience segments:
        </p>
        <CodeBlock language="javascript">
{`const rule = await base44.entities.EngagementRule.create({
  name: "High-Value Onboarding",
  client_app_id: "your-app-id",
  trigger_conditions: {
    audience_segment_id: "seg_123",
    behavioral_conditions: [{
      event_type: "signup",
      frequency: "once"
    }]
  },
  engagement_action: {
    type: "modal",
    template_id: "tmpl_456",
    priority: "high"
  }
});`}
        </CodeBlock>
      </Section>

      <Callout type="success">
        <p>
          <strong>Pro Tip:</strong> Combine psychographic and behavioral filters for highly precise segments. 
          For example, target "anxious users who haven't engaged in 7 days" for retention campaigns.
        </p>
      </Callout>
    </div>
  );
}