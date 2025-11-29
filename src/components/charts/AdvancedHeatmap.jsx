import React from 'react';

export default function AdvancedHeatmap({ data, xLabels, yLabels, width = 800, height = 400 }) {
  if (!data || data.length === 0) return null;

  const cellWidth = width / (xLabels?.length || data[0]?.length || 1);
  const cellHeight = height / (yLabels?.length || data.length);

  // Find min and max values for color scaling
  const allValues = data.flat();
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const getColor = (value) => {
    if (maxValue === minValue) return '#00d4ff';
    
    const intensity = (value - minValue) / (maxValue - minValue);
    
    // Color gradient from blue (low) to red (high)
    if (intensity < 0.25) {
      return `rgba(0, 212, 255, ${0.2 + intensity * 2})`;
    } else if (intensity < 0.5) {
      return `rgba(16, 185, 129, ${intensity})`;
    } else if (intensity < 0.75) {
      return `rgba(251, 191, 36, ${intensity})`;
    } else {
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <svg width={width + 100} height={height + 50} className="w-full h-auto">
        {/* Y-axis labels */}
        <g>
          {yLabels?.map((label, i) => (
            <text
              key={`y-${i}`}
              x={80}
              y={i * cellHeight + cellHeight / 2 + 10}
              textAnchor="end"
              fill="#a3a3a3"
              fontSize="11"
            >
              {label}
            </text>
          ))}
        </g>

        {/* Heatmap cells */}
        <g transform="translate(100, 10)">
          {data.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <g key={`cell-${rowIndex}-${colIndex}`}>
                <rect
                  x={colIndex * cellWidth}
                  y={rowIndex * cellHeight}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill={getColor(value)}
                  stroke="#0a0a0a"
                  strokeWidth="1"
                  rx="4"
                  className="transition-all duration-200 hover:stroke-white hover:stroke-2"
                >
                  <title>{`${yLabels?.[rowIndex] || rowIndex} × ${xLabels?.[colIndex] || colIndex}: ${value.toLocaleString()}`}</title>
                </rect>
                
                {/* Value label */}
                <text
                  x={colIndex * cellWidth + cellWidth / 2}
                  y={rowIndex * cellHeight + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {value}
                </text>
              </g>
            ))
          )}
        </g>

        {/* X-axis labels */}
        <g transform="translate(100, 10)">
          {xLabels?.map((label, i) => (
            <text
              key={`x-${i}`}
              x={i * cellWidth + cellWidth / 2}
              y={data.length * cellHeight + 15}
              textAnchor="middle"
              fill="#a3a3a3"
              fontSize="11"
            >
              {label}
            </text>
          ))}
        </g>

        {/* Legend */}
        <g transform={`translate(${width - 80}, 20)`}>
          <text x="0" y="0" fill="#a3a3a3" fontSize="10" fontWeight="600">
            Intensity
          </text>
          <rect x="0" y="10" width="60" height="15" fill="url(#heatmap-gradient)" rx="2" />
          <text x="0" y="35" fill="#a3a3a3" fontSize="9">{minValue.toFixed(0)}</text>
          <text x="60" y="35" fill="#a3a3a3" fontSize="9" textAnchor="end">{maxValue.toFixed(0)}</text>
        </g>

        <defs>
          <linearGradient id="heatmap-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0, 212, 255, 0.4)" />
            <stop offset="33%" stopColor="rgba(16, 185, 129, 0.6)" />
            <stop offset="66%" stopColor="rgba(251, 191, 36, 0.8)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 1)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}