import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SandboxRunner({ state, setState, onRun, running }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Integration sandbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Event type</Label>
            <Input value={state.event_type} onChange={(e) => setState({ ...state, event_type: e.target.value })} className="bg-[#0a0a0a] border-[#262626] text-white" />
          </div>
          <div>
            <Label>User ID</Label>
            <Input value={state.user_id} onChange={(e) => setState({ ...state, user_id: e.target.value })} className="bg-[#0a0a0a] border-[#262626] text-white" />
          </div>
        </div>
        <div>
          <Label>Payload</Label>
          <Textarea value={state.payload} onChange={(e) => setState({ ...state, payload: e.target.value })} className="bg-[#0a0a0a] border-[#262626] text-white font-mono min-h-[220px]" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[#262626] bg-[#0a0a0a] p-4">
          <div>
            <div className="text-sm font-medium text-white">Simulate server-side failure</div>
            <div className="text-xs text-[#6b7280]">Force a failed delivery to inspect failure handling.</div>
          </div>
          <Switch checked={state.simulate_failure} onCheckedChange={(checked) => setState({ ...state, simulate_failure: checked })} />
        </div>
        <Button onClick={onRun} disabled={running} className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
          {running ? 'Running...' : 'Trigger test event'}
        </Button>
      </CardContent>
    </Card>
  );
}