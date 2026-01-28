import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Plus, Trash2, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDashboardStore } from '../dashboard/DashboardStore';

export default function BIExportPanel() {
  const { selectedAppId } = useDashboardStore();
  const { toast } = useToast();
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    platform: 'tableau',
    export_format: 'csv',
    data_sources: ['psychographic_profiles']
  });

  useEffect(() => {
    loadConfigs();
  }, [selectedAppId]);

  const loadConfigs = async () => {
    if (!selectedAppId) return;
    setIsLoading(true);
    try {
      const data = await base44.entities.BIExportConfig.filter({ client_app_id: selectedAppId });
      setConfigs(data || []);
    } catch (error) {
      console.error('Failed to load BI configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newConfig.name.trim()) {
      toast({ variant: 'destructive', title: 'Name required' });
      return;
    }

    try {
      await base44.entities.BIExportConfig.create({
        ...newConfig,
        client_app_id: selectedAppId
      });
      toast({ variant: 'success', title: 'Export config created' });
      setShowCreate(false);
      setNewConfig({ name: '', platform: 'tableau', export_format: 'csv', data_sources: ['psychographic_profiles'] });
      loadConfigs();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to create', description: error.message });
    }
  };

  const handleExport = async (configId) => {
    try {
      const response = await base44.functions.invoke('exportBI', {
        config_id: configId,
        format: 'csv'
      });

      toast({ variant: 'success', title: 'Export started', description: 'Your data is being prepared...' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Export failed', description: error.message });
    }
  };

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          BI Tool Exports
        </CardTitle>
        <CardDescription>Export psychographic data to Tableau, Power BI, and other BI platforms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showCreate ? (
          <Button onClick={() => setShowCreate(true)} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            <Plus className="w-4 h-4 mr-2" />
            New Export Config
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
            <Input
              placeholder="Config name"
              value={newConfig.name}
              onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
              className="bg-[#0a0a0a] border-[#262626] text-white"
            />
            <Select value={newConfig.platform} onValueChange={(v) => setNewConfig({ ...newConfig, platform: v })}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tableau">Tableau</SelectItem>
                <SelectItem value="powerbi">Power BI</SelectItem>
                <SelectItem value="looker">Looker</SelectItem>
                <SelectItem value="metabase">Metabase</SelectItem>
                <SelectItem value="generic">Generic</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                Create
              </Button>
              <Button onClick={() => setShowCreate(false)} variant="outline" className="border-[#262626]">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {configs.map((config) => (
            <div key={config.id} className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626] flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{config.name}</h4>
                <div className="flex gap-2 items-center">
                  <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-none text-xs">
                    {config.platform}
                  </Badge>
                  <span className="text-xs text-[#6b7280]">
                    {config.export_format.toUpperCase()} • {config.data_sources.length} sources
                  </span>
                </div>
              </div>
              <Button onClick={() => handleExport(config.id)} size="sm" className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          ))}
          {configs.length === 0 && !showCreate && (
            <p className="text-[#6b7280] text-center py-8">No export configurations yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}