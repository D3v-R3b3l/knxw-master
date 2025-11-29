import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, ArrowRight, Crown, Zap, Shield, Code } from "lucide-react";
import { createCheckout } from "@/functions/createCheckout";
import { BillingSubscription } from "@/entities/BillingSubscription";
import { User } from "@/entities/User";

const planDetails = {
  developer: {
    name: "Developer",
    icon: Code,
    gradient: "from-[#6b7280] to-[#4b5563]",
    price: "$0",
    period: "forever",
    features: [
      "1,000 monthly psychographic credits",
      "Basic AWS integrations (100 S3 exports, 1K EventBridge events)",
      "Basic ROI attribution reporting (view-only)",
      "Demo Data Studio (lite)"
    ]
  },
  growth: {
    name: "Growth",
    icon: Zap,
    gradient: "from-[#10b981] to-[#059669]",
    price: "$99",
    period: "per month",
    features: [
      "10,000 monthly psychographic credits",
      "Automated S3 exports & EventBridge streaming (100K events)",
      "Full Meta CAPI integration (5K conversions/month)",
      "SES email automation (1K emails/month)"
    ]
  },
  pro: {
    name: "Pro",
    icon: Crown,
    gradient: "from-[#00d4ff] to-[#0ea5e9]", 
    price: "$499",
    period: "per month",
    features: [
      "100,000 monthly psychographic credits",
      "Real-time AWS streaming (1M EventBridge events, 10K SES emails)", 
      "Full Meta + Google + GA4 attribution (50K conversions/month)",
      "Priority support + account manager"
    ]
  }
};

export default function BillingManager() {
  const [loading, setLoading] = React.useState(true);
  const [currentSubscription, setCurrentSubscription] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const subscriptions = await BillingSubscription.filter({ user_id: currentUser.id });
      const activeSub = subscriptions.find(s => s.status === 'active');
      setCurrentSubscription(activeSub || { plan_key: 'developer', status: 'active' });
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSubscription();
  }, []);

  const handleSubscribe = async (planKey) => {
    try {
      const { data } = await createCheckout({ plan_key: planKey });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription process. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
        </CardContent>
      </Card>
    );
  }

  const currentPlan = planDetails[currentSubscription?.plan_key] || planDetails.developer;

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-6">
          <CardTitle className="text-white flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${currentPlan.gradient} flex items-center justify-center`}>
              <currentPlan.icon className="w-5 h-5 text-white" />
            </div>
            Current Plan: {currentPlan.name}
          </CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Status: <Badge className="ml-2 bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">{currentSubscription?.status || 'Active'}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="text-3xl font-bold text-white mb-4">
            {currentPlan.price}
            <span className="text-sm text-[#a3a3a3] font-normal ml-2">{currentPlan.period}</span>
          </div>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#e5e5e5]">
                <Check className="w-4 h-4 text-[#10b981] mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-6">
          <CardTitle className="text-white">Available Plans</CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Choose the plan that best fits your needs. Upgrade or downgrade anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(planDetails).map(([key, plan]) => {
              const isCurrent = currentSubscription?.plan_key === key;
              const PlanIcon = plan.icon;
              
              return (
                <Card key={key} className={`bg-[#0f0f0f] border-[#262626] ${isCurrent ? 'ring-2 ring-[#00d4ff]/50' : ''}`}>
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                          <PlanIcon className="w-4 h-4 text-white" />
                        </div>
                        {plan.name}
                      </CardTitle>
                      {isCurrent && <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">Current</Badge>}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {plan.price}
                      <span className="text-sm text-[#a3a3a3] font-normal ml-1">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <ul className="space-y-1 mb-4">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#e5e5e5]">
                          <Check className="w-3 h-3 text-[#10b981] mt-0.5" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-[#a3a3a3]">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe(key)}
                      disabled={isCurrent}
                      className={`w-full ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]'}`}
                    >
                      {isCurrent ? 'Current Plan' : key === 'developer' ? 'Downgrade' : 'Upgrade'}
                      {!isCurrent && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}