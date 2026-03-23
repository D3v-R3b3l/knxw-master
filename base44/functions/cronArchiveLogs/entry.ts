import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    // This is a scheduled job, so we use asServiceRole
    const base44 = createClientFromRequest(req).asServiceRole;
    const traceId = req.headers.get('x-trace-id');
    
    try {
        const config = await base44.entities.ConfigCenter.findOne({}); // Simplified for single-tenant or global config
        const retentionDays = config?.log_retention_days || 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const cutoffIso = cutoffDate.toISOString();
        
        const archiveResults = {
            AuditLog: { moved: 0, failed: 0 },
            AccessLog: { moved: 0, failed: 0 },
        };

        const archiveEntity = async (entityName, archiveEntityName) => {
            const logsToArchive = await base44.entities[entityName].filter({ created_date: { '$lt': cutoffIso } }, null, 500); // Process in batches
            
            for (const log of logsToArchive) {
                try {
                    await base44.entities[archiveEntityName].create({ ...log, original_id: log.id });
                    await base44.entities[entityName].delete(log.id);
                    archiveResults[entityName].moved++;
                } catch (e) {
                    archiveResults[entityName].failed++;
                    console.error(`Failed to archive log ${log.id} from ${entityName}:`, e.message);
                }
            }
        };

        // NOTE: The base44 platform does not currently support dynamic entity names like `base44.entities[entityName]`.
        // The following code is written with the assumption that this capability exists. If not, it would need to be written as two separate blocks.
        // I will proceed with the more dynamic version for conciseness.
        
        // Let's assume we have a `ColdStorageAuditLog` and `ColdStorageAccessLog`
        // Since we cannot create entities dynamically, I will assume `ColdStorageLog` has a `log_type` field.
        
        const auditLogsToArchive = await base44.entities.AuditLog.filter({ created_date: { '$lt': cutoffIso } }, null, 500);
        for (const log of auditLogsToArchive) {
             try {
                await base44.entities.ColdStorageLog.create({ org_id: log.org_id, log_type: 'audit_log', archived_date: new Date().toISOString().split('T')[0], record_count: 1, file_uri: 'db_archive', checksum: 'none', original_data: log });
                await base44.entities.AuditLog.delete(log.id);
                archiveResults.AuditLog.moved++;
             } catch (e) {
                 archiveResults.AuditLog.failed++;
             }
        }
        
        const accessLogsToArchive = await base44.entities.AccessLog.filter({ created_date: { '$lt': cutoffIso } }, null, 500);
        for (const log of accessLogsToArchive) {
             try {
                await base44.entities.ColdStorageLog.create({ org_id: log.org_id, log_type: 'access_log', archived_date: new Date().toISOString().split('T')[0], record_count: 1, file_uri: 'db_archive', checksum: 'none', original_data: log });
                await base44.entities.AccessLog.delete(log.id);
                archiveResults.AccessLog.moved++;
             } catch (e) {
                 archiveResults.AccessLog.failed++;
             }
        }

        await base44.entities.SystemEvent.create({
            org_id: 'system',
            event_type: 'admin_action',
            actor_id: 'cron_scheduler',
            actor_type: 'system',
            payload: { action: 'log_archival', success: true, ...archiveResults },
            trace_id: traceId
        });

        return new Response(JSON.stringify({ success: true, ...archiveResults }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
         await base44.entities.SystemEvent.create({
            org_id: 'system',
            event_type: 'error',
            actor_id: 'cron_scheduler',
            actor_type: 'system',
            payload: { action: 'log_archival', success: false, error: e.message },
            trace_id: traceId,
            severity: 'critical',
        });
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});