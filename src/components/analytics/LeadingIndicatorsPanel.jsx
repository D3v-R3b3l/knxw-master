import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, BatteryLow, Brain, Clock3, MoonStar } from 'lucide-react';

const daysSince = (date) => !date ? 999 : (Date.now() - new Date(date).getTime()) / 86400000;

export default function LeadingIndicatorsPanel({ users = [] }) {
  const indicators = useMemo(() => ({
    inactive14: users.filter((user) => daysSince(user.last_active) > 14).length,
    staleProfiles: users.filter((user) => (user.staleness_score || 0) > 0.5).length,
    negativeMood: users.filter((user) => ['negative', 'anxious'].includes(user.mood)).length,
    lowEnergy: users.filter((user) => user.energy_level === 'low').length,
    highNeuroticism: users.filter((user) => (user.neuroticism || 0) > 0.7).length,
  }), [users]);

  const items = [
    { label: 'Inactive 14+ days', value: indicators.inactive14, icon: Clock3, color: 'text-red-400' },
    { label: 'Stale profiles', value: indicators.staleProfiles, icon: Brain, color: 'text-yellow-400' },
    { label: 'Negative / anxious mood', value: indicators.negativeMood, icon: MoonStar, color: 'text-orange-400' },
    { label: 'Low energy', value: indicators.lowEnergy, icon: BatteryLow, color: 'text-cyan-400' },
    { label: 'High neuroticism', value: indicators.highNeuroticism, icon: AlertTriangle, color: 'text-pink-400' },
  ];

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white text-base">Leading Indicators</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-[#262626] bg-[#0f0f0f] p-4">
            <item.icon className={`mb-2 h-4 w-4 ${item.color}`} />
            <div className="text-2xl font-bold text-white">{item.value}</div>
            <div className="mt-1 text-xs text-[#6b7280]">{item.label}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}