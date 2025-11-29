import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AnimatedBar({
  data = [],
  xKey = "name",
  bars = [{ key: "value", color: "#00d4ff", name: "Value" }],
  stacked = false,
  animationBegin = 150,
  animationDuration = 800
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <defs>
          {bars.map((b, i) => (
            <linearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={b.color} stopOpacity={0.5} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey={xKey} stroke="#a3a3a3" />
        <YAxis stroke="#a3a3a3" />
        <Tooltip />
        {bars.map((b, i) => (
          <Bar
            key={i}
            dataKey={b.key}
            name={b.name || b.key}
            fill={`url(#bar-grad-${i})`}
            isAnimationActive
            animationBegin={animationBegin + i * 100}
            animationDuration={animationDuration}
            stackId={stacked ? "stack" : undefined}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}