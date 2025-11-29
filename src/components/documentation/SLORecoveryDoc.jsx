import React from 'react';
import DocSection from './Section';
import Callout from './Callout';

export default function SLORecoveryDoc() {
  return (
    <div>
      <DocSection title="Service Level Objectives (SLO) & Disaster Recovery" id="slo-intro">
        <p className="text-[#cbd5e1] leading-relaxed mb-4">
          This document outlines the Recovery Point Objective (RPO) and Recovery Time Objective (RTO) for the knXw platform, which form the basis of our reliability commitments.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                <h3 className="font-semibold text-[#00d4ff] mb-2">Recovery Point Objective (RPO): 5 Minutes</h3>
                <p className="text-sm text-gray-400">
                    In a worst-case disaster scenario, no more than 5 minutes of data should be lost. This is achieved through continuous, real-time database backups and replication.
                </p>
            </div>
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                <h3 className="font-semibold text-[#00d4ff] mb-2">Recovery Time Objective (RTO): 15 Minutes</h3>
                 <p className="text-sm text-gray-400">
                    In a worst-case disaster scenario, the platform aims to be fully restored and operational within 15 minutes. This relies on automated recovery scripts and Infrastructure-as-Code.
                </p>
            </div>
        </div>
      </DocSection>

      <DocSection title="Strategy & Methodology">
         <ul className="list-disc ml-6 text-[#cbd5e1] space-y-3">
            <li>
                <strong className="text-white">Backup & Replication:</strong> Continuous point-in-time recovery (PITR) is enabled for all primary datastores, with data replicated across multiple availability zones in real-time.
            </li>
            <li>
                <strong className="text-white">Automated Recovery:</strong> Automated failover mechanisms are in place. Full environment restoration is managed via Infrastructure-as-Code (IaC) definitions, allowing for rapid redeployment.
            </li>
             <li>
                <strong className="text-white">Quarterly Testing:</strong> Recovery drills are conducted quarterly to verify that our RTO and RPO targets can be consistently met and to refine our processes.
            </li>
        </ul>
        <Callout type="info" title="Monitoring & Alerting">
          Our systems are monitored 24/7 with automated alerts for any deviation from performance SLOs. Health checks run every 30 seconds, and any critical incident triggers an automated escalation process to our on-call engineering team.
        </Callout>
      </DocSection>
    </div>
  );
}