import React from 'react';
import { Users, MessageSquare, Brain, Sparkles } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function CollaborationDoc() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          knXw's AI-powered collaboration features help teams work more effectively by matching tasks to team members 
          based on their psychographic profiles, automatically summarizing discussions, and facilitating intelligent 
          document co-editing.
        </p>

        <Callout type="info" icon={Brain}>
          <strong>Psychology-First Collaboration:</strong> Instead of manual task assignment, let AI match tasks 
          to team members based on cognitive style, motivations, and working preferences for optimal productivity.
        </Callout>
      </Section>

      <Section title="Features">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-[#00d4ff]" />
              <h4 className="text-white font-semibold">Smart Task Assignment</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              AI suggests optimal team member for each task based on their psychological profile - analytical users 
              for data tasks, creative users for content, systematic users for process work.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-[#8b5cf6]" />
              <h4 className="text-white font-semibold">Discussion Summaries</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Automatically summarize team discussions with psychographic context - which motivations drove decisions, 
              cognitive styles that influenced outcomes.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-[#fbbf24]" />
              <h4 className="text-white font-semibold">Team Dynamics Analysis</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Understand your team's collective psychology - dominant cognitive styles, risk profiles, motivational 
              patterns to optimize team composition.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#10b981]" />
              <h4 className="text-white font-semibold">Context-Aware Suggestions</h4>
            </div>
            <p className="text-[#a3a3a3] text-sm">
              Real-time suggestions for collaboration opportunities based on current work context and team member 
              psychological compatibility.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Best Practices">
        <div className="space-y-3">
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Match Cognitive Styles to Tasks</h5>
            <ul className="text-[#e5e5e5] text-sm space-y-1 ml-4">
              <li>• Analytical → Data analysis, metrics review, technical documentation</li>
              <li>• Intuitive → Strategy, vision, customer interviews</li>
              <li>• Systematic → Process design, workflow optimization, QA</li>
              <li>• Creative → Content creation, design, brainstorming</li>
            </ul>
          </div>

          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
            <h5 className="text-white font-semibold mb-2">Balance Risk Profiles</h5>
            <p className="text-[#e5e5e5] text-sm">
              Mix conservative and aggressive risk profiles in decision-making teams for balanced outcomes. 
              Conservatives catch risks, aggressives drive innovation.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}