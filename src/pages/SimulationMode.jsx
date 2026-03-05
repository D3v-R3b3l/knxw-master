import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { runPersonaSimulation } from '@/functions/runPersonaSimulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import {
  FlaskConical, Play, Shield, User, Activity, Brain, Zap, ChevronRight,
  CheckCircle2, AlertTriangle, Clock, MousePointerClick, FileText, Sliders
} from 'lucide-react';

const PERSONAS = [
  { id: 'high_risk_analytical', label: 'High-Risk Analytical', badge: 'Aggressive', color: '#ef4444', desc: 'Confident, data-driven user scanning enterprise options' },
  { id: 'low_risk_intuitive', label: 'Low-Risk Intuitive', badge: 'Conservative', color: '#f97316', desc: 'Anxious, browse-heavy user showing exit-intent patterns' },
  { id: 'moderate_systematic', label: 'Moderate Systematic', badge: 'Moderate', color: '#00d4ff', desc: 'Methodical user comparing features before committing' },
  { id: 'excited_creative', label: 'Excited Creative', badge: 'Moderate', color: '#10b981', desc: 'High-energy user sharing content and chasing novelty' },
  { id: 'uncertain_fatigued', label: 'Uncertain & Fatigued', badge: 'Conservative', color: '#a855f7', desc: 'Low-confidence user repeatedly returning without converting' },
];

const EVENT_ICONS = {
  page_view: MousePointerClick,
  click: MousePointerClick,
  scroll: Activity,
  form_submit: CheckCircle2,
  form_focus: FileText,
  hover: Activity,
  exit_intent: AlertTriangle,
  time_on_page: Clock,
};

const EVENT_COLORS = {
  page_view: '#00d4ff',
  click: '#10b981',
  scroll: '#6b7280',
  form_submit: '#10b981',
  form_focus: '#fbbf24',
  hover: '#6b7280',
  exit_intent: '#ef4444',
  time_on_page: '#8b5cf6',
};

