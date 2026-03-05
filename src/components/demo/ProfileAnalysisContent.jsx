import React from 'react';
import { Brain, Target, TrendingUp, Zap, Sparkles, Eye, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const normalizeScore = (val) => {
  if (val == null) return 0;
  if (val <= 1) return Math.round(val * 100);
  if (val <= 10) return Math.round(val * 10);
  return Math.min(Math.round(val), 100);
};

export default function ProfileAnalysisContent({ currentProfile, profileExpanded }) {
  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Brain className="w-16 h-16 text-[#262626] mb-4" />
        <p className="text-[#6b7280] text-sm">
          Start chatting to see your psychographic profile build in real-time
        </p>
      </div>
    );
  }

  if (!profileExpanded) return null;

  return (
    <div className="space-y-6">
      {/* Overall Confidence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#a3a3a3] font-medium">OVERALL CONFIDENCE</span>
          <span className="text-sm font-bold" style={{ color: 'var(--demo-accent)' }}>
            {normalizeScore(currentProfile.overall_confidence)}%
          </span>
        </div>
        <Progress value={normalizeScore(currentProfile.overall_confidence)} className="h-2 bg-[#262626]" />
      </div>

      {/* Cognitive Style */}
      {currentProfile.cognitive_style?.style && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: 'var(--demo-accent)' }} />
            Cognitive Style
          </h4>
          <Badge style={{ background: 'var(--demo-accent-muted)', color: 'var(--demo-accent)', border: '1px solid var(--demo-accent-border)' }}>
            {currentProfile.cognitive_style.style}
          </Badge>
          <div className="mt-2">
            <Progress value={normalizeScore(currentProfile.cognitive_style.confidence)} className="h-1.5 bg-[#262626]" />
            <p className="text-xs text-[#6b7280] mt-1">{normalizeScore(currentProfile.cognitive_style.confidence)}% confidence</p>
          </div>
        </div>
      )}

      {/* Risk Profile */}
      {currentProfile.risk_profile?.profile && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
            Risk Profile
          </h4>
          <Badge style={{ background: 'var(--demo-accent-muted)', color: 'var(--demo-accent)', border: '1px solid var(--demo-accent-border)' }}>
            {currentProfile.risk_profile.profile}
          </Badge>
          <div className="mt-2">
            <Progress value={normalizeScore(currentProfile.risk_profile.confidence)} className="h-1.5 bg-[#262626]" />
            <p className="text-xs text-[#6b7280] mt-1">{normalizeScore(currentProfile.risk_profile.confidence)}% confidence</p>
          </div>
        </div>
      )}

      {/* Motivations */}
      {currentProfile.motivation_stack?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#fbbf24]" />
            Top Motivations
          </h4>
          <div className="space-y-3">
            {currentProfile.motivation_stack.slice(0, 3).map((motive, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#e5e5e5] capitalize">{motive.label}</span>
                  <span className="text-xs text-[#a3a3a3]">{normalizeScore(motive.weight)}%</span>
                </div>
                <Progress value={normalizeScore(motive.weight)} className="h-1.5 bg-[#262626]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personality Traits */}
      {currentProfile.personality_traits && Object.keys(currentProfile.personality_traits).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#10b981]" />
            Personality (Big Five)
          </h4>
          <div className="space-y-2">
            {Object.entries(currentProfile.personality_traits).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#a3a3a3] capitalize">{trait}</span>
                  <span className="text-xs text-white">{normalizeScore(value)}%</span>
                </div>
                <Progress value={normalizeScore(value)} className="h-1 bg-[#262626]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remembered Preferences */}
      {currentProfile.user_preferences && (
        currentProfile.user_preferences.colors_disliked?.length > 0 ||
        currentProfile.user_preferences.colors_preferred?.length > 0 ||
        currentProfile.user_preferences.ui_style_preferences?.length > 0
      ) && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#ec4899]" />
            Remembered Preferences
          </h4>
          <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--demo-surface2)', border: '1px solid var(--demo-border)', borderRadius: 'var(--demo-radius)' }}>
            {currentProfile.user_preferences.industry_context && (
              <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Industry:</strong> {currentProfile.user_preferences.industry_context}</p>
            )}
            {currentProfile.user_preferences.colors_preferred?.length > 0 && (
              <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Likes Colors:</strong> {currentProfile.user_preferences.colors_preferred.join(', ')}</p>
            )}
            {currentProfile.user_preferences.colors_disliked?.length > 0 && (
              <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Avoids Colors:</strong> {currentProfile.user_preferences.colors_disliked.join(', ')}</p>
            )}
            {currentProfile.user_preferences.ui_style_preferences?.length > 0 && (
              <p className="text-xs text-[#a3a3a3]"><strong className="text-white">Styles:</strong> {currentProfile.user_preferences.ui_style_preferences.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      {currentProfile.reasoning?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
            AI Reasoning
          </h4>
          <div className="space-y-2">
            {currentProfile.reasoning.slice(0, 3).map((reason, idx) => (
              <div key={idx} className="rounded-lg p-3" style={{ background: 'var(--demo-surface2)', border: '1px solid var(--demo-border)', borderRadius: 'var(--demo-radius)' }}>
                <p className="text-xs font-semibold mb-1 capitalize" style={{ color: 'var(--demo-accent)' }}>{reason.trait}</p>
                <p className="text-xs text-[#a3a3a3] leading-relaxed">{reason.inference}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}