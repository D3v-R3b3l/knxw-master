import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Zap, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SegmentIntegration({ appId }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    workspace_slug: '',
    write_key: '',
    source_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, [appId]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await base44.entities.SegmentIntegrationConfig.filter({ client_app_id: appId });
      if (configs.length > 0) {
        setConfig(configs[0]);
        setFormData({
          workspace_slug: configs[0].workspace_slug || '',
          write_key: configs[0].write_key || '',
          source_id: configs[0].source_id || ''
        });
      }
    } catch (error) {
      console.error('Failed to load Segment config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (config) {
        await base44.entities.SegmentIntegrationConfig.update(config.id, {
          ...formData,
          client_app_id: appId,
          status: 'active',
          last_sync: new Date().toISOString()
        });
        toast({
          title: 'Configuration Updated',
          description: 'Segment integration settings saved successfully'
        });
      } else {
        await base44.entities.SegmentIntegrationConfig.create({
          ...formData,
          client_app_id: appId,
          status: 'active'
        });
        toast({
          title: 'Integration Enabled',
          description: 'Segment integration configured successfully'
        });
      }
      
      loadConfig();
    } catch (error) {
      console.error('Failed to save Segment config:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save Segment configuration',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Segment integration? This will stop syncing psychographic data.')) return;

    try {
      await base44.entities.SegmentIntegrationConfig.update(config.id, {
        status: 'inactive'
      });
      toast({
        title: 'Integration Disabled',
        description: 'Segment integration has been disconnected'
      });
      loadConfig();
    } catch (error) {
      console.error('Failed to disconnect Segment:', error);
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
            <div className="p-3 bg-[#52bd95]/20 rounded-xl">
              <Zap className="w-6 h-6 text-[#52bd95]" />
            </div>
            <div>
              <CardTitle className="text-white">Segment Integration</CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Sync psychographic traits to Segment as user properties
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
            <label className="text-sm text-[#a3a3a3] mb-2 block">Workspace Slug</label>
            <Input
              value={formData.workspace_slug}
              onChange={(e) => setFormData({ ...formData, workspace_slug: e.target.value })}
              placeholder="my-workspace"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Write Key</label>
            <Input
              type="password"
              value={formData.write_key}
              onChange={(e) => setFormData({ ...formData, write_key: e.target.value })}
              placeholder="your_segment_write_key"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <p className="text-xs text-[#6b7280] mt-1">
              Found in Segment → Sources → Your Source → Settings
            </p>
          </div>

          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Source ID</label>
            <Input
              value={formData.source_id}
              onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
              placeholder="js_ABC123"
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
          </div>
        </div>

        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff]" />
            What Gets Synced
          </h4>
          <ul className="space-y-1 text-sm text-[#a3a3a3]">
            <li>• Cognitive style (analytical, intuitive, systematic, creative)</li>
            <li>• Risk profile (conservative, moderate, aggressive)</li>
            <li>• Primary motivations (achievement, mastery, social, etc.)</li>
            <li>• Churn risk level (low, medium, high)</li>
            <li>• Personality trait scores (Big Five)</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.write_key}
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
          href="https://segment.com/docs/connections/sources/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00d4ff] hover:text-[#0ea5e9] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Segment Documentation
        </a>
      </CardContent>
    </Card>
  );
}