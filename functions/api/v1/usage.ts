import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  const startTime = performance.now();
  const tenantId = req.tenantId || 'anonymous';
  const apiKey = req.apiKey || null;
  const requestId = req.headers.get('X-Request-ID') || crypto.randomUUID();
  const base44 = createClientFromRequest(req);

  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET' } 
      });
    }

    const url = new URL(req.url);
    const daysParam = url.searchParams.get('days') || '7';
    const days = Math.min(Math.max(parseInt(daysParam, 10), 1), 90);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const usageEvents = await base44.asServiceRole.entities.UsageEvent.filter(
      { 
        tenant_id: tenantId,
        timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
      },
      '-timestamp',
      10000
    );

    const totalRequests = usageEvents.length;
    const successfulRequests = usageEvents.filter(e => e.status_code >= 200 && e.status_code < 300).length;
    const failedRequests = usageEvents.filter(e => e.status_code >= 400).length;
    const rateLimitedRequests = usageEvents.filter(e => e.is_rate_limited).length;
    
    const latencies = usageEvents.map(e => e.latency_ms).sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    
    const endpointStats = {};
    usageEvents.forEach(e => {
      if (!endpointStats[e.endpoint]) {
        endpointStats[e.endpoint] = { count: 0, avgLatency: 0 };
      }
      endpointStats[e.endpoint].count++;
      endpointStats[e.endpoint].avgLatency += e.latency_ms;
    });
    
    Object.keys(endpointStats).forEach(endpoint => {
      endpointStats[endpoint].avgLatency = Math.round(endpointStats[endpoint].avgLatency / endpointStats[endpoint].count);
    });

    const dailyCounts = {};
    usageEvents.forEach(e => {
      const day = new Date(e.timestamp).toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const summary = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      },
      totals: {
        requests: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        rateLimited: rateLimitedRequests,
        errorRate: totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) + '%' : '0%'
      },
      latency: {
        p50,
        p95,
        p99,
        unit: 'milliseconds'
      },
      byEndpoint: endpointStats,
      dailyBreakdown: dailyCounts
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data: summary,
      meta: { 
        requestId, 
        tenantId, 
        latencyMs: Math.round(performance.now() - startTime) 
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[${requestId}] Usage endpoint error:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message,
      meta: { requestId, tenantId, latencyMs: Math.round(performance.now() - startTime) }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});