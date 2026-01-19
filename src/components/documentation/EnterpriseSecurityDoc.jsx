import React from 'react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';
import { Shield, Lock, Eye, AlertTriangle, Activity } from 'lucide-react';

export default function EnterpriseSecurityDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          <span className="gradient-text gradient-fast">Enterprise Security</span>
          <span className="text-[#a3a3a3]">: Military-Grade Protection</span>
        </h1>
        <p className="text-lg md:text-xl text-[#cbd5e1] leading-relaxed">
          knXw's enterprise security framework provides comprehensive protection with real-time threat detection,
          advanced monitoring, and automated incident response for mission-critical workloads.
        </p>
      </div>

      <Section title="Security Architecture Overview" icon={Shield}>
        <p className="text-[#cbd5e1] mb-6">
          Our multi-layered security architecture protects against sophisticated threats while maintaining
          operational efficiency and user experience.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00d4ff]" />
              Authentication & Authorization
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Enhanced session validation with heartbeat monitoring</li>
              <li>• Role-based access control (RBAC) with granular permissions</li>
              <li>• Multi-factor authentication support</li>
              <li>• Session security with automatic timeout and refresh</li>
              <li>• SSO integration with enterprise identity providers</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#10b981]" />
              Real-Time Threat Detection
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• DOM manipulation monitoring</li>
              <li>• Suspicious script injection detection</li>
              <li>• Network request anomaly detection</li>
              <li>• CSP violation reporting and analysis</li>
              <li>• Behavioral analysis for attack pattern recognition</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
              Advanced Rate Limiting
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Sliding window algorithm implementation</li>
              <li>• Per-user and per-endpoint rate limiting</li>
              <li>• Dynamic threshold adjustment</li>
              <li>• DDoS protection with circuit breakers</li>
              <li>• Intelligent traffic shaping</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#ec4899]" />
              Security Monitoring
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Real-time security event logging</li>
              <li>• Automated threat level assessment</li>
              <li>• Security metrics and KPI tracking</li>
              <li>• Compliance audit trail</li>
              <li>• Integration with SIEM systems</li>
            </ul>
          </div>
        </div>

        <Callout type="info" title="Security Best Practices">
          <p>
            knXw implements security best practices including encryption at rest and in transit,
            audit logging, role-based access control, and data protection measures.
          </p>
        </Callout>
      </Section>

      <Section title="SecurityProvider Integration" id="security-provider">
        <p className="text-[#cbd5e1] mb-4">
          The SecurityProvider component provides comprehensive client-side security monitoring
          and automatic threat detection for your applications.
        </p>

        <CodeBlock language="jsx" code={`// Implement SecurityProvider in your application
import { SecurityProvider } from '@/components/security/SecurityProvider';

function App() {
  return (
    <SecurityProvider>
      <YourApplication />
    </SecurityProvider>
  );
}

// Use security hooks in components
import { useSecurity, usePermission } from '@/components/security/SecurityProvider';

function SecureComponent() {
  const { 
    user, 
    threatLevel, 
    securityEvents, 
    actions 
  } = useSecurity();
  
  const canEdit = usePermission('profiles', 'edit');
  
  // Automatically reports security events
  useEffect(() => {
    if (threatLevel === 'high') {
      actions.lockSession();
      // Additional security measures
    }
  }, [threatLevel]);

  return (
    <div>
      {canEdit && <EditButton />}
      <ThreatLevelIndicator level={threatLevel} />
    </div>
  );
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Automatic Threat Detection</h3>
        <p className="text-[#cbd5e1] mb-4">
          The SecurityProvider automatically monitors for various security threats:
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">DOM Monitoring</h4>
            <p className="text-[#a3a3a3] text-sm">
              Detects suspicious DOM modifications, script injections, and iframe manipulations
              that could indicate XSS attacks.
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">Network Analysis</h4>
            <p className="text-[#a3a3a3] text-sm">
              Monitors fetch requests for suspicious URLs, data exfiltration attempts,
              and unauthorized API calls.
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">CSP Violations</h4>
            <p className="text-[#a3a3a3] text-sm">
              Tracks Content Security Policy violations and automatically adjusts
              threat levels based on violation patterns.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Enterprise Monitoring Dashboard" id="monitoring-dashboard">
        <p className="text-[#cbd5e1] mb-4">
          Access comprehensive security monitoring through the Enterprise Security Dashboard
          at <code>/EnterpriseSecurityDashboard</code>.
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Dashboard Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Real-Time Security Metrics</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Active threat level monitoring</li>
                <li>• Security event timeline</li>
                <li>• User session analytics</li>
                <li>• Permission violation tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">System Health Overview</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Infrastructure health status</li>
                <li>• Performance metrics</li>
                <li>• Capacity utilization</li>
                <li>• Alert management</li>
              </ul>
            </div>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// Access monitoring endpoints programmatically
import { simpleDeploymentMonitor } from '@/functions/simpleDeploymentMonitor';
import { enterpriseMonitor } from '@/functions/enterpriseMonitor';

// Basic health check
const { data } = await simpleDeploymentMonitor({ action: 'health' });

// Comprehensive enterprise monitoring
const monitoring = await enterpriseMonitor({ 
  action: 'comprehensive_check' 
});

// Security scan
const securityScan = await enterpriseMonitor({ 
  action: 'security_scan' 
});

// Performance analysis
const performance = await enterpriseMonitor({ 
  action: 'performance_analysis' 
});`} />
      </Section>

      <Section title="Security Configuration" id="configuration">
        <h3 className="text-2xl font-semibold text-white mb-3">Security Headers</h3>
        <p className="text-[#cbd5e1] mb-4">
          knXw automatically applies enterprise-grade security headers to all responses:
        </p>

        <CodeBlock language="http" code={`# Automatically applied security headers
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Permissions-Policy: camera=(), microphone=(), geolocation=()`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Rate Limiting Configuration</h3>
        <CodeBlock language="javascript" code={`// Configure custom rate limits
const securityValidator = new SecurityValidator(base44);

// Check rate limit with custom settings
const rateLimitResult = await securityValidator.checkRateLimit(
  'user_123', 
  'api_call',
  {
    maxAttempts: 100,     // Max requests
    windowMs: 60000,      // Time window (1 minute)
    skipSuccessful: false // Count all requests
  }
);

if (!rateLimitResult.allowed) {
  throw new SecurityError('Rate limit exceeded', 'RATE_LIMITED', 429);
}`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Input Validation</h3>
        <CodeBlock language="javascript" code={`// Enterprise-grade input validation
const securityValidator = new SecurityValidator(base44);

// Validate and sanitize user input
const cleanInput = securityValidator.validateAndSanitizeInput(
  userInput,
  {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', minLength: 2, maxLength: 100 }
    },
    required: ['email', 'name']
  },
  { 
    context: 'user_registration',
    sanitizeHtml: true,
    validateUrls: true 
  }
);`} />
      </Section>

      <Section title="Incident Response" id="incident-response">
        <p className="text-[#cbd5e1] mb-4">
          knXw's automated incident response system provides immediate threat mitigation:
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">Critical Threats</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Automatic session termination</li>
              <li>• IP address blocking</li>
              <li>• Alert escalation</li>
              <li>• Forensic data collection</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-orange-400 font-semibold mb-2">High Threats</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Enhanced monitoring</li>
              <li>• Rate limit reduction</li>
              <li>• Additional validation</li>
              <li>• Security team notification</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">Medium Threats</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Increased logging</li>
              <li>• User behavior analysis</li>
              <li>• Gradual restrictions</li>
              <li>• Preventive measures</li>
            </ul>
          </div>
        </div>

        <Callout type="warning" title="Zero-Trust Architecture">
          <p>
            knXw implements a zero-trust security model where every request is verified,
            every user is authenticated, and every action is authorized regardless of location or previous access.
          </p>
        </Callout>
      </Section>

      <Section title="Compliance & Auditing" id="compliance">
        <p className="text-[#cbd5e1] mb-4">
          Comprehensive audit logging and compliance features ensure your organization
          meets regulatory requirements:
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Compliance Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Audit Logging</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• All user actions logged</li>
                <li>• Data access tracking</li>
                <li>• Permission changes</li>
                <li>• Security events</li>
                <li>• System modifications</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#00d4ff] font-semibold mb-2">Data Protection</h4>
              <ul className="text-[#a3a3a3] text-sm space-y-1">
                <li>• Encryption at rest and in transit</li>
                <li>• PII detection and protection</li>
                <li>• Right to be forgotten</li>
                <li>• Data retention policies</li>
                <li>• Consent management</li>
              </ul>
            </div>
          </div>
        </div>

        <CodeBlock language="javascript" code={`// Access audit logs programmatically
import { getAuditLogs } from '@/functions/getAuditLogs';

// Retrieve audit logs with filters
const auditLogs = await getAuditLogs({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  userId: 'user_123',
  action: 'update',
  resource: 'UserPsychographicProfile'
});

// Export for compliance reporting
import { exportAccessLogs } from '@/functions/exportAccessLogs';

const exportData = await exportAccessLogs({
  format: 'csv',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});`} />
      </Section>
    </div>
  );
}