export default function SimulationMode() {
  const [user, setUser] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState('');
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('all');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('events');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === 'admin') {
        base44.entities.ClientApp.list().then(a => setApps(a || []));
      }
    });
  }, []);

  const runSim = async () => {
    if (!selectedPersona) return;
    setRunning(true);
    setError(null);
    setResult(null);
    const res = await runPersonaSimulation({
      persona_id: selectedPersona,
      client_app_id: selectedAppId === 'all' ? null : selectedAppId,
    });
    if (res?.data?.error) {
      setError(res.data.error);
    } else {
      setResult(res?.data);
      setTab('events');
    }
    setRunning(false);
  };

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-[#a3a3a3]">Simulation Mode is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  const persona = PERSONAS.find(p => p.id === selectedPersona);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <PageHeader
            title="Simulation Mode"
            description="Simulate user persona event sequences and predict psychographic insights and engagement rule triggers — no real users required"
            icon={FlaskConical}
          />
        </div>

        {/* Persona Selector Panel */}
        <Card className="bg-[#111111] border-[#262626] mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#00d4ff]" />
              Configure Simulation
            </CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              Select a persona to simulate their event sequence and observe predicted system responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedPersona === p.id
                      ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                      : 'border-[#262626] bg-[#1a1a1a] hover:border-[#404040]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{p.label}</span>
                    <Badge className="text-[10px]" style={{ background: p.color + '22', color: p.color, border: `1px solid ${p.color}44` }}>
                      {p.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6b7280] leading-relaxed">{p.desc}</p>
                  {selectedPersona === p.id && (
                    <div className="mt-2 flex items-center gap-1 text-[#00d4ff] text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger className="w-56 bg-[#1a1a1a] border-[#262626] text-white">
                  <SelectValue placeholder="Filter by App (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#262626]">
                  <SelectItem value="all">All Apps</SelectItem>
                  {apps.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={runSim}
                disabled={!selectedPersona || running}
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-black font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                {running ? 'Running Simulation…' : 'Run Simulation'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Simulated Events', value: result.simulated_events.length, icon: Activity, color: '#00d4ff' },
                { label: 'Predicted Insights', value: result.predicted_insights.length, icon: Brain, color: '#8b5cf6' },
                { label: 'Rules Evaluated', value: result.evaluated_rules_count, icon: Sliders, color: '#6b7280' },
                { label: 'Rules Triggered', value: result.triggered_rules.length, icon: Zap, color: result.triggered_rules.length > 0 ? '#10b981' : '#6b7280' },
              ].map(s => (
                <Card key={s.label} className="bg-[#111111] border-[#262626]">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#6b7280] mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                      </div>
                      <s.icon className="w-6 h-6 opacity-60" style={{ color: s.color }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="bg-[#111111] border border-[#262626] mb-6">
                <TabsTrigger value="events" className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]">
                  <Activity className="w-4 h-4 mr-2" />Event Sequence
                </TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-[#8b5cf6]/20 data-[state=active]:text-[#8b5cf6]">
                  <User className="w-4 h-4 mr-2" />Predicted Profile
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-[#8b5cf6]/20 data-[state=active]:text-[#8b5cf6]">
                  <Brain className="w-4 h-4 mr-2" />Predicted Insights
                  {result.predicted_insights.length > 0 && (
                    <Badge className="ml-2 bg-[#8b5cf6] text-white text-[10px] px-1.5 py-0">{result.predicted_insights.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rules" className="data-[state=active]:bg-[#10b981]/20 data-[state=active]:text-[#10b981]">
                  <Zap className="w-4 h-4 mr-2" />Triggered Rules
                  {result.triggered_rules.length > 0 && (
                    <Badge className="ml-2 bg-[#10b981] text-white text-[10px] px-1.5 py-0">{result.triggered_rules.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Event Sequence Tab */}
              <TabsContent value="events">
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Simulated CapturedEvent Sequence</CardTitle>
                    <CardDescription className="text-[#a3a3a3] text-xs font-mono">
                      sim_user: {result.sim_user_id} · session: {result.sim_session_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-5 top-0 bottom-0 w-px bg-[#262626]" />
                      <div className="space-y-4">
                        {result.simulated_events.map((ev, i) => {
                          const Icon = EVENT_ICONS[ev.event_type] || Activity;
                          const color = EVENT_COLORS[ev.event_type] || '#6b7280';
                          return (
                            <div key={ev.id} className="flex items-start gap-4 relative">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border border-[#262626]"
                                style={{ background: color + '22' }}>
                                <Icon className="w-4 h-4" style={{ color }} />
                              </div>
                              <div className="flex-1 bg-[#1a1a1a] rounded-xl p-3 border border-[#262626]">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-white">{ev.event_type.replace(/_/g, ' ')}</span>
                                  <span className="text-[10px] text-[#6b7280] font-mono">
                                    +{new Date(ev.timestamp).getTime() - new Date(result.simulated_events[0].timestamp).getTime()}ms
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(ev.event_payload || {}).map(([k, v]) => (
                                    <span key={k} className="text-xs text-[#a3a3a3]">
                                      <span className="text-[#6b7280]">{k}:</span> {String(v)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Predicted Profile Tab */}
              <TabsContent value="profile">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Predicted Psychographic Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Risk Profile', value: result.predicted_profile.risk_profile, color: '#ef4444' },
                        { label: 'Cognitive Style', value: result.predicted_profile.cognitive_style, color: '#00d4ff' },
                        { label: 'Mood', value: result.predicted_profile.emotional_state?.mood, color: '#fbbf24' },
                        { label: 'Energy Level', value: result.predicted_profile.emotional_state?.energy_level, color: '#10b981' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-sm text-[#a3a3a3]">{row.label}</span>
                          <Badge style={{ background: row.color + '22', color: row.color, border: `1px solid ${row.color}44` }}>
                            {row.value}
                          </Badge>
                        </div>
                      ))}
                      <div>
                        <p className="text-sm text-[#a3a3a3] mb-2">Confidence Score</p>
                        <div className="h-1.5 bg-[#262626] rounded-full">
                          <div className="h-1.5 bg-[#00d4ff] rounded-full" style={{ width: `${(result.predicted_profile.emotional_state?.confidence_score ?? 0.5) * 100}%` }} />
                        </div>
                        <p className="text-xs text-[#6b7280] mt-1">{((result.predicted_profile.emotional_state?.confidence_score ?? 0.5) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#a3a3a3] mb-2">Motivation Stack</p>
                        <div className="space-y-1.5">
                          {(result.predicted_profile.motivation_stack_v2 || []).map(m => (
                            <div key={m.label} className="flex items-center gap-2">
                              <span className="text-xs text-white w-24 capitalize">{m.label}</span>
                              <div className="flex-1 h-1.5 bg-[#262626] rounded-full">
                                <div className="h-1.5 bg-[#8b5cf6] rounded-full" style={{ width: `${m.weight * 100}%` }} />
                              </div>
                              <span className="text-xs text-[#6b7280] w-8 text-right">{(m.weight * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white text-base">AI Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(result.predicted_profile.profile_reasoning || {}).map(([key, val]) => {
                        if (key === 'key_recent_events' || key === 'confidence_factors') return null;
                        return (
                          <div key={key}>
                            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-[#a3a3a3]">{val}</p>
                          </div>
                        );
                      })}
                      {result.predicted_profile.profile_reasoning?.key_recent_events?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Key Events Analyzed</p>
                          <div className="space-y-1">
                            {result.predicted_profile.profile_reasoning.key_recent_events.map((ev, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                                <ChevronRight className="w-3 h-3 text-[#6b7280]" />
                                {ev}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Predicted Insights Tab */}
              <TabsContent value="insights">
                {result.predicted_insights.length === 0 ? (
                  <EmptyState message="No insights predicted for this event sequence." />
                ) : (
                  <div className="space-y-4">
                    {result.predicted_insights.map((ins, i) => (
                      <Card key={i} className="bg-[#111111] border-[#262626]">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-start gap-3">
                              <Brain className="w-5 h-5 text-[#8b5cf6] mt-0.5 flex-shrink-0" />
                              <div>
                                <h3 className="text-sm font-semibold text-white mb-0.5">{ins.title}</h3>
                                <div className="flex items-center gap-2">
                                  <Badge className="text-[10px] bg-[#1a1a1a] text-[#a3a3a3] border-[#262626]">{ins.insight_type?.replace(/_/g, ' ')}</Badge>
                                  <Badge className={`text-[10px] ${ins.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ins.priority === 'critical' ? 'bg-red-700/20 text-red-300 border-red-700/30' : 'bg-[#1a1a1a] text-[#a3a3a3] border-[#262626]'}`}>
                                    {ins.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-lg font-bold text-[#8b5cf6]">{((ins.confidence_score || 0) * 100).toFixed(0)}%</span>
                              <p className="text-[10px] text-[#6b7280]">confidence</p>
                            </div>
                          </div>
                          <p className="text-sm text-[#a3a3a3] mb-3 ml-8">{ins.description}</p>
                          {ins.actionable_recommendations?.length > 0 && (
                            <div className="ml-8">
                              <p className="text-xs font-semibold text-[#6b7280] mb-1.5">Recommended Actions</p>
                              <div className="space-y-1">
                                {ins.actionable_recommendations.map((r, j) => (
                                  <div key={j} className="flex items-start gap-2 text-xs text-[#a3a3a3]">
                                    <ChevronRight className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                                    {r}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Triggered Rules Tab */}
              <TabsContent value="rules">
                {result.triggered_rules.length === 0 ? (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardContent className="py-12 text-center">
                      <Zap className="w-10 h-10 text-[#262626] mx-auto mb-3" />
                      <p className="text-[#a3a3a3] text-sm">
                        {result.evaluated_rules_count === 0
                          ? 'No active engagement rules found. Create rules in the Engagements section first.'
                          : `${result.evaluated_rules_count} rules evaluated — none triggered for this persona.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[#10b981] mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {result.triggered_rules.length} of {result.evaluated_rules_count} rules would trigger for <strong className="text-white">{result.persona_label}</strong>
                    </div>
                    {result.triggered_rules.map((rule, i) => (
                      <Card key={i} className="bg-[#111111] border-[#10b981]/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Zap className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-white mb-1">{rule.rule_name}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="text-[10px] bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">Would Trigger</Badge>
                                {rule.engagement_action?.type && (
                                  <Badge className="text-[10px] bg-[#1a1a1a] text-[#a3a3a3] border-[#262626]">
                                    {rule.engagement_action.type}
                                  </Badge>
                                )}
                                {rule.engagement_action?.priority && (
                                  <Badge className="text-[10px] bg-[#1a1a1a] text-[#a3a3a3] border-[#262626]">
                                    priority: {rule.engagement_action.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {rule.match_reason?.length > 0 && (
                            <div className="ml-8">
                              <p className="text-xs font-semibold text-[#6b7280] mb-1.5">Match Conditions</p>
                              <div className="space-y-1">
                                {rule.match_reason.map((r, j) => (
                                  <div key={j} className="flex items-start gap-2 text-xs text-[#a3a3a3] font-mono">
                                    <CheckCircle2 className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                                    {r}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardContent className="py-12 text-center">
        <Brain className="w-10 h-10 text-[#262626] mx-auto mb-3" />
        <p className="text-[#a3a3a3] text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}