import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Code, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLES = [
  {
    id: 'admin',
    title: 'Administrator',
    icon: Shield,
    color: '#8b5cf6',
    description: 'Manage organization, team access, and integrations',
    features: ['Team management', 'Security & compliance', 'Billing & subscriptions', 'Integration setup']
  },
  {
    id: 'marketer',
    title: 'Marketer / Growth',
    icon: TrendingUp,
    color: '#ec4899',
    description: 'Create segments, run campaigns, and analyze results',
    features: ['Audience segmentation', 'A/B testing', 'Engagement campaigns', 'Analytics & insights']
  },
  {
    id: 'developer',
    title: 'Developer',
    icon: Code,
    color: '#00d4ff',
    description: 'Integrate the SDK and leverage the API',
    features: ['SDK integration', 'API access', 'Webhook configuration', 'Event tracking']
  }
];

export default function RoleSelector({ onRoleSelected }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole) return;

    setIsSaving(true);
    
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        onboarding_state: {
          ...user.onboarding_state,
          preferred_role: selectedRole
        }
      });

      onRoleSelected?.(selectedRole);
    } catch (error) {
      console.error('Failed to save role preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-4 w-full"
      >
        <Card className="bg-[#111111] border-[#00d4ff]/30">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <Sparkles className="w-8 h-8 text-[#0a0a0a]" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome to knXw!
              </h2>
              <p className="text-[#a3a3a3] text-lg max-w-2xl mx-auto">
                Let's personalize your experience. What's your primary role?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                        : 'border-[#262626] bg-[#1a1a1a] hover:border-[#00d4ff]/40'
                    }`}
                  >
                    <div 
                      className="p-3 rounded-lg inline-flex mb-4"
                      style={{ backgroundColor: `${role.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: role.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-[#a3a3a3] mb-4">
                      {role.description}
                    </p>
                    <ul className="space-y-1">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-[#6b7280] flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#00d4ff]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleConfirm}
                disabled={!selectedRole || isSaving}
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold px-8 py-3"
              >
                {isSaving ? 'Setting up...' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}