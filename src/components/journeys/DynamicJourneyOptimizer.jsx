import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Zap, Clock, TrendingUp, AlertTriangle, RefreshCcw, 
  Brain, Settings, ChevronRight, Activity
} from 'lucide-react';

const OPTIMIZATION_RULES = [
  {
    id: 'timing_optimization',
    name: 'Adaptive Timing',
    description: 'Automatically adjust wait times based on user engagement patterns',
    icon: Clock,
    color: 'text-amber-400'
  },
  {
    id: 'content_personalization',
    name: 'Content Personalization',
    description: 'Dynamically personalize messages based on psychographic profile',
    icon: Brain,
    color: 'text-purple-400'
  },
  {
    id: 'path_optimization',
    name: 'Path Optimization',
    description: 'Route users through optimal paths based on predicted behavior',
    icon: TrendingUp,
    color: 'text-green-400'
  },
  {
    id: 'churn_prevention',
    name: 'Churn Prevention',
    description: 'Trigger re-engagement when psychographic shifts indicate risk',
    icon: AlertTriangle,
    color: 'text-red-400'
  },
  {
    id: 'conversion_boost',
    name: 'Conversion Optimization',
    description: 'Identify and prioritize high-intent users for conversion nudges',
    icon: Zap,
    color: 'text-cyan-400'
  }
];

export default function DynamicJourneyOptimizer({ 
  isOpen, 
  onClose, 
  optimizationSettings,
  onUpdateSettings 
}) {
  const [settings, setSettings] = useState(optimizationSettings || {
    enabled: false,
    rules: {},
    sensitivity: 0.5,
    minConfidence: 0.7
  });

  const handleToggleRule = (ruleId) => {
    const newSettings = {
      ...settings,
      rules: {
        ...settings.rules,
        [ruleId]: !settings.rules[ruleId]
      }
    };
    setSettings(newSettings);
    onUpdateSettings?.(newSettings);
  };

  const handleSensitivityChange = (value) => {
    const newSettings = { ...settings, sensitivity: value[0] };
    setSettings(newSettings);
    onUpdateSettings?.(newSettings);
  };

  const handleConfidenceChange = (value) => {
    const newSettings = { ...settings, minConfidence: value[0] };
    setSettings(newSettings);
    onUpdateSettings?.(newSettings);
  };

  const handleToggleEnabled = (enabled) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    onUpdateSettings?.(newSettings);
  };

  if (!isOpen) return null;

  return (
    <Card className="absolute right-4 top-20 w-80 bg-[#1a1a1a] border-[#333] text-white z-[100] shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="font-semibold">Dynamic Optimization</h3>
          </div>
          <Switch 
            checked={settings.enabled} 
            onCheckedChange={handleToggleEnabled}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="space-y-3 mb-4">
              {OPTIMIZATION_RULES.map((rule) => {
                const Icon = rule.icon;
                const isEnabled = settings.rules[rule.id];
                
                return (
                  <div 
                    key={rule.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isEnabled 
                        ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                        : 'border-[#333] bg-[#262626] hover:border-[#555]'
                    }`}
                    onClick={() => handleToggleRule(rule.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${rule.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{rule.name}</span>
                          <Switch 
                            checked={isEnabled} 
                            onCheckedChange={() => handleToggleRule(rule.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p className="text-xs text-[#9ca3af] mt-1">{rule.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 pt-4 border-t border-[#333]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9ca3af]">Sensitivity</span>
                  <span className="text-sm text-white">{Math.round(settings.sensitivity * 100)}%</span>
                </div>
                <Slider
                  value={[settings.sensitivity]}
                  onValueChange={handleSensitivityChange}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Higher = more frequent optimizations
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9ca3af]">Min Confidence</span>
                  <span className="text-sm text-white">{Math.round(settings.minConfidence * 100)}%</span>
                </div>
                <Slider
                  value={[settings.minConfidence]}
                  onValueChange={handleConfidenceChange}
                  min={0.5}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-[#6b7280] mt-1">
                  Only apply changes above this confidence
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[#262626] border border-[#333]">
              <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                <RefreshCcw className="w-3 h-3" />
                <span>Optimizations run continuously when enabled</span>
              </div>
            </div>
          </>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="w-full mt-4 text-[#9ca3af] hover:text-white"
        >
          Close
        </Button>
      </CardContent>
    </Card>
  );
}