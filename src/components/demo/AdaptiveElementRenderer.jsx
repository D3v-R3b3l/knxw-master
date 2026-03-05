import React, { useState } from 'react';
import { usePsychographic } from '@/components/sdk/KnxwSDK';
import { 
  Check, X, ArrowRight, Zap, Shield, TrendingUp, Star, 
  Bell, ChevronRight, Sparkles, Target, Users, BarChart2,
  Clock, Award, Lock, Globe, Rocket, Play, CheckCircle
} from 'lucide-react';

// Resolve adapted text from variants based on live profile
function useAdaptedText(baseText, motivationVariants, riskVariants, cognitiveStyleVariants) {
  const { profile, hasMotivation, getRiskProfile, getCognitiveStyle } = usePsychographic();
  
  if (!profile) return baseText;
  
  // Priority: cognitive style > risk > motivation > base
  if (cognitiveStyleVariants) {
    const style = getCognitiveStyle?.();
    if (style && cognitiveStyleVariants[style]) return cognitiveStyleVariants[style];
  }
  if (riskVariants) {
    const risk = getRiskProfile?.();
    if (risk && riskVariants[risk]) return riskVariants[risk];
  }
  if (motivationVariants) {
    for (const [mot, text] of Object.entries(motivationVariants)) {
      if (hasMotivation?.(mot) && text) return text;
    }
  }
  return baseText;
}

// Resolve a nice single accent color — ignore LLM garbage, use a curated set
function resolveAccent(hex) {
  const safe = [
    '#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', 
    '#0ea5e9', '#6366f1', '#14b8a6', '#ec4899', '#f97316'
  ];
  if (!hex) return safe[0];
  const clean = hex.trim().toLowerCase();
  const m = clean.replace('#', '').match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
  if (!m) return safe[0];
  const lum = (0.299 * parseInt(m[1],16) + 0.587 * parseInt(m[2],16) + 0.114 * parseInt(m[3],16)) / 255;
  if (lum < 0.22 || lum > 0.88) return safe[0]; // too dark or too white
  return `#${m[1]}${m[2]}${m[3]}`;
}

function rgb(hex) {
  const m = hex.replace('#','').match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
  if (!m) return [0, 212, 255];
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}

// ─────────────────────────────────────────────
// ELEMENT RENDERERS
// ─────────────────────────────────────────────

function HeroSectionElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const headline = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants, element.riskVariants, element.cognitiveStyleVariants);
  const subtext = useAdaptedText(element.baseDescription, element.motivationVariants);
  const cta = useAdaptedText(element.baseText, element.motivationVariants, element.riskVariants);

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)', border: `1px solid rgba(${rr},${gg},${bb},0.2)` }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, rgba(${rr},${gg},${bb},0.12) 0%, transparent 60%)` }} />
      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.15)`, color: accent }}>
            ✦ {element.industryContext || 'Live Demo'}
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight">{headline}</h2>
        {subtext && subtext !== headline && (
          <p className="text-[#a3a3a3] text-sm mb-5 leading-relaxed max-w-xs">{subtext}</p>
        )}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110" style={{ backgroundColor: accent, color: '#000' }}>
            {cta || 'Get Started'} <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white border border-[#333] hover:border-[#555] transition-all">
            <Play className="w-3.5 h-3.5" /> Watch Demo
          </button>
        </div>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#1f1f1f]">
          {['No credit card required', 'Setup in 2 minutes', 'Free forever plan'].map((t, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
              <span className="text-[11px] text-[#6b7280]">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingCardElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const headline = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants, element.riskVariants);
  const cta = useAdaptedText(element.baseText, element.motivationVariants, element.riskVariants);
  const price = element.productDetails?.price || '$49';
  const features = element.motivationVariants 
    ? Object.values(element.motivationVariants).slice(0, 4)
    : ['Unlimited access', 'Priority support', 'Advanced analytics', 'Team collaboration'];

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ border: `1.5px solid rgba(${rr},${gg},${bb},0.35)`, background: '#0a0a0a', boxShadow: `0 0 40px rgba(${rr},${gg},${bb},0.08)` }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: accent }}>Most Popular</div>
            <div className="text-lg font-bold text-white">{headline || 'Pro Plan'}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{price}</div>
            <div className="text-[11px] text-[#6b7280]">per month</div>
          </div>
        </div>
        <div className="space-y-2.5 mb-5">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.15)` }}>
                <Check className="w-2.5 h-2.5" style={{ color: accent }} />
              </div>
              <span className="text-sm text-[#d4d4d4]">{f}</span>
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:brightness-110" style={{ backgroundColor: accent, color: '#000' }}>
          {cta || 'Start Free Trial'}
        </button>
        <p className="text-center text-[10px] text-[#6b7280] mt-2.5">Cancel anytime · No setup fees</p>
      </div>
    </div>
  );
}

function ToastNotificationElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const [dismissed, setDismissed] = useState(false);
  const message = useAdaptedText(element.baseText || element.baseHeadline, element.motivationVariants, element.riskVariants);

  const icons = [Bell, Zap, Star, TrendingUp, Target];
  const Icon = icons[Math.abs((element.baseText || '').length) % icons.length];

  if (dismissed) return (
    <div className="rounded-xl border border-[#222] bg-[#0a0a0a] p-3 text-center text-xs text-[#4b5563]">
      Toast dismissed — in production, users respond and that data refines future nudges.
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: `1px solid rgba(${rr},${gg},${bb},0.25)`, boxShadow: `0 4px 24px rgba(${rr},${gg},${bb},0.12)` }}>
      <div className="h-0.5 w-full" style={{ background: accent }} />
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.12)` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
            {element.industryContext || 'Smart Nudge'} · Personalized for you
          </div>
          <p className="text-sm text-white leading-snug">{message}</p>
          <div className="flex gap-3 mt-2.5">
            <button className="text-xs font-semibold" style={{ color: accent }}>Take action →</button>
            <button className="text-xs text-[#6b7280]">Remind me later</button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-[#4b5563] hover:text-white transition-colors flex-shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ModalElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const [confirmed, setConfirmed] = useState(false);
  const headline = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants, element.riskVariants, element.cognitiveStyleVariants);
  const description = useAdaptedText(element.baseDescription, element.motivationVariants, element.riskVariants);
  const cta = useAdaptedText(element.baseText, element.motivationVariants, element.riskVariants);
  const safeDesc = description && description !== headline ? description : null;

  if (confirmed) return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-6 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.15)` }}>
        <CheckCircle className="w-6 h-6" style={{ color: accent }} />
      </div>
      <div className="text-white font-semibold mb-1">Action Confirmed</div>
      <p className="text-xs text-[#6b7280]">This response is logged to refine future decisions for your profile.</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0a', border: `1.5px solid rgba(${rr},${gg},${bb},0.3)`, boxShadow: `0 8px 40px rgba(${rr},${gg},${bb},0.1)` }}>
      <div className="px-5 pt-5 pb-4 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.12)`, color: accent }}>
            {element.industryContext || 'Personalized Action'}
          </span>
          <Lock className="w-3.5 h-3.5 text-[#4b5563]" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{headline}</h3>
        {safeDesc && <p className="text-sm text-[#a3a3a3] leading-relaxed">{safeDesc}</p>}
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Security', val: '256-bit', icon: Shield },
            { label: 'Uptime', val: '99.9%', icon: Globe },
            { label: 'Clients', val: '50k+', icon: Users }
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.05)`, border: `1px solid rgba(${rr},${gg},${bb},0.1)` }}>
              <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: accent }} />
              <div className="text-sm font-bold text-white">{val}</div>
              <div className="text-[9px] text-[#6b7280]">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setConfirmed(true)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110" style={{ backgroundColor: accent, color: '#000' }}>
            {cta || 'Confirm'}
          </button>
          <button className="px-4 py-2.5 rounded-xl text-sm text-[#6b7280] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCardElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const headline = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants, element.cognitiveStyleVariants);
  const description = useAdaptedText(element.baseDescription, element.motivationVariants, element.riskVariants);
  const safeDesc = description && description !== headline ? description : null;

  const icons = [Zap, BarChart2, Shield, Target, Rocket, Award];
  const Icon = icons[Math.abs((element.baseHeadline || '').length) % icons.length];

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, #111111 0%, #0d0d0d 100%)', border: `1px solid rgba(${rr},${gg},${bb},0.18)` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at bottom right, rgba(${rr},${gg},${bb},0.06) 0%, transparent 70%)` }} />
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.1)`, border: `1px solid rgba(${rr},${gg},${bb},0.2)` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-white mb-1.5">{headline}</h4>
          {safeDesc && <p className="text-sm text-[#a3a3a3] leading-relaxed">{safeDesc}</p>}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-xs font-medium" style={{ color: accent }}>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" style={{ color: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardWidgetElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const label = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants);
  const value = element.metrics?.value || '84%';
  const trend = element.metrics?.trend || '+12%';
  const sublabel = element.metrics?.label || 'vs last period';

  const bars = [40, 65, 52, 78, 60, 85, 72, 90, 68, 95, 80, parseInt(value) || 84];

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0c0c0c', border: `1px solid rgba(${rr},${gg},${bb},0.15)` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] text-[#6b7280] uppercase tracking-wider mb-0.5">{element.industryContext || 'Analytics'}</div>
          <div className="text-sm font-semibold text-white">{label}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">{value}</div>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <TrendingUp className="w-3 h-3" style={{ color: accent }} />
            <span className="text-xs font-bold" style={{ color: accent }}>{trend}</span>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-1 h-12 mb-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, backgroundColor: i === bars.length - 1 ? accent : `rgba(${rr},${gg},${bb},0.2)`, opacity: i === bars.length - 1 ? 1 : 0.6 + i * 0.03 }} />
        ))}
      </div>
      <p className="text-[11px] text-[#4b5563]">{sublabel}</p>
    </div>
  );
}

function EcommerceCardElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const headline = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants, element.riskVariants);
  const description = useAdaptedText(element.baseDescription, element.motivationVariants);
  const price = element.productDetails?.price || '$99';
  const urgency = element.productDetails?.urgencyTag;
  const safeDesc = description && description !== headline ? description : null;
  const [added, setAdded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0c0c0c', border: `1px solid rgba(${rr},${gg},${bb},0.18)` }}>
      <div className="h-28 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, rgba(${rr},${gg},${bb},0.08) 0%, rgba(${rr},${gg},${bb},0.02) 100%)` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, rgba(${rr},${gg},${bb},0.15) 0%, transparent 70%)` }} />
        <div className="w-16 h-16 rounded-2xl relative z-10 flex items-center justify-center" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.15)`, border: `1px solid rgba(${rr},${gg},${bb},0.3)` }}>
          <Sparkles className="w-7 h-7" style={{ color: accent }} />
        </div>
        {urgency && (
          <div className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ backgroundColor: accent, color: '#000' }}>
            {urgency}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-bold text-white leading-tight pr-2">{headline}</h4>
          <span className="text-lg font-black flex-shrink-0" style={{ color: accent }}>{price}</span>
        </div>
        {safeDesc && <p className="text-xs text-[#a3a3a3] mb-3 leading-relaxed">{safeDesc}</p>}
        <button onClick={() => setAdded(!added)} className="w-full py-2.5 rounded-xl text-xs font-bold transition-all" style={{ backgroundColor: added ? 'transparent' : accent, color: added ? accent : '#000', border: added ? `1.5px solid ${accent}` : 'none' }}>
          {added ? '✓ Added to cart' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}

