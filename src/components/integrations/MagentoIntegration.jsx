import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { syncMagento } from '@/functions/syncMagento';
import { Store, CheckCircle2, Loader2, ExternalLink, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MagentoIntegration({ appId }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    store_url: '',
    access_token: '',
    sync_customers: true,
    sync_orders: true,
    enrich_customer_attributes: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await base44.entities.MagentoIntegrationConfig.filter({ client_app_id: appId });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setFormData({
          store_url: configs[0].store_url || '',
          access_token: '',
          sync_customers: configs[0].sync_config?.sync_customers ?? true,
          sync_orders: configs[0].sync_config?.sync_orders ?? true,
          enrich_customer_attributes: configs[0].sync_config?.enrich_customer_attributes ?? true
        });
      }
    } catch (error) {
      console.error('Failed to load Magento config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await syncMagento({
        action: 'validate',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Connection Successful',
          description: `Connected to ${response.data.data?.store_name || 'Magento store'}`
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
        store_url: formData.store_url.replace(/\/$/, ''),
        sync_config: {
          sync_customers: formData.sync_customers,
          sync_orders: formData.sync_orders,
          enrich_customer_attributes: formData.enrich_customer_attributes,
          sync_frequency_hours: 24
        },
        status: 'active'
      };

      if (formData.access_token) {
        payload.access_token = formData.access_token;
      }

      if (config) {
        await base44.entities.MagentoIntegrationConfig.update(config.id, payload);
        toast({ title: 'Configuration Updated' });
      } else {
        await base44.entities.MagentoIntegrationConfig.create(payload);
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
      const response = await syncMagento({
        action: 'batch_sync',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        toast({
          title: 'Sync Completed',
          description: `Synced ${response.data.data?.synced_count || 0} customers`
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
            <div className="p-3 bg-[#f97316]/20 rounded-xl">
              <Store className="w-6 h-6 text-[#f97316]" />
            </div>
            <div>
              <CardTitle className="text-white">Magento Integration</CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Personalize e-commerce with psychographic intelligence
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
            <label className="text-sm text-[#a3a3a3] mb-2 block">Store URL</label>
            <Input
              value={formData.store_url}
              onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
              placeholder="https://mystore.com"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Integration Access Token</label>
            <Input
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              placeholder={config ? '••••••••' : 'Enter access token'}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              Create in Admin → System → Integrations → Add New Integration
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#262626]">
            <h4 className="text-white font-semibold text-sm">Sync Settings</h4>
            
            {[
              { key: 'sync_customers', label: 'Sync Customers', desc: 'Enrich customer profiles with psychographic data' },
              { key: 'sync_orders', label: 'Analyze Orders', desc: 'Use order history for behavioral insights' },
              { key: 'enrich_customer_attributes', label: 'Custom Attributes', desc: 'Store psychographics in customer attributes' }
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

        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
            E-commerce Use Cases
          </h4>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li>• Personalize product recommendations by cognitive style</li>
            <li>• Segment customers by risk profile for promotions</li>
            <li>• Optimize checkout flow based on attention span</li>
            <li>• Predict high-value customers using motivation data</li>
          </ul>
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
            disabled={isSaving || !formData.store_url || (!config && !formData.access_token)}
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
          href="https://developer.adobe.com/commerce/webapi/rest/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9]"
        >
          <ExternalLink className="w-4 h-4" />
          Magento REST API Documentation
        </a>
      </CardContent>
    </Card>
  );
}