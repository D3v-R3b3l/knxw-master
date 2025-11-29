
import React from 'react';
import DocSection from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';

export default function StripeIntegrationDoc() {
  return (
    <div>
      <DocSection title="Stripe (Optional): Billing & Subscriptions" id="stripe">
        <Callout type="info" title="Why Stripe is listed here">
          <p className="text-[#a3a3a3]">
            Stripe is included because this app supports subscription billing and plan management.
            It is <strong>not required</strong> for psychographic analytics or ad integrations. If you don’t sell plans via Stripe, you can skip this section.
          </p>
        </Callout>

        <Callout type="info" title="How it works">
          <p>The backend function creates a Checkout Session with your connected Stripe account. On success, redirect using the returned <code>url</code>. Webhooks update subscription state.</p>
        </Callout>

        <h3 className="text-white font-semibold mt-4 mb-2">1) Fetch products for pricing UI</h3>
        <CodeBlock language="javascript" code={`import { getStripeProducts } from "@/functions/getStripeProducts";

const { data: products } = await getStripeProducts();
// products = [{ product: {...}, prices: [{id, unit_amount, recurring?...}] }, ...]`} />

        <h3 className="text-white font-semibold mt-6 mb-2">2) Start a Checkout Session</h3>
        <CodeBlock language="javascript" code={`import { createCheckout } from "@/functions/createCheckout";

const { data } = await createCheckout({
  price_id: "<stripe-price-id>",
  mode: "subscription", // or "payment" for one-time
  success_url: window.location.origin + "/Pricing?status=success",
  cancel_url: window.location.origin + "/Pricing?status=cancel"
});
window.location.href = data.url;`} />

        <h3 className="text-white font-semibold mt-6 mb-2">3) Webhooks and subscription state</h3>
        <p className="text-[#a3a3a3]">The <code>stripeWebhookHandler</code> processes checkout and subscription events. See Dashboard &gt; Code &gt; Functions for logs.</p>

        <h3 className="text-white font-semibold mt-6 mb-2">Testing</h3>
        <ul className="list-disc list-inside text-[#cbd5e1]">
          <li>Use test cards (e.g., <code>4242 4242 4242 4242</code> with any future expiry) in Stripe test mode.</li>
          <li>Verify sessions in Stripe Dashboard &gt; Payments or Subscriptions.</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Troubleshooting</h3>
        <ul className="list-disc list-inside text-[#cbd5e1]">
          <li><strong>Session not created:</strong> Ensure <code>price_id</code> is active and matches the mode (payment vs subscription).</li>
          <li><strong>Webhook errors:</strong> See <code>stripeWebhookHandler</code> logs and confirm the endpoint secret if configured.</li>
        </ul>
      </DocSection>
    </div>
  );
}
