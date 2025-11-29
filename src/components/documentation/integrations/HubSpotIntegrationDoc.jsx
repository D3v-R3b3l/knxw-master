import React from 'react';
import DocSection from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';

export default function HubSpotIntegrationDoc() {
  return (
    <div>
      <DocSection title="HubSpot: Sync Psychographic Data to Contacts" id="hubspot">
        <p className="text-[#cbd5e1]">Push user profiles into HubSpot contacts with custom properties to power segmentation, lead scoring, and workflows.</p>

        <Callout type="warning" title="Prerequisites">
          <ul className="list-disc list-inside">
            <li>Create a HubSpot Private App with scopes: <code>crm.objects.contacts.read</code>, <code>crm.objects.contacts.write</code>, <code>crm.schemas.contacts.write</code>.</li>
            <li>Set <code>HUBSPOT_ENCRYPTION_KEY</code> (≥ 32 chars) in env vars to encrypt tokens at rest.</li>
          </ul>
        </Callout>

        <h3 className="text-white font-semibold mt-4 mb-2">1) Store credentials securely</h3>
        <CodeBlock language="javascript" code={`import { setupHubSpotIntegration } from "@/functions/setupHubSpotIntegration";

const { data } = await setupHubSpotIntegration({
  client_app_id: "<your-client-app-id>",
  access_token: "<hubspot-private-app-token>"
});
// data.status === "success" when stored securely`} />

        <h3 className="text-white font-semibold mt-6 mb-2">2) Run a batch sync</h3>
        <CodeBlock language="javascript" code={`import { syncHubSpot } from "@/functions/syncHubSpot";

const { data } = await syncHubSpot({
  client_app_id: "<your-client-app-id>",
  action: "batch_sync"
});
console.log(data);`} />

        <h3 className="text-white font-semibold mt-6 mb-2">Profile property mapping (recommended)</h3>
        <ul className="list-disc list-inside text-[#cbd5e1]">
          <li><code>knxw_motivation_stack</code> (multi-select)</li>
          <li><code>knxw_risk_profile</code> (enum: conservative/moderate/aggressive)</li>
          <li><code>knxw_cognitive_style</code> (enum)</li>
          <li><code>knxw_conscientiousness</code> (number 0–1)</li>
          <li><code>knxw_emotional_state</code> (text JSON)</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Verify</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>HubSpot &gt; Contacts &gt; open a contact &gt; View custom properties created/updated.</li>
          <li>If properties don’t exist, ensure the app has <code>schemas.write</code> and re-run setup.</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Troubleshooting</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li><strong>401/403:</strong> Token expired or missing scope; recreate private app and re-run setup.</li>
          <li><strong>429 rate limits:</strong> Reduce batch sizes, add delays between syncs.</li>
        </ul>
      </DocSection>
    </div>
  );
}