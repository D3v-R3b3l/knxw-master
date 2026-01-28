import React from "react";
import Section from "../Section";
import CodeBlock from "../CodeBlock";
import Callout from "../Callout";

export default function BIExportDoc() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        BI Tool Data Export
      </h1>
      <p className="text-[#cbd5e1] text-lg mb-6">
        Export psychographic intelligence data to Tableau, Power BI, Looker, Metabase, 
        or custom data warehouses for advanced visualization and analysis.
      </p>

      <Section title="Supported Platforms">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#00d4ff] font-bold mb-2">Tableau</h4>
            <p className="text-[#a3a3a3] text-sm">Direct connector via CSV/JSON exports or live API connection</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#00d4ff] font-bold mb-2">Power BI</h4>
            <p className="text-[#a3a3a3] text-sm">Scheduled exports to Azure Blob or Power BI REST API</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#00d4ff] font-bold mb-2">Looker</h4>
            <p className="text-[#a3a3a3] text-sm">JSON exports for Looker Studio dashboards</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <h4 className="text-[#00d4ff] font-bold mb-2">Custom Warehouses</h4>
            <p className="text-[#a3a3a3] text-sm">Scheduled exports to S3, Azure Blob, or webhook endpoints</p>
          </div>
        </div>
      </Section>

      <Section title="Export Formats">
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>CSV:</strong> Universal format for all BI tools, optimized for large datasets</li>
          <li><strong>JSON:</strong> Structured data with nested objects for advanced analysis</li>
          <li><strong>Parquet:</strong> Columnar format for data warehouse integration (Enterprise)</li>
        </ul>
      </Section>

      <Section title="Creating an Export Configuration">
        <CodeBlock language="javascript">
{`const exportConfig = await base44.entities.BIExportConfig.create({
  client_app_id: "app_123",
  name: "Weekly Tableau Export",
  platform: "tableau",
  export_format: "csv",
  data_sources: [
    "psychographic_profiles",
    "events",
    "insights",
    "engagements"
  ],
  filters: {
    date_range_days: 30,
    include_demo_data: false
  },
  schedule: {
    enabled: true,
    frequency: "weekly",
    delivery_method: "s3",
    delivery_config: {
      bucket: "my-bi-exports",
      path: "knxw/weekly/"
    }
  }
});`}
        </CodeBlock>
      </Section>

      <Section title="Manual Export">
        <p className="text-[#cbd5e1] mb-4">
          Trigger an export on-demand:
        </p>
        <CodeBlock language="javascript">
{`const response = await base44.functions.invoke('exportBI', {
  config_id: "export_config_123",
  format: "csv"
});

// Download the file
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'knxw-export.csv';
a.click();`}
        </CodeBlock>
      </Section>

      <Section title="Scheduled Exports">
        <p className="text-[#cbd5e1] mb-4">
          Configure automated exports to run hourly, daily, or weekly:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>Hourly:</strong> Real-time data feeds for operational dashboards</li>
          <li><strong>Daily:</strong> Standard refresh for business intelligence reports</li>
          <li><strong>Weekly:</strong> Executive summaries and trend analysis</li>
        </ul>
      </Section>

      <Section title="Data Sources">
        <p className="text-[#cbd5e1] mb-4">
          Select which data to include in your exports:
        </p>
        <ul className="list-disc ml-6 text-[#cbd5e1] space-y-2">
          <li><strong>psychographic_profiles:</strong> Full user psychological profiles with confidence scores</li>
          <li><strong>events:</strong> Raw behavioral event stream</li>
          <li><strong>insights:</strong> AI-generated insights and recommendations</li>
          <li><strong>engagements:</strong> Engagement delivery history and responses</li>
          <li><strong>attributions:</strong> Conversion attribution data</li>
        </ul>
      </Section>

      <Callout type="success">
        <p>
          <strong>Pro Tip:</strong> Use date_range_days filter to control export size. 
          Start with 7-30 days for initial dashboards, then expand once your BI infrastructure is tested.
        </p>
      </Callout>

      <Section title="Integration Examples">
        <h4 className="text-white font-bold mb-3">Tableau Connection</h4>
        <p className="text-[#cbd5e1] mb-3 text-sm">
          1. Export data as CSV using the exportBI function<br/>
          2. Upload to Tableau Server or Tableau Cloud<br/>
          3. Create visualizations using psychographic dimensions
        </p>

        <h4 className="text-white font-bold mb-3 mt-6">Power BI Connection</h4>
        <p className="text-[#cbd5e1] mb-3 text-sm">
          1. Configure Azure Blob delivery in your export config<br/>
          2. Connect Power BI to your Azure storage account<br/>
          3. Set up automatic data refresh
        </p>
      </Section>
    </div>
  );
}