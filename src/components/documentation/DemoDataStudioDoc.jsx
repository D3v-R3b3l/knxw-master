import React from "react";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-2xl font-bold text-white mb-4 border-b border-[#262626] pb-3">{title}</h2>
    <div>{children}</div>
  </div>
);

const CodeBlock = ({ children }) => (
  <pre className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-sm text-[#10b981] overflow-x-auto mb-4">
    <code>{children}</code>
  </pre>
);

const Callout = ({ type = "info", children }) => {
  const styles = {
    info: "bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]",
    warning: "bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]",
    success: "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]",
  };
  return (
    <div className={`border rounded-lg p-4 mb-4 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
};

export default function DemoDataStudioDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Demo Data Studio</h1>
        <p className="text-lg text-[#cbd5e1] leading-relaxed">
          The Demo Data Studio generates realistic, psychographically-diverse datasets to test knXw's intelligence infrastructure across profiles, events, and insights. All data is marked as demo and can be cleared at any time.
        </p>
      </div>

      <Section title="Available Demo Scenarios">
        <p className="text-[#cbd5e1] mb-6">
          Three scenarios are available, each seeding a distinct psychographic distribution of user profiles, behavioral events, and AI-generated insights.
        </p>

        <div className="space-y-8">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex-shrink-0">
                <span className="text-2xl">🖥️</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold text-white mb-2">Enterprise SaaS</h3>
                <p className="text-[#a3a3a3] mb-3">B2B software users with analytical cognitive styles, conservative risk profiles, and achievement/security motivations.</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-[#00d4ff] font-semibold mb-2">Generated Data:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• 30 psychographic user profiles</li>
                      <li>• 8–20 behavioral events per user</li>
                      <li>• 2 AI-generated insights per user</li>
                      <li>• page_view, click, form_submit, scroll, time_on_page events</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[#00d4ff] font-semibold mb-2">Profile Characteristics:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• Analytical &amp; systematic cognitive styles</li>
                      <li>• Conservative risk profile bias</li>
                      <li>• Security, achievement, recognition motivations</li>
                      <li>• URLs simulate a SaaS product site</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#db2777] flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold text-white mb-2">Consumer App</h3>
                <p className="text-[#a3a3a3] mb-3">B2C users with diverse cognitive styles, mixed risk profiles, and social/learning motivations.</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-[#ec4899] font-semibold mb-2">Generated Data:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• 50 psychographic user profiles</li>
                      <li>• 15–30 behavioral events per user</li>
                      <li>• 3 AI-generated insights per user</li>
                      <li>• Includes hover and exit-intent events</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[#ec4899] font-semibold mb-2">Profile Characteristics:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• Balanced mix of all cognitive styles</li>
                      <li>• Even distribution across risk profiles</li>
                      <li>• Social connection, learning, autonomy motivations</li>
                      <li>• URLs simulate an e-commerce shopping experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex-shrink-0">
                <span className="text-2xl">🧠</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold text-white mb-2">Mixed Audience</h3>
                <p className="text-[#a3a3a3] mb-3">Balanced distribution across all psychographic dimensions for comprehensive testing.</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-[#8b5cf6] font-semibold mb-2">Generated Data:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• 40 psychographic user profiles</li>
                      <li>• 10–25 behavioral events per user</li>
                      <li>• 3 AI-generated insights per user</li>
                      <li>• Randomized motivation combinations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[#8b5cf6] font-semibold mb-2">Profile Characteristics:</h4>
                    <ul className="text-[#a3a3a3] space-y-1">
                      <li>• Fully randomized cognitive styles</li>
                      <li>• All risk profiles represented equally</li>
                      <li>• 2–3 random motivations per user</li>
                      <li>• Ideal for testing the full analytics dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="What Gets Created">
        <p className="text-[#cbd5e1] mb-4">Each seeding operation creates records in the following entities:</p>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">UserPsychographicProfile</h4>
            <p className="text-[#a3a3a3] text-sm">Full psychographic profiles including personality traits, emotional state, risk profile, cognitive style, and motivation stack.</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#10b981] font-semibold mb-2">CapturedEvent</h4>
            <p className="text-[#a3a3a3] text-sm">Behavioral events with realistic payloads, timestamps, URLs, and session IDs across the last 30 days.</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#ec4899] font-semibold mb-2">PsychographicInsight</h4>
            <p className="text-[#a3a3a3] text-sm">Insights per user covering behavioral patterns, motivation shifts, and engagement optimization recommendations.</p>
          </div>
        </div>
        <p className="text-[#a3a3a3] text-sm">A demo <strong className="text-white">ClientApp</strong> is also created or reused, providing a functional API key visible in the seeding result.</p>
      </Section>

      <Section title="Accessing Demo Data Studio">
        <p className="text-[#cbd5e1] mb-4">The Demo Data Studio is available to authenticated users through the main navigation:</p>
        <CodeBlock>Dashboard → Demo Data → Choose Scenario → Seed</CodeBlock>
        <Callout type="warning">
          <strong>Demo Data Management:</strong> All demo records are tagged with <code>is_demo: true</code>. Seeding automatically clears existing demo data first to prevent duplicates. Use "Clear All Demo Data" before connecting real data sources.
        </Callout>
      </Section>

      <Section title="Transitioning to Live Data">
        <p className="text-[#cbd5e1] mb-4">When you're ready to move from demo data to live tracking:</p>
        <ol className="list-decimal ml-6 text-[#cbd5e1] space-y-2 mb-4">
          <li>Clear all demo data using the Demo Data Studio</li>
          <li>Create your production Client Application in My Apps</li>
          <li>Install the SDK with your production API key</li>
          <li>Begin collecting real behavioral data</li>
        </ol>
        <Callout type="success">
          All configurations and engagement rules created while exploring demo data remain in place after clearing demo records — only the profile, event, and insight data is removed.
        </Callout>
      </Section>
    </div>
  );
}