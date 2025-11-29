import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDashboardStore } from "./DashboardStore";
import { callWithRetry } from "@/components/system/apiRetry";
import logger from "@/components/system/logger";

export default function EvidenceViewer() {
  const { userIdsInScope } = useDashboardStore();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const loadingRef = React.useRef(false);
  const lastLoadTimeRef = React.useRef(0);

  const loadEvidence = React.useCallback(async () => {
    // Prevent concurrent loads
    if (loadingRef.current) {
      logger.info("Evidence load already in progress, skipping");
      return;
    }

    // Rate limit to max once per 60 seconds
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    if (timeSinceLastLoad < 60000 && hasLoaded) {
      logger.info(`Evidence loaded ${Math.round(timeSinceLastLoad / 1000)}s ago, waiting`);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Use retry logic with rate limit handling
      const recent = await callWithRetry(
        () => base44.entities.HybridUserProfileUpdate.list("-created_date", 25),
        { 
          retries: 1, 
          baseDelayMs: 2000, 
          maxDelayMs: 5000,
          retryOnStatus: [429, 502, 503, 504]
        }
      );
      
      const filtered = userIdsInScope && userIdsInScope.size
        ? recent.filter((r) => userIdsInScope.has(r.user_id))
        : recent;
      
      setRows(filtered.slice(0, 12));
      setHasLoaded(true);
      lastLoadTimeRef.current = Date.now();
      logger.info("Evidence loaded successfully");
    } catch (error) {
      const status = error?.response?.status;
      if (status === 429) {
        logger.warn("Evidence viewer rate limited");
        setError("Rate limited - try again in a minute");
      } else {
        logger.error("Error loading evidence:", error);
        setError("Failed to load evidence");
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userIdsInScope, hasLoaded]);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00d4ff]" />
            Evidence & Reasoning
          </CardTitle>
          <Button
            onClick={loadEvidence}
            disabled={loading}
            size="sm"
            variant="ghost"
            className="text-[#00d4ff] hover:text-[#0ea5e9] hover:bg-[#00d4ff]/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {!hasLoaded && !loading ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-[#404040] mx-auto mb-4" />
            <p className="text-[#a3a3a3] text-sm mb-4">
              Load recent profile updates and AI reasoning
            </p>
            <Button
              onClick={loadEvidence}
              size="sm"
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              Load Evidence
            </Button>
          </div>
        ) : loading ? (
          <div className="text-[#a3a3a3] text-sm py-4 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading evidence…
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-[#fbbf24] text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
            <Button
              onClick={loadEvidence}
              size="sm"
              variant="outline"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            >
              Try Again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-[#a3a3a3] text-sm text-center py-4">
            No recent evidence in scope.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const inds = Array.isArray(r?.fused_profile?.indicators) ? r.fused_profile.indicators : [];
              return (
                <div key={r.id} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-[#6b7280]">{new Date(r.created_date || r.updated_date).toLocaleString()}</div>
                    <Badge variant="outline" className="text-xs">User: {String(r.user_id).slice(0, 8)}…</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {inds.slice(0, 4).map((i, idx) => (
                      <Badge key={idx} className="bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30 text-[10px]">
                        {i.key}: {String(i.value)} • {(Math.round((i.confidence || 0.5)*100))}%
                      </Badge>
                    ))}
                  </div>
                  {r.evidence && (
                    <p className="text-xs text-[#a3a3a3] mt-2 line-clamp-3">{r.evidence}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}