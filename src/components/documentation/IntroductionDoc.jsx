import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function IntroductionDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#c026d3] to-[#fbbf24]">knXw Platform</span>
        <span className="text-[#a3a3a3]"> — Runtime Psychographic Intelligence</span>
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        knXw is a comprehensive platform for understanding user psychology in real time and creating adaptive experiences that respond automatically to who your users are, not just what they click. From live behavioral signals to automated journey orchestration, knXw surfaces the "why" behind every user action.
      </p>

      <Section title="Platform Overview">
        <p className="text-[#cbd5e1] mb-4">
          The platform is organized into six layers that mirror the sidebar navigation:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Signal', desc: 'Intelligence Hub, User Signals, Profiles, and AI Insights — real-time behavioral data and psychographic profiles for every user.' },
            { label: 'Performance', desc: 'Retention Risk, Predictive AI, Audience Segments, and Executive View — where you are losing people and what happens next.' },
            { label: 'Adaptation', desc: 'Engagements, Journey Builder, A/B Testing, and AI Agents — automated responses to user psychological state.' },
            { label: 'Sovereignty', desc: 'User Data Portal, Integrations, and Attribution — user-controlled consent, data lineage, and where value actually comes from.' },
            { label: 'Infrastructure', desc: 'My Apps, API Keys, Developer Center, API Usage, Data Import, and Demo Data — the operational layer.' },
            { label: 'Resources', desc: 'Documentation and Settings — this knowledge base and platform configuration.' },
          ].map(({ label, desc }) => (
            <div key={label} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
              <h4 className="text-[#00d4ff] font-bold mb-1">{label}</h4>
              <p className="text-[#a3a3a3] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="SDK Integration">
        <p className="text-[#cbd5e1] mb-4">
          knXw ships a lightweight browser SDK via your app's own <code className="text-[#00d4ff]">serveAnalyticsScript</code> endpoint — no CDN or npm package required. Find your App ID and API key on the <strong>My Apps</strong> page under Infrastructure.
        </p>
        <CodeBlock language="html">
{`<!-- HTML — add to <head> on every page -->
<!-- Store your key as an env var (e.g. NEXT_PUBLIC_KNXW_API_KEY) -->
<script
  src="https://knxw.app/functions/serveAnalyticsScript?app_id=YOUR_APP_ID"
  data-api-key="YOUR_KNXW_API_KEY"
  async>
</script>`}
        </CodeBlock>

        <p className="text-[#cbd5e1] mt-4 mb-2">React / Next.js (load once in root component):</p>
        <CodeBlock language="javascript">
{`// App.jsx / _app.tsx
useEffect(() => {
  const s = document.createElement('script');
  s.src = \`https://knxw.app/functions/serveAnalyticsScript?app_id=\${process.env.NEXT_PUBLIC_KNXW_APP_ID}\`;
  s.setAttribute('data-api-key', process.env.NEXT_PUBLIC_KNXW_API_KEY);
  s.async = true;
  s.onload = () => window.knxw?.init({ userId: 'user_123', autoTrack: true });
  document.head.appendChild(s);
}, []);`}
        </CodeBlock>

        <p className="text-[#cbd5e1] mt-4 mb-2">Manual event tracking after init:</p>
        <CodeBlock language="javascript">
{`window.knxw.identify('user_123', { plan: 'growth' });

window.knxw.track('checkout_start', {
  plan_key: 'growth',
  source: 'pricing_page'
});

// Take over engagement rendering
window.knxw.onEngagement((engagement) => {
  console.log('Triggered engagement:', engagement);
});`}
        </CodeBlock>

        <Callout type="info">
          <p>
            The SDK is browser-first and uses polling for engagement delivery. It requires no npm installation. See the <strong>JavaScript SDK</strong> section for the full API reference.
          </p>
        </Callout>
      </Section>

      <Section title="Demo Data">
        <p className="text-[#cbd5e1] mb-4">
          The <strong>Demo Data</strong> page (Infrastructure → Demo Data) generates realistic, scenario-based datasets across all platform modules — perfect for exploring capabilities before you have live traffic.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#00d4ff] font-bold mb-2">Growth Marketing Orchestration</h4>
            <p className="text-[#a3a3a3] text-sm">Personalized journeys, engagement rules, and content recommendations. 150 synthetic users across the full psychographic spectrum.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#10b981] font-bold mb-2">Conversion & Optimization Lab</h4>
            <p className="text-[#a3a3a3] text-sm">A/B tests, audience segments, and feedback analysis. 200 users with rich behavioral histories for conversion optimization demos.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#8b5cf6] font-bold mb-2">Strategic Intelligence & Governance</h4>
            <p className="text-[#a3a3a3] text-sm">Market trends, competitive insights, audit logs, and system health data for strategic and enterprise demos.</p>
          </div>
        </div>
        <Callout type="info">
          <p>Demo data is clearly tagged and can be cleared at any time from the Demo Data page when you're ready to work with real data.</p>
        </Callout>
      </Section>

      <Section title="Core Capabilities">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Psychographic Profiling</h3>
            <p className="text-[#a3a3a3] text-sm">Automatically build personality trait, risk profile, cognitive style, motivation, and emotional state models for every user from behavioral events.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Adaptive Engagements</h3>
            <p className="text-[#a3a3a3] text-sm">Trigger modals, tooltips, notifications, and redirects automatically when a user's psychological state matches a rule you define.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Predictive AI & Retention Risk</h3>
            <p className="text-[#a3a3a3] text-sm">Churn prediction, intent forecasting, and micro-signal detection surface at-risk users before they leave, with AI-generated intervention suggestions.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Journey Builder</h3>
            <p className="text-[#a3a3a3] text-sm">Design multi-step user flows triggered by psychological state changes, with versioning, task sequencing, and live performance tracking.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Audience Segments</h3>
            <p className="text-[#a3a3a3] text-sm">Build precise segments with a visual filter builder, preview audience size in real time, and export directly to Meta, Google Ads, or HubSpot.</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Attribution & Sovereignty</h3>
            <p className="text-[#a3a3a3] text-sm">Multi-touch attribution, workspace-level data isolation, user consent management, and GDPR-ready data portability controls.</p>
          </div>
        </div>
      </Section>

      <Section title="Quick Start">
        <ol className="list-decimal ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Create an App:</strong> Go to Infrastructure → My Apps and create your first application to get an App ID and API key.</li>
          <li><strong>Install the SDK:</strong> Add the tracking snippet to your website or app (see SDK Integration above).</li>
          <li><strong>Explore with Demo Data:</strong> Use Infrastructure → Demo Data to seed realistic scenarios and see every module in action immediately.</li>
          <li><strong>Build Audience Segments:</strong> Performance → Audience Segments — create segments with the visual builder.</li>
          <li><strong>Configure Engagements:</strong> Adaptation → Engagements — set rules that trigger personalized responses.</li>
          <li><strong>Deploy AI Agents:</strong> Adaptation → AI Agents — set up autonomous optimization and insights workflows.</li>
        </ol>
      </Section>

      <Section title="Platform Architecture">
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Real-Time Event Processing:</strong> Behavioral events are captured, stored, and fed into the psychographic pipeline immediately via <code className="text-[#00d4ff]">captureEvent</code> → <code className="text-[#00d4ff]">liveProfileProcessor</code>.</li>
          <li><strong>AI/ML Pipeline:</strong> Personality, motivation, emotional state, and churn risk models run on every new event batch and update profiles continuously.</li>
          <li><strong>Explainable AI:</strong> Every insight and profile attribute includes transparent reasoning — not a black box score.</li>
          <li><strong>Enterprise Security:</strong> RBAC with granular permissions, comprehensive audit logs, SSO support (Okta / Azure AD), and SOC2-ready architecture.</li>
          <li><strong>Privacy-First:</strong> Built-in consent management, user data portal for self-service data control, and GDPR-compliant deletion workflows.</li>
        </ul>
      </Section>

      <Section title="Use Cases">
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-bold mb-1">E-commerce Personalization</h3>
            <p className="text-[#a3a3a3] text-sm">Personalize product recommendations, pricing strategies, and checkout flows based on each user's risk profile, motivation, and cognitive style.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">SaaS Onboarding & Retention</h3>
            <p className="text-[#a3a3a3] text-sm">Guide users through personalized onboarding journeys and trigger retention campaigns automatically when the Retention Risk score rises.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Gaming & Interactive Media</h3>
            <p className="text-[#a3a3a3] text-sm">Adaptive difficulty, personalized reward structures, and real-time churn prevention via the dedicated GameDev API endpoints.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Financial Services</h3>
            <p className="text-[#a3a3a3] text-sm">Tailor investment recommendations and risk communications to individual psychological risk profiles and decision-making styles.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}