import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, Users, Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import PsychographicChurnFilters from '@/components/analytics/PsychographicChurnFilters';
import LeadingIndicatorsPanel from '@/components/analytics/LeadingIndicatorsPanel';
import ChurnRiskTrajectory from '@/components/analytics/ChurnRiskTrajectory';
import PsychographicCohortTable from '@/components/analytics/PsychographicCohortTable';
import PsychographicInteractionHeatmap from '@/components/analytics/PsychographicInteractionHeatmap';

function normalizeDomain(domain) {
  return String(domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();
}

function urlMatchesDomains(url, domains) {
  if (!domains?.length || !url) return true;

  try {
    const hostname = normalizeDomain(new URL(url).hostname);
    return domains.some((domain) => hostname.includes(normalizeDomain(domain)));
  } catch {
    return domains.some((domain) => String(url).toLowerCase().includes(normalizeDomain(domain)));
  }
}

export default function ChurnAnalytics() {
  const [selectedAppId, setSelectedAppId] = useState('');
  const [filters, setFilters] = useState({ cognitive_style: 'all', risk_profile: 'all', mood: 'all' });

  const appsQuery = useQuery({
    queryKey: ['client-apps-for-churn-analytics'],
    queryFn: () => base44.entities.ClientApp.list('-created_date', 50),
    initialData: [],
  });

  useEffect(() => {
    if (!selectedAppId && appsQuery.data?.[0]?.id) setSelectedAppId(appsQuery.data[0].id);
  }, [appsQuery.data, selectedAppId]);

  const selectedApp = useMemo(() => appsQuery.data.find((app) => app.id === selectedAppId), [appsQuery.data, selectedAppId]);

  const analyticsQuery = useQuery({
    queryKey: ['psychographic-churn-analytics', selectedAppId],
    enabled: !!selectedAppId,
    queryFn: async () => {
      const [events, profiles, churnResponse] = await Promise.all([
        base44.entities.CapturedEvent.filter({ is_demo: false }, '-timestamp', 600),
        base44.entities.UserPsychographicProfile.filter({ is_demo: false }, '-last_analyzed', 300),
        base44.functions.invoke('scanChurnRisk', { app_id: selectedAppId, limit: 300 }),
      ]);

      const scopedEvents = events.filter((event) => urlMatchesDomains(event?.event_payload?.url || event?.url, selectedApp?.authorized_domains || []));
      const scopedUserIds = new Set(scopedEvents.map((event) => event.user_id).filter(Boolean));
      const scopedProfiles = profiles.filter((profile) => !scopedUserIds.size || scopedUserIds.has(profile.user_id));

      return {
        events: scopedEvents,
        profiles: scopedProfiles,
        churn: churnResponse?.data?.data || { at_risk_users: [], segments: [], total_scanned: 0, high_risk_count: 0, medium_risk_count: 0 },
      };
    },
    initialData: { events: [], profiles: [], churn: { at_risk_users: [], segments: [], total_scanned: 0, high_risk_count: 0, medium_risk_count: 0 } },
  });

  const profileByUser = useMemo(() => Object.fromEntries((analyticsQuery.data?.profiles || []).map((profile) => [profile.user_id, profile])), [analyticsQuery.data]);

  const enrichedUsers = useMemo(() => (analyticsQuery.data?.churn?.at_risk_users || []).map((user) => {
    const profile = profileByUser[user.user_id] || {};
    return {
      ...user,
      risk_profile: profile.risk_profile || 'unknown',
      mood: profile.emotional_state?.mood || 'unknown',
      energy_level: profile.emotional_state?.energy_level || 'unknown',
      staleness_score: profile.staleness_score || 0,
      neuroticism: profile.personality_traits?.neuroticism || 0,
    };
  }), [analyticsQuery.data, profileByUser]);

  const filterOptions = useMemo(() => ({
    cognitiveStyles: [...new Set(enrichedUsers.map((user) => user.cognitive_style).filter(Boolean))],
    riskProfiles: [...new Set(enrichedUsers.map((user) => user.risk_profile).filter(Boolean))],
    moods: [...new Set(enrichedUsers.map((user) => user.mood).filter(Boolean))],
  }), [enrichedUsers]);

  const filteredUsers = useMemo(() => enrichedUsers.filter((user) => {
    if (filters.cognitive_style !== 'all' && user.cognitive_style !== filters.cognitive_style) return false;
    if (filters.risk_profile !== 'all' && user.risk_profile !== filters.risk_profile) return false;
    if (filters.mood !== 'all' && user.mood !== filters.mood) return false;
    return true;
  }), [enrichedUsers, filters]);

  const summary = useMemo(() => {
    const avgRisk = filteredUsers.length ? Math.round((filteredUsers.reduce((sum, user) => sum + user.churn_score, 0) / filteredUsers.length) * 100) : 0;
    const projected30d = filteredUsers.length ? Math.round((filteredUsers.reduce((sum, user) => sum + Math.min(1, user.churn_score + 0.28), 0) / filteredUsers.length) * 100) : 0;
    return {
      filteredCount: filteredUsers.length,
      avgRisk,
      projected30d,
      highRisk: filteredUsers.filter((user) => user.risk_level === 'high').length,
    };
  }, [filteredUsers]);

  if (!appsQuery.data.length && !appsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6 text-white">
        <Card className="mx-auto max-w-2xl border-[#262626] bg-[#111111]">
          <CardContent className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-[#fbbf24]" />
            <h2 className="mb-2 text-xl font-semibold">No client apps available</h2>
            <p className="text-[#a3a3a3]">Create or connect an app first to analyze interaction divergence and churn cohorts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Churn Analytics"
          description="Psychographic interaction divergence, churn indicators, and projected cohort risk in one dedicated dashboard."
          icon={TrendingDown}
          docSection="predictive-psychographics"
          actions={
            <div className="flex items-center gap-3">
              <select
                value={selectedAppId}
                onChange={(event) => setSelectedAppId(event.target.value)}
                className="rounded-lg border border-[#262626] bg-[#111111] px-3 py-2 text-sm text-white"
              >
                {appsQuery.data.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
              </select>
              <Button onClick={() => analyticsQuery.refetch()} variant="outline" className="border-[#262626] bg-[#111111] hover:bg-[#1a1a1a]">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          }
        />

        <PsychographicChurnFilters
          filters={filters}
          options={filterOptions}
          onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        />

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Filtered cohort', value: summary.filteredCount, icon: Users, color: 'text-[#00d4ff]' },
            { label: 'Avg current risk', value: `${summary.avgRisk}%`, icon: TrendingDown, color: 'text-[#fbbf24]' },
            { label: 'Projected 30d', value: `${summary.projected30d}%`, icon: Brain, color: 'text-[#ef4444]' },
            { label: 'High-risk users', value: summary.highRisk, icon: AlertTriangle, color: 'text-[#ef4444]' },
          ].map((item) => (
            <Card key={item.label} className="border-[#262626] bg-[#111111]">
              <CardContent className="p-5">
                <item.icon className={`mb-3 h-5 w-5 ${item.color}`} />
                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-[#6b7280]">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <LeadingIndicatorsPanel users={filteredUsers} />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <ChurnRiskTrajectory users={filteredUsers} />
          <PsychographicCohortTable users={filteredUsers} />
        </div>

        <PsychographicInteractionHeatmap
          events={analyticsQuery.data?.events || []}
          profiles={analyticsQuery.data?.profiles || []}
          userIds={filteredUsers.map((user) => user.user_id)}
        />
      </div>
    </div>
  );
}