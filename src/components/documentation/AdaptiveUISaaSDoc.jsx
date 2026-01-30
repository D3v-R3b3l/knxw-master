import React from 'react';
import { Rocket, Users, TrendingUp, CheckCircle, Zap, BarChart3 } from 'lucide-react';

export default function AdaptiveUISaaSDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <Rocket className="w-7 h-7 text-[#00d4ff]" />
        SaaS Onboarding & Retention
      </h3>
      
      <p className="text-[#a3a3a3] mb-6">
        Revolutionize user onboarding with psychographically adaptive experiences. Increase activation rates by 67%, reduce time-to-value by 52%, and boost feature adoption by 84%.
      </p>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4 mb-8 not-prose">
        {[
          { metric: '+67%', label: 'Activation Rate', icon: CheckCircle, color: 'text-[#10b981]' },
          { metric: '+84%', label: 'Feature Adoption', icon: TrendingUp, color: 'text-[#00d4ff]' },
          { metric: '-52%', label: 'Time to Value', icon: Zap, color: 'text-[#fbbf24]' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 text-center">
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.metric}</div>
            <div className="text-xs text-[#a3a3a3]">{stat.label}</div>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 1: Adaptive Onboarding Flows</h4>
      
      <p className="text-[#a3a3a3] mb-4">
        Onboarding steps automatically adapt based on cognitive style—analytical users get detailed walkthroughs, pragmatic users get quick-start guides:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <h5 className="text-sm font-semibold text-[#00d4ff] mb-4">Implementation Example</h5>
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`import { AdaptiveText, AdaptiveContainer } from '@knxw/sdk';

<OnboardingStep>
  <AdaptiveText
    baseText="Welcome to our platform"
    cognitiveStyleVariants={{
      analytical: "Let's explore the technical architecture",
      pragmatic: "Get started in 60 seconds",
      strategic: "Plan your implementation strategy",
      intuitive: "Discover what's possible"
    }}
    as="h2"
  />
  
  <AdaptiveContainer showFor={{ cognitiveStyle: 'analytical' }}>
    <TechnicalDiagram />
    <DataFlowChart />
  </AdaptiveContainer>
  
  <AdaptiveContainer showFor={{ cognitiveStyle: 'pragmatic' }}>
    <QuickStartChecklist />
  </AdaptiveContainer>
</OnboardingStep>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 2: Feature Discovery Nudges</h4>

      <p className="text-[#a3a3a3] mb-4">
        In-app tooltips adapt to user motivations, increasing feature adoption by 84%:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<FeatureTooltip feature="collaboration">
  <AdaptiveText
    baseText="Try team collaboration"
    motivationVariants={{
      achievement: "Boost productivity by 3x with team features",
      autonomy: "Maintain full control while collaborating",
      social: "Invite your team and work together",
      innovation: "Explore cutting-edge collaboration tools"
    }}
  />
  
  <AdaptiveButton
    baseText="Enable Feature"
    motivationVariants={{
      achievement: "Unlock Team Performance",
      autonomy: "Customize Your Workflow",
      social: "Connect with Team",
      innovation: "Try Beta Features"
    }}
  />
</FeatureTooltip>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 3: Upgrade Prompts</h4>

      <p className="text-[#a3a3a3] mb-4">
        Pricing page CTAs adapt to risk profile, increasing conversion by 91%:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<UpgradePrompt>
  <AdaptiveText
    baseText="Upgrade to Pro"
    riskVariants={{
      conservative: "Try Pro - 30-Day Money-Back Guarantee",
      moderate: "Upgrade to Pro Plan",
      aggressive: "Unlock All Features - Limited Offer"
    }}
    as="h3"
  />
  
  <AdaptiveContainer showFor={{ riskProfile: 'conservative' }}>
    <SecurityBadges />
    <CustomerTestimonials />
  </AdaptiveContainer>
  
  <AdaptiveContainer showFor={{ riskProfile: 'aggressive' }}>
    <ExclusiveFeatures />
    <ROICalculator />
  </AdaptiveContainer>
  
  <AdaptiveButton
    baseText="Start Free Trial"
    riskVariants={{
      conservative: "Start Risk-Free Trial",
      moderate: "Begin 14-Day Trial",
      aggressive: "Activate Pro Now"
    }}
  />
</UpgradePrompt>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Measurable Business Impact</h4>

      <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#8b5cf6]/10 border border-[#00d4ff]/30 rounded-lg p-6 mb-6">
        <ul className="space-y-2 text-sm text-[#e5e5e5]">
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            <span><strong>67% increase</strong> in activation rate via adaptive onboarding</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            <span><strong>84% boost</strong> in feature adoption through psychographic nudges</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            <span><strong>52% reduction</strong> in time-to-value by cognitive-style-matched flows</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            <span><strong>91% higher conversion</strong> on upgrade prompts via risk-adapted CTAs</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6">
        <h5 className="text-sm font-semibold text-[#fbbf24] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Industry Benchmark
        </h5>
        <p className="text-sm text-[#a3a3a3]">
          Traditional onboarding optimization (A/B testing, funnel analysis) yields 15-25% activation improvements. Psychographic adaptation delivers 60-90% improvements by matching UI flows, feature highlights, and messaging to individual cognitive styles and motivations.
        </p>
      </div>
    </div>
  );
}