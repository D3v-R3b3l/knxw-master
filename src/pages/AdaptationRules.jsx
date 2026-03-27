import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, SlidersHorizontal, PlayCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdaptationRuleForm from '@/components/adaptation-rules/AdaptationRuleForm';
import AdaptationRuleSimulator from '@/components/adaptation-rules/AdaptationRuleSimulator';

const emptyRule = {
  name: '',
  description: '',
  status: 'draft',
  psychographic_triggers: [],
  component_target: { component_name: '', component_type: 'text' },
  variant_mapping: { variant_name: '', headline: '', body: '', cta_label: '', layout_style: 'default' }
};

export default function AdaptationRules() {
  const queryClient = useQueryClient();
  const [selectedAppId, setSelectedAppId] = useState('');
  const [editingRule, setEditingRule] = useState(null);
  const [draft, setDraft] = useState(emptyRule);

  const { data: apps = [] } = useQuery({
    queryKey: ['adaptation-client-apps'],
    queryFn: () => base44.entities.ClientApp.list('-created_date', 50)
  });

  useEffect(() => {
    if (apps.length && !selectedAppId) setSelectedAppId(apps[0].id);
  }, [apps, selectedAppId]);

  const { data: rules = [] } = useQuery({
    queryKey: ['adaptation-rules', selectedAppId],
    queryFn: () => base44.entities.AdaptationRule.filter({ client_app_id: selectedAppId }, '-created_date', 100),
    enabled: !!selectedAppId
  });

  const saveMutation = useMutation({
    mutationFn: async (rule) => {
      const me = await base44.auth.me();
      const payload = { ...rule, client_app_id: selectedAppId, owner_id: me.id };
      if (editingRule?.id) return base44.entities.AdaptationRule.update(editingRule.id, payload);
      return base44.entities.AdaptationRule.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adaptation-rules'] });
      setEditingRule(null);
      setDraft(emptyRule);
    }
  });

  const startCreate = () => {
    setEditingRule(null);
    setDraft(emptyRule);
  };

  const startEdit = (rule) => {
    setEditingRule(rule);
    setDraft(rule);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Adaptation Rules"
          description="Map psychographic triggers to UI variants and test the result before SDK deployment."
          icon={SlidersHorizontal}
          actions={<Button onClick={startCreate} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"><Plus className="w-4 h-4 mr-2" />New Rule</Button>}
        />

        <div className="mb-6">
          <Select value={selectedAppId} onValueChange={setSelectedAppId}>
            <SelectTrigger className="w-full md:w-80 bg-[#111111] border-[#262626] text-white"><SelectValue placeholder="Select app" /></SelectTrigger>
            <SelectContent>
              {apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626]">
            <TabsTrigger value="rules" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">Rules</TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">Simulator</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="grid lg:grid-cols-[360px_1fr] gap-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader><CardTitle className="text-white">Existing rules</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {rules.length === 0 ? (
                  <div className="text-sm text-[#a3a3a3]">No adaptation rules yet.</div>
                ) : rules.map((rule) => (
                  <button key={rule.id} onClick={() => startEdit(rule)} className="w-full text-left p-4 rounded-xl border border-[#262626] hover:border-[#00d4ff]/40 bg-black/20">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-medium text-white">{rule.name}</div>
                      <Badge className={rule.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : 'bg-[#6b7280]/20 text-[#a3a3a3] border-[#262626]'}>{rule.status}</Badge>
                    </div>
                    <div className="text-sm text-[#a3a3a3] mb-3">{rule.component_target?.component_name || 'Unnamed component'} → {rule.variant_mapping?.variant_name || 'Unnamed variant'}</div>
                    <div className="flex flex-wrap gap-2">{(rule.psychographic_triggers || []).map((trigger, index) => <Badge key={index} className="bg-white/5 text-white/80 border-white/10">{trigger.key}</Badge>)}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <AdaptationRuleForm
              value={draft}
              onChange={setDraft}
              onCancel={() => { setEditingRule(null); setDraft(emptyRule); }}
              onSave={() => saveMutation.mutate(draft)}
            />
          </TabsContent>

          <TabsContent value="simulator">
            <div className="mb-4 flex items-center gap-2 text-[#a3a3a3] text-sm"><PlayCircle className="w-4 h-4" />Test both text/button variants and layout states before deployment.</div>
            <AdaptationRuleSimulator rules={rules.filter((rule) => rule.status === 'active' || rule.status === 'draft')} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}