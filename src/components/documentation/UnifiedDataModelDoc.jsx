import React from 'react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';
import { Database, Users, Link, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

export default function UnifiedDataModelDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          <span className="gradient-text gradient-fast">Unified Data Model</span>
          <span className="text-[#a3a3a3]">: Complete Integration Layer</span>
        </h1>
        <p className="text-lg md:text-xl text-[#cbd5e1] leading-relaxed">
          knXw's unified data integration layer joins psychographic signals with CRM and finance data, 
          providing executive-ready insights and automated CRM write-backs.
        </p>
      </div>

      <Section title="Architecture Overview" id="architecture">
        <p className="text-[#cbd5e1] mb-4">
          The unified data model serves as the foundation for joining psychographic signals with business data from CRM systems (Salesforce, HubSpot) and finance platforms (Stripe). This creates a comprehensive view of customer behavior and business impact.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00d4ff]" />
              Customer Layer
            </h3>
            <p className="text-[#a3a3a3] text-sm">
              Core customer and account entities with identity resolution across all systems.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#10b981]" />
              Signal Layer
            </h3>
            <p className="text-[#a3a3a3] text-sm">
              Psychographic profiles, signals, and behavioral events with confidence scoring.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#8b5cf6]" />
              Business Layer
            </h3>
            <p className="text-[#a3a3a3] text-sm">
              CRM contacts, deals, financial invoices, and subscriptions for revenue attribution.
            </p>
          </div>
        </div>

        <Callout type="info" title="Data Flow">
          <p>
            Data flows from external systems → Core entities → Identity resolution → Materialized views → Executive KPIs
          </p>
        </Callout>
      </Section>

      <Section title="Core Entities" id="entities">
        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Customer & Account Entities</h3>
        
        <CodeBlock language="json" code={`{
  "core.customer": {
    "customer_id": "UUID",
    "account_id": "UUID", 
    "email_hash": "SHA256 hash",
    "external_ids": {
      "stripe_customer_id": "cus_xxx",
      "sf_contact_id": "003xxx",
      "hs_contact_id": "12345",
      "knxw_user_id": "usr_xxx"
    },
    "identity_resolution": {
      "match_confidence": 0.95,
      "resolution_method": "deterministic",
      "last_resolved_at": "2024-01-15T10:30:00Z"
    }
  }
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Psychographic Entities</h3>
        
        <CodeBlock language="json" code={`{
  "knxw.user_profile": {
    "profile_id": "UUID",
    "customer_id": "UUID",
    "top_motives": [
      {"label": "security", "weight": 0.62},
      {"label": "achievement", "weight": 0.38}
    ],
    "confidence": 0.89,
    "risk_profile": {
      "churn_risk": 0.23,
      "expansion_likelihood": 0.78
    }
  },
  "knxw.signal_event": {
    "event_id": "UUID",
    "customer_id": "UUID", 
    "signal_type": "expansion_signal",
    "score": 0.85,
    "confidence": 0.92,
    "event_time": "2024-01-15T14:22:00Z"
  }
}`} />
      </Section>

      <Section title="Identity Resolution" id="identity">
        <p className="text-[#cbd5e1] mb-4">
          knXw uses a sophisticated identity resolution system to link customers across multiple systems:
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Resolution Rules</h3>
        <ol className="list-decimal ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Deterministic Matching:</strong> Direct joins on stripe_customer_id, sf_contact_id, hs_contact_id, or knxw_user_id</li>
          <li><strong>Email Hash Fallback:</strong> SHA256 hash matching on normalized email addresses</li>
          <li><strong>Domain Preference:</strong> When multiple matches exist, prefer customers from the same account domain</li>
          <li><strong>Confidence Scoring:</strong> All matches include a confidence score (0.0 - 1.0)</li>
        </ol>

        <Callout type="warning" title="Data Privacy">
          <p>
            Email addresses are never stored in plain text. All email matching uses SHA256 hashes of normalized (lowercased, trimmed) email addresses.
          </p>
        </Callout>
      </Section>

      <Section title="Webhook Ingestion" id="webhooks">
        <p className="text-[#cbd5e1] mb-4">
          knXw accepts psychographic data via secure webhook endpoints:
        </p>

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Signal Ingestion Endpoint</h3>
        <CodeBlock language="bash" code={`POST /ingest/knxw/signal
Content-Type: application/json
Authorization: Bearer <your-api-key>

{
  "event_id": "evt_abc123",
  "customer_external_ids": {
    "stripe_customer_id": "cus_abc123"
  },
  "account_external_ids": {
    "sf_account_id": "001abc123"
  },
  "signal_type": "expansion_signal",
  "score": 0.85,
  "confidence": 0.92,
  "payload": {
    "feature_usage": "advanced_analytics",
    "session_duration": 1800
  },
  "event_time": "2024-01-15T14:22:00Z"
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Churn Risk Endpoint</h3>
        <CodeBlock language="bash" code={`POST /ingest/knxw/churn-flag
Content-Type: application/json
Authorization: Bearer <your-api-key>

{
  "customer_external_ids": {
    "stripe_customer_id": "cus_abc123"
  },
  "risk_score": 0.73,
  "drivers": [
    "decreased_usage",
    "support_tickets",
    "payment_delays"
  ],
  "event_time": "2024-01-15T14:22:00Z"
}`} />
      </Section>

      <Section title="Executive Metrics" id="metrics">
        <p className="text-[#cbd5e1] mb-4">
          The unified data layer automatically generates executive-ready KPIs:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-3">Revenue Attribution</h4>
            <ul className="text-[#a3a3a3] space-y-1 text-sm">
              <li>• Revenue attributed to psychographic events within 30-day windows</li>
              <li>• CLTV uplift by customer motive</li>
              <li>• ROI per psychological intervention</li>
              <li>• Churn reduction by motive segment</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-3">CRM Synchronization</h4>
            <ul className="text-[#a3a3a3] space-y-1 text-sm">
              <li>• Automatic field mapping to Salesforce/HubSpot</li>
              <li>• Real-time profile updates</li>
              <li>• Confidence-based data quality indicators</li>
              <li>• Bi-directional sync with audit trails</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}