import { 
  BarChart3, Users, Activity, Settings, Brain, Zap, Shield, 
  GitBranch as AttributionIcon, TrendingUp, BookOpen, Bot, HeartPulse, 
  FlaskConical, Database as DatabaseIcon, Megaphone, BarChart3 as GoogleDataIcon, 
  Target, Briefcase, Search, Server, Link as LinkIcon, Rocket, MousePointerClick, Sparkles,
  Sliders, Store, Plug, Route, Cpu, UserCheck
} from "lucide-react";

export const navigationSections = [
  {
    title: "Core Intelligence",
    items: [
      { title: "Dashboard", page: "Dashboard", icon: BarChart3, description: "Analytics Overview" },
      { title: "AI Insights", page: "Insights", icon: Brain, description: "Psychographic Intelligence" },
      { title: "User Profiles", page: "Profiles", icon: Users, description: "Behavioral Analysis" },
      { title: "Event Stream", page: "Events", icon: Activity, description: "Real-time Tracking" },
    ]
  },
  {
    title: "Data & Integration",
    items: [
      { title: "My Apps", page: "MyApps", icon: Server, description: "Application Management" },
      { title: "Unified Data", page: "UnifiedDataIntegration", icon: LinkIcon, description: "CRM & Finance Integration" },
      { title: "Integrations", page: "IntegrationsManagement", icon: Shield, description: "External Connections" },
      { title: "Meta Data", page: "MetaData", icon: Megaphone, description: "Facebook Insights" },
      { title: "Google Data", page: "GoogleData", icon: GoogleDataIcon, description: "GA4 Analytics" },
    ]
  },
  {
    title: "Advanced Analytics",
    items: [
      { title: "Audience Builder", page: "AudienceBuilder", icon: Target, description: "Segment Creation" },
      { title: "Predictive AI", page: "PredictivePsychographics", icon: Brain, description: "Behavior Forecasting" },
      { title: "Journey Builder", page: "Journeys", icon: AttributionIcon, description: "User Paths" },
      { title: "Batch Analytics", page: "BatchAnalytics", icon: BarChart3, description: "Deep Analysis" },
      { title: "Market Intelligence", page: "MarketIntelligence", icon: TrendingUp, description: "Trends & Insights" },
      { title: "Executive Dashboard", page: "ExecutiveDashboard", icon: Briefcase, description: "Board-Level KPIs" },
    ]
  },
  {
    title: "Automation & AI",
    items: [
      { title: "AI Agents", page: "Agents", icon: Bot, description: "Intelligent Automation" },
      { title: "Engagements", page: "Engagements", icon: Zap, description: "Adaptive Experience" },
      { title: "Marketplace", page: "EngagementMarketplace", icon: Store, description: "Template Library" },
      { title: "A/B Testing", page: "ABTestingStudio", icon: FlaskConical, description: "Experiments" },
      { title: "Robotics", page: "Robotics", icon: Rocket, description: "Process Orchestration" },
    ]
  },
  {
    title: "Advanced Intelligence",
    items: [
      { title: "Custom Dimensions", page: "CustomDimensions", icon: Sliders, description: "Industry-Specific Traits" },
      { title: "Marketing Platforms", page: "MarketingIntegrations", icon: Plug, description: "CDP & Automation" },
    ]
  },
  {
    title: "System & Tools",
    items: [
      { title: "Attribution", page: "AttributionSettings", icon: AttributionIcon, description: "ROI Tracking" },
      { title: "Data Import", page: "DataImport", icon: DatabaseIcon, description: "Bulk Processing" },
      { title: "System Health", page: "SystemHealth", icon: HeartPulse, description: "Performance" },
      { title: "Dashboards", page: "Dashboards", icon: BarChart3, description: "Custom Reports" },
    ]
  },
  {
    title: "Resources",
    items: [
      { title: "Documentation", page: "Documentation", icon: BookOpen, description: "API & Guides" },
      { title: "Blog", page: "Blog", icon: BookOpen, description: "Insights & Updates" },
      { title: "Interactive Demo", page: "InteractiveDemo", icon: MousePointerClick, description: "Live Experience" },
      { title: "Settings", page: "Settings", icon: Settings, description: "Configuration" },
    ]
  }
];

export const adminNavigationItems = [
  { title: "Org Admin", page: "OrgAdmin", icon: Shield, description: "Organization Settings" },
  { title: "Demo Data", page: "DemoData", icon: Sparkles, description: "Seed Test Data" }
];