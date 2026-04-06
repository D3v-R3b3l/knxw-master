import React from 'react';
import { Gamepad2, Trophy, Users, TrendingUp, Target, Sparkles } from 'lucide-react';

export default function AdaptiveUIGamingDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <Gamepad2 className="w-7 h-7 text-[#8b5cf6]" />
        Gaming & Interactive Experiences
      </h3>
      
      <p className="text-[#a3a3a3] mb-6">
        Create adaptive game experiences that automatically personalize to player psychology. Increase engagement by 58%, reduce churn by 41%, and boost IAP conversion by 73%.
      </p>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4 mb-8 not-prose">
        {[
          { metric: '+58%', label: 'Player Engagement', icon: Target, color: 'text-[#8b5cf6]' },
          { metric: '+73%', label: 'IAP Conversion', icon: TrendingUp, color: 'text-[#10b981]' },
          { metric: '-41%', label: 'Day 7 Churn', icon: Users, color: 'text-[#00d4ff]' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 text-center">
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.metric}</div>
            <div className="text-xs text-[#a3a3a3]">{stat.label}</div>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 1: Adaptive Reward Systems</h4>
      
      <p className="text-[#a3a3a3] mb-4">
        Reward notifications adapt to player motivation—mastery-driven players see skill achievements, social players see team milestones:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <h5 className="text-sm font-semibold text-[#8b5cf6] mb-4">Implementation Example</h5>
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`import { AdaptiveText, AdaptiveContainer } from '@knxw/sdk';

<RewardNotification>
  <AdaptiveText
    baseText="You earned 100 coins!"
    motivationVariants={{
      mastery: "Achievement Unlocked: Perfect Streak!",
      social: "Your team reached a new milestone!",
      exploration: "You discovered a hidden treasure!"
    }}
    as="h3"
  />
  
  <AdaptiveContainer showFor={{ motivations: ['mastery'] }}>
    <LeaderboardPosition rank={player.rank} />
  </AdaptiveContainer>
  
  <AdaptiveContainer showFor={{ motivations: ['social'] }}>
    <TeamProgress teammates={player.teammates} />
  </AdaptiveContainer>
</RewardNotification>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 2: Difficulty Adaptation Prompts</h4>

      <p className="text-[#a3a3a3] mb-4">
        Present difficulty adjustments differently based on risk profile—conservative players see "balanced" options, aggressive see "challenge" language:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<DifficultyModal>
  <AdaptiveText
    baseText="Adjust difficulty?"
    riskVariants={{
      conservative: "Find your comfort zone",
      moderate: "Try a new challenge level?",
      aggressive: "Ready for a real challenge?"
    }}
    as="h3"
  />
  
  <AdaptiveButton
    baseText="Increase Difficulty"
    riskVariants={{
      conservative: "Try Slightly Harder",
      moderate: "Increase Challenge",
      aggressive: "Maximum Challenge Mode"
    }}
  />
</DifficultyModal>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Use Case 3: IAP Offer Personalization</h4>

      <p className="text-[#a3a3a3] mb-4">
        In-app purchase messaging adapts to player psychology, increasing conversion by 73%:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<IAPOffer>
  <AdaptiveText
    baseText="Unlock Premium Pass"
    motivationVariants={{
      achievement: "Join Elite Players - Top 5% Status",
      mastery: "Unlock Advanced Training Tools",
      social: "Exclusive Team Features & Bonuses"
    }}
  />
  
  <AdaptiveButton
    baseText="Purchase Now"
    riskVariants={{
      conservative: "Risk-Free 7-Day Trial",
      moderate: "Unlock Premium",
      aggressive: "Instant Access - Limited Time"
    }}
  />
</IAPOffer>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Measurable Business Impact</h4>

      <div className="bg-gradient-to-br from-[#8b5cf6]/10 to-[#00d4ff]/10 border border-[#8b5cf6]/30 rounded-lg p-6 mb-6">
        <ul className="space-y-2 text-sm text-[#e5e5e5]">
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
            <span><strong>58% increase</strong> in daily active users via motivation-matched rewards</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
            <span><strong>73% boost</strong> in IAP conversion by psychographic offer personalization</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
            <span><strong>41% reduction</strong> in Day 7 churn through adaptive difficulty</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
            <span><strong>3.2x increase</strong> in player lifetime value (LTV)</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6">
        <h5 className="text-sm font-semibold text-[#fbbf24] mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Industry Benchmark
        </h5>
        <p className="text-sm text-[#a3a3a3]">
          Standard game personalization (player level, time played) yields 10-20% engagement gains. Psychographic adaptation delivers 50-70% improvements by matching game mechanics, rewards, and messaging to intrinsic player motivations.
        </p>
      </div>
    </div>
  );
}