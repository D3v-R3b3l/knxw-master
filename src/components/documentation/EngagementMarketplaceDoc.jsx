import React from 'react';
import { Store, Zap, Copy } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';

export default function EngagementMarketplaceDoc() {
  return (
    <div className="space-y-8">
      <Section icon={Store} title="Engagement Marketplace">
        <p className="text-[#a3a3a3] mb-4">
          Pre-built engagement rules and templates tailored for specific industries and use cases. 
          Clone and customize proven strategies to accelerate your implementation.
        </p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">Available Templates</h3>
        <div className="space-y-4 mb-6">
          {[
            {
              name: 'E-commerce Cart Abandonment',
              category: 'conversion',
              industry: 'e-commerce',
              desc: 'Re-engage users who added items but didn\'t complete purchase',
              cvr: '23%'
            },
            {
              name: 'SaaS Feature Discovery',
              category: 'onboarding',
              industry: 'SaaS',
              desc: 'Guide analytical users through advanced features',
              cvr: '41%'
            },
            {
              name: 'Healthcare Patient Check-in',
              category: 'support',
              industry: 'healthcare',
              desc: 'Empathetic check-in for anxious patients',
              cvr: '58%'
            },
            {
              name: 'Finance Risk-Appropriate Upsell',
              category: 'upsell',
              industry: 'finance',
              desc: 'Investment recommendations based on risk profile',
              cvr: '34%'
            },
            {
              name: 'Gaming Player Retention',
              category: 'retention',
              industry: 'gaming',
              desc: 'Re-engage players showing churn signals',
              cvr: '49%'
            },
            {
              name: 'Education Adaptive Learning',
              category: 'onboarding',
              industry: 'education',
              desc: 'Personalized content based on cognitive style',
              cvr: '62%'
            }
          ].map((template) => (
            <div key={template.name} className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white">{template.name}</h4>
                  <p className="text-sm text-[#a3a3a3] mt-1">{template.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#00d4ff]">{template.cvr}</div>
                  <div className="text-xs text-[#6b7280]">avg CVR</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {template.category}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {template.industry}
                </span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Copy className="w-5 h-5 text-[#00d4ff]" />
          Using Templates
        </h3>

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Browse & Clone via Dashboard</h4>
        <p className="text-[#a3a3a3] mb-4">
          Navigate to <strong>Automation & AI → Marketplace</strong> to browse templates by industry and category. 
          Click "Use This Template" to clone to your account.
        </p>

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Query via API</h4>
        <CodeBlock language="javascript" code={`// List all templates
const templates = await base44.entities.EngagementRuleTemplate.filter({
  industry: 'e-commerce',
  category: 'conversion'
}, '-created_date', 20);

// Get featured templates
const featured = await base44.entities.EngagementRuleTemplate.filter({
  is_featured: true
}, '-performance_stats.usage_count', 10);`} />

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Clone Programmatically</h4>
        <CodeBlock language="javascript" code={`// Clone a template
const template = templates[0];

// Create engagement rule from template
const rule = await base44.entities.EngagementRule.create({
  ...template.rule_config,
  name: \`\${template.template_name} (My Version)\`,
  client_app_id: 'your_app_id',
  status: 'inactive' // Review before activating
});

// Create engagement template
const engagementTemplate = await base44.entities.EngagementTemplate.create({
  ...template.engagement_template_config,
  name: \`\${template.template_name} Template\`,
  client_app_id: 'your_app_id'
});`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00d4ff]" />
          Template Structure
        </h3>
        <p className="text-[#a3a3a3] mb-4">
          Each template includes:
        </p>

        <CodeBlock language="javascript" code={`{
  template_name: "E-commerce Cart Abandonment",
  category: "conversion",
  industry: "e-commerce",
  description: "Re-engage users who added items...",
  
  // Complete rule configuration
  rule_config: {
    name: "Cart Abandonment Recovery",
    trigger_conditions: {
      psychographic_conditions: [],
      behavioral_conditions: [
        { event_type: "add_to_cart", frequency: "once" }
      ],
      timing_conditions: { idle_time_seconds: 300 }
    },
    engagement_action: { type: "modal", priority: "high" }
  },
  
  // Associated engagement template
  engagement_template_config: {
    type: "modal",
    content: {
      title: "Still thinking it over?",
      message: "We saved your cart! Complete your order...",
      buttons: [
        { text: "Complete Order", action: "redirect", action_value: "/checkout" }
      ]
    }
  },
  
  // Performance metrics from other users
  performance_stats: {
    avg_conversion_rate: 0.23,
    avg_engagement_rate: 0.67,
    usage_count: 142
  },
  
  tags: ["cart", "conversion", "retention"],
  is_featured: true,
  is_official: true
}`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4">Customization After Cloning</h3>
        <p className="text-[#a3a3a3] mb-4">
          After cloning, customize the template to match your brand and use case:
        </p>

        <ul className="list-disc list-inside text-[#a3a3a3] space-y-2 mb-4">
          <li>Adjust psychographic conditions to target your specific audience segments</li>
          <li>Modify timing conditions based on your user behavior patterns</li>
          <li>Update messaging and CTAs to match your brand voice</li>
          <li>Configure field mapping for your custom psychographic dimensions</li>
          <li>Test and optimize based on your performance metrics</li>
        </ul>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <p className="text-blue-400 text-sm">
            <strong>Pro Tip:</strong> Start with official templates that have proven performance metrics, 
            then A/B test your customizations to optimize for your specific audience.
          </p>
        </div>
      </Section>
    </div>
  );
}