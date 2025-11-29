import React from 'react';
import DocSection from '../Section';
import CodeBlock from '../CodeBlock';
import Callout from '../Callout';

export default function AwsS3IntegrationDoc() {
  return (
    <div>
      <DocSection title="AWS S3: Export and Serve Files" id="aws-s3">
        <p className="mb-3 text-[#cbd5e1]">Export analytics, reports, or backups to S3. This flow writes JSON (or any string) to a key under your bucket.</p>

        <Callout type="warning" title="Prerequisites">
          <ul className="list-disc list-inside">
            <li>Set <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, and optional <code>AWS_DEFAULT_REGION</code> (defaults to <code>us-east-1</code>).</li>
            <li>The IAM user/role needs <code>s3:PutObject</code> on the target bucket.</li>
          </ul>
        </Callout>

        <h3 className="text-white font-semibold mt-4 mb-2">1) Minimal IAM policy</h3>
        <CodeBlock language="json" code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject"],
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  }]
}`} />

        <h3 className="text-white font-semibold mt-6 mb-2">2) Export code (frontend call)</h3>
        <CodeBlock language="javascript" code={`import { awsS3Export } from "@/functions/awsS3Export";

const { data } = await awsS3Export({
  client_app_id: "<your-client-app-id>",
  bucket_name: "knxw-exports",
  object_key: "exports/" + new Date().toISOString().slice(0,10) + "/report.json",
  data: { report: "ok", generated_at: new Date().toISOString() }
});
console.log(data); // { s3_url, object_key, metadata }`} />

        <h3 className="text-white font-semibold mt-6 mb-2">3) Verify in AWS Console</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li>Open S3 &gt; Bucket &gt; Objects and confirm the key exists.</li>
          <li>If using public access, set a read policy; otherwise serve through a signed URL.</li>
        </ul>

        <Callout type="info" title="Optional: CORS and signed access">
          <p>To allow browser access to objects, configure bucket CORS or always use <em>signed URLs</em> served through your app.</p>
        </Callout>

        <h3 className="text-white font-semibold mt-6 mb-2">Troubleshooting</h3>
        <ul className="list-disc list-inside text-[#cbd5e1] space-y-1">
          <li><strong>403 Forbidden:</strong> Wrong bucket name, region mismatch, or missing <code>s3:PutObject</code>.</li>
          <li><strong>SignatureDoesNotMatch:</strong> Region/credential mismatch; ensure env vars match bucket region.</li>
        </ul>
      </DocSection>
    </div>
  );
}