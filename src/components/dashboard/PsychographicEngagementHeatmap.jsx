import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { Brain, Loader2, Eye, MousePointer, Clock } from 'lucide-react';
import { useDashboardStore } from "./DashboardStore";

/**
 * Real-Time Psychographic Engagement Heatmap
 * Visualizes where users with different psychological profiles engage most
 */
export default function PsychographicEngagementHeatmap() {
  const { profiles, events, userIdsInScope, isLoading } = useDashboardStore();
  const [heatmapData, setHeatmapData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (profiles.length === 0 || events.length === 0) {
      setHeatmapData([]);
      return;
    }

    generateHeatmapData();
  }, [profiles, events, userIdsInScope, activeFilter]);

  const generateHeatmapData = () => {
    const scopedProfiles = userIdsInScope && userIdsInScope.size ?
    profiles.filter((p) => userIdsInScope.has(p.user_id)) :
    profiles;

    const scopedEvents = userIdsInScope && userIdsInScope.size ?
    events.filter((e) => userIdsInScope.has(e.user_id)) :
    events;

    // Group events by page/element and psychographic profile
    const engagementMap = new Map();

    scopedEvents.forEach((event) => {
      const profile = scopedProfiles.find((p) => p.user_id === event.user_id);
      if (!profile) return;

      const location = event.event_payload?.url || event.event_payload?.element || 'unknown';
      const cognitiveStyle = profile.cognitive_style || 'unknown';
      const riskProfile = profile.risk_profile || 'unknown';
      const primaryMotivation = profile.motivation_stack_v2?.[0]?.label || 'unknown';

      let filterKey = 'all';
      switch (activeFilter) {
        case 'cognitive':
          filterKey = cognitiveStyle;
          break;
        case 'risk':
          filterKey = riskProfile;
          break;
        case 'motivation':
          filterKey = primaryMotivation;
          break;
        default:
          filterKey = `${cognitiveStyle}_${riskProfile}`;
      }

      const key = `${location}_${filterKey}`;

      if (!engagementMap.has(key)) {
        engagementMap.set(key, {
          location,
          profile_segment: filterKey,
          cognitive_style: cognitiveStyle,
          risk_profile: riskProfile,
          motivation: primaryMotivation,
          engagement_count: 0,
          avg_duration: 0,
          unique_users: new Set(),
          event_types: {}
        });
      }

      const segment = engagementMap.get(key);
      segment.engagement_count++;
      segment.unique_users.add(event.user_id);

      // Track event types
      const eventType = event.event_type;
      segment.event_types[eventType] = (segment.event_types[eventType] || 0) + 1;

      // Calculate average duration for time-based events
      if (event.event_payload?.duration) {
        const currentAvg = segment.avg_duration;
        const count = segment.engagement_count;
        segment.avg_duration = (currentAvg * (count - 1) + event.event_payload.duration) / count;
      }
    });

    // Convert to array and calculate engagement intensity
    const heatmapArray = Array.from(engagementMap.values()).
    map((segment) => ({
      ...segment,
      unique_users_count: segment.unique_users.size,
      unique_users: undefined, // Remove Set for serialization
      engagement_intensity: segment.engagement_count / Math.max(scopedEvents.length, 1),
      primary_event_type: Object.entries(segment.event_types).
      sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
    })).
    sort((a, b) => b.engagement_count - a.engagement_count).
    slice(0, 20);

    setHeatmapData(heatmapArray);
  };

  const getIntensityColor = (intensity) => {
    if (intensity > 0.05) return 'bg-[#ef4444]/30 border-[#ef4444]/50 text-[#ef4444]';
    if (intensity > 0.03) return 'bg-[#fbbf24]/30 border-[#fbbf24]/50 text-[#fbbf24]';
    if (intensity > 0.01) return 'bg-[#00d4ff]/30 border-[#00d4ff]/50 text-[#00d4ff]';
    return 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]';
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'page_view':return Eye;
      case 'click':return MousePointer;
      case 'time_on_page':return Clock;
      default:return Brain;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-4">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00d4ff]" />
            Psychographic Engagement Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-[#00d4ff] animate-spin" />
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00d4ff]" />
            Psychographic Engagement Heatmap
          </CardTitle>
        </div>
        <p className="text-sm text-[#a3a3a3]">
          Real-time visualization of psychological profile engagement across your interface
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['all', 'cognitive', 'risk', 'motivation'].map((filter) =>
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
            activeFilter === filter ?
            'bg-[#00d4ff] text-[#0a0a0a]' :
            'bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#262626] hover:text-white'}`
            }>

              {filter === 'all' ? 'All Segments' : `By ${filter}`}
            </button>
          )}
        </div>

        {heatmapData.length === 0 ?
        <div className="flex items-center justify-center h-48 text-[#a3a3a3]">
            <div className="text-center">
              <Brain className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4 opacity-50" />
              <p>No engagement data available</p>
              <p className="text-sm mt-2">Data will appear as users interact with your application</p>
            </div>
          </div> :

        <div className="space-y-2">
            {heatmapData.map((segment, index) => {
            const EventIcon = getEventIcon(segment.primary_event_type);

            return (
              <div
                key={`${segment.location}_${segment.profile_segment}_${index}`}
                className={`border rounded-lg p-3 transition-all duration-200 hover:scale-102 ${getIntensityColor(segment.engagement_intensity)}`}>

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <EventIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-semibold truncate">
                          {segment.location}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <Badge variant="outline" className="text-xs capitalize bg-[#0a0a0a]/50">
                          {segment.cognitive_style}
                        </Badge>
                        <Badge variant="outline" className="bg-[#0a0a0a]/50 text-amber-200 px-2.5 py-0.5 text-xs font-semibold capitalize rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          {segment.risk_profile}
                        </Badge>
                        {segment.motivation !== 'unknown' &&
                      <Badge variant="outline" className="text-xs capitalize bg-[#0a0a0a]/50">
                            {segment.motivation}
                          </Badge>
                      }
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-bold">
                        {segment.engagement_count}
                      </div>
                      <div className="text-xs opacity-75">
                        {segment.unique_users_count} users
                      </div>
                    </div>
                  </div>

                  {segment.avg_duration > 0 &&
                <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-current/20">
                      <Clock className="w-3 h-3" />
                      <span>Avg {Math.round(segment.avg_duration)}s dwell time</span>
                    </div>
                }
                </div>);

          })}
          </div>
        }

        <div className="mt-4 pt-4 border-t border-[#262626]">
          <p className="text-xs text-[#6b7280] italic">
            Hotter colors indicate higher engagement intensity from specific psychographic segments. 
            Use this data to optimize content placement and messaging for different user personalities.
          </p>
        </div>
      </CardContent>
    </Card>);

}