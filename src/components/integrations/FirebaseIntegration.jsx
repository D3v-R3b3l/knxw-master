import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { Flame, CheckCircle2, Loader2, ExternalLink, Smartphone, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function FirebaseIntegration({ appId }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    service_account_key: '',
    analytics: true,
    remote_config: true,
    cloud_messaging: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await base44.entities.FirebaseIntegrationConfig.filter({ client_app_id: appId });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setFormData({
          project_id: configs[0].project_id || '',
          service_account_key: configs[0].service_account_key || '',
          analytics: configs[0].features_enabled?.analytics ?? true,
          remote_config: configs[0].features_enabled?.remote_config ?? true,
          cloud_messaging: configs[0].features_enabled?.cloud_messaging ?? false
        });
      }
    } catch (error) {
      console.error('Failed to load Firebase config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const payload = {
        client_app_id: appId,
        project_id: formData.project_id,
        service_account_key: formData.service_account_key,
        features_enabled: {
          analytics: formData.analytics,
          remote_config: formData.remote_config,
          cloud_messaging: formData.cloud_messaging,
          firestore_sync: false
        },
        status: 'active'
      };

      if (config) {
        await base44.entities.FirebaseIntegrationConfig.update(config.id, payload);
        toast({
          title: 'Configuration Updated',
          description: 'Firebase integration settings saved'
        });
      } else {
        await base44.entities.FirebaseIntegrationConfig.create(payload);
        toast({
          title: 'Integration Enabled',
          description: 'Firebase integration configured successfully'
        });
      }
      
      loadConfig();
    } catch (error) {
      console.error('Failed to save Firebase config:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save configuration',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
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
            <div className="p-3 bg-[#ffca28]/20 rounded-xl">
              <Flame className="w-6 h-6 text-[#ffca28]" />
            </div>
            <div>
              <CardTitle className="text-white">Firebase Integration</CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Mobile app personalization with Firebase Analytics & Remote Config
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
            <label className="text-sm text-[#a3a3a3] mb-2 block">Project ID</label>
            <Input
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              placeholder="my-firebase-project"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Service Account Key (JSON)</label>
            <Textarea
              value={formData.service_account_key}
              onChange={(e) => setFormData({ ...formData, service_account_key: e.target.value })}
              placeholder='{"type": "service_account", "project_id": "...", ...}'
              className="bg-[#0a0a0a] border-[#262626] text-white font-mono text-xs h-24"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              Download from Firebase Console → Project Settings → Service Accounts
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#262626]">
            <h4 className="text-white font-semibold text-sm">Features</h4>
            
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-[#00d4ff]" />
                <div>
                  <p className="text-sm text-white font-medium">Firebase Analytics</p>
                  <p className="text-xs text-[#6b7280]">Send psychographic user properties</p>
                </div>
              </div>
              <Switch
                checked={formData.analytics}
                onCheckedChange={(checked) => setFormData({ ...formData, analytics: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-[#8b5cf6]" />
                <div>
                  <p className="text-sm text-white font-medium">Remote Config</p>
                  <p className="text-xs text-[#6b7280]">Personalize app configs by psychology</p>
                </div>
              </div>
              <Switch
                checked={formData.remote_config}
                onCheckedChange={(checked) => setFormData({ ...formData, remote_config: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#ec4899]" />
                <div>
                  <p className="text-sm text-white font-medium">Cloud Messaging</p>
                  <p className="text-xs text-[#6b7280]">Psychographic push notifications</p>
                </div>
              </div>
              <Switch
                checked={formData.cloud_messaging}
                onCheckedChange={(checked) => setFormData({ ...formData, cloud_messaging: checked })}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">What You Can Do</h4>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-[#00d4ff] rounded-full mt-2" />
              <span>Personalize onboarding flows based on user psychology</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-[#00d4ff] rounded-full mt-2" />
              <span>A/B test messaging variants for different cognitive styles</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-[#00d4ff] rounded-full mt-2" />
              <span>Send targeted push notifications based on motivations</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 bg-[#00d4ff] rounded-full mt-2" />
              <span>Dynamically adjust app features per user personality</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.project_id || !formData.service_account_key}
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
        </div>

        <a
          href="https://firebase.google.com/docs/admin/setup"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Firebase Setup Guide
        </a>
      </CardContent>
    </Card>
  );
}