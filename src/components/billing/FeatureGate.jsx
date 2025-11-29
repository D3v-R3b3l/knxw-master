import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Lock, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from '@/utils';

const PLAN_TIERS = {
  developer: 0,
  growth: 1,
  pro: 2,
  business: 3,
  enterprise: 4
};

const TIER_LABELS = {
  developer: 'Developer',
  growth: 'Growth',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise'
};

const TIER_ICONS = {
  developer: Shield,
  growth: Shield,
  pro: Crown,
  business: Crown,
  enterprise: Crown
};

export function useFeatureAccess() {
  const [userPlan, setUserPlan] = useState('developer');
  const [userRole, setUserRole] = useState('user');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserAccess = async () => {
      try {
        const user = await base44.auth.me();
        setUserPlan(user.current_plan_key || 'developer');
        setUserRole(user.role || 'user');
      } catch (error) {
        console.error('Error loading user access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAccess();
  }, []);

  const hasFeatureAccess = (requiredTier, requireAdmin = false) => {
    if (isLoading) return false;
    
    // Check admin requirement
    if (requireAdmin && userRole !== 'admin') return false;
    
    // Check tier requirement
    if (!requiredTier) return true;
    
    const userTier = PLAN_TIERS[userPlan] || 0;
    const reqTier = PLAN_TIERS[requiredTier] || 0;
    
    return userTier >= reqTier;
  };

  const hasAdminAccess = () => {
    return userRole === 'admin';
  };

  return {
    userPlan,
    userRole,
    isLoading,
    hasFeatureAccess,
    hasAdminAccess
  };
}

export function FeatureGate({ children, requiredTier, requireAdmin = false, fallback = null, showUpgrade = true }) {
  const { hasFeatureAccess, isLoading, userPlan } = useFeatureAccess();

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  const hasAccess = hasFeatureAccess(requiredTier, requireAdmin);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgrade) {
    return fallback;
  }

  const TierIcon = TIER_ICONS[requiredTier] || Lock;

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#fbbf24]/20 to-[#f59e0b]/20 border border-[#fbbf24]/30">
            <TierIcon className="w-6 h-6 text-[#fbbf24]" />
          </div>
          <div>
            <CardTitle className="text-white">Upgrade Required</CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              This feature requires the {TIER_LABELS[requiredTier]} plan or higher
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-[#262626] text-[#a3a3a3] mb-2">
              Current Plan: {TIER_LABELS[userPlan]}
            </Badge>
            <p className="text-sm text-[#6b7280]">
              Unlock advanced analytics and AI-powered features with an upgrade
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = createPageUrl('Pricing')}
            className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
          >
            View Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminGate({ children, fallback = null }) {
  const { hasAdminAccess, isLoading } = useFeatureAccess();

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAdminAccess()) {
    return <>{children}</>;
  }

  return fallback || (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#ef4444]/20 to-[#dc2626]/20 border border-[#ef4444]/30">
            <Lock className="w-6 h-6 text-[#ef4444]" />
          </div>
          <div>
            <CardTitle className="text-white">Admin Access Required</CardTitle>
            <CardDescription className="text-[#a3a3a3]">
              This area is restricted to administrators only
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}