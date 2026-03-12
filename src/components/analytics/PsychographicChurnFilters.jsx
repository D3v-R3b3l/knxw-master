import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const SelectField = ({ label, value, options, onChange }) => (
  <label className="block space-y-2">
    <span className="text-xs uppercase tracking-wider text-[#6b7280]">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-[#00d4ff]/40"
    >
      <option value="all">All</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

export default function PsychographicChurnFilters({ filters, options, onChange }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardContent className="grid gap-4 p-4 md:grid-cols-3">
        <SelectField label="Cognitive Style" value={filters.cognitive_style} options={options.cognitiveStyles} onChange={(value) => onChange('cognitive_style', value)} />
        <SelectField label="Risk Profile" value={filters.risk_profile} options={options.riskProfiles} onChange={(value) => onChange('risk_profile', value)} />
        <SelectField label="Mood" value={filters.mood} options={options.moods} onChange={(value) => onChange('mood', value)} />
      </CardContent>
    </Card>
  );
}