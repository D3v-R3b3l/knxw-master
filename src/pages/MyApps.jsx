import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Copy, Check, Trash2, Loader2, Plus, Globe, ExternalLink, Code, Brain, ArrowRight, Zap, BarChart2, Info, Pencil, X, Key, Sparkles, ChevronDown, ChevronUp, AlertTriangle, RefreshCw, Activity } from "lucide-react";
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

const SCRIPT_CDN = `${window.location.origin}/functions/serveAnalyticsScript`;

function getSnippet(tab, appId = 'YOUR_APP_ID') {
  if (tab === 'html') return `<!-- Paste into your <head> tag -->
<!-- Store your API key as an environment variable: KNXW_API_KEY -->
<script src="${SCRIPT_CDN}?app_id=${appId}"
  data-api-key="YOUR_KNXW_API_KEY"
  async>
</script>`;
  if (tab === 'react') return `// Add once in your root component (App.jsx / App.tsx)
// Store your key in .env: NEXT_PUBLIC_KNXW_API_KEY=your_key_here
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = '${SCRIPT_CDN}?app_id=${appId}';
    s.setAttribute('data-api-key', process.env.NEXT_PUBLIC_KNXW_API_KEY);
    s.async = true;
    s.onload = () => window.knxw?.init();
    document.head.appendChild(s);
  }, []);
  // ...rest of your app
}`;
  if (tab === 'js') return `// In your entry file (index.js / main.ts)
// Store your key in .env: VITE_KNXW_API_KEY=your_key_here
const s = document.createElement('script');
s.src = '${SCRIPT_CDN}?app_id=${appId}';
s.setAttribute('data-api-key', import.meta.env.VITE_KNXW_API_KEY);
s.async = true;
s.onload = () => window.knxw?.init();
document.head.appendChild(s);`;
  if (tab === 'angular') return `// In AppComponent (app.component.ts)
// Store your key in environment.ts: knxwApiKey: 'your_key_here'
import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';

@Component({ selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent implements OnInit {
  ngOnInit() {
    const s = document.createElement('script');
    s.src = '${SCRIPT_CDN}?app_id=${appId}';
    s.setAttribute('data-api-key', environment.knxwApiKey);
    s.async = true;
    s.onload = () => (window as any).knxw?.init();
    document.head.appendChild(s);
  }
}`;
  return '';
}

const ADAPTIVE_TABS = [['react','React / Next.js'], ['html','HTML / Vanilla'], ['vue','Vue'], ['angular','Angular']];

