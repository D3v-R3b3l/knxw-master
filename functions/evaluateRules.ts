import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    const now = new Date();
    
    // Get all active alert rules
    const alertRules = await base44.entities.AlertRule.filter({ enabled: true });
    
    const alertsToCreate = [];
    
    for (const rule of alertRules) {
      // Check cooldown period
      if (rule.last_triggered) {
        const lastTriggered = new Date(rule.last_triggered);
        const cooldownEnd = new Date(lastTriggered.getTime() + rule.cooldown_minutes * 60 * 1000);
        if (now < cooldownEnd) {
          continue; // Still in cooldown
        }
      }
      
      const timeWindowStart = new Date(now.getTime() - rule.time_window_minutes * 60 * 1000);
      
      let shouldAlert = false;
      let alertData = {
        org_id: rule.org_id,
        workspace_id: rule.workspace_id,
        rule_name: rule.rule_name,
        severity: 'warning'
      };
      
      if (rule.rule_name === 'api_error_rate_spike') {
        // Get metrics for requests and errors in the time window
        const [requestMetrics, errorMetrics] = await Promise.all([
          base44.entities.MetricsHour.filter({
            org_id: rule.org_id,
            workspace_id: rule.workspace_id,
            metric_name: 'requests',
            timestamp: { '$gte': timeWindowStart.toISOString() }
          }),
          base44.entities.MetricsHour.filter({
            org_id: rule.org_id,
            workspace_id: rule.workspace_id,
            metric_name: 'errors',
            timestamp: { '$gte': timeWindowStart.toISOString() }
          })
        ]);
        
        const totalRequests = requestMetrics.reduce((sum, m) => sum + m.value, 0);
        const totalErrors = errorMetrics.reduce((sum, m) => sum + m.value, 0);
        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
        const threshold = rule.thresholds.error_rate_percent || 2.0;
        
        if (errorRate > threshold) {
          shouldAlert = true;
          alertData = {
            ...alertData,
            title: `API Error Rate Spike Detected`,
            message: `Error rate of ${errorRate.toFixed(2)}% exceeds threshold of ${threshold}% over the last ${rule.time_window_minutes} minutes.`,
            metric_value: errorRate,
            threshold: threshold,
            severity: errorRate > threshold * 2 ? 'critical' : 'warning'
          };
        }
      }
      
      else if (rule.rule_name === 'latency_slo_breach') {
        // Get P95 latency metrics in the time window
        const latencyMetrics = await base44.entities.MetricsHour.filter({
          org_id: rule.org_id,
          workspace_id: rule.workspace_id,
          metric_name: 'latency_p95_ms',
          timestamp: { '$gte': timeWindowStart.toISOString() }
        });
        
        if (latencyMetrics.length > 0) {
          const avgLatency = latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length;
          const threshold = rule.thresholds.latency_ms || 400;
          
          if (avgLatency > threshold) {
            shouldAlert = true;
            alertData = {
              ...alertData,
              title: `Latency SLO Breach Detected`,
              message: `Average P95 latency of ${avgLatency.toFixed(0)}ms exceeds SLO of ${threshold}ms over the last ${rule.time_window_minutes} minutes.`,
              metric_value: avgLatency,
              threshold: threshold,
              severity: avgLatency > threshold * 1.5 ? 'critical' : 'warning'
            };
          }
        }
      }
      
      else if (rule.rule_name === 'retrieval_miss_rate') {
        // Get retrieval miss rate metrics
        const missRateMetrics = await base44.entities.MetricsHour.filter({
          org_id: rule.org_id,
          workspace_id: rule.workspace_id,
          metric_name: 'retrieval_miss_rate',
          timestamp: { '$gte': timeWindowStart.toISOString() }
        });
        
        if (missRateMetrics.length > 0) {
          const avgMissRate = missRateMetrics.reduce((sum, m) => sum + m.value, 0) / missRateMetrics.length;
          const threshold = rule.thresholds.miss_rate_percent || 25.0;
          
          if (avgMissRate > threshold) {
            shouldAlert = true;
            alertData = {
              ...alertData,
              title: `High Retrieval Miss Rate Detected`,
              message: `Average retrieval miss rate of ${avgMissRate.toFixed(1)}% exceeds threshold of ${threshold}% over the last ${rule.time_window_minutes} minutes.`,
              metric_value: avgMissRate,
              threshold: threshold,
              severity: avgMissRate > threshold * 1.5 ? 'critical' : 'warning'
            };
          }
        }
      }
      
      if (shouldAlert) {
        // Create alert
        const alert = await base44.entities.Alert.create(alertData);
        
        // Update rule's last triggered time
        await base44.entities.AlertRule.update(rule.id, {
          last_triggered: now.toISOString()
        });
        
        // Log the alert event
        await base44.entities.SystemEvent.create({
          org_id: rule.org_id,
          workspace_id: rule.workspace_id,
          actor_type: 'system',
          actor_id: 'alert_evaluator',
          event_type: 'admin_action',
          severity: alertData.severity,
          payload: {
            alert_id: alert.id,
            rule_name: rule.rule_name,
            metric_value: alertData.metric_value,
            threshold: alertData.threshold
          },
          trace_id: crypto.randomUUID(),
          timestamp: now.toISOString()
        });
        
        alertsToCreate.push(alert);
      }
    }
    
    // Trigger notifications for new alerts
    for (const alert of alertsToCreate) {
      try {
        // Call notify_channels function for each alert
        await base44.functions.invoke('notifyChannels', {
          org_id: alert.org_id,
          workspace_id: alert.workspace_id,
          alert_id: alert.id
        });
      } catch (error) {
        console.error(`Failed to send notifications for alert ${alert.id}:`, error);
      }
    }
    
    return Response.json({
      success: true,
      rules_evaluated: alertRules.length,
      alerts_created: alertsToCreate.length,
      alert_ids: alertsToCreate.map(a => a.id)
    });
    
  } catch (error) {
    console.error('Rule evaluation failed:', error);
    return Response.json({ 
      error: 'Rule evaluation failed', 
      details: error.message 
    }, { status: 500 });
  }
});