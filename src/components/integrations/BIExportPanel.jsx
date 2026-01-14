import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { exportBI } from '@/functions/exportBI';
import { BarChart3, Download, Loader2, Database, FileJson, FileSpreadsheet, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PLATFORMS = [
  { value: 'tableau', label: 'Tableau', color: '#e97627' },
  { value: 'powerbi', label: 'Power BI', color: '#f2c811' },
  { value: 'looker', label: 'Looker', color: '#4285f4' },
  { value: 'metabase', label: 'Metabase', color: '#509ee3' },
  { value: 'generic', label: 'Generic Export', color: '#6b7280' }
];

const DATA_SOURCES = [
  { value: 'psychographic_profiles', label: 'Psychographic Profiles', desc: 'User personality and behavioral data' },
  { value: 'events', label: 'Captured Events', desc: 'User interaction events' },
  { value: 'insights', label: 'Insights', desc: 'AI-generated behavioral insights' },
  { value: 'engagements', label: 'Engagements', desc: 'Engagement delivery and response data' }
];

export default function BIExportPanel({ appId }) {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'generic',
    format: 'csv',
    data_sources: ['psychographic_profiles'],
    date_range_days: 30,
    include_demo_data: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, [appId]);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const results = await base44.entities.BIExportConfig.filter({ client_app_id: appId });
      setConfigs(results);
    } catch (error) {
      console.error('Failed to load BI configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const response = await exportBI({
        action: 'preview',
        client_app_id: appId
      });
      
      if (response.data?.status === 'success') {
        setPreviewData(response.data.data);
      }
    } catch (error) {
      toast({
        title: 'Preview Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportBI({
        action: 'export',
        client_app_id: appId,
        data_sources: formData.data_sources,
        format: formData.format,
        platform: formData.platform,
        filters: {
          date_range_days: formData.date_range_days,
          include_demo_data: formData.include_demo_data
        }
      });

      // Handle file download
      const blob = new Blob([response.data], { 
        type: formData.format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knxw_export_${formData.platform}_${new Date().toISOString().split('T')[0]}.${formData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Completed',
        description: 'File downloaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await base44.entities.BIExportConfig.create({
        client_app_id: appId,
        name: formData.name || `${formData.platform} Export`,
        platform: formData.platform,
        export_format: formData.format,
        data_sources: formData.data_sources,
        filters: {
          date_range_days: formData.date_range_days,
          include_demo_data: formData.include_demo_data
        },
        status: 'active'
      });
      
      toast({ title: 'Configuration Saved' });
      loadConfigs();
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleDataSource = (source) => {
    const current = formData.data_sources;
    if (current.includes(source)) {
      setFormData({ ...formData, data_sources: current.filter(s => s !== source) });
    } else {
      setFormData({ ...formData, data_sources: [...current, source] });
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
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#8b5cf6]/20 rounded-xl">
            <BarChart3 className="w-6 h-6 text-[#8b5cf6]" />
          </div>
          <div>
            <CardTitle className="text-white">Business Intelligence Export</CardTitle>
            <p className="text-sm text-[#a3a3a3] mt-1">
              Export psychographic data for Tableau, Power BI, and other BI tools
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="text-sm text-[#a3a3a3] mb-3 block">Target Platform</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                onClick={() => setFormData({ ...formData, platform: p.value })}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  formData.platform === p.value
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-white'
                    : 'border-[#262626] bg-[#0a0a0a] text-[#a3a3a3] hover:border-[#404040]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="text-sm text-[#a3a3a3] mb-2 block">Export Format</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, format: 'csv' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                formData.format === 'csv'
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-white'
                  : 'border-[#262626] text-[#a3a3a3] hover:border-[#404040]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => setFormData({ ...formData, format: 'json' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                formData.format === 'json'
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-white'
                  : 'border-[#262626] text-[#a3a3a3] hover:border-[#404040]'
              }`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <label className="text-sm text-[#a3a3a3] mb-3 block">Data Sources</label>
          <div className="space-y-2">
            {DATA_SOURCES.map(source => (
              <div
                key={source.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.data_sources.includes(source.value)
                    ? 'border-[#00d4ff]/50 bg-[#00d4ff]/5'
                    : 'border-[#262626] bg-[#0a0a0a]'
                }`}
                onClick={() => toggleDataSource(source.value)}
              >
                <Checkbox
                  checked={formData.data_sources.includes(source.value)}
                  className="border-[#404040]"
                />
                <div>
                  <p className="text-sm text-white font-medium">{source.label}</p>
                  <p className="text-xs text-[#6b7280]">{source.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#a3a3a3] mb-2 block">Date Range</label>
            <Select
              value={String(formData.date_range_days)}
              onValueChange={(v) => setFormData({ ...formData, date_range_days: parseInt(v) })}
            >
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg w-full">
              <Switch
                checked={formData.include_demo_data}
                onCheckedChange={(v) => setFormData({ ...formData, include_demo_data: v })}
              />
              <span className="text-sm text-[#a3a3a3]">Include demo data</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {previewData && (
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold text-sm mb-3">Data Preview</h4>
            <div className="text-xs text-[#a3a3a3] space-y-1">
              <p>Records available: {previewData.total_available}</p>
              <p>Columns: {previewData.columns?.join(', ')}</p>
            </div>
            {previewData.sample_records?.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <pre className="text-xs text-[#10b981] bg-[#111111] p-2 rounded">
                  {JSON.stringify(previewData.sample_records[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handlePreview}
            disabled={isPreviewing}
            variant="outline"
            className="border-[#262626]"
          >
            {isPreviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
            Preview
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || formData.data_sources.length === 0}
            className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export Data
          </Button>
        </div>

        {/* Saved Configs */}
        {configs.length > 0 && (
          <div className="pt-4 border-t border-[#262626]">
            <h4 className="text-white font-semibold text-sm mb-3">Saved Export Configurations</h4>
            <div className="space-y-2">
              {configs.map(cfg => (
                <div key={cfg.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="text-sm text-white">{cfg.name}</p>
                    <p className="text-xs text-[#6b7280]">
                      {cfg.platform} • {cfg.export_format} • Last export: {cfg.last_export ? new Date(cfg.last_export).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <Badge className="bg-[#262626] text-[#a3a3a3]">
                    {cfg.last_export_records || 0} records
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}