function getAdaptiveSnippet(tab, appId = 'YOUR_APP_ID') {
  if (tab === 'react') return `// 1. Install (no package needed — uses the global window.knxw from your tracking snippet)
// 2. Create a component that reads the live psychographic profile and adapts your UI

import { useState, useEffect } from 'react';

// Hook: subscribe to live profile updates from the knXw SDK
function useKnxwProfile() {
  const [profile, setProfile] = useState(window.knxw?.getProfile?.() || null);
  useEffect(() => {
    const unsub = window.knxw?.onProfileUpdate?.(setProfile);
    return () => unsub?.();
  }, []);
  return profile;
}

// Example: adaptive CTA button
export function AdaptiveCTA({ defaultLabel = 'Get Started' }) {
  const profile = useKnxwProfile();
  const motivation = profile?.motivation_stack_v2?.[0]?.label;
  const risk = profile?.risk_profile;

  const label = motivation === 'growth'   ? 'Accelerate Your Growth' :
                motivation === 'security' ? 'See How It Works First' :
                risk === 'conservative'   ? 'Start Free — No Credit Card' :
                risk === 'aggressive'     ? 'Get Started Now →' :
                defaultLabel;

  const handleClick = () => {
    window.knxw?.track('cta_clicked', { label, motivation, risk });
  };

  return <button onClick={handleClick}>{label}</button>;
}`;

  if (tab === 'html') return `<!-- After your tracking snippet, add adaptive logic in plain JS -->
<!-- The knXw SDK exposes window.knxw with profile data -->

<script>
  // Wait for the SDK to be ready
  document.addEventListener('knxw:ready', () => {
    const profile = window.knxw.getProfile();
    adaptUI(profile);
  });

  // Or poll if profile updates later
  window.knxw?.onProfileUpdate?.((profile) => adaptUI(profile));

  function adaptUI(profile) {
    if (!profile) return;
    const motivation = profile.motivation_stack_v2?.[0]?.label;
    const risk = profile.risk_profile;

    // Adapt your CTA
    const cta = document.querySelector('#main-cta');
    if (!cta) return;

    if (motivation === 'growth')        cta.textContent = 'Accelerate Your Growth';
    else if (risk === 'conservative')   cta.textContent = 'Start Free — No Credit Card';
    else if (risk === 'aggressive')     cta.textContent = 'Get Started Now →';

    // Track the adaptation
    window.knxw.track('ui_adapted', { motivation, risk, element: 'main-cta' });
  }
</script>`;

  if (tab === 'vue') return `<!-- composables/useKnxwProfile.js -->
import { ref, onMounted, onUnmounted } from 'vue';

export function useKnxwProfile() {
  const profile = ref(window.knxw?.getProfile?.() || null);
  let unsub;
  onMounted(() => {
    unsub = window.knxw?.onProfileUpdate?.((p) => { profile.value = p; });
  });
  onUnmounted(() => unsub?.());
  return profile;
}

<!-- AdaptiveCTA.vue -->
<template>
  <button @click="track">{{ label }}</button>
</template>

<script setup>
import { computed } from 'vue';
import { useKnxwProfile } from '@/composables/useKnxwProfile';

const props = defineProps({ defaultLabel: { type: String, default: 'Get Started' } });
const profile = useKnxwProfile();

const label = computed(() => {
  const motivation = profile.value?.motivation_stack_v2?.[0]?.label;
  const risk = profile.value?.risk_profile;
  if (motivation === 'growth')     return 'Accelerate Your Growth';
  if (risk === 'conservative')     return 'Start Free — No Credit Card';
  if (risk === 'aggressive')       return 'Get Started Now →';
  return props.defaultLabel;
});

const track = () => window.knxw?.track('cta_clicked', { label: label.value });
</script>`;

  if (tab === 'angular') return `// profile.service.ts — inject the knXw profile as an Observable
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KnxwProfileService {
  private _profile = new BehaviorSubject<any>(
    (window as any).knxw?.getProfile?.() || null
  );
  profile$ = this._profile.asObservable();

  constructor() {
    (window as any).knxw?.onProfileUpdate?.((p: any) => this._profile.next(p));
  }
}

// adaptive-cta.component.ts
import { Component } from '@angular/core';
import { KnxwProfileService } from './profile.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-adaptive-cta',
  template: \`<button (click)="track()">{{ label$ | async }}</button>\`
})
export class AdaptiveCTAComponent {
  label$ = this.profile.profile$.pipe(
    map(p => {
      const motivation = p?.motivation_stack_v2?.[0]?.label;
      const risk = p?.risk_profile;
      if (motivation === 'growth')   return 'Accelerate Your Growth';
      if (risk === 'conservative')   return 'Start Free — No Credit Card';
      if (risk === 'aggressive')     return 'Get Started Now →';
      return 'Get Started';
    })
  );
  constructor(private profile: KnxwProfileService) {}
  track() { (window as any).knxw?.track('cta_clicked'); }
}`;
  return '';
}

