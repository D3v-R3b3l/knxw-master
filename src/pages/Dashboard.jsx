import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { callWithRetry } from "@/components/system/apiRetry";
import { Brain, Users, Activity, Zap, TrendingUp, Eye, RefreshCw, Sparkles, Server, Code, Rocket, BookOpen, Plus, BarChart3 } from "lucide-react";
import { format } from "date-fns";

import MetricCard from "../components/dashboard/MetricCard";
import EmotionalStateChart from "../components/dashboard/EmotionalStateChart";
import RealTimeActivity from "../components/dashboard/RealTimeActivity";
import PsychographicHeatmap from "../components/dashboard/PsychographicHeatmap";
import PsychographicEngagementHeatmap from "../components/dashboard/PsychographicEngagementHeatmap";
import ChurnPredictionPanel from "../components/dashboard/ChurnPredictionPanel";
import BenchmarkingPanel from "../components/dashboard/BenchmarkingPanel";
import CheckInWidget from "../components/engagement/CheckInWidget";
import { handleApiError } from "../components/system/errorHandler";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from '../components/ui/PageHeader';


import { DashboardProvider, useDashboardStore } from "../components/dashboard/DashboardStore";
import AppSelector from "../components/dashboard/AppSelector";
import HighlightsPanel from "../components/dashboard/HighlightsPanel";
import EvidenceViewer from "../components/dashboard/EvidenceViewer";
import RecommendationsPanel from "../components/dashboard/RecommendationsPanel";
import logger from "../components/system/logger";

const initialMetrics = {
  totalUsers: 0,
  totalEvents: 0,
  activeUsers: 0,
  avgEngagement: '0',
  totalInsights: 0
};

