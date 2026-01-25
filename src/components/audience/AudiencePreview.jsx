import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AudiencePreview({ filters, clientAppId }) {
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setPreviewData(null);
      return;
    }

    const fetchPreview = async () => {
      setIsLoading(true);
      try {
        // Fetch profiles that match the filters
        const allProfiles = await base44.entities.UserPsychographicProfile.list();
        
        let matchedProfiles = allProfiles || [];

        // Apply psychographic filters
        if (filters.psychographic) {
          if (filters.psychographic.motivation_labels?.length > 0) {
            matchedProfiles = matchedProfiles.filter(p =>
              p.motivation_labels?.some(m => filters.psychographic.motivation_labels.includes(m))
            );
          }
          if (filters.psychographic.risk_profile?.length > 0) {
            matchedProfiles = matchedProfiles.filter(p =>
              filters.psychographic.risk_profile.includes(p.risk_profile)
            );
          }
          if (filters.psychographic.cognitive_style?.length > 0) {
            matchedProfiles = matchedProfiles.filter(p =>
              filters.psychographic.cognitive_style.includes(p.cognitive_style)
            );
          }
        }

        // Calculate insights
        const totalCount = matchedProfiles.length;
        const avgConfidence = matchedProfiles.reduce((sum, p) => 
          sum + (p.motivation_confidence_score || 0), 0) / (totalCount || 1);

        setPreviewData({
          count: totalCount,
          avgConfidence: avgConfidence.toFixed(2),
          topMotivations: getTopMotivations(matchedProfiles),
          riskDistribution: getRiskDistribution(matchedProfiles)
        });
      } catch (error) {
        console.error('Preview error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [filters, clientAppId]);

  const getTopMotivations = (profiles) => {
    const motivationCounts = {};
    profiles.forEach(p => {
      p.motivation_labels?.forEach(m => {
        motivationCounts[m] = (motivationCounts[m] || 0) + 1;
      });
    });
    return Object.entries(motivationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));
  };

  const getRiskDistribution = (profiles) => {
    const dist = { conservative: 0, moderate: 0, aggressive: 0 };
    profiles.forEach(p => {
      if (p.risk_profile) {
        dist[p.risk_profile] = (dist[p.risk_profile] || 0) + 1;
      }
    });
    return dist;
  };

  if (!previewData && !isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Configure filters to preview your audience</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading preview...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Audience Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs text-[#6b7280]">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{previewData.count.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#10b981]" />
              <span className="text-xs text-[#6b7280]">Avg Confidence</span>
            </div>
            <p className="text-2xl font-bold text-white">{(previewData.avgConfidence * 100).toFixed(0)}%</p>
          </div>
        </div>

        {previewData.topMotivations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Top Motivations</h4>
            <div className="space-y-2">
              {previewData.topMotivations.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#a3a3a3]">{m.label}</span>
                  <span className="text-sm text-white font-medium">{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Risk Distribution</h4>
          <div className="space-y-2">
            {Object.entries(previewData.riskDistribution).map(([risk, count]) => (
              <div key={risk} className="flex items-center justify-between">
                <span className="text-sm text-[#a3a3a3] capitalize">{risk}</span>
                <span className="text-sm text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}