function getAdaptiveInstallPrompt(appId) {
  return `Install the knXw Adaptive SDK pattern into this project (App ID: ${appId}).

The knXw tracking snippet is already installed. Now add adaptive UI logic that reads the live psychographic profile and dynamically changes text, CTAs, and UI elements based on each user's motivation, risk profile, and cognitive style.

The global window.knxw object is available after the script loads. Key APIs:
- window.knxw.getProfile() — returns current psychographic profile snapshot
- window.knxw.onProfileUpdate(callback) — subscribe to real-time profile updates, returns unsubscribe fn
- window.knxw.track(eventName, payload) — send custom events

Profile shape:
{
  motivation_stack_v2: [{ label: string, weight: number }],  // e.g. 'growth', 'security', 'status'
  risk_profile: 'conservative' | 'moderate' | 'aggressive',
  cognitive_style: 'analytical' | 'intuitive' | 'systematic' | 'creative',
  emotional_state: { mood: string, confidence_score: number }
}

Adaptation pattern:
1. Subscribe to onProfileUpdate() in your root component / service / composable
2. Derive variant labels/content from profile fields using simple if/else or lookup maps
3. Track adaptations with window.knxw.track() so the feedback loop improves future profiles

Apply this to CTAs, hero headlines, pricing messaging, onboarding flows, and any high-value conversion elements. Keep fallback defaults for users with no profile yet.`;
}

function getInstallPrompt(appId) {
  const scriptTag = `<script src="${SCRIPT_CDN}?app_id=${appId}" data-api-key="YOUR_KNXW_API_KEY" async></script>`;
  return `Install the knXw analytics tracking script into this project.

If in a monorepo ensure it's in the web/marketing related project. Add the following script tag to the <head> of every page (or the root layout/template if using a framework):

${scriptTag}

IMPORTANT: Replace YOUR_KNXW_API_KEY with your actual key stored as an environment variable:
- Next.js / React: NEXT_PUBLIC_KNXW_API_KEY in .env.local
- Vite: VITE_KNXW_API_KEY in .env
- Angular: environment.knxwApiKey in environment.ts
- Never hardcode the key directly in source code

- The script must load on every page
- Place it in the <head> tag, not the body
- If this is a React/Next.js/Remix/Astro/Vue/Angular/etc. framework, add it to the root layout or document template
- Do not wrap it in any conditional logic, it should always load`;
}

