import React from 'react';
import Section from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';
import { Shield, Activity, Zap, AlertTriangle, Database, Cloud } from 'lucide-react';

export default function EnterpriseIntegrationsDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          <span className="gradient-text gradient-fast">Enterprise Integrations</span>
          <span className="text-[#a3a3a3]">: Mission-Critical Connectivity</span>
        </h1>
        <p className="text-lg md:text-xl text-[#cbd5e1] leading-relaxed">
          Enterprise-grade integrations with enhanced security, monitoring, and reliability
          for mission-critical business operations and compliance requirements.
        </p>
      </div>

      <Section title="Security & Monitoring Integrations" icon={Shield}>
        <p className="text-[#cbd5e1] mb-6">
          Advanced integrations for enterprise security monitoring and threat intelligence:
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00d4ff]" />
              SIEM Integration
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm mb-4">
              <li>• Real-time security event streaming</li>
              <li>• Automated threat correlation</li>
              <li>• Compliance audit trails</li>
              <li>• Incident response automation</li>
            </ul>
            
            <CodeBlock language="javascript" code={`// SIEM integration example
import { enterpriseMonitor } from '@/functions/enterpriseMonitor';

// Stream security events to SIEM
const securityScan = await enterpriseMonitor({ 
  action: 'security_scan' 
});

// Automatically correlate with threat intelligence
if (securityScan.result.vulnerabilities > 0) {
  await streamToSIEM({
    event_type: 'vulnerability_detected',
    severity: 'high',
    details: securityScan.result.findings
  });
}`} />
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#10b981]" />
              APM Integration
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm mb-4">
              <li>• Application performance monitoring</li>
              <li>• Distributed tracing</li>
              <li>• Error tracking and analysis</li>
              <li>• Performance optimization alerts</li>
            </ul>
            
            <CodeBlock language="javascript" code={`// APM performance tracking
const performance = await enterpriseMonitor({ 
  action: 'performance_analysis' 
});

// Send metrics to APM platform
await sendToAPM({
  service: 'knxw-analytics',
  metrics: {
    responseTime: performance.result.metrics.responseTime,
    throughput: performance.result.metrics.throughput,
    errorRate: performance.result.metrics.errorRate
  },
  recommendations: performance.result.recommendations
});`} />
          </div>
        </div>
      </Section>

      <Section title="Enterprise Identity & Access Management" icon={Shield}>
        <p className="text-[#cbd5e1] mb-4">
          Seamless integration with enterprise identity providers and access management systems:
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Supported Identity Providers</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">SAML 2.0</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Active Directory Federation Services</li>
                <li>• Okta Enterprise</li>
                <li>• Azure Active Directory</li>
                <li>• PingFederate</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">OpenID Connect</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Auth0 Enterprise</li>
                <li>• Google Workspace</li>
                <li>• Microsoft Entra ID</li>
                <li>• Custom OIDC providers</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">LDAP/AD</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Microsoft Active Directory</li>
                <li>• OpenLDAP</li>
                <li>• IBM Security Directory</li>
                <li>• Oracle Internet Directory</li>
              </ul>
            </div>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// Configure enterprise SSO
import { SSOProviderConfig } from '@/entities/SSOProviderConfig';

// Azure AD SAML configuration
const azureSSO = await SSOProviderConfig.create({
  provider: 'azuread',
  display_name: 'Azure Active Directory',
  metadata_url: 'https://login.microsoftonline.com/{tenant}/federationmetadata/2007-06/federationmetadata.xml',
  active: true,
  role_mapping: {
    'Admin': 'admin',
    'PowerUser': 'analyst', 
    'ReadOnly': 'viewer'
  }
});

// Okta OIDC configuration
const oktaSSO = await SSOProviderConfig.create({
  provider: 'okta',
  display_name: 'Okta Enterprise',
  metadata_url: 'https://{domain}.okta.com/.well-known/openid_configuration',
  client_id: process.env.OKTA_CLIENT_ID,
  active: true,
  role_mapping: {
    'knxw-admins': 'admin',
    'knxw-analysts': 'analyst',
    'knxw-viewers': 'viewer'
  }
});`} />
      </Section>

      <Section title="Advanced Analytics & BI Integration" icon={Database}>
        <p className="text-[#cbd5e1] mb-4">
          Connect knXw with enterprise analytics and business intelligence platforms:
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-white font-semibold mb-3">Data Warehouse Integration</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Snowflake data sharing</li>
              <li>• Amazon Redshift connectivity</li>
              <li>• Google BigQuery export</li>
              <li>• Azure Synapse Analytics</li>
              <li>• Real-time data streaming</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-white font-semibold mb-3">BI Platform Support</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Tableau Server connectivity</li>
              <li>• Power BI Premium integration</li>
              <li>• Looker custom connections</li>
              <li>• Qlik Sense enterprise</li>
              <li>• Custom REST API endpoints</li>
            </ul>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// Export to data warehouse
import { awsS3Export } from '@/functions/awsS3Export';
import { awsEventBridge } from '@/functions/awsEventBridge';

// Daily data export to Snowflake
const exportToWarehouse = async () => {
  // Export psychographic profiles
  const profileExport = await awsS3Export({
    client_app_id: 'your-app-id',
    bucket_name: 'enterprise-data-lake',
    object_key: \`psychographic-profiles/\${new Date().toISOString().slice(0,10)}.json\`,
    data: await UserPsychographicProfile.filter({}, '-created_date', 10000)
  });

  // Trigger Snowflake ingestion via EventBridge
  await awsEventBridge({
    client_app_id: 'your-app-id',
    event_bus_name: 'enterprise-data-pipeline',
    source: 'knxw.data-export',
    events: [{
      type: 'data_export_completed',
      payload: {
        export_type: 'psychographic_profiles',
        s3_location: profileExport.data.s3_url,
        record_count: 10000,
        export_date: new Date().toISOString()
      }
    }]
  });
};`} />
      </Section>

      <Section title="Enterprise Communication & Collaboration" icon={Zap}>
        <p className="text-[#cbd5e1] mb-4">
          Enhanced communication integrations for enterprise teams and workflows:
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Communication Platforms</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Microsoft Teams</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Automated insights delivery</li>
                <li>• Interactive report cards</li>
                <li>• Alert notifications</li>
                <li>• Bot integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Slack Enterprise</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Custom slash commands</li>
                <li>• Workflow automations</li>
                <li>• Channel-based reporting</li>
                <li>• Security alerts</li>
              </ul>
            </div>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// Teams/Slack integration for alerts
