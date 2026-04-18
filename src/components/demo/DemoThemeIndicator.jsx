import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown } from 'lucide-react';

/**
 * DemoThemeIndicator
 * A small floating badge showing which psychographic traits are driving
 * the adaptive UI elements inside the chat. Always uses cyan chrome —
 * only the adaptive element cards inside the chat change color.
 */
export default function DemoThemeIndicator({ theme, profile }) {
  const [expanded, setExpanded] = useState(false);

  if (!profile || !theme) return null;

  const traits = [
    { label: 'Motivation', value: theme.topMotivation },
    { label: 'Cognitive',  value: theme.cogStyle },
    { label: 'Risk',       value: theme.risk },
    { label: 'Mood',       value: theme.mood },
  ];

  // Always cyan for the chrome indicator — the theme accent only drives the adaptive cards
  const accent      = '#00d4ff';
  const accentMuted = 'rgba(0,212,255,0.12)';
  const accentBorder = 'rgba(0,212,255,0.35)';
  const accentGlow  = 'rgba(0,212,255,0.2)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-30"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300"
        style={{
          background: '#111111',
          border: `1px solid ${accentBorder}`,
          color: accent,
          boxShadow: expanded ? `0 0 20px ${accentGlow}` : 'none',
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
              background: '#111111',
              border: `1px solid ${accentBorder}`,
              boxShadow: `0 0 30px ${accentGlow}`,
              borderRadius: '0.75rem',
            }}
          >
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: accent, opacity: 0.7 }}>
              Adaptive cards shaped by
            </p>
            <div className="space-y-1.5">
              {traits.map(t => (
                <div key={t.label} className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-gray-500">{t.label}</span>
                  <span
                    className="text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded"
                    style={{ background: accentMuted, color: accent }}
                  >
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[#262626]">
              <p className="text-[9px] text-gray-600">
                The adaptive UI cards inside chat respond to your profile in real-time.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}