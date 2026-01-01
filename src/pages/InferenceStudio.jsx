import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, Sparkles, Settings, Sliders, Plus, Save, Play, 
  TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Trash2,
  Eye, Target, Zap, Clock, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';

const MODEL_TYPES = [
  { value: 'motivation', label: 'Motivation Analysis', icon: Target },
  { value: 'emotional_state', label: 'Emotional State', icon: Brain },
  { value: 'cognitive_style', label: 'Cognitive Style', icon: Settings },
  { value: 'risk_profile', label: 'Risk Profile', icon: AlertTriangle },
  { value: 'personality', label: 'Personality Traits', icon: Sparkles },
  { value: 'custom', label: 'Custom Model', icon: Sliders }
];

const BIAS_TYPES = [
  'anchoring', 'confirmation', 'recency', 'loss_aversion', 
  'availability', 'sunk_cost', 'bandwagon', 'status_quo'
];

export default function InferenceStudio() {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: apps = [] } = useQuery({
    queryKey: ['client-apps'],
    queryFn: () => base44.entities.ClientApp.list('-created_date', 50)
  });

  const [selectedAppId, setSelectedAppId] = useState(null);

  useEffect(() => {
    if (apps.length > 0 && !selectedAppId) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps, selectedAppId]);

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['inference-models', selectedAppId],
    queryFn: () => base44.entities.InferenceModel.filter({ client_app_id: selectedAppId }, '-created_date', 50),
    enabled: !!selectedAppId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InferenceModel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inference-models']);
      setIsCreating(false);
      toast.success('Inference model created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InferenceModel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inference-models']);
      toast.success('Model updated');
    }
  });

  const handleCreateModel = (type) => {
    createMutation.mutate({
      name: `New ${MODEL_TYPES.find(m => m.value === type)?.label || 'Model'}`,
      client_app_id: selectedAppId,
      model_type: type,
      status: 'draft',
      base_weights: { page_views: 0.3, clicks: 0.2, time_on_page: 0.25, scroll_depth: 0.15, exit_intent: 0.1 },
      temporal_decay: { enabled: true, half_life_days: 7, max_age_days: 90 },
      confidence_thresholds: { high_confidence: 0.8, medium_confidence: 0.5, low_confidence: 0.3 },
      bias_detection_config: { enabled: true, sensitivity: 'medium', bias_types: ['anchoring', 'confirmation', 'recency', 'loss_aversion'] },
      custom_rules: []
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      testing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      archived: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="AI Inference Studio"
          description="Customize and fine-tune psychographic AI models"
          icon={Brain}
          docSection="ai-inference"
          actions={
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Model
            </Button>
          }
        />

        {/* App Selector */}
        {apps.length > 0 && (
          <div className="mb-6">
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger className="w-80 bg-[#111] border-[#262626] text-white">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                {apps.map(app => (
                  <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Models List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Your Models</h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-[#111] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : models.length === 0 ? (
              <Card className="bg-[#111] border-[#262626]">
                <CardContent className="p-6 text-center">
                  <Brain className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                  <p className="text-[#a3a3a3]">No custom models yet</p>
                  <p className="text-sm text-[#6b7280] mt-1">Create your first model to customize AI inference</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {models.map(model => {
                  const TypeIcon = MODEL_TYPES.find(m => m.value === model.model_type)?.icon || Brain;
                  return (
                    <motion.div
                      key={model.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedModel(model)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedModel?.id === model.id 
                          ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50' 
                          : 'bg-[#111] border-[#262626] hover:border-[#8b5cf6]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#8b5cf6]/20">
                            <TypeIcon className="w-4 h-4 text-[#8b5cf6]" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{model.name}</h4>
                            <p className="text-xs text-[#a3a3a3] capitalize">{model.model_type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(model.status)}>{model.status}</Badge>
                      </div>
                      {model.performance_metrics?.total_inferences > 0 && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-[#a3a3a3]">
                          <span>{model.performance_metrics.total_inferences.toLocaleString()} inferences</span>
                          <span>Avg confidence: {((model.performance_metrics.avg_confidence || 0) * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Model Editor */}
          <div className="lg:col-span-2">
            {selectedModel ? (
              <ModelEditor 
                model={selectedModel} 
                onUpdate={(data) => updateMutation.mutate({ id: selectedModel.id, data })}
                onClose={() => setSelectedModel(null)}
              />
            ) : isCreating ? (
              <Card className="bg-[#111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">Create New Model</CardTitle>
                  <CardDescription>Choose what type of psychographic model to create</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {MODEL_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleCreateModel(type.value)}
                        className="p-4 rounded-xl border border-[#262626] hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 transition-all text-left"
                      >
                        <type.icon className="w-6 h-6 text-[#8b5cf6] mb-2" />
                        <h4 className="font-medium text-white">{type.label}</h4>
                        <p className="text-xs text-[#a3a3a3] mt-1">
                          {type.value === 'custom' ? 'Define your own inference rules' : `Tune ${type.label.toLowerCase()} detection`}
                        </p>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setIsCreating(false)} className="mt-4 border-[#262626]">
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#111] border-[#262626]">
                <CardContent className="p-12 text-center">
                  <Sliders className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Model to Edit</h3>
                  <p className="text-[#a3a3a3] mb-6">Choose a model from the list or create a new one to customize AI inference behavior</p>
                  <Button onClick={() => setIsCreating(true)} className="bg-[#8b5cf6] hover:bg-[#7c3aed]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Model
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelEditor({ model, onUpdate, onClose }) {
  const [localModel, setLocalModel] = useState(model);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalModel(model);
    setHasChanges(false);
  }, [model]);

  const updateField = (path, value) => {
    setLocalModel(prev => {
      const newModel = { ...prev };
      const keys = path.split('.');
      let current = newModel;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newModel;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localModel);
    setHasChanges(false);
  };

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Input
            value={localModel.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="text-xl font-bold bg-transparent border-none p-0 text-white focus:ring-0"
          />
          <CardDescription className="capitalize">{localModel.model_type.replace('_', ' ')} Model</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={localModel.status} onValueChange={(v) => updateField('status', v)}>
            <SelectTrigger className="w-28 bg-[#1a1a1a] border-[#262626]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={!hasChanges} className="bg-[#8b5cf6] hover:bg-[#7c3aed]">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="weights" className="space-y-6">
          <TabsList className="bg-[#1a1a1a] border border-[#262626]">
            <TabsTrigger value="weights" className="data-[state=active]:bg-[#8b5cf6]">Signal Weights</TabsTrigger>
            <TabsTrigger value="temporal" className="data-[state=active]:bg-[#8b5cf6]">Temporal Decay</TabsTrigger>
            <TabsTrigger value="bias" className="data-[state=active]:bg-[#8b5cf6]">Bias Detection</TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-[#8b5cf6]">Custom Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="weights" className="space-y-6">
            <p className="text-sm text-[#a3a3a3]">Adjust how different behavioral signals contribute to psychographic inference</p>
            
            {Object.entries(localModel.base_weights || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-white capitalize">{key.replace('_', ' ')}</label>
                  <span className="text-sm text-[#8b5cf6]">{((value || 0) * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[(value || 0) * 100]}
                  onValueChange={([v]) => updateField(`base_weights.${key}`, v / 100)}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-[#8b5cf6]"
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <p className="text-sm text-[#a3a3a3]">Configure how recent events are weighted more heavily than older ones</p>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
              <div>
                <h4 className="font-medium text-white">Enable Temporal Decay</h4>
                <p className="text-xs text-[#a3a3a3]">Weight recent events more heavily</p>
              </div>
              <Switch
                checked={localModel.temporal_decay?.enabled}
                onCheckedChange={(v) => updateField('temporal_decay.enabled', v)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white">Half-life (days)</label>
              <p className="text-xs text-[#a3a3a3]">Days after which event weight is halved</p>
              <Input
                type="number"
                value={localModel.temporal_decay?.half_life_days || 7}
                onChange={(e) => updateField('temporal_decay.half_life_days', parseInt(e.target.value))}
                className="bg-[#1a1a1a] border-[#262626] text-white w-32"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white">Max Age (days)</label>
              <p className="text-xs text-[#a3a3a3]">Ignore events older than this</p>
              <Input
                type="number"
                value={localModel.temporal_decay?.max_age_days || 90}
                onChange={(e) => updateField('temporal_decay.max_age_days', parseInt(e.target.value))}
                className="bg-[#1a1a1a] border-[#262626] text-white w-32"
              />
            </div>
          </TabsContent>

          <TabsContent value="bias" className="space-y-6">
            <p className="text-sm text-[#a3a3a3]">Configure cognitive bias detection parameters</p>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
              <div>
                <h4 className="font-medium text-white">Enable Bias Detection</h4>
                <p className="text-xs text-[#a3a3a3]">Detect cognitive biases in user behavior</p>
              </div>
              <Switch
                checked={localModel.bias_detection_config?.enabled}
                onCheckedChange={(v) => updateField('bias_detection_config.enabled', v)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white">Detection Sensitivity</label>
              <Select 
                value={localModel.bias_detection_config?.sensitivity || 'medium'} 
                onValueChange={(v) => updateField('bias_detection_config.sensitivity', v)}
              >
                <SelectTrigger className="w-40 bg-[#1a1a1a] border-[#262626]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white">Bias Types to Detect</label>
              <div className="flex flex-wrap gap-2">
                {BIAS_TYPES.map(bias => {
                  const isActive = localModel.bias_detection_config?.bias_types?.includes(bias);
                  return (
                    <button
                      key={bias}
                      onClick={() => {
                        const current = localModel.bias_detection_config?.bias_types || [];
                        const updated = isActive ? current.filter(b => b !== bias) : [...current, bias];
                        updateField('bias_detection_config.bias_types', updated);
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        isActive 
                          ? 'bg-[#8b5cf6] text-white' 
                          : 'bg-[#262626] text-[#a3a3a3] hover:bg-[#333]'
                      }`}
                    >
                      {bias.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-[#a3a3a3]">Define custom inference rules</p>
              <Button 
                size="sm"
                onClick={() => {
                  const newRule = {
                    rule_id: `rule_${Date.now()}`,
                    name: 'New Rule',
                    condition: '',
                    output_field: '',
                    output_value: '',
                    weight: 0.5
                  };
                  updateField('custom_rules', [...(localModel.custom_rules || []), newRule]);
                }}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>

            {(localModel.custom_rules || []).length === 0 ? (
              <div className="text-center py-8 text-[#a3a3a3]">
                <Sliders className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No custom rules defined</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(localModel.custom_rules || []).map((rule, idx) => (
                  <div key={rule.rule_id} className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626] space-y-3">
                    <div className="flex justify-between items-center">
                      <Input
                        value={rule.name}
                        onChange={(e) => {
                          const updated = [...localModel.custom_rules];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateField('custom_rules', updated);
                        }}
                        className="bg-transparent border-none text-white font-medium w-48"
                        placeholder="Rule name"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const updated = localModel.custom_rules.filter((_, i) => i !== idx);
                          updateField('custom_rules', updated);
                        }}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Condition (e.g., events.click > 10)"
                        value={rule.condition}
                        onChange={(e) => {
                          const updated = [...localModel.custom_rules];
                          updated[idx] = { ...updated[idx], condition: e.target.value };
                          updateField('custom_rules', updated);
                        }}
                        className="bg-[#0a0a0a] border-[#262626] text-white text-sm"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Output field"
                          value={rule.output_field}
                          onChange={(e) => {
                            const updated = [...localModel.custom_rules];
                            updated[idx] = { ...updated[idx], output_field: e.target.value };
                            updateField('custom_rules', updated);
                          }}
                          className="bg-[#0a0a0a] border-[#262626] text-white text-sm"
                        />
                        <Input
                          placeholder="Value"
                          value={rule.output_value}
                          onChange={(e) => {
                            const updated = [...localModel.custom_rules];
                            updated[idx] = { ...updated[idx], output_value: e.target.value };
                            updateField('custom_rules', updated);
                          }}
                          className="bg-[#0a0a0a] border-[#262626] text-white text-sm w-24"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}