import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Shield, Eye, Edit, Download, Trash2, Brain, History, Bell, Lock, ThumbsUp, Activity, Clock, CheckCircle } from 'lucide-react';
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
        A comprehensive transparency center that empowers end-users to understand, control, and benefit from their psychographic data. Critical for building trust, ensuring compliance, and driving platform adoption.
      </p>

      <div className="bg-gradient-to-r from-[#14b8a6]/10 to-[#10b981]/10 border border-[#14b8a6]/30 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-[#14b8a6] mb-3">🛡️ Why This Matters for Launch Success</h4>
        <p className="text-[#a3a3a3] text-sm">
          Transparency builds trust. When users understand how their data creates value for them, they're more likely to engage and less likely to opt out. This portal transforms data collection from a privacy concern into a value exchange—a critical differentiator for adoption.
        </p>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Portal Tabs Overview</h4>

      <div className="space-y-4 mb-8">
        {/* Tab 1: Overview */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#00d4ff]/20">
              <Eye className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-2">1. What We Know (Overview)</h5>
              <p className="text-sm text-[#a3a3a3] mb-3">Users see exactly what knXw has inferred about them.</p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Trust Score Card</strong> — Visual score (0-100) showing data transparency health</li>
                <li>• <strong className="text-white">Inferred Profile</strong> — Top motivations, communication style, content preferences</li>
                <li>• <strong className="text-white">Data Sources</strong> — Where profile data originates with data point counts</li>
                <li>• <strong className="text-white">Value Exchange Banner</strong> — Tangible benefits received from personalization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab 2: AI Explainability - NEW */}
        <div className="bg-[#111111] border border-[#8b5cf6]/30 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#8b5cf6]/20">
              <Brain className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-semibold text-white">2. AI Explainability</h5>
                <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs">NEW</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3] mb-3">Deep transparency into how AI forms conclusions about each user.</p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Expandable Sections</strong> — Personality, Emotional State, Cognitive Style, Motivations, Risk Profile</li>
                <li>• <strong className="text-white">Confidence Scores</strong> — Per-dimension confidence with progress bars</li>
                <li>• <strong className="text-white">AI Reasoning</strong> — Plain-language explanations for each inference</li>
                <li>• <strong className="text-white">Data Provenance</strong> — Which data sources contributed to each conclusion</li>
                <li>• <strong className="text-white">Key Events</strong> — Recent events that influenced the profile</li>
                <li>• <strong className="text-white">Profile Corrections</strong> — Users can challenge inferences they believe are incorrect</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab 3: Privacy Controls */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#10b981]/20">
              <Lock className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-2">3. Privacy Controls</h5>
              <p className="text-sm text-[#a3a3a3] mb-3">Granular consent toggles for each data usage category.</p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• Psychographic Profiling — Allow/disallow AI understanding of motivations</li>
                <li>• Behavioral Tracking — Control page view and interaction tracking</li>
                <li>• Personalized Engagements — Opt in/out of personalized messages</li>
                <li>• AI Inference — Enable/disable AI-generated insights</li>
                <li>• Integration Sharing — Control data sharing with connected tools</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab 4: Usage Timeline - NEW */}
        <div className="bg-[#111111] border border-[#f59e0b]/30 rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#f59e0b]/20">
              <History className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-semibold text-white">4. Usage Timeline</h5>
                <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] text-xs">NEW</Badge>
              </div>
              <p className="text-sm text-[#a3a3a3] mb-3">Chronological log of every data access and usage event.</p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Event Types</strong> — Profile analyzed, engagement sent, recommendation generated, etc.</li>
                <li>• <strong className="text-white">Filterable</strong> — Filter by event type to focus on specific activities</li>
                <li>• <strong className="text-white">Expandable Details</strong> — Click any event to see full context and purpose</li>
                <li>• <strong className="text-white">Grouped by Day</strong> — Easy-to-scan chronological organization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab 5: Preferences */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#ec4899]/20">
              <Bell className="w-5 h-5 text-[#ec4899]" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-2">5. Engagement Preferences</h5>
              <p className="text-sm text-[#a3a3a3] mb-3">User-controlled communication settings.</p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• Communication Frequency — Minimal, Moderate, or Frequent</li>
                <li>• Preferred Channels — In-app, Email, Push, SMS toggles</li>
                <li>• Quiet Hours — Do-not-disturb time windows</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab 6: Data Requests */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-[#ef4444]/20">
              <Download className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-2">6. Data Requests (GDPR/CCPA)</h5>
              <p className="text-sm text-[#a3a3a3] mb-3">Full data portability and deletion support.</p>
              <ul className="text-sm text-[#6b7280] space-y-1">
                <li>• <strong className="text-white">Export My Data</strong> — Download all personal data in standard formats</li>
                <li>• <strong className="text-white">Delete My Data</strong> — Request permanent deletion from all systems</li>
                <li>• <strong className="text-white">Request History</strong> — Track status of pending and completed requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Trust Score Calculation</h4>
      
      <p className="text-[#a3a3a3] mb-4">
        The Trust Score (0-100) provides an at-a-glance measure of data transparency health:
      </p>

      <div className="bg-[#111111] border border-[#262626] rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a3a3a3]">Consent Configured</span>
            <Badge className="bg-[#10b981]/20 text-[#10b981]">+25 points</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a3a3a3]">Data Sources Tracked (Provenance)</span>
            <Badge className="bg-[#10b981]/20 text-[#10b981]">+25 points</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a3a3a3]">Profile Recently Updated (&lt;7 days)</span>
            <Badge className="bg-[#10b981]/20 text-[#10b981]">+25 points</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a3a3a3]">High Confidence Scores (&gt;70%)</span>
            <Badge className="bg-[#10b981]/20 text-[#10b981]">+25 points</Badge>
          </div>
        </div>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Profile Correction System</h4>
      
      <div className="bg-[#1a1a1a] border border-[#f59e0b]/30 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 rounded-lg bg-[#f59e0b]/20">
            <Edit className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <h5 className="font-semibold text-white mb-2">User-Driven Profile Corrections</h5>
            <p className="text-sm text-[#a3a3a3]">
              Users can challenge AI inferences they believe are incorrect. This feedback loop improves model accuracy over time.
            </p>
          </div>
        </div>
        <ul className="text-sm text-[#6b7280] space-y-2 ml-14">
          <li>• <strong className="text-white">Field Selection</strong> — Choose from Risk Profile, Cognitive Style, Communication Style, Primary Motivation</li>
          <li>• <strong className="text-white">Side-by-Side Comparison</strong> — See AI inference vs. user's correction</li>
          <li>• <strong className="text-white">Optional Explanation</strong> — Users can explain why the AI was wrong</li>
          <li>• <strong className="text-white">Correction History</strong> — Full audit trail of all submitted corrections</li>
        </ul>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Value Exchange Display</h4>
      <p className="text-[#a3a3a3] mb-4">
        Show users the value they receive from data sharing to encourage continued participation:
      </p>

      <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#8b5cf6]/10 border border-[#00d4ff]/30 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#00d4ff]">47</p>
            <p className="text-sm text-[#a3a3a3]">Personalized Experiences</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#10b981]">12</p>
            <p className="text-sm text-[#a3a3a3]">Relevant Recommendations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#8b5cf6]">35m</p>
            <p className="text-sm text-[#a3a3a3]">Time Saved</p>
          </div>
        </div>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Data Model</h4>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 mb-6">
        <pre className="bg-[#0a0a0a] border border-[#262626] rounded p-4 text-sm text-[#10b981] overflow-x-auto">
{`// UserDataProfile entity structure
{
  "consent_status": {
    "psychographic_profiling": true,
    "behavioral_tracking": true,
    "personalized_engagements": true,
    "data_sharing_with_integrations": false,
    "ai_inference": true
  },
  "visible_profile": {
    "top_motivations": ["Achievement", "Growth"],
    "communication_style": "analytical",
    "content_preferences": ["data-driven", "concise"]
  },
  "data_sources": [...],
  "benefits_received": {...},
  "data_requests": [...],
  "user_corrections": [...]  // NEW: correction history
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