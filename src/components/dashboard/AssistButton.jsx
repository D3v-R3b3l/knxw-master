import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useDashboardStore } from './DashboardStore';

export default function AssistButton({ aiContext, metricName, metricValue, size = "sm" }) {
  const { metrics, events, insights, profiles, selectedAppId, apps } = useDashboardStore();

  const handleClick = (e) => {
    // CRITICAL: Stop event propagation to prevent card navigation
    e.stopPropagation();
    e.preventDefault();

    try {
      // Build comprehensive context
      const selectedApp = apps?.find(a => a.id === selectedAppId);
      
      const fullContext = {
        // Specific metric being asked about
        currentMetric: metricName ? {
          name: metricName,
          value: metricValue,
          question: aiContext
        } : null,
        
        // Complete dashboard state
        dashboardState: {
          totalUsers: metrics?.totalUsers || 0,
          totalEvents: metrics?.totalEvents || 0,
          activeUsers: metrics?.activeUsers || 0,
          avgEngagement: metrics?.avgEngagement || '0',
          totalInsights: metrics?.totalInsights || 0,
          recentEventsCount: events?.length || 0,
          insightsCount: insights?.length || 0,
          profilesCount: profiles?.length || 0
        },
        
        // App context
        appContext: selectedApp ? {
          appId: selectedApp.id,
          appName: selectedApp.name,
          domains: selectedApp.authorized_domains || []
        } : null,
        
        // Page context
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        
        // User's question context
        aiContext: aiContext || "Help me understand this metric and suggest improvements."
      };

      window.dispatchEvent(new CustomEvent('knxw-open-ai-assistant', {
        detail: { 
          chatOnly: true,
          context: fullContext
        }
      }));
    } catch (error) {
      console.error('Failed to open AI assistant:', error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size={size}
      onClick={handleClick}
      className="text-[#00d4ff] hover:text-[#0ea5e9] hover:bg-[#00d4ff]/10 p-2"
      title="Ask AI about this section"
    >
      <Sparkles className="w-4 h-4" />
    </Button>
  );
}