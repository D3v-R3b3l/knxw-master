import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const triggerOptions = [
  'high_hesitation',
  'achievement_oriented',
  'trust_seeking',
  'risk_sensitive',
  'analytical',
  'urgency_responsive'
];

export default function AdaptationRuleForm({ value, onChange, onSave, onCancel }) {
  const update = (field, next) => onChange({ ...value, [field]: next });

  const addTrigger = () => {
    update('psychographic_triggers', [...(value.psychographic_triggers || []), { key: 'high_hesitation', operator: 'equals', value: 'true' }]);
  };

  const updateTrigger = (index, field, next) => {
    const triggers = [...(value.psychographic_triggers || [])];
    triggers[index] = { ...triggers[index], [field]: next };
    update('psychographic_triggers', triggers);
  };

  const removeTrigger = (index) => {
    update('psychographic_triggers', (value.psychographic_triggers || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader><CardTitle className="text-white">Rule setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={value.name || ''} onChange={(e) => update('name', e.target.value)} placeholder="Rule name" className="bg-[#0a0a0a] border-[#262626] text-white" />
          <Textarea value={value.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="What should this rule adapt?" className="bg-[#0a0a0a] border-[#262626] text-white" />
        </CardContent>
      </Card>

      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader><CardTitle className="text-white">Psychographic triggers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(value.psychographic_triggers || []).map((trigger, index) => (
            <div key={index} className="grid md:grid-cols-[1fr_140px_1fr_40px] gap-3 items-center">
              <Select value={trigger.key} onValueChange={(next) => updateTrigger(index, 'key', next)}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{triggerOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={trigger.operator} onValueChange={(next) => updateTrigger(index, 'operator', next)}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">equals</SelectItem>
                  <SelectItem value="contains">contains</SelectItem>
                </SelectContent>
              </Select>
              <Input value={trigger.value || ''} onChange={(e) => updateTrigger(index, 'value', e.target.value)} placeholder="Value" className="bg-[#0a0a0a] border-[#262626] text-white" />
              <Button type="button" size="icon" variant="ghost" onClick={() => removeTrigger(index)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTrigger} className="border-[#262626] text-white"><Plus className="w-4 h-4 mr-2" />Add trigger</Button>
        </CardContent>
      </Card>

      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader><CardTitle className="text-white">Component target</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input value={value.component_target?.component_name || ''} onChange={(e) => update('component_target', { ...value.component_target, component_name: e.target.value })} placeholder="Component name" className="bg-[#0a0a0a] border-[#262626] text-white" />
          <Select value={value.component_target?.component_type || 'text'} onValueChange={(next) => update('component_target', { ...value.component_target, component_type: next })}>
            <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="button">Button</SelectItem>
              <SelectItem value="layout">Layout</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="modal">Modal</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader><CardTitle className="text-white">Variant mapping</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={value.variant_mapping?.variant_name || ''} onChange={(e) => update('variant_mapping', { ...value.variant_mapping, variant_name: e.target.value })} placeholder="Variant name" className="bg-[#0a0a0a] border-[#262626] text-white" />
          <Input value={value.variant_mapping?.headline || ''} onChange={(e) => update('variant_mapping', { ...value.variant_mapping, headline: e.target.value })} placeholder="Headline" className="bg-[#0a0a0a] border-[#262626] text-white" />
          <Textarea value={value.variant_mapping?.body || ''} onChange={(e) => update('variant_mapping', { ...value.variant_mapping, body: e.target.value })} placeholder="Body copy" className="bg-[#0a0a0a] border-[#262626] text-white" />
          <div className="grid md:grid-cols-2 gap-4">
            <Input value={value.variant_mapping?.cta_label || ''} onChange={(e) => update('variant_mapping', { ...value.variant_mapping, cta_label: e.target.value })} placeholder="CTA label" className="bg-[#0a0a0a] border-[#262626] text-white" />
            <Select value={value.variant_mapping?.layout_style || 'default'} onValueChange={(next) => update('variant_mapping', { ...value.variant_mapping, layout_style: next })}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="trust_heavy">Trust heavy</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#262626] text-white">Cancel</Button>
        <Button type="button" onClick={onSave} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">Save rule</Button>
      </div>
    </div>
  );
}