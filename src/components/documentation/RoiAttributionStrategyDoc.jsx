import React from 'react';
import DocSection from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function RoiAttributionStrategyDoc() {
  return (
    <div>
      <DocSection
        title={<><span className="gradient-text gradient-fast">ROI Attribution Strategy</span><span className="text-[#a3a3a3]">: A step‑by‑step, verifiable implementation</span></>}
        id="roi-strategy-overview"
      >
        <p className="text-[#cbd5e1]">
          This playbook replaces vague bullets with a precise, end‑to‑end setup you can follow and verify.
          It covers workspace setup, SDK installation, identity capture, server‑side conversions, feedback to Meta/Google,
          deduplication, attribution modeling, and a hard verification checklist—plus common errors and fixes.
        </p>
      </DocSection>

      <DocSection title="Who is this for and what you need (Prerequisites)" id="roi-prerequisites">
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-2">
          <li>Access to your knXw app with admin role.</li>
          <li>Your website domain(s) ready (production + staging if applicable).</li>
          <li>Meta Pixel ID + CAPI Access Token (system user token) for your ad account.</li>
          <li>Google Ads Customer ID, Developer Token, and GA4 Measurement ID + API Secret.</li>
          <li>Server access to call backend functions (we’ll use provided functions—no custom infra required).</li>
        </ul>
      </DocSection>

      <DocSection title="Step 1 — Create a Workspace and Authorize Domains" id="roi-step-1">
        <ol className="list-decimal list-inside text-[#cbd5e1] space-y-2">
          <li>Go to “Attribution Settings”. Create a Workspace (e.g., “Main Site”), set timezone.</li>
          <li>Add each exact site origin under Authorized Domains (e.g., <code>https://www.example.com</code>, <code>https://staging.example.com</code>).</li>
          <li>Save. You’ll reference this <code>workspace_id</code> in later steps.</li>
        </ol>
        <Callout type="info" title="Tip">
          If you operate multiple brands or regions, create one workspace per brand/region to keep secrets and reporting separate.
        </Callout>
      </DocSection>

      <DocSection title="Step 2 — Enter Ad Platform Secrets (Server‑side only)" id="roi-step-2">
        <p className="text-[#cbd5e1] mb-2">Open “Workspace Secrets” for the workspace you just created and add:</p>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>Meta: <code>meta_pixel_id</code>, <code>meta_access_token</code> (CAPI), optional <code>test_event_code</code></li>
          <li>Google: <code>google_ads_customer_id</code>, <code>google_ads_dev_token</code>, <code>ga4_measurement_id</code>, <code>ga4_api_secret</code></li>
          <li>SDK: <code>sdk_signing_key</code> is required to generate signed snippets</li>
        </ul>
        <Callout type="warning" title="Security">
          Secrets are never exposed in the frontend. Functions read them on the server; do not paste these into pages/components.
        </Callout>
      </DocSection>

      <DocSection title="Step 3 — Install the SDK (HTML snippet) for client‑side signals" id="roi-step-3">
        <p className="text-[#cbd5e1]">Install the universal snippet in your site’s head to capture page_view and behavioral context.</p>
        <h4 className="text-white font-semibold mt-3 mb-2">Option A — Generate signed snippet</h4>
        <CodeBlock
          language="javascript"
          code={`import { getSdkSnippet } from "@/functions/getSdkSnippet";

const { data } = await getSdkSnippet({
  workspace_id: "<YOUR_WORKSPACE_ID>",
  authorized_origin: window.location.origin
});

// Paste data.snippet into your site's <head> (CMS/theme injection or template)
console.log(data.snippet);`}
        />
        <h4 className="text-white font-semibold mt-4 mb-2">Option B — Hosted script</h4>
        <CodeBlock
          language="html"
          code={`<!-- In your site's <head> -->
<script defer src="/functions/serveAnalyticsScript"></script>
<script>
  window.knXw = window.knXw || [];
  window.knXwConfig = {
    workspace_id: "<YOUR_WORKSPACE_ID>",
    api_key: "<PUBLIC_API_KEY>",
    authorized_origin: window.location.origin
  };
</script>`}
        />
        <Callout type="strategy" title="Consent">
          Load the snippet only after consent is granted. Gate the script injection behind your CMP callback.
        </Callout>
      </DocSection>

      <DocSection title="Step 4 — Persist identity and click IDs" id="roi-step-4">
        <p className="text-[#cbd5e1] mb-2">
          On landing, capture identifiers and click IDs and persist them for later conversion linking.
        </p>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>Capture: <code>gclid</code>, <code>wbraid</code>, <code>gbraid</code>, <code>fbclid</code>, <code>fbc</code>, <code>fbp</code> from URL/cookies.</li>
          <li>Link to a stable <code>user_id</code> and <code>session_id</code>. If you have email, hash it client‑side.</li>
        </ul>
        <h4 className="text-white font-semibold mt-3 mb-2">Client‑side identify</h4>
        <CodeBlock
          language="javascript"
          code={`// After snippet loads and user is known (e.g., signup or checkout step)
knXw.identify("user_123", {
  email_hash: "<sha256_of_email>",
  client_id: "<your_client_id_if_any>"
});

// Track key funnel transitions for additional context
knXw.track("checkout_started", { plan: "Pro", currency: "USD" });`}
        />
        <Callout type="info" title="Server mapping">
          The backend uses the Identity entity to map client/session IDs, hashed email, and click IDs to the final conversion record.
        </Callout>
      </DocSection>

      <DocSection title="Step 5 — Record conversions (server‑side) and forward to platforms" id="roi-step-5">
        <p className="text-[#cbd5e1] mb-2">
          Send a conversion from your server right after payment/order creation. Use a stable <code>event_id = order_id</code> for deduplication.
        </p>
        <CodeBlock
          language="javascript"
          code={`// Example: call backend function after successful purchase
import { sendConversionToAdPlatforms } from "@/functions/sendConversionToAdPlatforms";

const { data } = await sendConversionToAdPlatforms({
  workspace_id: "<YOUR_WORKSPACE_ID>",
  user_id: "<USER_ID>",
  order_id: "ORDER-100045", // unique and stable
  conversion_name: "purchase",
  amount: 249.00,
  currency: "USD",
  attributes: {
    event_id: "ORDER-100045",      // required for dedup across pixel + server
    psychological_segment: "achievement_motivated",
    items: [{ sku: "SKU-1", qty: 1, price: 249.00 }]
  }
});
// Function persists Conversion, enriches with Identity, and forwards to Meta + Google`}
        />
        <Callout type="warning" title="Do not fire client + server without dedup">
          If you also send a client‑side pixel hit, the same <code>event_id</code> must be used on both sides to avoid double counting.
        </Callout>
      </DocSection>

      <DocSection title="Step 6 — Verify receipts in Meta and Google" id="roi-step-6">
        <div className="space-y-3 text-[#cbd5e1]">
          <div>
            <h4 className="text-white font-semibold">Meta (Events Manager)</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open Events Manager → your Pixel → “Test Events”.</li>
              <li>If you set <code>test_event_code</code> in Workspace Secrets, calls will appear here immediately.</li>
              <li>Confirm the event name, <code>event_id</code>, value, currency, and matching quality.</li>
            </ol>
          </div>
          <div>
            <h4 className="text-white font-semibold">Google (GA4 + Ads)</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>GA4 → DebugView: confirm server events and parameters arrive with value/currency.</li>
              <li>Google Ads → Conversions → Diagnostics: verify conversion source and recent receipts.</li>
              <li>If using Customer Match or enhanced conversions, ensure hashing and consent policies are followed.</li>
            </ol>
          </div>
        </div>
      </DocSection>

      <DocSection title="Step 7 — Attribution modeling that you can change without code" id="roi-step-7">
        <p className="text-[#cbd5e1] mb-2">
          Start with first‑click with decay, then adjust as you observe stable lift. Models are stored in the Attribution entity and can be rotated on a cadence.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "workspace_id": "ws_main",
  "order_id": "ORDER-100045",
  "model": "first_click_with_decay",
  "touchpoints": [
    {"source":"google_ads","ts":"2025-01-01T10:00:00Z","campaign":"Brand_Search"},
    {"source":"meta_ads","ts":"2025-01-03T12:00:00Z","campaign":"Retargeting"}
  ],
  "assigned": { "google_ads": 0.7, "meta_ads": 0.3 }
}`}
        />
        <Callout type="strategy" title="Policy">
          Reevaluate quarterly. Only change models after two complete cycles produce consistent lift with stable cohort quality.
        </Callout>
      </DocSection>

      <DocSection title="KPIs to track weekly (and where to find them)" id="roi-kpis">
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-2">
          <li><strong>True ROAS:</strong> Dashboard → Attribution Overview (uses cross‑platform, deduped conversions).</li>
          <li><strong>Time‑to‑payback (days):</strong> Batch Analytics → Revenue Trends with cost overlay.</li>
          <li><strong>Match Rate (Meta/Google):</strong> Events Manager/Ads Diagnostics → event parameter coverage, identity quality.</li>
          <li><strong>Attribution stability:</strong> % conversions with valid click IDs + event_id.</li>
          <li><strong>Segment yield:</strong> Profit per psychographic segment (User Profiles → Segment Value).</li>
        </ul>
      </DocSection>

      <DocSection title="Verification checklist (do not go live without all checks green)" id="roi-checklist">
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>Workspace created; domains authorized exactly (scheme + host).</li>
          <li>Secrets set: Meta Pixel + CAPI; GA4 + Google Ads; SDK signing key.</li>
          <li>SDK snippet installed and loading only after consent.</li>
          <li>Identity entity contains client/session IDs, hashed email (when available), and click IDs (fbp/fbc/gclid/…)</li>
          <li>Server conversion sent at purchase with event_id = order_id, correct value/currency.</li>
          <li>Receipts visible in Meta Test Events and GA4 DebugView; Ads diagnostics show success.</li>
          <li>Attribution model set; weights sum to 1.0; audit trail exists.</li>
        </ul>
      </DocSection>

      <DocSection title="Common errors and exact fixes" id="roi-troubleshooting">
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-2">
          <li><strong>Double counting:</strong> You fired client + server without shared <code>event_id</code>. Fix: set <code>event_id = order_id</code> on both or disable the duplicate client event.</li>
          <li><strong>No Meta receipts:</strong> Missing/invalid CAPI token or pixel ID, or no <code>test_event_code</code> while testing. Fix in Workspace Secrets; re‑send.</li>
          <li><strong>Low match rate:</strong> No email hash or client ID; missing click IDs. Fix: pass <code>email_hash</code> on identify, ensure fbp/fbc or gclid present, and include IP/UA server‑side if supported.</li>
          <li><strong>Wrong currency/value:</strong> Normalize before send; ensure <code>amount</code> is numeric and <code>currency</code> is ISO‑4217 (e.g., USD).</li>
          <li><strong>GA4 not showing events:</strong> Wrong measurement ID/API secret; property not receiving server events. Fix secrets, confirm DebugView filters, and resend.</li>
        </ul>
      </DocSection>

      <DocSection title="Copy‑paste: minimal working example (MWR)" id="roi-mwe">
        <CodeBlock
          language="javascript"
          code={`// 1) Install SDK (after consent) using hosted script (Step 3B)
// <script defer src="/functions/serveAnalyticsScript"></script>

// 2) Identify when user email is known
knXw.identify("user_123", { email_hash: "<sha256_email>" });

// 3) Track funnel events (optional but helpful)
knXw.track("checkout_started", { plan: "Pro" });

// 4) On server, after purchase, send conversion
import { sendConversionToAdPlatforms } from "@/functions/sendConversionToAdPlatforms";
await sendConversionToAdPlatforms({
  workspace_id: "<YOUR_WORKSPACE_ID>",
  user_id: "user_123",
  order_id: "ORDER-100045",
  conversion_name: "purchase",
  amount: 249.0,
  currency: "USD",
  attributes: { event_id: "ORDER-100045" }
});`}
        />
      </DocSection>

      <DocSection title="Operational cadence (90‑day rollout)" id="roi-cadence">
        <ol className="list-decimal list-inside text-[#cbd5e1] space-y-2">
          <li><strong>Days 0–14:</strong> Configure workspace + secrets, SDK live, test Meta/GA4 receipts, confirm dedup.</li>
          <li><strong>Days 15–45:</strong> Shift 20–30% budget to value‑positive segments/creatives; pause low yield.</li>
          <li><strong>Days 46–90:</strong> Introduce creative variants per psychographic segment; test model weighting.</li>
        </ol>
      </DocSection>
    </div>
  );
}