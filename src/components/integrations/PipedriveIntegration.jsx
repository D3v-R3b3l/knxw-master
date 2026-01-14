import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { syncPipedrive } from '@/functions/syncPipedrive';
import { Target, CheckCircle2, Loader2, ExternalLink, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PipedriveIntegration({ appId }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [formData, setFormData] = useState({
    api_token: '',
    company_domain: '',
    sync_persons: true,
    sync_deals: true,
    sync_organizations: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await base44.entities.PipedriveIntegrationConfig.filter({ client_app_id: appId });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setFormData({
          api_token: '',
          company_domain: configs[0].company_domain || '',
          sync_persons: configs[0].sync_config?.sync_persons ?? true,
          sync_deals: configs[0].sync_config?.sync_deals ?? true,
          sync_organizations: configs[0].sync_config?.sync_organizations ?? false
        });
      }
    } catch (error) {
      console.error('Failed to load Pipedrive config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await syncPipedrive({
        action: 'validate',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Connection Successful',
          description: `Connected to ${response.data.data?.company_name || 'Pipedrive'}`
        });
      } else {
        throw new Error(response.data?.error || 'Validation failed');
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSetupFields = async () => {
    setIsSettingUp(true);
    try {
      const response = await syncPipedrive({
        action: 'setup_fields',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Custom Fields Created',
          description: 'knXw psychographic fields are now available in Pipedrive'
        });
        loadConfig();
      } else {
        throw new Error(response.data?.error || 'Setup failed');
      }
    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        client_app_id: appId,
        company_domain: formData.company_domain,
        sync_config: {
          sync_persons: formData.sync_persons,
          sync_deals: formData.sync_deals,
          sync_organizations: formData.sync_organizations,
          sync_frequency_hours: 24
        },
        status: 'active'
      };

      if (formData.api_token) {
        payload.api_token = formData.api_token;
      }

      if (config) {
        await base44.entities.PipedriveIntegrationConfig.update(config.id, payload);
        toast({ title: 'Configuration Updated' });
      } else {
        await base44.entities.PipedriveIntegrationConfig.create(payload);
        toast({ title: 'Integration Enabled' });
      }
      
      loadConfig();
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await syncPipedrive({
        action: 'batch_sync',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Sync Completed',
          description: `Synced ${response.data.data?.synced_count || 0} persons`
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#00d4ff] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#16a34a]/20 rounded-xl">
              <Target className="w-6 h-6 text-[#16a34a]" />
            </div>
            <div>
              <CardTitle className="text-white">Pipedrive Integration</CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Enrich deals and contacts with psychographic insights
              </p>
            </div>
          </div>
          {config?.status === 'active' && (
            <Badge className="bg-[#10b981]/20 text-[#10b981] border-none">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Company Domain</label>
            <Input
              value={formData.company_domain}
              onChange={(e) => setFormData({ ...formData, company_domain: e.target.value })}
              placeholder="yourcompany.pipedrive.com"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">API Token</label>
            <Input
              type="password"
              value={formData.api_token}
              onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
              placeholder={config ? '••••••••' : 'Enter API token'}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              Find in Pipedrive → Settings → Personal preferences → API
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#262626]">
            <h4 className="text-white font-semibold text-sm">Sync Settings</h4>
            
            {[
              { key: 'sync_persons', label: 'Sync Persons', desc: 'Add psychographic data to person records' },
              { key: 'sync_deals', label: 'Sync Deals', desc: 'Add psychographic notes to deal records' },
              { key: 'sync_organizations', label: 'Sync Organizations', desc: 'Aggregate psychographics at org level' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                <div>
                  <p className="text-sm text-white font-medium">{item.label}</p>
                  <p className="text-xs text-[#6b7280]">{item.desc}</p>
                </div>
                <Switch
                  checked={formData[item.key]}
                  onCheckedChange={(checked) => setFormData({ ...formData, [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        {config?.status === 'active' && !config?.custom_field_keys?.knxw_risk_profile && (
          <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-[#fbbf24] mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Setup Required</p>
                <p className="text-[#a3a3a3] text-xs mt-1">
                  Create custom fields in Pipedrive for psychographic data
                </p>
                <Button
                  onClick={handleSetupFields}
                  disabled={isSettingUp}
                  size="sm"
                  className="mt-3 bg-[#fbbf24] hover:bg-[#f59e0b] text-black"
                >
                  {isSettingUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Custom Fields
                </Button>
              </div>
            </div>
          </div>
        )}

        {config?.last_sync && (
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
            <p className="text-sm text-[#a3a3a3]">
              Last synced: {new Date(config.last_sync).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.company_domain || (!config && !formData.api_token)}
            className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {config ? 'Update Configuration' : 'Enable Integration'}
          </Button>

          {config?.status === 'active' && (
            <>
              <Button onClick={handleTest} disabled={isTesting} variant="outline" className="border-[#262626]">
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
              </Button>
              <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="border-[#262626]">
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </>
          )}
        </div>

        <a
          href="https://developers.pipedrive.com/docs/api/v1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9]"
        >
          <ExternalLink className="w-4 h-4" />
          Pipedrive API Documentation
        </a>
      </CardContent>
    </Card>
  );
}