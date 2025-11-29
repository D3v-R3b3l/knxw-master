import React from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Server, Database, Share2, Shield, GitBranch } from 'lucide-react';

const Node = ({ icon: Icon, title, description, x, y, color, size = 150 }) => (
  <motion.g
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    transform={`translate(${x}, ${y})`}
  >
    <foreignObject x={-size/2} y={-size/2} width={size} height={size}>
      <div className={`w-full h-full bg-[#111111] border-2 ${color.border} rounded-2xl flex flex-col items-center justify-center p-3 text-center shadow-2xl shadow-black/50`}>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color.gradient} mb-2`}>
          <Icon className="w-7 h-7 text-black/80" />
        </div>
        <strong className="text-white text-sm font-bold">{title}</strong>
        <p className="text-xs text-[#a3a3a3] mt-1">{description}</p>
      </div>
    </foreignObject>
  </motion.g>
);

const Path = ({ d, delay = 0.5, reverse = false }) => (
  <motion.path
    d={d}
    fill="none"
    stroke="url(#arrow-gradient)"
    strokeWidth="2.5"
    strokeLinecap="round"
    initial={{ pathLength: 0, pathOffset: reverse ? 0 : 1 }}
    animate={{ pathLength: 1, pathOffset: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut", delay }}
  />
);

const colors = {
  blue: { border: 'border-[#00d4ff]/40', gradient: 'from-[#00d4ff] to-[#0ea5e9]' },
  purple: { border: 'border-[#8b5cf6]/40', gradient: 'from-[#a78bfa] to-[#8b5cf6]' },
  green: { border: 'border-[#10b981]/40', gradient: 'from-[#34d399] to-[#10b981]' },
  yellow: { border: 'border-[#fbbf24]/40', gradient: 'from-[#fcd34d] to-[#fbbf24]' },
};

export default function ArchitectureDiagram() {
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-[#0a0a0a] rounded-2xl my-8 p-4 border border-white/10">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <linearGradient id="arrow-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="800">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#00d4ff" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#00d4ff" />
          </marker>
        </defs>

        {/* Paths */}
        <g markerEnd="url(#arrowhead)">
          <Path d="M 180 225 Q 250 225, 320 225" />
          <Path d="M 480 225 Q 550 225, 620 225" />
          <Path d="M 400 130 Q 400 170, 400 210" delay={0.7} />
          <Path d="M 400 320 Q 400 280, 400 240" delay={0.7} />
          <Path d="M 625 150 Q 550 180, 495 210" delay={0.9} />
          <Path d="M 625 300 Q 550 270, 495 240" delay={0.9} />
        </g>
        
        {/* Nodes */}
        <Node icon={Users} title="Users" description="Customers & Visitors" x={100} y={225} color={colors.blue} />
        <Node icon={Code} title="Frontend SPA" description="React & Base44 SDK" x={400} y={50} color={colors.blue} />
        <Node icon={Server} title="Backend Services" description="Serverless Functions" x={400} y={225} color={colors.purple} size={160} />
        <Node icon={Database} title="Postgres DB" description="Managed Database" x={400} y={400} color={colors.green} />
        <Node icon={Share2} title="External Services" description="Stripe, Meta, Google" x={700} y={75} color={colors.yellow} />
        <Node icon={GitBranch} title="Processing Workers" description="Async Tasks & Batch Jobs" x={700} y={375} color={colors.purple} />

      </svg>
    </div>
  );
}