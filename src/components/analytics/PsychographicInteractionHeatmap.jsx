import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MousePointerClick } from 'lucide-react';

const COGNITIVE_STYLES = ['analytical', 'intuitive', 'systematic', 'creative'];

function getAreaLabel(event) {
  const element = event?.event_payload?.element?.trim();
  if (element) return element.slice(0, 36);

  const url = event?.event_payload?.url || event?.url;
  if (!url) return event?.event_type || 'unknown';

  try {
    const path = new URL(url).pathname || '/';
    return path.slice(0, 36);
  } catch {
    return String(url).slice(0, 36);
  }
}

export default function PsychographicInteractionHeatmap({ events = [], profiles = [], userIds = null }) {
  const [selectedArea, setSelectedArea] = useState(null);

  const data = useMemo(() => {
    const profileByUser = Object.fromEntries(profiles.map((profile) => [profile.user_id, profile]));
    const allowedUserIds = userIds ? new Set(userIds) : null;
    const areaMap = {};

    events
      .filter((event) => ['click', 'hover', 'form_focus', 'form_submit'].includes(event.event_type))
      .filter((event) => !allowedUserIds || allowedUserIds.has(event.user_id))
      .forEach((event) => {
        const profile = profileByUser[event.user_id];
        const style = profile?.cognitive_style;
        if (!COGNITIVE_STYLES.includes(style)) return;

        const area = getAreaLabel(event);
        if (!areaMap[area]) {
          areaMap[area] = {
            area,
            total: 0,
            byStyle: Object.fromEntries(COGNITIVE_STYLES.map((key) => [key, 0])),
            eventTypes: {},
          };
        }

        areaMap[area].total += 1;
        areaMap[area].byStyle[style] += 1;
        areaMap[area].eventTypes[event.event_type] = (areaMap[area].eventTypes[event.event_type] || 0) + 1;
      });

    return Object.values(areaMap)
      .map((item) => {
        const counts = Object.values(item.byStyle);
        const max = Math.max(...counts, 0);
        const min = Math.min(...counts, 0);
        const dominant = Object.entries(item.byStyle).sort((a, b) => b[1] - a[1])[0]?.[0] || 'analytical';
        return { ...item, divergence: max - min, dominant };
      })
      .sort((a, b) => (b.divergence - a.divergence) || (b.total - a.total))
      .slice(0, 10);
  }, [events, profiles, userIds]);

  const maxCellValue = Math.max(...data.flatMap((row) => Object.values(row.byStyle)), 1);
  const activeArea = data.find((row) => row.area === selectedArea) || data[0];

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-[#00d4ff]" />
          Cognitive Style Interaction Heatmap
        </CardTitle>
        <p className="text-sm text-[#a3a3a3]">
          Top interaction zones ranked by divergence across analytical, intuitive, systematic, and creative users.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[minmax(200px,1.5fr)_repeat(4,minmax(100px,1fr))] gap-2 mb-2 text-xs text-[#6b7280] uppercase tracking-wider">
              <div>Interaction Area</div>
              {COGNITIVE_STYLES.map((style) => <div key={style} className="text-center capitalize">{style}</div>)}
            </div>

            <div className="space-y-2">
              {data.map((row) => (
                <div key={row.area} className="grid grid-cols-[minmax(200px,1.5fr)_repeat(4,minmax(100px,1fr))] gap-2">
                  <button
                    onClick={() => setSelectedArea(row.area)}
                    className={`rounded-lg border px-3 py-3 text-left transition-colors ${selectedArea === row.area ? 'border-[#00d4ff]/50 bg-[#00d4ff]/10' : 'border-[#262626] bg-[#0f0f0f] hover:bg-[#1a1a1a]'}`}
                  >
                    <div className="text-sm font-medium text-white">{row.area}</div>
                    <div className="mt-1 text-xs text-[#6b7280]">{row.total} interactions • divergence {row.divergence}</div>
                  </button>

                  {COGNITIVE_STYLES.map((style) => {
                    const value = row.byStyle[style];
                    const opacity = Math.max(0.12, value / maxCellValue);
                    return (
                      <button
                        key={`${row.area}-${style}`}
                        onClick={() => setSelectedArea(row.area)}
                        className="rounded-lg border border-[#262626] px-2 py-3 text-center transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: `rgba(0, 212, 255, ${opacity * 0.7})` }}
                      >
                        <div className="text-lg font-semibold text-white">{value}</div>
                        <div className="text-[10px] text-[#d4f6ff]">interactions</div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {activeArea && (
          <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-[#00d4ff]" />
              <h4 className="text-sm font-semibold text-white">Selected zone: {activeArea.area}</h4>
              <Badge className="bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30">Dominant: {activeArea.dominant}</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6b7280] mb-2">Style split</p>
                <div className="space-y-2">
                  {COGNITIVE_STYLES.map((style) => (
                    <div key={style} className="flex items-center justify-between text-[#e5e5e5]">
                      <span className="capitalize">{style}</span>
                      <span>{activeArea.byStyle[style]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[#6b7280] mb-2">Interaction mix</p>
                <div className="space-y-2">
                  {Object.entries(activeArea.eventTypes).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-[#e5e5e5]">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}