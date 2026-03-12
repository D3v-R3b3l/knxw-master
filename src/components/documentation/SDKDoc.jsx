import React from "react";
import { Badge } from "@/components/ui/badge";
import { Code, Terminal, Zap } from "lucide-react";

export default function SDKDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">JavaScript SDK</h3>
      <p className="text-[#a3a3a3] mb-6">
        knXw ships a lightweight browser SDK through your app’s own <code>serveAnalyticsScript</code> function.
        It initializes with a ClientApp, tracks live user events to <code>captureEvent</code>, and polls <code>evaluateEngagementRules</code>
        to render modals, tooltips, and notifications automatically.
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3 flex items-center gap-2">
          <Code className="w-4 h-4" />
          Embed Script
        </h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`<script src="https://your-app.base44.app/functions/serveAnalyticsScript?id=CLIENT_APP_ID" defer></script>
<script>
  window.addEventListener('load', function () {
    window.knxw.init({
      userId: 'user_123',
      autoTrack: true,
      engagements: { pollInterval: 15000 }
    });
  });
<\/script>`}
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6 not-prose">
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-5">
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <Terminal className="w-4 h-4 text-[#00d4ff]" /> Core methods
          </div>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li><code>init(config)</code> — starts event tracking and engagement polling</li>
            <li><code>identify(userId, traits)</code> — binds the current external user</li>
            <li><code>track(eventType, payload)</code> — pushes live behavioral events</li>
            <li><code>page(payload)</code> — manual page view tracking</li>
            <li><code>startEngagements(config)</code> / <code>stopEngagements()</code></li>
            <li><code>onEngagement(callback)</code> — switch to manual rendering</li>
          </ul>
        </div>
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-5">
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <Zap className="w-4 h-4 text-[#00d4ff]" /> Implemented flow
          </div>
          <ul className="space-y-2 text-sm text-[#a3a3a3]">
            <li>Client SDK sends events to <code>captureEvent</code> with <code>X-API-Key</code></li>
            <li><code>captureEvent</code> stores <code>CapturedEvent</code> and invokes <code>liveProfileProcessor</code></li>
            <li>SDK polls <code>evaluateEngagementRules</code> with page/session context</li>
            <li>Triggered deliveries render as modal, tooltip, or notification UI</li>
            <li>User actions post back to <code>recordEngagementResponse</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Example: custom tracking</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`window.knxw.identify('user_123', { plan: 'growth' });

window.knxw.track('checkout_start', {
  plan_key: 'growth',
  source: 'pricing_page'
});

window.knxw.onEngagement((engagement) => {
  console.log('Triggered engagement:', engagement);
  // render your own UI if you want full control
});`}
        </pre>
      </div>

      <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3 text-white font-semibold">
          <Badge className="bg-[#00d4ff] text-black">Current</Badge>
          Delivery model
        </div>
        <p className="text-sm text-[#a3a3a3] mb-0">
          The current SDK is browser-first and uses polling for engagement delivery.
          It does not require an npm package to get started.
        </p>
      </div>
    </div>
  );
}