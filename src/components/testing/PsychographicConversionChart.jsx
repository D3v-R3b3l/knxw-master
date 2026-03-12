import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, TrendingUp, Users, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SEG_COLORS = {
  analytical: '#00d4ff',
  intuitive:  '#8b5cf6',
  systematic: '#10b981',
  creative:   '#ec4899',
  unknown:    '#6b7280',
};

function ConversionBar({ label, conversions, impressions, color }) {
  const rate = impressions > 0 ? ((conversions / impressions) * 100).toFixed(1) : '0.0';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#a3a3a3] capitalize">{label}</span>
        <span style={{ color }} className="font-semibold">{rate}%</span>
      </div>
      <div className="flex-1 bg-[#262626] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(parseFloat(rate), 100)}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#6b7280]">
        <span>{conversions} conversions</span>
        <span>{impressions} impressions</span>
      </div>
    </div>
  );
}

export default function PsychographicConversionChart({ abTestId }) {
  const [variants, setVariants] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [segmentBreakdown, setSegmentBreakdown] = useState([]);

  useEffect(() => {
    if (!abTestId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [variantData, participantData] = await Promise.all([
          base44.entities.ABTestVariant.filter({ ab_test_id: abTestId }),
          base44.entities.ABTestParticipant.filter({ ab_test_id: abTestId }),
        ]);
        setVariants(variantData);
        setParticipants(participantData);

        // Build psychographic segment breakdown
        const segMap = {};
        for (const p of participantData) {
          const seg = p.metadata?.psychographic_segment || 'unknown';
          if (!segMap[seg]) segMap[seg] = { segment: seg, total: 0, converted: 0 };
          segMap[seg].total += 1;
          if (p.converted) segMap[seg].converted += 1;
        }
        setSegmentBreakdown(Object.values(segMap).map(s => ({
          ...s,
          conversion_rate: s.total > 0 ? parseFloat(((s.converted / s.total) * 100).toFixed(1)) : 0,
        })));
      } catch (err) {
        console.error('PsychographicConversionChart load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [abTestId]);

  if (!abTestId) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="py-8 text-center text-[#6b7280] text-sm">
          Select an A/B test to view psychographic conversion breakdown
        </CardContent>
      </Card>
    );
  }

  const totalParticipants = participants.length;
  const totalConverted = participants.filter(p => p.converted).length;
  const overallRate = totalParticipants > 0 ? ((totalConverted / totalParticipants) * 100).toFixed(1) : '0.0';

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#00d4ff]" />
          <CardTitle className="text-white text-base">Psychographic Conversion Breakdown</CardTitle>
        </div>
        <p className="text-xs text-[#6b7280]">Conversion rates by psychographic segment across variants</p>
      </CardHeader>

      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-[#6b7280] text-sm">Loading...</div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 text-center">
                <Users className="w-4 h-4 text-[#6b7280] mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{totalParticipants}</p>
                <p className="text-[10px] text-[#6b7280]">Participants</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 text-center">
                <Target className="w-4 h-4 text-[#10b981] mx-auto mb-1" />
                <p className="text-lg font-bold text-[#10b981]">{totalConverted}</p>
                <p className="text-[10px] text-[#6b7280]">Converted</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-[#00d4ff] mx-auto mb-1" />
                <p className="text-lg font-bold text-[#00d4ff]">{overallRate}%</p>
                <p className="text-[10px] text-[#6b7280]">Overall Rate</p>
              </div>
            </div>

            {/* Variant bars */}
            {variants.length > 0 && (
              <div>
                <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Variant Performance</p>
                <div className="space-y-3">
                  {variants.map((v) => (
                    <ConversionBar
                      key={v.id}
                      label={v.name}
                      conversions={v.metrics?.conversions || 0}
                      impressions={v.metrics?.impressions || 0}
                      color="#00d4ff"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Segment chart */}
            {segmentBreakdown.length > 0 && (
              <div>
                <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Conversion Rate by Cognitive Segment</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={segmentBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="segment" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} unit="%" />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid #262626', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(v) => [`${v}%`, 'Conversion Rate']}
                    />
                    <Bar dataKey="conversion_rate" radius={[4, 4, 0, 0]}>
                      {segmentBreakdown.map((entry) => (
                        <Cell key={entry.segment} fill={SEG_COLORS[entry.segment] || SEG_COLORS.unknown} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {segmentBreakdown.map(s => (
                    <div key={s.segment} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: SEG_COLORS[s.segment] || SEG_COLORS.unknown }} />
                      <span className="text-[10px] text-[#a3a3a3] capitalize">{s.segment} ({s.total})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {variants.length === 0 && segmentBreakdown.length === 0 && (
              <p className="text-sm text-[#6b7280] text-center py-4">No data yet — assign users via psychographicABAssign</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}