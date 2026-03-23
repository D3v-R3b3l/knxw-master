import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const traceId = req.traceId || crypto.randomUUID();

    try {
        const user = await base44.auth.me();
        if (!user || !['admin', 'owner'].includes(user.role)) {
            return Response.json({ error: 'Unauthorized: Admin or owner role required.' }, { status: 403 });
        }

        const { subject_identifier, reason } = await req.json();
        if (!subject_identifier) {
            return Response.json({ error: 'Subject identifier (email or user ID) is required.' }, { status: 400 });
        }

        const isEmail = subject_identifier.includes('@');
        const subject_email = isEmail ? subject_identifier : null;
        const subject_user_id = !isEmail ? subject_identifier : null;

        const dataRequest = await base44.entities.DataRequest.create({
            type: 'deletion',
            subject_user_id,
            subject_email,
            status: 'pending',
            requested_by_email: user.email,
            notes: reason || 'No reason provided.',
            org_id: user.current_org_id,
        });

        await base44.entities.AuditLog.create({
            org_id: user.current_org_id,
            user_id: user.email,
            action: 'create',
            table_name: 'DataRequest',
            record_id: dataRequest.id,
            details: { type: 'deletion', subject: subject_identifier, reason },
            request_id: traceId,
        });

        return Response.json({ success: true, message: 'Data deletion request submitted successfully.', request_id: dataRequest.id });

    } catch (error) {
        console.error(`[${traceId}] Failed to request data deletion:`, error);
        return Response.json({ error: 'Failed to submit deletion request.', details: error.message, trace_id: traceId }, { status: 500 });
    }
});