import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { callWithRetry } from "@/components/system/apiRetry";
import logger from "@/components/system/logger";

// Helpers
const LS_SELECTED_APP = "knxw_selected_app_id";
const MAX_EVENTS = 500;
const MIN_LOAD_INTERVAL_MS = 5000; // 5 seconds minimum between loads

// Global state to prevent multiple simultaneous loads across component re-renders
const globalLoadState = {
  isLoading: false,
  lastLoadTime: 0,
  lastLoadedAppId: null
};

function normalizeOrigins(app) {
  const arr = Array.isArray(app?.authorized_domains) ? app.authorized_domains : [];
  return arr.filter(Boolean).map((d) => {
    if (/^https?:\/\//i.test(d)) return d.replace(/\/+$/, "");
    if (d.startsWith("localhost") || d.startsWith("127.0.0.1")) return `http://${d}`;
    return `https://${d}`;
  });
}

function eventMatchesApp(event, origins) {
  if (!origins?.length) return true;
  const url = event?.event_payload?.url || "";
  return origins.some((o) => url.startsWith(o));
}

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(() => {
    try {
      return localStorage.getItem(LS_SELECTED_APP) || null;
    } catch {
      return null;
    }
  });
  const [appOrigins, setAppOrigins] = useState([]);

  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeUsers: 0,
    avgEngagement: "0",
    totalInsights: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  const userIdsInScope = useMemo(() => {
    const s = new Set();
    events.forEach((e) => {
      if (e?.user_id) s.add(e.user_id);
    });
    return s;
  }, [events]);

  // Load apps once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await base44.entities.ClientApp.list("-created_date", 50);
        if (!mounted) return;
        setApps(list || []);
        const fromLs = (() => {
          try { return localStorage.getItem(LS_SELECTED_APP); } catch { return null; }
        })();
        const initial =
          (fromLs && list?.some(a => a.id === fromLs) && fromLs) ||
          (list?.[0]?.id || null);
        setSelectedAppId(initial);
        if (initial) {
          const app = list.find(a => a.id === initial);
          setAppOrigins(normalizeOrigins(app));
        }
      } catch (e) {
        logger.warn("Failed to load ClientApp list:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Handle app selection persistence + origins
  const selectApp = useCallback((id) => {
    setSelectedAppId(id);
    try { localStorage.setItem(LS_SELECTED_APP, id || ""); } catch {}
    const app = apps.find(a => a.id === id);
    setAppOrigins(normalizeOrigins(app));
    // Reset global state when switching apps
    globalLoadState.lastLoadedAppId = null;
    globalLoadState.lastLoadTime = 0;
  }, [apps]);

  // Listen for app deletion events
  useEffect(() => {
    const handleAppDeleted = async () => {
      try {
        const list = await base44.entities.ClientApp.list("-created_date", 50);
        setApps(list || []);
        
        if (list && list.length > 0) {
          const stillExists = list.some(a => a.id === selectedAppId);
          if (!stillExists) {
            selectApp(list[0].id);
          }
        } else {
          selectApp(null);
        }
      } catch (e) {
        logger.warn("Failed to refresh apps after deletion:", e);
      }
    };

    window.addEventListener('knxw-app-deleted', handleAppDeleted);
    return () => window.removeEventListener('knxw-app-deleted', handleAppDeleted);
  }, [selectedAppId, selectApp]);

  // Ensure a ClientApp is selected (no auto-creation)
  useEffect(() => {
    if (selectedAppId) return;
    if (Array.isArray(apps) && apps.length > 0) {
      selectApp(apps[0]?.id);
    }
  }, [apps, selectedAppId, selectApp]);

  // Compute metrics - stable function
  const computeMetrics = useCallback((profilesData, eventsData, insightsData) => {
    const totalEvents = eventsData.length;
    const activeUsers = new Set(
      eventsData
        .filter((ev) => {
          const now = Date.now();
          const t = new Date(ev.timestamp).getTime();
          return now - t < 24 * 60 * 60 * 1000;
        })
        .map((ev) => ev.user_id)
        .filter(Boolean)
    ).size;

    const engagement =
      totalEvents > 0
        ? ((eventsData.filter((e) => e.event_type === "click").length / totalEvents) * 100).toFixed(1)
        : "0";

    return {
      totalUsers: profilesData.length,
      totalEvents,
      activeUsers,
      avgEngagement: engagement,
      totalInsights: insightsData.length
    };
  }, []);

  // Load all data - SINGLE LOAD ONLY, with aggressive deduplication
  const loadDashboardData = useCallback(async (appId, origins) => {
    // Ultra-aggressive deduplication checks
    const now = Date.now();
    
    // Check 1: Already loading globally
    if (globalLoadState.isLoading) {
      logger.info("Dashboard load already in progress globally, skipping");
      return;
    }

    globalLoadState.isLoading = true;
    setIsLoading(true);

    try {
      logger.info(`Loading dashboard data for app: ${appId}`);

      // 1. Fetch events (include demo data)
      const fetchedEvents = await callWithRetry(
        () => base44.entities.CapturedEvent.list("-timestamp", MAX_EVENTS),
        { retries: 2, baseDelayMs: 1000, maxDelayMs: 5000, retryOnStatus: [429, 502, 503, 504] }
      );

      const filteredEvents = fetchedEvents.filter((e) => eventMatchesApp(e, origins));
      setEvents(filteredEvents);

      // 2. Wait before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Fetch profiles — show ALL profiles (they belong to the same app/account)
      const profilesRaw = await callWithRetry(
        () => base44.entities.UserPsychographicProfile.list("-last_analyzed", 100),
        { retries: 2, baseDelayMs: 1000, maxDelayMs: 5000, retryOnStatus: [429, 502, 503, 504] }
      );
      setProfiles(profilesRaw);

      // 4. Wait before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Fetch insights — show ALL insights
      const insightsRaw = await callWithRetry(
        () => base44.entities.PsychographicInsight.list("-created_date", 50),
        { retries: 2, baseDelayMs: 1000, maxDelayMs: 5000, retryOnStatus: [429, 502, 503, 504] }
      );
      setInsights(insightsRaw);

      logger.info(`Loaded: ${filteredEvents.length} events, ${profilesRaw.length} profiles, ${insightsRaw.length} insights`);

      // 6. Compute metrics
      const computedMetrics = computeMetrics(profilesRaw, filteredEvents, insightsRaw);
      setMetrics(computedMetrics);

      // Update global state
      globalLoadState.lastLoadedAppId = appId;
      globalLoadState.lastLoadTime = Date.now();
      
      logger.info("Dashboard data loaded successfully");
    } catch (e) {
      logger.error("Failed to load dashboard data:", e);
    } finally {
      setIsLoading(false);
      globalLoadState.isLoading = false;
    }
  }, [computeMetrics]);

  // Load on app selection or when returning to dashboard
  useEffect(() => {
    // Reset global state so returning to dashboard always reloads
    globalLoadState.lastLoadedAppId = null;
    globalLoadState.lastLoadTime = 0;

    if (!selectedAppId || !appOrigins) {
      return;
    }

    loadDashboardData(selectedAppId, appOrigins);
  }, [selectedAppId, appOrigins]);

  // Manual refresh function
  const refreshData = useCallback(async (force = false) => {
    if (!selectedAppId) {
      logger.warn("Cannot refresh: No app selected.");
      return;
    }

    if (globalLoadState.isLoading && !force) {
      logger.info("Load already in progress");
      return;
    }

    // Force refresh bypasses time check
    if (!force) {
      const now = Date.now();
      if ((now - globalLoadState.lastLoadTime) < MIN_LOAD_INTERVAL_MS) {
        logger.warn(`Please wait ${Math.round((MIN_LOAD_INTERVAL_MS - (now - globalLoadState.lastLoadTime)) / 1000)}s before refreshing again`);
        return;
      }
    }

    // Reset global state to allow refresh
    globalLoadState.lastLoadedAppId = null;
    globalLoadState.lastLoadTime = 0;

    await loadDashboardData(selectedAppId, appOrigins);
  }, [selectedAppId, appOrigins, loadDashboardData]);

  const value = useMemo(() => ({
    apps,
    selectedAppId,
    selectApp,
    setSelectedAppId: selectApp,
    appOrigins,
    events,
    insights,
    profiles,
    metrics,
    isLoading,
    refreshData,
    userIdsInScope
  }), [apps, selectedAppId, selectApp, appOrigins, events, insights, profiles, metrics, isLoading, refreshData, userIdsInScope]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardStore() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    logger.warn("useDashboardStore called outside of DashboardProvider, returning defaults");
    return {
      apps: [],
      selectedAppId: null,
      selectApp: () => {},
      setSelectedAppId: () => {},
      appOrigins: [],
      events: [],
      insights: [],
      profiles: [],
      metrics: {
        totalUsers: 0,
        totalEvents: 0,
        activeUsers: 0,
        avgEngagement: "0",
        totalInsights: 0
      },
      isLoading: false,
      refreshData: () => {},
      userIdsInScope: new Set()
    };
  }
  return ctx;
}