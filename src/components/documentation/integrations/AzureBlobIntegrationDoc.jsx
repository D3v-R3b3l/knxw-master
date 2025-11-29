import React from 'react';
import DocSection from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';

export default function AzureBlobIntegrationDoc() {
  return (
    <div>
      <DocSection title="Azure Blob Storage: Export and Serve Files" id="azure-blob">
        <p className="mb-3 text-[#cbd5e1]">Export JSON or text files to Azure Blob Storage containers. Keep sensitive data private and serve via time‑limited SAS or your app APIs.</p>

        <Callout type="warning" title="Prerequisites">
          <ul className="list-disc list-inside">
            <li>Set <code>AZURE_STORAGE_CONNECTION_STRING</code> in environment variables.</li>
            <li>Create a container (e.g., <code>knxw-demo</code>) with private access.</li>
          </ul>
        </Callout>

        <h3 className="text-white font-semibold mt-4 mb-2">1) Export code (frontend call)</h3>
        <CodeBlock language="javascript" code={`import { azureBlobExport } from "@/functions/azureBlobExport";

const { data } = await azureBlobExport({
  client_app_id: "<your-client-app-id>",
  container_name: "knxw-demo",
  blob_path: "exports/" + new Date().toISOString().slice(0,10) + "/sample.json",
  data: { sample: true }
});
console.log(data); // { uri, container, blob_path }`} />

        <h3 className="text-white font-semibold mt-6 mb-2">2) Verify in Azure Portal</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>Storage accounts &gt; Containers &gt; your container &gt; verify blob path exists.</li>
          <li>Use a <em>SAS</em> link only for temporary sharing; never make PII blobs public.</li>
        </ul>

        <h3 className="text-white font-semibold mt-6 mb-2">Troubleshooting</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li><strong>AuthorizationFailure:</strong> Invalid connection string or insufficient permissions.</li>
          <li><strong>ContainerNotFound:</strong> Create the container or fix <code>container_name</code>.</li>
        </ul>
      </DocSection>
    </div>
  );
}