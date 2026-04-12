import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Copy, Check, Trash2, Loader2, Plus, Globe, ExternalLink, Code, Brain, ArrowRight, Zap, BarChart2, Info, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";

function normalizeDomain(domain) {
  if (!domain) return null;
  let n = domain.trim().toLowerCase().replace(/\/+$/, '');
  if (n.includes('localhost') || n.includes('127.0.0.1')) {
    n = n.replace(/:\d+$/, '');
    return 'http://localhost';
  }
  if (!n.startsWith('http://') && !n.startsWith('https://')) n = `https://${n}`;
  return n;
}

function normalizeDisplayDomain(domain) {
  if (!domain) return '';
  return domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

const SNIPPET_TABS = [['html','HTML'], ['react','React / Next.js'], ['js','JS / TypeScript'], ['angular','Angular']];

function getSnippet(apiKey, tab) {
  if (tab === 'html') return `<!-- Paste into your <head> tag -->
<script src="https://cdn.knxw.ai/sdk.js"
  data-api-key="${apiKey}"
  async>
</script>`;
  if (tab === 'react') return `// npm install @knxw/sdk
// Add once in your root component (App.jsx / App.tsx)
import { useEffect } from 'react';
import { KnxwSDK } from '@knxw/sdk';

export default function App() {
  useEffect(() => { KnxwSDK.init('${apiKey}'); }, []);
  // ...rest of your app
}`;
  if (tab === 'js') return `// npm install @knxw/sdk
// In your entry file (index.js / main.ts)
import { KnxwSDK } from '@knxw/sdk';
KnxwSDK.init('${apiKey}');`;
  if (tab === 'angular') return `// npm install @knxw/sdk
// In AppComponent (app.component.ts)
import { Component, OnInit } from '@angular/core';
import { KnxwSDK } from '@knxw/sdk';

@Component({ selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent implements OnInit {
  ngOnInit() { KnxwSDK.init('${apiKey}'); }
}`;
  return '';
}

export default function MyAppsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [snippetTab, setSnippetTab] = useState('html');
  const [copiedKey, setCopiedKey] = useState(null);

  // Create form
  const [newAppName, setNewAppName] = useState("");
  const [newAppDomains, setNewAppDomains] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState("");

  // Edit state
  const [editingApp, setEditingApp] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDomains, setEditDomains] = useState("");

  // Delete
  const [deletingAppId, setDeletingAppId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  const { toast } = useToast();

  useEffect(() => { loadApps(); }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getMyClientApps');
      const loaded = response.data?.apps || [];
      setApps(loaded);
      if (loaded.length > 0) setSelectedAppId(prev => prev || loaded[0].id);
    } catch {
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
      setApps([]);
    }
    setLoading(false);
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setCreationError("");
    if (!newAppName.trim()) { setCreationError("Application name is required."); return; }
    setIsCreating(true);
    try {
      const domains = newAppDomains.split(',').map(d => normalizeDomain(d)).filter(Boolean);
      const { data, status } = await base44.functions.invoke('createClientApp', {
        name: newAppName.trim(),
        authorized_domains: [...new Set(domains)]
      });
      if (status === 201 || status === 200) {
        setNewAppName(""); setNewAppDomains("");
        toast({ title: "App created!", description: "Your new application is ready." });
        setTimeout(async () => {
          await loadApps();
          if (data?.app?.id) setSelectedAppId(data.app.id);
        }, 500);
      } else {
        setCreationError(data?.error || "Failed to create application.");
      }
    } catch (err) {
      setCreationError(err?.response?.data?.error || err?.message || "Unexpected error.");
    }
    setIsCreating(false);
  };

  const handleSaveEdit = async () => {
    try {
      const domains = editDomains.split(',').map(d => normalizeDomain(d)).filter(Boolean);
      await base44.entities.ClientApp.update(editingApp, { name: editName.trim(), authorized_domains: [...new Set(domains)] });
      setEditingApp(null);
      await loadApps();
      toast({ title: "Saved", description: "Application updated." });
    } catch {
      toast({ title: "Error", description: "Failed to update application.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setDeletingAppId(appToDelete.id);
    setShowDeleteDialog(false);
    try {
      const linked = await base44.entities.PsychographicInsight.filter({ client_app_id: appToDelete.id }, '-created_date', 200);
      await Promise.all(linked.map(i => base44.entities.PsychographicInsight.delete(i.id)));
      await base44.entities.ClientApp.delete(appToDelete.id);
      window.dispatchEvent(new CustomEvent('knxw-app-deleted', { detail: { app_id: appToDelete.id } }));
      toast({ title: "Deleted", description: `"${appToDelete.name}" has been removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete application.", variant: "destructive" });
    } finally {
      await loadApps();
      setDeletingAppId(null); setAppToDelete(null);
      setSelectedAppId(null);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const selectedApp = apps.find(a => a.id === selectedAppId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <Server className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl font-bold text-white">My Applications</h1>
          </div>
          <p className="text-[#a3a3a3]">Each application gets its own API key and tracking snippet for your website or app.</p>
        </div>

        {/* STEP 1 — Create an App */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#00d4ff] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">1</div>
            <h2 className="text-base font-semibold text-white">Create an Application</h2>
          </div>
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="pt-5">
              {creationError && (
                <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{creationError}</div>
              )}
              <form onSubmit={handleCreateApp} className="space-y-3">
                <Input
                  placeholder="Application name (e.g. My Production Site)"
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                  required
                />
                <div className="space-y-1">
                  <Input
                    placeholder="Authorized domains (e.g. https://mysite.com, http://localhost:3000)"
                    value={newAppDomains}
                    onChange={e => setNewAppDomains(e.target.value)}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                  <p className="text-xs text-[#6b7280] flex items-start gap-1.5">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#00d4ff]" />
                    The domains where your knXw snippet will run. Add your production URL and <code className="text-[#00d4ff] mx-1">http://localhost:3000</code> for local dev.
                  </p>
                </div>
                <Button type="submit" disabled={isCreating || !newAppName.trim()} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold">
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isCreating ? "Creating..." : "Create Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* STEP 2 — Install the Snippet */}
        {apps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#00d4ff] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">2</div>
              <h2 className="text-base font-semibold text-white">Install the Tracking Snippet</h2>
            </div>

            <Card className="bg-[#111111] border-[#262626]">
              {/* App Tabs */}
              {apps.length > 1 && (
                <div className="flex border-b border-[#262626] overflow-x-auto">
                  {apps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => { setSelectedAppId(app.id); setEditingApp(null); }}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 -mb-px ${
                        selectedAppId === app.id
                          ? 'border-[#00d4ff] text-white'
                          : 'border-transparent text-[#a3a3a3] hover:text-white'
                      }`}
                    >
                      {app.name}
                      {app.is_demo && <Badge className="bg-[#fbbf24] text-[#0a0a0a] border-none text-xs py-0">Demo</Badge>}
                    </button>
                  ))}
                </div>
              )}

              {selectedApp && (
                <CardContent className="pt-5 space-y-6">
                  {/* App header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {editingApp === selectedApp.id ? (
                        <div className="space-y-2">
                          <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#1a1a1a] border-[#262626] text-white font-semibold" />
                          <Input value={editDomains} onChange={e => setEditDomains(e.target.value)} className="bg-[#1a1a1a] border-[#262626] text-white text-sm" placeholder="Authorized domains" />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit} className="bg-[#10b981] hover:bg-[#059669] text-white"><Check className="w-3 h-3 mr-1" />Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingApp(null)} className="border-[#262626] text-[#a3a3a3]"><X className="w-3 h-3 mr-1" />Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-white">{selectedApp.name}</h3>
                          <Badge className={`${selectedApp.status === 'active' ? 'bg-[#10b981]' : 'bg-[#6b7280]'} text-white border-none text-xs`}>{selectedApp.status}</Badge>
                          {selectedApp.is_demo && <Badge className="bg-[#fbbf24] text-[#0a0a0a] border-none text-xs">Demo</Badge>}
                        </div>
                      )}
                    </div>
                    {editingApp !== selectedApp.id && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingApp(selectedApp.id); setEditName(selectedApp.name); setEditDomains((selectedApp.authorized_domains||[]).join(', ')); }} className="text-[#a3a3a3] hover:bg-[#262626] hover:text-white" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setAppToDelete(selectedApp); setShowDeleteDialog(true); }} disabled={deletingAppId === selectedApp.id} className="text-red-400 hover:bg-red-500/10 hover:text-red-300" title="Delete">
                          {deletingAppId === selectedApp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="text-sm font-medium text-[#a3a3a3] mb-2 block">API Key</label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={selectedApp.api_key} className="font-mono text-xs bg-[#0a0a0a] border-[#262626] text-[#e5e5e5] flex-1" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(selectedApp.api_key, 'apikey')} className="border-[#262626] hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10 flex-shrink-0">
                        {copiedKey === 'apikey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  {/* Authorized Domains */}
                  <div>
                    <label className="text-sm font-medium text-[#a3a3a3] mb-2 block">Authorized Domains</label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedApp.authorized_domains || []).map((domain, idx) => (
                        <Badge key={idx} className="bg-[#262626] text-[#e5e5e5] border border-[#404040] flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />{normalizeDisplayDomain(domain)}
                        </Badge>
                      ))}
                      {(!selectedApp.authorized_domains || selectedApp.authorized_domains.length === 0) && (
                        <p className="text-xs text-amber-400 flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />No domains configured — event capture will be restricted.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Snippet */}
                  <div>
                    <label className="text-sm font-medium text-[#a3a3a3] mb-3 block">Tracking Snippet — copy into your project</label>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {SNIPPET_TABS.map(([key, label]) => (
                        <button key={key} onClick={() => setSnippetTab(key)}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${snippetTab === key ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#a3a3a3] hover:text-white border border-[#262626]'}`}
                        >{label}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <pre className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-xs text-[#e5e5e5] overflow-x-auto font-mono leading-relaxed whitespace-pre">{getSnippet(selectedApp.api_key, snippetTab)}</pre>
                      <button onClick={() => copyToClipboard(getSnippet(selectedApp.api_key, snippetTab), 'snippet')} className="absolute top-2 right-2 p-1.5 rounded bg-[#262626] hover:bg-[#333] text-[#a3a3a3] hover:text-white transition-colors">
                        {copiedKey === 'snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* STEP 3 — Watch it work */}
        {apps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#00d4ff] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">3</div>
              <h2 className="text-base font-semibold text-white">Watch Profiles Build in Real-Time</h2>
            </div>
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-5">
                <p className="text-sm text-[#a3a3a3] mb-4">
                  Once your snippet is live, knXw automatically captures page views, clicks, scroll depth, form interactions, and exit intent — no extra code needed. Within minutes of real traffic, psychographic profiles start building.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-1.5 text-xs bg-[#00d4ff] text-[#0a0a0a] font-semibold px-3 py-2 rounded-lg hover:bg-[#0ea5e9] transition-colors">
                    <BarChart2 className="w-3 h-3" />View Dashboard
                  </Link>
                  <Link to={createPageUrl('Profiles')} className="inline-flex items-center gap-1.5 text-xs bg-[#1a1a1a] text-white border border-[#262626] px-3 py-2 rounded-lg hover:bg-[#262626] transition-colors">
                    <Brain className="w-3 h-3" />View Profiles
                  </Link>
                  <Link to={createPageUrl('Documentation')} className="inline-flex items-center gap-1.5 text-xs text-[#a3a3a3] hover:text-white transition-colors px-3 py-2">
                    <ArrowRight className="w-3 h-3" />Full Docs
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Application"
        description={`Are you sure you want to permanently delete "${appToDelete?.name}"? This cannot be undone.`}
        confirmText="Delete Application"
        cancelText="Keep Application"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}