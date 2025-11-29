import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

export default function AnimatedLine({
  data = [],
  xKey = "name",
  lines = [
    { key: "value", color: "#00d4ff", name: "Value" }
  ],
  animationBegin = 200,
  animationDuration = 900,
  showGrid = true
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <defs>
          {lines.map((ln, i) => (
            <linearGradient key={i} id={`ln-stroke-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ln.color} stopOpacity="1" />
              <stop offset="100%" stopColor={ln.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
          {lines.map((ln, i) => (
            <linearGradient key={`fill-${i}`} id={`ln-fill-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ln.color} stopOpacity={0.25}/>
              <stop offset="95%" stopColor={ln.color} stopOpacity={0.02}/>
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid stroke="#262626" strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} stroke="#a3a3a3" />
        <YAxis stroke="#a3a3a3" />
        <Tooltip />
        {lines.map((ln, i) => (
          <Area
            key={`area-${i}`}
            type="monotone"
            dataKey={ln.key}
            stroke="none"
            fill={`url(#ln-fill-${i})`}
          />
        ))}
        {lines.map((ln, i) => (
          <Line
            key={`line-${i}`}
            type="monotone"
            dataKey={ln.key}
            name={ln.name || ln.key}
            stroke={`url(#ln-stroke-${i})`}
            strokeWidth={2.5}
            dot={{ r: 2.5, stroke: ln.color, strokeWidth: 2, fill: "#0a0a0a" }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: ln.color, fill: "#0a0a0a" }}
            isAnimationActive
            animationBegin={animationBegin}
            animationDuration={animationDuration}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}