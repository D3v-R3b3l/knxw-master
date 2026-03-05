import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ReferenceLine
} from 'recharts';
import {
  Shield, TrendingUp, AlertTriangle, Save, RefreshCw,
  Sliders, BarChart3, Target, Zap, Info
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const HARM_COLOR = '#ef4444';
const BUSINESS_COLOR = '#00d4ff';
const REWARD_COLOR = '#10b981';

const DEFAULT_WEIGHTS = {
  w_regret: 1.0,
  w_fatigue: 1.0,
  w_coercion: 1.5,
  w_disparity: 2.0,
  w_gaming: 1.0,
};

export default function OptimizationAnalytics() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [govConfig, setGovConfig] = useState(null);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [cohorts, setCohorts] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role !== 'admin') return;
      loadData();
    });
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tmpl, oc, gc] = await Promise.all([
      base44.entities.EngagementTemplate.list('-created_date', 100),
      base44.entities.OutcomeEvent.list('-created_date', 500),
      base44.entities.GovernanceConfig.list('-created_date', 1),
    ]);
    setTemplates(tmpl || []);
    setOutcomes(oc || []);
    // Extract unique cohorts
    const uniqueCohorts = [...new Set((oc || []).map(o => o.cohort_state_bucket).filter(Boolean))];
    setCohorts(uniqueCohorts);
    if (gc && gc.length > 0) {
      setGovConfig(gc[0]);
      setWeights({ ...DEFAULT_WEIGHTS, ...(gc[0].weights || {}) });
    }
    setLoading(false);
  };

  const saveWeights = async () => {
    setSaving(true);
    if (govConfig?.id) {
      await base44.entities.GovernanceConfig.update(govConfig.id, { weights });
    } else {
      const created = await base44.entities.GovernanceConfig.create({ mode: 'governor', weights });
      setGovConfig(created);
    }
    setSaving(false);
    toast({ title: 'Weights saved', description: 'GovernanceConfig updated successfully.' });
  };

  // --- Data Processing ---
  const filteredOutcomes = selectedCohort === 'all'
    ? outcomes
    : outcomes.filter(o => o.cohort_state_bucket === selectedCohort);

  // Per-template aggregated stats
  const templateStats = templates.map(t => {
    const related = filteredOutcomes.filter(o => o.intervention_class === t.type || o.intervention_id?.includes(t.id));
    if (related.length === 0) return null;
    const avg = (arr, key) => arr.length ? arr.reduce((s, o) => s + (o[key] ?? 0), 0) / arr.length : 0;
    const avgBiz = arr => arr.length ? arr.reduce((s, o) => s + (o.business_metrics?.conversion ?? 0) + (o.business_metrics?.retention_proxy ?? 0) + (o.business_metrics?.completion ?? 0), 0) / arr.length : 0;
    const avgHarm = arr => arr.length ? arr.reduce((s, o) => s + (o.harm_proxies?.regret_score ?? 0) + (o.harm_proxies?.fatigue_score ?? 0) + (o.harm_proxies?.coercion_score ?? 0), 0) / arr.length : 0;
    return {
      name: t.name,
      type: t.type,
      samples: related.length,
      conversion: +(avg(related.map(o => ({ v: o.business_metrics?.conversion ?? 0 })).map(x => ({...x})), 'v') * 100).toFixed(1),
      retention: +(avg(related.map(o => ({ v: o.business_metrics?.retention_proxy ?? 0 })).map(x => ({...x})), 'v') * 100).toFixed(1),
      completion: +(avg(related.map(o => ({ v: o.business_metrics?.completion ?? 0 })).map(x => ({...x})), 'v') * 100).toFixed(1),
      regret: +(avg(related.map(o => ({ v: o.harm_proxies?.regret_score ?? 0 })).map(x => ({...x})), 'v') * 100).toFixed(1),
      fatigue: +(avg(related.map(o => ({ v: o.harm_proxies?.fatigue_score ?? 0 })).map(x => ({...x})), 'v') * 100).toFixed(1),
      coercion: +(avg(related.map(o => ({ v: o.harm_proxies?.coercion_score ?? 0 })).map(x => ({...x})), 'v') * 100).toFixed(1),
      r_total: +(avg(related.map(o => ({ v: o.calculated_rewards?.R_total ?? 0 })).map(x => ({...x})), 'v')).toFixed(3),
    };
  }).filter(Boolean);

  // Cohort harm vs business scatter data
  const cohortScatterData = cohorts.map(c => {
    const co = outcomes.filter(o => o.cohort_state_bucket === c);
    if (!co.length) return null;
    const avgBiz = co.reduce((s, o) => s + (o.business_metrics?.conversion ?? 0), 0) / co.length;
    const avgHarm = co.reduce((s, o) => s + (o.harm_proxies?.regret_score ?? 0) + (o.harm_proxies?.fatigue_score ?? 0) + (o.harm_proxies?.coercion_score ?? 0), 0) / co.length;
    return { cohort: c.length > 16 ? c.slice(0, 16) + '…' : c, business: +(avgBiz * 100).toFixed(1), harm: +(avgHarm * 100).toFixed(1), n: co.length };
  }).filter(Boolean);

  // Radar data for top 3 templates
  const radarTemplates = templateStats.slice(0, 3);
  const radarData = ['conversion', 'retention', 'completion', 'regret', 'fatigue', 'coercion'].map(key => {
    const entry = { metric: key };
    radarTemplates.forEach(t => { entry[t.name] = t[key] ?? 0; });
    return entry;
  });
  const radarColors = ['#00d4ff', '#10b981', '#fbbf24'];

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-[#a3a3a3]">This page is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <PageHeader
            title="Optimization Analytics"
            description="Engagement template effectiveness vs. harm proxies, cohort analysis, and governance weight tuning"
            icon={BarChart3}
            actions={
              <div className="flex items-center gap-2">
                <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                  <SelectTrigger className="w-48 bg-[#111] border-[#262626] text-white">
                    <SelectValue placeholder="Filter cohort" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-[#262626]">
                    <SelectItem value="all">All Cohorts</SelectItem>
                    {cohorts.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={loadData} disabled={loading} className="border border-[#262626] text-white hover:bg-[#1a1a1a]">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            }
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-[#111111] border border-[#262626] mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]">
                <BarChart3 className="w-4 h-4 mr-2" />Overview
              </TabsTrigger>
              <TabsTrigger value="cohorts" className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]">
                <Target className="w-4 h-4 mr-2" />Cohort Analysis
              </TabsTrigger>
              <TabsTrigger value="radar" className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]">
                <Zap className="w-4 h-4 mr-2" />Template Radar
              </TabsTrigger>
              <TabsTrigger value="governance" className="data-[state=active]:bg-[#8b5cf6]/20 data-[state=active]:text-[#8b5cf6]">
                <Sliders className="w-4 h-4 mr-2" />Governance Weights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {templateStats.length === 0 ? (
                <EmptyState message="No outcome data found for templates. Run some engagements to populate this view." />
              ) : (
                <div className="space-y-6">
                  {/* Business Metrics Bar Chart */}
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
                        Business Metrics by Template
                      </CardTitle>
                      <CardDescription className="text-[#a3a3a3]">Conversion, retention, and completion rates per template</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={templateStats} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} angle={-30} textAnchor="end" />
                          <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} unit="%" />
                          <Tooltip contentStyle={{ background: '#111', border: '1px solid #262626', color: '#fff' }} />
                          <Legend wrapperStyle={{ color: '#a3a3a3' }} />
                          <Bar dataKey="conversion" name="Conversion" fill="#00d4ff" radius={[3,3,0,0]} />
                          <Bar dataKey="retention" name="Retention" fill="#10b981" radius={[3,3,0,0]} />
                          <Bar dataKey="completion" name="Completion" fill="#fbbf24" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Harm Proxies Bar Chart */}
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Harm Proxies by Template
                      </CardTitle>
                      <CardDescription className="text-[#a3a3a3]">Regret, fatigue, and coercion scores — lower is better</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={templateStats} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} angle={-30} textAnchor="end" />
                          <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} unit="%" />
                          <Tooltip contentStyle={{ background: '#111', border: '1px solid #262626', color: '#fff' }} />
                          <Legend wrapperStyle={{ color: '#a3a3a3' }} />
                          <ReferenceLine y={20} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Warning', fill: '#fbbf24', fontSize: 10 }} />
                          <Bar dataKey="regret" name="Regret" fill="#ef4444" radius={[3,3,0,0]} />
                          <Bar dataKey="fatigue" name="Fatigue" fill="#f97316" radius={[3,3,0,0]} />
                          <Bar dataKey="coercion" name="Coercion" fill="#a855f7" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Total Reward Line */}
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#10b981]" />
                        Net Reward Score (R_total) by Template
                      </CardTitle>
                      <CardDescription className="text-[#a3a3a3]">Combined business + ethical reward after governance penalties</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={templateStats} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} angle={-30} textAnchor="end" />
                          <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: '#111', border: '1px solid #262626', color: '#fff' }} />
                          <ReferenceLine y={0} stroke="#6b7280" />
                          <Bar dataKey="r_total" name="R_total" fill="#10b981" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Table Summary */}
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white">Template Summary Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#262626]">
                              {['Template', 'Type', 'Samples', 'Conv%', 'Ret%', 'Comp%', 'Regret%', 'Fatigue%', 'Coercion%', 'R_total'].map(h => (
                                <th key={h} className="text-left text-[#a3a3a3] font-medium pb-2 pr-4 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {templateStats.map((t, i) => (
                              <tr key={i} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                                <td className="py-2 pr-4 text-white font-medium">{t.name}</td>
                                <td className="py-2 pr-4"><Badge className="bg-[#1a1a1a] text-[#a3a3a3] border-[#262626] text-xs">{t.type}</Badge></td>
                                <td className="py-2 pr-4 text-[#a3a3a3]">{t.samples}</td>
                                <td className="py-2 pr-4 text-[#00d4ff]">{t.conversion}%</td>
                                <td className="py-2 pr-4 text-[#10b981]">{t.retention}%</td>
                                <td className="py-2 pr-4 text-[#fbbf24]">{t.completion}%</td>
                                <td className={`py-2 pr-4 ${t.regret > 20 ? 'text-red-400' : 'text-[#a3a3a3]'}`}>{t.regret}%</td>
                                <td className={`py-2 pr-4 ${t.fatigue > 20 ? 'text-orange-400' : 'text-[#a3a3a3]'}`}>{t.fatigue}%</td>
                                <td className={`py-2 pr-4 ${t.coercion > 15 ? 'text-purple-400' : 'text-[#a3a3a3]'}`}>{t.coercion}%</td>
                                <td className={`py-2 pr-4 font-mono ${t.r_total >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>{t.r_total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Cohort Analysis Tab */}
            <TabsContent value="cohorts">
              {cohortScatterData.length === 0 ? (
                <EmptyState message="No cohort data available. Outcome events need a cohort_state_bucket field to appear here." />
              ) : (
                <div className="space-y-6">
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#00d4ff]" />
                        Business vs. Harm by Cohort
                      </CardTitle>
                      <CardDescription className="text-[#a3a3a3]">
                        Ideal cohorts sit top-left: high business metrics, low harm. Bottom-right cohorts need attention.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={cohortScatterData} margin={{ top: 5, right: 20, bottom: 80, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="cohort" tick={{ fill: '#a3a3a3', fontSize: 11 }} angle={-35} textAnchor="end" />
                          <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} unit="%" />
                          <Tooltip contentStyle={{ background: '#111', border: '1px solid #262626', color: '#fff' }} />
                          <Legend wrapperStyle={{ color: '#a3a3a3' }} />
                          <Bar dataKey="business" name="Business (Conversion)" fill={BUSINESS_COLOR} radius={[3,3,0,0]} />
                          <Bar dataKey="harm" name="Total Harm Proxy" fill={HARM_COLOR} radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
                    {cohortScatterData.map((c, i) => (
                      <Card key={i} className="bg-[#111111] border-[#262626]">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{c.cohort}</p>
                              <p className="text-xs text-[#6b7280]">{c.n} outcomes</p>
                            </div>
                            <Badge className={`text-xs ${c.harm > c.business ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                              {c.harm > c.business ? 'High Risk' : 'Healthy'}
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#a3a3a3]">Business</span>
                              <span className="text-[#00d4ff]">{c.business}%</span>
                            </div>
                            <div className="h-1.5 bg-[#262626] rounded-full">
                              <div className="h-1.5 bg-[#00d4ff] rounded-full" style={{ width: `${Math.min(c.business, 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-[#a3a3a3]">Harm</span>
                              <span className="text-red-400">{c.harm}%</span>
                            </div>
                            <div className="h-1.5 bg-[#262626] rounded-full">
                              <div className="h-1.5 bg-red-500 rounded-full" style={{ width: `${Math.min(c.harm, 100)}%` }} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Radar Tab */}
            <TabsContent value="radar">
              {radarTemplates.length === 0 ? (
                <EmptyState message="No template outcome data available for radar comparison." />
              ) : (
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#fbbf24]" />
                      Top 3 Templates — Multi-Dimensional Comparison
                    </CardTitle>
                    <CardDescription className="text-[#a3a3a3]">Higher business metrics + lower harm metrics = better template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#262626" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                        {radarTemplates.map((t, i) => (
                          <Radar key={t.name} name={t.name} dataKey={t.name} stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.15} />
                        ))}
                        <Legend wrapperStyle={{ color: '#a3a3a3' }} />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #262626', color: '#fff' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Governance Weights Tab */}
            <TabsContent value="governance">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-[#8b5cf6]" />
                      Governance Weight Tuning
                    </CardTitle>
                    <CardDescription className="text-[#a3a3a3]">
                      Adjust penalty multipliers for each harm signal. Higher weight = stronger penalty on R_total.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { key: 'w_regret', label: 'Regret Weight', color: '#ef4444', desc: 'Penalizes interventions that cause user regret' },
                      { key: 'w_fatigue', label: 'Fatigue Weight', color: '#f97316', desc: 'Penalizes over-engagement and messaging overload' },
                      { key: 'w_coercion', label: 'Coercion Weight', color: '#a855f7', desc: 'Penalizes manipulative or high-pressure patterns' },
                      { key: 'w_disparity', label: 'Disparity Weight', color: '#fbbf24', desc: 'Penalizes unequal outcomes across cohorts' },
                      { key: 'w_gaming', label: 'Gaming Weight', color: '#6b7280', desc: 'Penalizes exploiting behavioral loops' },
                    ].map(({ key, label, color, desc }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium text-white">{label}</span>
                            <p className="text-xs text-[#6b7280]">{desc}</p>
                          </div>
                          <span className="text-sm font-mono font-bold ml-4" style={{ color }}>{weights[key]?.toFixed(2)}</span>
                        </div>
                        <Slider
                          min={0}
                          max={5}
                          step={0.1}
                          value={[weights[key] ?? 1.0]}
                          onValueChange={([val]) => setWeights(w => ({ ...w, [key]: val }))}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-[10px] text-[#4b5563] mt-0.5">
                          <span>0 (disabled)</span><span>2.5 (moderate)</span><span>5 (critical)</span>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={saveWeights}
                        disabled={saving}
                        className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Weights'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setWeights(DEFAULT_WEIGHTS)}
                        className="border-[#262626] text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Preview */}
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#00d4ff]" />
                      Weight Impact Preview
                    </CardTitle>
                    <CardDescription className="text-[#a3a3a3]">
                      Projected ethical penalty (P_ethics) for average harm signal values
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WeightImpactPreview weights={weights} outcomes={filteredOutcomes} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function WeightImpactPreview({ weights, outcomes }) {
  if (!outcomes.length) return <p className="text-[#6b7280] text-sm">No outcome data to preview impact.</p>;

  // Compute average harm scores
  const avg = (key) => outcomes.reduce((s, o) => s + (o.harm_proxies?.[key] ?? 0), 0) / outcomes.length;
  const avgDisp = (key) => outcomes.reduce((s, o) => s + (o.disparity_metrics?.[key] ?? 0), 0) / outcomes.length;

  const r = avg('regret_score');
  const f = avg('fatigue_score');
  const c = avg('coercion_score');
  const d = (avgDisp('cohort_regret_delta') + avgDisp('cohort_fatigue_delta')) / 2;
  const g = avg('gaming_risk_score');

  const penalty = (
    weights.w_regret * r +
    weights.w_fatigue * f +
    weights.w_coercion * c +
    weights.w_disparity * d +
    weights.w_gaming * g
  );

  const rows = [
    { label: 'Avg Regret', value: (r * 100).toFixed(1) + '%', weighted: (weights.w_regret * r).toFixed(3), color: '#ef4444' },
    { label: 'Avg Fatigue', value: (f * 100).toFixed(1) + '%', weighted: (weights.w_fatigue * f).toFixed(3), color: '#f97316' },
    { label: 'Avg Coercion', value: (c * 100).toFixed(1) + '%', weighted: (weights.w_coercion * c).toFixed(3), color: '#a855f7' },
    { label: 'Avg Disparity', value: (d * 100).toFixed(1) + '%', weighted: (weights.w_disparity * d).toFixed(3), color: '#fbbf24' },
    { label: 'Avg Gaming Risk', value: (g * 100).toFixed(1) + '%', weighted: (weights.w_gaming * g).toFixed(3), color: '#6b7280' },
  ];

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.label} className="flex items-center justify-between text-sm">
          <span className="text-[#a3a3a3]">{row.label}</span>
          <div className="flex items-center gap-4">
            <span className="text-[#6b7280]">{row.value}</span>
            <span className="font-mono text-xs" style={{ color: row.color }}>× w = {row.weighted}</span>
          </div>
        </div>
      ))}
      <div className="border-t border-[#262626] pt-3 mt-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">Total P_ethics</span>
          <span className={`font-mono text-lg font-bold ${penalty > 0.5 ? 'text-red-400' : penalty > 0.2 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {penalty.toFixed(4)}
          </span>
        </div>
        <p className="text-xs text-[#6b7280] mt-1">
          {penalty > 0.5 ? '⚠ High penalty — consider reviewing high-harm templates' :
           penalty > 0.2 ? '↑ Moderate penalty — monitor closely' :
           '✓ Low penalty — governance profile is healthy'}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardContent className="py-16 text-center">
        <BarChart3 className="w-12 h-12 text-[#262626] mx-auto mb-4" />
        <p className="text-[#a3a3a3] max-w-sm mx-auto text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}