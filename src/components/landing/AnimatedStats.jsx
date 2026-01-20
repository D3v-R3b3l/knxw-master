import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const CountUpNumber = ({ end, suffix = '', prefix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const endValue = parseFloat(end);
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = endValue * easeOut;
        
        setCount(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  const displayValue = Number.isInteger(parseFloat(end)) 
    ? Math.round(count) 
    : count.toFixed(1);

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default function AnimatedStats() {
  // These represent potential outcomes based on psychographic personalization industry research
  const stats = [
    { value: 15, suffix: '%+', prefix: '', label: 'Personalization Uplift', category: 'E-commerce', color: '#06b6d4' },
    { value: 2, suffix: 'x', prefix: '', label: 'Engagement Potential', category: 'Gaming', color: '#f59e0b' },
    { value: 30, suffix: '%+', prefix: '', label: 'Feature Discovery', category: 'SaaS', color: '#8b5cf6' },
    { value: 20, suffix: '%+', prefix: '', label: 'Retention Improvement', category: 'Subscriptions', color: '#10b981' },
    { value: 25, suffix: '%+', prefix: '', label: 'Targeting Efficiency', category: 'Marketing', color: '#3b82f6' },
    { value: 15, suffix: '%+', prefix: '', label: 'Customer Insights', category: 'Customer Service', color: '#ec4899' },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
      {/* Parallax Background */}
      <div data-parallax-bg className="absolute inset-0 h-[140%] -top-[20%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
            Proven Results
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Unlock{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Potential
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            What psychographic intelligence can help you achieve
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="group relative">
              <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ 
                    background: `radial-gradient(circle at center, ${stat.color}10 0%, transparent 70%)` 
                  }}
                />
                
                {/* Animated Border Line */}
                <div 
                  className="absolute top-0 left-0 w-full h-1 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ background: stat.color }}
                    />
                    <span 
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: stat.color }}
                    >
                      {stat.category}
                    </span>
                  </div>
                  
                  <div 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight"
                    style={{ 
                      background: `linear-gradient(135deg, ${stat.color}, white)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    <CountUpNumber 
                      end={stat.value} 
                      suffix={stat.suffix} 
                      prefix={stat.prefix}
                      duration={2}
                    />
                  </div>
                  
                  <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
                </div>

                {/* Decorative corner */}
                <div 
                  className="absolute bottom-0 right-0 w-16 h-16 opacity-10"
                  style={{ 
                    background: `radial-gradient(circle at bottom right, ${stat.color}, transparent)` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Potential outcomes based on personalization industry research. Individual results may vary.
          </p>
        </div>
      </div>
    </section>
  );
}