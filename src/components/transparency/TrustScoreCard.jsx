import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Eye, 
  CheckCircle, AlertCircle, Info
} from 'lucide-react';

export default function TrustScoreCard({ dataProfile, psychographicProfile }) {
  // Calculate trust score based on various factors
  const calculateTrustScore = () => {
    let score = 0;
    let factors = [];

    // Consent transparency (25 points)
    const consentStatus = dataProfile?.consent_status || {};
    const consentFields = Object.keys(consentStatus).length;
    if (consentFields > 0) {
      score += 25;
      factors.push({ label: 'Consent configured', points: 25, positive: true });
    } else {
      factors.push({ label: 'Consent not configured', points: 0, positive: false });
    }

    // Data provenance (25 points)
    const hasProvenance = psychographicProfile?.provenance && Object.keys(psychographicProfile.provenance).length > 0;
    if (hasProvenance) {
      score += 25;
      factors.push({ label: 'Data sources tracked', points: 25, positive: true });
    } else {
      factors.push({ label: 'Data sources not tracked', points: 0, positive: false });
    }

    // Profile freshness (25 points)
    const lastAnalyzed = psychographicProfile?.last_analyzed;
    if (lastAnalyzed) {
      const daysSinceAnalysis = Math.floor((Date.now() - new Date(lastAnalyzed).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceAnalysis < 7) {
        score += 25;
        factors.push({ label: 'Profile recently updated', points: 25, positive: true });
      } else if (daysSinceAnalysis < 30) {
        score += 15;
        factors.push({ label: 'Profile moderately fresh', points: 15, positive: true });
      } else {
        factors.push({ label: 'Profile may be stale', points: 0, positive: false });
      }
    }

    // Confidence scores (25 points)
    const avgConfidence = [
      psychographicProfile?.motivation_confidence_score,
      psychographicProfile?.personality_confidence_score,
      psychographicProfile?.emotional_state_confidence_score
    ].filter(Boolean).reduce((a, b) => a + b, 0) / 3;

    if (avgConfidence > 0.7) {
      score += 25;
      factors.push({ label: 'High confidence scores', points: 25, positive: true });
    } else if (avgConfidence > 0.5) {
      score += 15;
      factors.push({ label: 'Moderate confidence scores', points: 15, positive: true });
    } else {
      factors.push({ label: 'Low confidence scores', points: 0, positive: false });
    }

    return { score, factors };
  };

  const { score, factors } = calculateTrustScore();

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreIcon = () => {
    if (score >= 80) return ShieldCheck;
    if (score >= 60) return Shield;
    return ShieldAlert;
  };

  const ScoreIcon = getScoreIcon();

  return (
    <Card className="bg-gradient-to-br from-[#111] to-[#1a1a1a] border-[#262626] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00d4ff]" />
              Data Trust Score
            </h3>
            <p className="text-sm text-[#a3a3a3]">How transparent and controlled is your data</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>{score}</div>
            <Badge className={`${
              score >= 80 ? 'bg-green-500/20 text-green-400' :
              score >= 60 ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {getScoreLabel()}
            </Badge>
          </div>
        </div>

        <Progress value={score} className="h-2 mb-6" />

        <div className="space-y-3">
          {factors.map((factor, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {factor.positive ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#6b7280]" />
                )}
                <span className={`text-sm ${factor.positive ? 'text-white' : 'text-[#6b7280]'}`}>
                  {factor.label}
                </span>
              </div>
              <span className={`text-sm font-medium ${factor.positive ? 'text-green-400' : 'text-[#6b7280]'}`}>
                +{factor.points}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-[#262626]/50 border border-[#333]">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#a3a3a3]">
              Your trust score reflects how transparent and controllable your data is. 
              A higher score means better visibility into how your data is used.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}