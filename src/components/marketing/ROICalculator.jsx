import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Zap, Target, Clock, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRY_PRESETS = {
  SaaS: {
    annual_revenue: 5000000,
    gross_margin: 0.85,
    monthly_users: 50000,
    conversion_rate: 0.05,
    retention_rate_90d: 0.65,
    ltv: 1200,
    churn_rate: 0.05,
    arpu: 99,
    cac_payback_months: 8
  },
  GameDev: {
    annual_revenue: 10000000,
    gross_margin: 0.80,
    monthly_users: 5000000,
    conversion_rate: 0.03,
    retention_rate_90d: 0.40,
    ltv: 50,
    churn_rate: 0.08,
    arpu: 12,
    cac_payback_months: 6
  },
  'E-commerce': {
    annual_revenue: 20000000,
    gross_margin: 0.40,
    monthly_users: 500000,
    conversion_rate: 0.08,
    retention_rate_90d: 0.55,
    ltv: 350,
    churn_rate: 0.06,
    arpu: 85,
    cac_payback_months: 4
  },
  Media: {
    annual_revenue: 8000000,
    gross_margin: 0.70,
    monthly_users: 2000000,
    conversion_rate: 0.04,
    retention_rate_90d: 0.50,
    ltv: 180,
    churn_rate: 0.07,
    arpu: 15,
    cac_payback_months: 5
  }
};

const KNXW_PRICING_TIERS = {
  developer: 0,
  growth: 99 * 12,
  pro: 499 * 12,
  enterprise: 200000
};

