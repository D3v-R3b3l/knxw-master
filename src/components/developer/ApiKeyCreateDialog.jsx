import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const SCOPES = ['events:write', 'profiles:read', 'insights:read', 'recommendations:read'];

export default function ApiKeyCreateDialog({ open, onOpenChange, form, setForm, onSubmit, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#262626] text-white">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">Create a scoped key with custom rate limits.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#0a0a0a] border-[#262626] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rate limit / min</Label>
              <Input type="number" value={form.rate_limit_rpm} onChange={(e) => setForm({ ...form, rate_limit_rpm: Number(e.target.value) })} className="bg-[#0a0a0a] border-[#262626] text-white" />
            </div>
            <div>
              <Label>Burst</Label>
              <Input type="number" value={form.rate_limit_burst} onChange={(e) => setForm({ ...form, rate_limit_burst: Number(e.target.value) })} className="bg-[#0a0a0a] border-[#262626] text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Scopes</Label>
            {SCOPES.map((scope) => (
              <label key={scope} className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={form.scopes.includes(scope)}
                  onCheckedChange={(checked) => setForm({
                    ...form,
                    scopes: checked ? [...form.scopes, scope] : form.scopes.filter((item) => item !== scope)
                  })}
                />
                <span>{scope}</span>
              </label>
            ))}
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {loading ? 'Creating...' : 'Create key'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}