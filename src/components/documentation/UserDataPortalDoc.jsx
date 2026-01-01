import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Shield, Eye, Edit, Download, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function UserDataPortalDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <UserCheck className="w-7 h-7 text-[#14b8a6]" />
        User Data Transparency Portal
      </h3>
      <p className="text-[#a3a3a3] mb-6">
        Give your end-users complete visibility and control over their psychographic data. The User Data Portal enables transparency, builds trust, and ensures compliance with privacy regulations like GDPR and CCPA.
      </p>

      <div className="bg-gradient-to-r from-[#14b8a6]/10 to-[#10b981]/10 border border-[#14b8a6]/30 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#14b8a6] mb-3">🛡️ Privacy-First Design</h4>
        <p className="text-[#a3a3a3] text-sm">
          Ethical AI requires transparency. Users can see what data is collected, how it's analyzed, and can opt out of specific features while still benefiting from personalization where they choose.
        </p>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">User-Facing Features</h4>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { 
            icon: Eye, 
            title: 'Profile Transparency', 
            desc: 'Users see their inferred motivations, communication style, and content preferences in plain language.',
            color: '#14b8a6'
          },
          { 
            icon: Shield, 
            title: 'Granular Consent', 
            desc: 'Individual toggles for psychographic profiling, behavioral tracking, personalized engagements, and AI inference.',
            color: '#8b5cf6'
          },
          { 
            icon: Edit, 
            title: 'User Corrections', 
            desc: 'Allow users to correct AI inferences they feel are inaccurate, improving model accuracy.',
            color: '#f59e0b'
          },
          { 
            icon: Download, 
            title: 'Data Export', 
            desc: 'One-click export of all collected data in machine-readable format for portability.',
            color: '#3b82f6'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#262626] rounded-lg p-4 hover:border-[#14b8a6]/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <h5 className="font-semibold text-white">{item.title}</h5>
            </div>
            <p className="text-sm text-[#a3a3a3]">{item.desc}</p>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Consent Configuration</h4>
      
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// UserDataProfile consent_status structure
{
  "consent_status": {
    "psychographic_profiling": true,
    "behavioral_tracking": true,
    "personalized_engagements": true,
    "data_sharing_with_integrations": false,
    "ai_inference": true
  },
  "engagement_preferences": {
    "preferred_frequency": "moderate",
    "preferred_channels": ["in_app", "email"],
    "quiet_hours": {
      "enabled": true,
      "start_time": "22:00",
      "end_time": "08:00"
    }
  }
}`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Data Request Types</h4>
      
      <div className="space-y-3 mb-6">
        {[
          { type: 'export', title: 'Data Export', desc: 'Download all personal data in JSON format', icon: Download, color: '#3b82f6' },
          { type: 'deletion', title: 'Right to Erasure', desc: 'Request complete deletion of all personal data', icon: Trash2, color: '#ef4444' },
          { type: 'correction', title: 'Data Correction', desc: 'Request changes to inaccurate inferences', icon: Edit, color: '#f59e0b' }
        ].map((item) => (
          <div key={item.type} className="flex items-start gap-4 bg-[#111111] border border-[#262626] rounded-lg p-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}20` }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div>
              <h5 className="font-semibold text-white">{item.title}</h5>
              <p className="text-sm text-[#a3a3a3]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Value Exchange</h4>
      <p className="text-[#a3a3a3] mb-4">
        Show users the value they receive from data sharing to encourage continued participation:
      </p>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`"benefits_received": {
  "personalized_experiences_count": 47,
  "relevant_recommendations_count": 23,
  "time_saved_estimate_minutes": 120
}`}
        </pre>
      </div>

      <Link to={createPageUrl("UserDataPortal")}>
        <Button className="bg-[#14b8a6] hover:bg-[#0d9488] text-white">
          <UserCheck className="w-4 h-4 mr-2" />
          View User Data Portal
        </Button>
      </Link>
    </div>
  );
}