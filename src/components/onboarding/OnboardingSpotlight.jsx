import React, { useEffect, useMemo, useRef, useState } from "react";

export default function OnboardingSpotlight({ steps = [], currentIndex = 0, onChange, onComplete, onSeedExample }) {
  const [idx, setIdx] = useState(currentIndex || 0);
  const [targetRect, setTargetRect] = useState(null);
  const step = steps[idx] || null;

  useEffect(() => {
    setIdx(currentIndex || 0);
  }, [currentIndex]);

  useEffect(() => {
    if (!step?.selector) return;
    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
    // temporary highlight ring using classes
    el.classList.add("ring-2", "ring-[#00d4ff]", "ring-offset-2", "ring-offset-transparent");
    const cleanup = () => el.classList.remove("ring-2", "ring-[#00d4ff]", "ring-offset-2", "ring-offset-transparent");
    return cleanup;
  }, [step?.selector]);

  const goNext = () => {
    const next = Math.min(steps.length - 1, idx + 1);
    setIdx(next);
    onChange?.(next);
    if (next === steps.length - 1 && steps.length > 0) {
      // last step will call complete on explicit Done
    }
  };

  const goPrev = () => {
    const prev = Math.max(0, idx - 1);
    setIdx(prev);
    onChange?.(prev);
  };

  if (!step) return null;

  return (
    <>
      {/* Dim the page */}
      <div className="fixed inset-0 bg-black/60 pointer-events-none z-[1800]" />

      {/* Spotlight outline (simple tooltip panel near target) */}
      <div
        className="fixed z-[1801] pointer-events-none"
        style={{
          top: (targetRect?.top ?? 0) - 12,
          left: (targetRect?.left ?? 0) - 12,
          width: (targetRect?.width ?? 0) + 24,
          height: (targetRect?.height ?? 0) + 24,
          borderRadius: 12,
          boxShadow: "0 0 0 2px rgba(0,212,255,0.8), 0 0 0 100vmax rgba(0,0,0,0.0)"
        }}
      />

      {/* Instruction card */}
      <div
        className="fixed z-[1802] max-w-sm w-[90vw] md:w-[420px] bg-[#111111] border border-[#262626] rounded-xl p-4 text-white shadow-2xl"
        style={{
          top: Math.min((targetRect?.top ?? 0) + (targetRect?.height ?? 0) + 12, window.scrollY + window.innerHeight - 180),
          left: Math.min((targetRect?.left ?? 0), window.scrollX + window.innerWidth - 440)
        }}
      >
        <div className="text-sm font-semibold">{step.title}</div>
        {step.description && (
          <p className="text-xs text-[#a3a3a3] mt-2">{step.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            className="pointer-events-auto px-3 py-1.5 text-xs rounded-lg bg-[#1a1a1a] border border-[#262626] disabled:opacity-50"
            onClick={goPrev}
            disabled={idx === 0}
          >
            Back
          </button>
          {step.example && (
            <button
              className="pointer-events-auto px-3 py-1.5 text-xs rounded-lg bg-[#00d4ff] text-[#0a0a0a] hover:opacity-90"
              onClick={() => onSeedExample?.(step.example)}
            >
              Show example
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[#6b7280]">
              {idx + 1} / {steps.length}
            </span>
            {idx < steps.length - 1 ? (
              <button
                className="pointer-events-auto px-3 py-1.5 text-xs rounded-lg bg-[#00d4ff] text-[#0a0a0a] hover:opacity-90"
                onClick={goNext}
              >
                Next
              </button>
            ) : (
              <button
                className="pointer-events-auto px-3 py-1.5 text-xs rounded-lg bg-[#10b981] text-[#0a0a0a] hover:opacity-90"
                onClick={() => onComplete?.()}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}