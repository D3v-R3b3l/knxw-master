import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Database, Users, Sparkles } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

export default function DataQualityDoc() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          The Data Quality system uses AI to continuously monitor your psychographic data for issues, 
          automatically detect anomalies, identify duplicates, and suggest corrections to maintain high data integrity.
        </p>

        <Callout type="info" icon={ShieldCheck}>
          <strong>Automated Quality Checks:</strong> Run comprehensive scans on-demand or schedule regular 
          quality audits to ensure your psychographic intelligence remains accurate and actionable.
        </Callout>
      </Section>

      <Section title="Quality Checks">
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00d4ff]" />
              Duplicate Detection
            </h4>
            <p className="text-[#a3a3a3] text-sm mb-3">
              AI identifies potential duplicate user profiles based on behavioral similarity, event patterns, 
              and profile characteristics.
            </p>
            <ul className="text-sm text-[#e5e5e5] space-y-1 ml-4">
              <li>• Same user_id with multiple profile entries</li>
              <li>• Similar behavioral patterns indicating same user</li>
              <li>• Matching psychographic traits with high confidence</li>
            </ul>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#fbbf24]" />
              Anomaly Detection
            </h4>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Identifies unusual patterns in event streams that may indicate data quality issues:
            </p>
            <ul className="text-sm text-[#e5e5e5] space-y-1 ml-4">
              <li>• Impossible event sequences</li>
              <li>• Suspicious timing patterns</li>
              <li>• Outlier behaviors inconsistent with profile</li>
              <li>• Malformed event payloads</li>
            </ul>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              Consistency Validation
            </h4>
            <p className="text-[#a3a3a3] text-sm mb-3">
              Validates data consistency across your psychographic database:
            </p>
            <ul className="text-sm text-[#e5e5e5] space-y-1 ml-4">
              <li>• Missing required fields</li>
              <li>• Invalid confidence scores (outside 0-1 range)</li>
              <li>• Expired profiles still marked active</li>
              <li>• Orphaned events without user mapping</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Running a Quality Scan">
        <p className="text-[#e5e5e5] mb-4">
          Navigate to <strong>Data Quality</strong> in the sidebar and click "Run Quality Scan". 
          The AI will analyze up to 500 recent profiles and 1,000 recent events to generate a comprehensive 
          quality report.
        </p>

        <Callout type="success" icon={Sparkles}>
          Recommended frequency: Run quality scans weekly or after major data imports to maintain optimal data health.
        </Callout>
      </Section>
    </div>
  );
}