import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, CheckCircle2, Loader2, ExternalLink, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ShopifyIntegration({ appId }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shop_domain: '',
    access_token: '',
    sync_customer_profiles: true,
    sync_order_data: true,
    enrich_metafields: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await base44.entities.ShopifyIntegrationConfig.filter({ client_app_id: appId });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setFormData({
          shop_domain: configs[0].shop_domain || '',
          access_token: configs[0].access_token || '',
          sync_customer_profiles: configs[0].sync_config?.sync_customer_profiles ?? true,
          sync_order_data: configs[0].sync_config?.sync_order_data ?? true,
          enrich_metafields: configs[0].sync_config?.enrich_metafields ?? true
        });
      }
    } catch (error) {
      console.error('Failed to load Shopify config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const payload = {
        client_app_id: appId,
        shop_domain: formData.shop_domain,
        access_token: formData.access_token,
        sync_config: {
          sync_customer_profiles: formData.sync_customer_profiles,
          sync_order_data: formData.sync_order_data,
          enrich_metafields: formData.enrich_metafields,
          sync_frequency_hours: 24
        },
        status: 'active'
      };

      if (config) {
        await base44.entities.ShopifyIntegrationConfig.update(config.id, payload);
        toast({
          title: 'Configuration Updated',
          description: 'Shopify integration settings saved'
        });
      } else {
        await base44.entities.ShopifyIntegrationConfig.create(payload);
        toast({
          title: 'Integration Enabled',
          description: 'Shopify integration configured successfully'
        });
      }
      
      loadConfig();
    } catch (error) {
      console.error('Failed to save Shopify config:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save configuration',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Shopify integration? This will stop syncing psychographic data.')) return;

    try {
      await base44.entities.ShopifyIntegrationConfig.update(config.id, {
        status: 'inactive'
      });
      toast({
        title: 'Integration Disabled',
        description: 'Shopify integration has been disconnected'
      });
      loadConfig();
    } catch (error) {
      console.error('Failed to disconnect Shopify:', error);
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
            <div className="p-3 bg-[#96bf48]/20 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-[#96bf48]" />
            </div>
            <div>
              <CardTitle className="text-white">Shopify Integration</CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Enrich customer profiles with psychographic intelligence
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
            <label className="text-sm text-[#a3a3a3] mb-2 block">Store Domain</label>
            <Input
              value={formData.shop_domain}
              onChange={(e) => setFormData({ ...formData, shop_domain: e.target.value })}
              placeholder="mystore.myshopify.com"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Admin API Access Token</label>
            <Input
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              placeholder="shpat_..."
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              Create in Shopify Admin → Apps → Develop apps → Create private app
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#262626]">
            <h4 className="text-white font-semibold text-sm">Sync Settings</h4>
            
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div>
                <p className="text-sm text-white font-medium">Sync Customer Profiles</p>
                <p className="text-xs text-[#6b7280]">Match customers to psychographic profiles</p>
              </div>
              <Switch
                checked={formData.sync_customer_profiles}
                onCheckedChange={(checked) => setFormData({ ...formData, sync_customer_profiles: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div>
                <p className="text-sm text-white font-medium">Sync Order Data</p>
                <p className="text-xs text-[#6b7280]">Link purchases to psychological profiles</p>
              </div>
              <Switch
                checked={formData.sync_order_data}
                onCheckedChange={(checked) => setFormData({ ...formData, sync_order_data: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div>
                <p className="text-sm text-white font-medium">Enrich Metafields</p>
                <p className="text-xs text-[#6b7280]">Add psychographic data to customer metafields</p>
              </div>
              <Switch
                checked={formData.enrich_metafields}
                onCheckedChange={(checked) => setFormData({ ...formData, enrich_metafields: checked })}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00d4ff]" />
            Use Cases
          </h4>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
              <span>Segment product recommendations by cognitive style</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
              <span>Personalize email campaigns based on risk profile</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
              <span>Identify high-churn-risk customers for retention</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
              <span>Create customer segments by motivation for targeted marketing</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.shop_domain || !formData.access_token}
            className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              config ? 'Update Configuration' : 'Enable Integration'
            )}
          </Button>

          {config?.status === 'active' && (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Disconnect
            </Button>
          )}
        </div>

        <a
          href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Shopify API Documentation
        </a>
      </CardContent>
    </Card>
  );
}