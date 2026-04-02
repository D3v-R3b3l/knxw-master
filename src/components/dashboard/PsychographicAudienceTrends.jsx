import React, { useMemo } from "react";
import { format, subDays } from "date-fns";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Target, Gauge } from "lucide-react";
import { useDashboardStore } from "./DashboardStore";
import MotivationDisplay from "./MotivationDisplay";

const MOOD_CONFIDENCE_KEYS = [
  "motivation_confidence_score",
  "emotional_state_confidence_score",
  "risk_profile_confidence_score",
  "cognitive_style_confidence_score",
  "personality_confidence_score"
];

function getBucketLabel(date) {
  return format(date, "MMM d");
}

export default function PsychographicAudienceTrends() {
  const { profiles, userIdsInScope, isLoading } = useDashboardStore();

  const scopedProfiles = useMemo(() => {
    if (!Array.isArray(profiles)) return [];
    return userIdsInScope && userIdsInScope.size
      ? profiles.filter((profile) => userIdsInScope.has(profile.user_id))
      : profiles;
  }, [profiles, userIdsInScope]);

  const summary = useMemo(() => {
    const motivationTotals = new Map();
    const riskCounts = { conservative: 0, moderate: 0, aggressive: 0, unknown: 0 };
    let confidenceSum = 0;
    let confidenceCount = 0;

    scopedProfiles.forEach((profile) => {
      const motivations = Array.isArray(profile?.motivation_stack_v2) ? profile.motivation_stack_v2 : [];
      motivations.forEach((item) => {
        if (!item?.label) return;
        motivationTotals.set(item.label, (motivationTotals.get(item.label) || 0) + (item.weight || 0));
      });

      const risk = profile?.risk_profile || "unknown";
      if (riskCounts[risk] !== undefined) riskCounts[risk] += 1;
      else riskCounts.unknown += 1;

      MOOD_CONFIDENCE_KEYS.forEach((key) => {
        const value = profile?.[key];
        if (typeof value === "number") {
          confidenceSum += value;
          confidenceCount += 1;
        }
      });
    });

    const topMotivations = Array.from(motivationTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, weight]) => ({ label, weight: Math.min(weight / Math.max(scopedProfiles.length, 1), 1) }));

    const dominantRisk = Object.entries(riskCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

    return {
      topMotivations,
      dominantRisk,
      avgConfidence: confidenceCount ? Math.round((confidenceSum / confidenceCount) * 100) : 0,
      profileCount: scopedProfiles.length
    };
  }, [scopedProfiles]);

  const trendData = useMemo(() => {
    const today = new Date();
    const buckets = Array.from({ length: 7 }).map((_, index) => {
      const day = subDays(today, 6 - index);
      return {
        key: format(day, "yyyy-MM-dd"),
        label: getBucketLabel(day),
        motivations: new Map(),
        conservative: 0,
        moderate: 0,
        aggressive: 0,
        unknown: 0,
        confidenceSum: 0,
        confidenceCount: 0,
        profiles: 0
      };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    scopedProfiles.forEach((profile) => {
      const sourceDate = profile?.last_analyzed || profile?.updated_date || profile?.created_date;
      if (!sourceDate) return;
      const bucketKey = format(new Date(sourceDate), "yyyy-MM-dd");
      const bucket = bucketMap.get(bucketKey);
      if (!bucket) return;

      bucket.profiles += 1;
      const risk = profile?.risk_profile || "unknown";
      if (bucket[risk] !== undefined) bucket[risk] += 1;
      else bucket.unknown += 1;

      const motivations = Array.isArray(profile?.motivation_stack_v2) ? profile.motivation_stack_v2 : [];
      motivations.forEach((item) => {
        if (!item?.label) return;
        bucket.motivations.set(item.label, (bucket.motivations.get(item.label) || 0) + (item.weight || 0));
      });

      MOOD_CONFIDENCE_KEYS.forEach((key) => {
        const value = profile?.[key];
        if (typeof value === "number") {
          bucket.confidenceSum += value;
          bucket.confidenceCount += 1;
        }
      });
    });

    return buckets.map((bucket) => {
      const topMotivation = Array.from(bucket.motivations.entries()).sort((a, b) => b[1] - a[1])[0];
      return {
        label: bucket.label,
        profiles: bucket.profiles,
        conservative: bucket.profiles ? Math.round((bucket.conservative / bucket.profiles) * 100) : 0,
        moderate: bucket.profiles ? Math.round((bucket.moderate / bucket.profiles) * 100) : 0,
        aggressive: bucket.profiles ? Math.round((bucket.aggressive / bucket.profiles) * 100) : 0,
        confidence: bucket.confidenceCount ? Math.round((bucket.confidenceSum / bucket.confidenceCount) * 100) : 0,
        topMotivation: topMotivation?.[0] || "None"
      };
    });
  }, [scopedProfiles]);

  return (
    <Card className="bg-[#111111] border-[#262626] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.2)] hover:border-[#00d4ff]/40">
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-[#00d4ff]" />
              Audience Psychographic Trends
            </CardTitle>
            <p className="text-sm text-[#a3a3a3] mt-2">
              Track how motivation, risk orientation, and model confidence are shifting across your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-3 min-w-[160px]">
              <div className="flex items-center gap-2 text-xs text-[#a3a3a3] mb-1"><Target className="w-3 h-3 text-[#fbbf24]" />Leading motivations</div>
              <MotivationDisplay motivations={summary.topMotivations} showWeights compact />
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-3 min-w-[160px]">
              <div className="flex items-center gap-2 text-xs text-[#a3a3a3] mb-1"><Shield className="w-3 h-3 text-[#10b981]" />Dominant risk</div>
              <div className="text-lg font-semibold text-white capitalize">{String(summary.dominantRisk).replaceAll("_", " ")}</div>
              <div className="text-xs text-[#6b7280] mt-1">Based on {summary.profileCount} scoped profiles</div>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-3 min-w-[160px]">
              <div className="flex items-center gap-2 text-xs text-[#a3a3a3] mb-1"><Gauge className="w-3 h-3 text-[#8b5cf6]" />Average confidence</div>
              <div className="text-lg font-semibold text-white">{summary.avgConfidence}%</div>
              <div className="text-xs text-[#6b7280] mt-1">Across profile inference signals</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#262626] bg-[#0d0d0d] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Risk orientation mix</h3>
              <Badge variant="outline" className="border-[#333333] bg-[#1a1a1a] text-[#a3a3a3]">Last 7 profile updates</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid stroke="#262626" vertical={false} />
                  <XAxis dataKey="label" stroke="#6b7280" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: "#111111", border: "1px solid #262626", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="conservative" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="moderate" stackId="1" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="aggressive" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.28} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-[#262626] bg-[#0d0d0d] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Confidence trend</h3>
              <Badge variant="outline" className="border-[#333333] bg-[#1a1a1a] text-[#a3a3a3]">Inference quality over time</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke="#262626" vertical={false} />
                  <XAxis dataKey="label" stroke="#6b7280" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#111111", border: "1px solid #262626", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Motivation pulse</h3>
            <Badge variant="outline" className="border-[#333333] bg-[#1a1a1a] text-[#a3a3a3]">Daily leading driver</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {trendData.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#262626] bg-[#121212] p-3">
                <div className="text-xs text-[#6b7280] mb-2">{item.label}</div>
                <div className="text-sm font-semibold text-white truncate">{item.topMotivation}</div>
                <div className="mt-3 text-xs text-[#a3a3a3]">Profiles analyzed: {item.profiles}</div>
                <div className="mt-2 h-1.5 rounded-full bg-[#1f1f1f] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6]" style={{ width: `${item.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {isLoading && <div className="text-sm text-[#6b7280]">Updating psychographic trend views…</div>}
      </CardContent>
    </Card>
  );
}