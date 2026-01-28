import React from "react";
import Section from "./Section";
import CodeBlock from "./CodeBlock";
import Callout from "./Callout";

export default function EnterpriseSecurityDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        Enterprise Security & Compliance
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        SOC2-ready architecture with role-based access control, comprehensive audit logging, 
        and enterprise-grade security for mission-critical deployments.
      </p>

      <Section title="Role-Based Access Control (RBAC)">
        <p className="text-[#cbd5e1] mb-4">
          knXw implements granular RBAC with customizable role templates and per-app access control:
        </p>
        
        <h4 className="text-white font-bold mt-6 mb-3">Default Roles</h4>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h5 className="text-[#00d4ff] font-bold mb-2">Admin</h5>
            <p className="text-[#a3a3a3] text-sm mb-2">Full system access</p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>✓ Manage apps & users</li>
              <li>✓ Configure integrations</li>
              <li>✓ View audit logs</li>
              <li>✓ Manage billing</li>
            </ul>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h5 className="text-[#10b981] font-bold mb-2">Analyst</h5>
            <p className="text-[#a3a3a3] text-sm mb-2">Read-only analytics</p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>✓ View profiles & insights</li>
              <li>✓ Access dashboards</li>
              <li>✓ Export reports</li>
              <li>✗ No configuration changes</li>
            </ul>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h5 className="text-[#8b5cf6] font-bold mb-2">Viewer</h5>
            <p className="text-[#a3a3a3] text-sm mb-2">Limited read access</p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>✓ View basic metrics</li>
              <li>✓ Read documentation</li>
              <li>✗ No profile access</li>
              <li>✗ No exports</li>
            </ul>
          </div>
        </div>

        <h4 className="text-white font-bold mt-6 mb-3">Creating Custom Roles</h4>
        <CodeBlock language="javascript">
{`const customRole = await base44.entities.RoleTemplate.create({
  name: "marketing_specialist",
  description: "Marketing team with engagement management",
  permissions: {
    manage_apps: false,
    manage_rbac: false,
    view_profiles: true,
    manage_engagements: true,
    view_insights: true,
    manage_billing: false,
    manage_compliance: false,
    view_audit_logs: false
  },
  is_system: false
});`}
        </CodeBlock>

        <h4 className="text-white font-bold mt-6 mb-3">Granting User Access</h4>
        <CodeBlock language="javascript">
{`const access = await base44.entities.UserAppAccess.create({
  client_app_id: "app_123",
  user_email: "analyst@company.com",
  role_name: "analyst",
  status: "active"
});`}
        </CodeBlock>
      </Section>

      <Section title="Comprehensive Audit Logs">
        <p className="text-[#cbd5e1] mb-4">
          Every action in knXw is logged for compliance, security investigations, and operational transparency:
        </p>
        <CodeBlock language="javascript">
{`// Query audit logs
const logs = await base44.entities.AuditLog.filter({
  org_id: "org_123",
  action: "delete",
  table_name: "UserPsychographicProfile"
}, '-timestamp', 100);

// Example log entry:
{
  "timestamp": "2026-01-28T10:30:00Z",
  "org_id": "org_123",
  "user_id": "user_456",
  "action": "update",
  "table_name": "EngagementRule",
  "record_id": "rule_789",
  "before": { "status": "active" },
  "after": { "status": "paused" },
  "request_id": "req_abc123",
  "ip_address": "192.168.1.1"
}`}
        </CodeBlock>

        <p className="text-[#cbd5e1] mt-4">
          <strong>Audit Log Retention:</strong> Pro and Enterprise plans include unlimited audit log retention. 
          Developer and Growth plans retain 90 days.
        </p>
      </Section>

      <Section title="Data Encryption">
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>At Rest:</strong> AES-256 encryption for all stored data</li>
          <li><strong>In Transit:</strong> TLS 1.3 for all API communications</li>
          <li><strong>Secrets Management:</strong> Encrypted storage for API keys and credentials</li>
          <li><strong>Field-Level Encryption:</strong> Additional encryption for sensitive PII fields</li>
        </ul>
      </Section>

      <Section title="Compliance Features">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-white font-bold mb-2">GDPR Compliance</h4>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>✓ Data export on request</li>
              <li>✓ Right to deletion</li>
              <li>✓ Consent management</li>
              <li>✓ Data processing agreements</li>
            </ul>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-white font-bold mb-2">SOC2 Type II</h4>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>✓ Annual third-party audits</li>
              <li>✓ Access controls & MFA</li>
              <li>✓ Change management</li>
              <li>✓ Incident response</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="SSO Integration">
        <p className="text-[#cbd5e1] mb-4">
          Enterprise plans support Single Sign-On via:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-1">
          <li>Okta</li>
          <li>Azure Active Directory</li>
          <li>Google Workspace</li>
          <li>Custom SAML 2.0 providers</li>
        </ul>
      </Section>

      <Callout type="info">
        <p>
          <strong>Enterprise Support:</strong> Pro and Enterprise customers receive dedicated security 
          documentation, pen test coordination, and compliance assistance.
        </p>
      </Callout>
    </div>
  );
}