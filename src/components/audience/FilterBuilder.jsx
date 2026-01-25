import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

export default function FilterBuilder({ filters, onChange }) {
  const addPsychographicFilter = (field) => {
    const updated = { ...filters };
    if (!updated.psychographic) updated.psychographic = {};
    if (!updated.psychographic[field]) updated.psychographic[field] = [];
    onChange(updated);
  };

  const updatePsychographicFilter = (field, values) => {
    const updated = { ...filters };
    if (!updated.psychographic) updated.psychographic = {};
    updated.psychographic[field] = values;
    onChange(updated);
  };

  const addValue = (field, value) => {
    const current = filters.psychographic?.[field] || [];
    if (!current.includes(value)) {
      updatePsychographicFilter(field, [...current, value]);
    }
  };

  const removeValue = (field, value) => {
    const current = filters.psychographic?.[field] || [];
    updatePsychographicFilter(field, current.filter(v => v !== value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Psychographic Filters</h3>
        
        {/* Motivations */}
        <div className="mb-4">
          <label className="text-sm text-[#a3a3a3] mb-2 block">Motivations</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {(filters.psychographic?.motivation_labels || []).map((m) => (
              <span key={m} className="px-3 py-1 bg-[#1a1a1a] border border-[#00d4ff]/40 rounded-full text-sm text-white flex items-center gap-2">
                {m}
                <button onClick={() => removeValue('motivation_labels', m)} className="hover:text-[#ef4444]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <Select onValueChange={(v) => addValue('motivation_labels', v)}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
              <SelectValue placeholder="Add motivation..." />
            </SelectTrigger>
            <SelectContent>
              {['autonomy', 'mastery', 'purpose', 'connection', 'achievement', 'security'].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Risk Profile */}
        <div className="mb-4">
          <label className="text-sm text-[#a3a3a3] mb-2 block">Risk Profile</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {(filters.psychographic?.risk_profile || []).map((r) => (
              <span key={r} className="px-3 py-1 bg-[#1a1a1a] border border-[#fbbf24]/40 rounded-full text-sm text-white flex items-center gap-2">
                {r}
                <button onClick={() => removeValue('risk_profile', r)} className="hover:text-[#ef4444]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <Select onValueChange={(v) => addValue('risk_profile', v)}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
              <SelectValue placeholder="Add risk profile..." />
            </SelectTrigger>
            <SelectContent>
              {['conservative', 'moderate', 'aggressive'].map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cognitive Style */}
        <div className="mb-4">
          <label className="text-sm text-[#a3a3a3] mb-2 block">Cognitive Style</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {(filters.psychographic?.cognitive_style || []).map((c) => (
              <span key={c} className="px-3 py-1 bg-[#1a1a1a] border border-[#8b5cf6]/40 rounded-full text-sm text-white flex items-center gap-2">
                {c}
                <button onClick={() => removeValue('cognitive_style', c)} className="hover:text-[#ef4444]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <Select onValueChange={(v) => addValue('cognitive_style', v)}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
              <SelectValue placeholder="Add cognitive style..." />
            </SelectTrigger>
            <SelectContent>
              {['analytical', 'intuitive', 'systematic', 'creative'].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Behavioral Filters</h3>
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <p className="text-sm text-[#6b7280]">Advanced behavioral filters coming soon</p>
        </div>
      </div>
    </div>
  );
}