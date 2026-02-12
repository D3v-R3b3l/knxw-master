import React from 'react';
import { Sparkles, Code2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function AdaptiveSDKShowcaseSection() {
  return (
    <section className="py-24 md:py-32 bg-black border-y border-white/5 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              NEW: Adaptive UI SDK
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            UI That <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Understands</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Build React components that automatically adapt to user psychology—no complex logic, just intelligent components.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Before */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Code2 className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Traditional Approach</h3>
            </div>
            <pre className="text-xs text-gray-500 bg-black/50 rounded-lg p-4 overflow-x-auto border border-white/5">
              {`// Complex conditional logic
function Hero() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);
  
  const getButtonText = () => {
    if (profile?.motivations?.includes('achievement')) {
      return "Start Winning Now";
    }
    if (profile?.risk_profile === 'conservative') {
      return "Try Free Forever";
    }
    return "Get Started";
  };
  
  return <button>{getButtonText()}</button>;
}`}
            </pre>
          </div>

          {/* After */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white">With Adaptive UI SDK</h3>
            </div>
            <pre className="text-xs text-gray-300 bg-black/50 rounded-lg p-4 overflow-x-auto border border-cyan-500/20">
              {`// Automatically adapts
import { AdaptiveButton } from '@knxw/sdk';

function Hero() {
  return (
    <AdaptiveButton
      baseText="Get Started"
      motivationVariants={{
        achievement: "Start Winning Now",
      }}
      riskVariants={{
        conservative: "Try Free Forever"
      }}
    />
  );
}`}
            </pre>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
          { icon: Zap, title: "Zero Complexity", desc: "No state management or API calls. Just declarative components." },
          { icon: Sparkles, title: "Real-Time Adaptation", desc: "Components update instantly as user psychology is analyzed." },
          { icon: Code2, title: "Type-Safe", desc: "Full TypeScript support with intelligent autocomplete." }].
          map((item, i) =>
          <div key={i} className="bg-[#111] rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = createPageUrl('InteractiveDemo')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-8 py-6 text-lg rounded-xl">

              <Sparkles className="w-5 h-5 mr-2" />
              Try Live Demo
            </Button>
            <Button
              onClick={() => window.location.href = createPageUrl('Documentation')}
              variant="outline"
              className="px-8 py-6 text-lg font-medium rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors">
              <Code2 className="w-5 h-5 mr-2" />
              View SDK Docs
            </Button>
          </div>
        </div>
      </div>
    </section>);

}