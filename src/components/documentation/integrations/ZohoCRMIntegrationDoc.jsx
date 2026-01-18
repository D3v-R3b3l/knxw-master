import React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function ZohoCRMIntegrationDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">Zoho CRM Integration</h3>
      <p className="text-[#a3a3a3] mb-6">
        Sync psychographic intelligence directly into Zoho CRM contacts and leads for enhanced sales insights.
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Overview</h4>
        <p className="text-[#a3a3a3] mb-4">
          The Zoho CRM integration enables automatic synchronization of psychographic profiles to your Zoho CRM instance. 
          This enriches your contact and lead records with behavioral insights, personality traits, and engagement patterns.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">OAuth 2.0</Badge>
          <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">Real-time Sync</Badge>
          <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">Batch Processing</Badge>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Setup Requirements</h4>
        <ol className="list-decimal list-inside text-[#a3a3a3] space-y-2">
          <li>Create a Zoho API Console application at <a href="https://api-console.zoho.com/" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">api-console.zoho.com <ExternalLink className="w-3 h-3 inline ml-1" /></a></li>
          <li>Select "Server-based Applications" as the client type</li>
          <li>Configure the OAuth redirect URI provided in the integration panel</li>
          <li>Note your Client ID and Client Secret</li>
          <li>Generate a refresh token with the required scopes</li>
        </ol>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Required OAuth Scopes</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`ZohoCRM.modules.contacts.ALL
ZohoCRM.modules.leads.ALL
ZohoCRM.modules.deals.READ
ZohoCRM.settings.fields.ALL`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Synced Data Fields</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-white mb-2">Personality Traits</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• knxw_openness</li>
              <li>• knxw_conscientiousness</li>
              <li>• knxw_extraversion</li>
              <li>• knxw_agreeableness</li>
              <li>• knxw_neuroticism</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">Behavioral Insights</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• knxw_risk_profile</li>
              <li>• knxw_cognitive_style</li>
              <li>• knxw_emotional_mood</li>
              <li>• knxw_motivation</li>
              <li>• knxw_last_analyzed</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">API Usage</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Sync a single profile to Zoho CRM
await knxw.crm.zoho.syncContact('user_123', {
  email: 'user@example.com',
  module: 'Contacts' // or 'Leads'
});

// Batch sync multiple profiles
await knxw.crm.zoho.batchSync({
  module: 'Contacts',
  limit: 100
});

// Check connection status
const status = await knxw.crm.zoho.validateConnection();`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Data Center Regions</h4>
        <p className="text-[#a3a3a3] mb-3">Select the appropriate data center based on your Zoho account region:</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {['US', 'EU', 'IN', 'AU', 'JP', 'CN'].map(region => (
            <Badge key={region} className="bg-[#262626] text-white justify-center">{region}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}