import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function IntroductionDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        <span className="gradient-text gradient-fast">knXw Platform</span>
        <span className="text-[#a3a3a3]">: Complete Psychographic Intelligence</span>
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        knXw is the first comprehensive platform for understanding user psychology and creating personalized experiences. 
        From real-time behavioral analysis to automated journey orchestration, knXw gives you everything you need to understand the "why" behind user actions.
      </p>

      <Section title="Platform Overview">
        <p className="text-[#cbd5e1] mb-4">
          knXw combines multiple layers of intelligence:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Real-Time Analysis:</strong> Capture and analyze user behavior as it happens</li>
          <li><strong>Predictive AI:</strong> Churn prediction, anomaly detection, and behavioral forecasting</li>
          <li><strong>Journey Builder:</strong> Create sophisticated multi-step user flows triggered by psychological states</li>
          <li><strong>AI Agents:</strong> Deploy intelligent automation for growth, compliance, and content personalization</li>
          <li><strong>Audience Builder:</strong> Segment users by psychological traits and behavioral patterns</li>
          <li><strong>A/B Testing:</strong> Psychographically-informed experiments with automated optimization</li>
          <li><strong>AI Marketing Copy:</strong> Generate personalized messaging based on user psychology</li>
          <li><strong>Multi-Channel Engagement:</strong> Deliver personalized experiences across email, SMS, push, and in-app</li>
          <li><strong>BI Tool Integration:</strong> Export to Tableau, Power BI, Looker, and custom data warehouses</li>
          <li><strong>Executive Dashboard:</strong> Board-ready insights with automated reporting and batch analytics</li>
          <li><strong>Enterprise Security:</strong> RBAC with granular permissions, comprehensive audit logs, and SOC2-ready architecture</li>
        </ul>
      </Section>

      <Section title="Demo Data Studio">
        <p className="text-[#cbd5e1] mb-4">
          knXw includes a comprehensive Demo Data Studio that generates realistic, scenario-based datasets to showcase the platform's full capabilities. Perfect for demonstrations, testing, and understanding how different modules work together.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#00d4ff] font-bold mb-2">Growth Marketing Orchestration</h4>
            <p className="text-[#a3a3a3] text-sm">
              AI-driven user engagement with personalized journeys, content recommendations, and automated workflows. Demonstrates real-time psychological profiling in action.
            </p>
            <div className="text-xs text-[#6b7280] mt-2">150 users • Engagement rules • User journeys • Content recommendations</div>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#10b981] font-bold mb-2">Conversion & Optimization Lab</h4>
            <p className="text-[#a3a3a3] text-sm">
              Advanced A/B testing with psychographic segmentation, audience building, and intelligent feedback analysis for conversion optimization.
            </p>
            <div className="text-xs text-[#6b7280] mt-2">200 users • A/B tests • Audience segments • Feedback analysis</div>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#8b5cf6] font-bold mb-2">Strategic Intelligence & Governance</h4>
            <p className="text-[#a3a3a3] text-sm">
              Market intelligence, competitor analysis, system health monitoring, and enterprise-grade audit trails for strategic decision making.
            </p>
            <div className="text-xs text-[#6b7280] mt-2">Market trends • Competitor insights • Audit logs • System health</div>
          </div>
        </div>

        <Callout type="info">
          <p>
            Each scenario generates interconnected data across multiple modules, showing how knXw's features work together to provide comprehensive psychological intelligence. 
            Demo data is clearly marked and can be easily cleared when you're ready to work with real data.
          </p>
        </Callout>
      </Section>

      <Section title="Core Capabilities">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Psychographic Analysis</h3>
            <p className="text-[#a3a3a3] text-sm">
              Understand personality traits, risk profiles, cognitive styles, and motivational drivers from user behavior.
            </p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Adaptive Experiences</h3>
            <p className="text-[#a3a3a3] text-sm">
              Automatically personalize content, messaging, and user flows based on psychological profiles.
            </p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Automated Journeys</h3>
            <p className="text-[#a3a3a3] text-sm">
              Design complex user journeys with visual tools, triggered by psychological state changes and behaviors.
            </p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Enterprise Integration</h3>
            <p className="text-[#a3a3a3] text-sm">
              Connect seamlessly with HubSpot, Google Analytics, Meta, AWS, Azure, and your existing growth stack.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Quick Start">
        <p className="text-[#cbd5e1] mb-4">
          Getting started with knXw takes just a few minutes:
        </p>
        <ol className="list-decimal ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Explore with Demo Data:</strong> Use the Demo Data Studio to generate realistic scenarios and see knXw in action immediately</li>
          <li><strong>Install SDK:</strong> Add the knXw tracking SDK to your website or app</li>
          <li><strong>Configure Analysis:</strong> Set up your first psychographic analysis rules</li>
          <li><strong>Create Audiences:</strong> Build segments using the visual Audience Builder</li>
          <li><strong>Design Journeys:</strong> Create user journeys with the Journey Builder</li>
          <li><strong>Deploy AI Agents:</strong> Set up automated optimization and insights</li>
        </ol>
        
        <Callout type="info">
          <p>
            Start with demo data to understand knXw's capabilities, then gradually transition to live tracking as you implement the SDK and configure your real data sources.
          </p>
        </Callout>
      </Section>

      <Section title="SDK Integration">
        <p className="text-[#cbd5e1] mb-4">
          Add knXw to your website with a single script tag:
        </p>
        <CodeBlock language="html">
{`<script async src="https://cdn.knxw.app/sdk/v1/knxw.js"></script>
<script>
  window.knXw = window.knXw || [];
  knXw('init', 'your-api-key');
  knXw('track', 'page_view');
</script>`}
        </CodeBlock>
        
        <p className="text-[#cbd5e1] mt-4 mb-4">
          Or install via npm for React/Node.js applications:
        </p>
        <CodeBlock language="bash">
          npm install @knxw/sdk
        </CodeBlock>
        
        <CodeBlock language="javascript">
{`import knXw from '@knxw/sdk';

knXw.init('your-api-key');
knXw.track('page_view');

// Track custom events
knXw.track('feature_used', {
  feature: 'dashboard',
  duration: 120
});`}
        </CodeBlock>
      </Section>

      <Section title="Platform Architecture">
        <p className="text-[#cbd5e1] mb-4">
          knXw is built on a modern, scalable architecture:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Real-Time Processing:</strong> Stream processing for immediate psychological analysis</li>
          <li><strong>AI/ML Pipeline:</strong> Advanced models for personality, motivation, and behavioral prediction</li>
          <li><strong>Explainable AI:</strong> Transparent reasoning for every insight and recommendation</li>
          <li><strong>Enterprise Security:</strong> SOC2-ready with encryption at rest and in transit</li>
          <li><strong>Global Scale:</strong> Multi-region deployment with edge processing capabilities</li>
          <li><strong>Privacy-First:</strong> Built-in consent management and data sovereignty controls</li>
        </ul>
      </Section>

      <Section title="Use Cases">
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-bold mb-2">E-commerce Personalization</h3>
            <p className="text-[#a3a3a3] text-sm">
              Personalize product recommendations, pricing strategies, and checkout experiences based on user psychology.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">SaaS Onboarding & Retention</h3>
            <p className="text-[#a3a3a3] text-sm">
              Guide users through personalized onboarding flows and trigger retention campaigns based on engagement patterns.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Content & Media</h3>
            <p className="text-[#a3a3a3] text-sm">
              Recommend content that matches user interests and cognitive styles, increasing engagement and time-on-site.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Financial Services</h3>
            <p className="text-[#a3a3a3] text-sm">
              Tailor investment recommendations and risk assessments to individual psychological profiles and risk tolerance.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Next Steps">
        <p className="text-[#cbd5e1] mb-4">
          Ready to get started? Here's what to explore next:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>SDK Documentation:</strong> Learn how to integrate knXw tracking</li>
          <li><strong>Journey Builder:</strong> Create your first automated user flow</li>
          <li><strong>Audience Builder:</strong> Build psychographic segments</li>
          <li><strong>AI Agents:</strong> Deploy intelligent automation</li>
          <li><strong>Integrations:</strong> Connect with your existing tools</li>
          <li><strong>Executive Dashboard:</strong> Set up automated reporting</li>
        </ul>
      </Section>
    </div>
  );
}