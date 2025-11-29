import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function ExecutiveDashboardDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        <span className="gradient-text gradient-fast">Executive Dashboard</span>
        <span className="text-[#a3a3a3]">: Board-Ready Psychographic Insights</span>
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        Transform complex psychographic data into clear, actionable insights for leadership. 
        The Executive Dashboard surfaces high-impact metrics, automated reports, and strategic recommendations.
      </p>

      <Section title="Dashboard Overview">
        <p className="text-[#cbd5e1] mb-4">
          The Executive Dashboard provides a single view of your organization's psychographic intelligence:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>User Psychology Overview:</strong> Total active profiles and psychological distribution</li>
          <li><strong>Motivation Segmentation:</strong> Breakdown by primary motivational drivers</li>
          <li><strong>Conversion by Psychology:</strong> Revenue and conversion rates segmented by psychological traits</li>
          <li><strong>AI Insights:</strong> Top 5 automatically generated strategic recommendations</li>
          <li><strong>Churn Risk Analysis:</strong> Users at high risk based on psychological state changes</li>
          <li><strong>Trends Over Time:</strong> Conversions and engagement segmented by psychographic profiles</li>
          <li><strong>Journey Performance:</strong> Success rates of automated user journeys</li>
          <li><strong>Engagement Effectiveness:</strong> ROI of personalized campaigns vs. generic messaging</li>
        </ul>
      </Section>

      <Section title="Key Metrics">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Psychographic Coverage</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Percentage of users with complete psychological profiles and confidence scores.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Profile completeness by segment</li>
              <li>• Confidence score distribution</li>
              <li>• Data quality trends</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Personalization Impact</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Lift in key metrics from psychographic personalization vs. baseline.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Conversion rate improvement</li>
              <li>• Engagement lift by segment</li>
              <li>• Revenue per user impact</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Segment Performance</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Which psychological segments drive the most value for your business.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• LTV by personality type</li>
              <li>• Churn rates by risk profile</li>
              <li>• Feature adoption patterns</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">AI Agent Performance</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Effectiveness of automated AI agents and journey orchestration.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Journey completion rates</li>
              <li>• Agent optimization impact</li>
              <li>• Automated vs. manual results</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Automated Reporting">
        <p className="text-[#cbd5e1] mb-4">
          Schedule comprehensive reports delivered automatically to leadership:
        </p>

        <div className="mb-6">
          <h3 className="text-white font-bold mb-2">Weekly Executive Summary</h3>
          <ul className="list-disc ml-6 text-[#cbd5e1] space-y-1">
            <li>Top 3 psychographic insights driving business impact</li>
            <li>Segment performance changes from previous week</li>
            <li>Journey optimization recommendations</li>
            <li>Churn risk alerts and proactive measures taken</li>
            <li>ROI summary of psychographic personalization</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-white font-bold mb-2">Monthly Strategic Report</h3>
          <ul className="list-disc ml-6 text-[#cbd5e1] space-y-1">
            <li>Psychological profile evolution of user base</li>
            <li>Long-term trend analysis and predictions</li>
            <li>Competitive positioning opportunities</li>
            <li>Product development recommendations based on user psychology</li>
            <li>Market expansion opportunities by psychological segments</li>
          </ul>
        </div>

        <CodeBlock language="javascript">
{`// Configure automated reporting
const reportConfig = {
  frequency: "weekly",
  day_of_week: 1, // Monday
  hour_utc: 9,
  format: "pdf",
  destination_type: "email",
  email_to: "leadership@company.com",
  filters: {
    date_range: "last_7_days",
    include_segments: ["high-value", "at-risk"],
    confidence_threshold: 0.7
  }
};`}
        </CodeBlock>
      </Section>

      <Section title="Batch Analytics">
        <p className="text-[#cbd5e1] mb-4">
          Run deep analytical reports on your entire user base:
        </p>
        
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Full Segmentation Analysis:</strong> Comprehensive clustering of all users by psychological traits</li>
          <li><strong>Cohort Psychology:</strong> How psychological profiles differ across user cohorts</li>
          <li><strong>Journey Optimization:</strong> Statistical analysis of which journey paths work best for each segment</li>
          <li><strong>Predictive Modeling:</strong> ML models predicting future behavior based on psychological changes</li>
          <li><strong>Cross-Platform Analysis:</strong> User psychology consistency across different touchpoints</li>
        </ul>

        <Callout type="info">
          <p>
            Batch analytics jobs can be resource-intensive. Schedule them during off-peak hours for optimal performance.
          </p>
        </Callout>
      </Section>

      <Section title="Export & Integration">
        <p className="text-[#cbd5e1] mb-4">
          Export reports to multiple destinations and formats:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">Email Delivery</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Automatically send formatted reports to stakeholders.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Executive summary in email body</li>
              <li>• Full PDF report attachment</li>
              <li>• CSV data for further analysis</li>
            </ul>
          </div>
          
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h3 className="text-white font-bold mb-2">S3 Export</h3>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Store reports in your AWS S3 bucket for integration with other systems.
            </p>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Configurable folder structure</li>
              <li>• Multiple format support</li>
              <li>• Automated versioning</li>
            </ul>
          </div>
        </div>

        <CodeBlock language="javascript">
{`// Export report to S3
const s3Export = {
  destination_type: "s3",
  s3_bucket: "company-analytics",
  s3_key_prefix: "reports/executive/",
  format: "both", // PDF and CSV
  include_raw_data: true
};`}
        </CodeBlock>
      </Section>

      <Section title="AI-Generated Insights">
        <p className="text-[#cbd5e1] mb-4">
          The Executive Dashboard includes AI-generated strategic insights:
        </p>
        
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Opportunity Detection:</strong> Automated identification of underserved psychological segments</li>
          <li><strong>Risk Assessment:</strong> Early warning system for segments showing declining engagement</li>
          <li><strong>Optimization Recommendations:</strong> Specific actions to improve conversion for each segment</li>
          <li><strong>Market Intelligence:</strong> Insights into psychological trends that could affect business strategy</li>
          <li><strong>Product Recommendations:</strong> Features or improvements that would resonate with your user psychology</li>
        </ul>

        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333] mt-4">
          <h3 className="text-white font-bold mb-2">Example AI Insight</h3>
          <p className="text-[#a3a3a3] text-sm">
            "Users with high conscientiousness scores show 34% higher conversion rates when presented with detailed feature comparisons rather than benefit-focused messaging. 
            Consider A/B testing analytical content for the 23% of your user base that exhibits this trait."
          </p>
        </div>
      </Section>

      <Section title="Setup & Configuration">
        <ol className="list-decimal ml-6 text-[#cbd5e1] space-y-2">
          <li>Ensure psychographic profiles and conversion events are flowing from your SDK integration</li>
          <li>Configure your AWS credentials if using S3 export (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)</li>
          <li>Set up email recipients for automated report delivery</li>
          <li>Choose reporting frequency and time zone for your organization</li>
          <li>Select the metrics and segments most relevant to your business goals</li>
          <li>Test report generation and delivery to ensure everything works correctly</li>
        </ol>

        <Callout type="tip">
          <p>
            Start with weekly reports to establish baseline metrics, then adjust frequency and content based on stakeholder feedback.
          </p>
        </Callout>
      </Section>
    </div>
  );
}