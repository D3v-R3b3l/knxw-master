
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { BillingSubscription } from '@/entities/BillingSubscription';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Zap, Code, CheckCircle, ArrowRight, Sparkles, Brain } from 'lucide-react';
// Replace direct backend import with SDK
// import { createCheckout } from '@/functions/createCheckout';
import { base44 } from "@/api/base44Client";

const PLAN_HIERARCHY = {
  developer: 0,
  growth: 1,
  pro: 2,
  enterprise: 3
};

const PLAN_DETAILS = {
  developer: {
    name: "Developer",
    price: "$0",
    period: "forever",
    icon: Code,
    gradient: "from-[#6b7280] to-[#4b5563]",
    features: [
      "1,000 monthly psychographic credits",
      "Basic psychographic profiling", 
      "Real-time event stream",
      "Standard dashboards",
      "JavaScript SDK",
      "Documentation & forum support",
      "Read-only Journey builder access",
      "In-app engagements only"
    ],
    limits: {
      monthly_credits: 1000,
      s3_exports: 100,
      eventbridge_events: 1000,
      ses_emails: 0,
      conversions_per_month: 0,
      sms_messages: 0,
      push_notifications: 0,
      active_journeys: 0,
      scheduled_reports: 0,
      agent_actions: 0,
      hubspot_sync: false,
      advanced_analytics: false,
      engagement_rules: false,
      ai_agents: false,
      executive_dashboard: false
    }
  },
  growth: {
    name: "Growth",
    price: "$99",
    period: "per month", 
    icon: Zap,
    gradient: "from-[#10b981] to-[#059669]",
    features: [
      "10,000 monthly psychographic credits",
      "Advanced psychographic profiling",
      "Full Journey Builder access (5 active journeys)",
      "Executive Dashboard with 1 scheduled weekly report",
      "In-app, Email, and SMS engagements",
      "100 SMS messages + 1,000 push notifications/month",
      "AI Agents with 500 actions/month",
      "Standard integrations (HubSpot, Meta CAPI)",
      "AWS exports (100K events, 1K SES emails)",
      "Email support (24-hour response)"
    ],
    limits: {
      monthly_credits: 10000,
      s3_exports: 10000,
      eventbridge_events: 100000,
      ses_emails: 1000,
      conversions_per_month: 5000,
      sms_messages: 100,
      push_notifications: 1000,
      active_journeys: 5,
      scheduled_reports: 1,
      agent_actions: 500,
      hubspot_sync: true,
      advanced_analytics: true,
      engagement_rules: true,
      ai_agents: true,
      executive_dashboard: true
    }
  },
  pro: {
    name: "Pro",
    price: "$499",
    period: "per month",
    icon: Crown,
    gradient: "from-[#00d4ff] to-[#0ea5e9]",
    features: [
      "100,000 monthly psychographic credits",
      "Unlimited active journeys",
      "Executive Dashboard with 5 scheduled weekly reports",
      "All engagement channels (In-app, Email, SMS, Push)",
      "1,000 SMS messages + 10,000 push notifications/month",
      "Unlimited AI agent actions",
      "Full Meta + Google + GA4 attribution (50K conversions/month)",
      "Real-time AWS streaming (1M EventBridge events, 10K SES emails)",
      "Priority support + monthly strategy calls + account manager"
    ],
    limits: {
      monthly_credits: 100000,
      s3_exports: -1, // unlimited
      eventbridge_events: 1000000,
      ses_emails: 10000,
      conversions_per_month: 50000,
      sms_messages: 1000,
      push_notifications: 10000,
      active_journeys: -1, // unlimited
      scheduled_reports: 5,
      agent_actions: -1, // unlimited
      hubspot_sync: true,
      advanced_analytics: true,
      engagement_rules: true,
      ai_agents: true,
      executive_dashboard: true
    }
  }
};

