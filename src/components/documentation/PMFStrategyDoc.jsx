import React from 'react';
import DocSection from './Section';
import Callout from './Callout';

export default function PMFStrategyDoc() {
  return (
    <div>
      <DocSection title="The Startup's Guide to Psychographic-Led Growth" id="pmf-intro">
        <p className="text-[#cbd5e1] leading-relaxed mb-4">
          Achieving Product-Market Fit (PMF) is the primary goal of every early-stage startup. Traditional methods rely on surveys, interviews, and broad usage metrics. knXw offers a new paradigm: <strong>Psychographic‑Led Growth</strong>. This strategy uses a deep understanding of your users' psychology to find, convert, and build for your ideal customers, accelerating your journey to PMF.
        </p>
        <Callout type="strategy" title="The Core Loop">
          <ol className="list-decimal list-inside mt-2 space-y-2 text-[#cbd5e1]">
            <li><strong>Identify</strong> your psychologically‑aligned users.</li>
            <li><strong>Analyze</strong> their unique behaviors and motivations.</li>
            <li><strong>Engage</strong> them with personalized experiences.</li>
            <li><strong>Build</strong> your product roadmap based on their core needs.</li>
          </ol>
        </Callout>
      </DocSection>

      <DocSection title="Phase 1: Find Your True Supporters" id="pmf-supporters">
        <p className="text-[#cbd5e1] leading-relaxed mb-4">
          Your first users are a mix of curious explorers, accidental visitors, and your future evangelists. Your job is to find the evangelists. Don't just look at who is "most active"—look at <em>why</em> they are active.
        </p>
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Execution Steps:</h3>
        <ol className="list-decimal list-inside space-y-3 text-[#cbd5e1]">
            <li>
              <strong>Navigate to the Profiles Page:</strong> After letting knXw collect data for a few days, go to the <a href="/Profiles" className="text-[#00d4ff] hover:underline">User Profiles</a> page.
            </li>
            <li>
              <strong>Analyze the Motivation Stack:</strong> Look for recurring themes in the "Primary Motivations" badges. Are users driven by <code>achievement</code>, <code>social_connection</code>, <code>creativity</code>, or <code>security</code>? This is your first clue to your core value proposition.
            </li>
            <li>
              <strong>Segment by Personality:</strong> Use the filters to isolate users with high <code>conscientiousness</code> (goal‑oriented) or high <code>openness</code> (early adopters). These are often your most valuable initial users.
            </li>
        </ol>
        <Callout type="info" title="Example Insight">
          <p className="text-[#cbd5e1]">
            You run a project management tool. You notice your most retained users aren't just "active"—they have high <code>conscientiousness</code> and <code>achievement</code> in their motivation stack. This tells you your core market isn't just "teams," it's "goal‑oriented high‑achievers."
          </p>
        </Callout>
      </DocSection>
      
      <DocSection title="Phase 2: Profile Your High-Expectation Customers (HECs)" id="pmf-hec">
        <p className="text-[#cbd5e1] leading-relaxed mb-4">
          Your best customers are often your most demanding. They push your product to its limits and have the highest expectations. Understanding them is the key to building a category‑defining product.
        </p>
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Execution Steps:</h3>
        <ol className="list-decimal list-inside space-y-3 text-[#cbd5e1]">
            <li>
              <strong>Isolate your HECs:</strong> Identify users who have both high engagement (from metrics) and a clear psychographic profile (e.g., the high‑achievers from Phase 1).
            </li>
            <li>
              <strong>Deep‑Dive in the Event Stream:</strong> Go to the <a href="/Events" className="text-[#00d4ff] hover:underline">Event Stream</a> page and filter for these specific user IDs. Watch their real‑time journey. Where do they click? Where do they pause (a sign of confusion or deep thought)? What paths do they take?
            </li>
            <li>
              <strong>Read the AI Insights:</strong> On the <a href="/Insights" className="text-[#00d4ff] hover:underline">Insights</a> page, look for patterns related to these users. The AI might flag that "Users with high <code>analytical</code> cognitive style struggle with the dashboard's initial setup." This is a roadmap goldmine.
            </li>
        </ol>
      </DocSection>

      <DocSection title="Phase 3: Convert On-the-Fence Users with Adaptive Engagement" id="pmf-convert">
        <p className="text-[#cbd5e1] leading-relaxed mb-4">
          Many users see your product's value but hesitate due to psychological friction (anxiety, uncertainty, confusion). You can solve this in real‑time.
        </p>
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Execution Steps:</h3>
        <ol className="list-decimal list-inside space-y-3 text-[#cbd5e1]">
            <li>
              <strong>Identify a Friction Point:</strong> From your HEC analysis, you identified that users hesitate on the pricing page.
            </li>
            <li>
              <strong>Form a Hypothesis:</strong> Your AI Insights suggest users with a <code>security</code> motivation are anxious about commitment.
            </li>
            <li>
              <strong>Build an Adaptive Engagement:</strong>
              <ul className="list-disc list-inside ml-5 mt-2 space-y-2">
                <li>Go to the <a href="/Engagements" className="text-[#00d4ff] hover:underline">Engagements</a> page.</li>
                <li>Create a new <strong>Engagement Rule</strong>.</li>
                <li><strong>Trigger Condition:</strong> Set it to trigger when a user whose <code>motivation_stack</code> contains <code>security</code> stays on the <code>/pricing</code> URL for more than <code>15</code> seconds.</li>
                <li><strong>Engagement Action:</strong> Link it to a new <strong>Engagement Template</strong> (a small modal or tooltip) with the message: "Have questions? All our plans come with a 30‑day money‑back guarantee."</li>
              </ul>
            </li>
            <li>
              <strong>Activate and Measure:</strong> Activate the rule. The Engagements page will show you how many <code>security</code>‑driven users saw the message and what percentage of them converted.
            </li>
        </ol>
        <Callout type="success" title="The Result">
          <p className="text-[#cbd5e1]">
            You have just moved from guessing to surgically addressing a specific psychological barrier for a key user segment, directly impacting your conversion rates. This is the core of psychographic‑led optimization.
          </p>
        </Callout>
      </DocSection>
      
      <DocSection title="Phase 4: Define Your Roadmap and Solidify PMF" id="pmf-roadmap">
        <p className="text-[#cbd5e1] leading-relaxed mb-4">
          Your product roadmap should no longer be a list of feature requests. It should be a strategic plan to serve the psychological needs of your ideal customers.
        </p>
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Building the Psycho‑Informed Roadmap:</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-2">
          <li><strong>Instead of:</strong> "Users want a dark mode."</li>
          <li><strong>Think:</strong> "Our HECs, who are <code>creative</code> and have high <code>extraversion</code>, are power users who work at all hours. A dark mode and keyboard shortcuts will enhance their sense of <code>mastery</code> and <code>freedom</code>."</li>
        </ul>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-2 mt-3">
          <li><strong>Instead of:</strong> "We need more integrations."</li>
          <li><strong>Think:</strong> "Our <code>analytical</code> users need to connect their data. Prioritizing a Google Sheets and a Zapier integration will serve their core need for control and data portability, reducing churn in that key segment."</li>
        </ul>
        <p className="text-[#cbd5e1] leading-relaxed mt-4">
          By framing your roadmap around the <em>why</em> (the psychological need) instead of just the <em>what</em> (the feature request), you build a product with a deep, defensible moat. You are no longer just building features; you are serving the fundamental motivations of your target market. This is the definition of true, sustainable Product‑Market Fit.
        </p>
      </DocSection>
    </div>
  );
}