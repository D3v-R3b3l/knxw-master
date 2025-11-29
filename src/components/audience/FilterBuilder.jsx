import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Brain, Activity, Target } from "lucide-react";

const TRAIT_FIELDS = {
  "risk_profile": { label: "Risk Profile", type: "enum", values: ["conservative", "moderate", "aggressive"] },
  "cognitive_style": { label: "Cognitive Style", type: "enum", values: ["analytical", "intuitive", "systematic", "creative"] },
  "emotional_state.mood": { label: "Emotional Mood", type: "enum", values: ["positive", "neutral", "negative", "excited", "anxious", "confident", "uncertain"] },
  "emotional_state.energy_level": { label: "Energy Level", type: "enum", values: ["low", "medium", "high"] },
  "personality_traits.openness": { label: "Openness", type: "number", min: 0, max: 1 },
  "personality_traits.conscientiousness": { label: "Conscientiousness", type: "number", min: 0, max: 1 },
  "personality_traits.extraversion": { label: "Extraversion", type: "number", min: 0, max: 1 },
  "personality_traits.agreeableness": { label: "Agreeableness", type: "number", min: 0, max: 1 },
  "personality_traits.neuroticism": { label: "Neuroticism", type: "number", min: 0, max: 1 }
};

const BEHAVIOR_EVENTS = [
  "page_view", "click", "scroll", "form_submit", "form_focus", "hover", "exit_intent", "time_on_page"
];

const OPERATORS = {
  enum: ["equals", "not_equals", "in", "not_in"],
  number: ["equals", "not_equals", "greater_than", "less_than"],
  string: ["equals", "not_equals", "contains", "not_contains"],
  behavior: ["at_least", "exactly", "at_most"]
};

