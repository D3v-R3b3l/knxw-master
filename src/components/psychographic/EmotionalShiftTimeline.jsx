import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

export default function EmotionalShiftTimeline({ userId }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const analyzeShifts = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeEmotionalShifts', {
        user_id: userId,
        time_window_days: 30
      });

      const data = response.data;
      setShifts(data.shifts || []);
      setSummary(data.analysis_summary);
    } catch (error) {
      console.error('Error analyzing shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      analyzeShifts();
    }
  }, [userId]);

  const getShiftIcon = (magnitude) => {
    if (magnitude > 0.5) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (magnitude > 0.2) return <TrendingUp className="w-4 h-4 text-yellow-400" />;
    return <Minus className="w-4 h-4 text-blue-400" />;
  };

  const getSignificanceBadge = (significance) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[significance] || colors.low;
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5" />
              Emotional Shift Timeline
            </CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              Track subtle changes in emotional state over time
            </CardDescription>
          </div>
          <Button
            onClick={analyzeShifts}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-[#262626] text-white hover:bg-[#1a1a1a]"
          >
            {loading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#a3a3a3]">Analyzing emotional patterns...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-[#6b7280] mx-auto mb-3" />
            <p className="text-[#a3a3a3]">No emotional shifts detected</p>
            <p className="text-sm text-[#6b7280] mt-1">Need at least 2 psychographic snapshots</p>
          </div>
        ) : (
          <>
            {summary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#262626]">
                  <div className="text-xs text-[#6b7280] mb-1">Total Shifts</div>
                  <div className="text-2xl font-bold text-white">{summary.total_shifts_detected}</div>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#262626]">
                  <div className="text-xs text-[#6b7280] mb-1">Volatility</div>
                  <div className="text-2xl font-bold text-white">{(summary.volatility_score * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#262626]">
                  <div className="text-xs text-[#6b7280] mb-1">Most Common</div>
                  <div className="text-sm font-bold text-white truncate">{summary.most_common_shift || 'N/A'}</div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {shifts.map((shift, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                  <div className="mt-1">
                    {getShiftIcon(shift.magnitude)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-white text-sm capitalize">
                        {shift.shift_type.replace(/_/g, ' ')}
                      </h5>
                      <Badge className={getSignificanceBadge(shift.significance)}>
                        {shift.significance}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#a3a3a3] mb-2">
                      {shift.from} → {shift.to}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {format(new Date(shift.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {(shift.magnitude * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-[#6b7280]">magnitude</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}