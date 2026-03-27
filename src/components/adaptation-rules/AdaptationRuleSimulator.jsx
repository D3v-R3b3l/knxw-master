import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const personas = {
  high_hesitation: { high_hesitation: 'true', trust_seeking: 'true', analytical: 'true' },
  achievement_oriented: { achievement_oriented: 'true', urgency_responsive: 'true' },
  trust_seeking: { trust_seeking: 'true', risk_sensitive: 'true' }
};

function matchesRule(rule, activeSignals) {
  return (rule.psychographic_triggers || []).every((trigger) => {
    const signal = activeSignals[trigger.key] || '';
    if (trigger.operator === 'contains') return signal.includes(trigger.value);
    return signal === trigger.value;
  });
}

export default function AdaptationRuleSimulator({ rules }) {
  const [persona, setPersona] = useState('high_hesitation');
  const activeSignals = personas[persona];
  const matchedRule = rules.find((rule) => matchesRule(rule, activeSignals));
  const variant = matchedRule?.variant_mapping || {};
  const componentType = matchedRule?.component_target?.component_type || 'card';
  const layoutStyle = variant.layout_style || 'default';

  const layoutClass = {
    default: 'max-w-xl',
    compact: 'max-w-md',
    trust_heavy: 'max-w-xl border-cyan-500/30',
    bold: 'max-w-2xl border-purple-500/30'
  }[layoutStyle];

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader><CardTitle className="text-white">Test inputs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high_hesitation">High hesitation</SelectItem>
              <SelectItem value="achievement_oriented">Achievement oriented</SelectItem>
              <SelectItem value="trust_seeking">Trust seeking</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeSignals).map(([key, value]) => (
              <Badge key={key} className="bg-white/10 text-white border-white/10">{key}</Badge>
            ))}
          </div>
          <p className="text-sm text-[#a3a3a3]">The simulator applies the first matching active rule to preview text and layout adaptation.</p>
        </CardContent>
      </Card>

      <Card className={`bg-[#111111] border-[#262626] ${layoutClass}`}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-white">Preview</CardTitle>
            {matchedRule ? <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">{matchedRule.name}</Badge> : <Badge className="bg-[#6b7280]/20 text-[#a3a3a3] border-[#262626]">No match</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`rounded-2xl border bg-black/30 p-6 ${layoutStyle === 'bold' ? 'text-center' : ''}`}>
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#6b7280]">{componentType} variant</div>
            <h3 className="text-2xl font-bold text-white mb-3">{variant.headline || 'Default headline'}</h3>
            <p className="text-[#a3a3a3] mb-6">{variant.body || 'Default body copy will appear when no adaptation rule matches.'}</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-3 rounded-lg bg-[#00d4ff] text-[#0a0a0a] font-semibold">{variant.cta_label || 'Continue'}</button>
              {layoutStyle === 'trust_heavy' && <div className="px-4 py-3 rounded-lg border border-white/10 text-sm text-white/80">Secure · Explainable · Governed</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}