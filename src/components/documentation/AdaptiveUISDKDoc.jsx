import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Code, Layers, Zap } from 'lucide-react';

export default function AdaptiveUISDKDoc() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Adaptive UI SDK</h1>
            <p className="text-gray-400">Build interfaces that automatically adapt to user psychology</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            React
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400">
            Frontend SDK
          </Badge>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p className="text-gray-400 mb-6">
          The Adaptive UI SDK enables developers to build React components that automatically adapt their content, 
          styling, and behavior based on real-time psychographic data. Create personalized experiences that resonate 
          with each user's unique psychology—motivations, risk profile, cognitive style, and emotional state.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Installation</h2>
        <Card className="bg-[#0a0a0a] border-white/10">
          <CardContent className="p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`// Import from your components
import { 
  PsychographicProvider, 
  AdaptiveButton, 
  AdaptiveText,
  AdaptiveContainer,
  usePsychographic 
} from '@/components/sdk/KnxwSDK';`}
            </pre>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Quick Start</h2>
        <p className="text-gray-400 mb-4">
          Wrap your application with <code className="text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">PsychographicProvider</code> to enable adaptive components:
        </p>

        <Card className="bg-[#0a0a0a] border-white/10 mb-6">
          <CardContent className="p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`import { PsychographicProvider, AdaptiveButton } from '@/components/sdk/KnxwSDK';

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
        className="px-6 py-3 bg-cyan-500 text-black rounded-lg"
      />
    </PsychographicProvider>
  );
}`}
            </pre>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Components</h2>

        <div className="space-y-6">
          {/* PsychographicProvider */}
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">PsychographicProvider</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Context provider that fetches and shares psychographic data with all child components.
              </p>
              
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Props</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">
                    <code className="text-cyan-400">userId</code> <span className="text-gray-500">(string)</span> - User ID to fetch profile for
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">mockMode</code> <span className="text-gray-500">(boolean)</span> - Use mock data for demos/testing
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">mockProfile</code> <span className="text-gray-500">(object)</span> - Custom mock profile data
                  </li>
                </ul>
              </div>

              <div className="mt-4 bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Example</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`<PsychographicProvider 
  userId={currentUser.id}
  mockMode={false}
>
  {children}
</PsychographicProvider>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* AdaptiveButton */}
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">AdaptiveButton</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Button component that adapts text based on user motivations and risk profile.
              </p>
              
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Props</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">
                    <code className="text-cyan-400">baseText</code> <span className="text-gray-500">(string)</span> - Default button text
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">motivationVariants</code> <span className="text-gray-500">(object)</span> - Text variants by motivation
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">riskVariants</code> <span className="text-gray-500">(object)</span> - Text variants by risk profile
                  </li>
                </ul>
              </div>

              <div className="mt-4 bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Example</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`<AdaptiveButton
  baseText="Sign Up"
  motivationVariants={{
    achievement: "Join the Winners",
    autonomy: "Take Control Now",
    growth: "Start Learning"
  }}
  riskVariants={{
    conservative: "Try Free Forever",
    moderate: "Get Started",
    aggressive: "Claim Your Spot"
  }}
  onClick={handleSignup}
  className="px-8 py-3 bg-white text-black rounded-lg"
/>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* AdaptiveText */}
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">AdaptiveText</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Text component that changes content based on user motivations and emotional state.
              </p>
              
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Props</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">
                    <code className="text-cyan-400">baseText</code> <span className="text-gray-500">(string)</span> - Default text
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">motivationVariants</code> <span className="text-gray-500">(object)</span> - Text variants by motivation
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">moodVariants</code> <span className="text-gray-500">(object)</span> - Text variants by mood
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">as</code> <span className="text-gray-500">(string)</span> - HTML element (default: span)
                  </li>
                </ul>
              </div>

              <div className="mt-4 bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Example</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`<AdaptiveText
  baseText="Welcome back!"
  motivationVariants={{
    achievement: "Ready to crush your goals?",
    growth: "Let's learn something new today"
  }}
  moodVariants={{
    confident: "You're on fire today!",
    anxious: "We're here to support you"
  }}
  as="h2"
  className="text-2xl font-bold"
