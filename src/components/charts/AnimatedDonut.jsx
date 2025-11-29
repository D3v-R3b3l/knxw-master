import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

function lighten(hex, amt = 20) {
  try {
    let col = hex.replace("#", "");
    if (col.length === 3) col = col.split("").map(c => c + c).join("");
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00FF) + amt;
    let b = (num & 0x0000FF) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + (b | (g << 8) | (r << 16)).toString(16).padStart(6, "0");
  } catch {
    return hex;
  }
}

export default function AnimatedDonut({
  data = [],
  innerRadius = 56,
  outerRadius = 92,
  centerTitle,
  centerSubtitle,
  animationBegin = 100,
  animationDuration = 800
}) {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {data.map((d, i) => (
            <linearGradient id={`donut-grad-${i}`} key={i} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={lighten(d.color || "#00d4ff", 24)} />
              <stop offset="100%" stopColor={d.color || "#00d4ff"} />
            </linearGradient>
          ))}
          <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00d4ff" floodOpacity="0.15"/>
          </filter>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          isAnimationActive
          animationBegin={animationBegin}
          animationDuration={animationDuration}
          onMouseEnter={(_, idx) => setActiveIndex(idx)}
          onMouseLeave={() => setActiveIndex(-1)}
        >
          {data.map((entry, index) => {
            const isActive = index === activeIndex;
            return (
              <Cell
                key={`cell-${index}`}
                fill={`url(#donut-grad-${index})`}
                stroke={lighten(entry.color || "#00d4ff", -10)}
                strokeWidth={isActive ? 2 : 1}
                filter={isActive ? "url(#donutShadow)" : undefined}
              />
            );
          })}
        </Pie>
        {(centerTitle || centerSubtitle) && (
          <g>
            {centerTitle && (
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-white" style={{ fontSize: 16, fontWeight: 700 }}>
                {centerTitle}
              </text>
            )}
            {centerSubtitle && (
              <text x="50%" y="50%" dy="18" textAnchor="middle" dominantBaseline="central" className="fill-[#a3a3a3]" style={{ fontSize: 12 }}>
                {centerSubtitle}
              </text>
            )}
          </g>
        )}
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}