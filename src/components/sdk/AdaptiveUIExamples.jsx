import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Sparkles, Layout, Type } from 'lucide-react';

export default function AdaptiveUIExamples() {
  const examples = [
    {
      title: 'Adaptive Button',
      icon: Layout,
      code: `<AdaptiveButton
  baseText="Get Started"
  motivationVariants={{
    achievement: "Start Winning Now",
    growth: "Begin Learning",
    autonomy: "Explore Freely"
  }}
  riskVariants={{
    conservative: "Try Free",
    aggressive: "Claim Now"
  }}
/>`
    },
    {
      title: 'Adaptive Text',
      icon: Type,
      code: `<AdaptiveText
  baseText="Welcome!"
  motivationVariants={{
    achievement: "Ready to excel?",
    belonging: "Join our community"
  }}
  moodVariants={{
    confident: "You've got this!",
    anxious: "We're here for you"
  }}
/>`
    },
    {
      title: 'Conditional Content',
      icon: Code,
      code: `<AdaptiveContainer
  showFor={{
    motivations: ['achievement'],
    riskProfile: 'aggressive'
  }}
>
  <PremiumOffer />
</AdaptiveContainer>`
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {examples.map((example, i) => (
        <Card key={i} className="bg-[#0a0a0a] border-white/10 hover:border-cyan-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <example.icon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">{example.title}</h3>
            </div>
            <pre className="text-xs text-gray-400 bg-black/50 rounded p-3 overflow-x-auto border border-white/5">
              {example.code}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}