import React from 'react';
import { Plug, Send, Database } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';

export default function MarketingIntegrationsDoc() {
  return (
    <div className="space-y-8">
      <Section icon={Plug} title="Marketing Platform Integrations">
        <p className="text-[#a3a3a3] mb-4">
          Sync psychographic intelligence to major marketing automation platforms and CDPs in real-time.
        </p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">Supported Platforms</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            { name: 'Marketo', desc: 'Sync to leads and custom fields' },
            { name: 'Pardot', desc: 'Update prospect records' },
            { name: 'Segment', desc: 'Stream to CDP as user traits' },
            { name: 'Salesforce Marketing Cloud', desc: 'Update subscriber attributes' },
            { name: 'Adobe Analytics', desc: 'Send as custom eVars' },
            { name: 'Google Tag Manager', desc: 'Push to data layer' }
          ].map((platform) => (
            <div key={platform.name} className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
              <h4 className="font-semibold text-white mb-1">{platform.name}</h4>
              <p className="text-sm text-[#a3a3a3]">{platform.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#00d4ff]" />
          Configuration
        </h3>
        <p className="text-[#a3a3a3] mb-4">
          Configure integrations via the Marketing Integrations dashboard or API:
        </p>

        <CodeBlock language="javascript" code={`// Create integration config
await base44.entities.MarketingIntegrationConfig.create({
  client_app_id: 'app_123',
  integration_type: 'marketo',
  credentials: {
    api_key: 'your_marketo_key',
    api_secret: 'your_marketo_secret',
    endpoint_url: 'https://123-ABC-456.mktorest.com',
    account_id: 'your_munchkin_id'
  },
  sync_settings: {
    sync_frequency: 'realtime', // or 'hourly', 'daily', 'weekly'
    sync_fields: [
      'risk_profile',
      'cognitive_style',
      'emotional_state',
      'personality_traits',
      'motivation_labels'
    ],
    field_mapping: {
      'risk_profile': 'knxw_risk_profile__c',
      'cognitive_style': 'knxw_cognitive_style__c'
    }
  },
  status: 'active'
});`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-[#00d4ff]" />
          Sync Methods
        </h3>

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Marketo</h4>
        <CodeBlock language="javascript" code={`// Sync to Marketo
const response = await base44.functions.invoke('syncToMarketo', {
  user_id: 'user_123',
  email: 'user@example.com',
  client_app_id: 'app_123'
});

// Synced fields include:
// - psychographic_risk_profile
// - psychographic_cognitive_style
// - psychographic_emotional_mood
// - psychographic_primary_motivation
// - psychographic_openness_score (and other Big 5 traits)`} />

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Segment</h4>
        <CodeBlock language="javascript" code={`// Sync to Segment CDP
const response = await base44.functions.invoke('syncToSegment', {
  user_id: 'user_123',
  client_app_id: 'app_123'
});

// Creates Segment identify call with psychographic traits:
{
  userId: 'user_123',
  traits: {
    psychographic: {
      risk_profile: 'moderate',
      cognitive_style: 'analytical',
      emotional_mood: 'confident',
      primary_motivation: 'achievement',
      personality_openness: 0.78
    }
  }
}`} />

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Salesforce Marketing Cloud</h4>
        <CodeBlock language="javascript" code={`// Sync to SFMC
const response = await base44.functions.invoke('syncToSalesforceMarketingCloud', {
  user_id: 'user_123',
  email: 'user@example.com',
  subscriber_key: 'sub_123',
  client_app_id: 'app_123'
});

// Updates subscriber attributes in Marketing Cloud data extensions`} />

        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Adobe Analytics</h4>
        <CodeBlock language="javascript" code={`// Sync to Adobe Analytics
const response = await base44.functions.invoke('syncToAdobeAnalytics', {
  user_id: 'user_123',
  visitor_id: 'adobe_visitor_123',
  client_app_id: 'app_123'
});

// Sends to Data Insertion API as custom eVars and props`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4">Webhook Export</h3>
        <p className="text-[#a3a3a3] mb-4">
          Send psychographic data to any external system via webhooks:
        </p>

        <CodeBlock language="javascript" code={`// Export via webhook
const response = await base44.functions.invoke('exportWebhook', {
  event_type: 'profile_updated',
  data: {
    user_id: 'user_123',
    profile: profileData
  },
  webhook_urls: [
    'https://your-system.com/webhooks/knxw',
    'https://backup-system.com/webhooks'
  ]
});

// Webhooks are signed with HMAC-SHA256
// Verify signature using X-knXw-Signature header`} />

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <p className="text-blue-400 text-sm">
            <strong>Security:</strong> All API keys and secrets are encrypted at rest. Webhook payloads are 
            signed with HMAC-SHA256 for verification.
          </p>
        </div>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">Sync Frequency Options</h3>
        <ul className="list-disc list-inside text-[#a3a3a3] space-y-2">
          <li><strong>Real-time:</strong> Sync immediately when profile updates (webhooks recommended)</li>
          <li><strong>Hourly:</strong> Batch sync every hour for cost efficiency</li>
          <li><strong>Daily:</strong> Once per day sync for reporting use cases</li>
          <li><strong>Weekly:</strong> Periodic sync for trend analysis</li>
        </ul>
      </Section>
    </div>
  );
}