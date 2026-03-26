import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const traceId = req.headers.get('x-trace-id');
    const { dryRun = true } = await req.json();

    try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
             return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        
        // This function now acts as a proxy to the main job
        const jobResponse = await base44.functions.invoke('secretRotationJob', { dryRun });
        
        if (jobResponse.error) {
            throw new Error(jobResponse.error);
        }

        return new Response(JSON.stringify(jobResponse), { status: 200, headers: { 'Content-Type': 'application/json', 'x-trace-id': traceId } });

    } catch (e) {
         return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});