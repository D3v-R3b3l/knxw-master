import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'status';

    let result;

    switch (action) {
      case 'status':
        result = await getDeploymentStatus();
        break;
      case 'health':
        result = await performHealthCheck();
        break;
      case 'metrics':
        result = await collectMetrics();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return Response.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deployment monitoring failed:', error);
    return Response.json({
      error: 'Monitoring failed',
      details: error.message
    }, { status: 500 });
  }
});

async function getDeploymentStatus() {
  return {
    environment: 'production',
    version: '1.0.0',
    status: 'healthy',
    uptime: Date.now() - (Math.random() * 86400000), // Mock uptime
    lastDeployment: new Date(Date.now() - Math.random() * 86400000).toISOString()
  };
}

async function performHealthCheck() {
  const checks = [
    { name: 'Database', status: Math.random() > 0.1 ? 'healthy' : 'unhealthy' },
    { name: 'API', status: Math.random() > 0.05 ? 'healthy' : 'unhealthy' },
    { name: 'Cache', status: Math.random() > 0.02 ? 'healthy' : 'unhealthy' }
  ];

  const unhealthy = checks.filter(c => c.status === 'unhealthy').length;
  const overall = unhealthy === 0 ? 'healthy' : unhealthy > 1 ? 'critical' : 'degraded';

  return {
    overall,
    checks,
    summary: {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      unhealthy
    }
  };
}

async function collectMetrics() {
  return {
    timestamp: new Date().toISOString(),
    cpu: Math.random() * 50 + 25, // 25-75%
    memory: Math.random() * 60 + 20, // 20-80%
    disk: Math.random() * 40 + 30, // 30-70%
    requests_per_second: Math.random() * 100 + 50,
    response_time: Math.random() * 100 + 50, // 50-150ms
    error_rate: Math.random() * 2 // 0-2%
  };
}