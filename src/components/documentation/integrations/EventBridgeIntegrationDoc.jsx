import React from 'react';
import DocSection from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';

export default function EventBridgeIntegrationDoc() {
  return (
    <div>
      <DocSection title="AWS EventBridge: Stream Events" id="aws-eventbridge">
        <p className="mb-3 text-[#cbd5e1]">Forward platform events into AWS EventBridge for routing, fan‑out processing, and downstream pipelines.</p>

        <Callout type="warning" title="Prerequisites">
          <ul className="list-disc list-inside">
            <li>IAM permission <code>events:PutEvents</code> to your <code>event_bus_name</code>.</li>
            <li>Set <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, and region.</li>
          </ul>
        </Callout>

        <h3 className="text-white font-semibold mt-4 mb-2">1) Send events</h3>
        <CodeBlock language="javascript" code={`import { awsEventBridge } from "@/functions/awsEventBridge";

const { data } = await awsEventBridge({
  client_app_id: "<your-client-app-id>",
  event_bus_name: "default",
  source: "knxw.analytics",
  events: [{
    type: "custom",
    payload: { action: "sync", scope: "profiles" },
    timestamp: new Date().toISOString()
  }]
});
console.log(data); // { status: "ok", entries: [...] }`} />

        <h3 className="text-white font-semibold mt-6 mb-2">2) Verify</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>AWS Console &gt; EventBridge &gt; Event buses &gt; Monitor &gt; check PutEvents metrics.</li>
          <li>Create a test rule to route events to CloudWatch Logs and confirm receipt.</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Troubleshooting</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li><strong>AccessDeniedException:</strong> Ensure the IAM principal has <code>events:PutEvents</code> on the bus.</li>
          <li><strong>ThrottlingException:</strong> Batch multiple entries or add backoff.</li>
        </ul>
      </DocSection>
    </div>
  );
}