function DashboardPage() { // Renamed from DashboardContent
  const {
    metrics, events, insights, profiles,
    isLoading: storeIsLoading,
    refreshData, appOrigins, selectedAppId, setSelectedAppId, apps
  } = useDashboardStore();

  const [user, setUser] = useState(null);
  const [isInitialSetupLoading, setIsInitialSetupLoading] = useState(true);
  const [hasClientApp, setHasClientApp] = useState(false);
  const [setupRetryCount, setSetupRetryCount] = useState(0);
  const [checkInData, setCheckInData] = useState(null);
  
  const originalData = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      toast({
        variant: "success",
        title: "Subscription Activated",
        description: "Your plan has been successfully updated. Welcome to knXw Pro!",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const metricsRef = useRef(initialMetrics);
  const eventsRef = useRef([]);
  const insightsRef = useRef([]);
  const profilesRef = useRef([]);

  // Derive selectedApp based on selectedAppId and available apps
  const selectedApp = apps.find(app => app.id === selectedAppId);

  useEffect(() => {
    metricsRef.current = metrics;
    eventsRef.current = events;
    insightsRef.current = insights;
    profilesRef.current = profiles;
  }, [metrics, events, insights, profiles]);

  const safeFormatDate = useCallback((dateString) => {
    try {
      if (!dateString) return 'Never';
      
      let date;
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string' || typeof dateString === 'number') {
        date = new Date(dateString);
      } else {
        logger.warn('Invalid date format in Dashboard:', dateString);
        return 'Invalid date';
      }
      
      if (isNaN(date.getTime())) {
        logger.warn('Invalid date created in Dashboard:', dateString);
        return 'Invalid date';
      }
      
      return format(date, 'MMM d, yyyy');
    }
    catch (error) {
      logger.error('Error formatting date in Dashboard:', error, 'Date:', dateString);
      return 'Unknown date';
    }
  }, []);

  const loadUserAndCheckForApps = useCallback(async () => {
    setIsInitialSetupLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const userApps = apps || [];
      
      if (userApps && userApps.length > 0) {
        setHasClientApp(true);
        
        if (!selectedAppId && userApps[0]?.id) {
          if (typeof setSelectedAppId === 'function') {
            setSelectedAppId(userApps[0].id);
          }
        }
      } else {
        setHasClientApp(false);
        if (setupRetryCount < 5) {
          setTimeout(() => setSetupRetryCount(prev => prev + 1), 2000);
        }
      }
    }
    catch (error) {
      logger.error('Error loading initial dashboard data (user/apps):', error);
      handleApiError(error, "Failed to load initial dashboard setup data.");
    }
    finally {
      if ((apps && apps.length > 0) || setupRetryCount >= 5) {
        setIsInitialSetupLoading(false);
      }
    }
  }, [apps, selectedAppId, setSelectedAppId, setupRetryCount]);

  useEffect(() => {
    loadUserAndCheckForApps();
  }, [loadUserAndCheckForApps, setupRetryCount]);

  const handleRefresh = useCallback(() => {
    refreshData(true);
    toast({
      variant: "success",
      title: "Data Refreshed",
      description: "Dashboard data has been updated successfully.",
    });
  }, [refreshData, toast]);

  const handleTriggerCheckin = useCallback(async () => {
    if (profiles.length === 0) {
      setCheckInData({
        title: "Quick check-in",
        questions: [
          "How is this dashboard working for you on this device?",
          "Anything unclear you'd like explained?",
          "Would you like a quick tour of the key metrics?"
        ]
      });
      return;
    }
    const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
    
    try {
      const response = await base44.functions.invoke('triggerCheckin', {
        user_id: randomProfile.user_id,
        context: `User has been viewing the main analytics dashboard and seems to be exploring high-level metrics.`
      });
      
      const data = response?.data;
      
      if (data?.title && Array.isArray(data?.questions)) {
        setCheckInData(data);
      } else if (data?.checkIn) {
        setCheckInData(data.checkIn);
      } else {
        setCheckInData({
          title: "Quick check-in",
          questions: [
            "Is anything confusing or getting in your way right now?",
            "Would you like suggestions on what to do next?"
          ]
        });
      }
    } catch (error) {
      logger.error("Failed to trigger check-in:", error);
      handleApiError(error, "Could not trigger AI check-in.");
      setCheckInData({
        title: "Quick check-in (offline)",
        questions: [
          "How are you feeling about this page so far?",
          "Would a short guided tour help right now?",
          "Anything we should improve for your workflow?"
        ]
      });
    }
  }, [profiles]);

  useEffect(() => {
    if (setupRetryCount === 0) {
        loadUserAndCheckForApps();
    }

    const timer = setTimeout(() => {
      // handleTriggerCheckin();
    }, 7000);
    
    const onDemoCleared = () => {
      refreshData(true);
    };
    
    const handleSeedData = (event) => {
      const detail = event?.detail;
      
      if (detail && detail.type !== 'clear') {
        if (!originalData.current) {
          originalData.current = { 
            metrics: metricsRef.current, 
            events: eventsRef.current, 
            insights: insightsRef.current, 
            profiles: profilesRef.current 
          };
        }
      } else {
        if (originalData.current) {
          refreshData(true); 
          originalData.current = null;
        } else {
          refreshData(true);
        }
      }
    };
    
    window.addEventListener('knxw-demo-data-cleared', onDemoCleared);
    window.addEventListener('seedWalkthroughExample', handleSeedData);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('seedWalkthroughExample', handleSeedData);
      window.removeEventListener('knxw-demo-data-cleared', onDemoCleared);
    };
  }, [setupRetryCount, loadUserAndCheckForApps, refreshData]);

  if (isInitialSetupLoading && !hasClientApp) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                <Brain className="w-8 h-8 text-[#0a0a0a]" />
              </div>
              <h1 className="text-4xl font-bold text-white">Welcome to knXw</h1>
            </div>
            <p className="text-xl text-[#a3a3a3] max-w-2xl mx-auto leading-relaxed">
              Let's get you started by creating your first application to begin capturing psychographic insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-[#111111] rounded-xl border border-[#262626]">
              <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Server className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="font-semibold text-white mb-2">1. Create App</h3>
              <p className="text-[#a3a3a3] text-sm">Set up your application to get your unique API key</p>
            </div>
            
            <div className="text-center p-6 bg-[#111111] rounded-xl border border-[#262626] opacity-50">
              <div className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-[#10b981]" />
              </div>
              <h3 className="font-semibold text-white mb-2">2. Integrate SDK</h3>
              <p className="text-[#a3a3a3] text-sm">Add our tracking script to start capturing events</p>
            </div>
            
            <div className="text-center p-6 bg-[#111111] rounded-xl border border-[#262626] opacity-50">
              <div className="w-12 h-12 bg-[#ec4899]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-[#ec4899]" />
              </div>
              <h3 className="font-semibold text-white mb-2">3. See Insights</h3>
              <p className="text-[#a3a3a3] text-sm">Watch AI analyze user psychology in real-time</p>
            </div>
          </div>

          <Card className="bg-[#111111] border-[#262626] max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#00d4ff]" />
                Create Your First Application
              </CardTitle>
              <CardDescription className="text-[#a3a3a3]">
                This will generate your API key and tracking script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => window.location.href = createPageUrl('MyApps')}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold px-6 py-3 flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = createPageUrl('Documentation')}
                  className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a] px-6 py-3"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>

          {setupRetryCount > 0 && setupRetryCount < 5 && (
            <div className="text-center mt-8">
              <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-[#6b7280]">Checking for applications...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isInitialSetupLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative z-[1]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto relative">
        {/* Header - Title + Refresh Button */}
        <div className="mb-6 md:mb-8 relative z-[2]" data-tour="dashboard-header">
          <PageHeader
            title="Analytics Dashboard"
            description="Real-time psychographic insights and user behavior analytics"
            icon={BarChart3}
            docSection="introduction"
            actions={
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-[#262626] text-white hover:bg-[#1a1a1a]"
                disabled={storeIsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${storeIsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            }
          />
        </div>

        {/* App Selector */}
        <div className="mb-6 relative z-[2]" data-tour="dashboard-app-selector">
          <AppSelector />
        </div>

        {selectedApp ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-[2]" data-tour="dashboard-metrics">
              {storeIsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-[#111111] border border-[#262626] rounded-xl p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))
              ) : (
                <>
                  <MetricCard
                    title="Total Profiles"
                    value={(metrics.totalUsers || 0).toLocaleString()}
                    icon={Users}
                    gradient="from-[#00d4ff] to-[#0ea5e9]"
                    href={createPageUrl("Profiles")}
                    aiContext="Explain what Total Profiles represents and how profile growth affects segmentation and engagement accuracy."
                    resizable
                  />
                  
                  <MetricCard
                    title="Active Today"
                    value={(metrics.activeUsers || 0).toLocaleString()}
                    icon={Activity}
                    gradient="from-[#10b981] to-[#059669]"
                    href={`${createPageUrl("Events")}?type=page_view&minutes=1440`}
                    aiContext="Show how Active Today is computed and recommend ways to increase daily active users."
                    resizable
                  />
                  
                  <MetricCard
                    title="Recent Events"
                    value={(metrics.totalEvents || 0).toLocaleString()}
                    icon={Eye}
                    gradient="from-[#fbbf24] to-[#f59e0b]"
                    href={`${createPageUrl("Events")}`}
                    aiContext="Summarize the last 100-200 events and highlight anomalies worth investigating."
                    resizable
                  />
                  
                  <MetricCard
                    title="Engagement Rate"
                    value={`${metrics.avgEngagement || '0'}%`}
                    icon={TrendingUp}
                    gradient="from-[#8b5cf6] to-[#7c3aed]"
                    href={`${createPageUrl("Events")}?type=click`}
                    aiContext="Explain engagement rate methodology and suggest experiments to improve it."
                    resizable
                  />
                  
                  <MetricCard
                    title="AI Insights"
                    value={metrics.totalInsights || 0}
                    icon={Zap}
                    gradient="from-[#ec4899] to-[#db2777]"
                    href={createPageUrl("Insights")}
                    aiContext="Review current AI insights and propose actions with the highest expected impact."
                    resizable
                  />
                </>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8 relative z-[2]">
              <div className="space-y-8">
                <div data-tour="emotional-state-chart">
                  <EmotionalStateChart />
                </div>
                
                <div data-tour="psychographic-heatmap">
                  <PsychographicHeatmap />
                </div>

                <div data-tour="psychographic-engagement-heatmap">
                  <PsychographicEngagementHeatmap />
                </div>

                <div data-tour="churn-prediction">
                  <ChurnPredictionPanel />
                </div>
              </div>
              
              <div className="space-y-8">
                <div data-tour="real-time-activity">
                  <RealTimeActivity events={events} isLoading={storeIsLoading} />
                </div>
                
                <HighlightsPanel events={events} />
                
                <div data-tour="recommendations-panel">
                  <RecommendationsPanel userId={user?.id} compact={true} />
                </div>

                <div data-tour="benchmarking">
                  <BenchmarkingPanel industry="SaaS" />
                </div>
                
                <EvidenceViewer />
              </div>
            </div>

            <div className="relative z-[2] w-full">
              {insights.length > 0 && !storeIsLoading ? (
                <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 card-hover" data-tour="top-insights">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Latest Insights</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.href = createPageUrl("Insights")}
                      className="text-[#00d4ff] hover:bg-[#00d4ff]/10"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.slice(0, 6).map((insight, index) => (
                      <a
                        key={insight.id || index}
                        href={`${createPageUrl("Insights")}?insightId=${encodeURIComponent(insight.id || "")}`}
                        className="block p-4 rounded-lg bg-[#1a1a1a] border border-[#262626] hover:border-[#00d4ff]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm line-clamp-2">{insight.title}</h4>
                          <span className="text-xs text-[#00d4ff] font-medium ml-2 flex-shrink-0">
                            {((insight.confidence_score || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-[#a3a3a3] line-clamp-3">
                          {insight.description}
                        </p>
                        {insight.created_date && (
                          <p className="text-xs text-[#6b7280] mt-2">
                            {safeFormatDate(insight.created_date)}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                 !storeIsLoading && (
                  <div className="bg-[#111111] border border-[#262626] rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-[#a3a3a3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Insights Yet</h3>
                    <p className="text-[#a3a3a3] mb-4 max-w-md mx-auto">
                      Insights will appear here as your AI analyzes user behavior patterns and generates recommendations.
                    </p>
                    <Button 
                      onClick={() => window.location.href = createPageUrl("Events")}
                      className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                    >
                      View Event Stream
                    </Button>
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-8 text-center mt-8">
            <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#a3a3a3]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Application Selected</h3>
            <p className="text-[#a3a3a3] mb-4 max-w-md mx-auto">
              Please select an application from the dropdown above to view its analytics data.
            </p>
            <Button
              onClick={() => window.location.href = createPageUrl('MyApps')}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              Manage Applications
            </Button>
          </div>
        )}
      </div>
      
      <CheckInWidget 
        checkInData={checkInData}
        onDismiss={() => setCheckInData(null)}
        data-tour="adaptive-check-in-widget"
      />

      <div className="fixed bottom-4 right-4 flex flex-col gap-3 md:hidden z-50">
        <button
          onClick={handleTriggerCheckin}
          className="p-3 bg-[#00d4ff] text-[#0a0a0a] rounded-full shadow-lg hover:bg-[#0ea5e9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          aria-label="Trigger Check-in"
        >
          <Sparkles size={20} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardPage />
    </DashboardProvider>
  );
}