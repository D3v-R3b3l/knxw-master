import React from 'react';
import DocSection from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';

export default function StripeIntegrationDoc() {
  return (
    <div>
      <DocSection title="Stripe: Billing & Subscription Sync" id="stripe">
        <Callout type="info" title="What is implemented">
          <p className="text-[#a3a3a3]">
            The app creates or updates <code>BillingSubscription</code> records on signup and plan changes,
            starts Stripe Checkout through <code>createCheckout</code>, and syncs Stripe subscription and invoice events through <code>stripeWebhookHandler</code>.
          </p>
        </Callout>

        <h3 className="text-white font-semibold mt-4 mb-2">1) Start checkout or change plan</h3>
        <CodeBlock language="javascript" code={`import { createCheckout } from "@/functions/createCheckout";

const response = await createCheckout({ plan_key: "growth" });
const data = response?.data || {};

if (data.checkout_url) {
  window.location.href = data.checkout_url;
}

if (data.redirect_url) {
  window.location.href = data.redirect_url;
}`} />

        <h3 className="text-white font-semibold mt-6 mb-2">2) Default subscription on signup</h3>
        <p className="text-[#a3a3a3]">
          A <code>User</code> entity automation invokes <code>ensureBillingSubscription</code> on create,
          which provisions a default <code>developer</code> subscription row for the new user.
        </p>

        <h3 className="text-white font-semibold mt-6 mb-2">3) Webhook sync</h3>
        <p className="text-[#a3a3a3]">
          <code>stripeWebhookHandler</code> verifies Stripe signatures and syncs:
        </p>
        <ul className="list-disc list-inside text-[#cbd5e1]">
          <li><code>customer.subscription.created|updated|deleted</code> → plan, status, billing period</li>
          <li><code>invoice.payment_succeeded|failed</code> → invoice URL and payment state</li>
          <li><code>checkout.session.completed</code> → customer / subscription linkage</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Required secrets</h3>
        <ul className="list-disc list-inside text-[#cbd5e1]">
          <li><code>STRIPE_SECRET_KEY</code></li>
          <li><code>STRIPE_WEBHOOK_SECRET</code></li>
          <li>Price IDs for each paid plan</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Testing</h3>
        <ul className="list-disc list-inside text-[#cbd5e1]">
          <li>Use Stripe test mode with a test card like <code>4242 4242 4242 4242</code>.</li>
          <li>Confirm <code>BillingSubscription</code> changes after checkout and webhook delivery.</li>
          <li>Verify invoice URLs and status transitions on succeeded and failed payments.</li>
        </ul>
      </DocSection>
    </div>
  );
}