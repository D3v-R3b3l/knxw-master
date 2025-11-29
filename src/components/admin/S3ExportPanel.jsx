import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { awsS3Export } from '@/functions/awsS3Export';
import { Download, Upload, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function S3ExportPanel() {
  const [config, setConfig] = useState({
    bucket_name: '',
    key_prefix: 'knxw-exports',
    export_type: 'profiles',
    limit: 1000,
    include_demo_data: false
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [lastExportResult, setLastExportResult] = useState(null);
  
  const { toast } = useToast();

  const handleTestConnection = async () => {
    if (!config.bucket_name) {
      toast({
        title: "Bucket name required",
        description: "Please enter an S3 bucket name to test connection",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setConnectionStatus(null);

    try {
      const response = await awsS3Export({
        action: 'test_connection',
        bucket_name: config.bucket_name
      });

      if (response.data.success) {
        setConnectionStatus({
          success: true,
          message: response.data.message,
          details: response.data.data
        });
        toast({
          title: "Connection successful",
          description: `Successfully connected to S3 bucket: ${config.bucket_name}`,
        });
      } else {
        setConnectionStatus({
          success: false,
          message: response.data.message,
          details: response.data.data
        });
        toast({
          title: "Connection failed",
          description: response.data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error.message,
        details: null
      });
      toast({
        title: "Connection error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExport = async () => {
    if (!config.bucket_name) {
      toast({
        title: "Configuration incomplete",
        description: "Please provide an S3 bucket name",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setLastExportResult(null);

    try {
      const exportPayload = {
        action: config.export_type === 'all' ? 'export_all' : `export_${config.export_type}`,
        bucket_name: config.bucket_name,
        key_prefix: config.key_prefix,
        limit: config.limit,
        filters: config.include_demo_data ? {} : { is_demo: false }
      };

      const response = await awsS3Export(exportPayload);

      if (response.data.success) {
        setLastExportResult({
          success: true,
          ...response.data
        });
        toast({
          title: "Export successful",
          description: response.data.message,
        });
      } else {
        setLastExportResult({
          success: false,
          message: response.data.message
        });
        toast({
          title: "Export failed",
          description: response.data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setLastExportResult({
        success: false,
        message: error.message
      });
      toast({
        title: "Export error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const renderConnectionStatus = () => {
    if (!connectionStatus) return null;

    return (
      <div className={`p-4 rounded-lg border ${
        connectionStatus.success 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {connectionStatus.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="font-semibold">
            {connectionStatus.success ? 'Connection Successful' : 'Connection Failed'}
          </span>
        </div>
        <p className="text-sm mb-2">{connectionStatus.message}</p>
        {connectionStatus.details && (
          <div className="text-xs">
            <p>Bucket: {connectionStatus.details.bucket_name}</p>
            <p>Region: {connectionStatus.details.region}</p>
            <p>Exists: {connectionStatus.details.exists ? 'Yes' : 'No'}</p>
            <p>Accessible: {connectionStatus.details.accessible ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    );
  };

  const renderExportResult = () => {
    if (!lastExportResult) return null;

    return (
      <div className={`p-4 rounded-lg border ${
        lastExportResult.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {lastExportResult.success ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="font-semibold text-gray-900">
            {lastExportResult.success ? 'Export Completed' : 'Export Failed'}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-3">{lastExportResult.message}</p>
        
        {lastExportResult.success && lastExportResult.data && (
          <div className="space-y-2">
            {lastExportResult.data.results ? (
              // Batch export results
              <div>
                <p className="text-xs text-gray-600 mb-2">Export Summary:</p>
                {lastExportResult.data.results.map((result, index) => (
                  <div key={index} className="text-xs">
                    <Badge variant={result.success ? "default" : "destructive"} className="mr-2">
                      {result.type}
                    </Badge>
                    {result.success ? (
                      <span>{result.profile_count || result.event_count || result.insight_count} items exported</span>
                    ) : (
                      <span>Failed: {result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Single export result
              <div className="text-xs text-gray-600 space-y-1">
                <p>S3 URL: <code className="bg-gray-100 px-1 rounded">{lastExportResult.data.url}</code></p>
                <p>File Size: {(lastExportResult.data.file_size / 1024).toFixed(1)} KB</p>
                <p>Records: {lastExportResult.data.profile_count || lastExportResult.data.event_count || lastExportResult.data.insight_count}</p>
                <p>ETag: {lastExportResult.data.etag}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-[#00d4ff]" />
          AWS S3 Export
        </CardTitle>
        <p className="text-[#a3a3a3] text-sm">
          Export knXw data to Amazon S3 for backup, analysis, or compliance purposes.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* S3 Configuration */}
        <div className="space-y-4">
          <div>
            <Label className="text-white">S3 Bucket Name</Label>
            <Input
              placeholder="your-bucket-name"
              value={config.bucket_name}
              onChange={(e) => setConfig({...config, bucket_name: e.target.value})}
              className="bg-[#1a1a1a] border-[#262626] text-white"
            />
          </div>
          
          <div>
            <Label className="text-white">Key Prefix (Optional)</Label>
            <Input
              placeholder="knxw-exports"
              value={config.key_prefix}
              onChange={(e) => setConfig({...config, key_prefix: e.target.value})}
              className="bg-[#1a1a1a] border-[#262626] text-white"
            />
            <p className="text-xs text-[#a3a3a3] mt-1">
              Files will be organized under this prefix in your bucket
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Export Type</Label>
              <Select value={config.export_type} onValueChange={(value) => setConfig({...config, export_type: value})}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#262626]">
                  <SelectItem value="profiles">Psychographic Profiles</SelectItem>
                  <SelectItem value="events">Captured Events</SelectItem>
                  <SelectItem value="insights">AI Insights</SelectItem>
                  <SelectItem value="all">All Data Types</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Record Limit</Label>
              <Input
                type="number"
                placeholder="1000"
                value={config.limit}
                onChange={(e) => setConfig({...config, limit: parseInt(e.target.value) || 1000})}
                className="bg-[#1a1a1a] border-[#262626] text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-demo"
              checked={config.include_demo_data}
              onCheckedChange={(checked) => setConfig({...config, include_demo_data: checked})}
            />
            <Label htmlFor="include-demo" className="text-white text-sm">
              Include demo/sample data in export
            </Label>
          </div>
        </div>

        {/* Connection Test */}
        <div className="border-t border-[#262626] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Connection Test</h4>
            <Button
              onClick={handleTestConnection}
              disabled={isTesting || !config.bucket_name}
              variant="outline"
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
          </div>
          
          {renderConnectionStatus()}
        </div>

        {/* Export Actions */}
        <div className="border-t border-[#262626] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Export Data</h4>
            <Button
              onClick={handleExport}
              disabled={isExporting || !config.bucket_name}
              className="bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9]"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Start Export
            </Button>
          </div>

          {renderExportResult()}
        </div>

        {/* Export Information */}
        <div className="bg-[#0a0a0a] p-4 rounded-lg">
          <h5 className="text-white font-medium mb-2">Export Information</h5>
          <ul className="text-xs text-[#a3a3a3] space-y-1">
            <li>• Profiles are exported as structured JSON with all psychographic data</li>
            <li>• Events are exported as JSONL (newline-delimited JSON) for easy processing</li>
            <li>• Insights include AI reasoning and confidence scores</li>
            <li>• All exports include metadata and timestamps</li>
            <li>• Files are automatically compressed and organized by date</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}