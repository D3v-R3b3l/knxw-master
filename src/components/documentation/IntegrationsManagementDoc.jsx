import React from 'react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';
import { Badge } from '@/components/ui/badge';

export default function IntegrationsManagementDoc() {
  return (
    <div className="space-y-8">
      <Section title="Integrations Management" id="integrations-management">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          The Integrations Management dashboard provides a centralized hub for connecting knXw with your existing tools and workflows. Manage all your integrations from a single interface with real-time connection status, setup guides, and health monitoring.
        </p>

        <Callout type="info" className="mb-6">
          <strong>Unified Integration Hub</strong>
          <ul className="mt-2 space-y-1">
            <li>• View all available integrations across categories</li>
            <li>• Monitor connection status in real-time</li>
            <li>• Access setup guides and documentation</li>
            <li>• Manage authentication and re-connection</li>
          </ul>
        </Callout>
      </Section>

      <Section title="Integration Categories" id="integration-categories">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📊 Analytics</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              Connect analytics platforms to correlate behavioral and psychographic data
            </p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>• Google Analytics 4</li>
              <li>• Segment (Coming Soon)</li>
              <li>• Mixpanel (Coming Soon)</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💼 CRM & Sales</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              Enrich CRM contacts with psychological insights
            </p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>• HubSpot</li>
              <li>• Salesforce (Coming Soon)</li>
              <li>• Pipedrive (Coming Soon)</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📧 Marketing</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              Send conversion data to ad platforms with psychographic context
            </p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>• Google Ads</li>
              <li>• Meta (Facebook/Instagram)</li>
              <li>• LinkedIn Ads (Coming Soon)</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">☁️ Infrastructure</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              Export data to cloud storage and event systems
            </p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>• AWS S3</li>
              <li>• AWS EventBridge</li>
              <li>• Azure Blob Storage</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🛍️ E-commerce</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              Connect payment and commerce platforms
            </p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>• Stripe</li>
              <li>• Shopify (Coming Soon)</li>
              <li>• WooCommerce (Coming Soon)</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💬 Communication</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              Get alerts and collaborate with your team
            </p>
            <ul className="text-xs text-[#6b7280] space-y-1">
              <li>• Slack (Coming Soon)</li>
              <li>• Microsoft Teams (Coming Soon)</li>
              <li>• Discord (Coming Soon)</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Connection Management" id="connection-management">
        <h3 className="text-lg font-semibold text-white mb-3">Connecting an Integration</h3>
        <ol className="list-decimal list-inside space-y-2 text-[#e5e5e5] mb-6">
          <li>Navigate to <strong>Integrations Management</strong></li>
          <li>Browse or search for the integration you want to connect</li>
          <li>Click <strong>Connect</strong> on the integration card</li>
          <li>Follow the provider-specific authentication flow</li>
          <li>Configure integration settings (e.g., which data to sync)</li>
          <li>Test the connection to verify it's working</li>
        </ol>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Managing Existing Connections</h3>
        <p className="text-[#e5e5e5] mb-4">
          Once connected, integrations appear in the Active Integrations panel with real-time status:
        </p>
        <ul className="space-y-2 text-[#e5e5e5] mb-6">
          <li>• Connected - Integration is active and syncing</li>
          <li>• Auth Expired - Re-authentication required</li>
          <li>• Error - Connection issue needs attention</li>
        </ul>

        <Callout type="tip">
          <strong>Pro Tip:</strong> Use the Refresh button to check connection status after making changes in the provider platform (e.g., updating permissions, changing passwords).
        </Callout>
      </Section>

      <Section title="Common Integration Workflows" id="common-workflows">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Workflow 1: HubSpot CRM Enrichment</h3>
            <p className="text-[#e5e5e5] mb-3">
              Automatically sync psychographic profiles to HubSpot contacts:
            </p>
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-2 text-sm text-[#a3a3a3]">
              <p>1. Connect HubSpot integration from Integrations Management</p>
              <p>2. knXw creates custom properties in HubSpot (motivation, cognitive style, etc.)</p>
              <p>3. Profiles sync automatically when users are identified</p>
              <p>4. Use HubSpot workflows to trigger campaigns based on psychology</p>
              <p>5. Monitor sync status in the Integrations page</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Workflow 2: Ad Platform Optimization</h3>
            <p className="text-[#e5e5e5] mb-3">
              Send conversion events with psychographic data to Google Ads and Meta:
            </p>
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-2 text-sm text-[#a3a3a3]">
              <p>1. Connect Google Ads and/or Meta from Integrations Management</p>
              <p>2. Track conversions with knXw SDK</p>
              <p>3. knXw forwards conversion events with psychographic tags</p>
              <p>4. Ad platforms use psychology data for better targeting</p>
              <p>5. Monitor conversion forwarding in the Integrations page</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Workflow 3: Data Warehouse Export</h3>
            <p className="text-[#e5e5e5] mb-3">
              Export psychographic data to your data warehouse for custom analysis:
            </p>
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-2 text-sm text-[#a3a3a3]">
              <p>1. Connect AWS S3 or Azure Blob from Integrations Management</p>
              <p>2. Configure export schedule (hourly, daily, weekly)</p>
              <p>3. Choose data format (JSON, CSV, Parquet)</p>
              <p>4. knXw exports profiles, events, and insights automatically</p>
              <p>5. Use exported data in your BI tools (Tableau, Looker, etc.)</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Troubleshooting" id="troubleshooting">
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Integration Shows Auth Expired</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              <strong>Solution:</strong>
            </p>
            <ul className="text-sm text-[#a3a3a3] space-y-1 list-disc list-inside">
              <li>Click Manage on the integration card</li>
              <li>Click Re-authenticate or Reconnect</li>
              <li>Complete the OAuth flow with the provider</li>
              <li>Verify connection status shows Connected</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Data Not Syncing to CRM</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              <strong>Common Causes:</strong>
            </p>
            <ul className="text-sm text-[#a3a3a3] space-y-1 list-disc list-inside">
              <li>Missing email mapping (users must be identified with emails)</li>
              <li>Sync is disabled in integration settings</li>
              <li>CRM field permissions do not allow writes</li>
              <li>Rate limits from the CRM provider</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Ad Platform Not Receiving Conversions</h4>
            <p className="text-sm text-[#a3a3a3] mb-2">
              <strong>Checklist:</strong>
            </p>
            <ul className="text-sm text-[#a3a3a3] space-y-1 list-disc list-inside">
              <li>Verify conversion events are tracked with knXw SDK</li>
              <li>Check that workspace secrets are correctly configured</li>
              <li>Ensure click IDs (gclid, fbclid) are being captured</li>
              <li>Review AdPlatformSendLog entity for error messages</li>
              <li>Confirm ad platform has proper permissions</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Security Best Practices" id="security">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Integration security is critical. Follow these best practices:
        </p>

        <div className="space-y-3">
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4">
            <h4 className="font-semibold text-[#10b981] mb-2">✅ DO</h4>
            <ul className="text-sm text-[#e5e5e5] space-y-1 list-disc list-inside">
              <li>Use OAuth where available instead of API keys</li>
              <li>Grant minimum required permissions</li>
              <li>Rotate secrets regularly (every 90 days)</li>
              <li>Monitor integration logs for suspicious activity</li>
              <li>Use workspace-specific credentials, not personal accounts</li>
            </ul>
          </div>

          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4">
            <h4 className="font-semibold text-[#ef4444] mb-2">❌ DO NOT</h4>
            <ul className="text-sm text-[#e5e5e5] space-y-1 list-disc list-inside">
              <li>Share API keys via email or messaging apps</li>
              <li>Use the same credentials across multiple workspaces</li>
              <li>Grant admin permissions unless absolutely necessary</li>
              <li>Leave test integrations connected in production</li>
              <li>Ignore auth expiration warnings</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Request Custom Integrations" id="custom-integrations">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          Need an integration that is not listed? We are constantly expanding our integration catalog based on customer needs.
        </p>

        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-6">
          <h4 className="font-semibold text-white mb-3">How to Request</h4>
          <ol className="list-decimal list-inside space-y-2 text-[#e5e5e5]">
            <li>Visit the Support page</li>
            <li>Select Integration Request as the topic</li>
            <li>Provide details about the tool you want to integrate</li>
            <li>Describe your use case and expected data flow</li>
            <li>Our team will evaluate and prioritize based on demand</li>
          </ol>
          
          <div className="mt-4 pt-4 border-t border-[#00d4ff]/30">
            <p className="text-sm text-[#a3a3a3]">
              <strong>Popular Requests:</strong> Salesforce, Segment, Slack, Shopify, Intercom
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}