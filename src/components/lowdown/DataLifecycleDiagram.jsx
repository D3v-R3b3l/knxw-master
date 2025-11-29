
import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, FileCode, Server, Database, Activity, Brain, Users } from 'lucide-react';

const Step = ({ icon: Icon, title, description, x, y, delay, color }) => (
  <motion.g
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    transform={`translate(${x}, ${y})`}
  >
    <foreignObject x="-80" y="-50" width="160" height="100">
      <div className={`w-full h-full flex flex-col items-center justify-center text-center p-2`}>
        <div className={`p-3 rounded-full border-2 ${color.border} bg-[#111111] mb-2`}>
          <Icon className={`w-7 h-7 ${color.text}`} />
        </div>
        <strong className="text-white text-sm font-bold">{title}</strong>
        <p className="text-xs text-[#a3a3a3] mt-1">{description}</p>
      </div>
    </foreignObject>
  </motion.g>
);

const Path = ({ d, delay }) => (
  <motion.path
    d={d}
    fill="none"
    stroke="url(#lifecycle-gradient)"
    strokeWidth="2"
    strokeDasharray="4 4"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 1.2, ease: "linear", delay }}
  />
);

const colors = {
  cyan: { border: 'border-[#00d4ff]/40', text: 'text-[#00d4ff]' },
  green: { border: 'border-[#10b981]/40', text: 'text-[#10b981]' },
  purple: { border: 'border-[#8b5cf6]/40', text: 'text-[#8b5cf6]' },
  pink: { border: 'border-[#ec4899]/40', text: 'text-[#ec4899]' },
};

export default function DataLifecycleDiagram() {
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-[#0a0a0a] rounded-2xl my-8 p-4 border border-white/10">
      <svg viewBox="0 0 800 450" className="w-full h-full">
        <defs>
          <linearGradient id="lifecycle-gradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Paths */}
        <Path d="M 100 110 H 700" delay={0.2} />
        <Path d="M 700 110 V 340" delay={1.4} />
        <Path d="M 700 340 H 100" delay={2.6} />
        <Path d="M 100 340 V 110" delay={3.8} />

        {/* Steps */}
        <Step icon={MousePointerClick} title="1. User Action" description="Click, scroll, view" x={100} y={50} delay={0} color={colors.cyan} />
        <Step icon={FileCode} title="2. SDK Capture" description="knxw.js batches event" x={400} y={50} delay={0.6} color={colors.cyan} />
        <Step icon={Server} title="3. Ingestion" description="`captureEvent` endpoint" x={700} y={50} delay={1.2} color={colors.purple} />
        
        <Step icon={Database} title="4. Raw Storage" description="`CapturedEvent` entity" x={700} y={225} delay={1.8} color={colors.green} />

        <Step icon={Activity} title="5. Processing" description="`liveProfileProcessor` task" x={700} y={400} delay={2.4} color={colors.purple} />
        <Step icon={Brain} title="6. AI Enrichment" description="Multi-layer inference" x={400} y={400} delay={3.0} color={colors.pink} />
        <Step icon={Database} title="7. Fused Profile" description="`UserPsychographicProfile`" x={100} y={400} delay={3.6} color={colors.green} />
        
        <Step icon={Users} title="8. Activation" description="Segmentation & Engagements" x={100} y={225} delay={4.2} color={colors.cyan} />

      </svg>
    </div>
  );
}
