import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function AdvancedWidgetConfig({ widget, onChange, onSave, onCancel }) {
  const [config, setConfig] = useState(widget || {});

  const updateConfig = (path, value) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-[#a3a3a3]">Widget Title</Label>
        <Input
          value={config.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          className="bg-[#1a1a1a] border-[#262626] text-white mt-2"
          placeholder="Enter widget title..."
        />
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-[#262626]">
          <TabsTrigger value="data">Data Source</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4 mt-4">
          {(config.kind === 'timeseries' || config.kind === 'kpi' || config.kind === 'gauge') && (
            <>
              <div>
                <Label className="text-[#a3a3a3]">Metric</Label>
                <Select
                  value={config.query?.metric_name || ''}
                  onValueChange={(value) => updateConfig('query.metric_name', value)}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white mt-2">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requests">Total Requests</SelectItem>
                    <SelectItem value="errors">Error Count</SelectItem>
                    <SelectItem value="latency_p95_ms">Latency (P95)</SelectItem>
                    <SelectItem value="retrieval_miss_rate">Cache Miss Rate</SelectItem>
                    <SelectItem value="active_users">Active Users</SelectItem>
                    <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#a3a3a3]">Time Window</Label>
                <Select
                  value={String(config.query?.time_window_hours || 24)}
                  onValueChange={(value) => updateConfig('query.time_window_hours', parseInt(value))}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last Hour</SelectItem>
                    <SelectItem value="6">Last 6 Hours</SelectItem>
                    <SelectItem value="24">Last 24 Hours</SelectItem>
                    <SelectItem value="168">Last Week</SelectItem>
                    <SelectItem value="720">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#a3a3a3]">Aggregation</Label>
                <Select
                  value={config.query?.aggregation || 'avg'}
                  onValueChange={(value) => updateConfig('query.aggregation', value)}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {config.kind === 'table' && (
            <>
              <div>
                <Label className="text-[#a3a3a3]">Data Source</Label>
                <Select
                  value={config.query?.table_source || ''}
                  onValueChange={(value) => updateConfig('query.table_source', value)}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white mt-2">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_events">System Events</SelectItem>
                    <SelectItem value="metrics_hour">Metrics (Hourly)</SelectItem>
                    <SelectItem value="access_logs">Access Logs</SelectItem>
                    <SelectItem value="captured_events">User Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#a3a3a3]">Max Rows</Label>
                <Input
                  type="number"
                  value={config.query?.limit || 100}
                  onChange={(e) => updateConfig('query.limit', parseInt(e.target.value))}
                  className="bg-[#1a1a1a] border-[#262626] text-white mt-2"
                  min="10"
                  max="1000"
                />
              </div>
            </>
          )}

          {config.kind === 'markdown' && (
            <div>
              <Label className="text-[#a3a3a3]">Markdown Content</Label>
              <Textarea
                value={config.content?.markdown || ''}
                onChange={(e) => updateConfig('content.markdown', e.target.value)}
                className="bg-[#1a1a1a] border-[#262626] text-white mt-2 h-48 font-mono text-sm"
                placeholder="Enter markdown content..."
              />
              <p className="text-xs text-[#6b7280] mt-2">
                Supports markdown formatting: **bold**, *italic*, [links](url), etc.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="display" className="space-y-4 mt-4">
          {config.kind === 'timeseries' && (
            <>
              <div>
                <Label className="text-[#a3a3a3]">Chart Type</Label>
                <Select
                  value={config.content?.chart_type || 'line'}
                  onValueChange={(value) => updateConfig('content.chart_type', value)}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#a3a3a3]">Color Scheme</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['blue', 'green', 'purple', 'red', 'orange', 'pink', 'cyan', 'gray'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateConfig('content.color_scheme', color)}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        config.content?.color_scheme === color
                          ? 'border-white scale-105'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: {
                          blue: '#00d4ff',
                          green: '#10b981',
                          purple: '#8b5cf6',
                          red: '#ef4444',
                          orange: '#f59e0b',
                          pink: '#ec4899',
                          cyan: '#06b6d4',
                          gray: '#6b7280'
                        }[color]
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#a3a3a3]">Show Legend</Label>
                <Switch
                  checked={config.content?.show_legend !== false}
                  onCheckedChange={(checked) => updateConfig('content.show_legend', checked)}
                />
              </div>
            </>
          )}

          {config.kind === 'kpi' && (
            <>
              <div>
                <Label className="text-[#a3a3a3]">Decimal Places</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[config.content?.decimal_places || 0]}
                    onValueChange={([value]) => updateConfig('content.decimal_places', value)}
                    max={4}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-white w-8 text-center">
                    {config.content?.decimal_places || 0}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-[#a3a3a3]">Unit / Suffix</Label>
                <Input
                  value={config.content?.unit || ''}
                  onChange={(e) => updateConfig('content.unit', e.target.value)}
                  className="bg-[#1a1a1a] border-[#262626] text-white mt-2"
                  placeholder="e.g., ms, %, $, users"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[#a3a3a3]">Show Trend</Label>
                <Switch
                  checked={config.content?.show_trend !== false}
                  onCheckedChange={(checked) => updateConfig('content.show_trend', checked)}
                />
              </div>
            </>
          )}

          {config.kind === 'gauge' && (
            <>
              <div>
                <Label className="text-[#a3a3a3]">Target Value</Label>
                <Input
                  type="number"
                  value={config.content?.target || 100}
                  onChange={(e) => updateConfig('content.target', parseFloat(e.target.value))}
                  className="bg-[#1a1a1a] border-[#262626] text-white mt-2"
                />
              </div>

              <div>
                <Label className="text-[#a3a3a3]">Warning Threshold (%)</Label>
                <Slider
                  value={[config.content?.warning_threshold || 70]}
                  onValueChange={([value]) => updateConfig('content.warning_threshold', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <span className="text-xs text-[#a3a3a3]">
                  {config.content?.warning_threshold || 70}%
                </span>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div>
            <Label className="text-[#a3a3a3]">Refresh Interval</Label>
            <Select
              value={String(config.refresh_interval || 60)}
              onValueChange={(value) => updateConfig('refresh_interval', parseInt(value))}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Manual Only</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="900">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-[#a3a3a3]">Cache Results</Label>
            <Switch
              checked={config.cache_enabled !== false}
              onCheckedChange={(checked) => updateConfig('cache_enabled', checked)}
            />
          </div>

          <div>
            <Label className="text-[#a3a3a3]">Custom CSS Class</Label>
            <Input
              value={config.custom_class || ''}
              onChange={(e) => updateConfig('custom_class', e.target.value)}
              className="bg-[#1a1a1a] border-[#262626] text-white mt-2"
              placeholder="e.g., widget-highlight"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t border-[#262626]">
        <Button
          onClick={() => onSave(config)}
          className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] flex-1"
        >
          Save Widget
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626]"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}