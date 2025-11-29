
import React, { useState, useEffect } from 'react';
import { EngagementRule } from '@/entities/all';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Target, Brain, Activity, Clock, Trash2 } from 'lucide-react';

export default function EngagementRuleBuilder({ rule, clientApp, templates, onSave, onCancel }) {
  const [currentRule, setCurrentRule] = useState(rule || {
    name: '',
    description: '',
    trigger_conditions: {
      psychographic_conditions: [],
      behavioral_conditions: [],
      timing_conditions: {}
    },
    engagement_action: {
      type: 'checkin',
      template_id: '',
      priority: 'medium',
      max_frequency: { limit: 1, period: 'day' }
    },
    status: 'inactive',
    ab_test_config: {
      enabled: false,
      test_name: '',
      variants: []
    }
  });

  const [showABTesting, setShowABTesting] = useState(currentRule.ab_test_config?.enabled || false);

  useEffect(() => {
    if (rule) {
      setCurrentRule({
        name: rule.name || '',
        description: rule.description || '',
        trigger_conditions: rule.trigger_conditions || {
          psychographic_conditions: [],
          behavioral_conditions: [],
          timing_conditions: {}
        },
        engagement_action: rule.engagement_action || {
          type: 'checkin',
          template_id: '',
          priority: 'medium',
          max_frequency: { limit: 1, period: 'day' }
        },
        status: rule.status || 'inactive',
        ab_test_config: rule.ab_test_config || {
          enabled: false,
          test_name: '',
          variants: []
        }
      });
      setShowABTesting(rule.ab_test_config?.enabled || false);
    }
  }, [rule]);

  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const ruleData = {
      ...currentRule,
      client_app_id: clientApp.id,
      owner_id: clientApp.owner_id
    };

    try {
      if (rule) {
        await EngagementRule.update(rule.id, ruleData);
      } else {
        await EngagementRule.create(ruleData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const addPsychographicCondition = () => {
    setCurrentRule(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        psychographic_conditions: [
          ...prev.trigger_conditions.psychographic_conditions,
          { field: 'risk_profile', operator: 'equals', value: '' }
        ]
      }
    }));
  };

  const removePsychographicCondition = (index) => {
    setCurrentRule(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        psychographic_conditions: prev.trigger_conditions.psychographic_conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePsychographicCondition = (index, field, value) => {
    setCurrentRule(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        psychographic_conditions: prev.trigger_conditions.psychographic_conditions.map((condition, i) =>
          i === index ? { ...condition, [field]: value } : condition
        )
      }
    }));
  };

  const addBehavioralCondition = () => {
    setCurrentRule(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        behavioral_conditions: [
          ...prev.trigger_conditions.behavioral_conditions,
          { event_type: 'click', frequency: 'once', time_window: 'session' }
        ]
      }
    }));
  };

  const removeBehavioralCondition = (index) => {
    setCurrentRule(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        behavioral_conditions: prev.trigger_conditions.behavioral_conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const updateBehavioralCondition = (index, field, value) => {
    setCurrentRule(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        behavioral_conditions: prev.trigger_conditions.behavioral_conditions.map((condition, i) =>
          i === index ? { ...condition, [field]: value } : condition
        )
      }
    }));
  };

  const enableABTesting = () => {
    setCurrentRule(prev => {
      const initialTemplateId = prev.engagement_action.template_id || '';
      return {
        ...prev,
        ab_test_config: {
          enabled: true,
          test_name: `${prev.name || 'New Rule'} A/B Test`,
          variants: [
            {
              id: `control-${Date.now()}`, // Unique ID for keying
              name: "Control",
              template_id: initialTemplateId,
              traffic_weight: 0.5,
              is_control: true
            },
            {
              id: `variant-a-${Date.now() + 1}`, // Unique ID for keying
              name: "Variant A",
              template_id: "",
              traffic_weight: 0.5,
              is_control: false
            }
          ]
        }
      };
    });
    setShowABTesting(true);
  };

  const disableABTesting = () => {
    setCurrentRule(prev => ({
      ...prev,
      ab_test_config: {
        enabled: false,
        test_name: "",
        variants: []
      }
    }));
    setShowABTesting(false);
  };

  const availableTemplates = templates.filter(t => t.type === currentRule.engagement_action.type);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-[#1a1a1a] border-[#262626]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#fbbf24]" />
              Rule Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Rule Name</label>
              <Input
                value={currentRule.name}
                onChange={(e) => setCurrentRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome New Users, Checkout Abandonment Recovery"
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Description</label>
              <Textarea
                value={currentRule.description}
                onChange={(e) => setCurrentRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does and when it should trigger"
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* NEW: A/B Testing Section */}
        <Card className="bg-[#1a1a1a] border-[#262626]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">A/B Testing</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#a3a3a3]">Enable A/B Testing</span>
                <input
                  type="checkbox"
                  checked={currentRule.ab_test_config?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      enableABTesting();
                    } else {
                      disableABTesting();
                    }
                  }}
                  className="w-4 h-4 accent-[#00d4ff]" // Added accent color for checkbox
                />
              </div>
            </div>
            <p className="text-sm text-[#a3a3a3]">
              Test multiple variations of this engagement to optimize performance
            </p>
          </CardHeader>
          
          {showABTesting && (
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Test Name</label>
                <Input
                  value={currentRule.ab_test_config?.test_name || ''}
                  onChange={(e) => setCurrentRule(prev => ({
                    ...prev,
                    ab_test_config: {
                      ...prev.ab_test_config,
                      test_name: e.target.value
                    }
                  }))}
                  className="bg-[#0a0a0a] border-[#262626] text-white"
                  placeholder="Enter test name..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Test Variants</h4>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const newVariant = {
                        id: `variant-${Date.now() + (currentRule.ab_test_config?.variants?.length || 0)}`, // Unique ID for keying
                        name: `Variant ${String.fromCharCode(65 + (currentRule.ab_test_config?.variants?.filter(v => !v.is_control).length || 0))}`,
                        template_id: "",
                        traffic_weight: 0.5, // Will need to be redistributed
                        is_control: false
                      };
                      setCurrentRule(prev => ({
                        ...prev,
                        ab_test_config: {
                          ...prev.ab_test_config,
                          variants: [...(prev.ab_test_config?.variants || []), newVariant]
                        }
                      }));
                    }}
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {currentRule.ab_test_config?.variants?.map((variant, index) => (
                  <div key={variant.id || index} className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-[#a3a3a3] mb-1">Variant Name</label>
                        <Input
                          value={variant.name}
                          onChange={(e) => {
                            const updatedVariants = [...(currentRule.ab_test_config?.variants || [])];
                            updatedVariants[index] = { ...updatedVariants[index], name: e.target.value };
                            setCurrentRule(prev => ({
                              ...prev,
                              ab_test_config: {
                                ...prev.ab_test_config,
                                variants: updatedVariants
                              }
                            }));
                          }}
                          className="bg-[#111111] border-[#262626] text-white text-sm"
                          disabled={variant.is_control}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#a3a3a3] mb-1">Template</label>
                        <Select
                          value={variant.template_id}
                          onValueChange={(value) => {
                            const updatedVariants = [...(currentRule.ab_test_config?.variants || [])];
                            updatedVariants[index] = { ...updatedVariants[index], template_id: value };
                            setCurrentRule(prev => ({
                              ...prev,
                              ab_test_config: {
                                ...prev.ab_test_config,
                                variants: updatedVariants
                              }
                            }));
                          }}
                        >
                          <SelectTrigger className="bg-[#111111] border-[#262626] text-white text-sm">
                            <SelectValue placeholder="Select template..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111111] border-[#262626]">
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} ({template.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-[#a3a3a3] mb-1">
                            Traffic ({Math.round(variant.traffic_weight * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0" // Changed min to 0
                            max="1"
                            step="0.01" // Changed step for finer control
                            value={variant.traffic_weight}
                            onChange={(e) => {
                              const updatedVariants = [...(currentRule.ab_test_config?.variants || [])];
                              updatedVariants[index] = { ...updatedVariants[index], traffic_weight: parseFloat(e.target.value) };
                              setCurrentRule(prev => ({
                                ...prev,
                                ab_test_config: {
                                  ...prev.ab_test_config,
                                  variants: updatedVariants
                                }
                              }));
                            }}
                            className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer range-lg accent-[#00d4ff]"
                          />
                        </div>
                        {!variant.is_control && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const updatedVariants = (currentRule.ab_test_config?.variants || []).filter((_, i) => i !== index);
                              setCurrentRule(prev => ({
                                ...prev,
                                ab_test_config: {
                                  ...prev.ab_test_config,
                                  variants: updatedVariants
                                }
                              }));
                            }}
                            className="border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {variant.is_control && (
                      <Badge className="mt-2 bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">
                        Control Group
                      </Badge>
                    )}
                  </div>
                ))}
                {currentRule.ab_test_config?.enabled && currentRule.ab_test_config.variants.length > 0 && (
                  <p className="text-sm text-[#a3a3a3] mt-2">
                    Total traffic weight: {Math.round((currentRule.ab_test_config?.variants.reduce((sum, v) => sum + v.traffic_weight, 0) || 0) * 100)}%
                    (Should ideally add up to 100%)
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Trigger Conditions */}
        <Card className="bg-[#1a1a1a] border-[#262626]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#00d4ff]" />
              Trigger Conditions
            </CardTitle>
            <p className="text-sm text-[#a3a3a3]">Define when this engagement should be triggered</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="psychographic" className="space-y-4">
              <TabsList className="bg-[#0a0a0a] border border-[#262626]">
                <TabsTrigger value="psychographic" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  <Brain className="w-4 h-4 mr-2" />
                  Psychographic
                </TabsTrigger>
                <TabsTrigger value="behavioral" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  <Activity className="w-4 h-4 mr-2" />
                  Behavioral
                </TabsTrigger>
                <TabsTrigger value="timing" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                  <Clock className="w-4 h-4 mr-2" />
                  Timing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="psychographic" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#a3a3a3]">User must match these psychological traits</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addPsychographicCondition}
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                {currentRule.trigger_conditions.psychographic_conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-[#0a0a0a] border border-[#262626]">
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updatePsychographicCondition(index, 'field', value)}
                    >
                      <SelectTrigger className="w-48 bg-[#111111] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626]">
                        <SelectItem value="risk_profile">Risk Profile</SelectItem>
                        <SelectItem value="cognitive_style">Cognitive Style</SelectItem>
                        <SelectItem value="emotional_state.mood">Emotional Mood</SelectItem>
                        <SelectItem value="emotional_state.confidence">Confidence Level</SelectItem>
                        <SelectItem value="personality_traits.openness">Openness</SelectItem>
                        <SelectItem value="personality_traits.conscientiousness">Conscientiousness</SelectItem>
                        <SelectItem value="personality_traits.extraversion">Extraversion</SelectItem>
                        <SelectItem value="personality_traits.agreeableness">Agreeableness</SelectItem>
                        <SelectItem value="personality_traits.neuroticism">Neuroticism</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updatePsychographicCondition(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-32 bg-[#111111] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626]">
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={condition.value}
                      onChange={(e) => updatePsychographicCondition(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 bg-[#111111] border-[#262626] text-white"
                    />

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removePsychographicCondition(index)}
                      className="text-[#ef4444] hover:bg-[#ef4444]/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {currentRule.trigger_conditions.psychographic_conditions.length === 0 && (
                  <p className="text-center text-[#a3a3a3] py-8">
                    No psychographic conditions set. This rule will match any user's psychological profile.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="behavioral" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#a3a3a3]">User must perform these actions</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addBehavioralCondition}
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </Button>
                </div>

                {currentRule.trigger_conditions.behavioral_conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-[#0a0a0a] border border-[#262626]">
                    <Input
                      value={condition.event_type}
                      onChange={(e) => updateBehavioralCondition(index, 'event_type', e.target.value)}
                      placeholder="Event type (e.g., click, page_view)"
                      className="w-48 bg-[#111111] border-[#262626] text-white"
                    />

                    <Select
                      value={condition.frequency}
                      onValueChange={(value) => updateBehavioralCondition(index, 'frequency', value)}
                    >
                      <SelectTrigger className="w-32 bg-[#111111] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626]">
                        <SelectItem value="once">At least once</SelectItem>
                        <SelectItem value="multiple">Multiple times</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.time_window}
                      onValueChange={(value) => updateBehavioralCondition(index, 'time_window', value)}
                    >
                      <SelectTrigger className="w-32 bg-[#111111] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626]">
                        <SelectItem value="session">This session</SelectItem>
                        <SelectItem value="last_hour">Last hour</SelectItem>
                        <SelectItem value="last_day">Last day</SelectItem>
                        <SelectItem value="last_week">Last week</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeBehavioralCondition(index)}
                      className="text-[#ef4444] hover:bg-[#ef4444]/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {currentRule.trigger_conditions.behavioral_conditions.length === 0 && (
                  <p className="text-center text-[#a3a3a3] py-8">
                    No behavioral conditions set. This rule will match any user behavior.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="timing" className="space-y-4">
                <p className="text-sm text-[#a3a3a3] mb-4">Set timing-based triggers</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Idle Time (seconds)</label>
                    <Input
                      type="number"
                      value={currentRule.trigger_conditions.timing_conditions.idle_time_seconds || ''}
                      onChange={(e) => setCurrentRule(prev => ({
                        ...prev,
                        trigger_conditions: {
                          ...prev.trigger_conditions,
                          timing_conditions: {
                            ...prev.trigger_conditions.timing_conditions,
                            idle_time_seconds: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }
                      }))}
                      placeholder="30"
                      className="bg-[#0a0a0a] border-[#262626] text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Time on Page (seconds)</label>
                    <Input
                      type="number"
                      value={currentRule.trigger_conditions.timing_conditions.time_on_page_seconds || ''}
                      onChange={(e) => setCurrentRule(prev => ({
                        ...prev,
                        trigger_conditions: {
                          ...prev.trigger_conditions,
                          timing_conditions: {
                            ...prev.trigger_conditions.timing_conditions,
                            time_on_page_seconds: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }
                      }))}
                      placeholder="60"
                      className="bg-[#0a0a0a] border-[#262626] text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Session Duration (seconds)</label>
                    <Input
                      type="number"
                      value={currentRule.trigger_conditions.timing_conditions.session_duration_seconds || ''}
                      onChange={(e) => setCurrentRule(prev => ({
                        ...prev,
                        trigger_conditions: {
                          ...prev.trigger_conditions,
                          timing_conditions: {
                            ...prev.trigger_conditions.timing_conditions,
                            session_duration_seconds: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }
                      }))}
                      placeholder="300"
                      className="bg-[#0a0a0a] border-[#262626] text-white"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Engagement Action */}
        <Card className="bg-[#1a1a1a] border-[#262626]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Engagement Action</CardTitle>
            <p className="text-sm text-[#a3a3a3]">Define what happens when conditions are met</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Engagement Type</label>
                <Select
                  value={currentRule.engagement_action.type}
                  onValueChange={(value) => setCurrentRule(prev => ({
                    ...prev,
                    engagement_action: {
                      ...prev.engagement_action,
                      type: value,
                      template_id: '' // Reset template when type changes
                    }
                  }))}
                >
                  <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#262626]">
                    <SelectItem value="checkin">Check-in Widget</SelectItem>
                    <SelectItem value="tooltip">Tooltip</SelectItem>
                    <SelectItem value="modal">Modal Dialog</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Priority</label>
                <Select
                  value={currentRule.engagement_action.priority}
                  onValueChange={(value) => setCurrentRule(prev => ({
                    ...prev,
                    engagement_action: {
                      ...prev.engagement_action,
                      priority: value
                    }
                  }))}
                >
                  <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#262626]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Template</label>
              <Select
                value={currentRule.engagement_action.template_id}
                onValueChange={(value) => setCurrentRule(prev => ({
                  ...prev,
                  engagement_action: {
                    ...prev.engagement_action,
                    template_id: value
                  }
                }))}
                disabled={currentRule.ab_test_config?.enabled} // Disable if A/B testing is enabled
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#262626]">
                  {availableTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentRule.ab_test_config?.enabled && (
                <p className="text-xs text-[#a3a3a3] mt-1">
                  Template selection is managed per variant when A/B testing is enabled.
                </p>
              )}
              {!currentRule.ab_test_config?.enabled && availableTemplates.length === 0 && (
                <p className="text-xs text-[#fbbf24] mt-1">
                  No templates available for {currentRule.engagement_action.type} engagements. Create one first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Frequency Limit</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">Show at most</span>
                <Input
                  type="number"
                  value={currentRule.engagement_action.max_frequency.limit}
                  onChange={(e) => setCurrentRule(prev => ({
                    ...prev,
                    engagement_action: {
                      ...prev.engagement_action,
                      max_frequency: {
                        ...prev.engagement_action.max_frequency,
                        limit: parseInt(e.target.value) || 1
                      }
                    }
                  }))}
                  className="w-20 bg-[#0a0a0a] border-[#262626] text-white"
                  min="1"
                />
                <span className="text-sm text-white">time(s) per</span>
                <Select
                  value={currentRule.engagement_action.max_frequency.period}
                  onValueChange={(value) => setCurrentRule(prev => ({
                    ...prev,
                    engagement_action: {
                      ...prev.engagement_action,
                      max_frequency: {
                        ...prev.engagement_action.max_frequency,
                        period: value
                      }
                    }
                  }))}
                >
                  <SelectTrigger className="w-24 bg-[#0a0a0a] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#262626]">
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="border-[#262626] hover:border-[#a3a3a3]">
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
            disabled={
              !currentRule.name || 
              (!currentRule.ab_test_config?.enabled && !currentRule.engagement_action.template_id) ||
              (currentRule.ab_test_config?.enabled && currentRule.ab_test_config.variants.some(v => !v.template_id))
            }
          >
            {rule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </div>
  );
}
