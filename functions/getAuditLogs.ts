import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const traceId = req.traceId || crypto.randomUUID();

    try {
        const user = await base44.auth.me();
        if (!user || !['admin', 'owner'].includes(user.role)) {
            return Response.json({ error: 'Unauthorized: Admin or owner role required.' }, { status: 403 });
        }

        const { search = '', page = 1, limit = 10 } = await req.json();
        const offset = (page - 1) * limit;

        // Base filter for the user's organization
        const baseFilter = { org_id: user.current_org_id };

        const searchFilter = search ? {
            $or: [
                { user_id: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
                { table_name: { $regex: search, $options: 'i' } },
                { record_id: { $regex: search, $options: 'i' } },
            ]
        } : {};
        
        const finalFilter = { ...baseFilter, ...searchFilter };
        
        // Fetch one extra record to determine if a next page exists.
        const recordsToFetch = limit + 1;
        const logsWithExtra = await base44.entities.AuditLog.filter(finalFilter, '-created_date', recordsToFetch, offset);

        const hasNextPage = logsWithExtra.length > limit;
        const logs = logsWithExtra.slice(0, limit);

        return Response.json({
            logs,
            currentPage: page,
            hasNextPage: hasNextPage,
        });

    } catch (error) {
        console.error(`[${traceId}] Failed to fetch audit logs:`, error);
        return Response.json({ error: 'Failed to fetch audit logs.', details: error.message, trace_id: traceId }, { status: 500 });
    }
});