import React from 'react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';
import { Activity, BarChart3, AlertTriangle, Zap } from 'lucide-react';

export default function SystemMonitoringDoc() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          <span className="gradient-text gradient-fast">System Monitoring</span>
          <span className="text-[#a3a3a3]">: Comprehensive Observability</span>
        </h1>
        <p className="text-lg md:text-xl text-[#cbd5e1] leading-relaxed">
          knXw's enterprise monitoring system provides real-time insights into system health,
          performance metrics, and automated alerting for proactive incident management.
        </p>
      </div>

      <Section title="Monitoring Architecture" icon={Activity}>
        <p className="text-[#cbd5e1] mb-6">
          Our monitoring system provides complete visibility into application performance,
          infrastructure health, and user experience metrics.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
              Performance Metrics
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• Response time monitoring (avg, p95, p99)</li>
              <li>• Throughput and request rate tracking</li>
              <li>• Error rate analysis and trending</li>
              <li>• Database query performance</li>
              <li>• External dependency latency</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#10b981]" />
              Infrastructure Health
            </h3>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• CPU, memory, and disk utilization</li>
              <li>• Network I/O and bandwidth usage</li>
              <li>• Storage system health</li>
              <li>• Service availability checks</li>
              <li>• Resource capacity planning</li>
            </ul>
          </div>
        </div>

        <Callout type="info" title="Real-Time Dashboards">
          <p>
            Access comprehensive monitoring dashboards at <code>/SystemHealth</code> and
            <code>/EnterpriseSecurityDashboard</code> for real-time system insights.
          </p>
        </Callout>
      </Section>

      <Section title="Health Check System" id="health-checks">
        <p className="text-[#cbd5e1] mb-4">
          Automated health checks continuously monitor system components and dependencies:
        </p>

        <CodeBlock language="javascript" code={`// Perform comprehensive health check
import { enterpriseMonitor } from '@/functions/enterpriseMonitor';

// Full system health assessment
const healthCheck = await enterpriseMonitor({ 
  action: 'comprehensive_check' 
});

console.log('System Health:', healthCheck.result.overall);
// Expected: 'healthy', 'degraded', or 'critical'

// Individual component checks
healthCheck.result.checks.forEach(check => {
  console.log(\`\${check.name}: \${check.status}\`);
  console.log(\`Response time: \${check.responseTime}ms\`);
  console.log('Details:', check.details);
});`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Health Check Components</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">Database Health</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Connection pool status</li>
              <li>• Query latency monitoring</li>
              <li>• Active connections count</li>
              <li>• Lock detection</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">API Endpoints</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Endpoint availability</li>
              <li>• Response time tracking</li>
              <li>• Error rate monitoring</li>
              <li>• Authentication checks</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">External Services</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Third-party API status</li>
              <li>• Service dependencies</li>
              <li>• Circuit breaker status</li>
              <li>• Fallback mechanisms</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Performance Analysis" id="performance">
        <p className="text-[#cbd5e1] mb-4">
          Deep performance analysis identifies bottlenecks and optimization opportunities:
        </p>

        <CodeBlock language="javascript" code={`// Run performance analysis
const perfAnalysis = await enterpriseMonitor({ 
  action: 'performance_analysis' 
});

const metrics = perfAnalysis.result.metrics;

// Response time analysis
console.log('Average response time:', metrics.responseTime.avg, 'ms');
console.log('95th percentile:', metrics.responseTime.p95, 'ms');
console.log('99th percentile:', metrics.responseTime.p99, 'ms');

// System resource utilization
console.log('CPU usage:', metrics.cpuUsage, '%');
console.log('Memory usage:', metrics.memoryUsage, '%');
console.log('Throughput:', metrics.throughput, 'req/s');

// Performance recommendations
perfAnalysis.result.recommendations.forEach(rec => {
  console.log(\`\${rec.priority}: \${rec.action}\`);
  console.log('Expected impact:', rec.impact);
});`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Automated Recommendations</h3>
        <p className="text-[#cbd5e1] mb-4">
          The system automatically generates optimization recommendations based on performance data:
        </p>

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h4 className="text-white font-semibold mb-3">Example Recommendations</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <strong className="text-red-400">High Priority:</strong>
                <span className="text-[#a3a3a3] ml-2">CPU scaling required - utilization above 80%</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <div>
                <strong className="text-orange-400">Medium Priority:</strong>
                <span className="text-[#a3a3a3] ml-2">Response time optimization - consider caching implementation</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <strong className="text-yellow-400">Low Priority:</strong>
                <span className="text-[#a3a3a3] ml-2">Database query optimization opportunities identified</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Capacity Planning" id="capacity-planning">
        <p className="text-[#cbd5e1] mb-4">
          Predictive capacity planning helps prevent performance issues before they occur:
        </p>

        <CodeBlock language="javascript" code={`// Generate capacity planning analysis
const capacityAnalysis = await enterpriseMonitor({ 
  action: 'capacity_planning' 
});

const utilization = capacityAnalysis.result.currentUtilization;

// Review current resource utilization
Object.entries(utilization).forEach(([resource, data]) => {
  console.log(\`\${resource}: \${data.current}% (trend: \${data.trend})\`);
  console.log(\`Projected max in 90 days: \${data.projectedMax}%\`);
});

// Capacity recommendations
capacityAnalysis.result.recommendations.forEach(rec => {
  console.log(\`\${rec.resource}: \${rec.action}\`);
  console.log(\`Timeframe: \${rec.timeframe}\`);
  console.log(\`Urgency: \${rec.urgency}\`);
});`} />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-white font-semibold mb-3">Predictive Analytics</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• 30, 60, and 90-day resource projections</li>
              <li>• Growth trend analysis</li>
              <li>• Seasonal usage pattern recognition</li>
              <li>• Automatic scaling recommendations</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h4 className="text-white font-semibold mb-3">Resource Tracking</h4>
            <ul className="text-[#a3a3a3] space-y-2 text-sm">
              <li>• CPU, memory, storage utilization</li>
              <li>• Network bandwidth consumption</li>
              <li>• Database growth patterns</li>
              <li>• User request volume trends</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Alerting System" icon={AlertTriangle}>
        <p className="text-[#cbd5e1] mb-4">
          Intelligent alerting prevents issues from becoming incidents through proactive monitoring:
        </p>

        <CodeBlock language="javascript" code={`// Configure alert rules
import { AlertRule } from '@/entities/AlertRule';

// Create performance alert
const performanceAlert = await AlertRule.create({
  org_id: 'your-org-id',
  rule_name: 'api_error_rate_spike',
  enabled: true,
  thresholds: {
    error_rate_percent: 5.0  // Alert if error rate > 5%
  },
  time_window_minutes: 10,   // Check over 10 minutes
  cooldown_minutes: 30       // Wait 30min between alerts
});

// Create latency alert
const latencyAlert = await AlertRule.create({
  org_id: 'your-org-id',
  rule_name: 'latency_slo_breach',
  enabled: true,
  thresholds: {
    latency_ms: 500  // Alert if latency > 500ms
  },
  time_window_minutes: 5,
  cooldown_minutes: 15
});`} />

        <h3 className="text-2xl font-semibold text-white mt-6 mb-3">Alert Channels</h3>
        <p className="text-[#cbd5e1] mb-4">
          Configure multiple notification channels for different alert types:
        </p>

        <CodeBlock language="javascript" code={`// Set up alert channels
import { AlertChannel } from '@/entities/AlertChannel';

// Email notifications
const emailChannel = await AlertChannel.create({
  org_id: 'your-org-id',
  channel_type: 'email',
  name: 'Operations Team',
  config: {
    email_addresses: ['ops@company.com', 'oncall@company.com']
  },
  rule_filters: ['api_error_rate_spike', 'latency_slo_breach']
});

// Slack notifications
const slackChannel = await AlertChannel.create({
  org_id: 'your-org-id',
  channel_type: 'slack',
  name: 'Engineering Alerts',
  config: {
    slack_webhook_url: 'https://hooks.slack.com/services/...'
  },
  rule_filters: ['api_error_rate_spike']
});`} />

        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 mb-6">
          <h4 className="text-white font-semibold mb-3">Smart Alert Features</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-[#00d4ff] font-semibold mb-2">Alert Correlation</h5>
              <p className="text-[#a3a3a3] text-sm">
                Related alerts are automatically grouped to prevent notification fatigue
                and provide clearer incident context.
              </p>
            </div>
            <div>
              <h5 className="text-[#00d4ff] font-semibold mb-2">Dynamic Thresholds</h5>
              <p className="text-[#a3a3a3] text-sm">
                Alert thresholds automatically adjust based on historical patterns
                and seasonal trends to reduce false positives.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="SystemHealthMonitor Component" id="health-component">
        <p className="text-[#cbd5e1] mb-4">
          Integrate real-time system monitoring into your applications:
        </p>

        <CodeBlock language="jsx" code={`// Use SystemHealthMonitor component
import { SystemHealthMonitor } from '@/components/operations/SystemHealthMonitor';

function AdminDashboard() {
  return (
    <div>
      <h1>System Dashboard</h1>
      
      {/* Real-time health monitoring */}
      <SystemHealthMonitor 
        autoRefresh={true}
        refreshInterval={10000}
        showDetails={true}
        onHealthChange={(health) => {
          if (health.overall === 'critical') {
            // Trigger emergency procedures
            notifyOnCallTeam(health);
          }
        }}
      />
    </div>
  );
}

// Custom health checks
const customHealthCheck = {
  name: 'Custom Service',
  check: async () => {
    const response = await fetch('/api/custom-health');
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: response.headers.get('x-response-time'),
      details: await response.json()
    };
  }
};`} />
      </Section>

      <Section title="Metrics Collection" icon={Zap}>
        <p className="text-[#cbd5e1] mb-4">
          Comprehensive metrics collection provides deep insights into system behavior:
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">Application Metrics</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Request rate and latency</li>
              <li>• Error rates by endpoint</li>
              <li>• User session analytics</li>
              <li>• Feature usage statistics</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">Infrastructure Metrics</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• Server resource utilization</li>
              <li>• Network performance</li>
              <li>• Storage I/O operations</li>
              <li>• Service dependencies</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <h4 className="text-[#00d4ff] font-semibold mb-2">Business Metrics</h4>
            <ul className="text-[#a3a3a3] text-xs space-y-1">
              <li>• User engagement rates</li>
              <li>• Conversion funnel metrics</li>
              <li>• Revenue tracking</li>
              <li>• Customer satisfaction</li>
            </ul>
          </div>
        </div>

        <Callout type="success" title="Enterprise Ready">
          <p>
            knXw's monitoring system is designed for enterprise workloads with 99.9% uptime SLA,
            comprehensive alerting, and automated incident response capabilities.
          </p>
        </Callout>
      </Section>
    </div>
  );
}