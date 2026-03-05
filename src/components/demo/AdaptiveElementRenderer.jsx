import React from 'react';
import { AdaptiveButton, AdaptiveText, AdaptiveContainer } from '@/components/sdk/KnxwSDK';
import { TrendingUp, Zap, Target, Eye, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

// Curated accent colors that look good on dark backgrounds
// LLM may return garish colors — we normalize them to a tasteful set
const SAFE_ACCENT_COLORS = {
  cyan: '#00d4ff',
  violet: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
  lime: '#84cc16',
};

function sanitizeColor(hex) {
  if (!hex || typeof hex !== 'string') return SAFE_ACCENT_COLORS.cyan;
  const clean = hex.trim().toLowerCase();
  
  // Block known bad colors (neon/fluorescent)
  const blocked = ['#76ff03', '#00ff00', '#ff0000', '#ff00ff', '#ffff00', '#0000ff'];
  if (blocked.some(b => clean.startsWith(b.slice(0, 5)))) return SAFE_ACCENT_COLORS.cyan;

  // Parse RGB to check for overly saturated colors
  const match = clean.replace('#', '').match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
  if (!match) return SAFE_ACCENT_COLORS.cyan;

  const [r, g, b] = [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Too dark to see on dark bg, too light (white-ish), or pure primaries
  if (luminance < 0.2 || luminance > 0.9) return SAFE_ACCENT_COLORS.cyan;

  return clean.startsWith('#') ? clean : `#${clean}`;
}

function hexToRgb(hex) {
  const match = hex.replace('#', '').match(/([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
  if (!match) return [0, 212, 255];
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

// The label shown under the "ADAPTIVE UI DEMO" header per element
function AdaptionLabel({ dimensions }) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {dimensions.map((d, i) => (
        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1a1a1a] border border-[#333] text-[#6b7280] uppercase tracking-wider">
          adapts to: {d}
        </span>
      ))}
    </div>
  );
}

export default function AdaptiveElementRenderer({ element, idx }) {
  if (!element || !element.type) return null;

  const accentHex = sanitizeColor(element.accentColor);
  const [r, g, b] = hexToRgb(accentHex);
  const shadow = `rgba(${r}, ${g}, ${b}, 0.35)`;
  const subtleBg = `rgba(${r}, ${g}, ${b}, 0.07)`;
  const borderColor = `rgba(${r}, ${g}, ${b}, 0.25)`;

  const industryTag = element.industryContext ? (
    <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border mb-2"
      style={{ borderColor, color: accentHex, backgroundColor: subtleBg }}>
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accentHex }} />
      {element.industryContext}
    </span>
  ) : null;

  if (element.type === 'button') {
    return (
      <div className="rounded-xl border bg-[#0f0f0f] p-4" style={{ borderColor }}>
        {industryTag}
        <AdaptionLabel dimensions={['motivation', 'risk profile']} />
        <AdaptiveButton
          baseText={element.baseText}
          motivationVariants={element.motivationVariants}
          riskVariants={element.riskVariants}
          className="w-full font-semibold px-4 py-3 rounded-lg text-sm transition-all duration-300"
          style={{
            backgroundColor: element.visualStyle === 'minimal' ? 'transparent' : accentHex,
            color: element.visualStyle === 'minimal' ? accentHex : '#000',
            border: element.visualStyle === 'minimal' ? `1.5px solid ${accentHex}` : 'none',
            boxShadow: (element.visualStyle === 'animated' || element.visualStyle === 'bold') ? `0 0 24px ${shadow}` : 'none',
          }}
          onClick={() => {}}
        />
      </div>
    );
  }

  if (element.type === 'card') {
    const headline = element.baseHeadline || element.baseText || '';
    const description = element.baseDescription || '';
    // Ensure they're not identical
    const safeDescription = description && description !== headline ? description : null;

    return (
      <div className="rounded-xl border bg-[#0f0f0f] p-4 relative overflow-hidden"
        style={{ borderColor, borderLeftColor: accentHex, borderLeftWidth: '3px' }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: accentHex }} />
        {industryTag}
        <AdaptionLabel dimensions={['cognitive style', 'motivation']} />
        <AdaptiveText
          baseText={headline}
          motivationVariants={element.motivationVariants}
          cognitiveStyleVariants={element.cognitiveStyleVariants}
          className="text-base font-bold text-white mb-1 block"
          as="h4"
        />
        {safeDescription && (
          <AdaptiveText
            baseText={safeDescription}
            motivationVariants={element.motivationVariants}
            className="text-sm text-[#a3a3a3] block leading-relaxed mb-3"
            as="p"
          />
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 flex-wrap">
            {element.motivationVariants && Object.entries(element.motivationVariants).slice(0, 2).map(([key, val]) => (
              <span key={key} className="text-[9px] px-2 py-0.5 rounded border" style={{ borderColor, color: accentHex, backgroundColor: subtleBg }}>
                {key}: "{val?.slice(0, 25)}{val?.length > 25 ? '…' : ''}"
              </span>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: accentHex }} />
        </div>
      </div>
    );
  }

  if (element.type === 'toast') {
    return (
      <div className="rounded-xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: subtleBg, borderColor }}>
        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentHex }} />
        <div className="flex-1 min-w-0">
          {industryTag}
          <AdaptionLabel dimensions={['emotional state', 'risk profile']} />
          <AdaptiveText
            baseText={element.baseText || element.baseHeadline}
            motivationVariants={element.motivationVariants}
            className="text-sm text-white leading-relaxed"
          />
          {element.riskVariants && (
            <div className="mt-2 space-y-1">
              {Object.entries(element.riskVariants).map(([risk, text]) => (
                <div key={risk} className="text-[10px] text-[#6b7280]">
                  <span style={{ color: accentHex }}>{risk}:</span> "{text}"
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (element.type === 'modal') {
    const headline = element.baseHeadline || element.baseText || '';
    const description = element.baseDescription || '';
    const safeDescription = description && description !== headline ? description : null;

    return (
      <div className="rounded-xl border-2 bg-[#080808] p-5 relative overflow-hidden"
        style={{ borderColor: `rgba(${r},${g},${b},0.4)`, boxShadow: `0 8px 32px ${shadow}` }}>
        {industryTag}
        <AdaptionLabel dimensions={['risk profile', 'cognitive style']} />
        <AdaptiveText
          baseText={headline}
          motivationVariants={element.motivationVariants}
          className="text-base font-bold text-white mb-2 block"
          as="h4"
        />
        {safeDescription && (
          <AdaptiveText
            baseText={safeDescription}
            motivationVariants={element.motivationVariants}
            className="text-sm text-[#a3a3a3] mb-4 block leading-relaxed"
            as="p"
          />
        )}
        {element.riskVariants && (
          <div className="mb-4 space-y-1.5">
            {Object.entries(element.riskVariants).map(([risk, text]) => (
              <div key={risk} className="flex items-start gap-2 text-xs">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase flex-shrink-0"
                  style={{ backgroundColor: subtleBg, color: accentHex }}>{risk}</span>
                <span className="text-[#a3a3a3]">"{text}"</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button className="flex-1 font-semibold px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: accentHex, color: '#000' }}>
            Confirm
          </button>
          <button className="px-4 py-2 rounded-lg text-sm text-[#a3a3a3] border border-[#333] hover:bg-[#1a1a1a] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (element.type === 'dashboard_widget') {
    return (
      <div className="rounded-xl border bg-[#0f0f0f] p-4 relative overflow-hidden"
        style={{ borderColor }}>
        {industryTag}
        <AdaptionLabel dimensions={['motivation', 'cognitive style']} />
        <AdaptiveText
          baseText={element.baseHeadline || element.baseText}
          motivationVariants={element.motivationVariants}
          className="text-xs text-[#a3a3a3] uppercase font-semibold tracking-wider block mb-3"
        />
        <div className="flex items-end gap-3 mb-3">
          <span className="text-4xl font-black tracking-tighter" style={{ color: accentHex }}>
            {element.metrics?.value || '—'}
          </span>
          {element.metrics?.trend && (
            <span className="text-sm font-bold pb-1" style={{ color: accentHex }}>
              {element.metrics.trend}
            </span>
          )}
        </div>
        {element.metrics?.label && (
          <p className="text-xs text-[#6b7280]">{element.metrics.label}</p>
        )}
        <div className="absolute top-3 right-3 opacity-10">
          <TrendingUp className="w-12 h-12" style={{ color: accentHex }} />
        </div>
      </div>
    );
  }

  if (element.type === 'ecommerce_item') {
    return (
      <div className="rounded-xl border bg-[#0f0f0f] overflow-hidden flex" style={{ borderColor }}>
        <div className="w-20 flex-shrink-0 flex items-center justify-center relative" style={{ backgroundColor: subtleBg }}>
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: accentHex, opacity: 0.7 }} />
        </div>
        <div className="flex-1 p-4">
          {industryTag}
          <AdaptionLabel dimensions={['motivation', 'risk profile']} />
          <div className="flex justify-between items-start mb-1">
            <AdaptiveText
              baseText={element.baseHeadline || element.baseText}
              motivationVariants={element.motivationVariants}
              className="text-sm font-bold text-white block"
            />
            <span className="text-sm font-black ml-2 flex-shrink-0" style={{ color: accentHex }}>
              {element.productDetails?.price || '$—'}
            </span>
          </div>
          {element.baseDescription && element.baseDescription !== (element.baseHeadline || element.baseText) && (
            <AdaptiveText
              baseText={element.baseDescription}
              motivationVariants={element.motivationVariants}
              className="text-xs text-[#a3a3a3] block mb-2 line-clamp-2"
            />
          )}
          {element.productDetails?.urgencyTag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
              style={{ backgroundColor: subtleBg, color: accentHex }}>
              {element.productDetails.urgencyTag}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (element.type === 'game_hud') {
    return (
      <div className="rounded-xl border-2 bg-black p-4 relative overflow-hidden"
        style={{ borderColor: `rgba(${r},${g},${b},0.5)` }}>
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ background: `radial-gradient(circle at top right, ${accentHex}, transparent 60%)` }} />
        {industryTag}
        <AdaptionLabel dimensions={['personality traits', 'motivation']} />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accentHex, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <Zap className="w-5 h-5 text-black" />
          </div>
          <AdaptiveText
            baseText={element.baseHeadline || element.baseText}
            motivationVariants={element.motivationVariants}
            className="text-sm font-black uppercase tracking-widest"
            style={{ color: accentHex }}
          />
        </div>
        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333] mb-2">
          <div className="h-full rounded-full w-3/4" style={{ backgroundColor: accentHex }} />
        </div>
        {element.baseDescription && (
          <p className="text-xs text-[#a3a3a3]">{element.baseDescription}</p>
        )}
      </div>
    );
  }

  if (element.type === 'container') {
    return (
      <AdaptiveContainer showFor={element.showFor} hideFor={element.hideFor}>
        <div className="rounded-xl border p-4" style={{ backgroundColor: subtleBg, borderColor }}>
          {industryTag}
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5" style={{ color: accentHex }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: accentHex }}>
              Conditional — visible for matching profiles only
            </span>
          </div>
          <AdaptiveText
            baseText={element.baseText || element.baseHeadline}
            motivationVariants={element.motivationVariants}
            className="text-sm text-white leading-relaxed"
          />
        </div>
      </AdaptiveContainer>
    );
  }

  return null;
}