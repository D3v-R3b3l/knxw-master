/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ABTesting from './pages/ABTesting';
import ABTestingStudio from './pages/ABTestingStudio';
import AIJourneyOrchestrator from './pages/AIJourneyOrchestrator';
import AdminRoles from './pages/AdminRoles';
import Agents from './pages/Agents';
import AlertsSettings from './pages/AlertsSettings';
import Assistant from './pages/Assistant';
import AttributionSettings from './pages/AttributionSettings';
import AudienceBuilder from './pages/AudienceBuilder';
import BatchAnalytics from './pages/BatchAnalytics';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import CRMRecords from './pages/CRMRecords';
import CaseStudy from './pages/CaseStudy';
import Collaborate from './pages/Collaborate';
import ComplianceDashboard from './pages/ComplianceDashboard';
import CustomDimensions from './pages/CustomDimensions';
import Dashboard from './pages/Dashboard';
import DashboardBuilder from './pages/DashboardBuilder';
import Dashboards from './pages/Dashboards';
import DataImport from './pages/DataImport';
import DataQuality from './pages/DataQuality';
import DemoData from './pages/DemoData';
import DeveloperGameDev from './pages/DeveloperGameDev';
import DeveloperKeys from './pages/DeveloperKeys';
import DeveloperPlayground from './pages/DeveloperPlayground';
import DeveloperUsage from './pages/DeveloperUsage';
import Developers from './pages/Developers';
import Documentation from './pages/Documentation';
import EmployeeRecords from './pages/EmployeeRecords';
import EngagementMarketplace from './pages/EngagementMarketplace';
import Engagements from './pages/Engagements';
import EnterpriseSecurityDashboard from './pages/EnterpriseSecurityDashboard';
import Events from './pages/Events';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import FeedbackInsights from './pages/FeedbackInsights';
import Glossary from './pages/Glossary';
import GoogleData from './pages/GoogleData';
import ImportedTextRecords from './pages/ImportedTextRecords';
import InferenceStudio from './pages/InferenceStudio';
import Infographic from './pages/Infographic';
import Insights from './pages/Insights';
import Integrations from './pages/Integrations';
import IntegrationsManagement from './pages/IntegrationsManagement';
import InteractiveDemo from './pages/InteractiveDemo';
import Journeys from './pages/Journeys';
import Landing from './pages/Landing';
import LlmEvaluation from './pages/LlmEvaluation';
import MarketIntelligence from './pages/MarketIntelligence';
import MarketingIntegrations from './pages/MarketingIntegrations';
import MetaData from './pages/MetaData';
import MyApps from './pages/MyApps';
import Onboarding from './pages/Onboarding';
import OrgAdmin from './pages/OrgAdmin';
import PageAnalytics from './pages/PageAnalytics';
import PredictivePsychographics from './pages/PredictivePsychographics';
import Pricing from './pages/Pricing';
import PricingFAQ from './pages/PricingFAQ';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Profiles from './pages/Profiles';
import ProofHub from './pages/ProofHub';
import Robotics from './pages/Robotics';
import Settings from './pages/Settings';
import Support from './pages/Support';
import SystemHealth from './pages/SystemHealth';
import SystemValidation from './pages/SystemValidation';
import Terms from './pages/Terms';
import Tests from './pages/Tests';
import UnifiedDataIntegration from './pages/UnifiedDataIntegration';
import UserDataPortal from './pages/UserDataPortal';
import UserSettings from './pages/UserSettings';
import blog from './pages/blog';
import dashboard from './pages/dashboard';
import documentation from './pages/documentation';
import landing from './pages/landing';
import lowdown from './pages/lowdown';
import settings from './pages/settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ABTesting": ABTesting,
    "ABTestingStudio": ABTestingStudio,
    "AIJourneyOrchestrator": AIJourneyOrchestrator,
    "AdminRoles": AdminRoles,
    "Agents": Agents,
    "AlertsSettings": AlertsSettings,
    "Assistant": Assistant,
    "AttributionSettings": AttributionSettings,
    "AudienceBuilder": AudienceBuilder,
    "BatchAnalytics": BatchAnalytics,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "CRMRecords": CRMRecords,
    "CaseStudy": CaseStudy,
    "Collaborate": Collaborate,
    "ComplianceDashboard": ComplianceDashboard,
    "CustomDimensions": CustomDimensions,
    "Dashboard": Dashboard,
    "DashboardBuilder": DashboardBuilder,
    "Dashboards": Dashboards,
    "DataImport": DataImport,
    "DataQuality": DataQuality,
    "DemoData": DemoData,
    "DeveloperGameDev": DeveloperGameDev,
    "DeveloperKeys": DeveloperKeys,
    "DeveloperPlayground": DeveloperPlayground,
    "DeveloperUsage": DeveloperUsage,
    "Developers": Developers,
    "Documentation": Documentation,
    "EmployeeRecords": EmployeeRecords,
    "EngagementMarketplace": EngagementMarketplace,
    "Engagements": Engagements,
    "EnterpriseSecurityDashboard": EnterpriseSecurityDashboard,
    "Events": Events,
    "ExecutiveDashboard": ExecutiveDashboard,
    "FeedbackInsights": FeedbackInsights,
    "Glossary": Glossary,
    "GoogleData": GoogleData,
    "ImportedTextRecords": ImportedTextRecords,
    "InferenceStudio": InferenceStudio,
    "Infographic": Infographic,
    "Insights": Insights,
    "Integrations": Integrations,
    "IntegrationsManagement": IntegrationsManagement,
    "InteractiveDemo": InteractiveDemo,
    "Journeys": Journeys,
    "Landing": Landing,
    "LlmEvaluation": LlmEvaluation,
    "MarketIntelligence": MarketIntelligence,
    "MarketingIntegrations": MarketingIntegrations,
    "MetaData": MetaData,
    "MyApps": MyApps,
    "Onboarding": Onboarding,
    "OrgAdmin": OrgAdmin,
    "PageAnalytics": PageAnalytics,
    "PredictivePsychographics": PredictivePsychographics,
    "Pricing": Pricing,
    "PricingFAQ": PricingFAQ,
    "Privacy": Privacy,
    "Profile": Profile,
    "Profiles": Profiles,
    "ProofHub": ProofHub,
    "Robotics": Robotics,
    "Settings": Settings,
    "Support": Support,
    "SystemHealth": SystemHealth,
    "SystemValidation": SystemValidation,
    "Terms": Terms,
    "Tests": Tests,
    "UnifiedDataIntegration": UnifiedDataIntegration,
    "UserDataPortal": UserDataPortal,
    "UserSettings": UserSettings,
    "blog": blog,
    "dashboard": dashboard,
    "documentation": documentation,
    "landing": landing,
    "lowdown": lowdown,
    "settings": settings,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};