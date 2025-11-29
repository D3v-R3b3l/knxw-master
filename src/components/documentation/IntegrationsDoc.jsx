import React from "react";
import { PlugZap, Megaphone, BarChart3, Database, Cloud, CloudCog, GitBranch, MessageSquare, DollarSign, Shield, Zap, Brain, MousePointer, Sparkles, Target, TrendingUp } from "lucide-react";

// Helper Component for Section
const Section = ({ title, icon: Icon, children }) => (
  <section className="space-y-6">
    <header className="space-y-2">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-[#00d4ff]" />}
        {title}
      </h2>
    </header>
    {children}
  </section>
);

// Helper Component for SubSection
const SubSection = ({ title, icon: Icon, children }) => (
  <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-4">
    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-4 h-4 text-[#0ea5e9]" />}
      {title}
    </h3>
    {children}
  </div>
);

// Helper Component for CodeBlock
const CodeBlock = ({ language, title, children }) => (
  <div className="bg-[#050505] rounded-lg border border-[#262626] overflow-hidden">
    <div className="bg-[#0c0c0c] border-b border-[#262626] p-3 text-sm text-[#a3a3a3] flex justify-between items-center">
      <span>{title}</span>
      <span className="text-[0.65rem] uppercase opacity-75">{language}</span>
    </div>
    <pre className="p-4 text-xs overflow-x-auto text-[#e0e0e0]">
      <code className={`language-${language}`}>{children}</code>
    </pre>
  </div>
);

// Helper Component for Callout
const Callout = ({ type, children }) => {
  let bgColor, borderColor, textColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-900/20';
      borderColor = 'border-green-600/50';
      textColor = 'text-green-300';
      break;
    case 'info':
      bgColor = 'bg-blue-900/20';
      borderColor = 'border-blue-600/50';
      textColor = 'text-blue-300';
      break;
    default:
      bgColor = 'bg-gray-800/20';
      borderColor = 'border-gray-600/50';
      textColor = 'text-gray-300';
  }
  return (
    <div className={`${bgColor} ${borderColor} ${textColor} p-4 rounded-md text-sm border`}>
      {children}
    </div>
  );
};


export default function IntegrationsDoc() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PlugZap className="w-5 h-5 text-[#00d4ff]" />
          Integrations Overview
        </h2>
        <p className="text-[#a3a3a3]">
          This page lists every integration available in knXw with what it's for, prerequisites, and where to go next.
          Use it as your single source of truth.
        </p>
      </header>

      <Section title="Advanced Intelligence Integrations" icon={Brain}>
        <p className="text-[#a3a3a3] mb-6">
          knXw's advanced intelligence capabilities provide unprecedented insights into market psychology, content optimization, and customer feedback analysis.
        </p>

        <SubSection title="Market Intelligence (Pro Tier)" icon={TrendingUp}>
          <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-lg p-4 mb-6">
            <p className="text-[#a3a3a3]">
              <strong className="text-[#8b5cf6]">Pro Tier Feature:</strong> Analyze competitor messaging and market trends through a psychographic lens to understand what psychological triggers drive your industry.
            </p>
          </div>
          
          <CodeBlock language="javascript" title="Analyze Market Trends">
            {`// Analyze news and competitor content for psychological patterns
const { analyzeMarketTrends } = require('./functions/analyzeMarketTrends');

// Analyze industry news and trends
const marketAnalysis = await analyzeMarketTrends({
  keywords: ['SaaS analytics', 'customer psychology', 'behavioral data'],
  sources: ['news'],
  competitor_urls: [
    'https://competitor1.com/blog/latest-post',
    'https://competitor2.com/about'
  ]
});

console.log('Market trends analyzed:', marketAnalysis.trends_analyzed);

// Each trend includes:
// - Psychographic analysis (motivations, cognitive styles, emotional triggers)
// - Competitor psychological positioning
// - Market opportunity insights
marketAnalysis.trends.forEach(trend => {
  console.log(\`\${trend.title}:\`);
  console.log('Primary motivations:', trend.psychographic_analysis.primary_motivations);
  console.log('Cognitive appeal:', trend.psychographic_analysis.cognitive_style_appeal);
  console.log('Psychological insights:', trend.psychographic_analysis.psychological_insights);
});`}
          </CodeBlock>

          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Use Cases:</h4>
            <ul className="space-y-2 text-[#a3a3a3]">
              <li className="flex items-start gap-2">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span><strong>Competitive Intelligence:</strong> Understand the psychological positioning of competitors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span><strong>Trend Detection:</strong> Identify emerging psychological patterns in your market</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span><strong>Strategic Messaging:</strong> Craft messaging that taps into current market psychology</span>
              </li>
            </ul>
          </div>
        </SubSection>

        <SubSection title="Psychographic Content Engine (Growth Tier+)" icon={Target}>
          <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-lg p-4 mb-6">
            <p className="text-[#a3a3a3]">
              <strong className="text-[#10b981]">Growth Tier Feature:</strong> Automatically recommend the most relevant content and features to users based on their unique psychological profile.
            </p>
          </div>

          <CodeBlock language="javascript" title="Generate Content Recommendations">
            {`// Generate personalized content recommendations
const { generateContentRecommendations } = require('./functions/generateContentRecommendations');

// Generate recommendations for a specific user
const recommendations = await generateContentRecommendations({
  user_id: 'user_12345',
  refresh: false // Set to true to regenerate existing recommendations
});

console.log('Recommendations generated:', recommendations.recommendations.length);

// Each recommendation includes:
recommendations.recommendations.forEach(recommendation => {
  console.log(\`\${recommendation.content_title}:\`);
  console.log('Score:', recommendation.recommendation_score);
  console.log('Motivation alignment:', recommendation.psychographic_match.motivation_alignment);
  console.log('Cognitive match:', recommendation.psychographic_match.cognitive_style_match);
  console.log('Reasoning:', recommendation.psychographic_match.match_reasoning);
});

// Track user interactions
const { trackRecommendationInteraction } = require('./functions/trackRecommendationInteraction');

await trackRecommendationInteraction({
  recommendation_id: recommendations.recommendations[0].id,
  interaction_type: 'clicked',
  data: { time_spent: 120 }
});`}
          </CodeBlock>

          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Integration Examples:</h4>
            <ul className="space-y-2 text-[#a3a3a3]">
              <li className="flex items-start gap-2">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span><strong>Documentation:</strong> Guide users to relevant help articles based on their cognitive style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span><strong>Feature Discovery:</strong> Recommend unutilized features that match user motivations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span><strong>Content Strategy:</strong> Optimize content library based on psychological engagement patterns</span>
              </li>
            </ul>
          </div>
        </SubSection>

        <SubSection title="AI Feedback Analysis (Growth Tier+)" icon={MessageSquare}>
          <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-lg p-4 mb-6">
            <p className="text-[#a3a3a3]">
              <strong className="text-[#fbbf24]">Growth Tier Feature:</strong> Transform customer feedback into deep psychological insights, understanding the motivations behind every support ticket and review.
            </p>
          </div>

          <CodeBlock language="javascript" title="Analyze Customer Feedback">
            {`// Analyze customer feedback for psychological insights
const { analyzeFeedback } = require('./functions/analyzeFeedback');

// Analyze a support ticket
const analysis = await analyzeFeedback({
  feedback_text: "This feature is way too complicated. I just want something that works without having to read a manual. Why can't it be more intuitive?",
  user_id: 'user_12345',
  source: 'support_ticket',
  metadata: {
    rating: 2,
    category: 'usability',
    urgency: 'medium'
  }
});

console.log('Analysis completed with confidence:', analysis.analysis.analysis_confidence);

// Psychological insights
const psychAnalysis = analysis.analysis.psychographic_analysis;
console.log('Detected emotions:', psychAnalysis.detected_emotions);
console.log('Cognitive style signals:', psychAnalysis.cognitive_style_signals);
console.log('Psychological needs:', psychAnalysis.psychological_needs);

// Actionable insights
const insights = analysis.analysis.actionable_insights;
console.log('Priority level:', insights.priority_level);
console.log('Recommended response style:', insights.recommended_response_style);
console.log('Suggested solutions:', insights.suggested_solutions);

// Summary for quick action
console.log('Quick summary:', analysis.insights_summary);`}
          </CodeBlock>

          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Feedback Sources Supported:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <ul className="space-y-1 text-[#a3a3a3]">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>
                    Survey responses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>
                    Support tickets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>
                    App store reviews
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-1 text-[#a3a3a3]">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>
                    User interviews
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>
                    Chat transcripts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>
                    Imported text data
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </SubSection>

        <Callout type="success">
          <strong>Pro Tip:</strong> Combine all three intelligence features for maximum impact. Use Market Intelligence to understand industry psychology, Content Engine to personalize user experiences, and Feedback Analysis to continuously improve based on psychological insights.
        </Callout>
      </Section>


      <div className="grid lg:grid-cols-2 gap-4">
        {/* Core (built-in) */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#0ea5e9]" /> Core Integrations (built-in)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>SendEmail: transactional emails from your app.</li>
            <li>UploadFile / UploadPrivateFile + CreateFileSignedUrl: file handling.</li>
            <li>ExtractDataFromUploadedFile: parse CSV/PDF/images for import flows.</li>
            <li>GenerateImage: AI image generation.</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "Core Integrations" subpage for code samples and testing tips.</p>
        </div>

        {/* Meta Pages */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Megaphone className="w-4 h-4 text-[#0ea5e9]" /> Meta Pages (Facebook/Instagram)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Ingest posts/comments and run psychographic analysis.</li>
            <li>Guide creative strategy with motivations, cognitive styles, sentiment.</li>
            <li>Performance: Up to +38% engagement rates improvement*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "Meta Pages" subpage for OAuth, ingestion, analysis, and troubleshooting.</p>
        </div>

        {/* GA4 */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#0ea5e9]" /> Google Analytics (GA4)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Connect GA4, list properties, run reports.</li>
            <li>Correlate traffic and on-site behavior with psychographic traits.</li>
            <li>Performance: Up to +45% attribution accuracy improvement*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "GA4" subpage for scopes, property listing, and report recipes.</p>
        </div>

        {/* Ad Platforms */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-[#0ea5e9]" /> Ad Platforms (Meta CAPI & Google Ads)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Forward conversions with identity/dedup for true ROI optimization.</li>
            <li>Use psychographic segments to drive better bidding and creative.</li>
            <li>Performance: Up to +67% ROAS improvement*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "Ad Platforms" subpage for API calls, dedup, and verification.</p>
        </div>

        {/* Real-Time Engagement */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#0ea5e9]" /> Real-Time Engagement (Automation)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Live psychological trigger detection and response automation.</li>
            <li>Perfect timing delivery when users are most receptive.</li>
            <li>Performance: Up to +84% conversion rate improvement*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "Engagements" section for rule creation and template setup.</p>
        </div>

        {/* Hyper-Personalization */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-[#0ea5e9]" /> Hyper-Personalization Engine (AI)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Generate thousands of personalized content variants automatically.</li>
            <li>Match cognitive styles and motivational drivers individually.</li>
            <li>Performance: Up to +156% engagement boost*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">Advanced feature requiring Growth plan or higher.</p>
        </div>

        {/* Predictive Intervention */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <MousePointer className="w-4 h-4 text-[#0ea5e9]" /> Predictive Intervention (Behavioral AI)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Predict intent shifts before churn or abandonment occurs.</li>
            <li>Detect micro-signals in behavior patterns for retention.</li>
            <li>Performance: Up to -73% churn reduction*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">Advanced AI feature requiring Pro plan or higher.</p>
        </div>

        {/* Dynamic Journey Optimization */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Dynamic Journey Optimization
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Reshape user journeys in real-time based on profile changes.</li>
            <li>Adapt entire experience to maximize satisfaction.</li>
            <li>Performance: Up to +91% satisfaction improvement*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">Enterprise feature for complex user experience optimization.</p>
        </div>

        {/* Audience Builder */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#0ea5e9]" /> Audience Builder (Advanced Segmentation)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Create precise segments using psychographic traits and behavioral filters.</li>
            <li>Live preview with user count and sample profiles before saving.</li>
            <li>Reusable segments for campaigns and personalization strategies.</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">Built-in feature accessible from main navigation. See "Audience Builder Guide" for filtering strategies.</p>
        </div>

        {/* AWS S3 */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-[#0ea5e9]" /> AWS S3 (exports)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Export reports/backups to your S3 bucket.</li>
            <li>Use signed URLs or private access policies.</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "AWS S3" subpage for IAM and code examples.</p>
        </div>

        {/* Azure Blob */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <CloudCog className="w-4 h-4 text-[#0ea5e9]" /> Azure Blob Storage (exports)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Export JSON/text to containers with private access.</li>
            <li>Serve via time-limited SAS or app APIs.</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "Azure Blob Storage" subpage for connection string and examples.</p>
        </div>

        {/* EventBridge */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-[#0ea5e9]" /> AWS EventBridge (streams)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Stream events to your AWS event bus for pipelines/fan-out.</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "AWS EventBridge" subpage for PutEvents setup and monitoring.</p>
        </div>

        {/* HubSpot */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-[#0ea5e9]" /> HubSpot (CRM sync)
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Sync psychographic properties to Contacts for workflows/segmentation.</li>
            <li>Performance: Up to +52% close rates improvement*</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">See: "HubSpot" subpage for property mapping and batch sync.</p>
        </div>

        {/* Stripe */}
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#0ea5e9]" /> Stripe (billing & subscriptions) — Optional
          </h3>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Create Checkout sessions for plans or one‑time payments.</li>
            <li>Handle webhooks to update BillingSubscription and User plan fields.</li>
          </ul>
          <p className="text-xs text-[#6b7280] mt-2">
            Included because this app supports subscription billing. Not required for psychographic analytics.
            See: "Stripe" subpage for setup and testing.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
        <h4 className="text-white font-semibold mb-2">Quality Checklist (before going live)</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Secrets set for each integration (see subpage prerequisites).</li>
          <li>OAuth tested in a non‑prod workspace; tokens rotate successfully.</li>
          <li>RLS verified on all imported/ingested entities.</li>
          <li>Conversion dedup working (server + client event_id aligned).</li>
          <li>Export destinations (S3/Azure) validated with permissions and CORS.</li>
          <li>Performance disclaimers acknowledged and Terms accepted during onboarding.</li>
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-[#111111]/50 border border-[#262626]">
        <p className="text-xs text-[#6b7280]">
          <strong>*Performance Disclaimer:</strong> All percentage improvements shown are estimates based on limited case studies.
          Individual results may vary significantly. Success depends on implementation quality, data accuracy, and numerous other factors.
          See Terms of Service for complete disclaimers.
        </p>
      </div>
    </section>
  );
}