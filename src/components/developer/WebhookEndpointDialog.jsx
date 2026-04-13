import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WebhookEndpointDialog({ open, onOpenChange, form, setForm, onSubmit, loading, editing }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#262626] text-white max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit webhook endpoint' : 'Add webhook endpoint'}</DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Configure where webhook events should be delivered.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#0a0a0a] border-[#262626] text-white" />
          </div>
          <div>
            <Label>Endpoint URL</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/webhook" className="bg-[#0a0a0a] border-[#262626] text-white" />
          </div>
          <div>
            <Label>Event types</Label>
            <Input value={form.event_types} onChange={(e) => setForm({ ...form, event_types: e.target.value })} placeholder="user.created, payment.completed" className="bg-[#0a0a0a] border-[#262626] text-white" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#0a0a0a] border-[#262626] text-white min-h-[120px]" />
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {loading ? 'Saving...' : editing ? 'Save changes' : 'Add endpoint'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}