
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedLine from '../charts/AnimatedLine';
import { format } from 'date-fns';

export default function SystemHealthMonitor() {
  const [healthData, setHealthData] = useState({
    overall: 'healthy',
    services: [],
    metrics: {},
    uptime: 0,
    lastUpdate: null
  });
  
  const [historicalData, setHistoricalData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadHealthData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Mock health check - in production this would call actual health endpoints
      const mockHealthData = await performHealthChecks();
      setHealthData(mockHealthData);
      
      // Update historical data
      setHistoricalData(prev => {
        const newPoint = {
          timestamp: new Date().toISOString(),
          responseTime: mockHealthData.metrics.avgResponseTime || 0,
          cpuUsage: mockHealthData.metrics.cpuUsage || 0,
          memoryUsage: mockHealthData.metrics.memoryUsage || 0,
          errorRate: mockHealthData.metrics.errorRate || 0
        };
        
        return [...prev.slice(-50), newPoint]; // Keep last 50 points
      });
      
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthData(prev => ({
        ...prev,
        overall: 'critical',
        lastUpdate: new Date().toISOString()
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, []); // Empty dependency array means this function reference is stable

  useEffect(() => {
    loadHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(loadHealthData, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadHealthData]); // Now loadHealthData is a dependency

  const performHealthChecks = async () => {
    // Simulate various system checks
    const checks = [
      { name: 'Database', status: Math.random() > 0.1 ? 'healthy' : 'degraded', responseTime: Math.random() * 100 + 50 },
      { name: 'API Gateway', status: Math.random() > 0.05 ? 'healthy' : 'unhealthy', responseTime: Math.random() * 50 + 20 },
      { name: 'Cache Layer', status: Math.random() > 0.02 ? 'healthy' : 'degraded', responseTime: Math.random() * 30 + 10 },
      { name: 'File Storage', status: Math.random() > 0.03 ? 'healthy' : 'degraded', responseTime: Math.random() * 200 + 100 },
      { name: 'Email Service', status: Math.random() > 0.08 ? 'healthy' : 'unhealthy', responseTime: Math.random() * 500 + 200 },
      { name: 'Analytics Engine', status: Math.random() > 0.15 ? 'healthy' : 'degraded', responseTime: Math.random() * 800 + 300 },
      { name: 'AI/ML Services', status: Math.random() > 0.12 ? 'healthy' : 'unhealthy', responseTime: Math.random() * 1200 + 500 },
      { name: 'External APIs', status: Math.random() > 0.2 ? 'healthy' : 'degraded', responseTime: Math.random() * 300 + 150 }
    ];

    const unhealthyServices = checks.filter(s => s.status === 'unhealthy').length;
    const degradedServices = checks.filter(s => s.status === 'degraded').length;
    
    let overallStatus = 'healthy';
    if (unhealthyServices > 0) overallStatus = 'critical';
    else if (degradedServices > 2) overallStatus = 'degraded';
    else if (degradedServices > 0) overallStatus = 'warning';

    return {
      overall: overallStatus,
      services: checks,
      metrics: {
        avgResponseTime: Math.round(checks.reduce((sum, s) => sum + s.responseTime, 0) / checks.length),
        cpuUsage: Math.random() * 40 + 30, // 30-70%
        memoryUsage: Math.random() * 50 + 25, // 25-75%
        diskUsage: Math.random() * 30 + 40, // 40-70%
        networkLatency: Math.random() * 20 + 10, // 10-30ms
        errorRate: Math.random() * 2, // 0-2%
        throughput: Math.random() * 1000 + 500, // 500-1500 req/min
        uptime: 99.9 - Math.random() * 0.5 // 99.4-99.9%
      },
      uptime: Date.now() - (Math.random() * 86400000), // Up to 24 hours ago
      lastUpdate: new Date().toISOString()
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'unhealthy':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'unhealthy':
      case 'critical':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatUptime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const uptimeMs = Date.now() - timestamp;
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const chartData = historicalData.slice(-20).map((point, index) => ({
    time: format(new Date(point.timestamp), 'HH:mm'),
    'Response Time': point.responseTime,
    'CPU Usage': point.cpuUsage,
    'Memory Usage': point.memoryUsage,
    'Error Rate': point.errorRate * 10 // Scale up for visibility
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(healthData.overall)}`}>
            {getStatusIcon(healthData.overall)}
            <span className="font-semibold capitalize">{healthData.overall}</span>
          </div>
          <div className="text-sm text-[#a3a3a3]">
            Last updated: {healthData.lastUpdate ? format(new Date(healthData.lastUpdate), 'HH:mm:ss') : 'Never'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant="outline"
            size="sm"
            className={`border-[#262626] ${autoRefresh ? 'text-[#00d4ff] border-[#00d4ff]/30' : 'text-[#a3a3a3]'} hover:bg-[#1a1a1a]`}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          
          <Button
            onClick={loadHealthData}
            variant="outline"
            size="sm"
            className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#a3a3a3]">Response Time</span>
            </div>
            <div className="text-xl font-bold text-white">
              {healthData.metrics.avgResponseTime || 0}ms
            </div>
            <div className="text-xs text-[#10b981] flex items-center mt-1">
              <TrendingDown className="w-3 h-3 mr-1" />
              -12ms from last hour
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-sm text-[#a3a3a3]">CPU Usage</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round(healthData.metrics.cpuUsage || 0)}%
            </div>
            <Progress 
              value={healthData.metrics.cpuUsage || 0} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#10b981]" />
              <span className="text-sm text-[#a3a3a3]">Memory Usage</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round(healthData.metrics.memoryUsage || 0)}%
            </div>
            <Progress 
              value={healthData.metrics.memoryUsage || 0} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-sm text-[#a3a3a3]">Disk Usage</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round(healthData.metrics.diskUsage || 0)}%
            </div>
            <Progress 
              value={healthData.metrics.diskUsage || 0} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-[#ec4899]" />
              <span className="text-sm text-[#a3a3a3]">Network Latency</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Math.round(healthData.metrics.networkLatency || 0)}ms
            </div>
            <div className="text-xs text-[#10b981] flex items-center mt-1">
              <TrendingDown className="w-3 h-3 mr-1" />
              Optimal
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-sm text-[#a3a3a3]">Uptime</span>
            </div>
            <div className="text-xl font-bold text-white">
              {healthData.metrics.uptime?.toFixed(2) || 0}%
            </div>
            <div className="text-xs text-[#a3a3a3]">
              {formatUptime(healthData.uptime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">System Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {chartData.length > 0 ? (
              <AnimatedLine
                data={chartData}
                lines={[
                  { key: 'Response Time', name: 'Response Time (ms)', color: '#00d4ff' },
                  { key: 'CPU Usage', name: 'CPU Usage (%)', color: '#fbbf24' },
                  { key: 'Memory Usage', name: 'Memory Usage (%)', color: '#10b981' },
                  { key: 'Error Rate', name: 'Error Rate (x10)', color: '#ef4444' }
                ]}
                xAxisKey="time"
                height={250}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#6b7280]">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading performance data...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services Health Grid */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">Service Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthData.services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getStatusColor(service.status)} hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{service.name}</span>
                  {getStatusIcon(service.status)}
                </div>
                
                <div className="text-xs opacity-75">
                  Response: {Math.round(service.responseTime)}ms
                </div>
                
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      service.status === 'healthy' ? 'border-green-400/30 text-green-400' :
                      service.status === 'degraded' ? 'border-yellow-400/30 text-yellow-400' :
                      'border-red-400/30 text-red-400'
                    }`}
                  >
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
