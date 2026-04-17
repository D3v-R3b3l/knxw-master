import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { createDeveloperApiKey } from "@/functions/createDeveloperApiKey";
import { rotateDeveloperApiKey } from "@/functions/rotateDeveloperApiKey";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Key, Plus, RefreshCw, Ban, Copy, Check, ChevronUp, ChevronDown,
  ArrowUpDown, Loader2, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { format } from "date-fns";

const SCOPES = ['events:write', 'profiles:read', 'insights:read', 'recommendations:read'];

const DEFAULT_FORM = {
  name: '',
  app_id: '',
  scopes: ['events:write', 'profiles:read'],
  rate_limit_rpm: 120,
  rate_limit_burst: 240,
};

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${active ? 'text-[#00d4ff]' : 'text-[#6b7280] hover:text-[#a3a3a3]'}`}
    >
      {label}
      {active
        ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </button>
  );
}

export default function ApiKeysPage() {
  const [apps, setApps] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAppId, setFilterAppId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');

  // create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [saving, setSaving] = useState(false);
  const [newSecret, setNewSecret] = useState(null); // shown once after create/rotate

  // revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // rotate confirmation
  const [rotateTarget, setRotateTarget] = useState(null);
  const [rotating, setRotating] = useState(false);

  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const appMap = useMemo(() => Object.fromEntries(apps.map(a => [a.id, a.name])), [apps]);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const clientApps = await base44.entities.ClientApp.filter({ owner_id: user.id }, '-created_date', 100);
    setApps(clientApps);
    const allKeys = await Promise.all(
      clientApps.map(app => base44.entities.ApiKey.filter({ tenant_id: app.id }, '-created_date', 200))
    );
    setKeys(allKeys.flat());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = keys;
    if (filterAppId !== 'all') list = list.filter(k => k.tenant_id === filterAppId);
    if (filterStatus !== 'all') list = list.filter(k => k.status === filterStatus);
    list = [...list].sort((a, b) => {
      let av = a[sortField] ?? '';
      let bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [keys, filterAppId, filterStatus, sortField, sortDir]);

  const handleCreateKey = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!form.app_id) { toast({ title: "Select an application", variant: "destructive" }); return; }
    setSaving(true);
    const response = await createDeveloperApiKey({
      client_app_id: form.app_id,
      name: form.name.trim(),
      scopes: form.scopes,
      rate_limit_rpm: form.rate_limit_rpm,
      rate_limit_burst: form.rate_limit_burst,
    });
    setSaving(false);
    setDialogOpen(false);
    setNewSecret(response.data.full_key);
    setForm({ ...DEFAULT_FORM });
    await loadData();
    toast({ title: "API key created", description: "Copy your secret key — it won't be shown again." });
  };

  const handleRotate = async () => {
    if (!rotateTarget) return;
    setRotating(true);
    const response = await rotateDeveloperApiKey({ api_key_id: rotateTarget.id });
    setNewSecret(response.data.full_key);
    setRotateTarget(null);
    setRotating(false);
    await loadData();
    toast({ title: "Key rotated", description: "Copy your new secret — it won't be shown again." });
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    await base44.entities.ApiKey.update(revokeTarget.id, { status: 'revoked' });
    setRevokeTarget(null);
    setRevoking(false);
    await loadData();
    toast({ title: "Key revoked" });
  };

  const copySecret = () => {
    if (!newSecret) return;
    navigator.clipboard.writeText(newSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openCreateForApp = (appId) => {
    setForm({ ...DEFAULT_FORM, app_id: appId || '' });
    setDialogOpen(true);
  };

  // expose globally so MyApps can trigger it
  useEffect(() => {
    window.__openApiKeyCreate = openCreateForApp;
    return () => { delete window.__openApiKeyCreate; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <Key className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">API Keys</h1>
              <p className="text-sm text-[#a3a3a3]">{keys.length} key{keys.length !== 1 ? 's' : ''} across {apps.length} app{apps.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={() => openCreateForApp('')} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold gap-2">
            <Plus className="w-4 h-4" />Create API Key
          </Button>
        </div>

        {/* One-time secret reveal */}
        {newSecret && (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-300">Copy your secret key — it will not be shown again after you dismiss this banner.</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-2.5 text-sm font-mono text-[#e5e5e5] break-all">{newSecret}</code>
              <Button size="icon" variant="outline" onClick={copySecret} className="border-[#262626] hover:border-[#00d4ff]/50 flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#a3a3a3]" />}
              </Button>
            </div>
            <button onClick={() => setNewSecret(null)} className="text-xs text-[#6b7280] hover:text-white underline">
              I've saved my key — dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterAppId} onValueChange={setFilterAppId}>
            <SelectTrigger className="w-48 bg-[#111111] border-[#262626] text-white text-sm">
              <SelectValue placeholder="All apps" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#262626] text-white">
              <SelectItem value="all">All apps</SelectItem>
              {apps.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-[#111111] border-[#262626] text-white text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#262626] text-white">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="py-16 text-center">
              <Key className="w-10 h-10 text-[#262626] mx-auto mb-3" />
              <p className="text-[#a3a3a3] text-sm">No API keys found. Create one to get started.</p>
              <Button onClick={() => openCreateForApp('')} className="mt-4 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] gap-2">
                <Plus className="w-4 h-4" />Create API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-[#262626] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#262626]">
                    <th className="px-4 py-3 text-left">
                      <SortHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader label="App" field="tenant_id" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Secret Key</span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Scopes</span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader label="Created" field="created_date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader label="Last Used" field="last_used_at" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Rate Limit</span>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((key, idx) => (
                    <tr
                      key={key.id}
                      className={`border-b border-[#1a1a1a] transition-colors ${idx % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0d0d0d]'} hover:bg-[#111111]`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-white text-sm">{key.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#a3a3a3]">{appMap[key.tenant_id] || key.tenant_id?.slice(0, 8) || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={
                          key.status === 'active'
                            ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30 border'
                            : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30 border'
                        }>
                          {key.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-[#a3a3a3] bg-[#1a1a1a] px-2 py-1 rounded font-mono">
                          {key.key_prefix ? `${key.key_prefix}••••••••` : '••••••••••••'}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(key.scopes || []).map(s => (
                            <Badge key={s} variant="outline" className="text-xs border-[#262626] text-[#a3a3a3] py-0">{s}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6b7280]">
                          {key.created_date ? format(new Date(key.created_date), 'MMM d, yyyy') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6b7280]">
                          {key.last_used_at ? format(new Date(key.last_used_at), 'MMM d, yyyy HH:mm') : 'Never'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#6b7280]">{key.rate_limit_rpm ?? 120} rpm</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {key.status === 'active' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRotateTarget(key)}
                              className="text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] h-8 px-2 text-xs gap-1"
                              title="Rotate key"
                            >
                              <RefreshCw className="w-3 h-3" />Rotate
                            </Button>
                          )}
                          {key.status === 'active' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRevokeTarget(key)}
                              className="text-[#ef4444] hover:bg-[#ef4444]/10 h-8 px-2 text-xs gap-1"
                              title="Revoke key"
                            >
                              <Ban className="w-3 h-3" />Revoke
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Key Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#111111] border-[#262626] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#00d4ff]" />Create API Key
            </DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Create a scoped key for programmatic access. The full secret is only shown once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <Label className="text-[#a3a3a3] text-sm">Key name <span className="text-red-400">*</span></Label>
              <Input
                placeholder="e.g. Production backend, CI pipeline"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
              <p className="text-xs text-[#6b7280]">Give it a descriptive name so you can identify it later.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#a3a3a3] text-sm">Application <span className="text-red-400">*</span></Label>
              <Select value={form.app_id} onValueChange={v => setForm(f => ({ ...f, app_id: v }))}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                  <SelectValue placeholder="Choose an application" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#262626] text-white">
                  {apps.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#a3a3a3] text-sm">Permissions (scopes)</Label>
              <div className="space-y-2 p-3 rounded-lg border border-[#262626] bg-[#0a0a0a]">
                {SCOPES.map(scope => (
                  <label key={scope} className="flex items-center gap-3 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.scopes.includes(scope)}
                      onCheckedChange={checked => setForm(f => ({
                        ...f,
                        scopes: checked ? [...f.scopes, scope] : f.scopes.filter(s => s !== scope)
                      }))}
                    />
                    <div>
                      <span className="text-white font-mono text-xs">{scope}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#a3a3a3] text-sm">Rate limit (req/min)</Label>
                <Input
                  type="number"
                  value={form.rate_limit_rpm}
                  onChange={e => setForm(f => ({ ...f, rate_limit_rpm: Number(e.target.value) }))}
                  className="bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#a3a3a3] text-sm">Burst allowance</Label>
                <Input
                  type="number"
                  value={form.rate_limit_burst}
                  onChange={e => setForm(f => ({ ...f, rate_limit_burst: Number(e.target.value) }))}
                  className="bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-[#a3a3a3] hover:text-white">Cancel</Button>
            <Button onClick={handleCreateKey} disabled={saving} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <DialogContent className="bg-[#111111] border-[#262626] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />Revoke API Key
            </DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Revoking <span className="font-semibold text-white">"{revokeTarget?.name}"</span> will immediately block all requests using this key. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeTarget(null)} className="text-[#a3a3a3]">Cancel</Button>
            <Button onClick={handleRevoke} disabled={revoking} className="bg-red-600 hover:bg-red-700 text-white">
              {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Confirmation Dialog */}
      <Dialog open={!!rotateTarget} onOpenChange={() => setRotateTarget(null)}>
        <DialogContent className="bg-[#111111] border-[#262626] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <RefreshCw className="w-5 h-5" />Rotate API Key
            </DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Rotating <span className="font-semibold text-white">"{rotateTarget?.name}"</span> will invalidate the current key and generate a new one. Update your integration immediately after.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRotateTarget(null)} className="text-[#a3a3a3]">Cancel</Button>
            <Button onClick={handleRotate} disabled={rotating} className="bg-amber-500 hover:bg-amber-600 text-[#0a0a0a] font-semibold">
              {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rotate key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}