import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Brain, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function PsychographicTrendChart({ userId }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [metricType, setMetricType] = useState('emotional');

  useEffect(() => {
    loadSnapshots();
  }, [userId, timeRange]);

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      const data = await base44.entities.PsychographicSnapshot.filter({
        user_id: userId,
        snapshot_date: { $gte: cutoffDate.toISOString() }
      }, '-snapshot_date', 100);

      setSnapshots(data);
    } catch (error) {
      console.error('Error loading snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (metricType === 'emotional') {
      return snapshots.map(s => ({
        date: format(new Date(s.snapshot_date), 'MMM dd'),
        mood: getMoodValue(s.emotional_state?.mood),
        confidence: s.emotional_state?.confidence_score || 0,
        energy: getEnergyValue(s.emotional_state?.energy_level)
      }));
    } else if (metricType === 'personality') {
      return snapshots.map(s => ({
        date: format(new Date(s.snapshot_date), 'MMM dd'),
        openness: s.personality_traits?.openness || 0,
        conscientiousness: s.personality_traits?.conscientiousness || 0,
        extraversion: s.personality_traits?.extraversion || 0,
        agreeableness: s.personality_traits?.agreeableness || 0,
        neuroticism: s.personality_traits?.neuroticism || 0
      }));
    } else if (metricType === 'motivation') {
      return snapshots.map(s => {
        const motivations = {};
        s.motivation_stack?.forEach(m => {
          motivations[m.label] = m.weight;
        });
        return {
          date: format(new Date(s.snapshot_date), 'MMM dd'),
          ...motivations
        };
      });
    }
    return [];
  };

  const getMoodValue = (mood) => {
    const scale = { negative: 0, uncertain: 0.25, anxious: 0.3, neutral: 0.5, confident: 0.7, positive: 0.8, excited: 1.0 };
    return scale[mood] || 0.5;
  };

  const getEnergyValue = (level) => {
    const scale = { low: 0.2, medium: 0.5, high: 0.9 };
    return scale[level] || 0.5;
  };

  if (loading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto" />
          <p className="text-[#a3a3a3] mt-4">Loading trend data...</p>
        </CardContent>
      </Card>
    );
  }

  if (snapshots.length < 2) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Psychographic Trends
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">Track how user psychology evolves over time</CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Brain className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
          <p className="text-[#a3a3a3] mb-4">Not enough historical data yet</p>
          <p className="text-sm text-[#6b7280]">Psychographic snapshots are created automatically. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              Psychographic Trends
            </CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              {snapshots.length} snapshots over {timeRange} days
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger className="w-40 bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emotional">Emotional State</SelectItem>
                <SelectItem value="personality">Personality</SelectItem>
                <SelectItem value="motivation">Motivations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
              <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#a3a3a3' }} />
            {metricType === 'emotional' && (
              <>
                <Area type="monotone" dataKey="mood" stroke="#00d4ff" fillOpacity={1} fill="url(#colorMood)" name="Mood" />
                <Area type="monotone" dataKey="confidence" stroke="#10b981" fillOpacity={1} fill="url(#colorConfidence)" name="Confidence" />
                <Line type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={2} name="Energy" />
              </>
            )}
            {metricType === 'personality' && (
              <>
                <Line type="monotone" dataKey="openness" stroke="#8b5cf6" strokeWidth={2} name="Openness" />
                <Line type="monotone" dataKey="conscientiousness" stroke="#10b981" strokeWidth={2} name="Conscientiousness" />
                <Line type="monotone" dataKey="extraversion" stroke="#f59e0b" strokeWidth={2} name="Extraversion" />
                <Line type="monotone" dataKey="agreeableness" stroke="#06b6d4" strokeWidth={2} name="Agreeableness" />
                <Line type="monotone" dataKey="neuroticism" stroke="#ef4444" strokeWidth={2} name="Neuroticism" />
              </>
            )}
            {metricType === 'motivation' && Object.keys(chartData[0] || {}).filter(k => k !== 'date').map((key, i) => {
              const colors = ['#00d4ff', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
              return <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} name={key} />;
            })}
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
            <div className="text-xs text-[#6b7280] mb-1">Emotional Volatility</div>
            <div className="text-2xl font-bold text-white">
              {(snapshots.reduce((sum, s) => sum + (s.change_indicators?.emotional_shift_magnitude || 0), 0) / snapshots.length * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
            <div className="text-xs text-[#6b7280] mb-1">Motivation Drift</div>
            <div className="text-2xl font-bold text-white">
              {(snapshots.reduce((sum, s) => sum + (s.change_indicators?.motivation_drift || 0), 0) / snapshots.length * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
            <div className="text-xs text-[#6b7280] mb-1">Behavior Volatility</div>
            <div className="text-2xl font-bold text-white">
              {(snapshots.reduce((sum, s) => sum + (s.change_indicators?.behavior_volatility || 0), 0) / snapshots.length * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}