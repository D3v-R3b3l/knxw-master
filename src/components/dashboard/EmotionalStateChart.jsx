
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Frown, Meh, Laugh, PartyPopper, Brain, HeartCrack, HelpCircle } from 'lucide-react';

// Configuration for emotional states, including icons and color themes
const EMOTION_CONFIG = {
  positive: {
    icon: Smile,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-900/20',
    barColor: 'bg-emerald-500'
  },
  excited: {
    icon: PartyPopper,
    color: 'text-amber-500',
    bgColor: 'bg-amber-900/20',
    barColor: 'bg-amber-500'
  },
  confident: {
    icon: Brain,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    barColor: 'bg-cyan-400'
  },
  neutral: {
    icon: Meh,
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    barColor: 'bg-gray-400'
  },
  anxious: {
    icon: HeartCrack,
    color: 'text-orange-500',
    bgColor: 'bg-orange-900/20',
    barColor: 'bg-orange-500'
  },
  negative: {
    icon: Frown,
    color: 'text-red-500',
    bgColor: 'bg-red-900/20',
    barColor: 'bg-red-500'
  },
  uncertain: {
    icon: HelpCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-900/20',
    barColor: 'bg-purple-500'
  },
  // Default fallback for any unconfigured moods
  default: {
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-900/20',
    barColor: 'bg-pink-500'
  }
};

export default function EmotionalStateChart({ profiles }) {
  // Derive emotionalDistribution from the profiles prop
  const emotionalDistribution = React.useMemo(() => {
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return [];
    }

    const moodCounts = {};
    let validProfiles = 0;

    profiles.forEach(profile => {
      if (profile && profile.emotional_state && profile.emotional_state.mood) {
        const mood = profile.emotional_state.mood;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        validProfiles++;
      }
    });

    if (validProfiles === 0) {
      return [];
    }

    // Define a preferred order for displaying moods
    const orderedMoods = ['positive', 'excited', 'confident', 'neutral', 'anxious', 'negative', 'uncertain'];

    const chartData = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood: mood,
        count: count,
        percentage: ((count / validProfiles) * 100).toFixed(1)
      }))
      .sort((a, b) => {
        const indexA = orderedMoods.indexOf(a.mood);
        const indexB = orderedMoods.indexOf(b.mood);

        // Handle moods not explicitly in orderedMoods, pushing them to the end
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

    return chartData;
  }, [profiles]); // Re-calculate only when profiles change

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#ec4899]" />
          Emotional States
        </CardTitle>
      </CardHeader>
      <CardContent>
        {emotionalDistribution.length === 0 ? (
          <div className="text-center text-[#a3a3a3] py-8">
            <Heart className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4 opacity-50" />
            <p>No emotional state data available</p>
            <p className="text-sm mt-2">Check if profiles are loaded or have emotional states.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emotionalDistribution.map((item) => {
              const config = EMOTION_CONFIG[item.mood] || EMOTION_CONFIG.default;
              const Icon = config.icon; // Get the icon component from config
              return (
                <div key={item.mood} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className="text-white capitalize">{item.mood}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${config.barColor}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <Badge className={`${config.bgColor} ${config.color} border-none font-semibold w-14 justify-center`}>
                      {item.count}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
