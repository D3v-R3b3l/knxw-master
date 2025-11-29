Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const sessionId = crypto.randomUUID();
  
  return new Response(JSON.stringify({
    success: true,
    session_id: sessionId,
    session: {
      session_id: sessionId,
      mode: 'demo',
      started_at: new Date().toISOString(),
      status: 'active'
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
});