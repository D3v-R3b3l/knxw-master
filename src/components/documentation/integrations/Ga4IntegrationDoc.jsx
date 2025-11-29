import React from "react";
import { BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Ga4IntegrationDoc() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
          Google Analytics (GA4) — Connect & Report
        </h3>
        <p className="text-[#a3a3a3]">Connect GA4, list properties, and run reports that power psychographic insights.</p>
      </header>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Prerequisites</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3]">
          <li>GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URL set in env.</li>
          <li>Scopes: analytics.readonly (and openid/email/profile).</li>
          <li>The same Google user must have GA4 property access.</li>
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Steps</h4>
        <ol className="list-decimal list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Open Google Data page → Connect Google → approve scopes.</li>
          <li>List Properties to verify access.</li>
          <li>Run a report (e.g., dimensions: pagePath, metrics: screenPageViews, last 7 days).</li>
          <li>Use results to segment behavior and enrich psychographic analysis.</li>
        </ol>
        <div className="text-xs text-[#6b7280] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Entity: GoogleAccount (encrypted tokens).
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Troubleshooting</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Empty property list → check the Google user’s GA4 permissions.</li>
          <li>401/invalid_grant → confirm redirect URL and client secret; retry auth.</li>
          <li>Report errors → ensure dimensions/metrics combination is valid for GA4.</li>
        </ul>
        <div className="text-xs text-[#f59e0b] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Avoid sampling issues by using appropriate date ranges.
        </div>
      </div>
    </section>
  );
}