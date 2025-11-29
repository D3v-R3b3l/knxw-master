
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  UserPlus,
  Target,
  Loader2,
  CheckCircle,
  Brain
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

const PREDEFINED_SEGMENTS = [
  {
    id: 'high_engagement',
    name: 'High Engagement Champions',
    icon: TrendingUp,
    color: '#10b981',
    description: 'Users with consistent high engagement and positive emotional states',
    characteristics: [
      'Multiple daily interactions',
      'Positive or excited emotional state',
      'High openness and extraversion',
      'Achievement or mastery motivation'
    ],
    filter_conditions: {
      operator: 'AND',
      conditions: [
        {
          type: 'behavior',
          field: 'event_count',
          operator: 'greater_than',
          value: 50,
          behavior_config: {
            event_type: 'click',
            frequency: 'at_least',
            count: 10,
            time_window_days: 7
          }
        },
        {
          type: 'trait',
          field: 'emotional_state.mood',
          operator: 'in',
          value: ['positive', 'excited', 'confident']
        },
        {
          type: 'trait',
          field: 'personality_traits.openness',
          operator: 'greater_than',
          value: 0.6
        }
      ]
    },
    recommended_actions: [
      'Invite to beta programs',
      'Request testimonials or case studies',
      'Engage for referral program'
    ]
  },
  {
    id: 'at_risk',
    name: 'At Risk of Churning',
    icon: AlertTriangle,
    color: '#ef4444',
    description: 'Users showing declining engagement and negative signals',
    characteristics: [
      'Decreased activity in last 14 days',
      'Negative or anxious emotional state',
      'High neuroticism traits',
      'No recent conversions'
    ],
    filter_conditions: {
      operator: 'AND',
      conditions: [
        {
          type: 'trait',
          field: 'staleness_score',
          operator: 'greater_than',
          value: 0.6
        },
        {
          type: 'trait',
          field: 'emotional_state.mood',
          operator: 'in',
          value: ['negative', 'anxious', 'uncertain']
        },
        {
          type: 'behavior',
          field: 'event_count',
          operator: 'less_than',
          value: 5,
          behavior_config: {
            event_type: 'page_view',
            frequency: 'at_most',
            count: 5,
            time_window_days: 14
          }
        }
      ]
    },
    recommended_actions: [
      'Send personalized re-engagement email',
      'Offer targeted incentive or discount',
      'Trigger supportive check-in'
    ]
  },
  {
    id: 'potential_advocates',
    name: 'Potential Advocates',
    icon: Heart,
    color: '#ec4899',
    description: 'Satisfied users likely to recommend your product',
    characteristics: [
      'Consistent usage over 30+ days',
      'High agreeableness and extraversion',
      'Social or connection motivation',
      'Positive engagement patterns'
    ],
    filter_conditions: {
      operator: 'AND',
      conditions: [
        {
          type: 'trait',
          field: 'personality_traits.agreeableness',
          operator: 'greater_than',
          value: 0.65
        },
        {
          type: 'trait',
          field: 'personality_traits.extraversion',
          operator: 'greater_than',
          value: 0.6
        },
        {
          type: 'motive',
          field: 'motivation_labels',
          operator: 'contains',
          value: 'social_connection'
        },
        {
          type: 'behavior',
          field: 'event_count',
          operator: 'greater_than',
          value: 100,
          behavior_config: {
            event_type: 'page_view',
            frequency: 'at_least',
            count: 100,
            time_window_days: 30
          }
        }
      ]
    },
    recommended_actions: [
      'Request product reviews',
      'Invite to referral program',
      'Feature in case studies'
    ]
  },
  {
    id: 'new_users',
    name: 'New User Onboarding',
    icon: UserPlus,
    color: '#00d4ff',
    description: 'Recently joined users needing guidance and education',
    characteristics: [
      'Account created within last 7 days',
      'Low overall engagement',
      'Exploration or learning motivation',
      'Uncertain emotional state'
    ],
    filter_conditions: {
      operator: 'AND',
      conditions: [
        {
          type: 'behavior',
          field: 'days_since_first_event',
          operator: 'less_than',
          value: 7,
          behavior_config: {
            event_type: 'page_view',
            frequency: 'at_least',
            count: 1,
            time_window_days: 7
          }
        },
        {
          type: 'motive',
          field: 'motivation_labels',
          operator: 'contains',
          value: 'learning'
        }
      ]
    },
    recommended_actions: [
      'Send onboarding email sequence',
      'Show interactive product tour',
      'Provide educational content'
    ]
  },
  {
    id: 'power_users',
    name: 'Power Users',
    icon: Target,
    color: '#8b5cf6',
    description: 'Advanced users who maximize feature usage',
    characteristics: [
      'Uses 5+ different features regularly',
      'High conscientiousness',
      'Mastery or achievement motivation',
      'Analytical cognitive style'
    ],
    filter_conditions: {
      operator: 'AND',
      conditions: [
        {
          type: 'trait',
          field: 'personality_traits.conscientiousness',
          operator: 'greater_than',
          value: 0.7
        },
        {
          type: 'trait',
          field: 'cognitive_style',
          operator: 'equals',
          value: 'analytical'
        },
        {
          type: 'motive',
          field: 'motivation_labels',
          operator: 'contains',
          value: 'mastery'
        },
        {
          type: 'behavior',
          field: 'event_count',
          operator: 'greater_than',
          value: 200,
          behavior_config: {
            event_type: 'click',
            frequency: 'at_least',
            count: 200,
            time_window_days: 30
          }
        }
      ]
    },
    recommended_actions: [
      'Invite to beta features',
      'Request advanced tutorials',
      'Engage for product feedback'
    ]
  }
];