export default function MyAppsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [snippetTab, setSnippetTab] = useState('html');
  const [adaptiveTab, setAdaptiveTab] = useState('react');
  const [adaptiveExpanded, setAdaptiveExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealedKey, setRevealedKey] = useState(null); // { id, api_key } — shown once after creation
  const [appEventCounts, setAppEventCounts] = useState({}); // appId -> event count
  const [verifying, setVerifying] = useState(false);

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
      // Load event counts for all apps
      const counts = {};
      await Promise.all(loaded.map(async (app) => {
        try {
          const events = await base44.entities.CapturedEvent.filter({ client_app_id: app.id }, '-created_date', 1);
          counts[app.id] = events.length > 0 ? events[0] : null;
        } catch { counts[app.id] = null; }
      }));
      setAppEventCounts(counts);
    } catch {
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
      setApps([]);
    }
    setLoading(false);
  };

  const handleVerifyConnection = async () => {
    if (!selectedApp) return;
    setVerifying(true);
    try {
      const events = await base44.entities.CapturedEvent.filter({ client_app_id: selectedApp.id }, '-created_date', 1);
      if (events.length > 0) {
        const latest = events[0];
        const when = latest.timestamp ? format(new Date(latest.timestamp), 'MMM d, h:mm a') : 'recently';
        toast({ title: "✅ Connection verified!", description: `Last event received ${when}` });
        setAppEventCounts(prev => ({ ...prev, [selectedApp.id]: latest }));
      } else {
        toast({ title: "No events yet", description: "No events received from this app yet. Make sure your snippet is installed and your domain is authorized.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to check connection.", variant: "destructive" });
    }
    setVerifying(false);
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
        if (data?.app?.api_key) {
          setRevealedKey({ id: data.app.id, api_key: data.app.api_key });
        }
        toast({ title: "App created!", description: "Copy your API key now — it won't be shown again." });
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
                      <div className="flex gap-2 flex-shrink-0 flex-wrap">
                        <Link to={createPageUrl('ApiKeys')} className="inline-flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#00d4ff]/40 px-3 py-1.5 rounded-lg transition-colors">
                          <Key className="w-3 h-3" />API Keys
                        </Link>
                        <Button size="icon" variant="ghost" onClick={() => { setEditingApp(selectedApp.id); setEditName(selectedApp.name); setEditDomains((selectedApp.authorized_domains||[]).join(', ')); }} className="text-[#a3a3a3] hover:bg-[#262626] hover:text-white" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setAppToDelete(selectedApp); setShowDeleteDialog(true); }} disabled={deletingAppId === selectedApp.id} className="text-red-400 hover:bg-red-500/10 hover:text-red-300" title="Delete">
                          {deletingAppId === selectedApp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Connection status banner */}
                  {(() => {
                    const lastEvent = appEventCounts[selectedApp.id];
                    return lastEvent ? (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-xs text-emerald-300 font-medium">
                            Connected · last event {lastEvent.timestamp ? format(new Date(lastEvent.timestamp), 'MMM d, h:mm a') : 'recently'}
                          </span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={handleVerifyConnection} disabled={verifying} className="text-xs text-emerald-400 hover:text-emerald-300 h-7 px-2">
                          {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-amber-300 font-medium">No events received yet</p>
                            <p className="text-xs text-amber-400/70 mt-0.5">knXw only tracks users from the moment the snippet is installed. Historical visits before installation are not captured.</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={handleVerifyConnection} disabled={verifying} className="text-xs text-amber-400 hover:text-amber-300 h-7 px-2 flex-shrink-0">
                          {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Check'}
                        </Button>
                      </div>
                    );
                  })()}

                  {/* API Key — one-time reveal banner */}
                  {revealedKey?.id === selectedApp.id && (
                    <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
                      <p className="text-xs text-amber-300 font-semibold mb-2">⚠ Copy your API key now — it will not be shown again.</p>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={revealedKey.api_key} className="font-mono text-xs bg-[#0a0a0a] border-[#262626] text-[#e5e5e5] flex-1" />
                        <Button size="icon" variant="outline" onClick={() => { copyToClipboard(revealedKey.api_key, 'apikey'); setRevealedKey(null); }} className="border-[#262626] hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10 flex-shrink-0">
                          {copiedKey === 'apikey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* API Key — masked after creation */}
                  <div>
                    <label className="text-sm font-medium text-[#a3a3a3] mb-2 block">Public API Key</label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={selectedApp.api_key ? selectedApp.api_key.slice(0, 12) + '••••••••••••••••••••••••••••••••' : ''} className="font-mono text-xs bg-[#0a0a0a] border-[#262626] text-[#6b7280] flex-1" />
                    </div>
                    <div className="mt-2 p-2.5 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                      <p className="text-xs text-[#a3a3a3]">
                        <span className="text-amber-400 font-semibold">⚠ Never hardcode this key in source code.</span>{' '}
                        Store it as an environment variable (e.g. <code className="text-[#00d4ff]">NEXT_PUBLIC_KNXW_API_KEY</code> or <code className="text-[#00d4ff]">VITE_KNXW_API_KEY</code>) and reference it in the snippet. Your full key was shown once at creation — rotate it from API Keys if needed.
                      </p>
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
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <label className="text-sm font-medium text-[#a3a3a3]">Tracking Snippet — copy into your project</label>
                      <button
                        onClick={() => copyToClipboard(getInstallPrompt(selectedApp.id), 'install_prompt')}
                        className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-[#0a0a0a] font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {copiedKey === 'install_prompt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'install_prompt' ? 'Copied!' : 'Copy Install Prompt'}
                      </button>
                    </div>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {SNIPPET_TABS.map(([key, label]) => (
                        <button key={key} onClick={() => setSnippetTab(key)}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${snippetTab === key ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#a3a3a3] hover:text-white border border-[#262626]'}`}
                        >{label}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <pre className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-xs text-[#e5e5e5] overflow-x-auto font-mono leading-relaxed whitespace-pre">{getSnippet(snippetTab, selectedApp.id)}</pre>
                       <button onClick={() => copyToClipboard(getSnippet(snippetTab, selectedApp.id), 'snippet')} className="absolute top-2 right-2 p-1.5 rounded bg-[#262626] hover:bg-[#333] text-[#a3a3a3] hover:text-white transition-colors">
                        {copiedKey === 'snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* STEP 3 — Adaptive SDK */}
        {apps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">3</div>
              <h2 className="text-base font-semibold text-white">Make Your UI Adaptive</h2>
              <Badge className="bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/30 text-xs">Adaptive SDK</Badge>
            </div>
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-5 space-y-4">
                <p className="text-sm text-[#a3a3a3]">
                  The tracking snippet collects signals. The Adaptive SDK is how you <strong className="text-white">act on them</strong> — dynamically changing CTAs, headlines, and flows based on each user's live psychographic profile. No backend changes needed.
                </p>

                {/* How it works — 3 steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { n: '①', title: 'Profile builds', desc: 'knXw infers motivation, risk & cognitive style from behavioral signals in real time.' },
                    { n: '②', title: 'Your UI reads it', desc: 'Subscribe to window.knxw.onProfileUpdate() and derive content variants from profile fields.' },
                    { n: '③', title: 'Track & improve', desc: 'Call window.knxw.track() on adaptations so the feedback loop sharpens future profiles.' },
                  ].map(({ n, title, desc }) => (
                    <div key={n} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                      <div className="text-lg mb-1">{n}</div>
                      <div className="text-sm font-semibold text-white mb-1">{title}</div>
                      <div className="text-xs text-[#6b7280]">{desc}</div>
                    </div>
                  ))}
                </div>

                {/* Expand / collapse code */}
                <button
                  onClick={() => setAdaptiveExpanded(v => !v)}
                  className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#38bdf8] transition-colors font-medium"
                >
                  {adaptiveExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {adaptiveExpanded ? 'Hide code examples' : 'Show code examples'}
                </button>

                {adaptiveExpanded && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex gap-1 flex-wrap">
                        {ADAPTIVE_TABS.map(([key, label]) => (
                          <button key={key} onClick={() => setAdaptiveTab(key)}
                            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${adaptiveTab === key ? 'bg-[#a855f7] text-white' : 'bg-[#1a1a1a] text-[#a3a3a3] hover:text-white border border-[#262626]'}`}
                          >{label}</button>
                        ))}
                      </div>
                      <button
                        onClick={() => copyToClipboard(getAdaptiveInstallPrompt(selectedApp?.id), 'adaptive_prompt')}
                        className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {copiedKey === 'adaptive_prompt' ? <Check className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {copiedKey === 'adaptive_prompt' ? 'Copied!' : 'Copy AI Prompt'}
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-xs text-[#e5e5e5] overflow-x-auto font-mono leading-relaxed whitespace-pre max-h-80">{getAdaptiveSnippet(adaptiveTab, selectedApp?.id)}</pre>
                      <button onClick={() => copyToClipboard(getAdaptiveSnippet(adaptiveTab, selectedApp?.id), 'adaptive_snippet')} className="absolute top-2 right-2 p-1.5 rounded bg-[#262626] hover:bg-[#333] text-[#a3a3a3] hover:text-white transition-colors">
                        {copiedKey === 'adaptive_snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-xs text-[#6b7280]">
                      No npm install needed — <code className="text-[#a855f7]">window.knxw</code> is injected by your tracking snippet. See <Link to={createPageUrl('Documentation')} className="text-[#00d4ff] hover:underline">Adaptive UI docs</Link> for the full API reference.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 4 — Watch it work */}
        {apps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#00d4ff] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">4</div>
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