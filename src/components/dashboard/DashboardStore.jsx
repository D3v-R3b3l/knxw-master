import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { callWithRetry } from "@/components/system/apiRetry";
import logger from "@/components/system/logger";
import { getMyClientApps } from "@/functions/getMyClientApps";

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

function eventMatchesApp(event, appId, origins) {
  if (!event) return false;
  if (appId && event.client_app_id) {
    return event.client_app_id === appId;
  }
  if (!origins?.length) return false;
  const url = event?.event_payload?.url;
  if (!url || typeof url !== 'string') return false;
  return origins.some((origin) => url.startsWith(origin));
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

  // Load apps once — scoped to current user via backend function
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await getMyClientApps();
        const list = response?.data?.apps || [];
        if (!mounted) return;
        setApps(list);
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
        const response = await getMyClientApps();
        const list = response?.data?.apps || [];
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

  // Listen for demo data seeded — reload apps then data
  useEffect(() => {
    const handleDemoSeeded = async () => {
      try {
        const response = await getMyClientApps();
        const list = response?.data?.apps || [];
        setApps(list);
        // Select the first app (the new demo app) and trigger data load
        const firstId = list?.[0]?.id || null;
        if (firstId) {
          const app = list.find(a => a.id === firstId);
          setSelectedAppId(firstId);
          try { localStorage.setItem(LS_SELECTED_APP, firstId); } catch {}
          setAppOrigins(normalizeOrigins(app));
          globalLoadState.lastLoadedAppId = null;
          globalLoadState.lastLoadTime = 0;
        }
      } catch (e) {
        logger.warn("Failed to refresh apps after demo seed:", e);
      }
    };

    window.addEventListener('knxw-demo-data-seeded', handleDemoSeeded);
    return () => window.removeEventListener('knxw-demo-data-seeded', handleDemoSeeded);
  }, []);

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
    const now = Date.now();

    if (globalLoadState.isLoading) {
      logger.info("Dashboard load already in progress globally, skipping");
      return;
    }

    if (!appId) {
      setEvents([]);
      setProfiles([]);
      setInsights([]);
      setMetrics({
        totalUsers: 0,
        totalEvents: 0,
        activeUsers: 0,
        avgEngagement: "0",
        totalInsights: 0
      });
      setIsLoading(false);
      return;
    }

    globalLoadState.isLoading = true;
    setIsLoading(true);

    try {
      logger.info(`Loading dashboard data for app: ${appId}`);

      const fetchedEvents = await callWithRetry(
        () => base44.entities.CapturedEvent.filter({ client_app_id: appId }, "-timestamp", MAX_EVENTS),
        { retries: 2, baseDelayMs: 1000, maxDelayMs: 5000, retryOnStatus: [429, 502, 503, 504] }
      );

      const filteredEvents = fetchedEvents.filter((e) => eventMatchesApp(e, appId, origins));
      setEvents(filteredEvents);

      // Fetch profiles and insights directly by client_app_id — no cross-referencing needed
      const scopedUserIds = new Set(filteredEvents.map((event) => event.user_id).filter(Boolean));

      const [profilesRaw, insightsRaw] = await Promise.all([
        callWithRetry(
          () => base44.entities.UserPsychographicProfile.filter({ client_app_id: appId }, "-last_analyzed", 500),
          { retries: 2, baseDelayMs: 1000, maxDelayMs: 5000, retryOnStatus: [429, 502, 503, 504] }
        ),
        callWithRetry(
          () => base44.entities.PsychographicInsight.filter({ client_app_id: appId }, "-created_date", 200),
          { retries: 2, baseDelayMs: 1000, maxDelayMs: 5000, retryOnStatus: [429, 502, 503, 504] }
        )
      ]);

      setProfiles(profilesRaw);
      setInsights(insightsRaw);

      logger.info(`Loaded: ${filteredEvents.length} events, ${profilesRaw.length} profiles, ${insightsRaw.length} insights`);

      const computedMetrics = computeMetrics(profilesRaw, filteredEvents, insightsRaw);
      setMetrics(computedMetrics);

      globalLoadState.lastLoadedAppId = appId;
      globalLoadState.lastLoadTime = Date.now();

      logger.info("Dashboard data loaded successfully");
    } catch (e) {
      logger.error("Failed to load dashboard data:", e);
      setEvents([]);
      setProfiles([]);
      setInsights([]);
      setMetrics({
        totalUsers: 0,
        totalEvents: 0,
        activeUsers: 0,
        avgEngagement: "0",
        totalInsights: 0
      });
    } finally {
      setIsLoading(false);
      globalLoadState.isLoading = false;
    }
  }, [computeMetrics]);

  // Load on app selection or when returning to dashboard
  useEffect(() => {
    globalLoadState.lastLoadedAppId = null;
    globalLoadState.lastLoadTime = 0;

    if (!selectedAppId) {
      setEvents([]);
      setProfiles([]);
      setInsights([]);
      setMetrics({
        totalUsers: 0,
        totalEvents: 0,
        activeUsers: 0,
        avgEngagement: "0",
        totalInsights: 0
      });
      setIsLoading(false);
      return;
    }

    loadDashboardData(selectedAppId, appOrigins);
  }, [selectedAppId, appOrigins, loadDashboardData]);

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