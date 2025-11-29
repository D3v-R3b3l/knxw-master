import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SankeyDiagram({ data, width = 800, height = 600 }) {
  if (!data || !data.nodes || !data.links) {
    return (
      <div className="flex items-center justify-center h-full text-[#6b7280]">
        <p>No flow data available</p>
      </div>
    );
  }

  // Transform sankey data into bar chart format showing flow volumes
  const flowData = data.links.map((link, index) => {
    const sourceName = typeof link.source === 'object' ? link.source.name : data.nodes[link.source]?.name || 'Unknown';
    const targetName = typeof link.target === 'object' ? link.target.name : data.nodes[link.target]?.name || 'Unknown';
    
    return {
      name: `${sourceName} → ${targetName}`,
      value: link.value || 0,
      color: ['#00d4ff', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'][index % 8]
    };
  }).sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-semibold mb-1">{payload[0].payload.name}</p>
          <p className="text-[#00d4ff] text-sm font-bold">{payload[0].value.toLocaleString()} users</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={flowData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <XAxis type="number" stroke="#6b7280" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#6b7280" 
            tick={{ fill: '#e5e5e5', fontSize: 11 }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {flowData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}