import { notifyChannels } from '@/functions/notifyChannels';

// Send critical security alert to Teams
await notifyChannels({
  channels: ['microsoft-teams', 'slack-security'],
  alert: {
    type: 'security_incident',
    severity: 'critical',
    title: 'Multiple failed authentication attempts detected',
    details: {
      affected_users: 15,
      source_ips: ['192.168.1.100', '10.0.0.50'],
      time_window: '5 minutes'
    },
    actions: [
      { text: 'View Details', url: '/security/incidents/123' },
      { text: 'Lock Accounts', action: 'lock_affected_accounts' }
    ]
  }
});

// Automated daily insights delivery
const dailyInsights = await generateExecutiveReport({
  format: 'teams_card',
  include_charts: true,
  time_period: 'last_24_hours'
});

await notifyChannels({
  channels: ['microsoft-teams-exec'],
  message: dailyInsights
});`} />
      </Section>

      <Section title="Compliance & Governance Integration" icon={AlertTriangle}>
        <p className="text-[#cbd5e1] mb-4">
          Automated compliance monitoring and governance integrations:
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-white font-semibold mb-3">Compliance Frameworks</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• SOC 2 Type II compliance</li>
              <li>• ISO 27001 certification</li>
              <li>• GDPR data protection</li>
              <li>• HIPAA healthcare compliance</li>
              <li>• PCI DSS payment security</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-white font-semibold mb-3">Audit & Reporting</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Automated audit trail generation</li>
              <li>• Compliance dashboard</li>
              <li>• Risk assessment reports</li>
              <li>• Data retention policies</li>
              <li>• Privacy impact assessments</li>
            </ul>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// Automated compliance monitoring
import { generateExecutiveReport } from '@/functions/generateExecutiveReport';
import { exportAccessLogs } from '@/functions/exportAccessLogs';

// Generate SOC 2 compliance report
const complianceReport = await generateExecutiveReport({
  report_type: 'compliance_audit',
  framework: 'soc2_type2',
  time_period: 'quarterly',
  include_evidence: true,
  export_format: 'pdf'
});

// Export audit logs for external auditors
const auditLogs = await exportAccessLogs({
  start_date: '2024-01-01',
  end_date: '2024-03-31',
  format: 'csv',
  include_pii: false, // GDPR compliance
  retention_policy: 'audit_required'
});

// Data privacy compliance check
const privacyCompliance = await checkPrivacyCompliance({
  data_subjects: 'eu_residents',
  rights_requests: ['access', 'deletion', 'portability'],
  consent_tracking: true
});`} />
      </Section>

      <Section title="Enterprise DevOps Integration" icon={Cloud}>
        <p className="text-[#cbd5e1] mb-4">
          Seamless integration with enterprise DevOps and deployment pipelines:
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">CI/CD Pipeline Integration</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Jenkins Enterprise</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Automated deployment hooks</li>
                <li>• Health check validations</li>
                <li>• Performance testing</li>
                <li>• Rollback triggers</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Azure DevOps</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Pipeline status updates</li>
                <li>• Work item integration</li>
                <li>• Release management</li>
                <li>• Test automation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">GitLab CI/CD</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Container deployment</li>
                <li>• Security scanning</li>
                <li>• Environment promotion</li>
                <li>• Monitoring alerts</li>
              </ul>
            </div>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// DevOps pipeline integration
import { simpleDeploymentMonitor } from '@/functions/simpleDeploymentMonitor';

// Post-deployment health check
const postDeploymentCheck = async () => {
  const healthCheck = await simpleDeploymentMonitor({ action: 'health' });
  
  if (healthCheck.result.overall !== 'healthy') {
    // Trigger rollback in CI/CD pipeline
    await triggerRollback({
      reason: 'health_check_failed',
      details: healthCheck.result.checks,
      rollback_version: process.env.PREVIOUS_VERSION
    });
    
    throw new Error('Deployment health check failed - rollback initiated');
  }
  
  // Update deployment status
  await updateDeploymentStatus({
    status: 'success',
    version: process.env.BUILD_VERSION,
    health_check: healthCheck.result
  });
};

// Performance regression testing
const performanceValidation = await enterpriseMonitor({ 
  action: 'performance_analysis' 
});

if (performanceValidation.result.metrics.responseTime.avg > 200) {
  await notifyDevOpsTeam({
    alert: 'Performance regression detected',
    current_latency: performanceValidation.result.metrics.responseTime.avg,
    baseline_latency: 150,
    recommendation: 'Review recent changes and consider rollback'
  });
}`} />

        <Callout type="success" title="Enterprise Ready">
          <p>
            All enterprise integrations include comprehensive monitoring, automated failover,
            and 24/7 support with guaranteed SLA compliance for mission-critical operations.
          </p>
        </Callout>
      </Section>
    </div>
  );
}