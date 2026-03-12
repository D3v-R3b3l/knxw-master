import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PsychographicCohortTable({ users = [] }) {
  const cohorts = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      const key = user.cognitive_style || 'unknown';
      if (!map[key]) map[key] = [];
      map[key].push(user);
    });

    return Object.entries(map).map(([style, group]) => ({
      style,
      count: group.length,
      avgRisk: Math.round((group.reduce((sum, user) => sum + user.churn_score, 0) / group.length) * 100),
      projected30d: Math.round((group.reduce((sum, user) => sum + Math.min(1, user.churn_score + 0.28), 0) / group.length) * 100),
    })).sort((a, b) => b.avgRisk - a.avgRisk);
  }, [users]);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white text-base">Cohorts by Cognitive Style</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cohorts.map((cohort) => (
          <div key={cohort.style} className="rounded-lg border border-[#262626] bg-[#0f0f0f] p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold capitalize text-white">{cohort.style}</div>
              <Badge className="bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30">{cohort.count} users</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[#6b7280]">Current risk</div>
                <div className="font-semibold text-white">{cohort.avgRisk}%</div>
              </div>
              <div>
                <div className="text-[#6b7280]">Projected 30d</div>
                <div className="font-semibold text-[#fbbf24]">{cohort.projected30d}%</div>
              </div>
            </div>
          </div>
        ))}
        {cohorts.length === 0 && <div className="text-sm text-[#6b7280]">No cohort data available for the current filters.</div>}
      </CardContent>
    </Card>
  );
}