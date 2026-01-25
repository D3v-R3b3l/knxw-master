import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDashboardStore } from './DashboardStore';

export default function ChurnPredictionPanel() {
  const { profiles, selectedAppId } = useDashboardStore();
  const [churnData, setChurnData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!profiles || profiles.length === 0) return;

    const analyzeChurn = async () => {
      setIsLoading(true);
      try {
        // Sample a few users for churn analysis
        const sampleSize = Math.min(5, profiles.length);
        const sampledProfiles = profiles.slice(0, sampleSize);

        const predictions = await Promise.all(
          sampledProfiles.map(async (profile) => {
            try {
              const response = await base44.functions.invoke('predictChurn', {
                user_id: profile.user_id,
                client_app_id: selectedAppId
              });
              return response?.data || { churn_risk: 'unknown', confidence: 0 };
            } catch (err) {
              return { churn_risk: 'unknown', confidence: 0 };
            }
          })
        );

        const riskCounts = { high: 0, medium: 0, low: 0, unknown: 0 };
        predictions.forEach(p => {
          riskCounts[p.churn_risk] = (riskCounts[p.churn_risk] || 0) + 1;
        });

        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

        setChurnData({
          riskCounts,
          totalAnalyzed: predictions.length,
          avgConfidence,
          highRiskPercentage: ((riskCounts.high / predictions.length) * 100).toFixed(1)
        });
      } catch (error) {
        console.error('Churn analysis error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeChurn();
  }, [profiles, selectedAppId]);

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Analyzing churn risk...</p>
        </CardContent>
      </Card>
    );
  }

  if (!churnData) {
    return (
      <Card className="bg-[#111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#ef4444]" />
            Churn Prediction
          </CardTitle>
          <CardDescription>No data available for churn analysis</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-[#ef4444]" />
          Churn Prediction
        </CardTitle>
        <CardDescription>AI-powered churn risk assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
              <span className="text-xs text-[#6b7280]">High Risk</span>
            </div>
            <p className="text-2xl font-bold text-white">{churnData.highRiskPercentage}%</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs text-[#6b7280]">Analyzed</span>
            </div>
            <p className="text-2xl font-bold text-white">{churnData.totalAnalyzed}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Risk Distribution</h4>
          {Object.entries(churnData.riskCounts).map(([risk, count]) => {
            const percentage = ((count / churnData.totalAnalyzed) * 100).toFixed(0);
            const color = risk === 'high' ? '#ef4444' : risk === 'medium' ? '#fbbf24' : '#10b981';
            
            return (
              <div key={risk}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#a3a3a3] capitalize">{risk}</span>
                  <span className="text-sm text-white font-medium">{count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <p className="text-xs text-[#6b7280] mb-1">Model Confidence</p>
          <p className="text-lg font-semibold text-white">{(churnData.avgConfidence * 100).toFixed(0)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}