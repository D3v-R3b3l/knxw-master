import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronRight, Users, Zap, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const RISK_COLORS = {
  high:   'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-green-500/20 text-green-400 border-green-500/30',
};

const COG_ICON_COLORS = {
  analytical: 'text-blue-400',
  intuitive:  'text-purple-400',
  systematic: 'text-cyan-400',
  creative:   'text-pink-400',
  unknown:    'text-gray-400',
};

function ScoreMeter({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 65 ? '#ef4444' : pct >= 35 ? '#fbbf24' : '#10b981';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#262626] rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{pct}%</span>
    </div>
  );
}

function SegmentRow({ segment }) {
  const [open, setOpen] = useState(false);
  const iconColor = COG_ICON_COLORS[segment.segment] || COG_ICON_COLORS.unknown;

  return (
    <div className="border border-[#262626] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Brain className={`w-4 h-4 ${iconColor}`} />
          <div>
            <span className="text-sm font-semibold text-white capitalize">{segment.segment}</span>
            <span className="text-xs text-[#6b7280] ml-2">{segment.user_count} users</span>
          </div>
          {segment.high_risk_count > 0 && (
            <Badge className={`${RISK_COLORS.high} text-xs`}>{segment.high_risk_count} high</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 hidden sm:block">
            <ScoreMeter score={segment.avg_churn_score} />
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-[#6b7280]" /> : <ChevronRight className="w-4 h-4 text-[#6b7280]" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 bg-[#0f0f0f]">
          {/* Sample users */}
          {segment.sample_users?.length > 0 && (
            <div>
              <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wider">At-Risk Users (sample)</p>
              <div className="space-y-1">
                {segment.sample_users.map(u => (
                  <div key={u.user_id} className="flex items-center justify-between text-xs">
                    <span className="text-[#a3a3a3] font-mono truncate max-w-[140px]">{u.user_id}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`${RISK_COLORS[u.risk_level]} text-[10px] px-1.5`}>{u.risk_level}</Badge>
                      <span className="text-[#6b7280]">{Math.round(u.churn_score * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interventions */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Zap className="w-3 h-3 text-[#00d4ff]" />
              <p className="text-xs text-[#00d4ff] uppercase tracking-wider">Recommended Interventions</p>
            </div>
            <ul className="space-y-1">
              {segment.interventions.map((intervention, i) => (
                <li key={i} className="text-xs text-[#a3a3a3] flex gap-2">
                  <span className="text-[#6b7280] flex-shrink-0">{i + 1}.</span>
                  {intervention}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChurnAlertWidget({ appId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const scan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('scanChurnRisk', { app_id: appId, limit: 200 });
      setData(res?.data?.data || null);
      setLastScanned(new Date());
    } catch (err) {
      console.error('ChurnAlertWidget scan error:', err);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white text-base">Churn Risk Monitor</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={scan}
            disabled={loading}
            className="border-[#262626] text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {data ? 'Re-scan' : 'Scan Now'}
          </Button>
        </div>
        {lastScanned && (
          <p className="text-xs text-[#6b7280]">Last scanned {lastScanned.toLocaleTimeString()}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {!data && !loading && (
          <div className="text-center py-8">
            <AlertTriangle className="w-10 h-10 text-[#404040] mx-auto mb-3" />
            <p className="text-sm text-[#a3a3a3] mb-4">Click "Scan Now" to identify at-risk user segments</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-[#00d4ff] animate-spin mr-2" />
            <span className="text-sm text-[#a3a3a3]">Scanning profiles...</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 text-center">
                <Users className="w-4 h-4 text-[#6b7280] mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{data.total_scanned}</p>
                <p className="text-[10px] text-[#6b7280]">Scanned</p>
              </div>
              <div className="bg-[#1a1a1a] border border-red-500/20 rounded-lg p-3 text-center">
                <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-400">{data.high_risk_count}</p>
                <p className="text-[10px] text-[#6b7280]">High Risk</p>
              </div>
              <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-lg p-3 text-center">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-yellow-400">{data.medium_risk_count}</p>
                <p className="text-[10px] text-[#6b7280]">Medium Risk</p>
              </div>
            </div>

            {/* Segments */}
            {data.segments?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">At-Risk Segments</p>
                {data.segments.map(seg => (
                  <SegmentRow key={seg.segment} segment={seg} />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#10b981]">No at-risk users detected 🎉</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}