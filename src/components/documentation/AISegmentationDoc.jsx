import React from 'react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function AISegmentationDoc() {
  return (
    <div className="space-y-8">
      <Section title="AI-Powered Segmentation" id="ai-segmentation">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          knXw AI Segmentation automatically analyzes your user base to identify high-value audience segments based on psychographic profiles and behavioral patterns. Go beyond demographics to create segments that reflect how users think, feel, and make decisions.
        </p>

        <Callout type="info" className="mb-6">
          <strong>Why Psychographic Segmentation?</strong>
          <ul className="mt-2 space-y-1">
            <li>• <strong>Higher Conversion:</strong> Message people based on their motivations, not just their age</li>
            <li>• <strong>Better Retention:</strong> Identify at-risk users before they churn</li>
            <li>• <strong>Precise Targeting:</strong> Find your ideal customers based on psychological fit</li>
            <li>• <strong>Personalized Experiences:</strong> Tailor UX to cognitive styles and risk profiles</li>
          </ul>
        </Callout>
      </Section>

      <Section title="Pre-built Segments" id="prebuilt-segments">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Start with these proven, research-backed segments that work across industries:
        </p>

        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-[#00d4ff]/30 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#00d4ff] mb-3">🚀 High Engagement Champions</h3>
            <p className="text-sm text-[#a3a3a3] mb-3">
              Power users showing consistent high engagement and positive emotional states
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Characteristics:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• 10+ clicks in last 7 days</li>
                  <li>• Positive/excited/confident mood</li>
                  <li>• High openness (above 0.6)</li>
                  <li>• Achievement or mastery motivation</li>
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Use Cases:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• Beta feature testing</li>
                  <li>• Testimonial requests</li>
                  <li>• Referral program invitations</li>
                  <li>• Advanced feature upsells</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#ef4444]/30 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#ef4444] mb-3">⚠️ At Risk of Churning</h3>
            <p className="text-sm text-[#a3a3a3] mb-3">
              Users showing declining engagement and negative psychological signals
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Characteristics:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• Less than 5 page views in 14 days</li>
                  <li>• Negative/anxious/uncertain mood</li>
                  <li>• High staleness score (above 0.6)</li>
                  <li>• No recent conversions</li>
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Interventions:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• Personalized re-engagement emails</li>
                  <li>• Targeted discounts or offers</li>
                  <li>• Support check-ins</li>
                  <li>• Feature education campaigns</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#ec4899]/30 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#ec4899] mb-3">💖 Potential Advocates</h3>
            <p className="text-sm text-[#a3a3a3] mb-3">
              Satisfied users with high social motivation who are likely to recommend you
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Characteristics:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• 100+ events in 30 days</li>
                  <li>• High agreeableness (above 0.65)</li>
                  <li>• High extraversion (above 0.6)</li>
                  <li>• Social connection motivation</li>
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Opportunities:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• Request product reviews</li>
                  <li>• Referral program enrollment</li>
                  <li>• Case study participation</li>
                  <li>• Community leadership roles</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#00d4ff]/30 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#00d4ff] mb-3">🌱 New User Onboarding</h3>
            <p className="text-sm text-[#a3a3a3] mb-3">
              Recently joined users who need guidance and education
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Characteristics:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• First event within 7 days</li>
                  <li>• Low overall engagement</li>
                  <li>• Learning/exploration motivation</li>
                  <li>• Uncertain emotional state</li>
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Actions:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• Onboarding email sequences</li>
                  <li>• Interactive product tours</li>
                  <li>• Educational content delivery</li>
                  <li>• First-success celebrations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#8b5cf6]/30 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#8b5cf6] mb-3">⚡ Power Users</h3>
            <p className="text-sm text-[#a3a3a3] mb-3">
              Advanced users who maximize feature usage and have high technical aptitude
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Characteristics:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• 200+ clicks in 30 days</li>
                  <li>• High conscientiousness (above 0.7)</li>
                  <li>• Analytical cognitive style</li>
                  <li>• Mastery motivation</li>
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white mb-2">Engagement:</h5>
                <ul className="text-xs text-[#a3a3a3] space-y-1">
                  <li>• Beta feature access</li>
                  <li>• Advanced tutorials and guides</li>
                  <li>• Product feedback requests</li>
                  <li>• API/developer resources</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="AI-Discovered Segments" id="ai-discovered">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Beyond pre-built segments, knXw AI can analyze your specific user base to discover custom segment opportunities unique to your product.
        </p>

        <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-[#e5e5e5] mb-6">
          <li>Navigate to Audience Builder → AI Suggestions tab</li>
          <li>Click Generate Custom Segments</li>
          <li>AI analyzes your user psychographic profiles</li>
          <li>Receives 2-3 custom segment suggestions with:
            <ul className="ml-6 mt-1 space-y-1 text-sm text-[#a3a3a3]">
              <li>- Segment name and description</li>
              <li>- Key psychological characteristics</li>
              <li>- Estimated segment size</li>
              <li>- Recommended actions for each segment</li>
            </ul>
          </li>
          <li>Review suggestions and apply to build filters automatically</li>
        </ol>

        <Callout type="success" className="mb-6">
          <strong>Example AI-Discovered Segment:</strong> Feature-Curious Explorers - Users with high openness who frequently try new features but have low conversion. Recommended action: Guide them to core value features with tutorials.
        </Callout>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Segment Quality Indicators</h3>
        <p className="text-[#e5e5e5] mb-3">
          AI-suggested segments include quality metrics:
        </p>
        <ul className="space-y-2 text-[#e5e5e5]">
          <li>• <strong>Estimated Size:</strong> Predicted percent of your user base in this segment</li>
          <li>• <strong>Distinctiveness:</strong> How different this segment is from others</li>
          <li>• <strong>Actionability:</strong> Clear recommended actions for engagement</li>
          <li>• <strong>Stability:</strong> Likelihood segment membership remains consistent</li>
        </ul>
      </Section>

      <Section title="Using Segments" id="using-segments">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Once created, segments can be used across knXw for targeted experiences:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Engagement Rules</h4>
            <p className="text-sm text-[#a3a3a3]">
              Trigger different check-ins, tooltips, or modals for specific segments
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">A/B Tests</h4>
            <p className="text-sm text-[#a3a3a3]">
              Run experiments on specific segments to optimize messaging
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Journeys</h4>
            <p className="text-sm text-[#a3a3a3]">
              Create automated workflows tailored to segment needs
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Content Recommendations</h4>
            <p className="text-sm text-[#a3a3a3]">
              Show different content to different psychological profiles
            </p>
          </div>
        </div>
      </Section>

      <Section title="API Access" id="api-access">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Apply segments programmatically via the Audience API:
        </p>

        <CodeBlock language="javascript">
{`import { base44 } from '@/api/base44Client';

// List all segments
const segments = await base44.entities.AudienceSegment.filter(
  { status: 'active' },
  '-created_date'
);

// Get users in a segment
const { data } = await base44.functions.invoke('applyAudienceSegment', {
  segment_id: 'segment_123',
  preview: false
});

// Create custom segment
const newSegment = await base44.entities.AudienceSegment.create({
  name: 'My Custom Segment',
  description: 'Users with specific traits',
  filter_conditions: {
    operator: 'AND',
    conditions: [
      {
        type: 'trait',
        field: 'personality_traits.openness',
        operator: 'greater_than',
        value: 0.7
      },
      {
        type: 'motive',
        field: 'motivation_labels',
        operator: 'contains',
        value: 'learning'
      }
    ]
  }
});`}
        </CodeBlock>
      </Section>

      <Section title="Best Practices" id="best-practices">
        <div className="space-y-4">
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4">
            <h4 className="font-semibold text-[#10b981] mb-2">✅ Effective Segmentation</h4>
            <ul className="text-sm text-[#e5e5e5] space-y-1 list-disc list-inside">
              <li>Combine behavioral and psychographic conditions for precision</li>
              <li>Keep segments between 5-20 percent of your user base for actionability</li>
              <li>Refresh segment calculations weekly to account for user evolution</li>
              <li>Test messaging on segments before rolling out broadly</li>
              <li>Document segment purpose and recommended actions</li>
            </ul>
          </div>

          <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-4">
            <h4 className="font-semibold text-[#fbbf24] mb-2">⚡ Common Pitfalls</h4>
            <ul className="text-sm text-[#e5e5e5] space-y-1 list-disc list-inside">
              <li>Creating too many overlapping segments (causes confusion)</li>
              <li>Segments that are too small (under 2 percent of users lack statistical power)</li>
              <li>Over-targeting segments (fatigue from too many messages)</li>
              <li>Ignoring segment drift over time (user psychology evolves)</li>
              <li>Not A/B testing segment-specific messaging</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}