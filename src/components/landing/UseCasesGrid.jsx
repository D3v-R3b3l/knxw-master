import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ShoppingCart, Code, Gamepad2, GraduationCap, Heart, Megaphone, Headphones, Tv } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const categoryIcons = {
  "E-commerce": ShoppingCart,
  "SaaS": Code,
  "Gaming": Gamepad2,
  "EdTech": GraduationCap,
  "Healthcare": Heart,
  "Marketing": Megaphone,
  "Customer Service": Headphones,
  "Media": Tv,
};

const categoryColors = {
  "E-commerce": { from: "#06b6d4", to: "#0891b2" },
  "SaaS": { from: "#8b5cf6", to: "#7c3aed" },
  "Gaming": { from: "#f59e0b", to: "#d97706" },
  "EdTech": { from: "#10b981", to: "#059669" },
  "Healthcare": { from: "#ec4899", to: "#db2777" },
  "Marketing": { from: "#3b82f6", to: "#2563eb" },
  "Customer Service": { from: "#f97316", to: "#ea580c" },
  "Media": { from: "#a855f7", to: "#9333ea" },
};

const FoilCard = ({ children, className, colors }) => {
  const isPointerInside = useRef(false);
  const refElement = useRef(null);
  
  const handlePointerMove = (event) => {
    const rotateFactor = 0.4;
    const rect = refElement.current?.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const percentage = {
      x: (100 / rect.width) * position.x,
      y: (100 / rect.height) * position.y,
    };
    const delta = {
      x: percentage.x - 50,
      y: percentage.y - 50,
    };

    const background = {
      x: 50 + percentage.x / 4 - 12.5,
      y: 50 + percentage.y / 3 - 16.67,
    };
    const rotate = {
      x: -(delta.x / 3.5) * rotateFactor,
      y: (delta.y / 2) * rotateFactor,
    };
    
    if (refElement.current) {
      refElement.current.style.setProperty("--m-x", `${percentage.x}%`);
      refElement.current.style.setProperty("--m-y", `${percentage.y}%`);
      refElement.current.style.setProperty("--r-x", `${rotate.x}deg`);
      refElement.current.style.setProperty("--r-y", `${rotate.y}deg`);
      refElement.current.style.setProperty("--bg-x", `${background.x}%`);
      refElement.current.style.setProperty("--bg-y", `${background.y}%`);
    }
  };

  const handlePointerEnter = () => {
    isPointerInside.current = true;
    if (refElement.current) {
      refElement.current.style.setProperty("--opacity", "0.6");
      refElement.current.style.setProperty("--duration", "200ms");
      refElement.current.style.setProperty("--easing", "linear");
      setTimeout(() => {
        if (isPointerInside.current) {
          refElement.current?.style.setProperty("--duration", "0s");
        }
      }, 200);
    }
  };

  const handlePointerLeave = () => {
    isPointerInside.current = false;
    if (refElement.current) {
      refElement.current.style.setProperty("--opacity", "0");
      refElement.current.style.setProperty("--duration", "300ms");
      refElement.current.style.setProperty("--easing", "ease");
      refElement.current.style.setProperty("--r-x", `0deg`);
      refElement.current.style.setProperty("--r-y", `0deg`);
    }
  };

  return (
    <div
      ref={refElement}
      className={`relative isolate [contain:layout_style] [perspective:600px] transition-transform duration-[var(--duration)] ease-[var(--easing)] delay-[var(--delay)] will-change-transform w-full h-full ${className}`}
      style={{
        "--m-x": "50%",
        "--m-y": "50%",
        "--r-x": "0deg",
        "--r-y": "0deg",
        "--bg-x": "50%",
        "--bg-y": "50%",
        "--foil-size": "100%",
        "--opacity": "0",
        "--radius": "24px",
        "--easing": "ease",
        "--duration": "300ms",
        "--transition": "var(--duration) var(--easing)",
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className="h-full grid will-change-transform origin-center transition-transform duration-[var(--duration)] ease-[var(--easing)] delay-[var(--delay)] [transform:rotateY(var(--r-x))_rotateX(var(--r-y))] rounded-[var(--radius)] border border-slate-800 overflow-hidden">
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_0_0_round_var(--radius))]">
          <div className="h-full w-full bg-slate-950 relative">
             {children}
          </div>
        </div>
        
        {/* Glare Layer */}
        <div className="w-full h-full grid [grid-area:1/1] mix-blend-soft-light [clip-path:inset(0_0_1px_0_round_var(--radius))] opacity-[var(--opacity)] transition-opacity transition-background duration-[var(--duration)] ease-[var(--easing)] delay-[var(--delay)] will-change-background [background:radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(255,255,255,0.8)_10%,_rgba(255,255,255,0.65)_20%,_rgba(255,255,255,0)_90%)]" />
        
        {/* Foil/Holographic Layer */}
        <div 
          className="w-full h-full grid [grid-area:1/1] mix-blend-color-dodge opacity-[var(--opacity)] will-change-background transition-opacity [clip-path:inset(0_0_1px_0_round_var(--radius))] [background-blend-mode:hue_hue_hue_overlay] [background:var(--pattern),_var(--rainbow),_var(--diagonal),_var(--shade)] relative after:content-[''] after:grid-area-[inherit] after:bg-repeat-[inherit] after:bg-attachment-[inherit] after:bg-origin-[inherit] after:bg-clip-[inherit] after:bg-[inherit] after:mix-blend-exclusion after:[background-size:var(--foil-size),_200%_400%,_800%,_200%] after:[background-position:center,_0%_var(--bg-y),_calc(var(--bg-x)*_-1)_calc(var(--bg-y)*_-1),_var(--bg-x)_var(--bg-y)] after:[background-blend-mode:soft-light,_hue,_hard-light]"
          style={{
            "--step": "5%",
            "--foil-svg": `url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.99994 3.419 21.6142 7.43646 22.7921 12.153C23.97 16.8695 3.41838 23.0306 3.41838 23.0306' stroke='white' stroke-width='5' stroke-miterlimit='3.86874' stroke-linecap='round' style='mix-blend-mode:darken'/%3E%3C/svg%3E")`,
            "--pattern": "var(--foil-svg) center/100% no-repeat",
            "--rainbow": "repeating-linear-gradient( 0deg,rgb(255,119,115) calc(var(--step) * 1),rgba(255,237,95,1) calc(var(--step) * 2),rgba(168,255,95,1) calc(var(--step) * 3),rgba(131,255,247,1) calc(var(--step) * 4),rgba(120,148,255,1) calc(var(--step) * 5),rgb(216,117,255) calc(var(--step) * 6),rgb(255,119,115) calc(var(--step) * 7) ) 0% var(--bg-y)/200% 700% no-repeat",
            "--diagonal": "repeating-linear-gradient( 128deg,#0e152e 0%,hsl(180,10%,60%) 3.8%,hsl(180,10%,60%) 4.5%,hsl(180,10%,60%) 5.2%,#0e152e 10%,#0e152e 12% ) var(--bg-x) var(--bg-y)/300% no-repeat",
            "--shade": "radial-gradient( farthest-corner circle at var(--m-x) var(--m-y),rgba(255,255,255,0.1) 12%,rgba(255,255,255,0.15) 20%,rgba(255,255,255,0.25) 120% ) var(--bg-x) var(--bg-y)/300% no-repeat",
            backgroundBlendMode: "hue, hue, hue, overlay"
          }}
        />
      </div>
    </div>
  );
};

