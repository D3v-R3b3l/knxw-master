import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Grip } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AnimatedLine from '@/components/charts/AnimatedLine';
import AnimatedBar from '@/components/charts/AnimatedBar';
import AnimatedDonut from '@/components/charts/AnimatedDonut';
import { toast } from 'sonner';

const ChartWidget = ({ config, data }) => {
  if (config.chartType === 'line') {
    return <AnimatedLine data={data} lines={config.lines || [{ key: 'value', color: '#00d4ff', name: 'Value' }]} />;
  } else if (config.chartType === 'bar') {
    return <AnimatedBar data={data} bars={config.bars || [{ key: 'value', color: '#00d4ff', name: 'Value' }]} />;
  } else if (config.chartType === 'donut') {
    return <AnimatedDonut data={data} centerTitle={config.centerTitle} centerSubtitle={config.centerSubtitle} />;
  }
  return null;
};

const MetricWidget = ({ config }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="text-5xl font-bold text-[#00d4ff] mb-2">{config.value || '0'}</div>
    <div className="text-lg text-[#a3a3a3]">{config.label || 'Metric'}</div>
  </div>
);

const TextWidget = ({ config }) => (
  <div className="p-4">
    <h3 className="text-xl font-bold text-white mb-2">{config.title || 'Title'}</h3>
    <p className="text-[#a3a3a3]">{config.content || 'Content goes here...'}</p>
  </div>
);

const WidgetConfig = ({ widget, onChange, onRemove }) => {
  const handleChange = (key, value) => {
    onChange({ ...widget, [key]: value });
  };

  return (
    <Card className="bg-[#111111] border-[#262626] mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">{widget.title || 'Widget'}</CardTitle>
          <Button size="sm" variant="ghost" onClick={onRemove} className="h-8 w-8 p-0 text-red-400">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs text-[#a3a3a3]">Widget Type</Label>
          <Select value={widget.type} onValueChange={(val) => handleChange('type', val)}>
            <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chart">Chart</SelectItem>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-[#a3a3a3]">Title</Label>
          <Input
            value={widget.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="bg-[#0a0a0a] border-[#262626]"
          />
        </div>

        {widget.type === 'chart' && (
          <div>
            <Label className="text-xs text-[#a3a3a3]">Chart Type</Label>
            <Select value={widget.chartType} onValueChange={(val) => handleChange('chartType', val)}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="donut">Donut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {widget.type === 'metric' && (
          <>
            <div>
              <Label className="text-xs text-[#a3a3a3]">Value</Label>
              <Input
                value={widget.value}
                onChange={(e) => handleChange('value', e.target.value)}
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
            <div>
              <Label className="text-xs text-[#a3a3a3]">Label</Label>
              <Input
                value={widget.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className="bg-[#0a0a0a] border-[#262626]"
              />
            </div>
          </>
        )}

        {widget.type === 'text' && (
          <div>
            <Label className="text-xs text-[#a3a3a3]">Content</Label>
            <Input
              value={widget.content}
              onChange={(e) => handleChange('content', e.target.value)}
              className="bg-[#0a0a0a] border-[#262626]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CustomDashboardBuilder({ onSave, initialWidgets = [] }) {
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [widgets, setWidgets] = useState(initialWidgets.length > 0 ? initialWidgets : [
    { id: '1', type: 'metric', title: 'Total Users', value: '1,234', label: 'Active Users' },
    { id: '2', type: 'chart', title: 'Engagement Trend', chartType: 'line' }
  ]);

  const sampleData = {
    line: Array.from({ length: 7 }, (_, i) => ({ name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], value: Math.floor(Math.random() * 100) + 50 })),
    bar: Array.from({ length: 5 }, (_, i) => ({ name: `Item ${i + 1}`, value: Math.floor(Math.random() * 100) + 20 })),
    donut: [
      { name: 'Category A', value: 30, color: '#00d4ff' },
      { name: 'Category B', value: 25, color: '#0ea5e9' },
      { name: 'Category C', value: 45, color: '#38bdf8' }
    ]
  };

  const handleAddWidget = () => {
    const newWidget = {
      id: Date.now().toString(),
      type: 'metric',
      title: 'New Widget',
      value: '0',
      label: 'Metric'
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleUpdateWidget = (id, updatedWidget) => {
    setWidgets(widgets.map(w => w.id === id ? updatedWidget : w));
  };

  const handleRemoveWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ name: dashboardName, description: dashboardDescription, widgets });
    }
    toast.success('Dashboard saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none text-white p-0 focus-visible:ring-0"
            placeholder="Dashboard Name"
          />
          <Input
            value={dashboardDescription}
            onChange={(e) => setDashboardDescription(e.target.value)}
            className="bg-transparent border-none text-[#a3a3a3] p-0 focus-visible:ring-0"
            placeholder="Add a description..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddWidget} variant="outline" className="border-[#262626]">
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
          <Button onClick={handleSave} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            <Save className="w-4 h-4 mr-2" />
            Save Dashboard
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase">Widgets</h3>
          {widgets.map(widget => (
            <WidgetConfig
              key={widget.id}
              widget={widget}
              onChange={(updated) => handleUpdateWidget(widget.id, updated)}
              onRemove={() => handleRemoveWidget(widget.id)}
            />
          ))}
        </div>

        <div className="lg:col-span-3">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="h-64"
                        >
                          <Card className="bg-[#111111] border-[#262626] h-full">
                            <CardHeader {...provided.dragHandleProps} className="cursor-move">
                              <div className="flex items-center gap-2">
                                <Grip className="w-4 h-4 text-[#6b7280]" />
                                <CardTitle className="text-white text-sm">{widget.title}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-4rem)]">
                              {widget.type === 'chart' && (
                                <ChartWidget config={widget} data={sampleData[widget.chartType] || sampleData.line} />
                              )}
                              {widget.type === 'metric' && <MetricWidget config={widget} />}
                              {widget.type === 'text' && <TextWidget config={widget} />}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}