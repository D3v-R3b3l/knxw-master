import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Brain, Search, BookOpen, Code, Zap, Users, BarChart3, Shield, 
  ExternalLink, ChevronRight, Database, Layers, Gamepad2, Webhook,
  Lock, TrendingUp, Globe, FileText, HelpCircle, Sparkles, Activity,
  MousePointer, Target, Server, Link as LinkIcon, FlaskConical, HeartPulse,
  Megaphone, Briefcase, Menu, X, ShieldCheck, User, Rocket, Map
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Import all documentation components
import IntroductionDoc from '@/components/documentation/IntroductionDoc';
import InferenceOverviewDoc from '@/components/documentation/InferenceOverviewDoc';
import TrainingValidationDoc from '@/components/documentation/TrainingValidationDoc';
import DataStructureDoc from '@/components/documentation/DataStructureDoc';
import SDKDoc from '@/components/documentation/SDKDoc';
import IntegrationsDoc from '@/components/documentation/IntegrationsDoc';
import CoreIntegrationsDoc from '@/components/documentation/integrations/CoreIntegrationsDoc';
import AwsS3IntegrationDoc from '@/components/documentation/integrations/AwsS3IntegrationDoc';
import AzureBlobIntegrationDoc from '@/components/documentation/integrations/AzureBlobIntegrationDoc';
import EventBridgeIntegrationDoc from '@/components/documentation/integrations/EventBridgeIntegrationDoc';
import HubSpotIntegrationDoc from '@/components/documentation/integrations/HubSpotIntegrationDoc';
import AdPlatformsIntegrationDoc from '@/components/documentation/integrations/AdPlatformsIntegrationDoc';
import StripeIntegrationDoc from '@/components/documentation/integrations/StripeIntegrationDoc';
import MetaPagesIntegrationDoc from '@/components/documentation/integrations/MetaPagesIntegrationDoc';
import Ga4IntegrationDoc from '@/components/documentation/integrations/Ga4IntegrationDoc';
import AttributionDoc from '@/components/documentation/AttributionDoc';
import RoiAttributionStrategyDoc from '@/components/documentation/RoiAttributionStrategyDoc';
import AudienceBuilderDoc from '@/components/documentation/AudienceBuilderDoc';
import ExecutiveDashboardDoc from '@/components/documentation/ExecutiveDashboardDoc';
import DemoDataStudioDoc from '@/components/documentation/DemoDataStudioDoc';
import EnterpriseSecurityDoc from '@/components/documentation/EnterpriseSecurityDoc';
import SystemMonitoringDoc from '@/components/documentation/SystemMonitoringDoc';
import GameDevSDKDoc from '@/components/documentation/GameDevSDKDoc';
import IntegrationPlaybooks from '@/components/documentation/IntegrationPlaybooks';
import PredictivePsychographicsDoc from '@/components/documentation/PredictivePsychographicsDoc';
import CollaborationDoc from '@/components/documentation/CollaborationDoc';
import DataQualityDoc from '@/components/documentation/DataQualityDoc';
import UserSettingsDoc from '@/components/documentation/UserSettingsDoc';
import RoboticsDoc from '@/components/documentation/RoboticsDoc';
import MarketIntelligenceDoc from '@/components/documentation/MarketIntelligenceDoc';
import CustomDashboardsDoc from '@/components/documentation/CustomDashboardsDoc';
import PlatformFeatureMapDoc from '@/components/documentation/PlatformFeatureMapDoc';