export default function ROICalculator({ className = "" }) {
  const [industry, setIndustry] = useState('GameDev');
  const [pricingTier, setPricingTier] = useState('pro');
  const [metrics, setMetrics] = useState(INDUSTRY_PRESETS.GameDev);
  
  const [upliftAssumptions, setUpliftAssumptions] = useState({
    engagement_lift: 25,
    conversion_lift: 20,
    retention_lift: 15,
    monetization_lift: 20
  });

  const handleIndustryChange = (newIndustry) => {
    setIndustry(newIndustry);
    setMetrics(INDUSTRY_PRESETS[newIndustry]);
  };

  const handleMetricChange = (key, value) => {
    setMetrics(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const results = useMemo(() => {
    const knxwCost = KNXW_PRICING_TIERS[pricingTier];
    
    const weights = {
      engagement: 0.25,
      conversion: 0.35,
      retention: 0.25,
      monetization: 0.15
    };
    
    const aggregateUplift = (
      (upliftAssumptions.engagement_lift / 100 * weights.engagement) +
      (upliftAssumptions.conversion_lift / 100 * weights.conversion) +
      (upliftAssumptions.retention_lift / 100 * weights.retention) +
      (upliftAssumptions.monetization_lift / 100 * weights.monetization)
    );
    
    const revenueUplift = metrics.annual_revenue * aggregateUplift;
    const grossProfitImpact = revenueUplift * metrics.gross_margin;
    const netROI = grossProfitImpact - knxwCost;
    const roiMultiple = knxwCost > 0 ? netROI / knxwCost : 0;
    
    const newCACPayback = metrics.cac_payback_months * (1 - upliftAssumptions.conversion_lift / 100);
    const newChurnRate = metrics.churn_rate * (1 - upliftAssumptions.retention_lift / 100);
    const newLTV = metrics.ltv * (1 + upliftAssumptions.monetization_lift / 100);
    const newARPU = metrics.arpu * (1 + upliftAssumptions.monetization_lift / 100);
    
    return {
      revenueUplift,
      grossProfitImpact,
      netROI,
      roiMultiple,
      newCACPayback,
      newChurnRate,
      newLTV,
      newARPU,
      knxwCost
    };
  }, [metrics, upliftAssumptions, pricingTier]);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

  return (
    <section className={`py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111111] relative overflow-hidden ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Calculate Your <span className="gradient-text gradient-fast">knXw ROI</span>
          </h2>
          <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
            See the financial impact of psychographic intelligence on your business metrics
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-[#262626] shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
                  Your Business Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Industry Selector */}
                <div>
                  <Label className="text-[#e5e5e5] mb-2 block">Industry</Label>
                  <Select value={industry} onValueChange={handleIndustryChange}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#262626]">
                      {Object.keys(INDUSTRY_PRESETS).map(ind => (
                        <SelectItem key={ind} value={ind} className="text-white hover:bg-[#262626]">
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Tier */}
                <div>
                  <Label className="text-[#e5e5e5] mb-2 block">knXw Plan</Label>
                  <Select value={pricingTier} onValueChange={setPricingTier}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#262626]">
                      <SelectItem value="developer" className="text-white hover:bg-[#262626]">
                        Developer (Free)
                      </SelectItem>
                      <SelectItem value="growth" className="text-white hover:bg-[#262626]">
                        Growth ($99/mo)
                      </SelectItem>
                      <SelectItem value="pro" className="text-white hover:bg-[#262626]">
                        Pro ($499/mo)
                      </SelectItem>
                      <SelectItem value="enterprise" className="text-white hover:bg-[#262626]">
                        Enterprise (Custom)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Annual Revenue */}
                <div>
                  <Label className="text-[#e5e5e5] mb-2 block">Annual Revenue</Label>
                  <Input
                    type="number"
                    value={metrics.annual_revenue}
                    onChange={(e) => handleMetricChange('annual_revenue', e.target.value)}
                    className="bg-[#0a0a0a] border-[#262626] text-white"
                  />
                </div>

                {/* Uplift Assumptions */}
                <div className="space-y-4 pt-4 border-t border-[#262626]">
                  <h4 className="text-[#e5e5e5] font-semibold">Expected Uplift from knXw</h4>
                  
                  {Object.entries(upliftAssumptions).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-2">
                        <Label className="text-[#a3a3a3] text-sm capitalize">
                          {key.replace('_', ' ')}
                        </Label>
                        <span className="text-[#00d4ff] text-sm font-semibold">{value}%</span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => setUpliftAssumptions(prev => ({ ...prev, [key]: newValue }))}
                        min={0}
                        max={50}
                        step={1}
                        className="[&_[role=slider]]:bg-[#00d4ff] [&_[role=slider]]:border-[#00d4ff]"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-[#00d4ff]/5 to-[#0ea5e9]/5 border-[#00d4ff]/30 shadow-2xl h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
                  Projected Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ROI Multiple - Hero Metric */}
                <motion.div
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-[#00d4ff]/10 to-[#0ea5e9]/10 border border-[#00d4ff]/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-sm text-[#00d4ff] font-semibold mb-2">Return on Investment</div>
                  <div className="text-5xl font-black text-white mb-2">
                    {results.roiMultiple.toFixed(1)}x
                  </div>
                  <div className="text-[#a3a3a3] text-sm">
                    {formatCurrency(results.netROI)} net profit in Year 1
                  </div>
                </motion.div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#111111]/50 border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-[#10b981]" />
                      <span className="text-xs text-[#a3a3a3]">Revenue Uplift</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(results.revenueUplift)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#111111]/50 border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                      <span className="text-xs text-[#a3a3a3]">Gross Profit</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(results.grossProfitImpact)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#111111]/50 border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#fbbf24]" />
                      <span className="text-xs text-[#a3a3a3]">CAC Payback</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {results.newCACPayback.toFixed(1)}mo
                    </div>
                    <div className="text-xs text-[#10b981]">
                      ↓ {(metrics.cac_payback_months - results.newCACPayback).toFixed(1)}mo faster
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#111111]/50 border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#ec4899]" />
                      <span className="text-xs text-[#a3a3a3]">New LTV</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(results.newLTV)}
                    </div>
                    <div className="text-xs text-[#10b981]">
                      ↑ {formatCurrency(results.newLTV - metrics.ltv)} increase
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-4 rounded-lg bg-[#1a1a1a]/50 border border-[#262626]">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[#a3a3a3]">knXw Annual Cost</span>
                    <span className="text-white font-semibold">{formatCurrency(results.knxwCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[#a3a3a3]">Expected Gross Profit Impact</span>
                    <span className="text-[#10b981] font-semibold">{formatCurrency(results.grossProfitImpact)}</span>
                  </div>
                  <div className="border-t border-[#262626] my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Net ROI (Year 1)</span>
                    <span className="text-[#00d4ff] font-bold text-lg">{formatCurrency(results.netROI)}</span>
                  </div>
                </div>

                {/* Attribution Insights */}
                <div className="space-y-3">
                  <h4 className="text-[#e5e5e5] font-semibold text-sm">How knXw Drives Impact</h4>
                  
                  {[
                    {
                      metric: 'Conversion Rate',
                      driver: 'Achievement-motivated users see goal-oriented CTAs and progress feedback',
                      icon: Zap,
                      color: 'text-[#fbbf24]'
                    },
                    {
                      metric: '90-Day Retention',
                      driver: 'Belonging-motivated users receive personalized community invites',
                      icon: Target,
                      color: 'text-[#10b981]'
                    },
                    {
                      metric: 'Session Engagement',
                      driver: 'Exploration-driven profiles exposed to dynamic challenge content',
                      icon: TrendingUp,
                      color: 'text-[#00d4ff]'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-3 rounded-lg bg-[#111111]/30 border border-[#262626]/50"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-start gap-3">
                        <item.icon className={`w-4 h-4 ${item.color} mt-0.5 flex-shrink-0`} />
                        <div>
                          <div className="text-white text-sm font-semibold mb-1">{item.metric}</div>
                          <div className="text-[#a3a3a3] text-xs">{item.driver}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-[#a3a3a3] mb-4">
            These projections are based on industry benchmarks. Actual results may vary.
          </p>
          <Button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold px-8 py-6 text-lg rounded-2xl shadow-xl"
          >
            See Pricing Plans →
          </Button>
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes knxwGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .gradient-text {
          background-size: 200% 200%;
          animation: knxwGradientShift 3s ease infinite;
        }
        .gradient-fast {
          background-image: linear-gradient(90deg, #00d4ff, #0ea5e9, #00d4ff);
        }
      `}</style>
    </section>
  );
}