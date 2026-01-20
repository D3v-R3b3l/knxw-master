import React from 'react';

export default function PhilosophySection() {
  return (
    <section className="py-24 md:py-40 bg-black relative overflow-hidden border-b border-white/5">
      {/* Parallax Background - will be controlled by GSAP in Landing.js */}
      <div data-parallax-bg className="absolute inset-0 h-[140%] -top-[20%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
      </div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="mb-6">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block">
                Philosophy
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.3] mb-8 pb-4">
              From Data to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 inline-block pb-2">
                Understanding
              </span>
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-gray-400 font-light leading-relaxed">
              <p>
                Redefine engagement across every domain: marketing becomes intuitive, education adapts to every learner, communication grows more empathetic, and decision-making becomes informed by understanding rather than assumption.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* The Limits Card */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl border border-white/10 relative overflow-hidden group hover:border-red-500/30 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-5 flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500/50 rounded-full animate-pulse" />
                The Limits
              </h3>
              <ul className="space-y-4 text-gray-400 relative z-10">
                {[
                  "Demographics tell you who, not why",
                  "Clickstreams show actions, not intent",
                  "Traditional analytics can't decode motivation"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The knXw Advantage Card */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-cyan-950/40 to-purple-950/40 rounded-2xl border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400/50 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-5 flex items-center gap-3 relative z-10">
                <span className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                The knXw Advantage
              </h3>
              <ul className="space-y-4 text-gray-300 relative z-10">
                {[
                  "Translate behavior into understanding",
                  "Understand cognitive styles and core motivations",
                  "Clear reasoning behind every insight",
                  "Direct recommendations for engagement"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}