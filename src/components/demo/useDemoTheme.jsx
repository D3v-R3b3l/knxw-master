/**
 * useDemoTheme
 * Derives a complete interface theme from a live psychographic profile.
 * Maps cognitive_style, risk_profile, emotional_state, and top motivation
 * to concrete CSS values that drive the entire demo interface.
 */

export function deriveTheme(profile) {
  if (!profile) return defaultTheme();

  const cogStyle = profile.cognitive_style?.style || 'analytical';
  const risk = profile.risk_profile?.profile || 'moderate';
  const mood = profile.emotional_state?.mood || 'neutral';
  const topMotivation = profile.motivation_stack?.[0]?.label || 'achievement';
  const confidence = profile.overall_confidence || 0;

  // ─── Accent color: driven by top motivation ───────────────────────────────
  const motivationAccent = {
    achievement:  { h: 197, s: 100, l: 50 }, // cyan
    security:     { h: 142, s: 70,  l: 45 }, // green
    innovation:   { h: 262, s: 80,  l: 60 }, // purple
    autonomy:     { h: 25,  s: 95,  l: 55 }, // orange
    mastery:      { h: 45,  s: 95,  l: 55 }, // amber
    social:       { h: 330, s: 80,  l: 60 }, // pink
    efficiency:   { h: 180, s: 70,  l: 45 }, // teal
    status:       { h: 50,  s: 90,  l: 55 }, // gold
    impact:       { h: 0,   s: 80,  l: 55 }, // red
    curiosity:    { h: 270, s: 75,  l: 65 }, // lavender
  };
  const accent = motivationAccent[topMotivation] || motivationAccent.achievement;
  const accentHSL = `hsl(${accent.h}, ${accent.s}%, ${accent.l}%)`;
  const accentHSLMuted = `hsla(${accent.h}, ${accent.s}%, ${accent.l}%, 0.15)`;
  const accentHSLBorder = `hsla(${accent.h}, ${accent.s}%, ${accent.l}%, 0.4)`;
  const accentHSLGlow = `hsla(${accent.h}, ${accent.s}%, ${accent.l}%, 0.25)`;

  // ─── Background: driven by risk profile ──────────────────────────────────
  const bgMap = {
    conservative: { from: '#0d0d12', via: '#0a0a0f', to: '#0d0d12' },  // cooler, darker
    moderate:     { from: '#0a0a0a', via: '#111111', to: '#0a0a0a' },  // default
    aggressive:   { from: '#0f0a0a', via: '#140a0a', to: '#0f0a0a' },  // warmer dark
  };
  const bg = bgMap[risk] || bgMap.moderate;

  // ─── Border & surface: driven by risk ────────────────────────────────────
  const surfaceMap = {
    conservative: { border: '#1e1e2e', surface: '#0f0f1a', surface2: '#13131f' },
    moderate:     { border: '#262626', surface: '#111111', surface2: '#1a1a1a' },
    aggressive:   { border: '#2a1a1a', surface: '#1a0f0f', surface2: '#221212' },
  };
  const surface = surfaceMap[risk] || surfaceMap.moderate;

  // ─── Typography & spacing: driven by cognitive style ─────────────────────
  const cogMap = {
    analytical:  { fontWeight: 400, letterSpacing: '0.01em', radius: '0.5rem',  density: 'compact',   fontFamily: "'Inter', sans-serif" },
    systematic:  { fontWeight: 400, letterSpacing: '0.02em', radius: '0.375rem',density: 'compact',   fontFamily: "'Inter', sans-serif" },
    intuitive:   { fontWeight: 350, letterSpacing: '0em',    radius: '1rem',    density: 'relaxed',   fontFamily: "'Inter', sans-serif" },
    creative:    { fontWeight: 300, letterSpacing: '-0.01em',radius: '1.25rem', density: 'relaxed',   fontFamily: "'Inter', sans-serif" },
    pragmatic:   { fontWeight: 450, letterSpacing: '0.015em',radius: '0.375rem',density: 'compact',  fontFamily: "'Inter', sans-serif" },
    strategic:   { fontWeight: 400, letterSpacing: '0.02em', radius: '0.625rem',density: 'balanced', fontFamily: "'Inter', sans-serif" },
  };
  const cog = cogMap[cogStyle] || cogMap.analytical;

  // ─── Animation speed: driven by mood ─────────────────────────────────────
  const moodAnimMap = {
    excited:    { duration: '180ms', intensity: 'high'   },
    positive:   { duration: '250ms', intensity: 'medium' },
    confident:  { duration: '220ms', intensity: 'medium' },
    neutral:    { duration: '300ms', intensity: 'low'    },
    uncertain:  { duration: '350ms', intensity: 'low'    },
    anxious:    { duration: '150ms', intensity: 'high'   },
    frustrated: { duration: '150ms', intensity: 'high'   },
    negative:   { duration: '400ms', intensity: 'minimal'},
  };
  const anim = moodAnimMap[mood] || moodAnimMap.neutral;

  // ─── Message bubble styling ───────────────────────────────────────────────
  const userBubbleMap = {
    conservative: '#1a1f35',
    moderate:     '#1e293b',
    aggressive:   '#2a1a1a',
  };
  const userBubble = userBubbleMap[risk] || userBubbleMap.moderate;

  // ─── Sidebar gradient: blend of accent into dark ──────────────────────────
  const sidebarGradient = `linear-gradient(180deg, ${surface.surface} 0%, hsla(${accent.h}, ${accent.s}%, ${accent.l}%, 0.04) 100%)`;

  // ─── Header blur intensity: driven by confidence ─────────────────────────
  const blurPx = Math.round(12 + confidence * 12); // 12px → 24px

  return {
    // Raw values for component logic
    cogStyle, risk, mood, topMotivation, confidence,
    accentHSL, accentHSLMuted, accentHSLBorder, accentHSLGlow,
    bg, surface, cog, anim, userBubble, sidebarGradient, blurPx,

    // CSS custom property map — applied via style={{}} on root element
    cssVars: {
      '--demo-accent':           accentHSL,
      '--demo-accent-muted':     accentHSLMuted,
      '--demo-accent-border':    accentHSLBorder,
      '--demo-accent-glow':      accentHSLGlow,
      '--demo-bg-from':          bg.from,
      '--demo-bg-via':           bg.via,
      '--demo-bg-to':            bg.to,
      '--demo-border':           surface.border,
      '--demo-surface':          surface.surface,
      '--demo-surface2':         surface.surface2,
      '--demo-radius':           cog.radius,
      '--demo-font-weight':      cog.fontWeight,
      '--demo-letter-spacing':   cog.letterSpacing,
      '--demo-transition':       anim.duration,
      '--demo-user-bubble':      userBubble,
      '--demo-sidebar-gradient': sidebarGradient,
      '--demo-blur':             `${blurPx}px`,
    }
  };
}

