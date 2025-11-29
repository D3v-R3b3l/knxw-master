import React from "react";
import { GitBranch, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdPlatformsIntegrationDoc() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-[#00d4ff]" />
          Ad Platforms — Meta CAPI & Google Ads
        </h3>
        <p className="text-[#a3a3a3]">
          Connect your ad platforms for end-to-end ROI: attribute conversions, segment audiences, and optimize creative using psychographics.
        </p>
      </header>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Meta Conversions API (CAPI)</h4>
        <ol className="list-decimal list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Open Attribution Settings and create/select a Workspace.</li>
          <li>In Secrets, add <strong>Meta Pixel ID</strong> and <strong>CAPI Access Token</strong>.</li>
          <li>Authorize your domain(s) and generate the SDK Snippet; deploy it on your site.</li>
          <li>Send conversions using the backend function (server-side) with event_id dedup.</li>
        </ol>
        <div className="text-xs text-[#6b7280] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Entities: Conversion, Identity, AdPlatformSendLog; Functions: getSdkSnippet, sendConversionToAdPlatforms.
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Google Ads</h4>
        <ol className="list-decimal list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Connect Google on the Google Data page (OAuth).</li>
          <li>Use “List Accessible Customers” to verify account access.</li>
          <li>Request a Google Ads <strong>Developer Token</strong> and store it under Workspace Secrets.</li>
          <li>Extend the backend to fetch campaigns and performance for selected customer IDs.</li>
          <li>Correlate campaign performance with psychographic segments to inform creative and bidding.</li>
        </ol>
        <div className="text-xs text-[#6b7280] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Function: googleAdsListAccessibleCustomers (first step). Developer token needed for campaign-level APIs.
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b]">
        <h4 className="text-white font-semibold mb-2">Scenarios</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Use Meta CAPI with SDK event_id dedup to improve conversion attribution and stability.</li>
          <li>Identify psychographic segments that over-index on specific Google Ads creatives; shift budget accordingly.</li>
          <li>Create remarketing audiences based on motivations and cognitive style signals from your site + Meta Pages.</li>
        </ul>
        <div className="text-xs text-[#f59e0b] flex items-center gap-1 mt-2">
          <AlertTriangle className="w-3 h-3" /> Always comply with platform policies and regional privacy regulations (GDPR/CCPA).
        </div>
      </div>
    </section>
  );
}