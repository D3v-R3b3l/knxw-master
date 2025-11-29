/**
 * System health monitoring endpoint
 * Provides real-time health status, metrics, and diagnostics
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function getMemoryUsage() {
  if (typeof Deno !== 'undefined' && Deno.memoryUsage) {
    const usage = Deno.memoryUsage();
    return {
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      formatted: {
        rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`
      }
    };
  }
  return { available: false };
}

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'GET' }
    });
  }

  const url = new URL(req.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  try {
    const base44 = createClientFromRequest(req);
    
    // Test database connectivity
    let dbHealth = 'healthy';
    let dbError = null;
    try {
      await base44.asServiceRole.entities.Tenant.list('-created_date', 1);
    } catch (error) {
      dbHealth = 'unhealthy';
      dbError = error.message;
    }

    // Get memory usage
    const memory = getMemoryUsage();
    
    let memoryHealth = 'healthy';
    if (memory.available !== false) {
      const heapUsedPercent = (memory.heapUsed / memory.heapTotal) * 100;
      if (heapUsedPercent > 90) {
        memoryHealth = 'warning';
      }
    }

    const overallHealthy = dbHealth === 'healthy';

    const response = {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      version: '1.0.0',
      uptime: performance.now() / 1000,
      timestamp: new Date().toISOString(),
      health: {
        database: {
          status: dbHealth,
          error: dbError
        },
        memory: {
          status: memoryHealth,
          ...memory.formatted
        }
      }
    };

    if (detailed) {
      response.memory = memory;
    }

    return new Response(JSON.stringify(response, null, 2), {
      status: overallHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});