export function useSubscription() {
  const [planKey, setPlanKey] = React.useState('developer');
  const [subscription, setSubscription] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const currentUser = await User.me();
        if (!mounted) return;
        setIsAdmin(currentUser?.role === 'admin');

        // Try to load an active/trialing subscription
        let sub = null;
        try {
          const subs = await BillingSubscription.filter({ user_id: currentUser.id });
          sub = Array.isArray(subs)
            ? subs.find((s) => ['active', 'trialing'].includes(s.status)) || null
            : null;
        } catch (_e) {
          // ignore and fall back
        }

        const key = sub?.plan_key || currentUser?.current_plan_key || 'developer';
        if (!mounted) return;
        setSubscription(sub);
        setPlanKey(key);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { planKey, subscription, loading, isAdmin };
}

export function SubscriptionGate({ 
  children, 
  requiredPlan = 'growth', 
  feature = 'this feature',
  customMessage 
}) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const loadUserAndSubscription = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // CRITICAL: Admin users bypass all restrictions
        if (currentUser?.role === 'admin') {
          setLoading(false);
          return;
        }

        // Load actual subscription with error handling
        try {
          const subscriptions = await BillingSubscription.filter({ user_id: currentUser.id });
          const activeSub = subscriptions.find(s => ['active', 'trialing'].includes(s.status));
          setSubscription(activeSub || { plan_key: 'developer', status: 'active' });
        } catch (subError) {
          console.error('Error loading subscription:', subError);
          // Default to developer plan if subscription loading fails
          setSubscription({ plan_key: 'developer', status: 'active' });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setSubscription({ plan_key: 'developer', status: 'active' });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserAndSubscription();
  }, []);

  const handleUpgrade = async (planKey) => {
    if (upgrading) return;
    
    setUpgrading(true);
    try {
      // Invoke backend function via SDK
      const { data } = await base44.functions.invoke('createCheckout', { plan_key: planKey });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again or contact support.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  // CRITICAL: Admin users always get access
  if (user?.role === 'admin') {
    return children;
  }

  // Check if user has required plan
  const currentPlanLevel = PLAN_HIERARCHY[subscription?.plan_key] || 0;
  const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan] || 1;
  
  if (currentPlanLevel >= requiredPlanLevel) {
    return children;
  }

  // Show upgrade prompt
  const currentPlan = PLAN_DETAILS[subscription?.plan_key] || PLAN_DETAILS.developer;
  const targetPlan = PLAN_DETAILS[requiredPlan];
  
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-2xl w-full bg-[#111111] border-[#262626]">
        <CardHeader className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#0a0a0a]" />
            </div>
            <CardTitle className="text-2xl text-white mb-2">
              {customMessage || `Upgrade Required for ${feature}`}
            </CardTitle>
            <p className="text-[#a3a3a3]">
              This feature requires the {targetPlan.name} plan or higher.
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            {/* Current Plan */}
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${currentPlan.gradient} flex items-center justify-center`}>
                <currentPlan.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[#a3a3a3]">Current</p>
              <p className="font-semibold text-white">{currentPlan.name}</p>
              <p className="text-xs text-[#6b7280]">{currentPlan.price}</p>
            </div>

            <ArrowRight className="w-6 h-6 text-[#a3a3a3]" />

            {/* Target Plan */}
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${targetPlan.gradient} flex items-center justify-center shadow-lg`}>
                <targetPlan.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[#00d4ff]">Upgrade to</p>
              <p className="font-semibold text-white">{targetPlan.name}</p>
              <p className="text-xs text-[#a3a3a3]">{targetPlan.price} {targetPlan.period}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          {/* Plan Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00d4ff]" />
              What you'll get with {targetPlan.name}:
            </h4>
            <ul className="space-y-2">
              {targetPlan.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-[#a3a3a3]">
                  <CheckCircle className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleUpgrade(requiredPlan)}
              disabled={upgrading}
              className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
            >
              {upgrading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Upgrade to {targetPlan.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="bg-[#111111] border-[#262626] text-white hover:bg-[#262626]"
            >
              Go Back
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-[#6b7280] text-center mt-4">
            All plans include a 14-day free trial • Cancel anytime • No setup fees
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionGate;
