
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2 } from 'lucide-react';
import { useDashboardStore } from "./DashboardStore";

export default function PsychographicHeatmap() {
  const { profiles, userIdsInScope, isLoading } = useDashboardStore();
  const [heatmapData, setHeatmapData] = React.useState([]);

  const getSegmentColor = (count, maxCount) => {
    const intensity = maxCount ? count / maxCount : 0;
    if (intensity > 0.7) return 'bg-[#00d4ff]/30 text-[#00d4ff] border-[#00d4ff]/50';
    if (intensity > 0.4) return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
    if (intensity > 0.2) return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
    return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
  };

  React.useEffect(() => {
    // Guard against missing data
    if (!Array.isArray(profiles)) {
      setHeatmapData([]);
      return;
    }

    const scoped = userIdsInScope && userIdsInScope.size ?
    profiles.filter((p) => userIdsInScope.has(p.user_id)) :
    profiles;

    if (!Array.isArray(scoped) || scoped.length === 0) {
      setHeatmapData([]);
      return;
    }

    const segments = {};
    scoped.forEach((profile) => {
      if (!profile) return; // Guard against null/undefined profile objects
      const riskProfile = profile.risk_profile || 'unknown';
      const cognitiveStyle = profile.cognitive_style || 'unknown';
      const key = `${riskProfile}-${cognitiveStyle}`;
      if (!segments[key]) {
        segments[key] = {
          risk_profile: riskProfile,
          cognitive_style: cognitiveStyle,
          count: 0
        };
      }
      segments[key].count++;
    });

    const segmentArray = Object.values(segments).
    sort((a, b) => b.count - a.count).
    slice(0, 12);

    setHeatmapData(segmentArray);
  }, [profiles, userIdsInScope]);

  const maxCount = Math.max(...heatmapData.map((s) => s.count), 1);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-[#00d4ff]" />
          Psychographic Segments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ?
        <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          </div> :
        heatmapData.length === 0 ?
        <div className="flex items-center justify-center h-48 text-[#a3a3a3]">
            <div className="text-center">
              <Brain className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4 opacity-50" />
              <p>No psychographic segments available</p>
              <p className="text-sm mt-2">User profiles will appear here as they're analyzed</p>
            </div>
          </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            {heatmapData.map((segment, index) =>
          <div
            key={`${segment.risk_profile}-${segment.cognitive_style}-${index}`}
            className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${getSegmentColor(segment.count, maxCount)}`}>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize">
                      {String(segment.risk_profile).replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {segment.count} users
                    </Badge>
                  </div>
                  <span className="text-xs opacity-75 capitalize">
                    {String(segment.cognitive_style).replace('_', ' ')} thinking
                  </span>
                </div>
              </div>
          )}
          </div>
        }
      </CardContent>
    </Card>);

}