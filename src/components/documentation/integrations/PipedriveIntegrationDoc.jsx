import React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function PipedriveIntegrationDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">Pipedrive Integration</h3>
      <p className="text-[#a3a3a3] mb-6">
        Enrich your Pipedrive CRM with psychographic intelligence for smarter sales conversations and deal management.
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Overview</h4>
        <p className="text-[#a3a3a3] mb-4">
          The Pipedrive integration syncs psychographic profiles to Person records and generates AI-powered selling strategies 
          based on each prospect's cognitive style, risk profile, and motivations.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">API Token Auth</Badge>
          <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">Custom Fields</Badge>
          <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">Selling Strategies</Badge>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Setup Requirements</h4>
        <ol className="list-decimal list-inside text-[#a3a3a3] space-y-2">
          <li>Log in to your Pipedrive account</li>
          <li>Navigate to Settings → Personal Preferences → API</li>
          <li>Generate a new API token or copy your existing one</li>
          <li>Note your company domain (e.g., yourcompany.pipedrive.com)</li>
          <li>Enter credentials in the knXw integration panel</li>
        </ol>
        <a 
          href="https://pipedrive.readme.io/docs/core-api-concepts-authentication" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-[#00d4ff] hover:underline mt-4"
        >
          Pipedrive API Documentation <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Custom Fields Created</h4>
        <p className="text-[#a3a3a3] mb-3">
          The integration automatically creates custom fields on Person records:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-white mb-2">Profile Fields</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• knXw Risk Profile</li>
              <li>• knXw Cognitive Style</li>
              <li>• knXw Emotional Mood</li>
              <li>• knXw Primary Motivation</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">Metadata Fields</h5>
            <ul className="text-sm text-[#a3a3a3] space-y-1">
              <li>• knXw Last Analyzed</li>
              <li>• knXw Confidence Score</li>
              <li>• knXw Recommended Approach</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Selling Strategy Generation</h4>
        <p className="text-[#a3a3a3] mb-4">
          Based on psychographic analysis, the integration generates personalized selling strategies:
        </p>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Get AI-generated selling strategy
const strategy = await knxw.crm.pipedrive.getSellingStrategy('user_123');

// Response example:
{
  "approach": "value_focused",
  "communication_style": "analytical",
  "key_motivators": ["ROI", "efficiency", "data-driven decisions"],
  "objection_handling": [
    "Provide detailed case studies with metrics",
    "Offer extended trial period for validation"
  ],
  "recommended_content": ["ROI calculator", "technical whitepaper"],
  "optimal_meeting_format": "demo with data visualization"
}`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">API Usage</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Sync profile to Pipedrive
await knxw.crm.pipedrive.syncPerson('user_123', {
  email: 'prospect@company.com'
});

// Create deal with psychographic context
await knxw.crm.pipedrive.createDeal('user_123', {
  title: 'Enterprise License',
  value: 50000,
  includeSellingStrategy: true
});

// Batch sync all profiles
await knxw.crm.pipedrive.batchSync({ limit: 100 });`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Sync Configuration Options</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="text-left py-2 text-white">Option</th>
              <th className="text-left py-2 text-white">Default</th>
              <th className="text-left py-2 text-white">Description</th>
            </tr>
          </thead>
          <tbody className="text-[#a3a3a3]">
            <tr className="border-b border-[#262626]">
              <td className="py-2">sync_persons</td>
              <td className="py-2">true</td>
              <td className="py-2">Sync to Person records</td>
            </tr>
            <tr className="border-b border-[#262626]">
              <td className="py-2">sync_deals</td>
              <td className="py-2">true</td>
              <td className="py-2">Include deal context</td>
            </tr>
            <tr className="border-b border-[#262626]">
              <td className="py-2">sync_organizations</td>
              <td className="py-2">false</td>
              <td className="py-2">Aggregate org-level insights</td>
            </tr>
            <tr className="border-b border-[#262626]">
              <td className="py-2">enrich_custom_fields</td>
              <td className="py-2">true</td>
              <td className="py-2">Create/update custom fields</td>
            </tr>
            <tr>
              <td className="py-2">sync_frequency_hours</td>
              <td className="py-2">24</td>
              <td className="py-2">Auto-sync interval</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}