export default function FilterBuilder({ conditions, onChange }) {
  const addCondition = () => {
    const newCondition = {
      type: "trait",
      field: "",
      operator: "",
      value: ""
    };

    onChange({
      ...conditions,
      conditions: [...conditions.conditions, newCondition]
    });
  };

  const updateCondition = (index, updates) => {
    const newConditions = [...conditions.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    
    onChange({
      ...conditions,
      conditions: newConditions
    });
  };

  const removeCondition = (index) => {
    const newConditions = conditions.conditions.filter((_, i) => i !== index);
    onChange({
      ...conditions,
      conditions: newConditions
    });
  };

  const getOperators = (condition) => {
    if (condition.type === "behavior") return OPERATORS.behavior;
    
    const fieldInfo = TRAIT_FIELDS[condition.field];
    if (!fieldInfo) return OPERATORS.string;
    
    return OPERATORS[fieldInfo.type] || OPERATORS.string;
  };

  const renderValueInput = (condition, index) => {
    const fieldInfo = TRAIT_FIELDS[condition.field];
    
    if (condition.type === "behavior") {
      return (
        <Input
          type="number"
          min="1"
          placeholder="Count"
          value={condition.behavior_config?.count || ""}
          onChange={(e) => updateCondition(index, {
            behavior_config: {
              ...condition.behavior_config,
              count: parseInt(e.target.value) || 1
            }
          })}
          className="bg-[#1a1a1a] border-[#262626] text-white w-20"
        />
      );
    }

    if (fieldInfo?.type === "enum") {
      if (["in", "not_in"].includes(condition.operator)) {
        return (
          <div className="flex flex-wrap gap-1">
            {fieldInfo.values.map(value => {
              const selected = Array.isArray(condition.value) ? condition.value.includes(value) : false;
              return (
                <Badge
                  key={value}
                  variant={selected ? "default" : "outline"}
                  className={`cursor-pointer ${selected ? "bg-[#00d4ff] text-[#0a0a0a]" : "border-[#262626] text-[#a3a3a3]"}`}
                  onClick={() => {
                    const currentValues = Array.isArray(condition.value) ? condition.value : [];
                    const newValues = selected 
                      ? currentValues.filter(v => v !== value)
                      : [...currentValues, value];
                    updateCondition(index, { value: newValues });
                  }}
                >
                  {value}
                </Badge>
              );
            })}
          </div>
        );
      } else {
        return (
          <Select 
            value={condition.value} 
            onValueChange={(value) => updateCondition(index, { value })}
          >
            <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white w-40">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {fieldInfo.values.map(value => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
    }

    if (fieldInfo?.type === "number") {
      return (
        <Input
          type="number"
          min={fieldInfo.min}
          max={fieldInfo.max}
          step="0.1"
          placeholder="0.0"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) || 0 })}
          className="bg-[#1a1a1a] border-[#262626] text-white w-24"
        />
      );
    }

    return (
      <Input
        placeholder="Value"
        value={condition.value}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        className="bg-[#1a1a1a] border-[#262626] text-white w-40"
      />
    );
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00d4ff]" />
            Filter Conditions
          </CardTitle>
          <Button
            onClick={addCondition}
            size="sm"
            className="bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conditions.conditions.length === 0 ? (
          <div className="text-center py-8 text-[#a3a3a3]">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No filters added yet. Click "Add Filter" to start building your audience.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Operator Selection */}
            {conditions.conditions.length > 1 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-[#a3a3a3]">Match:</span>
                <Select
                  value={conditions.operator}
                  onValueChange={(value) => onChange({ ...conditions, operator: value })}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">ALL</SelectItem>
                    <SelectItem value="OR">ANY</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-[#a3a3a3]">conditions</span>
              </div>
            )}

            {conditions.conditions.map((condition, index) => (
              <div key={index} className="flex flex-wrap items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                {/* Condition Type */}
                <Select
                  value={condition.type}
                  onValueChange={(value) => updateCondition(index, { 
                    type: value, 
                    field: "", 
                    operator: "", 
                    value: "",
                    behavior_config: value === "behavior" ? { event_type: "", count: 1, time_window_days: 30 } : undefined
                  })}
                >
                  <SelectTrigger className="bg-[#111111] border-[#262626] text-white w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trait">
                      <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3" />
                        Trait
                      </div>
                    </SelectItem>
                    <SelectItem value="behavior">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Behavior
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Field Selection */}
                {condition.type === "trait" && (
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(index, { field: value, operator: "", value: "" })}
                  >
                    <SelectTrigger className="bg-[#111111] border-[#262626] text-white w-48">
                      <SelectValue placeholder="Select trait" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRAIT_FIELDS).map(([key, info]) => (
                        <SelectItem key={key} value={key}>{info.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {condition.type === "behavior" && (
                  <Select
                    value={condition.behavior_config?.event_type || ""}
                    onValueChange={(value) => updateCondition(index, {
                      behavior_config: { ...condition.behavior_config, event_type: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#111111] border-[#262626] text-white w-40">
                      <SelectValue placeholder="Event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BEHAVIOR_EVENTS.map(event => (
                        <SelectItem key={event} value={event}>{event.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Operator */}
                {(condition.field || condition.behavior_config?.event_type) && (
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, { operator: value, value: "" })}
                  >
                    <SelectTrigger className="bg-[#111111] border-[#262626] text-white w-32">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperators(condition).map(op => (
                        <SelectItem key={op} value={op}>{op.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Value */}
                {condition.operator && renderValueInput(condition, index)}

                {/* Time Window for Behavior */}
                {condition.type === "behavior" && condition.operator && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#a3a3a3]">in last</span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="30"
                      value={condition.behavior_config?.time_window_days || ""}
                      onChange={(e) => updateCondition(index, {
                        behavior_config: {
                          ...condition.behavior_config,
                          time_window_days: parseInt(e.target.value) || 30
                        }
                      })}
                      className="bg-[#1a1a1a] border-[#262626] text-white w-16"
                    />
                    <span className="text-xs text-[#a3a3a3]">days</span>
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(index)}
                  className="text-[#ef4444] hover:text-[#dc2626] hover:bg-[#ef4444]/10 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}