// API documentation sections
const RESTAPIDoc = () => (
  <div className="prose prose-invert max-w-none">
    <h3 className="text-2xl font-bold text-white mb-4">REST API Documentation</h3>
    <p className="text-[#a3a3a3] mb-6">
      Complete reference for knXw's RESTful API endpoints, enabling deep psychographic intelligence integration into any application.
    </p>

    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Base URL</h4>
      <code className="text-sm text-[#10b981] bg-[#0a0a0a] px-3 py-1 rounded">
        https://your-app.base44.com/functions/api/v1
      </code>
    </div>

    <h4 className="text-xl font-semibold text-white mb-4">Core Endpoints</h4>

    <div className="space-y-4 mb-8">
      {[
        { method: 'POST', endpoint: '/events', desc: 'Ingest behavioral events for psychographic analysis' },
        { method: 'GET', endpoint: '/profiles/:user_id', desc: 'Retrieve complete psychographic profile for a user' },
        { method: 'POST', endpoint: '/insights', desc: 'Query AI-powered behavioral insights' },
        { method: 'POST', endpoint: '/recommendations', desc: 'Get personalized content recommendations' },
        { method: 'GET', endpoint: '/usage', desc: 'Retrieve API usage statistics and metrics' }
      ].map((endpoint, idx) => (
        <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 hover:border-[#00d4ff]/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={`${
              endpoint.method === 'POST' ? 'bg-[#10b981]' : 'bg-[#3b82f6]'
            } text-white`}>
              {endpoint.method}
            </Badge>
            <code className="text-sm text-[#00d4ff]">{endpoint.endpoint}</code>
          </div>
          <p className="text-sm text-[#a3a3a3]">{endpoint.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Authentication</h4>
      <p className="text-[#a3a3a3] mb-3">
        All API requests require authentication using your API key in the Authorization header:
      </p>
      <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`curl -X POST https://your-app.base44.com/functions/api/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id": "user_123", "event_type": "page_view"}'`}
      </pre>
    </div>

    <Link to={createPageUrl("Developers")}>
      <Button className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
        <Code className="w-4 h-4 mr-2" />
        View Interactive API Playground
      </Button>
    </Link>
  </div>
);

const GameDevAPIDoc = () => (
  <div className="prose prose-invert max-w-none">
    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
      <Gamepad2 className="w-7 h-7 text-[#8b5cf6]" />
      GameDev API Documentation
    </h3>
    <p className="text-[#a3a3a3] mb-6">
      Specialized endpoints for game developers, enabling real-time player psychology analysis and adaptive game experiences.
    </p>

    <div className="bg-gradient-to-r from-[#8b5cf6]/10 to-[#00d4ff]/10 border border-[#8b5cf6]/30 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-[#8b5cf6] mb-3">🎮 Built for Game Loops</h4>
      <p className="text-[#a3a3a3] text-sm">
        Low-latency endpoints optimized for real-time integration into game logic, supporting adaptive difficulty,
        reward personalization, and churn prediction.
      </p>
    </div>

    <h4 className="text-xl font-semibold text-white mb-4">GameDev Endpoints</h4>

    <div className="space-y-4 mb-8">
      {[
        { method: 'POST', endpoint: '/gamedev/events', desc: 'Track player actions (level_complete, purchase, quit_game, etc.)' },
        { method: 'GET', endpoint: '/gamedev/motivation', desc: 'Get player\'s primary psychological motivations' },
        { method: 'POST', endpoint: '/gamedev/difficulty', desc: 'Get recommended difficulty adjustment based on player psychology' },
        { method: 'POST', endpoint: '/gamedev/reward', desc: 'Get personalized reward recommendations' },
        { method: 'POST', endpoint: '/gamedev/churn', desc: 'Assess player churn risk with intervention suggestions' }
      ].map((endpoint, idx) => (
        <div key={idx} className="bg-[#111111] border border-[#8b5cf6]/20 rounded-lg p-4 hover:border-[#8b5cf6]/40 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={`${
              endpoint.method === 'POST' ? 'bg-[#8b5cf6]' : 'bg-[#3b82f6]'
            } text-white`}>
              {endpoint.method}
            </Badge>
            <code className="text-sm text-[#8b5cf6]">{endpoint.endpoint}</code>
          </div>
          <p className="text-sm text-[#a3a3a3]">{endpoint.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-white mb-3">Example: Adaptive Difficulty</h4>
      <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Request
POST /api/v1/gamedev/difficulty
{
  "player_id": "player_789",
  "current_difficulty": 0.6,
  "recent_performance": {
    "deaths": 5,
    "completions": 3,
    "avg_time_seconds": 240
  }
}

// Response
{
  "recommended_difficulty": 0.55,
  "adjustment_reasoning": "Player shows mastery motivation but recent frustration signals. Slight reduction maintains engagement.",
  "confidence": 0.87
}`}
      </pre>
    </div>

    <Link to={createPageUrl("DeveloperGameDev")}>
      <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
        <Gamepad2 className="w-4 h-4 mr-2" />
        Explore GameDev SDK & Examples
      </Button>
    </Link>
  </div>
);

const WebhooksDoc = () => (
  <div className="prose prose-invert max-w-none">
    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
      <Webhook className="w-7 h-7 text-[#10b981]" />
      Webhooks Documentation
    </h3>
    <p className="text-[#a3a3a3] mb-6">
      Real-time event notifications delivered to your endpoints, enabling immediate response to psychographic insights and player psychology shifts.
    </p>

    <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-[#10b981] mb-3">HMAC-SHA256 Signed</h4>
      <p className="text-[#a3a3a3] text-sm">
        All webhook payloads are cryptographically signed with HMAC-SHA256, ensuring authenticity and preventing replay attacks.
      </p>
    </div>

    <h4 className="text-xl font-semibold text-white mb-4">Available Event Types</h4>

    <div className="grid md:grid-cols-2 gap-4 mb-8">
      {[
        { event: 'profile.updated', desc: 'User psychographic profile has been refreshed', category: 'Core' },
        { event: 'insight.created', desc: 'New behavioral insight generated for a user', category: 'Core' },
        { event: 'recommendation.generated', desc: 'Personalized content recommendations ready', category: 'Core' },
        { event: 'player.sentiment', desc: 'Player emotional state significantly changed', category: 'GameDev' },
        { event: 'player.churn_risk', desc: 'Player identified as at-risk for churn', category: 'GameDev' },
        { event: 'player.motivation_shift', desc: 'Player primary motivation has shifted', category: 'GameDev' }
      ].map((item, idx) => (
        <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <code className="text-sm text-[#10b981]">{item.event}</code>
            <Badge className={`${
              item.category === 'GameDev' ? 'bg-[#8b5cf6]' : 'bg-[#00d4ff]'
            } text-white text-xs`}>
              {item.category}
            </Badge>
          </div>
          <p className="text-xs text-[#a3a3a3]">{item.desc}</p>
        </div>
      ))}
    </div>

    <h4 className="text-xl font-semibold text-white mb-4">Webhook Payload Structure</h4>
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
      <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`{
  "event_type": "player.churn_risk",
  "delivery_id": "wh_abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "player_id": "player_456",
  "tenant_id": "tenant_789",
  "data": {
    "risk_level": "high",
    "confidence": 0.89,
    "intervention_suggestions": [
      "Send personalized re-engagement offer",
      "Unlock exclusive content based on mastery motivation"
    ]
  }
}

// Verify signature
X-knXw-Signature: sha256=abc123...`}
      </pre>
    </div>

    <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-[#fbbf24] mb-3">⚡ Delivery Guarantees</h4>
      <ul className="text-[#a3a3a3] text-sm space-y-2">
        <li>• At-least-once delivery with automatic retries (exponential backoff)</li>
        <li>• 10-second timeout per delivery attempt</li>
        <li>• Endpoint disabled after 10 consecutive failures</li>
        <li>• Full delivery logs and status tracking</li>
      </ul>
    </div>

    <Link to={createPageUrl("Developers")}>
      <Button className="bg-[#10b981] hover:bg-[#059669] text-white">
        <Webhook className="w-4 h-4 mr-2" />
        Configure Webhooks
      </Button>
    </Link>
  </div>
);

const ABTestingDoc = () => (
  <div className="prose prose-invert max-w-none">
    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
      <FlaskConical className="w-7 h-7 text-[#fbbf24]" />
      A/B Testing Documentation
    </h3>
    <p className="text-[#a3a3a3] mb-6">
      Leverage knXw's psychographic insights to run more effective A/B tests and personalize user experiences.
    </p>

    <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-[#fbbf24] mb-3">🧠 Psychographic Segmentation</h4>
      <p className="text-[#a3a3a3] text-sm">
        Go beyond simple demographics and segment your users based on their core psychological motivations and behavioral traits for deeper A/B test analysis.
      </p>
    </div>

    <h4 className="text-xl font-semibold text-white mb-4">Key Features</h4>
    <ul className="text-[#a3a3a3] space-y-2 mb-6">
      <li>• Define test groups based on predictive psychographics</li>
      <li>• Measure impact on specific psychological metrics</li>
      <li>• Optimize product features, marketing messages, and content for different psychological profiles</li>
      <li>• Integration with popular A/B testing platforms</li>
    </ul>

    <p className="text-[#a3a3a3]">
      This section provides detailed guides on setting up experiments, defining variations, and interpreting results through a psychographic lens.
    </p>
  </div>
);

const documentationSections = [
  { id: 'platform-feature-map', title: 'Platform Feature Map', icon: Map, component: PlatformFeatureMapDoc },
  { id: 'introduction', title: 'Introduction', icon: Sparkles, component: IntroductionDoc },
  { id: 'ai-inference', title: 'AI Inference & Explainability', icon: Brain, component: InferenceOverviewDoc },
  { id: 'training-validation', title: 'Training & Validation', icon: Target, component: TrainingValidationDoc },
  { id: 'demo-data-studio', title: 'Demo Data Studio', icon: Database, component: DemoDataStudioDoc },
  { id: 'javascript-sdk', title: 'JavaScript SDK', icon: Code, component: SDKDoc },
  { id: 'data-structures', title: 'Data Structures', icon: Layers, component: DataStructureDoc },
  { id: 'rest-api', title: 'REST API', icon: Code, component: RESTAPIDoc },
  { id: 'gamedev-api', title: 'GameDev API', icon: Gamepad2, component: GameDevAPIDoc },
  { id: 'gamedev-sdk', title: 'GameDev SDK', icon: Gamepad2, component: GameDevSDKDoc },
  { id: 'webhooks', title: 'Webhooks', icon: Webhook, component: WebhooksDoc },
  { id: 'audience-builder', title: 'Audience Builder', icon: Users, component: AudienceBuilderDoc },
  { id: 'predictive-psychographics', title: 'Predictive Psychographics', icon: Brain, component: PredictivePsychographicsDoc },
  { id: 'market-intelligence', title: 'Market Intelligence', icon: TrendingUp, component: MarketIntelligenceDoc },
  { id: 'custom-dashboards', title: 'Custom Dashboards', icon: BarChart3, component: CustomDashboardsDoc },
  { id: 'robotics', title: 'Robotics Control', icon: Rocket, component: RoboticsDoc },
  { id: 'data-quality', title: 'Data Quality', icon: ShieldCheck, component: DataQualityDoc },
  { id: 'collaboration', title: 'Team Collaboration', icon: Users, component: CollaborationDoc },
  { id: 'user-settings', title: 'User Settings', icon: User, component: UserSettingsDoc },
  { id: 'ab-testing', title: 'A/B Testing', icon: FlaskConical, component: ABTestingDoc },
  { id: 'executive-dashboard', title: 'Executive Dashboard', icon: Briefcase, component: ExecutiveDashboardDoc },
  { id: 'integrations-overview', title: 'Integrations Overview', icon: Zap, component: IntegrationsDoc },
  { id: 'integration-playbooks', title: 'Integration Playbooks', icon: BookOpen, component: IntegrationPlaybooks },
  { id: 'core-integrations', title: 'Core Integrations', icon: Layers, component: CoreIntegrationsDoc },
  { id: 'aws-s3', title: 'AWS S3', icon: Database, component: AwsS3IntegrationDoc },
  { id: 'azure-blob', title: 'Azure Blob Storage', icon: Database, component: AzureBlobIntegrationDoc },
  { id: 'eventbridge', title: 'AWS EventBridge', icon: Zap, component: EventBridgeIntegrationDoc },
  { id: 'hubspot', title: 'HubSpot', icon: Users, component: HubSpotIntegrationDoc },
  { id: 'ad-platforms', title: 'Ad Platforms', icon: TrendingUp, component: AdPlatformsIntegrationDoc },
  { id: 'stripe', title: 'Stripe', icon: BarChart3, component: StripeIntegrationDoc },
  { id: 'meta-pages', title: 'Meta Pages', icon: Megaphone, component: MetaPagesIntegrationDoc },
  { id: 'ga4', title: 'Google Analytics 4', icon: BarChart3, component: Ga4IntegrationDoc },
  { id: 'attribution', title: 'Attribution Setup', icon: TrendingUp, component: AttributionDoc },
  { id: 'roi-strategy', title: 'ROI Strategy', icon: TrendingUp, component: RoiAttributionStrategyDoc },
  { id: 'enterprise-security', title: 'Enterprise Security', icon: Shield, component: EnterpriseSecurityDoc },
  { id: 'system-monitoring', title: 'System Monitoring', icon: Activity, component: SystemMonitoringDoc }
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('platform-feature-map');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState(documentationSections);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSections(documentationSections);
    } else {
      const filtered = documentationSections.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSections(filtered);
    }
  }, [searchTerm]);

  const activeDoc = documentationSections.find(doc => doc.id === activeSection);
  const ActiveComponent = activeDoc?.component || IntroductionDoc;

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        .docs-sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .docs-sidebar-scroll::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 4px;
        }
        .docs-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #00d4ff;
          border-radius: 4px;
          border: 1px solid #0a0a0a;
        }
        .docs-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #0ea5e9;
        }
        .docs-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #00d4ff #0a0a0a;
        }

        .docs-content-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .docs-content-scroll::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 4px;
        }
        .docs-content-scroll::-webkit-scrollbar-thumb {
          background: #00d4ff;
          border-radius: 4px;
          border: 1px solid #0a0a0a;
        }
        .docs-content-scroll::-webkit-scrollbar-thumb:hover {
          background: #0ea5e9;
        }
        .docs-content-scroll {
          scrollbar-width: thin;
          scrollbar-color: #00d4ff #0a0a0a;
        }
      `}</style>

      <div className="border-b border-[#1a1a1a] bg-black fixed top-0 left-0 right-0 z-50 h-16 sm:h-20">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00d4ff] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-lg sm:text-xl">k</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold truncate">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#c026d3] to-[#fbbf24]">
                  knXw Knowledge Base
                </span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block truncate">
                Complete documentation for psychographic intelligence
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#1a1a1a] text-white hover:bg-[#262626] transition-colors flex-shrink-0 ml-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden lg:flex items-center gap-4 flex-shrink-0 ml-4">
            <Link to={createPageUrl("Landing")}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                ← Back to Home
              </Button>
            </Link>
            <Link to={createPageUrl("Developers")}>
              <Button size="sm" className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          style={{ top: '64px' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 p-4 border-b border-[#1a1a1a]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search docs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-[#00d4ff] w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto docs-sidebar-scroll p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Contents
              </h3>
              <nav className="space-y-1">
                {filteredSections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 text-sm ${
                        isActive
                          ? 'bg-[#00d4ff]/10 text-[#00d4ff] font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <section.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1">{section.title}</span>
                      {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex-shrink-0 p-4 border-t border-[#1a1a1a] space-y-2">
              <Link to={createPageUrl("Landing")} className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-full">
                  ← Back to Home
                </Button>
              </Link>
              <Link to={createPageUrl("Developers")} className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16 sm:pt-20 flex h-screen">
        <div className="hidden lg:flex flex-col w-[280px] border-r border-[#1a1a1a] bg-[#0a0a0a] fixed left-0 bottom-0" style={{ top: '80px' }}>
          <div className="flex-shrink-0 p-4 border-b border-[#1a1a1a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-[#00d4ff] w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto docs-sidebar-scroll p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Contents
            </h3>
            <nav className="space-y-1">
              {filteredSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 text-sm ${
                      isActive
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff] font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-1">{section.title}</span>
                    {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1 lg:ml-[280px] overflow-y-auto docs-content-scroll">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {activeDoc && (
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#1a1a1a]">
                  <activeDoc.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00d4ff] flex-shrink-0" />
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white min-w-0 break-words">
                    {activeDoc.title}
                  </h2>
                </div>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <ActiveComponent />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}