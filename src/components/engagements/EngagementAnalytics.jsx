
import React, { useState, useEffect, useCallback } from 'react';
import { EngagementRule, EngagementDelivery } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Users, Zap, Clock } from 'lucide-react';

import AnimatedLine from "@/components/charts/AnimatedLine";
import AnimatedBar from "@/components/charts/AnimatedBar";
import AnimatedDonut from "@/components/charts/AnimatedDonut";

export default function EngagementAnalytics({ clientApp }) {
  const [analytics, setAnalytics] = useState({
    totalRules: 0,
    activeRules: 0,
    totalDeliveries: 0,
    totalResponses: 0,
    conversionRate: 0,
    performanceData: [],
    rulePerformance: [],
    responseDistribution: [],
    channelPerformance: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    if (!clientApp) return;
    setIsLoading(true);
    try {
      const [rules, deliveries] = await Promise.all([
        EngagementRule.filter({ client_app_id: clientApp.id }),
        EngagementDelivery.filter({ client_app_id: clientApp.id }, '-created_date', 1000)
      ]);

      const totalRules = rules.length;
      const activeRules = rules.filter(r => r.status === 'active').length;
      const totalDeliveries = deliveries.length;
      const totalResponses = deliveries.filter(d => d.response?.action_taken && d.response.action_taken !== 'ignored').length;
      const conversionRate = totalDeliveries > 0 ? (totalResponses / totalDeliveries * 100) : 0;

      // Helper colors (local to avoid extra hook deps)
      const getResponseColorLocal = (responseType) => {
        switch (responseType) {
          case 'Responded': return '#10b981';
          case 'Converted': return '#00d4ff';
          case 'Dismissed': return '#fbbf24';
          case 'Ignored': return '#6b7280';
          case 'No Response': return '#ef4444';
          case 'Clicked': return '#38bdf8';
          case 'Replied': return '#10b981';
          default: return '#a3a3a3';
        }
      };

      const getChannelColorLocal = (channelType) => {
        switch (String(channelType || '').toLowerCase()) {
          case 'email': return '#8b5cf6';
          case 'sms': return '#10b981';
          case 'push': return '#fbbf24';
          case 'in_app': return '#00d4ff';
          case 'webhook': return '#10b981'; // Assuming webhook color remains
          default: return '#a3a3a3';
        }
      };

      // Performance data over last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          day: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          deliveries: 0,
          responses: 0
        };
      });
      deliveries.forEach(delivery => {
        const deliveryDate = new Date(delivery.created_date).toISOString().split('T')[0];
        const dayData = last30Days.find(d => d.date === deliveryDate);
        if (dayData) {
          dayData.deliveries += 1;
          if (delivery.response?.action_taken && delivery.response.action_taken !== 'ignored') {
            dayData.responses += 1;
          }
        }
      });
      const performanceData = last30Days;

      // Rule performance
      const rulePerformance = rules.map(rule => {
        const ruleDeliveries = deliveries.filter(d => d.rule_id === rule.id);
        const ruleResponses = ruleDeliveries.filter(d => d.response?.action_taken && d.response.action_taken !== 'ignored');
        return {
          name: rule.name,
          deliveries: ruleDeliveries.length,
          responses: ruleResponses.length,
          conversion_rate: ruleDeliveries.length > 0 ? (ruleResponses.length / ruleDeliveries.length * 100) : 0
        };
      }).filter(r => r.deliveries > 0);

      // Response distribution
      const responseTypes = deliveries.reduce((acc, delivery) => {
        const action = delivery.response?.action_taken || 'no_response';
        const displayName =
          action === 'no_response' ? 'No Response' :
          action === 'dismissed' ? 'Dismissed' :
          action === 'responded' ? 'Responded' :
          action === 'converted' ? 'Converted' :
          action === 'ignored' ? 'Ignored' :
          action === 'clicked' ? 'Clicked' :
          action === 'replied' ? 'Replied' : 'Other';
        acc[displayName] = (acc[displayName] || 0) + 1;
        return acc;
      }, {});
      const responseDistribution = Object.entries(responseTypes).map(([name, value]) => ({
        name,
        value,
        color: getResponseColorLocal(name)
      }));

      // Channel performance
      const channelCounts = deliveries.reduce((acc, d) => {
        // Use delivery_channel if present, otherwise try to infer from rule_id, default to 'in_app'
        const ch = d.delivery_channel || (['email','sms','push'].includes(d.rule_id) ? d.rule_id : 'in_app');
        acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {});
      const channelPerformance = Object.entries(channelCounts).map(([name, value]) => ({
        name: name === 'in_app' ? 'In-App' : name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: getChannelColorLocal(name)
      }));

      setAnalytics({
        totalRules,
        activeRules,
        totalDeliveries,
        totalResponses,
        conversionRate,
        performanceData,
        rulePerformance,
        responseDistribution,
        channelPerformance
      });
    } catch (error) {
      console.error('Error loading engagement analytics:', error);
    }
    setIsLoading(false);
  }, [clientApp]); // clientApp is the only dependency that `loadAnalytics` truly needs from outside its scope that might change

  useEffect(() => {
    if (clientApp) {
      loadAnalytics();
    }
  }, [clientApp, loadAnalytics]); // Add loadAnalytics to dependencies

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#fbbf24]/20">
                <Target className="w-5 h-5 text-[#fbbf24]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{analytics.totalRules}</div>
                <div className="text-sm text-[#a3a3a3]">Total Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#10b981]/20">
                <Zap className="w-5 h-5 text-[#10b981]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{analytics.activeRules}</div>
                <div className="text-sm text-[#a3a3a3]">Active Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00d4ff]/20">
                <Users className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{analytics.totalDeliveries}</div>
                <div className="text-sm text-[#a3a3a3]">Total Deliveries</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#ec4899]/20">
                <TrendingUp className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{analytics.totalResponses}</div>
                <div className="text-sm text-[#a3a3a3]">Total Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#8b5cf6]/20">
                <Clock className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{analytics.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-[#a3a3a3]">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">Engagement Performance (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <AnimatedLine
              data={analytics.performanceData}
              xKey="day"
              lines={[
                { key: "deliveries", color: "#00d4ff", name: "Deliveries" },
                { key: "responses", color: "#10b981", name: "Responses" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Rule Performance */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Rule Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics.rulePerformance.length > 0 ? (
                <AnimatedBar
                  data={analytics.rulePerformance}
                  xKey="name"
                  bars={[
                    { key: "deliveries", color: "#00d4ff", name: "Deliveries" },
                    { key: "responses", color: "#10b981", name: "Responses" },
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#a3a3a3]">No rule performance data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Distribution */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics.responseDistribution.length > 0 ? (
                <AnimatedDonut
                  data={analytics.responseDistribution}
                  innerRadius={60}
                  outerRadius={100}
                  centerTitle={analytics.responseDistribution.reduce((s, d) => s + d.value, 0)}
                  centerSubtitle="total"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#a3a3a3]">No response data available</p>
                </div>
              )}
            </div>
            {analytics.responseDistribution.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {analytics.responseDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#a3a3a3]">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics.channelPerformance && analytics.channelPerformance.some(d => d.value > 0) ? (
                <AnimatedBar
                  data={analytics.channelPerformance}
                  xKey="name"
                  bars={[{ key: "value", color: "#00d4ff", name: "Deliveries" }]}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#a3a3a3]">No channel delivery data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
