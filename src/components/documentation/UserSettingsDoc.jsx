import React from 'react';
import { User, Bell, Shield, Key, Brain } from 'lucide-react';
import Section from './Section';
import Callout from './Callout';

export default function UserSettingsDoc() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-[#e5e5e5] leading-relaxed mb-4">
          User Settings allows you to manage your personal profile, customize notification preferences including 
          psychographic triggers, control privacy settings for data sharing, and manage API access for integrations.
        </p>
      </Section>

      <Section title="Profile Management">
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00d4ff]" />
            Profile Information
          </h4>
          <ul className="text-[#e5e5e5] text-sm space-y-1 ml-4">
            <li>• Update your display name</li>
            <li>• View account email (cannot be changed)</li>
            <li>• Manage profile picture (coming soon)</li>
          </ul>
        </div>
      </Section>

      <Section title="Notification Preferences">
        <div className="space-y-3">
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Standard Notifications</h4>
            <ul className="text-[#e5e5e5] text-sm space-y-1 ml-4">
              <li>• AI Insights Digest - Weekly summary</li>
              <li>• Churn Risk Alerts - Immediate high-priority alerts</li>
              <li>• Weekly Performance Digest</li>
            </ul>
          </div>

          <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#8b5cf6]" />
              Psychographic Triggers
            </h4>
            <p className="text-[#e5e5e5] text-sm mb-2">
              Get notified when users exhibit specific psychological patterns:
            </p>
            <ul className="text-[#e5e5e5] text-sm space-y-1 ml-4">
              <li>• <strong>High Churn Risk:</strong> Users entering high churn probability</li>
              <li>• <strong>Motivation Shifts:</strong> Significant changes in user motivations</li>
              <li>• <strong>Emotional State Changes:</strong> Major emotional transitions</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Privacy Controls">
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Data Sharing Settings</h4>
          <ul className="text-[#e5e5e5] text-sm space-y-2">
            <li>
              <strong className="text-white">Psychographic Tracking:</strong> Control whether knXw analyzes your 
              behavior for personalization
            </li>
            <li>
              <strong className="text-white">Third-Party Integrations:</strong> Allow/block data sharing with 
              connected platforms (HubSpot, Segment, Shopify, etc.)
            </li>
            <li>
              <strong className="text-white">Data Retention:</strong> Set how long your psychographic data is 
              retained (30-730 days)
            </li>
          </ul>
        </div>

        <Callout type="warning" icon={Shield}>
          Disabling psychographic tracking will limit personalization features and AI insights accuracy.
        </Callout>
      </Section>
    </div>
  );
}