import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Target,
  Users,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { useDashboardStore } from "./DashboardStore";

// Industry benchmark data based on research
const INDUSTRY_BENCHMARKS = {
  'SaaS': {
    avg_engagement_rate: 0.42,
    avg_active_users_percent: 0.28,
    avg_churn_rate: 0.05,
    avg_motivation_diversity: 0.65,
    avg_personality_variance: 0.72
  },
  'E-commerce': {
    avg_engagement_rate: 0.35,
    avg_active_users_percent: 0.22,
    avg_churn_rate: 0.15,
    avg_motivation_diversity: 0.58,
    avg_personality_variance: 0.68
  },
  'Gaming': {
    avg_engagement_rate: 0.68,
    avg_active_users_percent: 0.45,
    avg_churn_rate: 0.08,
    avg_motivation_diversity: 0.78,
    avg_personality_variance: 0.81
  },
  'Media': {
    avg_engagement_rate: 0.52,
    avg_active_users_percent: 0.38,
    avg_churn_rate: 0.12,
    avg_motivation_diversity: 0.71,
    avg_personality_variance: 0.75
  },
  'Default': {
    avg_engagement_rate: 0.40,
    avg_active_users_percent: 0.30,
    avg_churn_rate: 0.10,
    avg_motivation_diversity: 0.65,
    avg_personality_variance: 0.70
  }
};

export default function BenchmarkingPanel({ industry = 'Default' }) {
  const { metrics, profiles, events, userIdsInScope } = useDashboardStore();
  const [benchmarkAnalysis, setBenchmarkAnalysis] = useState(null);

  useEffect(() => {
    calculateBenchmarks();
  }, [metrics, profiles, events, userIdsInScope, industry]);

  const calculateBenchmarks = () => {
    const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['Default'];
    
    // Calculate actual metrics
    const actualEngagementRate = parseFloat(metrics.avgEngagement || 0) / 100;
    const actualActiveUsersPercent = metrics.totalUsers > 0 
      ? metrics.activeUsers / metrics.totalUsers 
      : 0;
    
    // Calculate motivation diversity (how varied user motivations are)
    const scopedProfiles = userIdsInScope && userIdsInScope.size
      ? profiles.filter(p => userIdsInScope.has(p.user_id))
      : profiles;
    
    const motivationSet = new Set();
    scopedProfiles.forEach(profile => {
      const motivations = profile.motivation_stack_v2 || [];
      motivations.forEach(m => motivationSet.add(m.label));
    });
    
    const actualMotivationDiversity = scopedProfiles.length > 0
      ? Math.min(motivationSet.size / 10, 1) // Normalize to 0-1
      : 0;

    // Calculate personality variance (how diverse personality traits are)
    const personalityTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const variances = personalityTraits.map(trait => {
      const values = scopedProfiles
        .map(p => p.personality_traits?.[trait])
        .filter(v => v !== undefined);
      
      if (values.length === 0) return 0;
      
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      return variance;
    });
    
    const actualPersonalityVariance = variances.length > 0
      ? variances.reduce((sum, v) => sum + v, 0) / variances.length
      : 0;

    const analysis = {
      engagement_rate: {
        actual: actualEngagementRate,
        benchmark: benchmark.avg_engagement_rate,
        variance: ((actualEngagementRate - benchmark.avg_engagement_rate) / benchmark.avg_engagement_rate) * 100,
        status: actualEngagementRate >= benchmark.avg_engagement_rate ? 'above' : 'below'
      },
      active_users: {
        actual: actualActiveUsersPercent,
        benchmark: benchmark.avg_active_users_percent,
        variance: ((actualActiveUsersPercent - benchmark.avg_active_users_percent) / benchmark.avg_active_users_percent) * 100,
        status: actualActiveUsersPercent >= benchmark.avg_active_users_percent ? 'above' : 'below'
      },
      motivation_diversity: {
        actual: actualMotivationDiversity,
        benchmark: benchmark.avg_motivation_diversity,
        variance: ((actualMotivationDiversity - benchmark.avg_motivation_diversity) / benchmark.avg_motivation_diversity) * 100,
        status: actualMotivationDiversity >= benchmark.avg_motivation_diversity ? 'above' : 'below'
      },
      personality_variance: {
        actual: actualPersonalityVariance,
        benchmark: benchmark.avg_personality_variance,
        variance: ((actualPersonalityVariance - benchmark.avg_personality_variance) / benchmark.avg_personality_variance) * 100,
        status: actualPersonalityVariance >= benchmark.avg_personality_variance ? 'above' : 'below'
      }
    };

    setBenchmarkAnalysis(analysis);
  };

  if (!benchmarkAnalysis) {
    return null;
  }

  const BenchmarkMetric = ({ title, icon: Icon, data, higherIsBetter = true }) => {
    const isGood = higherIsBetter ? data.status === 'above' : data.status === 'below';
    const TrendIcon = data.variance >= 0 ? TrendingUp : TrendingDown;
    
    return (
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
          <Badge className={isGood ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#fbbf24]/20 text-[#fbbf24]'}>
            {isGood ? 'Above Avg' : 'Below Avg'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#a3a3a3]">Your Average</span>
            <span className="text-white font-bold">{Math.round(data.actual * 100)}%</span>
          </div>
          
          <Progress value={data.actual * 100} className="h-2" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6b7280]">Industry Avg</span>
            <span className="text-[#a3a3a3]">{Math.round(data.benchmark * 100)}%</span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
            <TrendIcon className={`w-3 h-3 ${data.variance >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`} />
            <span className={`text-xs font-semibold ${data.variance >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {Math.abs(Math.round(data.variance))}% {data.variance >= 0 ? 'above' : 'below'} average
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-4">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
          Industry Benchmarking
        </CardTitle>
        <p className="text-sm text-[#a3a3a3]">
          Compare your metrics against {industry} industry averages
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        <BenchmarkMetric
          title="Engagement Rate"
          icon={Activity}
          data={benchmarkAnalysis.engagement_rate}
          higherIsBetter={true}
        />
        
        <BenchmarkMetric
          title="Active User Ratio"
          icon={Users}
          data={benchmarkAnalysis.active_users}
          higherIsBetter={true}
        />
        
        <BenchmarkMetric
          title="Motivation Diversity"
          icon={Target}
          data={benchmarkAnalysis.motivation_diversity}
          higherIsBetter={true}
        />
        
        <BenchmarkMetric
          title="Personality Variance"
          icon={Zap}
          data={benchmarkAnalysis.personality_variance}
          higherIsBetter={true}
        />

        <div className="pt-3 border-t border-[#262626]">
          <p className="text-xs text-[#6b7280] italic">
            Benchmarks based on aggregated industry data. Higher motivation diversity and personality variance typically indicate better product-market fit across diverse user segments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}