/>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* AdaptiveContainer */}
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-semibold text-white">AdaptiveContainer</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Conditional container that shows/hides content based on psychographic criteria.
              </p>
              
              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Props</h4>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300">
                    <code className="text-cyan-400">showFor</code> <span className="text-gray-500">(object)</span> - Criteria to show content
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">hideFor</code> <span className="text-gray-500">(object)</span> - Criteria to hide content
                  </li>
                  <li className="text-gray-300">
                    <code className="text-cyan-400">fallback</code> <span className="text-gray-500">(ReactNode)</span> - Content to show when hidden
                  </li>
                </ul>
              </div>

              <div className="mt-4 bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-3">Example</h4>
                <pre className="text-xs text-gray-300 overflow-x-auto">
{`<AdaptiveContainer
  showFor={{
    motivations: ['achievement', 'recognition'],
    riskProfile: 'aggressive'
  }}
  fallback={<p>Content hidden</p>}
>
  <div className="premium-offer">
    <h3>Exclusive Offer</h3>
    <p>Limited spots available!</p>
  </div>
</AdaptiveContainer>`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-8">usePsychographic Hook</h2>
        <p className="text-gray-400 mb-4">
          Access psychographic data directly in any component for custom adaptive logic:
        </p>

        <Card className="bg-[#0a0a0a] border-white/10 mb-6">
          <CardContent className="p-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`import { usePsychographic } from '@/components/sdk/KnxwSDK';

function CustomAdaptiveComponent() {
  const { 
    profile, 
    loading, 
    hasMotivation,
    getRiskProfile,
    getMood 
  } = usePsychographic();

  if (loading) return <div>Loading...</div>;

  const isAchievementDriven = hasMotivation('achievement');
  const risk = getRiskProfile();
  const mood = getMood();

  return (
    <div>
      {isAchievementDriven && <CompetitiveLeaderboard />}
      {risk === 'conservative' && <RiskFreeGuarantee />}
      {mood === 'confident' && <AdvancedFeatures />}
    </div>
  );
}`}
            </pre>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">E-commerce CTAs</h3>
              <p className="text-sm text-gray-400 mb-3">
                Adapt product page buttons to match buyer psychology
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Conservative: "30-Day Money-Back Guarantee"</div>
                <div>• Aggressive: "Limited Stock - Order Now"</div>
                <div>• Achievement: "Join Top 5% of Customers"</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">SaaS Onboarding</h3>
              <p className="text-sm text-gray-400 mb-3">
                Personalize feature recommendations by cognitive style
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Analytical: Show technical documentation</div>
                <div>• Intuitive: Highlight visual workflows</div>
                <div>• Systematic: Present step-by-step guides</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Content Marketing</h3>
              <p className="text-sm text-gray-400 mb-3">
                Adapt headlines and copy to user motivations
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Growth: "Master New Skills"</div>
                <div>• Recognition: "Stand Out From the Crowd"</div>
                <div>• Belonging: "Join Our Community"</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Gaming UX</h3>
              <p className="text-sm text-gray-400 mb-3">
                Customize UI elements based on player psychology
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Competitive: Show leaderboards</div>
                <div>• Explorative: Highlight discovery features</div>
                <div>• Social: Emphasize multiplayer options</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4 mt-8">Best Practices</h2>
        <ul className="space-y-3 text-gray-400">
          <li className="flex gap-3">
            <span className="text-cyan-400 flex-shrink-0">•</span>
            <span>Always provide a <code className="text-cyan-400">baseText</code> fallback for when profile data is unavailable</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 flex-shrink-0">•</span>
            <span>Test adaptive components with mock profiles during development</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 flex-shrink-0">•</span>
            <span>Keep variant text consistent in tone and length to avoid layout shifts</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 flex-shrink-0">•</span>
            <span>Use <code className="text-cyan-400">AdaptiveContainer</code> to conditionally render entire sections</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 flex-shrink-0">•</span>
            <span>Combine multiple adaptation strategies (motivation + risk profile) for nuanced personalization</span>
          </li>
        </ul>

        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 mt-8">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Try the Interactive Demo</h3>
              <p className="text-gray-400 mb-4">
                See the Adaptive UI SDK in action in our <a href="/InteractiveDemo" className="text-cyan-400 hover:underline">Interactive Demo</a>. 
                Toggle between different user profiles to watch components adapt in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}