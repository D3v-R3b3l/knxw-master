import {
  Zap, Users, Activity, Settings, Brain, Shield,
  GitBranch as AttributionIcon, TrendingUp, BookOpen, Bot, HeartPulse,
  FlaskConical, Server, UserCheck, TrendingDown, Webhook, Waypoints, Key,
  BarChart3, Target, Briefcase, Cpu, Route, Plug, Sliders,
  Link as LinkIcon, Megaphone, Database as DatabaseIcon, Sparkles, MousePointerClick,
  Store
} from "lucide-react";

export const navigationSections = [
  {
    title: "Signal",
    items: [
      { title: "Intelligence Hub", page: "Dashboard", icon: Zap, description: "What the system knows right now" },
      { title: "User Signals", page: "Events", icon: Activity, description: "Live behavior stream" },
      { title: "Profiles", page: "Profiles", icon: Users, description: "Who is ready, hesitating, or leaving" },
      { title: "AI Insights", page: "Insights", icon: Brain, description: "Patterns the system has surfaced" },
    ]
  },
  {
    title: "Performance",
    items: [
      { title: "Retention Risk", page: "ChurnAnalytics", icon: TrendingDown, description: "Where you are losing people" },
      { title: "Predictive AI", page: "PredictivePsychographics", icon: TrendingUp, description: "What happens next" },
      { title: "Audience Segments", page: "AudienceBuilder", icon: Target, description: "Who needs what, right now" },
      { title: "Executive View", page: "ExecutiveDashboard", icon: Briefcase, description: "P&L-level signal" },
    ]
  },
  {
    title: "Adaptation",
    items: [
      { title: "Engagements", page: "Engagements", icon: Zap, description: "System responses to user state" },
      { title: "Journey Builder", page: "Journeys", icon: Waypoints, description: "Path logic that adapts" },
      { title: "A/B Testing", page: "ABTestingStudio", icon: FlaskConical, description: "Test what works" },
      { title: "AI Agents", page: "Agents", icon: Bot, description: "Autonomous response loops" },
    ]
  },
  {
    title: "Sovereignty",
    items: [
      { title: "User Data Portal", page: "UserDataPortal", icon: UserCheck, description: "User-controlled context & consent" },
      { title: "Integrations", page: "IntegrationsManagement", icon: Shield, description: "What connects and why" },
      { title: "Attribution", page: "AttributionSettings", icon: AttributionIcon, description: "Where value actually comes from" },
    ]
  },
  {
    title: "Infrastructure",
    items: [
      { title: "My Apps", page: "MyApps", icon: Server, description: "Connected applications" },
      { title: "API Keys", page: "ApiKeys", icon: Key, description: "Access credentials" },
      { title: "Developer Center", page: "DeveloperCenter", icon: Webhook, description: "Keys, webhooks, sandbox" },
      { title: "API Usage", page: "DeveloperUsageAnalytics", icon: BarChart3, description: "Load & latency" },
      { title: "Data Import", page: "DataImport", icon: DatabaseIcon, description: "Bulk ingestion" },
      { title: "Demo Data", page: "DemoData", icon: Sparkles, description: "Seed test data" },
    ]
  },
  {
    title: "Resources",
    items: [
      { title: "Documentation", page: "Documentation", icon: BookOpen, description: "SDK & API guides" },
      { title: "Settings", page: "Settings", icon: Settings, description: "Configuration" },
    ]
  }
];

export const adminNavigationItems = [
  { title: "System Health", page: "SystemHealth", icon: HeartPulse, description: "Operator Monitoring" },
  { title: "Org Admin", page: "OrgAdmin", icon: Shield, description: "Organization Settings" },
  { title: "Optimization Analytics", page: "OptimizationAnalytics", icon: BarChart3, description: "Template Effectiveness & Governance" },
  { title: "Simulation Mode", page: "SimulationMode", icon: FlaskConical, description: "Test Rulesets Without Real Users" },
];