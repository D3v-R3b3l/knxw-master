import React from 'react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';
import { Webhook, Lock, Database, AlertCircle } from 'lucide-react';

export default function WebhookIngestionDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          <span className="gradient-text gradient-fast">Webhook Ingestion API</span>
          <span className="text-[#a3a3a3]">: Real-Time Data Pipeline</span>
        </h1>
        <p className="text-lg md:text-xl text-[#cbd5e1] leading-relaxed">
          Secure, scalable webhook endpoints for ingesting psychographic signals and behavioral data into knXw's unified data model.
        </p>
      </div>

      <Section title="Authentication & Security" id="auth">
        <p className="text-[#cbd5e1] mb-4">
          All webhook endpoints require Bearer token authentication and support optional request signing for enhanced security.
        </p>

        <CodeBlock language="bash" code={`# Required Headers
Authorization: Bearer <your-api-key>
Content-Type: application/json

# Optional: Request Signing (HMAC-SHA256)
X-knXw-Signature: sha256=<hmac-signature>
X-knXw-Timestamp: <unix-timestamp>`} />

        <Callout type="security" title="API Key Management">
          <p>
            API keys can be generated and managed in the Applications dashboard. Each key is scoped to specific domains and can be revoked instantly.
          </p>
        </Callout>
      </Section>

      <Section title="Signal Ingestion Endpoint" id="signals">
        <p className="text-[#cbd5e1] mb-4">
          The primary endpoint for ingesting psychographic signals and behavioral events.
        </p>

        <CodeBlock language="http" code={`POST https://api.knxw.app/ingest/knxw/signal
Content-Type: application/json
Authorization: Bearer <your-api-key>

{
  "event_id": "evt_expansion_abc123",
  "customer_external_ids": {
    "stripe_customer_id": "cus_abc123",
    "sf_contact_id": "003DEF456",
    "email": "user@example.com"
  },
  "account_external_ids": {
    "sf_account_id": "001ABC123",
    "hs_company_id": "company_789"
  },
  "signal_type": "expansion_signal",
  "score": 0.85,
  "confidence": 0.92,
  "payload": {
    "feature_accessed": "advanced_analytics",
    "session_duration_seconds": 1800,
    "pages_visited": 12,
    "conversion_funnel_stage": "consideration"
  },
  "event_time": "2024-01-15T14:22:00Z"
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Signal Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">Expansion Signals</h4>
            <ul className="text-[#a3a3a3] text-sm space-y-1">
              <li>• <code>expansion_signal</code> - User showing upgrade intent</li>
              <li>• <code>feature_adoption</code> - New feature usage</li>
              <li>• <code>engagement_spike</code> - Increased platform activity</li>
            </ul>
          </div>
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">Risk Signals</h4>
            <ul className="text-[#a3a3a3] text-sm space-y-1">
              <li>• <code>churn_risk</code> - Decreased engagement</li>
              <li>• <code>support_escalation</code> - Support issues</li>
              <li>• <code>payment_friction</code> - Billing problems</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Churn Flag Endpoint" id="churn">
        <p className="text-[#cbd5e1] mb-4">
          Specialized endpoint for updating customer churn risk scores and associated risk factors.
        </p>

        <CodeBlock language="http" code={`POST https://api.knxw.app/ingest/knxw/churn-flag
Content-Type: application/json
Authorization: Bearer <your-api-key>

{
  "customer_external_ids": {
    "stripe_customer_id": "cus_abc123",
    "email": "user@example.com"
  },
  "risk_score": 0.73,
  "risk_category": "high",
  "drivers": [
    "decreased_usage",
    "support_tickets_increase", 
    "payment_delays",
    "feature_abandonment"
  ],
  "model_metadata": {
    "model_version": "churn_v2.1",
    "features_used": ["usage_trend", "support_sentiment", "billing_history"],
    "prediction_confidence": 0.89
  },
  "event_time": "2024-01-15T14:22:00Z"
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Risk Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <span className="text-white font-semibold">High Risk</span>
              <span className="text-[#a3a3a3] ml-2">(0.7 - 1.0) - Immediate intervention required</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <span className="text-white font-semibold">Medium Risk</span>
              <span className="text-[#a3a3a3] ml-2">(0.4 - 0.69) - Proactive engagement needed</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <span className="text-white font-semibold">Low Risk</span>
              <span className="text-[#a3a3a3] ml-2">(0.0 - 0.39) - Standard monitoring</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Response Format" id="responses">
        <p className="text-[#cbd5e1] mb-4">
          All webhook endpoints return structured JSON responses with processing details and identity resolution information.
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Successful Response</h3>
        <CodeBlock language="json" code={`{
  "success": true,
  "event_id": "evt_expansion_abc123",
  "customer_id": "cust_unified_789",
  "identity_resolution": {
    "method": "deterministic",
    "confidence": 1.0,
    "matched_on": "stripe_customer_id",
    "created_new_customer": false
  },
  "signal_processing": {
    "signal_id": "sig_12345",
    "status": "ingested",
    "materialized_views_updated": true
  },
  "processed_at": "2024-01-15T14:22:15Z"
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Error Response</h3>
        <CodeBlock language="json" code={`{
  "success": false,
  "error": "Identity resolution failed",
  "error_code": "IDENTITY_RESOLUTION_FAILED",
  "details": {
    "issue": "Multiple customers found with conflicting external_ids",
    "suggested_action": "Provide additional identifying information"
  },
  "request_id": "req_abc123"
}`} />
      </Section>

      <Section title="Rate Limits & Quotas" id="limits">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-3">Rate Limits</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• <strong>Developer Plan:</strong> 100 requests/hour</li>
              <li>• <strong>Growth Plan:</strong> 1,000 requests/hour</li>
              <li>• <strong>Pro Plan:</strong> 10,000 requests/hour</li>
              <li>• <strong>Enterprise:</strong> Custom limits available</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-3">Best Practices</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Use unique event_ids to prevent duplicates</li>
              <li>• Include multiple external_ids for better matching</li>
              <li>• Batch events when possible</li>
              <li>• Implement exponential backoff for retries</li>
            </ul>
          </div>
        </div>

        <Callout type="info" title="Idempotency">
          <p>
            All webhook endpoints are idempotent. Sending the same event_id multiple times will not create duplicate records.
          </p>
        </Callout>
      </Section>
    </div>
  );
}