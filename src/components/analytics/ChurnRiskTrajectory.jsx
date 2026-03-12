import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HORIZONS = [
  { label: 'Now', delta: 0 },
  { label: '7d', delta: 0.08 },
  { label: '14d', delta: 0.16 },
  { label: '30d', delta: 0.28 },
];

export default function ChurnRiskTrajectory({ users = [] }) {
  const data = useMemo(() => HORIZONS.map((horizon) => ({
    horizon: horizon.label,
    avgRisk: users.length
      ? Math.round((users.reduce((sum, user) => sum + Math.min(1, user.churn_score + horizon.delta), 0) / users.length) * 100)
      : 0,
  })), [users]);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white text-base">Projected Cohort Risk Over Time</CardTitle>
        <p className="text-sm text-[#a3a3a3]">Projection derived from current churn score plus the same inactivity/staleness decay used by the risk scan.</p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
              <XAxis dataKey="horizon" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ background: '#111111', border: '1px solid #262626', borderRadius: 12 }} formatter={(value) => [`${value}%`, 'Average risk']} />
              <Line type="monotone" dataKey="avgRisk" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}