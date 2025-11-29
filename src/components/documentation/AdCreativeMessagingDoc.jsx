import React from 'react';
import DocSection from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function AdCreativeMessagingDoc() {
  return (
    <div>
      <DocSection title="Ad Creative & Messaging Strategy: Psychology-Driven Performance" id="creative-messaging-intro">
        <p>
          The difference between ad creative that converts and ad creative that wastes budget lies in psychological alignment. knXw enables you to craft messages, visuals, and calls-to-action that resonate with users' deepest psychological drivers, creating an emotional and rational connection that compels action.
        </p>
        <Callout type="strategy" title="The Creative Psychology Advantage">
          Traditional A/B testing compares random variations. knXw's approach tests <strong>psychologically-informed hypotheses</strong>, leading to faster optimization and dramatically better results.
        </Callout>
        <p>
          This guide teaches you to leverage knXw's psychological insights to create ad creatives that don't just grab attention—they drive conversions by speaking directly to users' psychological needs and preferences.
        </p>
      </DocSection>

      <DocSection title="The Psychology-First Creative Framework" id="creative-framework">
        <p>
          Every effective ad creative built with knXw follows a five-layer psychological framework:
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Layer 1: Motivation Alignment</h3>
        <p>
          Your headline and primary message must immediately connect with the user's core motivation stack.
        </p>
        <CodeBlock language="json" code={`
// Example: Crafting headlines by motivation
const motivationHeadlines = {
  "achievement": "Boost Your Performance by 40%",
  "security": "Bank-Grade Security for Your Data",
  "social_connection": "Join 50,000+ Happy Customers",
  "creativity": "Unleash Your Creative Potential",
  "autonomy": "Take Complete Control of Your Workflow"
}
        `} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Layer 2: Emotional State Targeting</h3>
        <p>
          Adjust your tone and approach based on the user's current emotional state.
        </p>
        <ul>
          <li><strong>Confident + High Energy:</strong> Bold, ambitious language ("Transform your business today")</li>
          <li><strong>Anxious + Low Confidence:</strong> Reassuring, supportive tone ("We'll guide you every step of the way")</li>
          <li><strong>Neutral + Medium Energy:</strong> Clear, straightforward benefits ("Save 2 hours daily with automation")</li>
        </ul>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Layer 3: Cognitive Style Adaptation</h3>
        <p>
          Present information in a format that matches how the user prefers to process data.
        </p>
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
            <h4 className="text-white font-semibold mb-2">Analytical Users</h4>
            <ul className="text-sm text-[#a3a3a3]">
              <li>• Feature comparison tables</li>
              <li>• ROI calculators</li>
              <li>• Data-heavy case studies</li>
              <li>• Technical specifications</li>
            </ul>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
            <h4 className="text-white font-semibold mb-2">Intuitive Users</h4>
            <ul className="text-sm text-[#a3a3a3]">
              <li>• Emotional storytelling</li>
              <li>• Visual metaphors</li>
              <li>• Customer success stories</li>
              <li>• Aspirational imagery</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Layer 4: Risk Profile Consideration</h3>
        <p>
          Adjust your offer and proof points based on the user's comfort with risk.
        </p>
        <ul>
          <li><strong>Conservative:</strong> Money-back guarantees, testimonials from established companies, security badges</li>
          <li><strong>Moderate:</strong> Free trials, case studies, balanced feature/benefit presentation</li>
          <li><strong>Aggressive:</strong> Limited-time offers, beta access, cutting-edge positioning</li>
        </ul>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Layer 5: Personality-Based Visual Design</h3>
        <p>
          Even your visual design should align with personality traits for maximum impact.
        </p>
        <CodeBlock language="javascript" code={`
// Visual design guidelines by personality traits
const visualGuidelines = {
  high_conscientiousness: {
    design: "clean, organized, professional",
    colors: "blues, whites, minimal palette",
    layout: "structured grid, clear hierarchy",
    imagery: "business-focused, organized workspaces"
  },
  high_openness: {
    design: "creative, unconventional, artistic",
    colors: "vibrant, diverse palette",
    layout: "dynamic, asymmetrical, surprising elements",
    imagery: "innovative, artistic, unique perspectives"
  },
  high_extraversion: {
    design: "bold, energetic, social",
    colors: "warm, bright colors",
    layout: "dynamic, movement-oriented",
    imagery: "people, groups, collaborative settings"
  }
}
        `} />
      </DocSection>

      <DocSection title="Strategic Creative Development Process" id="creative-development">
        
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 1: Psychological Audience Analysis</h4>
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Identify Your Top Psychological Segments:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Navigate to Batch Analytics → run "Full Segmentation" analysis</li>
                <li>• Look for segments with high conversion rates and clear psychological patterns</li>
                <li>• Document the top 3-5 segments for creative development</li>
              </ul>
            </li>
            <li><strong>Map Psychological Journeys:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Event Stream → filter by each target segment</li>
                <li>• Analyze typical user pathways and interaction patterns</li>
                <li>• Note where users typically drop off or convert</li>
                <li>• Identify emotional trigger points in the journey</li>
              </ul>
            </li>
            <li><strong>Analyze Emotional Triggers:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to AI Insights → filter for "emotional_trigger" type insights</li>
                <li>• Look for patterns in emotional states that correlate with conversions</li>
                <li>• Document which emotional transitions predict higher engagement</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 2: Develop Psychological Creative Concepts</h4>
          <p className="text-[#a3a3a3] mb-3">Instead of random A/B testing, develop creative concepts based on psychological hypotheses:</p>
          
          <Callout type="strategy" title="Example Creative Hypothesis Development">
            <p><strong>Hypothesis:</strong> High-conscientiousness users will respond better to detailed, feature-focused ads because they prefer comprehensive information before making decisions.</p>
            <p><strong>Creative Test:</strong> Version A (detailed features list) vs Version B (emotional benefits) targeted specifically at high-conscientiousness users.</p>
            <p><strong>Measurement:</strong> Conversion rate, time on landing page, feature page engagement.</p>
          </Callout>

          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Define Creative Hypotheses for Each Segment:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>High Conscientiousness:</strong> "Detailed information leads to higher trust and conversion"</li>
                <li>• <strong>High Openness:</strong> "Creative, unconventional messaging resonates more than traditional approaches"</li>
                <li>• <strong>Achievement Motivation:</strong> "Success-focused messaging outperforms feature-focused messaging"</li>
              </ul>
            </li>
            <li><strong>Create Concept Variations:</strong> For each hypothesis, develop 2-3 creative concepts that test the specific psychological element</li>
            <li><strong>Map Concepts to Customer Journey Stage:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>Awareness:</strong> Curiosity-driven concepts</li>
                <li>• <strong>Consideration:</strong> Trust and credibility-focused concepts</li>
                <li>• <strong>Conversion:</strong> Urgency and value-focused concepts</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 3: Execute Multi-Variant Psychological Testing</h4>
          
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 my-4">
            <h5 className="text-white font-semibold mb-4">Example: Productivity Software Campaign</h5>
            <div className="space-y-4">
              <div>
                <h6 className="text-[#00d4ff] font-medium">Achievement-Motivation Variant</h6>
                <p className="text-[#a3a3a3] text-sm">Headline: "Achieve 40% More in Half the Time"</p>
                <p className="text-[#a3a3a3] text-sm">Description: "Join top performers who've transformed their productivity"</p>
                <p className="text-[#a3a3a3] text-sm">CTA: "Start Winning Today"</p>
              </div>
              <div>
                <h6 className="text-[#00d4ff] font-medium">Security-Motivation Variant</h6>
                <p className="text-[#a3a3a3] text-sm">Headline: "Never Miss Another Deadline"</p>
                <p className="text-[#a3a3a3] text-sm">Description: "Reliable system trusted by 10,000+ teams"</p>
                <p className="text-[#a3a3a3] text-sm">CTA: "Secure Your Success"</p>
              </div>
              <div>
                <h6 className="text-[#00d4ff] font-medium">Social-Connection Variant</h6>
                <p className="text-[#a3a3a3] text-sm">Headline: "Join 50,000 Teams Already Winning"</p>
                <p className="text-[#a3a3a3] text-sm">Description: "Be part of the productivity revolution"</p>
                <p className="text-[#a3a3a3] text-sm">CTA: "Join the Community"</p>
              </div>
            </div>
          </div>

          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Set Up Segment-Specific Campaigns:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Create separate campaigns for each psychological segment</li>
                <li>• Use the custom audiences exported from User Profiles for precise targeting</li>
                <li>• Ensure sufficient budget for statistical significance (minimum $500 per variant)</li>
              </ul>
            </li>
            <li><strong>Configure Creative Testing:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Upload 2-3 creative variants per psychological segment</li>
                <li>• Set equal traffic distribution initially</li>
                <li>• Define success metrics: conversion rate, cost per conversion, quality score</li>
              </ul>
            </li>
            <li><strong>Monitor Test Performance:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Check performance daily but don't make decisions until statistical significance</li>
                <li>• Use knXw Dashboard to track conversion quality, not just quantity</li>
                <li>• Document which psychological elements drive the best results</li>
              </ul>
            </li>
          </ol>
        </div>
      </DocSection>

      <DocSection title="Advanced Creative Optimization" id="advanced-optimization">
        
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 4: Enable Dynamic Creative Personalization</h4>
          <p className="text-[#a3a3a3] mb-3">Use knXw's real-time psychological profiling to dynamically adjust ad elements based on individual user psychology:</p>
          
          <CodeBlock language="javascript" code={`
// Example: Dynamic ad personalization based on user psychology
const personalizeAdCreative = (userProfile, baseCreative) => {
  let personalizedCreative = { ...baseCreative };
  
  // Adjust headline based on primary motivation
  if (userProfile.motivation_stack[0] === 'achievement') {
    personalizedCreative.headline = personalizedCreative.headline.replace(
      'Improve your workflow', 
      'Boost your performance'
    );
  }
  
  // Modify CTA based on risk profile
  if (userProfile.risk_profile === 'conservative') {
    personalizedCreative.cta = 'Try Risk-Free';
    personalizedCreative.subtext = '30-day money-back guarantee';
  } else if (userProfile.risk_profile === 'aggressive') {
    personalizedCreative.cta = 'Get Early Access';
    personalizedCreative.subtext = 'Join beta program';
  }
  
  // Adjust proof points based on cognitive style
  if (userProfile.cognitive_style === 'analytical') {
    personalizedCreative.proofPoints = [
      '40% productivity increase (verified)',
      '2.3x ROI in first quarter',
      'Used by 500+ Fortune 1000 companies'
    ];
  } else if (userProfile.cognitive_style === 'intuitive') {
    personalizedCreative.proofPoints = [
      'Loved by creative professionals',
      'Transforms how you work',
      'Feels like magic in action'
    ];
  }
  
  return personalizedCreative;
};
          `} />

          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Set Up Dynamic Creative Rules:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Engagements → create new "Dynamic Ad Creative" rule</li>
                <li>• Set triggers based on psychological profile changes</li>
                <li>• Configure different creative versions for different psychological states</li>
              </ul>
            </li>
            <li><strong>Implement Cross-Platform Personalization:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Enable dynamic creative optimization on both Meta and Google platforms</li>
                <li>• Set up webhook integrations to update creative in real-time</li>
                <li>• Monitor performance improvements from personalization</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 5: Implement Emotional Journey Optimization</h4>
          <p className="text-[#a3a3a3] mb-3">Create ad sequences that guide users through optimal emotional states toward conversion:</p>
          
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Map Optimal Emotional Progression:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>Stage 1 (Awareness):</strong> Curiosity → Interest</li>
                <li>• <strong>Stage 2 (Consideration):</strong> Interest → Hope → Confidence</li>
                <li>• <strong>Stage 3 (Conversion):</strong> Confidence → Urgency → Action</li>
              </ul>
            </li>
            <li><strong>Create Emotional Sequence Campaigns:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <strong>Ad 1 (Curiosity):</strong> "What if you could double your productivity?"</li>
                <li>• <strong>Ad 2 (Hope):</strong> "See how Sarah increased her output by 150%"</li>
                <li>• <strong>Ad 3 (Confidence):</strong> "Join 10,000+ professionals already succeeding"</li>
                <li>• <strong>Ad 4 (Urgency):</strong> "Start your risk-free trial today - limited time"</li>
              </ul>
            </li>
            <li><strong>Configure Sequential Delivery:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Set up retargeting audiences based on engagement with each ad</li>
                <li>• Use 2-3 day delays between sequence steps</li>
                <li>• Skip users ahead if they show high-intent behaviors (pricing page visits, etc.)</li>
              </ul>
            </li>
            <li><strong>Monitor Emotional Transition Success:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Track emotional state changes in knXw Event Stream</li>
                <li>• Measure conversion rates at each sequence stage</li>
                <li>• Optimize sequence timing based on psychological profile</li>
              </ul>
            </li>
          </ol>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Step 6: Advanced Creative Performance Analysis</h4>
          
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Set Up Comprehensive Tracking:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Go to Settings → Advanced Tracking</li>
                <li>• Enable "Creative Psychology Analysis" feature</li>
                <li>• Set up UTM parameters that identify psychological segments and creative concepts</li>
              </ul>
            </li>
            <li><strong>Analyze Creative Performance by Psychology:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Run weekly Batch Analytics "Creative Performance" analysis</li>
                <li>• Compare performance across different psychological segments</li>
                <li>• Identify which creative elements resonate with which personality traits</li>
              </ul>
            </li>
            <li><strong>Optimize Creative Portfolio:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Pause creatives that show poor psychological alignment</li>
                <li>• Scale winners by creating variations that maintain psychological appeal</li>
                <li>• Test new psychological angles based on performance data</li>
              </ul>
            </li>
          </ol>
        </div>
      </DocSection>

      <DocSection title="Measuring Creative Success: Psychology-Informed Metrics" id="success-metrics">
        
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Key Performance Indicators</h4>
          <ul className="space-y-2 text-[#a3a3a3]">
            <li><strong>Psychological Alignment Score:</strong> Available in Dashboard → "Creative Performance" section</li>
            <li><strong>Conversion Rate by Personality Segment:</strong> Batch Analytics → "Creative Effectiveness" report</li>
            <li><strong>Emotional Response Indicators:</strong> Event Stream → filter by creative engagement patterns</li>
            <li><strong>Customer Quality Score by Creative:</strong> User Profiles → "Creative Attribution" analysis</li>
            <li><strong>Cross-Platform Creative Performance:</strong> Attribution Settings → "Creative Journey Analysis"</li>
          </ul>
        </div>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 my-6">
          <h4 className="text-xl font-semibold text-white mb-4">Advanced Creative Analysis Workflow</h4>
          
          <ol className="space-y-3 text-[#a3a3a3]">
            <li><strong>Daily Creative Monitoring:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Check Dashboard for creative performance anomalies</li>
                <li>• Review AI Insights for creative optimization recommendations</li>
                <li>• Monitor emotional response patterns in Event Stream</li>
              </ul>
            </li>
            <li><strong>Weekly Performance Deep Dive:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Run Batch Analytics creative performance report</li>
                <li>• Analyze which psychological elements drive best results</li>
                <li>• Plan next week's creative tests based on insights</li>
              </ul>
            </li>
            <li><strong>Monthly Creative Strategy Review:</strong>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Assess overall creative portfolio performance</li>
                <li>• Identify emerging psychological trends in your audience</li>
                <li>• Plan creative roadmap for next month based on psychological insights</li>
                <li>• Review and refine creative development processes</li>
              </ul>
            </li>
          </ol>
        </div>

        <Callout type="success" title="Expected Creative Performance Improvements">
          Companies implementing psychology-driven creative optimization with knXw typically achieve:
          <ul>
            <li><strong>45-70% improvement in ad click-through rates</strong></li>
            <li><strong>30-55% increase in conversion rates</strong></li>
            <li><strong>25-40% reduction in cost per conversion</strong></li>
            <li><strong>35-50% improvement in customer quality scores</strong></li>
            <li><strong>20-30% increase in customer lifetime value</strong></li>
            <li><strong>40-60% faster optimization cycles</strong> (fewer tests needed)</li>
          </ul>
        </Callout>
      </DocSection>
    </div>
  );
}