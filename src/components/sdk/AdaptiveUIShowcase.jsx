import React, { useState } from 'react';
import { PsychographicProvider, AdaptiveButton, AdaptiveText, AdaptiveContainer, usePsychographic } from './KnxwSDK';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Code, CheckCircle2 } from 'lucide-react';

// Demo component showing profile info
function ProfileIndicator() {
  const { profile, loading } = usePsychographic();

  if (loading) return <div className="text-sm text-gray-500">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
        {profile.risk_profile} risk
      </Badge>
      <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400">
        {profile.cognitive_style}
      </Badge>
      {profile.motivation_labels?.slice(0, 2).map((m, i) => (
        <Badge key={i} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
          {m}
        </Badge>
      ))}
    </div>
  );
}

// Example adaptive components
function AdaptiveHeroExample() {
  return (
    <div className="text-center p-8 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-xl border border-white/10">
      <AdaptiveText
        baseText="Welcome to knXw"
        motivationVariants={{
          achievement: "Unlock Peak Performance with knXw",
          autonomy: "Take Control with knXw",
          growth: "Grow Faster with knXw",
          recognition: "Stand Out with knXw"
        }}
        className="text-3xl font-bold text-white mb-4 block"
        as="h2"
      />
      
      <AdaptiveText
        baseText="Understand your users better"
        moodVariants={{
          confident: "You're ready to transform your user experience",
          anxious: "We'll guide you every step of the way",
          excited: "Let's build something amazing together"
        }}
        className="text-lg text-gray-400 mb-6 block"
        as="p"
      />

      <AdaptiveButton
        baseText="Get Started"
        motivationVariants={{
          achievement: "Start Winning Now →",
          autonomy: "Explore on Your Terms →",
          growth: "Begin Your Journey →",
          recognition: "Make Your Mark →"
        }}
        riskVariants={{
          conservative: "Try Free Forever",
          moderate: "Get Started",
          aggressive: "Start Building Now"
        }}
        className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors"
      />
    </div>
  );
}

function AdaptiveCTAExample() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Primary Action</CardTitle>
        </CardHeader>
        <CardContent>
          <AdaptiveButton
            baseText="Sign Up"
            motivationVariants={{
              achievement: "Join the Winners",
              autonomy: "Take Control Now",
              growth: "Start Learning",
              security: "Get Protected Today"
            }}
            className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          />
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Risk-Based Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          <AdaptiveText
            baseText="Try our platform"
            riskVariants={{
              conservative: "100% risk-free trial. Cancel anytime, no questions asked.",
              moderate: "Free trial available. Upgrade when ready.",
              aggressive: "Limited spots. Claim yours now."
            }}
            className="text-gray-400 text-sm"
            as="p"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ConditionalContentExample() {
  return (
    <div className="space-y-4">
      <AdaptiveContainer
        showFor={{ motivations: ['achievement', 'recognition'] }}
        fallback={<div className="text-gray-500 text-sm">Content hidden for your profile</div>}
      >
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-2">Achievement Unlocked!</h4>
                <p className="text-gray-400 text-sm">You're in the top 10% of users. Keep pushing!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdaptiveContainer>

      <AdaptiveContainer
        showFor={{ cognitiveStyle: 'analytical' }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-2">Technical Deep Dive</h4>
                <p className="text-gray-400 text-sm">Explore our API documentation and architecture details.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdaptiveContainer>
    </div>
  );
}

export default function AdaptiveUIShowcase() {
  const [selectedProfile, setSelectedProfile] = useState('achievement');

  const mockProfiles = {
    achievement: {
      motivation_labels: ['achievement', 'recognition'],
      risk_profile: 'aggressive',
      cognitive_style: 'analytical',
      emotional_state: { mood: 'confident', confidence_score: 0.85 },
      personality_traits: { openness: 0.75, conscientiousness: 0.82, extraversion: 0.65 }
    },
    autonomy: {
      motivation_labels: ['autonomy', 'growth'],
      risk_profile: 'moderate',
      cognitive_style: 'intuitive',
      emotional_state: { mood: 'excited', confidence_score: 0.72 },
      personality_traits: { openness: 0.88, conscientiousness: 0.55, extraversion: 0.45 }
    },
    security: {
      motivation_labels: ['security', 'belonging'],
      risk_profile: 'conservative',
      cognitive_style: 'systematic',
      emotional_state: { mood: 'anxious', confidence_score: 0.58 },
      personality_traits: { openness: 0.42, conscientiousness: 0.78, extraversion: 0.35 }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h2 className="text-3xl font-bold text-white">Adaptive UI SDK</h2>
        </div>
        <p className="text-gray-400 mb-6">UI components that automatically adapt to user psychology</p>
        
        {/* Profile Selector */}
        <div className="flex justify-center gap-3 mb-8">
          <span className="text-sm text-gray-500 self-center">Demo Profile:</span>
          {Object.keys(mockProfiles).map((profile) => (
            <Button
              key={profile}
              onClick={() => setSelectedProfile(profile)}
              variant={selectedProfile === profile ? "default" : "outline"}
              size="sm"
              className={selectedProfile === profile ? "bg-cyan-500 text-black" : ""}
            >
              {profile.charAt(0).toUpperCase() + profile.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <PsychographicProvider mockMode={true} mockProfile={mockProfiles[selectedProfile]}>
        <div className="space-y-8">
          <ProfileIndicator />
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              Adaptive Hero Section
            </h3>
            <AdaptiveHeroExample />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              Adaptive CTAs
            </h3>
            <AdaptiveCTAExample />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              Conditional Content
            </h3>
            <ConditionalContentExample />
          </div>
        </div>
      </PsychographicProvider>

      {/* Code Example */}
      <Card className="mt-8 bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5" />
            Code Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-gray-400 overflow-x-auto">
{`import { PsychographicProvider, AdaptiveButton } from '@knxw/sdk';

function App() {
  return (
    <PsychographicProvider userId="user_123">
      <AdaptiveButton
        baseText="Get Started"
        motivationVariants={{
          achievement: "Start Winning Now →",
          autonomy: "Explore on Your Terms →",
          growth: "Begin Your Journey →"
        }}
        riskVariants={{
          conservative: "Try Free Forever",
          moderate: "Get Started",
          aggressive: "Start Building Now"
        }}
      />
    </PsychographicProvider>
  );
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}