import React from "react";
import { Badge } from "@/components/ui/badge";

export default function BIExportDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4">BI Data Export</h3>
      <p className="text-[#a3a3a3] mb-6">
        Export psychographic intelligence data to your favorite Business Intelligence tools for advanced analytics and reporting.
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Supported Platforms</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Tableau</h5>
            <p className="text-sm text-[#a3a3a3]">
              Native Tableau-optimized format with proper data types and relationships.
            </p>
            <Badge className="mt-2 bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">CSV / JSON</Badge>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Power BI</h5>
            <p className="text-sm text-[#a3a3a3]">
              Structured for Power BI datasets with proper column formatting.
            </p>
            <Badge className="mt-2 bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">JSON</Badge>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Looker</h5>
            <p className="text-sm text-[#a3a3a3]">
              Compatible with Looker's data modeling requirements.
            </p>
            <Badge className="mt-2 bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">CSV / JSON</Badge>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
            <h5 className="font-medium text-white mb-2">Generic</h5>
            <p className="text-sm text-[#a3a3a3]">
              Standard format for any BI tool or data warehouse.
            </p>
            <Badge className="mt-2 bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30">CSV / JSON</Badge>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Available Data Sources</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="text-left py-2 text-white">Data Source</th>
              <th className="text-left py-2 text-white">Description</th>
              <th className="text-left py-2 text-white">Fields</th>
            </tr>
          </thead>
          <tbody className="text-[#a3a3a3]">
            <tr className="border-b border-[#262626]">
              <td className="py-2 font-medium">psychographic_profiles</td>
              <td className="py-2">User psychographic analysis data</td>
              <td className="py-2">20+ fields</td>
            </tr>
            <tr className="border-b border-[#262626]">
              <td className="py-2 font-medium">events</td>
              <td className="py-2">Captured behavioral events</td>
              <td className="py-2">15+ fields</td>
            </tr>
            <tr className="border-b border-[#262626]">
              <td className="py-2 font-medium">insights</td>
              <td className="py-2">AI-generated psychographic insights</td>
              <td className="py-2">12+ fields</td>
            </tr>
            <tr className="border-b border-[#262626]">
              <td className="py-2 font-medium">engagements</td>
              <td className="py-2">Engagement delivery and response data</td>
              <td className="py-2">18+ fields</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">attributions</td>
              <td className="py-2">Conversion attribution data</td>
              <td className="py-2">10+ fields</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Export Schema</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Get schema for BI tool configuration
const schema = await knxw.bi.getSchema();

// Response example:
{
  "psychographic_profiles": {
    "user_id": "string",
    "risk_profile": "string",
    "cognitive_style": "string",
    "emotional_mood": "string",
    "openness": "number",
    "conscientiousness": "number",
    "extraversion": "number",
    "agreeableness": "number",
    "neuroticism": "number",
    "motivation_labels": "array",
    "confidence_score": "number",
    "last_analyzed": "datetime"
  },
  "events": {
    "user_id": "string",
    "event_type": "string",
    "event_url": "string",
    "event_element": "string",
    "event_timestamp": "datetime",
    "session_id": "string"
  }
}`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">API Usage</h4>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Export data for Tableau
const exportData = await knxw.bi.export({
  platform: 'tableau',
  format: 'csv',
  dataSources: ['psychographic_profiles', 'events'],
  filters: {
    dateRangeDays: 30,
    includeDemoData: false
  }
});

// Export for Power BI
const powerBiData = await knxw.bi.export({
  platform: 'powerbi',
  format: 'json',
  dataSources: ['psychographic_profiles', 'insights', 'engagements']
});

// Preview data before export
const preview = await knxw.bi.preview({
  dataSources: ['psychographic_profiles'],
  limit: 10
});`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Scheduled Exports</h4>
        <p className="text-[#a3a3a3] mb-4">
          Configure automated exports to cloud storage for regular BI refresh:
        </p>
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// Create scheduled export
await knxw.bi.createSchedule({
  name: 'Daily Psychographic Export',
  platform: 'tableau',
  format: 'csv',
  dataSources: ['psychographic_profiles', 'events'],
  schedule: {
    frequency: 'daily',
    time: '02:00'
  },
  delivery: {
    method: 's3',
    bucket: 'my-bi-exports',
    prefix: 'knxw/'
  }
});`}
        </pre>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
        <h4 className="text-lg font-semibold text-[#00d4ff] mb-3">Best Practices</h4>
        <ul className="text-[#a3a3a3] space-y-2">
          <li>• <strong className="text-white">Use incremental exports</strong> - Filter by date range to reduce data volume</li>
          <li>• <strong className="text-white">Exclude demo data</strong> - Set includeDemoData: false for production dashboards</li>
          <li>• <strong className="text-white">Schedule during off-peak</strong> - Run large exports during low-traffic hours</li>
          <li>• <strong className="text-white">Use appropriate format</strong> - CSV for Tableau, JSON for Power BI</li>
          <li>• <strong className="text-white">Preview first</strong> - Always preview data structure before full export</li>
        </ul>
      </div>
    </div>
  );
}