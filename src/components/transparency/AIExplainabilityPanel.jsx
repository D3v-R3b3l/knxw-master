import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Eye, Lightbulb, ChevronDown, ChevronUp, 
  HelpCircle, Info, Clock, Activity, Target, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIExplainabilityPanel({ profile, insights = [] }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Extract reasoning from profile
  const reasoning = profile?.profile_reasoning || {};
  const provenance = profile?.provenance || {};

  const sections = [
    {
      id: 'personality',
      title: 'Personality Traits',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      confidence: profile?.personality_confidence_score || 0,
      explanation: reasoning.personality_explanation || 'Based on your interaction patterns, response times, and content preferences.',
      data: profile?.personality_traits
    },
    {
      id: 'emotional',
      title: 'Emotional State',
      icon: Activity,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      confidence: profile?.emotional_state_confidence_score || 0,
      explanation: reasoning.emotional_state_reasoning || 'Inferred from recent session behavior and engagement patterns.',
      data: profile?.emotional_state
    },
    {
      id: 'cognitive',
      title: 'Cognitive Style',
      icon: Lightbulb,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      confidence: profile?.cognitive_style_confidence_score || 0,
      explanation: reasoning.cognitive_style_rationale || 'Determined by how you process information and make decisions.',
      data: { style: profile?.cognitive_style }
    },
    {
      id: 'motivation',
      title: 'Motivations',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      confidence: profile?.motivation_confidence_score || 0,
      explanation: reasoning.motivation_basis || 'Derived from your goals, interests, and behavioral patterns.',
      data: { motivations: profile?.motivation_stack_v2 }
    },
    {
      id: 'risk',
      title: 'Risk Profile',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      confidence: profile?.risk_profile_confidence_score || 0,
      explanation: 'Based on your decision-making patterns and response to uncertainty.',
      data: { risk_profile: profile?.risk_profile }
    }
  ];

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#00d4ff]" />
          How We Understand You
          <Badge className="ml-2 bg-[#00d4ff]/20 text-[#00d4ff] text-xs">AI Explainability</Badge>
        </CardTitle>
        <p className="text-sm text-[#a3a3a3]">
          Transparency into how our AI forms conclusions about your preferences and behavior
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          const confidencePercent = Math.round(section.confidence * 100);

          return (
            <div 
              key={section.id}
              className={`rounded-lg border transition-all ${
                isExpanded ? 'border-[#00d4ff]/50 bg-[#1a1a1a]' : 'border-[#262626] bg-[#0f0f0f]'
              }`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <Icon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white">{section.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={confidencePercent} className="w-20 h-1.5" />
                      <span className="text-xs text-[#6b7280]">{confidencePercent}% confidence</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#6b7280]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#6b7280]" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {/* Explanation */}
                      <div className="p-3 rounded-lg bg-[#262626]/50 border border-[#333]">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-[#00d4ff] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-[#a3a3a3]">{section.explanation}</p>
                        </div>
                      </div>

                      {/* Current Values */}
                      {section.data && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Current Values</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {section.id === 'personality' && section.data && Object.entries(section.data).map(([trait, value]) => (
                              <div key={trait} className="flex items-center justify-between p-2 rounded bg-[#1a1a1a]">
                                <span className="text-xs text-[#a3a3a3] capitalize">{trait}</span>
                                <span className="text-xs text-white font-medium">{Math.round(value * 100)}%</span>
                              </div>
                            ))}
                            {section.id === 'emotional' && section.data && (
                              <>
                                <div className="flex items-center justify-between p-2 rounded bg-[#1a1a1a]">
                                  <span className="text-xs text-[#a3a3a3]">Mood</span>
                                  <Badge className="bg-[#262626] text-white text-xs capitalize">{section.data.mood}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-[#1a1a1a]">
                                  <span className="text-xs text-[#a3a3a3]">Energy</span>
                                  <Badge className="bg-[#262626] text-white text-xs capitalize">{section.data.energy_level}</Badge>
                                </div>
                              </>
                            )}
                            {section.id === 'cognitive' && (
                              <div className="col-span-2 flex items-center justify-between p-2 rounded bg-[#1a1a1a]">
                                <span className="text-xs text-[#a3a3a3]">Style</span>
                                <Badge className="bg-[#262626] text-white text-xs capitalize">{section.data.style || 'Unknown'}</Badge>
                              </div>
                            )}
                            {section.id === 'motivation' && section.data.motivations?.map((m, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded bg-[#1a1a1a]">
                                <span className="text-xs text-[#a3a3a3]">{m.label}</span>
                                <span className="text-xs text-white font-medium">{Math.round(m.weight * 100)}%</span>
                              </div>
                            ))}
                            {section.id === 'risk' && (
                              <div className="col-span-2 flex items-center justify-between p-2 rounded bg-[#1a1a1a]">
                                <span className="text-xs text-[#a3a3a3]">Profile</span>
                                <Badge className="bg-[#262626] text-white text-xs capitalize">{section.data.risk_profile || 'Unknown'}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Data Sources */}
                      {provenance[section.id] && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Data Sources</h5>
                          <div className="space-y-1">
                            {provenance[section.id].slice(0, 3).map((source, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-[#6b7280]">
                                <Clock className="w-3 h-3" />
                                <span>{source.source}</span>
                                <span>•</span>
                                <span>Weight: {Math.round(source.weight * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Key Recent Events */}
        {reasoning.key_recent_events?.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00d4ff]" />
              Key Events Influencing Your Profile
            </h4>
            <div className="space-y-2">
              {reasoning.key_recent_events.map((event, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Factors */}
        {reasoning.confidence_factors?.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-[#00d4ff]/5 to-[#8b5cf6]/5 border border-[#00d4ff]/20">
            <h4 className="text-sm font-medium text-white mb-2">Why We're Confident</h4>
            <ul className="space-y-1">
              {reasoning.confidence_factors.map((factor, i) => (
                <li key={i} className="text-xs text-[#a3a3a3] flex items-start gap-2">
                  <span className="text-[#00d4ff]">✓</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}