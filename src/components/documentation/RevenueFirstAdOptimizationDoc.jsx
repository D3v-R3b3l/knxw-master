import React from 'react';
import DocSection from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function RevenueFirstAdOptimizationDoc() {
  return (
    <div>
      <DocSection title="Revenue-First Ad Optimization: Beyond Click-Based Metrics" id="revenue-first-intro">
        <p>
          Traditional ad platforms optimize for clicks, impressions, or basic conversions. knXw transforms this approach by connecting every dollar of ad spend to actual revenue and profit, leveraging deep psychographic insights to understand not just <em>who</em> converted, but <em>why</em> they converted.
        </p>
        <Callout type="strategy" title="The knXw Advantage">
          While Meta and Google optimize for engagement metrics, knXw optimizes for <strong>profit per customer</strong> and <strong>lifetime value</strong>, using psychological profiling to predict which users will become high-value customers vs. one-time purchasers.
        </Callout>
        <p>
          This comprehensive guide will show you how to implement a revenue-first optimization strategy that can dramatically improve your ad spend efficiency and overall profitability.
        </p>
      </DocSection>

      <DocSection title="Core Concepts: Understanding True Attribution" id="attribution-concepts">
        <p>
          Revenue-first optimization requires understanding three key components of knXw's attribution system:
        </p>
        
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">1. Attribution Chain Tracking</h3>
        <p>
          knXw tracks the complete user journey from initial ad click to final conversion, capturing all touchpoints along the way. This creates a comprehensive <code>Attribution</code> record that shows the true path to conversion.
        </p>
        <CodeBlock language="json" code={`
{
  "workspace_id": "workspace-abc",
  "order_id": "order-12345",
  "model": "first_click_with_decay",
  "touchpoints": [
    {
      "timestamp": "2025-01-15T10:00:00Z",
      "source": "google_ads",
      "campaign": "Brand Awareness Q1",
      "ad_set": "High-Intent Keywords",
      "creative": "Problem-Solution Video",
      "gclid": "abc123"
    },
    {
      "timestamp": "2025-01-16T14:30:00Z",
      "source": "meta_ads", 
      "campaign": "Retargeting Warm Audience",
      "ad_set": "Cart Abandoners",
      "creative": "Limited Time Offer",
      "fbclid": "def456"
    }
  ],
  "assigned": {
    "google_ads": 0.7,
    "meta_ads": 0.3
  }
}
        `} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">2. Conversion Value Tracking</h3>
        <p>
          Every conversion is recorded with its actual monetary value, not just as a binary event. This enables true ROI calculation at the campaign level.
        </p>
        <CodeBlock language="json" code={`
{
  "workspace_id": "workspace-abc",
  "user_id": "user-789",
  "order_id": "order-12345",
  "conversion_name": "purchase",
  "amount": 299.99,
  "currency": "USD",
  "ts": "2025-01-16T15:45:00Z",
  "click_ids": {
    "gclid": "abc123",
    "fbclid": "def456"
  },
  "attributes": {
    "product_category": "premium_software",
    "customer_segment": "high_conscientiousness",
    "predicted_ltv": 1200.00
  }
}
        `} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">3. Psychographic Enhancement</h3>
        <p>
          What makes knXw unique is that every conversion is enriched with psychological insights about the customer, enabling you to optimize for <em>quality</em> of conversions, not just quantity.
        </p>
      </DocSection>

      <DocSection title="Implementation Strategy: 4-Phase Revenue Optimization" id="implementation-strategy">
        
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Phase 1: Baseline Revenue Attribution Setup</h3>
        <p>
          Before optimizing for revenue, you must establish accurate revenue attribution. This phase sets up the foundational tracking infrastructure.
        </p>
        
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 1.1: Configure Attribution Workspace</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Navigate to Attribution Settings:</strong> In the left sidebar, click on "Attribution" to open the Attribution Settings page.</li>
            <li><strong>Create or Select Workspace:</strong> In the "Workspaces" card, either select an existing workspace or click "Create New Workspace." Give it a descriptive name like "Main Production Site" and set your timezone.</li>
            <li><strong>Add Platform Secrets:</strong> In the "Ad Platform Secrets" card, enter your:
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>Meta:</strong> Pixel ID and CAPI Access Token</li>
                <li>• <strong>Google:</strong> Ads Customer ID, Developer Token, GA4 Measurement ID, and GA4 API Secret</li>
              </ul>
            </li>
            <li><strong>Authorize Domains:</strong> In the "Authorized Domains" card, add your website's full origin (e.g., "https://www.yoursite.com").</li>
            <li><strong>Generate SDK Snippet:</strong> In the "Attribution SDK Snippet" card, select your workspace and authorized origin, then click "Generate Snippet." Copy and install this code in your website's head section.</li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 1.2: Implement Conversion Tracking</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Set Up Server-Side Conversion Events:</strong> When a user completes a purchase on your website, your server must send a conversion event to knXw. Use this code structure:</li>
          </ol>
          <CodeBlock language="javascript" code={`
// Example: Sending conversion event after purchase
await fetch('https://your-knxw-endpoint/conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workspace_id: 'your-workspace-id',
    user_id: 'user-789',
    order_id: 'order-12345',
    conversion_name: 'purchase',
    amount: 299.99,
    currency: 'USD',
    attributes: {
      product_category: 'software',
      customer_segment: 'enterprise'
    }
  })
});
          `} />
          <p className="text-[#a3a3a3] mt-3">Replace the endpoint and workspace_id with your actual values from the Attribution Settings page.</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 1.3: Enable Ad Platform Feedback</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Verify Feedback is Active:</strong> Go to Dashboard, then click on the "Attribution" metric card to see a detailed view of recent conversions.</li>
            <li><strong>Monitor Ad Platform Logs:</strong> Navigate to Settings, then Advanced, then Attribution Logs to see the status of conversion events being sent to Meta and Google.</li>
            <li><strong>Confirm Platform Reception:</strong> Check your Meta Events Manager and Google Ads Conversion tracking to verify that conversions are being received with correct values.</li>
          </ol>
        </div>

        <Callout type="info" title="Phase 1 Quick Win">
          Even with basic setup, you'll immediately see more accurate attribution than platform-native tracking. knXw captures cross-platform journeys that individual ad platforms miss, providing up to 30% more conversion visibility.
        </Callout>

        <h3 className="text-2xl font-semibold text-white mt-8 mb-3">Phase 2: Customer Value Segmentation</h3>
        <p>
          Now that you have accurate attribution, identify which psychological segments drive the highest customer value.
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 2.1: Identify High-Value Psychological Profiles</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Navigate to Batch Analytics:</strong> Click "Batch Analytics" in the left sidebar.</li>
            <li><strong>Run Value-Correlation Analysis:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Select "Cohort Analysis" from the analysis type dropdown.</li>
                <li>• Set time window to 30 days minimum for statistical significance.</li>
                <li>• Enable "Include Revenue Data" checkbox.</li>
                <li>• Enable "Psychographic Factors" checkbox.</li>
                <li>• Click "Run Analysis".</li>
              </ul>
            </li>
            <li><strong>Interpret Results:</strong> The analysis will show you which psychological traits correlate with higher customer lifetime value. Look for patterns like:
              <ul className="ml-4 mt-2 space-y-1">
                <li>• High conscientiousness + achievement motivation = Higher average order value</li>
                <li>• Security motivation + systematic cognitive style = Lower churn rate</li>
                <li>• Creative cognitive style + openness = Higher referral rates</li>
              </ul>
            </li>
            <li><strong>Document Your Segments:</strong> Create names for your top 3-5 psychological segments (e.g., "The Analyzers," "The Innovators," "The Security-Conscious").</li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 2.2: Create Value-Based Lookalike Audiences</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Export High-Value Segment Data:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to User Profiles page.</li>
                <li>• Use the filter panel to select users matching your high-value psychological profile (e.g., conscientiousness greater than 0.7 AND achievement motivation).</li>
                <li>• Click the "Export" button to download user emails/IDs.</li>
              </ul>
            </li>
            <li><strong>Upload to Ad Platforms:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>Meta:</strong> Go to Ads Manager, then Audiences, then Create Audience, then Custom Audience, then Customer List. Upload your exported file.</li>
                <li>• <strong>Google:</strong> Go to Google Ads, then Audiences, then Create Audience, then Customer Match. Upload your exported file.</li>
              </ul>
            </li>
            <li><strong>Create Lookalike/Similar Audiences:</strong> Once your custom audiences are processed, create lookalike (Meta) or similar (Google) audiences based on these high-value psychological segments.</li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 2.3: Implement Conversion Value Modifiers</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Modify Conversion Event Code:</strong> Update your server-side conversion tracking to include psychological profile data and value modifiers:</li>
          </ol>
          <CodeBlock language="javascript" code={`
// Enhanced conversion tracking with psychology-based value
const userProfile = await getUserPsychographicProfile(userId);
const baseValue = 299.99;

// Apply value multiplier based on psychological profile
let adjustedValue = baseValue;
if (userProfile.personality_traits?.conscientiousness > 0.7) {
  adjustedValue *= 1.5; // High-conscientiousness users have 50% higher LTV
}
if (userProfile.motivation_stack?.includes('achievement')) {
  adjustedValue *= 1.3; // Achievement-motivated users upgrade more often
}

await sendConversionEvent({
  workspace_id: 'your-workspace-id',
  user_id: userId,
  order_id: orderId,
  amount: adjustedValue, // Send adjusted value to ad platforms
  attributes: {
    psychological_segment: determineSegment(userProfile),
    predicted_ltv: calculatePredictedLTV(userProfile),
    original_amount: baseValue
  }
});
          `} />
          <p className="text-[#a3a3a3] mt-3">This tells ad platforms that certain psychological profiles are more valuable, improving their optimization algorithms.</p>
        </div>

        <h3 className="text-2xl font-semibold text-white mt-8 mb-3">Phase 3: Profit-Optimized Campaign Structure</h3>
        <p>
          Restructure your ad campaigns around psychological segments and profit margins, not just demographics.
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 3.1: Create Segment-Specific Campaigns</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Design Campaign Architecture:</strong> Instead of broad demographic campaigns, create separate campaigns for each psychological segment:
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Campaign 1: "The Analyzers" (High conscientiousness + analytical cognitive style)</li>
                <li>• Campaign 2: "The Innovators" (High openness + creativity motivation)</li>
                <li>• Campaign 3: "The Security-Conscious" (Security motivation + conservative risk profile)</li>
              </ul>
            </li>
            <li><strong>Create Tailored Ad Creative for Each Segment:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>For Analyzers:</strong> Feature-rich ads, comparison tables, ROI calculators</li>
                <li>• <strong>For Innovators:</strong> Creative visuals, "first-to-market" messaging, behind-the-scenes content</li>
                <li>• <strong>For Security-Conscious:</strong> Trust badges, testimonials, guarantee-focused messaging</li>
              </ul>
            </li>
            <li><strong>Set Up Audience Targeting:</strong> Use the custom audiences and lookalikes you created in Phase 2 to target each campaign to its respective psychological segment.</li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 3.2: Implement Profit-Margin Bidding</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Calculate Segment Profit Margins:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Batch Analytics, select "Revenue Analysis", then filter by psychological segment.</li>
                <li>• Calculate average profit margin for each segment (Revenue - COGS - Acquisition Cost).</li>
              </ul>
            </li>
            <li><strong>Set Bid Adjustments by Segment:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>High-margin segments:</strong> Increase bids by 20-50%.</li>
                <li>• <strong>Medium-margin segments:</strong> Keep baseline bidding.</li>
                <li>• <strong>Low-margin segments:</strong> Decrease bids or pause until optimization improves margins.</li>
              </ul>
            </li>
            <li><strong>Monitor Profit per Acquisition:</strong> Use knXw's Dashboard to track actual profit per acquisition by campaign, not just cost per conversion.</li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 3.3: Enable Dynamic Budget Allocation</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Set Up Performance Monitoring:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Create a daily review process using knXw Dashboard.</li>
                <li>• Monitor "Revenue per Campaign" and "Profit Margin by Segment" metrics.</li>
                <li>• Set up alerts for campaigns performing above or below profit thresholds.</li>
              </ul>
            </li>
            <li><strong>Implement Budget Reallocation Rules:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Increase budget by 20% daily for campaigns exceeding target ROAS.</li>
                <li>• Decrease budget by 15% for campaigns below minimum profit margin.</li>
                <li>• Pause campaigns with negative profit margin for 48+ hours.</li>
              </ul>
            </li>
            <li><strong>Use knXw Insights for Budget Decisions:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to AI Insights page daily.</li>
                <li>• Look for insights about segment performance and budget optimization recommendations.</li>
                <li>• Implement suggested budget shifts within 24 hours of insight generation.</li>
              </ul>
            </li>
          </ol>
        </div>

        <h3 className="text-2xl font-semibold text-white mt-8 mb-3">Phase 4: Predictive Revenue Optimization</h3>
        <p>
          Leverage knXw's AI agents and predictive capabilities for automated, revenue-focused optimization.
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 4.1: Implement Predictive LTV Bidding</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Enable LTV Prediction Model:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Settings, then Advanced Features.</li>
                <li>• Enable "Predictive Customer Lifetime Value" toggle.</li>
                <li>• Allow 7-14 days for the model to train on your historical data.</li>
              </ul>
            </li>
            <li><strong>Update Conversion Value Strategy:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Modify your conversion tracking code to send predicted LTV instead of transaction value.</li>
                <li>• Use the <code>predicted_ltv</code> field from user psychographic profiles.</li>
                <li>• This tells ad platforms the true long-term value of each conversion.</li>
              </ul>
            </li>
            <li><strong>Set LTV-Based Bidding Strategies:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>High predicted LTV (over $1000):</strong> Aggressive bidding, premium placements.</li>
                <li>• <strong>Medium predicted LTV ($300-$1000):</strong> Standard bidding with slight premium.</li>
                <li>• <strong>Low predicted LTV (under $300):</strong> Conservative bidding, focus on volume.</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 4.2: Enable Automated Creative Testing</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Set Up AI Agent for Creative Optimization:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Agents page in knXw.</li>
                <li>• Activate the "A/B Test Optimization" agent.</li>
                <li>• Configure it to focus on "Revenue per Creative" rather than click-through rate.</li>
              </ul>
            </li>
            <li><strong>Define Creative Testing Framework:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Upload 3-5 ad creative variations for each psychological segment.</li>
                <li>• Set minimum spend threshold ($500) and significance level (95%) for each test.</li>
                <li>• Configure the agent to auto-pause low-performing creatives and scale winners.</li>
              </ul>
            </li>
            <li><strong>Monitor Automated Decisions:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Review agent activity log weekly in the Agents page.</li>
                <li>• Verify that creative decisions align with revenue goals, not just engagement.</li>
                <li>• Adjust agent parameters if needed based on business priorities.</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 4.3: Enable Real-Time Budget Optimization</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Activate Self-Optimizing Budget Agent:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Agents, then activate "Self-Optimizing Engagement Architect".</li>
                <li>• Configure it for "Revenue Optimization" mode.</li>
                <li>• Set maximum daily budget adjustment limit (e.g., ±30%).</li>
                <li>• Define minimum performance thresholds before budget changes occur.</li>
              </ul>
            </li>
            <li><strong>Configure Real-Time Triggers:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Set up triggers for budget increases: ROAS greater than 4.0, profit margin greater than 25%.</li>
                <li>• Set up triggers for budget decreases: ROAS less than 2.0, profit margin less than 10%.</li>
                <li>• Configure emergency stop: pause campaigns if ROAS is less than 1.5 for 6+ hours.</li>
              </ul>
            </li>
            <li><strong>Monitor and Refine:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Review agent decisions daily in the first week, then weekly thereafter.</li>
                <li>• Track overall profit improvement compared to manual optimization.</li>
                <li>• Adjust agent sensitivity based on campaign performance and business goals.</li>
              </ul>
            </li>
          </ol>
        </div>
      </DocSection>

      <DocSection title="Measuring Success: Key Revenue Metrics" id="success-metrics">
        <p>
          Track these critical metrics within knXw to ensure your revenue-first optimization is working:
        </p>
        
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Essential Dashboard Metrics</h4>
          <ul className="space-y-2 text-[#a3a3a3]">
            <li><strong>True ROAS (Return on Ad Spend):</strong> Found in Dashboard, then "Attribution Overview" card. This uses knXw's cross-platform attribution, not platform-native reporting.</li>
            <li><strong>Customer Acquisition Cost by Psychological Segment:</strong> Available in Batch Analytics, then "Segment Performance" report.</li>
            <li><strong>Predicted LTV Accuracy:</strong> Go to Settings, then Advanced Features, then "LTV Model Performance" to see prediction vs. actual LTV correlation.</li>
            <li><strong>Incremental Revenue:</strong> Compare periods with knXw optimization vs. without using Dashboard, then "Revenue Trends" with date range filters.</li>
            <li><strong>Quality Score Trends:</strong> Track in User Profiles, then "Segment Quality" view to see if you're attracting higher-quality customers over time.</li>
          </ul>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Advanced Performance Analysis</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Weekly Performance Review Process:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Monday: Review Dashboard for weekend performance anomalies.</li>
                <li>• Wednesday: Run Batch Analytics "Segment Performance" analysis.</li>
                <li>• Friday: Check AI Insights for optimization recommendations.</li>
                <li>• Weekly: Export performance report for stakeholder review.</li>
              </ul>
            </li>
            <li><strong>Monthly Strategic Assessment:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Compare month-over-month improvement in key metrics.</li>
                <li>• Analyze shift in customer quality scores.</li>
                <li>• Review and adjust psychological segment definitions based on performance.</li>
                <li>• Plan creative testing roadmap for next month.</li>
              </ul>
            </li>
          </ol>
        </div>

        <Callout type="success" title="Expected Results with Full Implementation">
          Companies implementing knXw's complete revenue-first optimization typically see:
          <ul className="list-disc list-inside mt-2">
            <li><strong>25-40% improvement in true ROAS</strong> within 60 days</li>
            <li><strong>30-50% reduction in customer acquisition cost</strong> for high-value segments</li>
            <li><strong>20-35% increase in average customer lifetime value</strong></li>
            <li><strong>15-25% improvement in overall marketing efficiency</strong></li>
            <li><strong>40-60% better prediction accuracy</strong> for customer value vs. traditional demographic targeting</li>
          </ul>
        </Callout>
      </DocSection>
    </div>
  );
}