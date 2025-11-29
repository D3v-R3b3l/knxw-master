import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Helper to calculate percentile
function getPercentile(arr, p) {
  if (arr.length === 0) return 0;
  arr.sort((a, b) => a - b);
  const index = (p / 100) * (arr.length - 1);
  if (Math.floor(index) === index) return arr[index];
  const lower = arr[Math.floor(index)];
  const upper = arr[Math.ceil(index)];
  return lower + (upper - lower) * (index - Math.floor(index));
}

Deno.serve(async (req) => {
  // This function is designed to be called by a scheduler (e.g., cron)
  // For simplicity, we'll use a service role client
  const base44 = createClientFromRequest(req).asServiceRole;

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Fetch all SystemEvents from the last hour
    const events = await base44.entities.SystemEvent.filter({
      timestamp: { '$gte': oneHourAgo.toISOString() }
    });

    if (events.length === 0) {
      return Response.json({ message: "No events to process." });
    }

    // Group events by org_id and workspace_id
    const groupedEvents = events.reduce((acc, event) => {
      const key = `${event.org_id}|${event.workspace_id || 'org_level'}`;
      if (!acc[key]) {
        acc[key] = {
          org_id: event.org_id,
          workspace_id: event.workspace_id,
          events: []
        };
      }
      acc[key].events.push(event);
      return acc;
    }, {});

    const metricsToCreate = [];
    const hourTimestamp = new Date(oneHourAgo.setMinutes(0, 0, 0)).toISOString();

    for (const groupKey in groupedEvents) {
      const group = groupedEvents[groupKey];
      const groupEvents = group.events;
      
      // Calculate metrics for each group
      const requestCount = groupEvents.length;
      const errorCount = groupEvents.filter(e => e.severity === 'error' || e.severity === 'critical').length;
      const authFailures = groupEvents.filter(e => e.event_type === 'auth' && e.severity === 'error').length;
      
      const latencies = groupEvents
        .filter(e => e.payload?.total_ms !== undefined)
        .map(e => e.payload.total_ms);
      const p95Latency = getPercentile(latencies, 95);

      const searchEvents = groupEvents.filter(e => e.event_type === 'search');
      const retrievalMisses = searchEvents.filter(e => e.payload?.results_count === 0).length;
      const missRate = searchEvents.length > 0 ? (retrievalMisses / searchEvents.length) * 100 : 0;
      
      // Add metrics to the creation list
      metricsToCreate.push(
        { timestamp: hourTimestamp, org_id: group.org_id, workspace_id: group.workspace_id, metric_name: 'requests', value: requestCount },
        { timestamp: hourTimestamp, org_id: group.org_id, workspace_id: group.workspace_id, metric_name: 'errors', value: errorCount },
        { timestamp: hourTimestamp, org_id: group.org_id, workspace_id: group.workspace_id, metric_name: 'auth_failures', value: authFailures },
        { timestamp: hourTimestamp, org_id: group.org_id, workspace_id: group.workspace_id, metric_name: 'latency_p95_ms', value: p95Latency },
        { timestamp: hourTimestamp, org_id: group.org_id, workspace_id: group.workspace_id, metric_name: 'retrieval_miss_rate', value: missRate }
      );
    }
    
    // Bulk create metrics
    if (metricsToCreate.length > 0) {
      await base44.entities.MetricsHour.bulkCreate(metricsToCreate);
    }

    return Response.json({
      success: true,
      groups_processed: Object.keys(groupedEvents).length,
      metrics_created: metricsToCreate.length,
    });

  } catch (error) {
    console.error('Metrics aggregation failed:', error);
    return Response.json({ 
      error: 'Metrics aggregation failed', 
      details: error.message 
    }, { status: 500 });
  }
});