import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";

function ratio(a, b) {
  if (b === 0) return a > 0 ? 1 : 0;
  return (a - b) / b;
}

export default function HighlightsPanel({ events }) {
  const { topPages, insights } = useMemo(() => {
    const now = Date.now();
    // Split window: last 15 min vs previous 45 min for trend
    const win15 = now - 15 * 60 * 1000;
    const win60 = now - 60 * 60 * 1000;

    const byPath = new Map();
    const sessions = new Map();

    (events || []).forEach((e) => {
      const url = e?.event_payload?.url || "";
      try {
        const u = new URL(url);
        const path = u.pathname || "/";
        const k = path;
        if (!byPath.has(k)) {
          byPath.set(k, { path, total: 0, conv: 0, exits: 0, dwell: 0, countDwell: 0, last15: 0, prev45: 0 });
        }
        const row = byPath.get(k);
        row.total += 1;
        if (e.event_type === "checkout_complete") row.conv += 1;
        if (e.event_type === "time_on_page" && e.event_payload?.duration) {
          row.dwell += Number(e.event_payload.duration) || 0;
          row.countDwell += 1;
        }

        const t = new Date(e.timestamp).getTime();
        if (t >= win15) row.last15 += 1;
        else if (t >= win60) row.prev45 += 1;

        // naive exits: session's last event was page_view on this path in last 10 min
        const sk = `${e.user_id || "anon"}::${e.session_id || "sess"}`;
        const prev = sessions.get(sk);
        if (prev && prev.type === "page_view" && prev.path === path) {
          // if the next event is on a different page, treat previous as exit
          const prevRow = byPath.get(prev.path);
          if (prevRow) prevRow.exits += 1;
        }
        sessions.set(sk, { type: e.event_type, path });
      } catch {
        // ignore bad URLs
      }
    });

    const rows = Array.from(byPath.values()).map((r) => ({
      ...r,
      avgDwell: r.countDwell ? Math.round(r.dwell / r.countDwell) : 0,
      trend: ratio(r.last15, r.prev45)
    }));

    rows.sort((a, b) => b.total - a.total);
    const topPages = rows.slice(0, 5);

    // insights heuristic
    const insights = [];
    rows.forEach((r) => {
      if (r.conv > 0 && r.trend < -0.2) {
        insights.push({
          type: "warning",
          icon: TrendingDown,
          title: `Conversions down on ${r.path}`,
          desc: `Conversion down ${(Math.abs(r.trend) * 100).toFixed(0)}% in last 15m. Consider testing a clearer CTA.`,
          href: `${createPageUrl("PageAnalytics")}?path=${encodeURIComponent(r.path)}`
        });
      } else if (r.trend > 0.3 && r.total > 20) {
        insights.push({
          type: "success",
          icon: TrendingUp,
          title: `Traffic spike on ${r.path}`,
          desc: `Up ${(r.trend * 100).toFixed(0)}% vs previous 45m. Review content and capitalize.`,
          href: `${createPageUrl("PageAnalytics")}?path=${encodeURIComponent(r.path)}`
        });
      } else if (r.avgDwell < 10 && r.total > 30) {
        insights.push({
          type: "alert",
          icon: AlertTriangle,
          title: `Low dwell time on ${r.path}`,
          desc: `Avg dwell ~${r.avgDwell}s. Consider reducing friction or improving load speed.`,
          href: `${createPageUrl("PageAnalytics")}?path=${encodeURIComponent(r.path)}`
        });
      }
    });

    return { topPages, insights: insights.slice(0, 6) };
  }, [events]);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="text-white">Highlights</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Top Pages</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topPages.map((r) => (
              <div key={r.path} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                <div className="text-sm text-white truncate" title={r.path}>{r.path}</div>
                <div className="text-xs text-[#a3a3a3] mt-1">
                  Traffic: {r.total} • Conversions: {r.conv} • Bounce: {r.exits}
                </div>
                <a href={`${createPageUrl("PageAnalytics")}?path=${encodeURIComponent(r.path)}`} className="inline-flex items-center gap-1 text-xs text-[#00d4ff] mt-2 hover:underline">
                  View details <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Insights & Suggestions</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.length === 0 ? (
              <div className="text-[#a3a3a3] text-sm">No notable changes detected in the last hour.</div>
            ) : insights.map((it, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                <div className="flex items-center gap-2 text-white">
                  <it.icon className={`w-4 h-4 ${it.type === "warning" ? "text-[#f59e0b]" : it.type === "alert" ? "text-[#ef4444]" : "text-[#10b981]"}`} />
                  <div className="text-sm font-medium">{it.title}</div>
                </div>
                <div className="text-xs text-[#a3a3a3] mt-1">{it.desc}</div>
                <a href={it.href} className="inline-flex items-center gap-1 text-xs text-[#00d4ff] mt-2 hover:underline">
                  Drill down <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}