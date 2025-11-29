import React from "react";
import { Code2, CheckCircle2 } from "lucide-react";

export default function CoreIntegrationsDoc() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#00d4ff]" />
          Core Integrations (built-in) — Setup & Testing
        </h3>
        <p className="text-[#a3a3a3]">
          These endpoints are available out-of-the-box: SendEmail, UploadFile/UploadPrivateFile, CreateFileSignedUrl,
          ExtractDataFromUploadedFile, and GenerateImage.
        </p>
      </header>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-3">
        <h4 className="text-white font-semibold">SendEmail</h4>
        <pre className="bg-[#0b0b0b] p-3 rounded-md text-xs overflow-x-auto">
{`import { SendEmail } from "@/integrations/Core";
await SendEmail({ to: "user@example.com", subject: "Hello", body: "Welcome to knXw!" });`}
        </pre>

        <h4 className="text-white font-semibold">UploadFile → ExtractDataFromUploadedFile</h4>
        <pre className="bg-[#0b0b0b] p-3 rounded-md text-xs overflow-x-auto">
{`import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
const { file_url } = await UploadFile({ file });
const { status, output } = await ExtractDataFromUploadedFile({
  file_url,
  json_schema: { type: "object", properties: { email: { type: "string" } } }
});`}
        </pre>

        <h4 className="text-white font-semibold">UploadPrivateFile → CreateFileSignedUrl</h4>
        <pre className="bg-[#0b0b0b] p-3 rounded-md text-xs overflow-x-auto">
{`import { UploadPrivateFile, CreateFileSignedUrl } from "@/integrations/Core";
const { file_uri } = await UploadPrivateFile({ file });
const { signed_url } = await CreateFileSignedUrl({ file_uri, expires_in: 300 });`}
        </pre>

        <h4 className="text-white font-semibold">GenerateImage</h4>
        <pre className="bg-[#0b0b0b] p-3 rounded-md text-xs overflow-x-auto">
{`import { GenerateImage } from "@/integrations/Core";
const { url } = await GenerateImage({ prompt: "A vibrant abstract gradient" });`}
        </pre>

        <div className="text-xs text-[#6b7280] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Tip: Use loading indicators and size limits for a smooth UX.
        </div>
      </div>
    </section>
  );
}