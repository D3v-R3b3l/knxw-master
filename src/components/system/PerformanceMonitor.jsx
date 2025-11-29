import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay  
    cls: null, // Cumulative Layout Shift
    fcp: null, // First Contentful Paint
    ttfb: null // Time to First Byte
  });

  useEffect(() => {
    // Observe Web Vitals if supported
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!entry.hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + entry.value }));
            }
            break;
        }
      }
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.log('Performance Observer not fully supported');
    }

    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
    }

    // Get navigation timing
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const navEntry = navEntries[0];
      setMetrics(prev => ({ 
        ...prev, 
        ttfb: navEntry.responseStart - navEntry.requestStart 
      }));
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};

export const PerformanceMonitor = ({ className = '', showInDevelopment = true }) => {
  const metrics = usePerformanceMetrics();
  const [memoryInfo, setMemoryInfo] = useState(null);
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  useEffect(() => {
    // Memory usage (Chrome only)
    if (performance.memory) {
      const updateMemory = () => {
        setMemoryInfo({
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
        });
      };

      updateMemory();
      const interval = setInterval(updateMemory, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  // Only show in development or when explicitly enabled
  if (!showInDevelopment && !isDevelopment) {
    return null;
  }

  const getMetricStatus = (value, thresholds) => {
    if (value === null) return 'unknown';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needs_improvement) return 'warning';
    return 'poor';
  };

  const formatMetric = (value, unit = 'ms') => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}${unit}`;
  };

  const MetricBadge = ({ label, value, thresholds, unit = 'ms' }) => {
    const status = getMetricStatus(value, thresholds);
    const colors = {
      good: 'bg-green-500/20 text-green-400',
      warning: 'bg-yellow-500/20 text-yellow-400',
      poor: 'bg-red-500/20 text-red-400',
      unknown: 'bg-gray-500/20 text-gray-400'
    };

    return (
      <div className="flex flex-col items-center space-y-1">
        <span className="text-xs text-[#a3a3a3]">{label}</span>
        <Badge className={colors[status]}>
          {formatMetric(value, unit)}
        </Badge>
      </div>
    );
  };

  return (
    <Card className={`bg-[#111111] border-[#262626] ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <MetricBadge 
            label="LCP" 
            value={metrics.lcp} 
            thresholds={{ good: 2500, needs_improvement: 4000 }}
          />
          <MetricBadge 
            label="FID" 
            value={metrics.fid} 
            thresholds={{ good: 100, needs_improvement: 300 }}
          />
          <MetricBadge 
            label="CLS" 
            value={metrics.cls} 
            thresholds={{ good: 0.1, needs_improvement: 0.25 }}
            unit=""
          />
          <MetricBadge 
            label="FCP" 
            value={metrics.fcp} 
            thresholds={{ good: 1800, needs_improvement: 3000 }}
          />
          <MetricBadge 
            label="TTFB" 
            value={metrics.ttfb} 
            thresholds={{ good: 800, needs_improvement: 1800 }}
          />
        </div>

        {memoryInfo && (
          <div className="flex items-center justify-between text-xs text-[#a3a3a3] pt-2 border-t border-[#262626]">
            <span>Memory: {memoryInfo.used}MB / {memoryInfo.total}MB</span>
            <span>Limit: {memoryInfo.limit}MB</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;