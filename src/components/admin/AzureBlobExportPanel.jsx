import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Cloud, Download, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { azureBlobExport } from '@/functions/azureBlobExport';

export default function AzureBlobExportPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  const [config, setConfig] = useState({
    containerName: '',
    dataType: 'profiles',
    format: 'json',
    includeDemo: false,
    sasTokenExpireHours: 24
  });

  // Load export history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('azure_export_history');
      if (stored) {
        setExportHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load export history:', error);
    }
  }, []);

  // Save export history to localStorage
  const saveExportHistory = (newExport) => {
    try {
      const updated = [newExport, ...exportHistory.slice(0, 9)]; // Keep last 10
      setExportHistory(updated);
      localStorage.setItem('azure_export_history', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save export history:', error);
    }
  };

  const handleExport = async () => {
    if (!config.containerName.trim()) {
      alert('Please enter an Azure Blob container name');
      return;
    }

    setIsExporting(true);
    const startTime = Date.now();

    try {
      const { data } = await azureBlobExport(config);

      if (data.success) {
        const exportRecord = {
          id: data.exportId,
          timestamp: new Date().toISOString(),
          containerName: config.containerName,
          dataType: config.dataType,
          format: config.format,
          recordCount: data.metadata.size,
          blobUrl: data.blobUrl,
          sasUrl: data.sasUrl,
          expiresAt: data.expiresAt,
          latency: Date.now() - startTime,
          status: 'completed'
        };

        saveExportHistory(exportRecord);

        // Show success notification
        alert(`✅ Export completed successfully!\n\nContainer: ${config.containerName}\nRecords: ${data.metadata.size}\nExpires: ${new Date(data.expiresAt).toLocaleString()}`);
      } else {
        throw new Error(data.error || 'Export failed');
      }
    } catch (error) {
      console.error('Azure export error:', error);
      
      const errorRecord = {
        id: `error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        containerName: config.containerName,
        dataType: config.dataType,
        format: config.format,
        error: error.message,
        latency: Date.now() - startTime,
        status: 'failed'
      };

      saveExportHistory(errorRecord);
      alert(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatLatency = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#0078d4]" />
            Azure Blob Storage Export
          </CardTitle>
          <p className="text-[#a3a3a3] text-sm">
            Export knXw data to Azure Blob Storage with secure SAS token access
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Container Name *
              </label>
              <Input
                placeholder="my-knxw-exports"
                value={config.containerName}
                onChange={(e) => setConfig({ ...config, containerName: e.target.value })}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
              <p className="text-[#6b7280] text-xs mt-1">
                Azure Blob container name (must exist)
              </p>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Data Type
              </label>
              <Select value={config.dataType} onValueChange={(value) => setConfig({ ...config, dataType: value })}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profiles">User Profiles</SelectItem>
                  <SelectItem value="events">Captured Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Format
              </label>
              <Select value={config.format} onValueChange={(value) => setConfig({ ...config, format: value })}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                SAS Token Expiry (hours)
              </label>
              <Input
                type="number"
                min="1"
                max="168"
                value={config.sasTokenExpireHours}
                onChange={(e) => setConfig({ ...config, sasTokenExpireHours: parseInt(e.target.value) || 24 })}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.includeDemo}
              onCheckedChange={(checked) => setConfig({ ...config, includeDemo: checked })}
            />
            <label className="text-white text-sm">
              Include demo data in export
            </label>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting || !config.containerName.trim()}
            className="bg-[#0078d4] hover:bg-[#106ebe] text-white"
          >
            {isExporting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export to Azure Blob
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Recent Exports</CardTitle>
            <p className="text-[#a3a3a3] text-sm">
              History of Azure Blob exports from this session
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportHistory.map((export_) => (
                <div
                  key={export_.id}
                  className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {export_.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#ef4444]" />
                      )}
                      <span className="text-white font-medium">
                        {export_.containerName} / {export_.dataType}
                      </span>
                      <Badge className="bg-[#262626] text-[#a3a3a3]">
                        {export_.format.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[#a3a3a3] text-sm">
                      {export_.status === 'completed' ? (
                        <span>
                          {export_.recordCount} records • {formatLatency(export_.latency)} • 
                          {export_.expiresAt && (
                            <span className={isExpired(export_.expiresAt) ? 'text-[#ef4444]' : 'text-[#a3a3a3]'}>
                              {isExpired(export_.expiresAt) ? ' Expired' : ` Expires ${new Date(export_.expiresAt).toLocaleString()}`}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[#ef4444]">{export_.error}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6b7280] text-xs">
                      {new Date(export_.timestamp).toLocaleTimeString()}
                    </span>
                    {export_.sasUrl && !isExpired(export_.expiresAt) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#262626] text-[#a3a3a3] hover:text-white"
                        onClick={() => window.open(export_.sasUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}