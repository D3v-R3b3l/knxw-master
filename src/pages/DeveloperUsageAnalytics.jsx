import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function groupLogs(logs, windowLabel) {
  const buckets = {};
  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    const key = windowLabel === '7d'
      ? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!buckets[key]) buckets[key] = { time: key, requests: 0, success: 0, errors: 0, latencyTotal: 0, latencyCount: 0 };
    buckets[key].requests += 1;
    if (log.status_code < 400) buckets[key].success += 1;
    if (log.status_code >= 400) buckets[key].errors += 1;
    if (typeof log.latency_ms === 'number') {
      buckets[key].latencyTotal += log.latency_ms;
      buckets[key].latencyCount += 1;
    }
  });
  return Object.values(buckets).map((item) => ({
    ...item,
    latency: item.latencyCount ? Math.round(item.latencyTotal / item.latencyCount) : 0,
    successRate: item.requests ? Math.round((item.success / item.requests) * 100) : 0
  }));
}

export default function DeveloperUsageAnalytics() {
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('all');
  const [range, setRange] = useState('24h');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      const user = await base44.auth.me();
      const clientApps = await base44.entities.ClientApp.filter({ owner_id: user.id }, '-created_date', 100);
      setApps(clientApps);
      setSelectedAppId(clientApps[0]?.id || 'all');
    };
    loadApps();
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      const requestLogs = selectedAppId === 'all'
        ? await base44.entities.ApiKeyRequestLog.list('-timestamp', range === '7d' ? 500 : 200)
        : await base44.entities.ApiKeyRequestLog.filter({ client_app_id: selectedAppId }, '-timestamp', range === '7d' ? 500 : 200);
      setLogs(requestLogs);
      setLoading(false);
    };
    loadLogs();
  }, [selectedAppId, range]);

  const chartData = useMemo(() => groupLogs(logs, range), [logs, range]);
  const totals = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((log) => log.status_code < 400).length;
    const avgLatency = logs.length ? Math.round(logs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / logs.length) : 0;
    return {
      total,
      successRate: total ? Math.round((success / total) * 100) : 0,
      avgLatency,
      errors: total - success
    };
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">API Usage Analytics</h1>
            <p className="text-[#a3a3a3] mt-2">Track request volume, success rates, and latency trends over time.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger className="bg-[#111111] border-[#262626] text-white w-full sm:w-64">
                <SelectValue placeholder="Select app" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#262626] text-white">
                <SelectItem value="all">All apps</SelectItem>
                {apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="bg-[#111111] border-[#262626] text-white w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#262626] text-white">
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#262626]"><CardContent className="p-6"><div className="flex items-center justify-between"><span className="text-sm text-[#a3a3a3]">Requests</span><Activity className="w-4 h-4 text-[#00d4ff]" /></div><div className="text-3xl font-bold mt-3">{totals.total}</div></CardContent></Card>
          <Card className="bg-[#111111] border-[#262626]"><CardContent className="p-6"><div className="flex items-center justify-between"><span className="text-sm text-[#a3a3a3]">Success rate</span><CheckCircle2 className="w-4 h-4 text-[#10b981]" /></div><div className="text-3xl font-bold mt-3 text-[#10b981]">{totals.successRate}%</div></CardContent></Card>
          <Card className="bg-[#111111] border-[#262626]"><CardContent className="p-6"><div className="flex items-center justify-between"><span className="text-sm text-[#a3a3a3]">Avg latency</span><Clock3 className="w-4 h-4 text-[#fbbf24]" /></div><div className="text-3xl font-bold mt-3 text-[#fbbf24]">{totals.avgLatency}ms</div></CardContent></Card>
          <Card className="bg-[#111111] border-[#262626]"><CardContent className="p-6"><div className="flex items-center justify-between"><span className="text-sm text-[#a3a3a3]">Errors</span><AlertTriangle className="w-4 h-4 text-[#ef4444]" /></div><div className="text-3xl font-bold mt-3 text-[#ef4444]">{totals.errors}</div></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader><CardTitle className="text-white">Request trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                    <XAxis dataKey="time" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip contentStyle={{ background: '#111111', border: '1px solid #262626', color: '#fff' }} />
                    <Line type="monotone" dataKey="requests" stroke="#00d4ff" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader><CardTitle className="text-white">Latency by time bucket</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                    <XAxis dataKey="time" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip contentStyle={{ background: '#111111', border: '1px solid #262626', color: '#fff' }} />
                    <Bar dataKey="latency" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader><CardTitle className="text-white">Success rate over time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="#a3a3a3" />
                  <YAxis stroke="#a3a3a3" domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid #262626', color: '#fff' }} />
                  <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {loading && <div className="text-sm text-[#a3a3a3] mt-4">Loading data...</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}