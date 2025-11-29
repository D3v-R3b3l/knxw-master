import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function AudienceBuilderDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        <span className="gradient-text gradient-fast">Audience Builder</span>
        <span className="text-[#a3a3a3]">: Psychographic Segmentation</span>
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        Build precise audience segments using psychological traits, behavioral patterns, and motivational drivers. 
        The Audience Builder provides drag-and-drop simplicity with enterprise-grade precision.
      </p>

      <Section title="Overview">
        <p className="text-[#cbd5e1] mb-4">
          Traditional demographic segmentation tells you who your users are. knXw's Audience Builder tells you why they act. 
          Create segments based on:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-1">
          <li><strong>Personality Traits:</strong> Big Five characteristics (openness, conscientiousness, etc.)</li>
          <li><strong>Risk Profile:</strong> Conservative, moderate, or aggressive decision-making patterns</li>
          <li><strong>Cognitive Style:</strong> Analytical, intuitive, systematic, or creative thinking</li>
          <li><strong>Motivational Drivers:</strong> Achievement, security, social connection, personal growth</li>
          <li><strong>Emotional States:</strong> Current mood, confidence levels, energy patterns</li>
          <li><strong>Behavioral Patterns:</strong> Engagement frequency, feature usage, purchase behavior</li>
        </ul>
      </Section>

      <Section title="Creating Segments">
        <p className="text-[#cbd5e1] mb-4">
          The visual segment builder allows complex logic without code:
        </p>

        <div className="mb-6">
          <h3 className="text-white font-bold mb-2">Basic Segment Example</h3>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <p className="text-[#a3a3a3] text-sm">
              <strong>High-Value Prospects:</strong><br/>
              • Risk Profile = "aggressive"<br/>
              • Personality Openness &gt; 0.7<br/>
              • Viewed pricing page in last 7 days<br/>
              • Has not converted
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-white font-bold mb-2">Advanced Segment Logic</h3>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <p className="text-[#a3a3a3] text-sm">
              <strong>Churn Risk - Achievement Motivated:</strong><br/>
              • Motivation contains "achievement"<br/>
              • Last active &gt; 5 days ago<br/>
              • Emotional confidence &lt; 0.4<br/>
              • Engagement trend = declining
            </p>
          </div>
        </div>

        <Callout type="tip">
          <p>
            Segments update in real-time as user profiles change. You can see immediate size estimates and preview sample users before activating.
          </p>
        </Callout>
      </Section>

      <Section title="Segment Types">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Trait-Based Segments</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Segment by psychological characteristics that remain relatively stable over time.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Conservative vs. aggressive risk takers</li>
              <li>• Analytical vs. intuitive decision makers</li>
              <li>• High vs. low openness to new experiences</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Behavioral Segments</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Segment by recent actions and engagement patterns.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Power users vs. casual browsers</li>
              <li>• Feature adopters vs. basic users</li>
              <li>• Frequent vs. occasional purchasers</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">State-Based Segments</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Segment by current emotional and motivational states.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• High confidence vs. uncertain users</li>
              <li>• Excited vs. frustrated emotional states</li>
              <li>• Motivated vs. disengaged users</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Hybrid Segments</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Combine multiple dimensions for precise targeting.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Achievement-motivated new users</li>
              <li>• Risk-averse frequent purchasers</li>
              <li>• Creative personalities in growth phase</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Integration with Journey Builder">
        <p className="text-[#cbd5e1] mb-4">
          Audience segments integrate seamlessly with Journey Builder to create sophisticated automation:
        </p>
        
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333] mb-4">
          <p className="text-[#a3a3a3] text-sm">
            <strong>Example Journey Trigger:</strong><br/>
            When a user enters the "High-Value Prospects" segment → Start "Executive Demo" journey
          </p>
        </div>

        <CodeBlock language="json">
{`{
  "trigger": {
    "type": "segment_entry",
    "segment_id": "high-value-prospects"
  },
  "actions": [
    {
      "type": "send_email",
      "template": "executive-demo-invitation",
      "delay": "2_hours"
    },
    {
      "type": "create_task",
      "assignee": "sales@company.com",
      "priority": "high"
    }
  ]
}`}
        </CodeBlock>
      </Section>

      <Section title="API Integration">
        <p className="text-[#cbd5e1] mb-4">
          Access segment data programmatically for custom integrations:
        </p>
        
        <CodeBlock language="javascript">
{`// Get users in a specific segment
const response = await knXw.segments.getUsers('high-value-prospects');

// Check if a user belongs to segments
const userSegments = await knXw.users.getSegments('user_12345');

// Create segments programmatically
const newSegment = await knXw.segments.create({
  name: "Mobile Power Users",
  conditions: {
    operator: "AND",
    conditions: [
      { field: "device_type", operator: "equals", value: "mobile" },
      { field: "session_count", operator: "greater_than", value: 50 },
      { field: "personality_traits.conscientiousness", operator: "greater_than", value: 0.6 }
    ]
  }
});`}
        </CodeBlock>
      </Section>

      <Section title="Real-Time Updates">
        <p className="text-[#cbd5e1] mb-4">
          Segments update automatically as user profiles evolve:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Profile Changes:</strong> Users move between segments as their psychological profile updates</li>
          <li><strong>Behavioral Triggers:</strong> New actions can immediately qualify users for different segments</li>
          <li><strong>Time-Based Rules:</strong> Segments can include time-decay logic for recency weighting</li>
          <li><strong>Predictive Scoring:</strong> ML models predict segment transitions before they happen</li>
        </ul>

        <Callout type="warning">
          <p>
            Segments with complex behavioral conditions may have higher computational costs. 
            Consider caching strategies for frequently accessed segments.
          </p>
        </Callout>
      </Section>

      <Section title="Best Practices">
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Start Simple:</strong> Begin with broad psychological traits before adding behavioral complexity</li>
          <li><strong>Test Segment Size:</strong> Ensure segments are large enough to be statistically meaningful</li>
          <li><strong>Monitor Churn:</strong> Track how users flow between segments over time</li>
          <li><strong>Validate Assumptions:</strong> Use A/B tests to confirm segment-based strategies work</li>
          <li><strong>Regular Review:</strong> Update segment definitions as you learn more about user behavior</li>
          <li><strong>Privacy Compliance:</strong> Ensure segment criteria comply with data protection regulations</li>
        </ul>
      </Section>
    </div>
  );
}