import React from "react";
import { Target, Megaphone, BarChart3 } from "lucide-react";

export default function PsychographicAdTargetingDoc() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-[#00d4ff]" />
          Psychographic Targeting — Scenarios & Playbooks
        </h3>
        <p className="text-[#a3a3a3]">
          Use Meta Page insights, GA4 behavior, and on-site signals to orchestrate ads and experiences that align with user motivations and cognitive styles.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-[#0ea5e9]" /> Meta (Pages) → Creative Strategy
          </h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Analyze top comments to extract motivations (e.g., “security-seeking pragmatists”).</li>
            <li>Design creatives that speak to that segment’s language and proof points.</li>
            <li>Iterate based on reaction/engagement patterns surfaced in analyses.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#0ea5e9]" /> GA4 → Remarketing
          </h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>Identify “creative intuitives” from GA4 + on-site signals.</li>
            <li>Build remarketing campaigns that redirect them to high-visual, exploratory content.</li>
            <li>Measure conversion lift vs. generic audiences.</li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
        <h4 className="text-white font-semibold mb-1">On-site Adaptive Engagement</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Trigger modals/tooltips for “analytical skeptics” with transparent comparisons and specs.</li>
          <li>Offer time-boxed incentives for “decisive maximizers” during high-intent sessions.</li>
          <li>Route support proactively when “anxious analyticals” show frustration signals.</li>
        </ul>
      </div>

      <p className="text-xs text-[#6b7280]">
        Combine segments across sources for stronger signals: Meta Page psychographics + GA4 traffic source + on-site engagement patterns.
      </p>
    </section>
  );
}