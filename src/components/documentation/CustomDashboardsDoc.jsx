import React from 'react';
import { BarChart3, Layout, Grid, Move, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function CustomDashboardsDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-[#00d4ff]" />
        Custom Dashboards Documentation
      </h2>

      <p className="text-[#a3a3a3] text-lg mb-8">
        Create powerful, interactive dashboards with drag-and-drop layout builder, 
        responsive grids, and advanced Nivo chart visualizations for psychographic data.
      </p>

      {/* Dashboard Builder Features */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Builder Features</h3>
      
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#00d4ff]" />
              Responsive Grid
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            12-column responsive grid system with automatic layout optimization for mobile, tablet, and desktop.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Move className="w-5 h-5 text-[#10b981]" />
              Drag & Drop
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Intuitive drag-and-drop interface for repositioning widgets with live preview and collision detection.
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#fbbf24]" />
              Widget Resize
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#a3a3a3]">
            Resize widgets to fit your data perfectly with minimum size constraints and aspect ratio preservation.
          </CardContent>
        </Card>
      </div>

      {/* Available Chart Types */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Nivo Chart Library</h3>
      
      <p className="text-[#a3a3a3] mb-4">
        Powered by Nivo, your dashboards support advanced, beautifully animated visualizations:
      </p>

      <div className="space-y-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-semibold">Line Charts</h5>
            <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">Time-series</Badge>
          </div>
          <p className="text-sm text-[#a3a3a3]">
            Perfect for tracking metrics over time, trend analysis, and forecasting with smooth animations.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-semibold">Bar Charts</h5>
            <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">Comparisons</Badge>
          </div>
          <p className="text-sm text-[#a3a3a3]">
            Ideal for comparing categories, psychographic segments, or performance across robots/campaigns.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-semibold">Pie/Donut Charts</h5>
            <Badge className="bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30">Distributions</Badge>
          </div>
          <p className="text-sm text-[#a3a3a3]">
            Visualize motivation distributions, emotional state breakdowns, and market share.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-semibold">Heatmaps</h5>
            <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">Correlation</Badge>
          </div>
          <p className="text-sm text-[#a3a3a3]">
            Explore correlations between psychographic profiles and engagement patterns.
          </p>
        </div>
      </div>

      {/* Widget Types */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Widget Types</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <h5 className="text-white font-semibold mb-2">📊 Chart Widgets</h5>
          <p className="text-sm text-[#a3a3a3] mb-3">
            Visualize data with line, bar, pie, and heatmap charts powered by Nivo.
          </p>
          <div className="text-xs text-[#6b7280]">
            Supports: time-series, categorical, distribution, correlation data
          </div>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <h5 className="text-white font-semibold mb-2">🔢 Metric Widgets</h5>
          <p className="text-sm text-[#a3a3a3] mb-3">
            Display KPIs with large numbers, trend indicators, and customizable formatting.
          </p>
          <div className="text-xs text-[#6b7280]">
            Supports: integers, decimals, percentages, currency
          </div>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <h5 className="text-white font-semibold mb-2">📝 Text Widgets</h5>
          <p className="text-sm text-[#a3a3a3] mb-3">
            Add context, notes, or markdown-formatted content to your dashboards.
          </p>
          <div className="text-xs text-[#6b7280]">
            Supports: plain text, markdown, HTML (sanitized)
          </div>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <h5 className="text-white font-semibold mb-2">📋 Table Widgets</h5>
          <p className="text-sm text-[#a3a3a3] mb-3">
            Display tabular data with sorting, filtering, and pagination.
          </p>
          <div className="text-xs text-[#6b7280]">
            Supports: entity data, custom queries, CSV export
          </div>
        </div>
      </div>

      {/* Creating a Dashboard */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Creating a Dashboard</h3>

      <h4 className="text-xl font-semibold text-white mb-3">Step-by-Step Guide</h4>
      
      <ol className="space-y-4 text-[#a3a3a3] mb-6">
        <li className="flex gap-3">
          <span className="text-[#00d4ff] font-bold flex-shrink-0">1.</span>
          <div>
            <strong className="text-white">Click "New Dashboard"</strong> in the Dashboards page
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-[#00d4ff] font-bold flex-shrink-0">2.</span>
          <div>
            <strong className="text-white">Name your dashboard</strong> and add an optional description
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-[#00d4ff] font-bold flex-shrink-0">3.</span>
          <div>
            <strong className="text-white">Add widgets</strong> by clicking the "+ Add Widget" button
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-[#00d4ff] font-bold flex-shrink-0">4.</span>
          <div>
            <strong className="text-white">Configure each widget</strong> - select chart type, data source, and styling
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-[#00d4ff] font-bold flex-shrink-0">5.</span>
          <div>
            <strong className="text-white">Drag and resize</strong> widgets to create your perfect layout
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-[#00d4ff] font-bold flex-shrink-0">6.</span>
          <div>
            <strong className="text-white">Save your dashboard</strong> - it will auto-refresh data based on configured intervals
          </div>
        </li>
      </ol>

      <Callout type="info" title="Auto-Refresh">
        Dashboards automatically refresh data every 30 seconds to show real-time insights.
      </Callout>

      {/* Grid Layout System */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Grid Layout System</h3>
      
      <p className="text-[#a3a3a3] mb-4">
        The dashboard uses a 12-column grid with responsive breakpoints:
      </p>

      <CodeBlock language="javascript" code={`// Grid configuration
const gridConfig = {
  cols: 12,           // 12-column grid
  rowHeight: 80,      // Each row is 80px
  margin: [16, 16],   // 16px spacing between widgets
  
  // Responsive breakpoints
  breakpoints: {
    lg: 1200,  // Desktop
    md: 996,   // Tablet landscape
    sm: 768,   // Tablet portrait
    xs: 480    // Mobile
  }
};

// Widget sizing
const widget = {
  w: 4,      // Width (columns)
  h: 3,      // Height (rows)
  minW: 2,   // Minimum width
  minH: 2    // Minimum height
};`} />

      {/* Performance Tips */}
      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Performance Optimization</h3>
      
      <div className="bg-[#111111] border-l-4 border-[#10b981] p-4 rounded-r-lg">
        <ul className="space-y-2 text-[#a3a3a3] text-sm">
          <li>• Limit dashboards to 12-15 widgets for optimal performance</li>
          <li>• Use metric widgets for simple KPIs instead of charts when possible</li>
          <li>• Set appropriate data refresh intervals based on data volatility</li>
          <li>• Cache frequently accessed data sources</li>
          <li>• Use table pagination for large datasets (100+ rows)</li>
        </ul>
      </div>
    </div>
  );
}