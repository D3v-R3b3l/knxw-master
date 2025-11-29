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
          knXw's A/B Testing Studio goes beyond traditional testing by incorporating psychographic segmentation. 
          Test different approaches for different psychological profiles simultaneously, dramatically increasing 
          test velocity and learning speed.
        </p>

        <Callout type="info" icon={FlaskConical}>
          <strong>Psychographic Testing:</strong> Instead of testing one variant against another for all users, 
          test which approach works best for each psychological profile. This can 3-5x your learning rate.
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

      <Section title="Bandit Optimization">
        <p className="text-[#e5e5e5] mb-4">
          Enable multi-armed bandit mode to automatically shift traffic to winning variants in real-time, 
          maximizing performance while still gathering data.
        </p>

        <Callout type="success" icon={TrendingUp}>
          Bandit optimization can improve overall test performance by 15-30% compared to static splits.
        </Callout>
      </Section>
    </div>
  );
}