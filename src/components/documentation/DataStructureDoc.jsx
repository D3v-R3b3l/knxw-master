import React from "react";

export default function DataStructureDoc() {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Data Model — Key Entities</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold">Psychographics</h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>UserPsychographicProfile: per-user motivations, cognitive style, risk profile.</li>
            <li>PsychographicInsight: discrete insights with confidence and reasoning.</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold">Behavioral Events</h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>CapturedEvent: on-site events from SDK (page_view, click, etc.).</li>
            <li>EngagementDelivery: records of adaptive engagements and responses.</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold">Meta (Facebook Pages)</h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>MetaPage: connected Page metadata.</li>
            <li>MetaPost: post text, counts, and permalink.</li>
            <li>MetaComment: comment text and like counts.</li>
            <li>MetaPageAnalysis: page-level psychographic summary (sentiment, motivations, signals, recommendations).</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold">Google (GA4)</h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>GoogleAccount: encrypted OAuth tokens and metadata.</li>
            <li>Reports are fetched on-demand via functions and visualized in UI.</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold">Historical Import</h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>CRMRecord: leads/contacts, lifecycle, notes.</li>
            <li>ImportedTextRecord: free text for NLP (tickets, surveys).</li>
            <li>EmployeeRecord: employee datasets with survey responses.</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-[#111111] border border-[#262626]">
          <h4 className="text-white font-semibold">Engagement Engine</h4>
          <ul className="list-disc list-inside text-sm text-[#a3a3a3] space-y-1">
            <li>EngagementRule: conditions (psychographic + behavioral) and timing.</li>
            <li>EngagementTemplate: structured content for delivery.</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-[#6b7280]">
        All entities enforce row-level security and include built-in audit metadata. See SDK Doc for CRUD usage.
      </p>
    </section>
  );
}