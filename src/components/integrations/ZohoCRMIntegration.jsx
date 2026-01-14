import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { syncZohoCRM } from '@/functions/syncZohoCRM';
import { Users, CheckCircle2, Loader2, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ZohoCRMIntegration({ appId }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    client_secret: '',
    refresh_token: '',
    data_center: 'us',
    sync_contacts: true,
    sync_leads: true,
    sync_deals: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await base44.entities.ZohoCRMIntegrationConfig.filter({ client_app_id: appId });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setFormData({
          client_id: configs[0].client_id || '',
          client_secret: '',
          refresh_token: '',
          data_center: configs[0].data_center || 'us',
          sync_contacts: configs[0].sync_config?.sync_contacts ?? true,
          sync_leads: configs[0].sync_config?.sync_leads ?? true,
          sync_deals: configs[0].sync_config?.sync_deals ?? false
        });
      }
    } catch (error) {
      console.error('Failed to load Zoho config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await syncZohoCRM({
        action: 'validate',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Connection Successful',
          description: `Connected to ${response.data.data?.organization || 'Zoho CRM'}`
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        client_app_id: appId,
        client_id: formData.client_id,
        data_center: formData.data_center,
        sync_config: {
          sync_contacts: formData.sync_contacts,
          sync_leads: formData.sync_leads,
          sync_deals: formData.sync_deals,
          sync_frequency_hours: 24
        },
        status: 'active'
      };

      if (formData.client_secret) {
        payload.client_secret = formData.client_secret;
      }
      if (formData.refresh_token) {
        payload.refresh_token = formData.refresh_token;
      }

      if (config) {
        await base44.entities.ZohoCRMIntegrationConfig.update(config.id, payload);
        toast({ title: 'Configuration Updated' });
      } else {
        await base44.entities.ZohoCRMIntegrationConfig.create(payload);
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
      const response = await syncZohoCRM({
        action: 'batch_sync',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Sync Completed',
          description: `Synced ${response.data.data?.synced_count || 0} records`
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
            <div className="p-3 bg-[#dc2626]/20 rounded-xl">
              <Users className="w-6 h-6 text-[#dc2626]" />
            </div>
            <div>
              <CardTitle className="text-white">Zoho CRM Integration</CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Sync psychographic profiles to Zoho contacts and leads
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
            <label className="text-sm text-[#a3a3a3] mb-2 block">Client ID</label>
            <Input
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              placeholder="1000.XXXX..."
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Client Secret</label>
            <Input
              type="password"
              value={formData.client_secret}
              onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
              placeholder={config ? '••••••••' : 'Enter client secret'}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Refresh Token</label>
            <Input
              type="password"
              value={formData.refresh_token}
              onChange={(e) => setFormData({ ...formData, refresh_token: e.target.value })}
              placeholder={config ? '••••••••' : 'Enter refresh token'}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              Generate from Zoho API Console with offline_access scope
            </p>
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Data Center</label>
            <Select value={formData.data_center} onValueChange={(v) => setFormData({ ...formData, data_center: v })}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States (.com)</SelectItem>
                <SelectItem value="eu">Europe (.eu)</SelectItem>
                <SelectItem value="in">India (.in)</SelectItem>
                <SelectItem value="au">Australia (.com.au)</SelectItem>
                <SelectItem value="jp">Japan (.jp)</SelectItem>
                <SelectItem value="cn">China (.com.cn)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#262626]">
            <h4 className="text-white font-semibold text-sm">Sync Settings</h4>
            
            {[
              { key: 'sync_contacts', label: 'Sync Contacts', desc: 'Enrich contact records with psychographic data' },
              { key: 'sync_leads', label: 'Sync Leads', desc: 'Enrich lead records with psychographic data' },
              { key: 'sync_deals', label: 'Sync Deals', desc: 'Add psychographic context to deals' }
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
            disabled={isSaving || !formData.client_id}
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
          href="https://www.zoho.com/crm/developer/docs/api/v5/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9]"
        >
          <ExternalLink className="w-4 h-4" />
          Zoho CRM API Documentation
        </a>
      </CardContent>
    </Card>
  );
}