function GameHudElement({ element }) {
  const accent = resolveAccent(element.accentColor);
  const [rr,gg,bb] = rgb(accent);
  const headline = useAdaptedText(element.baseHeadline || element.baseText, element.motivationVariants);
  const description = useAdaptedText(element.baseDescription, element.motivationVariants);

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ background: '#000', border: `2px solid rgba(${rr},${gg},${bb},0.4)`, boxShadow: `0 0 30px rgba(${rr},${gg},${bb},0.1) inset` }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, rgba(${rr},${gg},${bb},0.08) 0%, transparent 55%)` }} />
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: `rgba(${rr},${gg},${bb},0.2)` }}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: accent }}>{element.industryContext || 'Game HUD'}</span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-3 rounded-full" style={{ backgroundColor: i < 4 ? accent : `rgba(${rr},${gg},${bb},0.2)`, height: `${8 + i * 3}px` }} />)}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `rgba(${rr},${gg},${bb},0.12)`, border: `1px solid rgba(${rr},${gg},${bb},0.3)` }}>
            <Zap className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <div className="text-sm font-black text-white uppercase tracking-wide leading-tight">{headline}</div>
            {description && description !== headline && <div className="text-xs text-[#6b7280] mt-0.5">{description}</div>}
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-black" style={{ color: accent }}>4,820</div>
            <div className="text-[9px] text-[#6b7280]">XP</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-[#6b7280] mb-1">
            <span>Progress to next rank</span><span style={{ color: accent }}>78%</span>
          </div>
          <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '78%', backgroundColor: accent, boxShadow: `0 0 10px rgba(${rr},${gg},${bb},0.5)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TYPE MAP — deterministic but varied per response
// ─────────────────────────────────────────────

// Map LLM element types to our rich renderers
const TYPE_RENDERERS = {
  button: FeatureCardElement,       // never render a boring lone button
  card: FeatureCardElement,
  toast: ToastNotificationElement,
  modal: ModalElement,
  dashboard_widget: DashboardWidgetElement,
  ecommerce_item: EcommerceCardElement,
  game_hud: GameHudElement,
  hero: HeroSectionElement,
  pricing: PricingCardElement,
  container: FeatureCardElement,
};

// Override first element of each response to a hero/pricing/modal for variety
const FIRST_ELEMENT_OVERRIDES = [HeroSectionElement, PricingCardElement, ModalElement];

export default function AdaptiveElementRenderer({ element, idx, totalCount }) {
  if (!element || !element.type) return null;

  let Renderer = TYPE_RENDERERS[element.type] || FeatureCardElement;

  // Force first element to be a big impactful component (rotates between responses)
  if (idx === 0) {
    // Use a hash of the baseText to pick consistently but vary per response
    const hash = Math.abs((element.baseText || element.baseHeadline || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    Renderer = FIRST_ELEMENT_OVERRIDES[hash % FIRST_ELEMENT_OVERRIDES.length];
  }

  return <Renderer element={element} />;
}