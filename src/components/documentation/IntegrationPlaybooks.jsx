
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  Mail, 
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Megaphone,
  ChevronRight,
  ExternalLink,
  Brain,
  Lightbulb,
  ShoppingBag,
  Flame,
  Database
} from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function IntegrationPlaybooks() {
  const [activePlaybook, setActivePlaybook] = useState('hubspot');

  const playbooks = [
    {
      id: 'hubspot',
      name: 'HubSpot Advanced',
      icon: Users,
      color: '#ff7a59',
      description: 'Automated psychographically-triggered email campaigns'
    },
    {
      id: 'ga4',
      name: 'Google Analytics 4',
      icon: BarChart3,
      color: '#4285f4',
      description: 'Custom reports correlating psychographics with conversions'
    },
    {
      id: 'salesforce',
      name: 'Salesforce Intelligence',
      icon: Briefcase,
      color: '#00a1e0',
      description: 'Lead scoring and opportunity prediction'
    },
    {
      id: 'meta',
      name: 'Meta Ads Optimization',
      icon: Megaphone,
      color: '#1877f2',
      description: 'Psychographic lookalike audiences'
    },
    {
      id: 'segment',
      name: 'Segment CDP',
      icon: Zap,
      color: '#52bd95',
      description: 'Unified customer data with psychographic traits'
    },
    {
      id: 'shopify',
      name: 'Shopify E-commerce',
      icon: ShoppingBag,
      color: '#96bf48',
      description: 'Product recommendations by psychology'
    },
    {
      id: 'firebase',
      name: 'Firebase Mobile',
      icon: Flame,
      color: '#ffca28',
      description: 'Personalized mobile experiences'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Integration Playbooks</h1>
        <p className="text-[#a3a3a3] text-lg leading-relaxed">
          Step-by-step guides for leveraging psychographic intelligence in your existing tools.
        </p>
      </div>

      <Tabs value={activePlaybook} onValueChange={setActivePlaybook}>
        <TabsList className="bg-[#111111] border border-[#262626] w-full justify-start overflow-x-auto flex-wrap h-auto">
          {playbooks.map(playbook => {
            const Icon = playbook.icon;
            return (
              <TabsTrigger 
                key={playbook.id} 
                value={playbook.id}
                className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {playbook.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* HubSpot Playbook */}
        <TabsContent value="hubspot" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#ff7a59]/20">
                  <Users className="w-6 h-6" style={{ color: '#ff7a59' }} />
                </div>
                <div>
                  <CardTitle className="text-white">HubSpot Advanced Playbook</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Transform email marketing with psychographic automation
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Psychographic Email Automation">
                <div className="space-y-4">
                  <Callout type="info" icon={Lightbulb}>
                    <strong>Goal:</strong> Increase email open rates by 40%+ and CTR by 60%+ through psychological personalization
                  </Callout>

                  <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">1</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">Create Psychographic Segments</p>
                        <CodeBlock language="text" className="text-xs">
{`Segments to create in Audience Builder:
• Analytical Thinkers (cognitive_style = analytical)
• Risk Takers (risk_profile = aggressive)  
• Achievement Driven (motivation contains achievement)
• Social Connectors (motivation contains social)`}
                        </CodeBlock>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">2</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Tailor Email Content</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                            <p className="text-white text-sm font-semibold mb-2">📊 Analytical</p>
                            <ul className="text-xs text-[#a3a3a3] space-y-1">
                              <li>• Data-heavy subject lines</li>
                              <li>• Charts and statistics</li>
                              <li>• ROI calculations</li>
                            </ul>
                          </div>
                          <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                            <p className="text-white text-sm font-semibold mb-2">✨ Intuitive</p>
                            <ul className="text-xs text-[#a3a3a3] space-y-1">
                              <li>• Vision-focused copy</li>
                              <li>• Emotional stories</li>
                              <li>• Big picture benefits</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#10b981] text-white font-bold">3</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">Expected Results</p>
                        <p className="text-[#10b981] text-sm">40-60% higher engagement from personalized messaging</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GA4 Playbook */}
        <TabsContent value="ga4" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#4285f4]/20">
                  <BarChart3 className="w-6 h-6" style={{ color: '#4285f4' }} />
                </div>
                <div>
                  <CardTitle className="text-white">GA4 Psychographic Reports</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Correlate psychology with conversion paths
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Custom Dimension Setup">
                <CodeBlock language="javascript">
{`// Send psychographic data to GA4
knxw.on('profileUpdate', async (profile) => {
  gtag('set', 'user_properties', {
    knxw_cognitive_style: profile.cognitive_style,
    knxw_risk_profile: profile.risk_profile,
    knxw_primary_motivation: profile.motivation_stack_v2[0]?.label,
    knxw_churn_risk: profile.churn_risk_level
  });
});`}
                </CodeBlock>

                <div className="mt-4 space-y-2">
                  <h5 className="text-white font-semibold text-sm">Create These Reports:</h5>
                  <div className="space-y-2">
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                      <p className="text-white text-sm font-semibold">Conversion Paths by Cognitive Style</p>
                      <p className="text-xs text-[#a3a3a3] mt-1">Rows: Path | Breakdown: cognitive_style | Metric: Conversions</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                      <p className="text-white text-sm font-semibold">Time to Convert by Risk Profile</p>
                      <p className="text-xs text-[#a3a3a3] mt-1">Discover which profiles convert fastest</p>
                    </div>
                  </div>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salesforce Playbook */}
        <TabsContent value="salesforce" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#00a1e0]/20">
                  <Briefcase className="w-6 h-6" style={{ color: '#00a1e0' }} />
                </div>
                <div>
                  <CardTitle className="text-white">Salesforce Intelligence Playbook</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Lead scoring with psychological insights
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Psychographic Lead Scoring">
                <CodeBlock language="apex">
{`// Salesforce Apex: Psychographic Scoring
public class PsychographicScorer {
    public static Decimal score(Lead lead) {
        Decimal score = 0;
        
        // Cognitive match
        if (lead.knXw_Cognitive_Style__c == 'analytical' && 
            lead.Industry == 'Technology') {
            score += 15;
        }
        
        // Risk profile
        if (lead.knXw_Risk_Profile__c == 'aggressive') {
            score += 20; // Fast decision makers
        }
        
        // Motivation alignment
        if (lead.knXw_Primary_Motivation__c == 'achievement') {
            score += 15;
            lead.Messaging_Angle__c = 'ROI Focus';
        }
        
        return score;
    }
}`}
                </CodeBlock>

                <Callout type="success" icon={TrendingUp}>
                  25-40% improvement in lead-to-opportunity conversion through psychological targeting
                </Callout>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Ads Playbook */}
        <TabsContent value="meta" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#1877f2]/20">
                  <Megaphone className="w-6 h-6" style={{ color: '#1877f2' }} />
                </div>
                <div>
                  <CardTitle className="text-white">Meta Ads Optimization</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Psychographic lookalike audiences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Building Psychographic Lookalikes">
                <div className="space-y-4">
                  <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">1</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Segment Best Customers</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                            <p className="text-white text-sm font-semibold mb-2">High-Value Analytical</p>
                            <ul className="text-xs text-[#a3a3a3] space-y-1">
                              <li>• cognitive_style = analytical</li>
                              <li>• LTV {'>'} $5000</li>
                              <li>• converted = true</li>
                            </ul>
                          </div>
                          <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                            <p className="text-white text-sm font-semibold mb-2">Fast-Convert Risk Takers</p>
                            <ul className="text-xs text-[#a3a3a3] space-y-1">
                              <li>• risk_profile = aggressive</li>
                              <li>• time_to_convert {'<'} 7 days</li>
                              <li>• engagement = high</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">2</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Export & Create Lookalikes</p>
                        <p className="text-[#a3a3a3] text-sm">
                          Export each segment to Meta, then create 1% lookalikes. This gives you audiences with similar psychology to your best customers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">3</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Match Ad Creative to Psychology</p>
                        <div className="grid md:grid-cols-3 gap-2 mt-2">
                          <div className="bg-[#1a1a1a] p-2 rounded text-center">
                            <p className="text-white text-xs font-semibold">Analytical</p>
                            <p className="text-[10px] text-[#a3a3a3] mt-1">Data visuals</p>
                          </div>
                          <div className="bg-[#1a1a1a] p-2 rounded text-center">
                            <p className="text-white text-xs font-semibold">Intuitive</p>
                            <p className="text-[10px] text-[#a3a3a3] mt-1">Stories</p>
                          </div>
                          <div className="bg-[#1a1a1a] p-2 rounded text-center">
                            <p className="text-white text-xs font-semibold">Risk Takers</p>
                            <p className="text-[10px] text-[#a3a3a3] mt-1">Urgency</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Callout type="success" icon={TrendingUp}>
                    <strong>Expected:</strong> 50-80% better ad relevance, 35-60% lower CPA, 40-70% higher LTV
                  </Callout>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segment Playbook */}
        <TabsContent value="segment" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#52bd95]/20">
                  <Zap className="w-6 h-6 text-[#52bd95]" />
                </div>
                <div>
                  <CardTitle className="text-white">Segment CDP Playbook</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Unified customer data enriched with psychology
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Psychographic Traits as User Properties">
                <CodeBlock language="javascript">
{`// Segment automatically receives knXw traits as user properties
// Example properties synced:
{
  knxw_cognitive_style: "analytical",
  knxw_risk_profile: "aggressive",
  knxw_primary_motivation: "achievement",
  knxw_churn_risk: "low",
  knxw_personality_openness: 0.82,
  knxw_personality_conscientiousness: 0.71
}

// Use in Segment destinations:
// - Email: Personalize campaigns by cognitive style
// - Ad platforms: Build lookalikes from high-value psychology
// - Analytics: Segment reports by motivations`}
                </CodeBlock>

                <Callout type="success" icon={TrendingUp}>
                  50-70% better targeting precision by adding psychology to your CDP
                </Callout>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopify Playbook */}
        <TabsContent value="shopify" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#96bf48]/20">
                  <ShoppingBag className="w-6 h-6 text-[#96bf48]" />
                </div>
                <div>
                  <CardTitle className="text-white">Shopify E-commerce Playbook</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Product recommendations driven by customer psychology
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Psychology-Based Product Recommendations">
                <div className="space-y-4">
                  <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">1</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Enrich Customer Metafields</p>
                        <p className="text-[#a3a3a3] text-sm">
                          knXw automatically adds psychographic data to Shopify customer metafields under namespace "knxw"
                        </p>
                        <CodeBlock language="text" className="mt-2">
{`Metafields created:
• knxw.cognitive_style
• knxw.risk_profile  
• knxw.primary_motivation
• knxw.churn_risk_level`}
                        </CodeBlock>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#00d4ff] text-[#0a0a0a] font-bold">2</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Personalize Product Displays</p>
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                          <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                            <p className="text-white text-sm font-semibold mb-2">Analytical Buyers</p>
                            <ul className="text-xs text-[#a3a3a3] space-y-1">
                              <li>• Show detailed specs first</li>
                              <li>• Comparison tables</li>
                              <li>• ROI calculators</li>
                            </ul>
                          </div>
                          <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                            <p className="text-white text-sm font-semibold mb-2">Intuitive Buyers</p>
                            <ul className="text-xs text-[#a3a3a3] space-y-1">
                              <li>• Lifestyle imagery</li>
                              <li>• Customer stories</li>
                              <li>• Vision-focused copy</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="bg-[#10b981] text-white font-bold">3</Badge>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">Expected Results</p>
                        <p className="text-[#10b981] text-sm">30-45% higher conversion rates through psychological targeting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firebase Playbook */}
        <TabsContent value="firebase" className="space-y-6 mt-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#ffca28]/20">
                  <Flame className="w-6 h-6 text-[#ffca28]" />
                </div>
                <div>
                  <CardTitle className="text-white">Firebase Mobile Playbook</CardTitle>
                  <p className="text-[#a3a3a3] text-sm mt-1">
                    Personalized mobile app experiences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section title="Dynamic Remote Config by Psychology">
                <div className="space-y-4">
                  <CodeBlock language="javascript">
{`// Firebase Remote Config example
// Set different values based on psychographic profile

// For Analytical users:
{
  "onboarding_style": "data_driven",
  "feature_highlight_method": "comparison_table",
  "notification_frequency": "minimal"
}

// For Intuitive users:
{
  "onboarding_style": "story_driven",
  "feature_highlight_method": "video_tour",
  "notification_frequency": "moderate"
}

// Implementation in Unity/Unreal:
// 1. Fetch user's cognitive_style from knXw
// 2. Use Firebase Remote Config conditions
// 3. Deliver personalized experience`}
                  </CodeBlock>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                      <p className="text-white text-sm font-semibold mb-2">Risk Takers</p>
                      <ul className="text-xs text-[#a3a3a3] space-y-1">
                        <li>• Bold CTAs</li>
                        <li>• New features first</li>
                        <li>• Premium upsells</li>
                      </ul>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                      <p className="text-white text-sm font-semibold mb-2">Conservative</p>
                      <ul className="text-xs text-[#a3a3a3] space-y-1">
                        <li>• Trust signals</li>
                        <li>• Proven features</li>
                        <li>• Safety messaging</li>
                      </ul>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#262626]">
                      <p className="text-white text-sm font-semibold mb-2">Social Motivated</p>
                      <ul className="text-xs text-[#a3a3a3] space-y-1">
                        <li>• Community features</li>
                        <li>• Social proof</li>
                        <li>• Sharing prompts</li>
                      </ul>
                    </div>
                  </div>

                  <Callout type="success" icon={TrendingUp}>
                    40-60% improvement in mobile app retention through personalized experiences
                  </Callout>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-[#111111] border-[#00d4ff]/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#00d4ff]/10 rounded-xl">
              <Brain className="w-6 h-6 text-[#00d4ff]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Need Help Implementing?</h3>
              <p className="text-[#a3a3a3] text-sm mb-4">
                Use the AI Assistant (bottom-right) for step-by-step guidance tailored to your setup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
