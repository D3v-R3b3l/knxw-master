import React from 'react';
import { FlaskConical, Target, TrendingUp, Zap } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function ABTestingDoc() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          knXw's A/B Testing Studio supports psychographic targeting, weighted variant assignment, conversion recording,
          and segment-level result views for running experiments against different user profiles.
        </p>

        <Callout type="info" icon={FlaskConical}>
          <strong>Current implementation:</strong> tests can target psychographic conditions, assign users deterministically,
          record conversions per participant, and show conversion breakdowns by cognitive segment.
        </Callout>
      </Section>

      <Section title="Test Types">
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Engagement Template Testing</h4>
            <p className="text-[#a3a3a3] text-sm">
              Test different messaging, timing, and formats for in-app engagements across psychological profiles.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Journey Step Testing</h4>
            <p className="text-[#a3a3a3] text-sm">
              Optimize user journey flows by testing different paths for different psychological segments.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Content Variant Testing</h4>
            <p className="text-[#a3a3a3] text-sm">
              Test different content approaches, headlines, and CTAs tailored to specific cognitive styles and motivations.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Creating a Test">
        <CodeBlock language="javascript">
{`// Example: Test two email subject lines for analytical users

{
  "name": "Email Subject Line Test - Analytical Segment",
  "test_type": "engagement_template",
  "targeting_conditions": {
    "psychographic_conditions": [{
      "field": "cognitive_style",
      "operator": "equals",
      "value": "analytical"
    }]
  },
  "variants": [
    {
      "name": "Control - Data-Focused",
      "is_control": true,
      "content": {
        "subject": "37% increase in ROI with psychographic targeting"
      }
    },
    {
      "name": "Variant A - Stats-Heavy",
      "content": {
        "subject": "2.4x better conversion rates: See the data"
      }
    }
  ],
  "success_metrics": {
    "primary_metric": {
      "name": "email_open_rate",
      "goal": "maximize"
    }
  }
}`}
        </CodeBlock>
      </Section>

      <Section title="Results Available Today">
        <p className="text-[#e5e5e5] mb-4">
          The current system records participant assignments and conversion events, then surfaces variant metrics and
          psychographic conversion breakdowns for running tests.
        </p>

        <Callout type="success" icon={TrendingUp}>
          Available now: impressions, conversions, conversion rate, average engagement score, and conversion breakdowns by cognitive segment.
        </Callout>
      </Section>
    </div>
  );
}