import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Database, 
  Users, 
  TrendingUp, 
  PieChart, 
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  Shield,
  Brain,
  Zap,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { executiveMetrics } from '@/functions/executiveMetrics';
import { crmSync } from '@/functions/crmSync';
import { stripeSync } from '@/functions/stripeSync';
import { identityResolution } from '@/functions/identityResolution';

const COLORS = ['#00d4ff', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function UnifiedDataIntegrationPage() {
  const [metrics, setMetrics] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(90);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [executiveSummary, syncStatusData] = await Promise.all([
        executiveMetrics({ 
          action: 'executive_summary', 
          time_period_days: selectedTimeframe 
        }),
        loadSyncStatus()
      ]);
      
      const summaryData = executiveSummary.data || {};
      setMetrics(summaryData);
      setSyncStatus(syncStatusData);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Error loading data integration metrics:', error);
    }
    setIsLoading(false);
  }, [selectedTimeframe]);

  useEffect(() => {
    loadData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const loadSyncStatus = async () => {
    return {
      salesforce: { 
        last_sync: '2024-01-15T10:30:00Z', 
        status: 'success', 
        contacts_synced: 1247,
        errors: 0
      },
      hubspot: { 
        last_sync: '2024-01-15T10:35:00Z', 
        status: 'success', 
        contacts_synced: 892,
        errors: 0
      },
      stripe: { 
        last_sync: '2024-01-15T10:40:00Z', 
        status: 'success', 
        customers_synced: 543,
        subscriptions_synced: 324,
        invoices_synced: 1876,
        errors: 1
      }
    };
  };

  const triggerSync = async (system) => {
    try {
      let result;
      switch (system) {
        case 'salesforce':
          result = await crmSync({ action: 'sync_salesforce_contacts' });
          break;
        case 'hubspot':
          result = await crmSync({ action: 'sync_hubspot_contacts' });
          break;
        case 'stripe':
          result = await stripeSync({ action: 'sync_customers' });
          break;
      }
      await loadData();
    } catch (error) {
      console.error(`Error syncing ${system}:`, error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${(value || 0).toFixed(1)}%`;
  };

  // Prepare chart data
  const cltvChartData = metrics.detailed_metrics?.cltv_uplift ? 
    Object.entries(metrics.detailed_metrics.cltv_uplift).map(([motive, data]) => ({
      name: motive,
      uplift: data.uplift_percentage || 0,
      customers: data.customer_count || 0,
      value: data.total_value || 0
    })) : [];

  const roiChartData = metrics.detailed_metrics?.roi_analysis ? 
    Object.entries(metrics.detailed_metrics.roi_analysis).map(([motive, data]) => ({
      name: motive,
      roi: data.roi_percentage || 0,
      revenue: data.attributed_revenue || 0,
      profit: data.net_profit || 0
    })) : [];

  const attributionChartData = metrics.detailed_metrics?.revenue_attribution ? 
    Object.entries(metrics.detailed_metrics.revenue_attribution).map(([motive, data]) => ({
      name: motive,
      value: data.attributed_revenue || 0,
      percentage: data.revenue_percentage || 0
    })) : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <Database className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Unified Data Integration</h1>
            <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
              Executive Analytics
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-[#a3a3a3] text-lg">
              Psychographic intelligence unified with CRM and financial data
            </p>
            
            <div className="flex items-center gap-4">
              <Select value={selectedTimeframe.toString()} onValueChange={(value) => setSelectedTimeframe(parseInt(value))}>
                <SelectTrigger className="w-48 bg-[#111111] border-[#262626] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={loadData} disabled={isLoading} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {lastRefresh && (
            <p className="text-xs text-[#6b7280] mt-2">
              Last updated: {lastRefresh.toLocaleString()}
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Executive Overview
            </TabsTrigger>
            <TabsTrigger value="cltv" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <DollarSign className="w-4 h-4 mr-2" />
              CLTV Analysis
            </TabsTrigger>
            <TabsTrigger value="attribution" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Target className="w-4 h-4 mr-2" />
              Revenue Attribution
            </TabsTrigger>
            <TabsTrigger value="integration" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Database className="w-4 h-4 mr-2" />
              Data Integration
            </TabsTrigger>
          </TabsList>

          {/* Executive Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#a3a3a3] text-sm">Customers Analyzed</p>
                      <p className="text-2xl font-bold text-white">
                        {metrics.summary?.total_customers_analyzed?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-[#00d4ff]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#a3a3a3] text-sm">Avg CLTV Uplift</p>
                      <p className="text-2xl font-bold text-[#10b981]">
                        {formatPercentage(metrics.summary?.average_cltv_uplift || 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-[#10b981]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#a3a3a3] text-sm">Total ROI Impact</p>
                      <p className="text-2xl font-bold text-[#00d4ff]">
                        {formatCurrency(metrics.summary?.total_roi_impact || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-[#00d4ff]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#a3a3a3] text-sm">Attribution Coverage</p>
                      <p className="text-2xl font-bold text-[#8b5cf6]">
                        {formatPercentage(metrics.summary?.attribution_coverage || 0)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-[#8b5cf6]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Motive */}
            {metrics.summary?.top_performing_motive && (
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-[#00d4ff]" />
                    Top Performing Psychographic Motive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 capitalize">
                        {metrics.summary.top_performing_motive}
                      </h3>
                      <p className="text-[#a3a3a3]">
                        This motivation drives the highest combined CLTV, retention, and ROI performance across your customer base.
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 mb-2">
                        Best Overall Performance
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-[#00d4ff]" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics.insights?.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                      <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-2 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs">
                            {insight.motive}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#a3a3a3]">{insight.description}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-[#6b7280]">No insights available for selected timeframe</p>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-[#fbbf24]" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics.recommendations?.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#262626]">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        rec.priority === 'high' ? 'bg-[#ef4444]' : 
                        rec.priority === 'medium' ? 'bg-[#fbbf24]' : 'bg-[#10b981]'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${
                            rec.priority === 'high' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                            rec.priority === 'medium' ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' :
                            'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                          }`}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="font-medium text-white text-sm mb-1">{rec.action}</p>
                        <p className="text-sm text-[#a3a3a3]">{rec.details}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-[#6b7280]">No recommendations available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CLTV Analysis Tab */}
          <TabsContent value="cltv" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">CLTV Uplift by Motive</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cltvChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#a3a3a3" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#a3a3a3" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111111', 
                          border: '1px solid #262626',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value, name) => [
                          name === 'uplift' ? `${value}%` : value,
                          name === 'uplift' ? 'CLTV Uplift' : 'Customers'
                        ]}
                      />
                      <Bar dataKey="uplift" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">CLTV Details by Motive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cltvChartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
                        <div>
                          <p className="font-medium text-white capitalize">{item.name}</p>
                          <p className="text-xs text-[#a3a3a3]">{item.customers} customers</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${item.uplift >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {formatPercentage(item.uplift)}
                          </p>
                          <p className="text-xs text-[#a3a3a3]">{formatCurrency(item.value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Attribution Tab */}
          <TabsContent value="attribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Attribution by Motive</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={attributionChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {attributionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#111111', 
                          border: '1px solid #262626',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">ROI Analysis by Motive</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roiChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#a3a3a3" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#a3a3a3" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111111', 
                          border: '1px solid #262626',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value, name) => [
                          name === 'roi' ? `${value}%` : formatCurrency(value),
                          name === 'roi' ? 'ROI' : name === 'revenue' ? 'Revenue' : 'Profit'
                        ]}
                      />
                      <Bar dataKey="roi" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Salesforce Integration */}
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ExternalLink className="w-5 h-5 text-[#00d4ff]" />
                    Salesforce
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a3a3a3]">Status</span>
                    <Badge className={`${
                      syncStatus.salesforce?.status === 'success' 
                        ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' 
                        : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                    }`}>
                      {syncStatus.salesforce?.status === 'success' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Contacts Synced</span>
                      <span className="text-white">{syncStatus.salesforce?.contacts_synced?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Last Sync</span>
                      <span className="text-white text-xs">
                        {syncStatus.salesforce?.last_sync ? 
                          new Date(syncStatus.salesforce.last_sync).toLocaleString() : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Errors</span>
                      <span className={`${syncStatus.salesforce?.errors > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                        {syncStatus.salesforce?.errors || 0}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => triggerSync('salesforce')} 
                    className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                </CardContent>
              </Card>

              {/* HubSpot Integration */}
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ExternalLink className="w-5 h-5 text-[#ff7a59]" />
                    HubSpot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a3a3a3]">Status</span>
                    <Badge className={`${
                      syncStatus.hubspot?.status === 'success' 
                        ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' 
                        : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                    }`}>
                      {syncStatus.hubspot?.status === 'success' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Contacts Synced</span>
                      <span className="text-white">{syncStatus.hubspot?.contacts_synced?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Last Sync</span>
                      <span className="text-white text-xs">
                        {syncStatus.hubspot?.last_sync ? 
                          new Date(syncStatus.hubspot.last_sync).toLocaleString() : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Errors</span>
                      <span className={`${syncStatus.hubspot?.errors > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                        {syncStatus.hubspot?.errors || 0}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => triggerSync('hubspot')} 
                    className="w-full bg-[#ff7a59] hover:bg-[#ff6b47] text-white"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                </CardContent>
              </Card>

              {/* Stripe Integration */}
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="w-5 h-5 text-[#635bff]" />
                    Stripe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a3a3a3]">Status</span>
                    <Badge className={`${
                      syncStatus.stripe?.status === 'success' 
                        ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' 
                        : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                    }`}>
                      {syncStatus.stripe?.status === 'success' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Customers</span>
                      <span className="text-white">{syncStatus.stripe?.customers_synced?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Subscriptions</span>
                      <span className="text-white">{syncStatus.stripe?.subscriptions_synced?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Invoices</span>
                      <span className="text-white">{syncStatus.stripe?.invoices_synced?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Last Sync</span>
                      <span className="text-white text-xs">
                        {syncStatus.stripe?.last_sync ? 
                          new Date(syncStatus.stripe.last_sync).toLocaleString() : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Errors</span>
                      <span className={`${syncStatus.stripe?.errors > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                        {syncStatus.stripe?.errors || 0}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => triggerSync('stripe')} 
                    className="w-full bg-[#635bff] hover:bg-[#5a52ff] text-white"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Data Quality Metrics */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-[#8b5cf6]" />
                  Data Quality & Identity Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">97.3%</p>
                    <p className="text-[#a3a3a3] text-sm">Identity Match Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">2,847</p>
                    <p className="text-[#a3a3a3] text-sm">Unified Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">89.1%</p>
                    <p className="text-[#a3a3a3] text-sm">Data Completeness</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#10b981]">High</p>
                    <p className="text-[#a3a3a3] text-sm">Overall Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}