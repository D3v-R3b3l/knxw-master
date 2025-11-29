import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Table, 
  FileText, 
  PieChart,
  Activity,
  Users,
  Clock,
  Target
} from 'lucide-react';

const widgetTypes = [
  {
    id: 'timeseries',
    name: 'Time Series Chart',
    description: 'Visualize metrics over time with line or bar charts',
    icon: TrendingUp,
    category: 'Charts',
    color: '#00d4ff'
  },
  {
    id: 'kpi',
    name: 'KPI Metric',
    description: 'Display a single key performance indicator',
    icon: BarChart3,
    category: 'Metrics',
    color: '#10b981'
  },
  {
    id: 'table',
    name: 'Data Table',
    description: 'Show tabular data with sortable columns',
    icon: Table,
    category: 'Data',
    color: '#fbbf24'
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    description: 'Show distribution with a pie or donut chart',
    icon: PieChart,
    category: 'Charts',
    color: '#ec4899'
  },
  {
    id: 'gauge',
    name: 'Gauge',
    description: 'Display progress toward a goal',
    icon: Target,
    category: 'Metrics',
    color: '#8b5cf6'
  },
  {
    id: 'activity_feed',
    name: 'Activity Feed',
    description: 'Show recent system events or activities',
    icon: Activity,
    category: 'Data',
    color: '#06b6d4'
  },
  {
    id: 'user_count',
    name: 'User Count',
    description: 'Display active or total user counts',
    icon: Users,
    category: 'Metrics',
    color: '#f59e0b'
  },
  {
    id: 'uptime',
    name: 'Uptime Monitor',
    description: 'Track system uptime and availability',
    icon: Clock,
    category: 'System',
    color: '#14b8a6'
  },
  {
    id: 'markdown',
    name: 'Markdown Note',
    description: 'Add formatted text, links, and documentation',
    icon: FileText,
    category: 'Content',
    color: '#a3a3a3'
  }
];

export default function WidgetLibrary({ onSelectWidget }) {
  const categories = [...new Set(widgetTypes.map(w => w.category))];

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {widgetTypes.filter(w => w.category === category).map(widget => {
              const Icon = widget.icon;
              return (
                <Card
                  key={widget.id}
                  onClick={() => onSelectWidget(widget.id)}
                  className="bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/40 transition-all cursor-pointer p-4"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${widget.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: widget.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {widget.name}
                      </h4>
                      <p className="text-xs text-[#a3a3a3] line-clamp-2">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export { widgetTypes };