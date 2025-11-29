import React from 'react';
import { Map, Brain, Activity, TrendingUp, Users, Zap, Shield, Rocket, BarChart3, Target, Layers, Code, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PlatformFeatureMapDoc() {
  const featureCategories = [
    {
      category: 'Core Intelligence Engine',
      icon: Brain,
      color: '#00d4ff',
      features: [
        {
          name: 'Psychographic Profiling',
          description: 'Automatically generate deep psychological profiles for every user based on behavioral data',
          capabilities: ['Motivation detection', 'Personality trait analysis', 'Cognitive style identification', 'Emotional state tracking'],
          tier: 'All Plans'
        },
        {
          name: 'Real-time Event Stream',
          description: 'Capture and process user interactions in real-time from any digital touchpoint',
          capabilities: ['Page views', 'Clicks', 'Form submissions', 'Scroll behavior', 'Custom events', 'Exit intent'],
          tier: 'All Plans'
        },
        {
          name: 'AI Insights Generation',
          description: 'Automatically generate actionable insights from psychographic and behavioral patterns',
          capabilities: ['Behavioral pattern detection', 'Emotional trigger identification', 'Motivation shift alerts', 'Engagement optimization'],
          tier: 'Growth+'
        },
        {
          name: 'Predictive Psychographics',
          description: 'Forecast future user behavior and psychological state changes',
          capabilities: ['Churn prediction', 'Intent forecasting', 'Micro-signal detection', 'Proactive intervention'],
          tier: 'Pro+'
        }
      ]
    },
    {
      category: 'Analytics & Visualization',
      icon: BarChart3,
      color: '#10b981',
      features: [
        {
          name: 'Custom Dashboards',
          description: 'Build responsive dashboards with drag-and-drop widgets and Nivo charts',
          capabilities: ['React-grid-layout integration', 'Nivo chart library', 'Line/Bar/Pie/Heatmap charts', 'Real-time data refresh'],
          tier: 'All Plans'
        },
        {
          name: 'Audience Builder',
          description: 'Create precise user segments based on psychographic traits and behaviors',
          capabilities: ['Visual segment builder', 'Live audience preview', 'AI segment suggestions', 'Export to ad platforms'],
          tier: 'Growth+'
        },
        {
          name: 'Executive Dashboard',
          description: 'Board-level KPIs and strategic psychographic intelligence',
          capabilities: ['High-level metrics', 'Trend analysis', 'Competitive positioning', 'ROI tracking'],
          tier: 'Pro+'
        },
        {
          name: 'Batch Analytics',
          description: 'Deep-dive analysis reports for cohorts, clusters, and behavioral trends',
          capabilities: ['Psychographic clustering', 'Cohort analysis', 'Trend detection', 'Churn prediction'],
          tier: 'Pro+'
        }
      ]
    },
    {
      category: 'Market Intelligence',
      icon: TrendingUp,
      color: '#fbbf24',
      features: [
        {
          name: 'Competitive Analysis',
          description: 'Psychographic profiling of competitor messaging and market positioning',
          capabilities: ['Motivation mapping', 'Emotional trigger analysis', 'Strategic recommendations', 'Gap identification'],
          tier: 'Pro+'
        },
        {
          name: 'Trend Forecasting',
          description: 'AI-powered 90-day market trend predictions with confidence intervals',
          capabilities: ['Momentum detection', 'Inflection point identification', 'Risk & catalyst analysis', 'Strategic planning'],
          tier: 'Pro+'
        },
        {
          name: 'Sentiment Analysis',
          description: 'Real-time competitive sentiment tracking across multiple competitors',
          capabilities: ['30-day sentiment timeline', 'Volatility scoring', 'Driver identification', 'Sentiment leaderboard'],
          tier: 'Pro+'
        },
        {
          name: 'Market Shifts Timeline',
          description: 'Visual timeline of significant market events and disruptions',
          capabilities: ['Event categorization', 'Impact scoring', 'Affected entity tracking', 'Sentiment change measurement'],
          tier: 'Pro+'
        }
      ]
    },
    {
      category: 'Automation & Orchestration',
      icon: Zap,
      color: '#ec4899',
      features: [
        {
          name: 'Adaptive Engagements',
          description: 'Deliver personalized experiences triggered by psychological state changes',
          capabilities: ['Real-time trigger detection', 'Rule-based automation', 'Template management', 'Performance analytics'],
          tier: 'Growth+'
        },
        {
          name: 'AI Agents',
          description: 'Intelligent automation agents for growth, compliance, and optimization',
          capabilities: ['Multi-tool orchestration', 'Entity CRUD operations', 'Web search integration', 'WhatsApp support'],
          tier: 'Pro+'
        },
        {
          name: 'Journey Builder',
          description: 'Design and optimize user journeys based on psychographic progression',
          capabilities: ['Journey mapping', 'Task sequencing', 'Trigger conditions', 'Performance tracking'],
          tier: 'Pro+'
        },
        {
          name: 'Robotics Control Center',
          description: 'Orchestrate robotic process automation with psychographic integration',
          capabilities: ['Fleet monitoring', 'Command scheduler', 'Policy engine', 'Telemetry analytics', 'HMAC-secured comms'],
          tier: 'Enterprise'
        }
      ]
    },
    {
      category: 'Platform Integrations',
      icon: Layers,
      color: '#8b5cf6',
      features: [
        {
          name: 'Ad Platforms (Meta & Google)',
          description: 'Optimize campaigns with psychographic segments and conversion forwarding',
          capabilities: ['CAPI integration', 'Enhanced conversions', 'Audience sync', '+67% ROAS improvement'],
          tier: 'Growth+'
        },
        {
          name: 'HubSpot CRM',
          description: 'Sync psychographic properties with HubSpot contacts for enriched segmentation',
          capabilities: ['Contact property sync', 'Workflow integration', 'List segmentation', '+52% close rates'],
          tier: 'Growth+'
        },
        {
          name: 'Meta Pages',
          description: 'Analyze Facebook/Instagram content with psychographic lens',
          capabilities: ['Post ingestion', 'Comment analysis', 'Creative guidance', '+38% engagement'],
          tier: 'Pro+'
        },
        {
          name: 'Google Analytics 4',
          description: 'Correlate GA4 traffic data with psychographic intelligence',
          capabilities: ['Property connection', 'Report running', 'Behavioral correlation', '+45% attribution accuracy'],
          tier: 'Growth+'
        },
        {
          name: 'AWS Integrations',
          description: 'S3 exports, EventBridge streams, and SES notifications',
          capabilities: ['S3 report exports', 'Event streaming', 'Email notifications', 'CloudWatch integration'],
          tier: 'Pro+'
        },
        {
          name: 'Azure Integrations',
          description: 'Blob Storage exports and Event Hubs streaming',
          capabilities: ['Blob export', 'Event Hubs', 'SAS token management', 'Enterprise security'],
          tier: 'Enterprise'
        }
      ]
    },
    {
      category: 'Developer Tools',
      icon: Code,
      color: '#0ea5e9',
      features: [
        {
          name: 'JavaScript SDK',
          description: 'Easy-to-integrate tracking script for web applications',
          capabilities: ['Auto-tracking', 'Custom events', 'User identification', 'Session management'],
          tier: 'All Plans'
        },
        {
          name: 'REST API',
          description: 'Complete RESTful API for server-side integrations',
          capabilities: ['Event ingestion', 'Profile retrieval', 'Insights queries', 'Usage analytics'],
          tier: 'All Plans'
        },
        {
          name: 'GameDev SDK',
          description: 'Specialized SDK for game developers with low-latency endpoints',
          capabilities: ['Player motivation', 'Adaptive difficulty', 'Reward personalization', 'Churn prediction'],
          tier: 'Pro+'
        },
        {
          name: 'Webhooks',
          description: 'Real-time event notifications with HMAC-SHA256 signing',
          capabilities: ['Profile updates', 'Insight creation', 'Churn alerts', 'At-least-once delivery'],
          tier: 'Growth+'
        }
      ]
    },
    {
      category: 'Testing & Optimization',
      icon: FlaskConical,
      color: '#f59e0b',
      features: [
        {
          name: 'A/B Testing Studio',
          description: 'Run experiments with psychographic segmentation and analysis',
          capabilities: ['Test creation', 'Variant management', 'Statistical analysis', 'Winner promotion'],
          tier: 'Growth+'
        },
        {
          name: 'Predictive A/B Testing',
          description: 'AI-powered test optimization and early winner prediction',
          capabilities: ['Outcome forecasting', 'Segment-specific results', 'Confidence scoring', 'Auto-optimization'],
          tier: 'Pro+'
        }
      ]
    },
    {
      category: 'Enterprise & Security',
      icon: Shield,
      color: '#ef4444',
      features: [
        {
          name: 'Enterprise Security',
          description: 'Advanced security features for compliance and governance',
          capabilities: ['SSO (Okta/Azure AD)', 'Role-based access', 'Audit logging', 'Data encryption', 'GDPR compliance'],
          tier: 'Enterprise'
        },
        {
          name: 'System Health Monitoring',
          description: 'Real-time performance monitoring and alerting',
          capabilities: ['Performance metrics', 'Error tracking', 'Alert rules', 'Incident management'],
          tier: 'Pro+'
        },
        {
          name: 'Team Collaboration',
          description: 'Multi-user workspace with real-time collaboration features',
          capabilities: ['Workspace management', 'User invitations', 'Role permissions', 'Activity feeds'],
          tier: 'Growth+'
        }
      ]
    }
  ];

  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Map className="w-8 h-8 text-[#00d4ff]" />
        Complete Platform Feature Map
      </h2>

      <p className="text-[#a3a3a3] text-lg mb-8">
        Comprehensive overview of all knXw features, integrations, and capabilities across all pricing tiers.
      </p>

      <div className="space-y-12">
        {featureCategories.map((category, catIndex) => (
          <div key={catIndex}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${category.color}20` }}>
                <category.icon className="w-6 h-6" style={{ color: category.color }} />
              </div>
              <h3 className="text-2xl font-bold text-white">{category.category}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {category.features.map((feature, featureIndex) => (
                <Card key={featureIndex} className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                      <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs">
                        {feature.tier}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#a3a3a3] mt-2">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Capabilities:</p>
                      <ul className="space-y-1">
                        {feature.capabilities.map((capability, capIndex) => (
                          <li key={capIndex} className="text-sm text-[#a3a3a3] flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-2 flex-shrink-0" />
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference Table */}
      <h3 className="text-2xl font-bold text-white mt-12 mb-6">Feature Availability by Plan</h3>
      
      <div className="bg-[#111111] border border-[#262626] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0a0a0a] border-b border-[#262626]">
            <tr>
              <th className="text-left p-4 text-[#a3a3a3] font-semibold">Feature</th>
              <th className="text-center p-4 text-[#a3a3a3] font-semibold">Developer</th>
              <th className="text-center p-4 text-[#a3a3a3] font-semibold">Growth</th>
              <th className="text-center p-4 text-[#a3a3a3] font-semibold">Pro</th>
              <th className="text-center p-4 text-[#a3a3a3] font-semibold">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Psychographic Profiling', true, true, true, true],
              ['Real-time Events', true, true, true, true],
              ['Custom Dashboards', true, true, true, true],
              ['JavaScript SDK', true, true, true, true],
              ['REST API Access', true, true, true, true],
              ['AI Insights', false, true, true, true],
              ['Audience Builder', false, true, true, true],
              ['Ad Platform Integration', false, true, true, true],
              ['HubSpot Sync', false, true, true, true],
              ['GA4 Integration', false, true, true, true],
              ['Webhooks', false, true, true, true],
              ['A/B Testing', false, true, true, true],
              ['Predictive Psychographics', false, false, true, true],
              ['Market Intelligence', false, false, true, true],
              ['Trend Forecasting', false, false, true, true],
              ['Sentiment Analysis', false, false, true, true],
              ['Batch Analytics', false, false, true, true],
              ['AI Agents', false, false, true, true],
              ['GameDev SDK', false, false, true, true],
              ['Executive Dashboard', false, false, true, true],
              ['Meta Pages', false, false, true, true],
              ['Robotics Control', false, false, false, true],
              ['Enterprise Security (SSO)', false, false, false, true],
              ['Azure Integrations', false, false, false, true],
              ['Dedicated Support', false, false, false, true]
            ].map(([feature, dev, growth, pro, enterprise], index) => (
              <tr key={index} className="border-b border-[#262626] hover:bg-[#0a0a0a] transition-colors">
                <td className="p-4 text-white">{feature}</td>
                <td className="text-center p-4">{dev ? '✓' : '−'}</td>
                <td className="text-center p-4">{growth ? '✓' : '−'}</td>
                <td className="text-center p-4">{pro ? '✓' : '−'}</td>
                <td className="text-center p-4">{enterprise ? '✓' : '−'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}