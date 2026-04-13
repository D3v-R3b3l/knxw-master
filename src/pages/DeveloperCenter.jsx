import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createDeveloperApiKey } from '@/functions/createDeveloperApiKey';
import { rotateDeveloperApiKey } from '@/functions/rotateDeveloperApiKey';
import { sendSandboxEvent } from '@/functions/sendSandboxEvent';
import ApiKeyCreateDialog from '@/components/developer/ApiKeyCreateDialog';
import ApiKeyTable from '@/components/developer/ApiKeyTable';
import RequestLogTable from '@/components/developer/RequestLogTable';
import LanguageWrappersPanel from '@/components/developer/LanguageWrappersPanel';
import SandboxRunner from '@/components/developer/SandboxRunner';
import WebhookEndpointsPanel from '@/components/developer/WebhookEndpointsPanel';
import WebhookEndpointDialog from '@/components/developer/WebhookEndpointDialog';
import WebhookEventHistory from '@/components/developer/WebhookEventHistory';

export default function DeveloperCenter() {
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [form, setForm] = useState({ name: '', scopes: ['events:write', 'profiles:read'], rate_limit_rpm: 120, rate_limit_burst: 240 });
  const [sandboxState, setSandboxState] = useState({ event_type: 'page_view', user_id: 'sandbox_user', payload: JSON.stringify({ url: '/pricing', source: 'developer_center' }, null, 2), simulate_failure: false });
  const [runningSandbox, setRunningSandbox] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', event_types: '', description: '' });

  const selectedApp = useMemo(() => apps.find((app) => app.id === selectedAppId) || null, [apps, selectedAppId]);
  const selectedAppActiveKey = useMemo(() => apiKeys.find((key) => key.status === 'active') || null, [apiKeys]);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const clientApps = await base44.entities.ClientApp.filter({ owner_id: user.id }, '-created_date', 100);
    setApps(clientApps);
    const defaultAppId = selectedAppId || clientApps[0]?.id || '';
    setSelectedAppId(defaultAppId);

    if (defaultAppId) {
      const [keys, requestLogs, debugSessions] = await Promise.all([
        base44.entities.ApiKey.filter({ tenant_id: defaultAppId }, '-created_date', 100),
        base44.entities.ApiKeyRequestLog.filter({ client_app_id: defaultAppId }, '-timestamp', 100),
        base44.entities.WebhookDebugSession.filter({ client_app_id: defaultAppId }, '-created_date', 50)
      ]);
      setApiKeys(keys);
      setLogs(requestLogs);
      setSessions(debugSessions);
    } else {
      setApiKeys([]);
      setLogs([]);
      setSessions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedAppId) return;
    Promise.all([
      base44.entities.ApiKey.filter({ tenant_id: selectedAppId }, '-created_date', 100),
      base44.entities.ApiKeyRequestLog.filter({ client_app_id: selectedAppId }, '-timestamp', 100),
      base44.entities.WebhookDebugSession.filter({ client_app_id: selectedAppId }, '-created_date', 50)
    ]).then(([keys, requestLogs, debugSessions]) => {
      setApiKeys(keys);
      setLogs(requestLogs);
      setSessions(debugSessions);
    });
  }, [selectedAppId]);

  const handleCreateKey = async () => {
    if (!selectedAppId) return toast.error('Select an app first');
    setSaving(true);
    const response = await createDeveloperApiKey({
      client_app_id: selectedAppId,
      name: form.name,
      scopes: form.scopes,
      rate_limit_rpm: form.rate_limit_rpm,
      rate_limit_burst: form.rate_limit_burst
    });
    setSaving(false);
    setDialogOpen(false);
    setForm({ name: '', scopes: ['events:write', 'profiles:read'], rate_limit_rpm: 120, rate_limit_burst: 240 });
    setNewSecret(response.data.full_key);
    await loadData();
    toast.success('API key created');
  };

  const handleRotateKey = async (key) => {
    const response = await rotateDeveloperApiKey({ api_key_id: key.id });
    setNewSecret(response.data.full_key);
    await loadData();
    toast.success('API key rotated');
  };

  const handleRevokeKey = async (key) => {
    await base44.entities.ApiKey.update(key.id, { status: 'revoked', revoked_at: new Date().toISOString() });
    await loadData();
    toast.success('API key revoked');
  };

  const handleRunSandbox = async () => {
    if (!selectedAppId || !selectedAppActiveKey) return toast.error('Create an active key first');
    if (!newSecret) return toast.error('Use a newly created or rotated key to run the sandbox');
    setRunningSandbox(true);
    await sendSandboxEvent({
      client_app_id: selectedAppId,
      api_key: newSecret,
      endpoint: '/api/v1/events',
      event_type: sandboxState.event_type,
      user_id: sandboxState.user_id,
      payload: JSON.parse(sandboxState.payload),
      simulate_failure: sandboxState.simulate_failure
    });
    setRunningSandbox(false);
    await loadData();
    toast.success('Sandbox event processed');
  };

  const webhookEndpoints = useMemo(() => (
    sessions
      .filter((session) => session.endpoint)
      .reduce((acc, session) => {
        const existing = acc.find((item) => item.url === session.endpoint);
        if (existing) return acc;
        acc.push({
          id: session.endpoint,
          name: session.name?.replace(/ sandbox test$/i, '') || 'Webhook endpoint',
          url: session.endpoint,
          event_types: [session.event_type].filter(Boolean),
          description: 'Derived from webhook delivery history',
          status: 'active'
        });
        return acc;
      }, [])
  ), [sessions]);

  const resetWebhookForm = () => {
    setWebhookForm({ name: '', url: '', event_types: '', description: '' });
    setEditingWebhook(null);
  };

  const handleOpenCreateWebhook = () => {
    resetWebhookForm();
    setWebhookDialogOpen(true);
  };

  const handleEditWebhook = (endpoint) => {
    setEditingWebhook(endpoint);
    setWebhookForm({
      name: endpoint.name || '',
      url: endpoint.url || endpoint.endpoint || '',
      event_types: (endpoint.event_types || []).join(', '),
      description: endpoint.description || ''
    });
    setWebhookDialogOpen(true);
  };

  const handleSaveWebhook = async () => {
    setWebhookSaving(true);
    setTimeout(() => {
      setWebhookSaving(false);
      setWebhookDialogOpen(false);
      toast.success(editingWebhook ? 'Webhook endpoint updated' : 'Webhook endpoint added');
      resetWebhookForm();
    }, 300);
  };

  const triggerWebhookTest = async (endpoint) => {
    if (!selectedAppId || !selectedAppActiveKey) return toast.error('Create an active key first');
    if (!newSecret) return toast.error('Use a newly created or rotated key to run a webhook test');
    await sendSandboxEvent({
      client_app_id: selectedAppId,
      api_key: newSecret,
      endpoint: endpoint.url || endpoint.endpoint,
      event_type: 'webhook.test',
      user_id: 'webhook_test_user',
      payload: { endpoint_name: endpoint.name || 'Webhook endpoint', source: 'developer_center' },
      simulate_failure: false
    });
    await loadData();
    toast.success('Webhook test fired');
  };

  const retryWebhookDelivery = async (sessionOrEndpoint) => {
    const endpoint = sessionOrEndpoint.url || sessionOrEndpoint.endpoint;
    if (!endpoint) return;
    await triggerWebhookTest({ url: endpoint, name: sessionOrEndpoint.name || 'Webhook retry' });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading developer center...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Developer Center</h1>
            <p className="text-[#a3a3a3] mt-2">Manage scoped API keys, inspect per-key traffic, test integrations, and ship with native wrappers.</p>
          </div>
          <div className="w-full md:w-80">
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
                <SelectValue placeholder="Select app" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#262626] text-white">
                {apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {newSecret && (
          <Card className="bg-[#10b981]/10 border-[#10b981]/30">
            <CardHeader>
              <CardTitle className="text-white">Copy your secret key now</CardTitle>
              <CardDescription className="text-[#a3a3a3]">This is only shown once after create or rotate.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-[#0a0a0a] border border-[#262626] p-4 font-mono text-sm break-all">{newSecret}</div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626] flex flex-wrap h-auto">
            <TabsTrigger value="keys">Keys</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="wrappers">Wrappers</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setDialogOpen(true)} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">Create API key</Button>
            </div>
            <ApiKeyTable apiKeys={apiKeys} onRotate={handleRotateKey} onRevoke={handleRevokeKey} />
          </TabsContent>

          <TabsContent value="logs">
            <RequestLogTable logs={logs} />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookEndpointsPanel
              endpoints={webhookEndpoints}
              onAdd={handleOpenCreateWebhook}
              onEdit={handleEditWebhook}
              onTest={triggerWebhookTest}
              onRetry={retryWebhookDelivery}
            />
            <WebhookEventHistory sessions={sessions} onRetry={retryWebhookDelivery} />
          </TabsContent>

          <TabsContent value="sandbox" className="space-y-6">
            {!newSecret && (
              <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/30">
                <CardContent className="p-4 text-sm text-[#fcd34d]">
                  Create or rotate a key first so the sandbox can use the full secret value.
                </CardContent>
              </Card>
            )}
            <SandboxRunner state={sandboxState} setState={setSandboxState} onRun={handleRunSandbox} running={runningSandbox} />
            <WebhookEventHistory sessions={sessions} onRetry={retryWebhookDelivery} />
          </TabsContent>

          <TabsContent value="wrappers">
            <LanguageWrappersPanel />
          </TabsContent>
        </Tabs>

        <ApiKeyCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} setForm={setForm} onSubmit={handleCreateKey} loading={saving} />
        <WebhookEndpointDialog
          open={webhookDialogOpen}
          onOpenChange={setWebhookDialogOpen}
          form={webhookForm}
          setForm={setWebhookForm}
          onSubmit={handleSaveWebhook}
          loading={webhookSaving}
          editing={!!editingWebhook}
        />
      </div>
    </div>
  );
}