function defaultTheme() {
  return {
    cogStyle: 'analytical', risk: 'moderate', mood: 'neutral',
    topMotivation: 'achievement', confidence: 0,
    accentHSL: 'hsl(197, 100%, 50%)',
    accentHSLMuted: 'hsla(197, 100%, 50%, 0.15)',
    accentHSLBorder: 'hsla(197, 100%, 50%, 0.4)',
    accentHSLGlow: 'hsla(197, 100%, 50%, 0.25)',
    bg: { from: '#0a0a0a', via: '#111111', to: '#0a0a0a' },
    surface: { border: '#262626', surface: '#111111', surface2: '#1a1a1a' },
    cog: { fontWeight: 400, letterSpacing: '0.01em', radius: '0.5rem', density: 'compact' },
    anim: { duration: '300ms', intensity: 'low' },
    userBubble: '#1e293b',
    sidebarGradient: 'linear-gradient(180deg, #111111 0%, hsla(197,100%,50%,0.04) 100%)',
    blurPx: 12,
    cssVars: {
      '--demo-accent':           'hsl(197, 100%, 50%)',
      '--demo-accent-muted':     'hsla(197, 100%, 50%, 0.15)',
      '--demo-accent-border':    'hsla(197, 100%, 50%, 0.4)',
      '--demo-accent-glow':      'hsla(197, 100%, 50%, 0.25)',
      '--demo-bg-from':          '#0a0a0a',
      '--demo-bg-via':           '#111111',
      '--demo-bg-to':            '#0a0a0a',
      '--demo-border':           '#262626',
      '--demo-surface':          '#111111',
      '--demo-surface2':         '#1a1a1a',
      '--demo-radius':           '0.5rem',
      '--demo-font-weight':      400,
      '--demo-letter-spacing':   '0.01em',
      '--demo-transition':       '300ms',
      '--demo-user-bubble':      '#1e293b',
      '--demo-sidebar-gradient': 'linear-gradient(180deg, #111111 0%, hsla(197,100%,50%,0.04) 100%)',
      '--demo-blur':             '12px',
    }
  };
}