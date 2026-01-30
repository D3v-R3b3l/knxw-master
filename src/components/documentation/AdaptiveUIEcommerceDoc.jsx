import React from 'react';
import { ShoppingCart, TrendingUp, Shield, Zap, Award, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdaptiveUIEcommerceDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7 text-[#10b981]" />
        E-commerce Personalization
      </h3>
      
      <p className="text-[#a3a3a3] mb-6">
        Transform your online store with psychographic intelligence. Adaptive UI increases conversion rates by 40-60% by presenting products, messaging, and checkout flows tailored to each customer's psychology.
      </p>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4 mb-8 not-prose">
        {[
          { metric: '+47%', label: 'Conversion Rate', icon: TrendingUp, color: 'text-[#10b981]' },
          { metric: '+62%', label: 'Cart Completion', icon: CheckCircle, color: 'text-[#00d4ff]' },
          { metric: '-34%', label: 'Return Rate', icon: Shield, color: 'text-[#8b5cf6]' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 text-center">
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.metric}</div>
            <div className="text-xs text-[#a3a3a3]">{stat.label}</div>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 1: Product Card Adaptation</h4>
      
      <p className="text-[#a3a3a3] mb-4">
        Product headlines and descriptions automatically adapt based on customer motivations:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <h5 className="text-sm font-semibold text-[#00d4ff] mb-4">Implementation Example</h5>
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`import { AdaptiveText } from '@knxw/sdk';

<ProductCard>
  <AdaptiveText
    baseText="Premium Wireless Headphones"
    motivationVariants={{
      achievement: "Award-Winning Wireless Headphones",
      security: "Trusted by 1M+ Customers Worldwide",
      innovation: "Next-Gen Audio Technology"
    }}
    as="h3"
  />
  <AdaptiveText
    baseText="High-quality audio with noise cancellation"
    motivationVariants={{
      achievement: "Studio-grade sound for professionals",
      security: "2-year warranty, hassle-free returns",
      innovation: "Revolutionary spatial audio"
    }}
  />
</ProductCard>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 2: Adaptive Checkout CTAs</h4>

      <p className="text-[#a3a3a3] mb-4">
        Risk-profile-based CTAs reduce cart abandonment by addressing psychological barriers:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<AdaptiveButton
  baseText="Complete Purchase"
  riskVariants={{
    conservative: "Secure Checkout - 100% Protected",
    moderate: "Complete Order",
    aggressive: "Claim Exclusive Deal Now"
  }}
  className="checkout-button"
/>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 3: Trust Signal Containers</h4>

      <p className="text-[#a3a3a3] mb-4">
        Show risk-mitigating content only to conservative customers, avoiding friction for others:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<AdaptiveContainer showFor={{ riskProfile: 'conservative' }}>
  <TrustBadges>
    <Badge icon={Shield}>SSL Encrypted</Badge>
    <Badge icon={CheckCircle}>Money-Back Guarantee</Badge>
    <Badge icon={Award}>BBB A+ Rated</Badge>
  </TrustBadges>
</AdaptiveContainer>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Measurable Business Impact</h4>

      <div className="bg-gradient-to-br from-[#10b981]/10 to-[#00d4ff]/10 border border-[#10b981]/30 rounded-lg p-6 mb-6">
        <ul className="space-y-2 text-sm text-[#e5e5e5]">
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
            <span><strong>47% increase</strong> in conversion rate by matching product messaging to customer motivations</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
            <span><strong>62% improvement</strong> in cart completion by adaptive checkout CTAs</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
            <span><strong>34% reduction</strong> in product returns via psychological product-fit matching</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
            <span><strong>$2.3M additional revenue</strong> per year for mid-size e-commerce stores</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6">
        <h5 className="text-sm font-semibold text-[#fbbf24] mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Industry Benchmark
        </h5>
        <p className="text-sm text-[#a3a3a3]">
          Traditional A/B testing yields 5-15% conversion improvements. Psychographic adaptation delivers 40-60% improvements by personalizing to individual psychology rather than aggregate cohorts.
        </p>
      </div>
    </div>
  );
}