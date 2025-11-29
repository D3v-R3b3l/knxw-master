
import React from "react";
import { Bot, Activity, Shield, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mapping for string icon names to Lucide React components
const iconMap = {
  bot: Bot,
  activity: Activity,
  shield: Shield,
  brain: Brain,
  trendingUp: TrendingUp,
};

const agents = [
  { key: 'soea', title: 'Self-Optimizing Engagement Architect', blurb: 'Continuously adapts rules, templates, and CTAs by psychographic micro-segment.', icon: 'bot', gradient: 'from-[#00d4ff] to-[#0ea5e9]' },
  { key: 'pfd', title: 'Psycho-Forensic Debugger', blurb: 'Reconstructs journeys and pinpoints psychological friction with actionable prescriptions.', icon: 'activity', gradient: 'from-[#10b981] to-[#059669]' },
  { key: 'ethics', title: 'Ethical AI Guardian', blurb: 'Proactively flags risk, manages consent, and ensures continuous compliance.', icon: 'shield', gradient: 'from-[#ec4899] to-[#db2777]' },
  // keep two legacy for breadth
  { key: 'profiler', title: 'Psychographic Profiler', blurb: 'Real-time motivations, traits, and emotional states from behavior.', icon: 'brain', gradient: 'from-[#fbbf24] to-[#f59e0b]' },
  { key: 'journey', title: 'Journey Optimizer', blurb: 'Analyzes paths and launches growth experiments.', icon: 'trendingUp', gradient: 'from-[#a855f7] to-[#9333ea]' }
];

export default function AgentShowcase({ compact = false }) {
  return (
    <section className="mt-8">
      {!compact && (
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">AI Agents that Drive ROI</h2>
          <p className="text-[#a3a3a3] mt-1">Purpose-built agents that turn psychographics into conversions, activation, and retention.</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const IconComponent = iconMap[agent.icon];
          return (
            <Card key={agent.key} className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/40 transition-colors">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-white">
                  <span className={`p-2 rounded-lg bg-gradient-to-br ${agent.gradient}`}>
                    {IconComponent && <IconComponent className="w-4 h-4 text-white" />}
                  </span>
                  {agent.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-sm text-white">{agent.blurb}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
