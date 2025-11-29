import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Play, Pause, BarChart, TrendingUp, Users } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ABTestBuilder({ test, templates, onSave, onCancel }) {
    const [testConfig, setTestConfig] = useState(test || {
        name: '',
        description: '',
        test_type: 'engagement_template',
        traffic_allocation: 1.0,
        split_method: 'even',
        targeting_conditions: {
            psychographic_conditions: [],
            behavioral_conditions: [],
            segment_ids: []
        },
        success_metrics: {
            primary_metric: {
                name: 'conversion',
                event_type: 'click',
                aggregation: 'rate',
                goal: 'maximize'
            },
            secondary_metrics: []
        },
        statistical_settings: {
            confidence_level: 0.95,
            minimum_sample_size: 100,
            minimum_duration_hours: 24,
            maximum_duration_days: 30,
            early_stopping_enabled: true
        },
        auto_promote_winner: false
    });

    const [variants, setVariants] = useState(test?.variants || [
        { name: 'Control', description: 'Original version', is_control: true, traffic_weight: 0.5, configuration: {} },
        { name: 'Variant A', description: 'Test version', is_control: false, traffic_weight: 0.5, configuration: {} }
    ]);

    const addVariant = () => {
        const newVariant = {
            name: `Variant ${String.fromCharCode(65 + variants.filter(v => !v.is_control).length)}`,
            description: '',
            is_control: false,
            traffic_weight: 0.5,
            configuration: {}
        };
        setVariants([...variants, newVariant]);
        redistributeTraffic();
    };

    const removeVariant = (index) => {
        if (variants[index].is_control) return; // Can't remove control
        const newVariants = variants.filter((_, i) => i !== index);
        setVariants(newVariants);
        redistributeTraffic();
    };

    const redistributeTraffic = () => {
        const updatedVariants = [...variants];
        const evenSplit = 1 / updatedVariants.length;
        updatedVariants.forEach(variant => {
            variant.traffic_weight = evenSplit;
        });
        setVariants(updatedVariants);
    };

    const updateVariant = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
    };

    const addPsychographicCondition = () => {
        setTestConfig(prev => ({
            ...prev,
            targeting_conditions: {
                ...prev.targeting_conditions,
                psychographic_conditions: [
                    ...prev.targeting_conditions.psychographic_conditions,
                    { field: 'risk_profile', operator: 'equals', value: 'moderate' }
                ]
            }
        }));
    };

    const removePsychographicCondition = (index) => {
        setTestConfig(prev => ({
            ...prev,
            targeting_conditions: {
                ...prev.targeting_conditions,
                psychographic_conditions: prev.targeting_conditions.psychographic_conditions.filter((_, i) => i !== index)
            }
        }));
    };

    const updatePsychographicCondition = (index, field, value) => {
        setTestConfig(prev => ({
            ...prev,
            targeting_conditions: {
                ...prev.targeting_conditions,
                psychographic_conditions: prev.targeting_conditions.psychographic_conditions.map((condition, i) => 
                    i === index ? { ...condition, [field]: value } : condition
                )
            }
        }));
    };

    const handleSave = () => {
        onSave({ ...testConfig, variants });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="bg-[#111111] border border-[#262626]">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                        Basic Settings
                    </TabsTrigger>
                    <TabsTrigger value="variants" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                        Variants ({variants.length})
                    </TabsTrigger>
                    <TabsTrigger value="targeting" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                        Targeting
                    </TabsTrigger>
                    <TabsTrigger value="metrics" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                        Success Metrics
                    </TabsTrigger>
                    <TabsTrigger value="statistical" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                        Statistical Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <Card className="bg-[#111111] border-[#262626]">
                        <CardHeader>
                            <CardTitle className="text-white">Test Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Test Name</label>
                                <Input
                                    value={testConfig.name}
                                    onChange={(e) => setTestConfig(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-[#0a0a0a] border-[#262626] text-white"
                                    placeholder="e.g., Homepage CTA Button Test"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Description</label>
                                <Textarea
                                    value={testConfig.description}
                                    onChange={(e) => setTestConfig(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-[#0a0a0a] border-[#262626] text-white"
                                    placeholder="Describe what you're testing and why..."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Test Type</label>
                                    <Select 
                                        value={testConfig.test_type} 
                                        onValueChange={(value) => setTestConfig(prev => ({ ...prev, test_type: value }))}
                                    >
                                        <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="engagement_template">Engagement Template</SelectItem>
                                            <SelectItem value="engagement_rule">Engagement Rule</SelectItem>
                                            <SelectItem value="journey_step">Journey Step</SelectItem>
                                            <SelectItem value="content_variant">Content Variant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                                        Traffic Allocation ({Math.round(testConfig.traffic_allocation * 100)}%)
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={testConfig.traffic_allocation}
                                        onChange={(e) => setTestConfig(prev => ({ ...prev, traffic_allocation: parseFloat(e.target.value) }))}
                                        className="w-full"
                                    />
                                    <Progress value={testConfig.traffic_allocation * 100} className="mt-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Test Variants</h3>
                        <Button onClick={addVariant} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variant
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <Card key={index} className="bg-[#111111] border-[#262626]">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-white">{variant.name}</CardTitle>
                                        {variant.is_control && (
                                            <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">
                                                Control
                                            </Badge>
                                        )}
                                    </div>
                                    {!variant.is_control && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => removeVariant(index)}
                                            className="border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Variant Name</label>
                                            <Input
                                                value={variant.name}
                                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                className="bg-[#0a0a0a] border-[#262626] text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                                                Traffic Weight ({Math.round(variant.traffic_weight * 100)}%)
                                            </label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1"
                                                step="0.1"
                                                value={variant.traffic_weight}
                                                onChange={(e) => updateVariant(index, 'traffic_weight', parseFloat(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Description</label>
                                        <Textarea
                                            value={variant.description}
                                            onChange={(e) => updateVariant(index, 'description', e.target.value)}
                                            className="bg-[#0a0a0a] border-[#262626] text-white"
                                            placeholder="Describe this variant..."
                                        />
                                    </div>

                                    {testConfig.test_type === 'engagement_template' && (
                                        <div>
                                            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Template</label>
                                            <Select 
                                                value={variant.configuration.engagement_template_id || ''} 
                                                onValueChange={(value) => updateVariant(index, 'configuration', { 
                                                    ...variant.configuration, 
                                                    engagement_template_id: value 
                                                })}
                                            >
                                                <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                                                    <SelectValue placeholder="Select template..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {templates.map(template => (
                                                        <SelectItem key={template.id} value={template.id}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="targeting" className="space-y-4">
                    <Card className="bg-[#111111] border-[#262626]">
                        <CardHeader>
                            <CardTitle className="text-white">Psychographic Targeting</CardTitle>
                            <p className="text-[#a3a3a3] text-sm">Define which users should enter this test</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-white">Psychographic Conditions</h4>
                                <Button
                                    size="sm"
                                    onClick={addPsychographicCondition}
                                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Condition
                                </Button>
                            </div>

                            {testConfig.targeting_conditions.psychographic_conditions.map((condition, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                                    <Select 
                                        value={condition.field} 
                                        onValueChange={(value) => updatePsychographicCondition(index, 'field', value)}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="risk_profile">Risk Profile</SelectItem>
                                            <SelectItem value="cognitive_style">Cognitive Style</SelectItem>
                                            <SelectItem value="emotional_state.mood">Emotional Mood</SelectItem>
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
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="not_equals">Not Equals</SelectItem>
                                            <SelectItem value="greater_than">Greater Than</SelectItem>
                                            <SelectItem value="less_than">Less Than</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        value={condition.value}
                                        onChange={(e) => updatePsychographicCondition(index, 'value', e.target.value)}
                                        className="flex-1 bg-[#111111] border-[#262626] text-white"
                                        placeholder="Value..."
                                    />

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removePsychographicCondition(index)}
                                        className="border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {testConfig.targeting_conditions.psychographic_conditions.length === 0 && (
                                <div className="text-center py-8 text-[#a3a3a3]">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No targeting conditions set. All users will be eligible for this test.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                    <Card className="bg-[#111111] border-[#262626]">
                        <CardHeader>
                            <CardTitle className="text-white">Success Metrics</CardTitle>
                            <p className="text-[#a3a3a3] text-sm">Define what success looks like for this test</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-medium text-white mb-4">Primary Metric</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Metric Name</label>
                                        <Input
                                            value={testConfig.success_metrics.primary_metric.name}
                                            onChange={(e) => setTestConfig(prev => ({
                                                ...prev,
                                                success_metrics: {
                                                    ...prev.success_metrics,
                                                    primary_metric: {
                                                        ...prev.success_metrics.primary_metric,
                                                        name: e.target.value
                                                    }
                                                }
                                            }))}
                                            className="bg-[#0a0a0a] border-[#262626] text-white"
                                            placeholder="e.g., conversion, signup, click"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Event Type</label>
                                        <Select 
                                            value={testConfig.success_metrics.primary_metric.event_type} 
                                            onValueChange={(value) => setTestConfig(prev => ({
                                                ...prev,
                                                success_metrics: {
                                                    ...prev.success_metrics,
                                                    primary_metric: {
                                                        ...prev.success_metrics.primary_metric,
                                                        event_type: value
                                                    }
                                                }
                                            }))}
                                        >
                                            <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="click">Click</SelectItem>
                                                <SelectItem value="page_view">Page View</SelectItem>
                                                <SelectItem value="form_submit">Form Submit</SelectItem>
                                                <SelectItem value="conversion">Conversion</SelectItem>
                                                <SelectItem value="custom">Custom Event</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Aggregation</label>
                                        <Select 
                                            value={testConfig.success_metrics.primary_metric.aggregation} 
                                            onValueChange={(value) => setTestConfig(prev => ({
                                                ...prev,
                                                success_metrics: {
                                                    ...prev.success_metrics,
                                                    primary_metric: {
                                                        ...prev.success_metrics.primary_metric,
                                                        aggregation: value
                                                    }
                                                }
                                            }))}
                                        >
                                            <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rate">Conversion Rate</SelectItem>
                                                <SelectItem value="count">Event Count</SelectItem>
                                                <SelectItem value="sum">Sum</SelectItem>
                                                <SelectItem value="average">Average</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Goal</label>
                                        <Select 
                                            value={testConfig.success_metrics.primary_metric.goal} 
                                            onValueChange={(value) => setTestConfig(prev => ({
                                                ...prev,
                                                success_metrics: {
                                                    ...prev.success_metrics,
                                                    primary_metric: {
                                                        ...prev.success_metrics.primary_metric,
                                                        goal: value
                                                    }
                                                }
                                            }))}
                                        >
                                            <SelectTrigger className="bg-[#0a0a0a] border-[#262626]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="maximize">Maximize</SelectItem>
                                                <SelectItem value="minimize">Minimize</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statistical" className="space-y-4">
                    <Card className="bg-[#111111] border-[#262626]">
                        <CardHeader>
                            <CardTitle className="text-white">Statistical Configuration</CardTitle>
                            <p className="text-[#a3a3a3] text-sm">Configure statistical analysis parameters</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                                        Confidence Level ({Math.round(testConfig.statistical_settings.confidence_level * 100)}%)
                                    </label>
                                    <input
                                        type="range"
                                        min="0.9"
                                        max="0.99"
                                        step="0.01"
                                        value={testConfig.statistical_settings.confidence_level}
                                        onChange={(e) => setTestConfig(prev => ({
                                            ...prev,
                                            statistical_settings: {
                                                ...prev.statistical_settings,
                                                confidence_level: parseFloat(e.target.value)
                                            }
                                        }))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Minimum Sample Size</label>
                                    <Input
                                        type="number"
                                        value={testConfig.statistical_settings.minimum_sample_size}
                                        onChange={(e) => setTestConfig(prev => ({
                                            ...prev,
                                            statistical_settings: {
                                                ...prev.statistical_settings,
                                                minimum_sample_size: parseInt(e.target.value) || 100
                                            }
                                        }))}
                                        className="bg-[#0a0a0a] border-[#262626] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Minimum Duration (hours)</label>
                                    <Input
                                        type="number"
                                        value={testConfig.statistical_settings.minimum_duration_hours}
                                        onChange={(e) => setTestConfig(prev => ({
                                            ...prev,
                                            statistical_settings: {
                                                ...prev.statistical_settings,
                                                minimum_duration_hours: parseInt(e.target.value) || 24
                                            }
                                        }))}
                                        className="bg-[#0a0a0a] border-[#262626] text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Maximum Duration (days)</label>
                                    <Input
                                        type="number"
                                        value={testConfig.statistical_settings.maximum_duration_days}
                                        onChange={(e) => setTestConfig(prev => ({
                                            ...prev,
                                            statistical_settings: {
                                                ...prev.statistical_settings,
                                                maximum_duration_days: parseInt(e.target.value) || 30
                                            }
                                        }))}
                                        className="bg-[#0a0a0a] border-[#262626] text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="early-stopping"
                                    checked={testConfig.statistical_settings.early_stopping_enabled}
                                    onChange={(e) => setTestConfig(prev => ({
                                        ...prev,
                                        statistical_settings: {
                                            ...prev.statistical_settings,
                                            early_stopping_enabled: e.target.checked
                                        }
                                    }))}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="early-stopping" className="text-sm text-white">
                                    Enable early stopping for significant results
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="auto-promote"
                                    checked={testConfig.auto_promote_winner}
                                    onChange={(e) => setTestConfig(prev => ({
                                        ...prev,
                                        auto_promote_winner: e.target.checked
                                    }))}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="auto-promote" className="text-sm text-white">
                                    Automatically promote winning variant
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#262626]">
                <Button variant="outline" onClick={onCancel} className="border-[#262626] hover:bg-[#1a1a1a]">
                    Cancel
                </Button>
                <Button onClick={handleSave} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                    {test ? 'Update Test' : 'Create Test'}
                </Button>
            </div>
        </div>
    );
}