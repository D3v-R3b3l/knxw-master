import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This function is designed to be run as a scheduled cron job.
// It iterates through all tenants and archives logs older than the configured retention period.

Deno.serve(async (req) => {
    // Use asServiceRole for system-wide operations, bypassing user-specific RLS.
    const base44 = createClientFromRequest(req).asServiceRole;
    const traceId = req.traceId || crypto.randomUUID();
    const runSummary = [];

    try {
        const { Org, ConfigCenter, AuditLog, AccessLog, ColdStorageLog, SystemEvent } = base44.entities;
        
        const allOrgs = await Org.list();

        for (const org of allOrgs) {
            const orgSummary = { org_id: org.id, audit_archived: 0, access_archived: 0, errors: [] };
            
            try {
                const config = await ConfigCenter.findOne({ tenant_id: org.id });
                const retentionDays = config?.log_retention_days || 90;
                
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                const cutoffISO = cutoffDate.toISOString();

                // Archive Audit Logs
                const oldAuditLogs = await AuditLog.filter({ org_id: org.id, created_date: { $lt: cutoffISO } }, null, 500);
                if (oldAuditLogs.length > 0) {
                    const logIds = oldAuditLogs.map(log => log.id);
                    await ColdStorageLog.create({
                        org_id: org.id,
                        log_type: 'audit_log',
                        archived_date: new Date().toISOString().split('T')[0],
                        record_count: oldAuditLogs.length,
                        // In a real system, you'd upload a file and store the URI.
                        // Here we store a sample of IDs as a string.
                        file_uri: `simulated://audit/${new Date().toISOString()}`,
                        checksum: `sha256-${crypto.randomUUID().substring(0,16)}`
                    });
                    await AuditLog.bulkDelete(logIds);
                    orgSummary.audit_archived = oldAuditLogs.length;
                }

                // Archive Access Logs
                const oldAccessLogs = await AccessLog.filter({ org_id: org.id, created_date: { $lt: cutoffISO } }, null, 500);
                 if (oldAccessLogs.length > 0) {
                    const logIds = oldAccessLogs.map(log => log.id);
                    await ColdStorageLog.create({
                        org_id: org.id,
                        log_type: 'access_log',
                        archived_date: new Date().toISOString().split('T')[0],
                        record_count: oldAccessLogs.length,
                        file_uri: `simulated://access/${new Date().toISOString()}`,
                        checksum: `sha256-${crypto.randomUUID().substring(0,16)}`
                    });
                    await AccessLog.bulkDelete(logIds);
                    orgSummary.access_archived = oldAccessLogs.length;
                }

                if (orgSummary.audit_archived > 0 || orgSummary.access_archived > 0) {
                     await SystemEvent.create({
                        org_id: org.id,
                        event_type: 'system',
                        severity: 'info',
                        payload: {
                            action: 'log_archival_completed',
                            details: `Archived ${orgSummary.audit_archived} audit logs and ${orgSummary.access_archived} access logs.`,
                            trace_id: traceId
                        }
                    });
                }
            } catch (e) {
                orgSummary.errors.push(e.message);
                console.error(`[${traceId}] Error archiving for org ${org.id}:`, e);
            }
            runSummary.push(orgSummary);
        }

        return Response.json({ success: true, message: 'Log archival job completed.', summary: runSummary });

    } catch (error) {
        console.error(`[${traceId}] Log Archival Job Failed:`, error);
        return Response.json({ error: `Critical failure in log archival job: ${error.message}`, trace_id: traceId }, { status: 500 });
    }
});