import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function DemoDataStudioDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          <span className="gradient-text gradient-fast">Demo Data Studio</span>
          <span className="text-[#a3a3a3]">: Comprehensive Scenario Testing</span>
        </h1>
        <p className="text-lg md:text-xl text-[#cbd5e1] leading-relaxed">
          The Demo Data Studio generates realistic, interconnected datasets that showcase knXw's full capabilities across multiple modules. Perfect for demonstrations, testing, and understanding complex psychological intelligence workflows.
        </p>
      </div>

      <Section title="Available Demo Scenarios">
        <p className="text-[#cbd5e1] mb-6">
          Each scenario is carefully crafted to demonstrate specific knXw capabilities and use cases, with realistic user profiles, behavioral data, and AI-generated insights.
        </p>

        <div className="space-y-8">
          {/* Growth Marketing Orchestration */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Growth Marketing Orchestration</h3>
                <p className="text-[#a3a3a3] mb-3">
                  Showcases AI-driven user engagement and personalized content delivery. Perfect for demonstrating how knXw identifies user psychology and delivers tailored experiences that drive growth.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-[#00d4ff] font-semibold mb-2">Generated Data:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• 150 diverse user psychological profiles</li>
                      <li>• 5-8 engagement templates (modals, check-ins, notifications)</li>
                      <li>• 8-12 engagement rules with psychographic triggers</li>
                      <li>• 15-25 personalized content recommendations</li>
                      <li>• 1-2 complete user journey workflows</li>
                      <li>• Realistic behavioral event streams</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[#00d4ff] font-semibold mb-2">Demonstrates:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• Real-time psychographic profiling</li>
                      <li>• Personalized engagement delivery</li>
                      <li>• Automated user journey orchestration</li>
                      <li>• Content recommendation engine</li>
                      <li>• Behavioral trigger identification</li>
                      <li>• Multi-channel engagement coordination</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Optimization Lab */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669]">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Conversion & Optimization Lab</h3>
                <p className="text-[#a3a3a3] mb-3">
                  Highlights advanced experimentation with A/B testing, precise audience segmentation, and intelligent feedback analysis. Shows how knXw optimizes conversion funnels through psychological insights.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-[#10b981] font-semibold mb-2">Generated Data:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• 200 user profiles with conversion focus</li>
                      <li>• 3-5 audience segments with psychographic filters</li>
                      <li>• 1-2 running A/B tests with multiple variants</li>
                      <li>• 50-100 A/B test participants with results</li>
                      <li>• 10-15 analyzed customer feedback entries</li>
                      <li>• Conversion event streams and drop-off analysis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[#10b981] font-semibold mb-2">Demonstrates:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• Psychographic audience segmentation</li>
                      <li>• A/B testing with psychological hypotheses</li>
                      <li>• Statistical significance tracking</li>
                      <li>• Intelligent feedback analysis</li>
                      <li>• Conversion funnel optimization</li>
                      <li>• Behavioral pattern recognition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Intelligence & Governance */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">Strategic Intelligence & Data Governance</h3>
                <p className="text-[#a3a3a3] mb-3">
                  Demonstrates knXw's capabilities in market intelligence, system health monitoring, and unified data integration for compliance and strategic insights.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-[#8b5cf6] font-semibold mb-2">Generated Data:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• Market trend analysis with psychological insights</li>
                      <li>• Competitor content psychological analysis</li>
                      <li>• System health metrics and monitoring</li>
                      <li>• Comprehensive audit trail examples</li>
                      <li>• Data integration workflow demonstrations</li>
                      <li>• Executive-level reporting samples</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[#8b5cf6] font-semibold mb-2">Demonstrates:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• AI-powered market intelligence</li>
                      <li>• Competitor psychological analysis</li>
                      <li>• System health monitoring</li>
                      <li>• Compliance and audit capabilities</li>
                      <li>• Data governance workflows</li>
                      <li>• Strategic intelligence reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Using Demo Data Effectively">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Best Practices</h3>
            <ul className="text-[#a3a3a3] space-y-2 list-disc list-inside">
              <li>Start with one scenario to understand core workflows</li>
              <li>Explore interconnected data across multiple modules</li>
              <li>Test different user personas and psychological profiles</li>
              <li>Experiment with engagement rules and triggers</li>
              <li>Review AI reasoning and explainable insights</li>
              <li>Clear demo data before implementing live tracking</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Integration Testing</h3>
            <ul className="text-[#a3a3a3] space-y-2 list-disc list-inside">
              <li>Each scenario includes realistic API keys for testing</li>
              <li>Demo data is clearly marked in all modules</li>
              <li>Scenarios can be refreshed or cleared as needed</li>
              <li>All generated profiles include AI reasoning</li>
              <li>Events and insights are temporally consistent</li>
              <li>Data relationships mirror real-world usage</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Accessing Demo Data Studio">
        <p className="text-[#cbd5e1] mb-4">
          The Demo Data Studio is available to admin users through the main navigation:
        </p>
        <CodeBlock language="text">
Dashboard → Demo Data → Choose Scenario → Seed Demo Data
        </CodeBlock>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white mb-4">Demo API Integration</h3>
          <p className="text-[#a3a3a3] mb-4">
            Each seeded scenario includes a Demo Application with a functional API key that you can use to test SDK integration:
          </p>
          <CodeBlock language="html">
{`<!-- Demo tracking snippet -->
<script>
!function(k,n,x,w){k.knXw=k.knXw||[],k.knXw.methods=["track","identify","page"];
// ... SDK initialization code ...
k.knXw.load("demo_api_key_from_seeding");
k.knXw.page();
}(window,document);
</script>`}
          </CodeBlock>
        </div>

        <Callout type="warning">
          <p>
            <strong>Demo Data Management:</strong> Demo data is clearly marked with `is_demo: true` flags and can be easily cleared using the "Clear All Demo Data" function. Always clear demo data before switching to production usage.
          </p>
        </Callout>
      </Section>

      <Section title="Scenario-Specific Features">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Growth Marketing Orchestration</h3>
            <p className="text-[#a3a3a3] text-sm">
              Focus on the Engagements and Journeys modules to see how psychological triggers create personalized user experiences. 
              Check Content Recommendations to see how the AI matches content to individual user psychology.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Conversion & Optimization Lab</h3>
            <p className="text-[#a3a3a3] text-sm">
              Explore the A/B Testing module to see experiments in action, and use Audience Builder to understand how 
              psychological segmentation creates more precise targeting than traditional demographics.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Strategic Intelligence & Governance</h3>
            <p className="text-[#a3a3a3] text-sm">
              Review Market Intelligence for competitor analysis, check System Health for monitoring examples, 
              and explore the comprehensive audit trails that support enterprise compliance requirements.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Transitioning to Live Data">
        <p className="text-[#cbd5e1] mb-4">
          When you're ready to move from demo data to live tracking:
        </p>
        <ol className="list-decimal ml-6 text-[#cbd5e1] space-y-2">
          <li>Clear all demo data using the Demo Data Studio</li>
          <li>Create your production Client Application</li>
          <li>Install the SDK with your production API key</li>
          <li>Configure your psychographic analysis rules</li>
          <li>Set up integrations with your existing tools</li>
          <li>Begin collecting real behavioral data</li>
        </ol>
        
        <Callout type="success">
          <p>
            The transition from demo to live data is seamless. All the rules, templates, and configurations you create while exploring demo data can be easily adapted for your production environment.
          </p>
        </Callout>
      </Section>
    </div>
  );
}