
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// Removed server-only import to prevent runtime issues in browser
// import { flagEnabled, FeatureFlagNames } from "@/functions/lib/flags";

/**
 * Smart motivation display that works with:
 * - props.motivations (array of {label, weight?})
 * - props.profile (v2: profile.motivation_stack_v2; v1: motivation_labels or motivation_stack)
 */
export default function MotivationDisplay({ profile, motivations, maxItems = 5, showWeights = false, compact = false }) {
  // Build a normalized motivations array
  const normalized = React.useMemo(() => {
    // 1) If motivations prop provided, normalize and slice
    if (Array.isArray(motivations) && motivations.length > 0) {
      return motivations
        .map(m => (typeof m === 'string' ? { label: m, weight: null } : { label: m.label, weight: m.weight ?? null }))
        .slice(0, maxItems);
    }

    // 2) Use profile if provided
    if (profile) {
      if (Array.isArray(profile.motivation_stack_v2) && profile.motivation_stack_v2.length > 0) {
        return profile.motivation_stack_v2
          .slice(0, maxItems)
          .map(m => ({ label: m.label, weight: m.weight ?? null }));
      }
      if (Array.isArray(profile.motivation_labels) && profile.motivation_labels.length > 0) {
        return profile.motivation_labels
          .slice(0, maxItems)
          .map(label => ({ label, weight: null }));
      }
      if (Array.isArray(profile.motivation_stack) && profile.motivation_stack.length > 0) {
        return profile.motivation_stack
          .slice(0, maxItems)
          .map(label => ({ label, weight: null }));
      }
    }

    return [];
  }, [profile, motivations, maxItems]);

  if (!normalized || normalized.length === 0) {
    return <div className="text-sm text-[#a3a3a3]">No motivations identified</div>;
  }

  const hasWeights = showWeights && normalized.some(m => typeof m.weight === 'number');

  if (hasWeights) {
    return (
      <div className="space-y-3">
        {normalized.map((motivation, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium text-white capitalize ${compact ? 'text-xs' : ''}`}>
                {motivation.label}
              </span>
              {typeof motivation.weight === 'number' && (
                <span className="text-xs text-[#a3a3a3]">
                  {Math.round(motivation.weight * 100)}%
                </span>
              )}
            </div>
            {typeof motivation.weight === 'number' && (
              <Progress value={motivation.weight * 100} className={compact ? "h-1" : "h-1.5"} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {normalized.map((motivation, index) => (
        <Badge
          key={index}
          variant="outline"
          className={`bg-[#1a1a1a] border-[#333333] text-white capitalize ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
        >
          {motivation.label}
        </Badge>
      ))}
    </div>
  );
}
