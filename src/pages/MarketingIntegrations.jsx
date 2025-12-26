import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plug, CheckCircle2, AlertCircle, Pause, Play, Plus, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDashboardStore } from '../components/dashboard/DashboardStore';
import PageHeader from '../components/ui/PageHeader';

export default function MarketingIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const { selectedAppId } = useDashboardStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    integration_type: 'marketo',
    credentials: {
      api_key: '',
      api_secret: '',
      endpoint_url: '',
      account_id: ''
    },
    sync_settings: {
      sync_frequency: 'hourly',
      sync_fields: ['risk_profile', 'cognitive_style', 'emotional_state', 'personality_traits'],
      field_mapping: {}
    },
    status: 'active'
  });

  useEffect(() => {
    if (selectedAppId) {
      loadIntegrations();
    }
  }, [selectedAppId]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MarketingIntegrationConfig.filter({
        client_app_id: selectedAppId
      }, '-created_date', 50);
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async () => {
    try {
      const integrationData = {
        ...formData,
        client_app_id: selectedAppId
      };

      if (editingIntegration) {
        await base44.entities.MarketingIntegrationConfig.update(editingIntegration.id, integrationData);
        toast({
          variant: 'success',
          title: 'Integration Updated',
          description: 'Marketing integration updated successfully'
        });
      } else {
        await base44.entities.MarketingIntegrationConfig.create(integrationData);
        toast({
          variant: 'success',
          title: 'Integration Created',
          description: 'Marketing integration created successfully'
        });
      }

      setShowForm(false);
      setEditingIntegration(null);
      loadIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    }
  };

  const toggleStatus = async (integration) => {
    const newStatus = integration.status === 'active' ? 'paused' : 'active';
    try {
      await base44.entities.MarketingIntegrationConfig.update(integration.id, { status: newStatus });
      toast({
        variant: 'success',
        title: `Integration ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
        description: `${integration.integration_type} integration is now ${newStatus}`
      });
      loadIntegrations();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'active') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (status === 'paused') return <Pause className="w-4 h-4 text-yellow-400" />;
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  };

  const integrationIcons = {
    marketo: '🅼',
    pardot: '🅿',
    segment: '🔷',
    salesforce_marketing_cloud: '☁️',
    adobe_analytics: '🅰',
    google_tag_manager: '🏷️'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Marketing Integrations"
          description="Connect knXw with major marketing automation platforms and CDPs"
          icon={Plug}
          docSection="marketing-integrations"
          actions={
            <Button
              onClick={() => {
                setEditingIntegration(null);
                setShowForm(!showForm);
              }}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          }
        />

        {showForm && (
          <Card className="bg-[#111111] border-[#262626] mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingIntegration ? 'Edit Integration' : 'New Integration'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Platform</Label>
                <Select value={formData.integration_type} onValueChange={(v) => setFormData({...formData, integration_type: v})}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketo">Marketo</SelectItem>
                    <SelectItem value="pardot">Pardot</SelectItem>
                    <SelectItem value="segment">Segment</SelectItem>
                    <SelectItem value="salesforce_marketing_cloud">Salesforce Marketing Cloud</SelectItem>
                    <SelectItem value="adobe_analytics">Adobe Analytics</SelectItem>
                    <SelectItem value="google_tag_manager">Google Tag Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">API Key</Label>
                  <Input
                    type="password"
                    value={formData.credentials.api_key}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: {...formData.credentials, api_key: e.target.value}
                    })}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">API Secret</Label>
                  <Input
                    type="password"
                    value={formData.credentials.api_secret}
                    onChange={(e) => setFormData({
                      ...formData,
                      credentials: {...formData.credentials, api_secret: e.target.value}
                    })}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Endpoint URL</Label>
                <Input
                  placeholder="https://api.platform.com"
                  value={formData.credentials.endpoint_url}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, endpoint_url: e.target.value}
                  })}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
              </div>

              <div>
                <Label className="text-white">Account/Report Suite ID</Label>
                <Input
                  value={formData.credentials.account_id}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {...formData.credentials, account_id: e.target.value}
                  })}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />
              </div>

              <div>
                <Label className="text-white">Sync Frequency</Label>
                <Select 
                  value={formData.sync_settings.sync_frequency} 
                  onValueChange={(v) => setFormData({
                    ...formData,
                    sync_settings: {...formData.sync_settings, sync_frequency: v}
                  })}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveIntegration} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                  {editingIntegration ? 'Update' : 'Create'} Integration
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="border-[#262626] text-white hover:bg-[#1a1a1a]">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto" />
            <p className="text-[#a3a3a3] mt-4">Loading integrations...</p>
          </div>
        ) : integrations.length === 0 ? (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-12 text-center">
              <Plug className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Integrations Yet</h3>
              <p className="text-[#a3a3a3] mb-6">Connect knXw with your marketing automation platforms</p>
              <Button onClick={() => setShowForm(true)} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integrationIcons[integration.integration_type]}</div>
                      <div>
                        <CardTitle className="text-white capitalize">
                          {integration.integration_type.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription className="text-[#a3a3a3] flex items-center gap-2 mt-1">
                          {getStatusIcon(integration.status)}
                          <span className="capitalize">{integration.status}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(integration)}
                      className="text-[#a3a3a3] hover:text-white"
                    >
                      {integration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b7280]">Sync Frequency</span>
                      <Badge variant="outline" className="text-[#a3a3a3] border-[#262626]">
                        {integration.sync_settings?.sync_frequency || 'hourly'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b7280]">Synced Fields</span>
                      <Badge variant="outline" className="text-[#a3a3a3] border-[#262626]">
                        {integration.sync_settings?.sync_fields?.length || 0}
                      </Badge>
                    </div>
                    {integration.last_sync && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">Last Sync</span>
                        <span className="text-[#a3a3a3]">
                          {new Date(integration.last_sync).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {integration.last_error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-xs text-red-400">{integration.last_error}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingIntegration(integration);
                      setFormData(integration);
                      setShowForm(true);
                    }}
                    className="w-full mt-4 border-[#262626] text-white hover:bg-[#1a1a1a]"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}