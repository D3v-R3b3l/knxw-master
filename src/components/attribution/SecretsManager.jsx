import React, { useState, useEffect } from 'react';
import { WorkspaceSecret } from '@/entities/WorkspaceSecret';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Key, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function SecretsManager({ workspace }) {
  const [secrets, setSecrets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSecrets = async () => {
      if (!workspace) return;
      setLoading(true);
      try {
        const secretList = await WorkspaceSecret.filter({ workspace_id: workspace.id }, null, 1);
        setSecrets(secretList[0] || { workspace_id: workspace.id });
      } catch (error) {
        console.error("Failed to load secrets:", error);
        toast({ title: "Error", description: "Could not load workspace secrets.", variant: "destructive" });
      }
      setLoading(false);
    };
    loadSecrets();
  }, [workspace, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (secrets.id) {
        await WorkspaceSecret.update(secrets.id, secrets);
      } else {
        const newSecret = await WorkspaceSecret.create(secrets);
        setSecrets(newSecret);
      }
      toast({ title: "Success", description: "Secrets saved securely." });
    } catch (error) {
      console.error("Failed to save secrets:", error);
      toast({ title: "Error", description: "Could not save secrets.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSecrets(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#262626] text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-[#fbbf24]" />
          <span>API Keys & Secrets</span>
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Manage API credentials for third-party integrations. These are stored encrypted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Meta (Facebook)</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">Pixel ID</label>
              <Input
                name="meta_pixel_id"
                value={secrets?.meta_pixel_id || ''}
                onChange={handleInputChange}
                placeholder="e.g., 1234567890123456"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">CAPI Access Token</label>
              <Input
                name="meta_access_token"
                type="password"
                value={secrets?.meta_access_token || ''}
                onChange={handleInputChange}
                placeholder="Paste your CAPI token here"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">Test Event Code (Optional)</label>
              <Input
                name="test_event_code"
                value={secrets?.test_event_code || ''}
                onChange={handleInputChange}
                placeholder="e.g., TEST12345"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#262626] my-6"></div>

        <div className="space-y-4">
          <h4 className="font-semibold text-white">Google Ads & Analytics</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">Ads Customer ID</label>
              <Input
                name="google_ads_customer_id"
                value={secrets?.google_ads_customer_id || ''}
                onChange={handleInputChange}
                placeholder="e.g., 123-456-7890"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">Ads Developer Token</label>
              <Input
                name="google_ads_dev_token"
                type="password"
                value={secrets?.google_ads_dev_token || ''}
                onChange={handleInputChange}
                placeholder="Paste your developer token here"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">Ads Conversion Action ID</label>
              <Input
                name="google_ads_conversion_action_id"
                value={secrets?.google_ads_conversion_action_id || ''}
                onChange={handleInputChange}
                placeholder="e.g., 123456789"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#a3a3a3] block mb-2">GA4 Measurement ID</label>
              <Input
                name="ga4_measurement_id"
                value={secrets?.ga4_measurement_id || ''}
                onChange={handleInputChange}
                placeholder="e.g., G-XXXXXXXXXX"
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#262626] my-6"></div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Secrets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}