export default function AISegmentSuggestions({ onApplySegment }) {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [customSegments, setCustomSegments] = useState([]);

  const generateCustomSegments = async () => {
    setGeneratingCustom(true);
    try {
      // Fetch current user profiles to analyze
      const profiles = await base44.entities.UserPsychographicProfile.list('-last_analyzed', 100);
      
      if (profiles.length === 0) {
        toast({
          title: 'No Profiles Available',
          description: 'Start tracking users to get AI segment suggestions',
          variant: 'info'
        });
        setGeneratingCustom(false);
        return;
      }

      // Use LLM to analyze profiles and suggest custom segments
      const prompt = `Analyze these user psychographic profiles and suggest 2-3 additional high-value audience segments beyond the standard ones (High Engagement, At Risk, etc.).

Profiles Summary:
- Total users: ${profiles.length}
- Cognitive styles: ${JSON.stringify([...new Set(profiles.map(p => p.cognitive_style))])}
- Risk profiles: ${JSON.stringify([...new Set(profiles.map(p => p.risk_profile))])}
- Top motivations: ${JSON.stringify([...new Set(profiles.flatMap(p => p.motivation_labels || []))])}

Return 2-3 segment suggestions in this exact JSON format:
{
  "segments": [
    {
      "name": "Segment Name",
      "description": "Brief description",
      "characteristics": ["Trait 1", "Trait 2", "Trait 3"],
      "estimated_size_percent": 15,
      "recommended_actions": ["Action 1", "Action 2"]
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            segments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  characteristics: { type: 'array', items: { type: 'string' } },
                  estimated_size_percent: { type: 'number' },
                  recommended_actions: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      if (result?.segments && result.segments.length > 0) {
        setCustomSegments(result.segments);
        toast({
          title: 'AI Segments Generated',
          description: `Found ${result.segments.length} custom segment opportunities`,
        });
      }
    } catch (error) {
      console.error('Failed to generate custom segments:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate custom segments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingCustom(false);
    }
  };

  const SegmentCard = ({ segment, isCustom = false }) => {
    const Icon = segment.icon || Brain;
    const color = segment.color || '#00d4ff';

    return (
      <Card 
        className={`bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/40 transition-all cursor-pointer ${
          selectedSegment?.id === segment.id ? 'border-[#00d4ff] bg-[#00d4ff]/5' : ''
        }`}
        onClick={() => setSelectedSegment(segment)}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div 
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white text-base break-words">{segment.name}</CardTitle>
                {isCustom && (
                  <Badge className="mt-1 bg-[#8b5cf6] text-white border-none text-xs font-semibold">
                    AI Suggested
                  </Badge>
                )}
              </div>
            </div>
            {!isCustom && (
              <Badge className="bg-[#00d4ff] text-[#0a0a0a] text-xs font-semibold border-none flex-shrink-0">
                Pre-built
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-[#a3a3a3]">
            {segment.description}
          </p>

          <div>
            <h5 className="text-xs font-semibold text-white mb-2">Key Characteristics:</h5>
            <ul className="space-y-1">
              {segment.characteristics.map((char, idx) => (
                <li key={idx} className="text-xs text-[#a3a3a3] flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>

          {segment.estimated_size_percent && (
            <div className="pt-2 border-t border-[#262626]">
              <p className="text-xs text-[#6b7280]">
                Est. Size: <span className="text-[#00d4ff] font-semibold">{segment.estimated_size_percent}%</span> of users
              </p>
            </div>
          )}

          <div>
            <h5 className="text-xs font-semibold text-white mb-2">Recommended Actions:</h5>
            <div className="flex flex-wrap gap-1">
              {segment.recommended_actions.slice(0, 3).map((action, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-[#00d4ff]/10 text-[#00d4ff] rounded border border-[#00d4ff]/20">
                  {action}
                </span>
              ))}
            </div>
          </div>

          {selectedSegment?.id === segment.id && (
            <Button
              onClick={() => onApplySegment(segment)}
              className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] mt-3 font-semibold"
            >
              Use This Segment
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#00d4ff]/10 to-[#0ea5e9]/10 border-[#00d4ff]/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00d4ff]" />
                <span className="break-words">AI-Powered Segment Suggestions</span>
              </CardTitle>
              <p className="text-sm text-[#a3a3a3] mt-2">
                Start with proven segments or let AI analyze your users to suggest custom opportunities
              </p>
            </div>
            <Button
              onClick={generateCustomSegments}
              disabled={generatingCustom}
              size="sm"
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold flex-shrink-0"
            >
              {generatingCustom ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Custom Segments
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Pre-built Segments */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Pre-built Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREDEFINED_SEGMENTS.map(segment => (
            <SegmentCard key={segment.id} segment={segment} />
          ))}
        </div>
      </div>

      {/* AI-Generated Custom Segments */}
      {customSegments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#8b5cf6]" />
            AI-Discovered Segments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customSegments.map((segment, idx) => (
              <SegmentCard 
                key={`custom-${idx}`} 
                segment={{
                  ...segment,
                  id: `custom-${idx}`,
                  icon: Brain,
                  color: '#8b5cf6'
                }} 
                isCustom={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { PREDEFINED_SEGMENTS };
