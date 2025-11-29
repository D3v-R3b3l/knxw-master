import React from "react";
import { Megaphone, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MetaPagesIntegrationDoc() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#00d4ff]" />
          Meta Pages — OAuth, Ingestion, Analysis
        </h3>
        <p className="text-[#a3a3a3]">Connect your Facebook Page, ingest posts/comments, and run psychographic analysis.</p>
      </header>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Prerequisites</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3]">
          <li>META_APP_ID, META_APP_SECRET, META_OAUTH_REDIRECT_URL set in env.</li>
          <li>Permissions: pages_read_engagement, pages_read_user_content (and read_insights recommended).</li>
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Steps</h4>
        <ol className="list-decimal list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>Go to Meta Data page → Connect Meta → approve scopes.</li>
          <li>List Pages and pick the target Page.</li>
          <li>Click Ingest (last 7–30 days) to fetch posts and comments.</li>
          <li>Run Analysis to compute motivations, cognitive styles, sentiment, recommendations.</li>
        </ol>
        <div className="text-xs text-[#6b7280] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Entities: MetaPage, MetaPost, MetaComment, MetaPageAnalysis.
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
        <h4 className="text-white font-semibold">Verification & Troubleshooting</h4>
        <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
          <li>“No posts found” → ingest first, then re-run analysis.</li>
          <li>Empty Pages list → ensure the Facebook user has Page access and scopes granted.</li>
          <li>API errors → verify app mode, token validity, and redirect URL matches.</li>
        </ul>
        <div className="text-xs text-[#f59e0b] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Respect platform policies and privacy constraints on user-level data.
        </div>
      </div>
    </section>
  );
}