export default function UseCasesGrid() {
  const [useCases, setUseCases] = React.useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch ALL case studies from database
  React.useEffect(() => {
    base44.entities.CaseStudy.filter({ published: true })
      .then(studies => {
        if (studies && studies.length > 0) {
          // Map database case studies to display format
          const mappedCases = studies.map(study => ({
            title: study.title,
            cat: study.category,
            stat: study.hero_stat,
            statLabel: study.hero_stat_label,
            details: study.implementation || [],
            slug: study.slug,
          }));
          setUseCases(mappedCases);
        } else {
          setUseCases([]);
        }
      })
      .catch(err => {
        console.error('Error loading case studies:', err);
        setUseCases([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="use-cases" className="py-32 bg-black relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              Use Cases
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Proven Impact Across{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              Industries
            </span>
          </motion.h2>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : useCases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Case studies loading soon...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((item, i) => {
            const IconComponent = categoryIcons[item.cat] || Code;
            const colors = categoryColors[item.cat] || { from: "#06b6d4", to: "#0891b2" };
            
            return (
              <motion.div
                key={i}
                layoutId={`card-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                onClick={() => setSelectedCard(i)}
                className="cursor-pointer use-case-card"
                data-tour-id={i === 0 ? "use-cases" : undefined}
              >
                <FoilCard
                  colors={colors}
                  className="h-full min-h-[320px]"
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Category Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}20)` }}
                        >
                          <IconComponent className="w-4 h-4" style={{ color: colors.from }} />
                        </div>
                        <span 
                          className="text-xs font-mono uppercase tracking-wider"
                          style={{ color: colors.from }}
                        >
                          {item.cat}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-auto pr-4 line-clamp-3 leading-snug">{item.title}</h3>
                    
                    <div className="flex items-baseline gap-2 mt-6">
                      <span 
                        className="text-3xl font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {item.stat}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight">{item.statLabel}</span>
                    </div>
                  </div>
                </FoilCard>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {selectedCard !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`card-${selectedCard}`}
              className="w-full max-w-3xl h-auto shadow-2xl shadow-black/50 relative"
              onClick={(e) => e.stopPropagation()}
            >
               {/* Close button outside FoilCard to ensure clickability */}
               <button 
                 onClick={() => setSelectedCard(null)}
                 className="absolute top-4 right-4 w-10 h-10 bg-black/80 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-[200] border border-white/20"
               >
                 <X className="w-5 h-5 text-white" />
               </button>

               <FoilCard className="!aspect-auto h-full">
                 <div className="relative w-full h-full flex flex-col md:flex-row bg-[#0a0a0a] overflow-hidden rounded-[24px]">

                  {(() => {
                      const item = useCases[selectedCard];
                      const IconComponent = categoryIcons[item.cat] || Code;
                      const colors = categoryColors[item.cat] || { from: "#06b6d4", to: "#0891b2" };

                      return (
                        <>
                          <div className="w-full md:w-1/2 p-8 md:p-10 pt-14 md:pt-10 flex flex-col relative z-10">
                             {/* Glow */}
                             <div 
                                className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                                style={{ background: `radial-gradient(circle at 0% 0%, ${colors.from}, transparent 70%)` }}
                             />
                             
                             <div className="relative z-10">
                               <div className="flex items-center gap-3 mb-8">
                                 <div 
                                   className="w-12 h-12 rounded-xl flex items-center justify-center"
                                   style={{ background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}20)` }}
                                 >
                                   <IconComponent className="w-6 h-6" style={{ color: colors.from }} />
                                 </div>
                                 <span 
                                   className="text-sm font-mono uppercase tracking-wider"
                                   style={{ color: colors.from }}
                                 >
                                   {item.cat}
                                 </span>
                               </div>

                               <h3 className="text-3xl font-bold text-white mb-6 leading-tight">{item.title}</h3>
                               
                               <div className="flex items-baseline gap-3 mt-auto">
                                 <span 
                                   className="text-5xl font-bold"
                                   style={{ 
                                     background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                                     WebkitBackgroundClip: 'text',
                                     WebkitTextFillColor: 'transparent'
                                   }}
                                 >
                                   {item.stat}
                                 </span>
                                 <span className="text-lg text-gray-400">{item.statLabel}</span>
                               </div>
                             </div>
                          </div>

                          <div className="w-full md:w-1/2 p-8 md:p-10 bg-[#111] border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto z-10">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Impact Analysis</h4>
                            <ul className="space-y-6">
                              {item.details.map((detail, idx) => (
                                <motion.li 
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + idx * 0.1 }}
                                  key={idx} 
                                  className="flex gap-4"
                                >
                                  <div className="flex-shrink-0 mt-1">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ background: colors.from }}
                                    />
                                    <div className="w-px h-full bg-white/10 mx-auto mt-2" />
                                  </div>
                                  <p className="text-gray-300 text-lg leading-relaxed">{detail}</p>
                                </motion.li>
                              ))}
                            </ul>

                            <div className="mt-10 pt-8 border-t border-white/5">
                               <button
                                 onClick={(e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
                                   window.location.href = `${createPageUrl('CaseStudy')}?slug=${item.slug}`;
                                 }}
                                 className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-white font-semibold transition-all duration-300 text-center hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] cursor-pointer"
                               >
                                 <span className="flex items-center justify-center gap-2">
                                   View Case Study
                                   <ArrowRight className="w-4 h-4" />
                                 </span>
                               </button>
                            </div>
                          </div>
                        </>
                      );
                  })()}
                 </div>
               </FoilCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}