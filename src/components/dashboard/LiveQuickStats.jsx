import React, { useState, useEffect, useRef } from 'react';
import { UserPsychographicProfile, CapturedEvent, PsychographicInsight } from '@/entities/all';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Brain } from 'lucide-react';

// Global cache to prevent duplicate requests
const quickStatsCache = {
  data: null,
  timestamp: 0,
  isLoading: false
};

const CACHE_DURATION = 60000; // 1 minute cache

export default function LiveQuickStats() {
  const [stats, setStats] = useState({
    profiles: 0,
    events: 0,
    insights: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const abortController = useRef(null);

  const loadQuickStats = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Use cache if available and not forcing refresh
    if (!forceRefresh && quickStatsCache.data && (now - quickStatsCache.timestamp) < CACHE_DURATION) {
      setStats(quickStatsCache.data);
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (quickStatsCache.isLoading && !forceRefresh) {
      return;
    }

    quickStatsCache.isLoading = true;
    
    // Cancel any previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      // CRITICAL: Add explicit is_demo: false filter to all queries
      const [profilesData, eventsData, insightsData] = await Promise.all([
        UserPsychographicProfile.filter({ is_demo: false }, null, 1).catch(() => []),
        CapturedEvent.filter({ is_demo: false }, null, 1).catch(() => []),
        PsychographicInsight.filter({ is_demo: false }, null, 1).catch(() => [])
      ]);

      const newStats = {
        profiles: Array.isArray(profilesData) ? profilesData.length : 0,
        events: Array.isArray(eventsData) ? eventsData.length : 0,
        insights: Array.isArray(insightsData) ? insightsData.length : 0
      };

      // Cache the results
      quickStatsCache.data = newStats;
      quickStatsCache.timestamp = now;
      
      setStats(newStats);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading quick stats:', error);
        // Keep existing stats on error
      }
    } finally {
      setIsLoading(false);
      quickStatsCache.isLoading = false;
    }
  };

  useEffect(() => {
    loadQuickStats();

    // Reload when demo data cleared
    const onDemoCleared = () => {
      quickStatsCache.data = null;
      quickStatsCache.timestamp = 0;
      loadQuickStats(true);
    };
    window.addEventListener('knxw-demo-data-cleared', onDemoCleared);

    return () => {
      window.removeEventListener('knxw-demo-data-cleared', onDemoCleared);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const statItems = [
    {
      label: "Profiles",
      value: stats.profiles,
      icon: Users,
      color: "text-[#00d4ff]"
    },
    {
      label: "Events", 
      value: stats.events,
      icon: Activity,
      color: "text-[#10b981]"
    },
    {
      label: "Insights",
      value: stats.insights,
      icon: Brain,
      color: "text-[#fbbf24]"
    }
  ];

  return (
    <div className="space-y-3">
      {statItems.map((item, index) => (
        <Card key={index} className="bg-[#1a1a1a]/50 border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-[#a3a3a3]">{item.label}</span>
              </div>
              <div className="text-right">
                {isLoading ? (
                  <div className="w-6 h-4 bg-[#262626] animate-pulse rounded" />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}