import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown } from 'lucide-react';

/**
 * DemoThemeIndicator
 * A small floating badge that shows what psychographic traits
 * are currently driving the interface adaptation.
 * Collapses to a dot when minimized.
 */
export default function DemoThemeIndicator({ theme, profile }) {
  const [expanded, setExpanded] = useState(false);

  if (!profile || !theme) return null;

  const traits = [
    { label: 'Motivation', value: theme.topMotivation, color: 'var(--demo-accent)' },
    { label: 'Cognitive', value: theme.cogStyle, color: 'var(--demo-accent)' },
    { label: 'Risk', value: theme.risk, color: 'var(--demo-accent)' },
    { label: 'Mood', value: theme.mood, color: 'var(--demo-accent)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-30"
      style={{ fontFamily: 'inherit' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300"
        style={{
          background: 'var(--demo-surface)',
          border: '1px solid var(--demo-accent-border)',
          color: 'var(--demo-accent)',
          boxShadow: expanded ? '0 0 20px var(--demo-accent-glow)' : 'none',
          transition: 'var(--demo-transition) all ease',
        }}
      >
        <Palette className="w-3 h-3" />
        <span>Adaptive UI Active</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 p-3 rounded-xl min-w-[200px]"
            style={{
              background: 'var(--demo-surface)',
              border: '1px solid var(--demo-accent-border)',
              boxShadow: '0 0 30px var(--demo-accent-glow)',
              borderRadius: 'var(--demo-radius)',
            }}
          >
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--demo-accent)', opacity: 0.7 }}>
              Interface shaped by
            </p>
            <div className="space-y-1.5">
              {traits.map(t => (
                <div key={t.label} className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-gray-500">{t.label}</span>
                  <span
                    className="text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--demo-accent-muted)',
                      color: 'var(--demo-accent)',
                    }}
                  >
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--demo-border)' }}>
              <p className="text-[9px] text-gray-600">
                Colors, radius, spacing, speed &amp; surfaces all adapt in real-time.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}