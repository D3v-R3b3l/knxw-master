import { createClient } from 'npm:@base44/sdk@0.5.0'; // Use service-role capable client
import { UploadPrivateFile } from '@/integrations/Core';

const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

// Helper to calculate SHA-256 checksum
async function getChecksum(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Main job function
async function archiveLogs(logType, Entity) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const oldLogs = await base44.asServiceRole.entities[Entity].filter({
    created_date: { '$lt': thirtyDaysAgo }
  });

  if (oldLogs.length === 0) {
    console.log(`No old logs to archive for ${logType}`);
    return;
  }

  // Group logs by organization and date
  const groupedByOrgAndDate = oldLogs.reduce((acc, log) => {
    const date = new Date(log.created_date).toISOString().split('T')[0];
    const key = `${log.org_id}|${date}`;
    if (!acc[key]) {
      acc[key] = { org_id: log.org_id, date, logs: [] };
    }
    acc[key].logs.push(log);
    return acc;
  }, {});

  // Process each group
  for (const group of Object.values(groupedByOrgAndDate)) {
    const content = group.logs.map(log => JSON.stringify(log)).join('\n');
    const checksum = await getChecksum(content);
    const filename = `archive_${logType}_${group.org_id}_${group.date}.jsonl`;
    const file = new File([content], filename, { type: 'application/x-jsonlines' });

    // Upload to private storage
    const { file_uri } = await UploadPrivateFile({ file });
    
    // Create cold storage record
    await base44.asServiceRole.entities.ColdStorageLog.create({
      org_id: group.org_id,
      log_type: logType,
      archived_date: group.date,
      file_uri,
      record_count: group.logs.length,
      checksum
    });

    // Delete archived logs
    for (const log of group.logs) {
      await base44.asServiceRole.entities[Entity].delete(log.id);
    }
    console.log(`Archived and deleted ${group.logs.length} ${logType} logs for org ${group.org_id} from ${group.date}`);
  }
}

Deno.serve(async (req) => {
  // This endpoint can be hit by a scheduler (e.g., Deno Cron, GitHub Actions)
  // We add a simple secret header check for security
  const authSecret = req.headers.get('X-Archive-Secret');
  if (authSecret !== Deno.env.get('ARCHIVE_JOB_SECRET')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await archiveLogs('access_log', 'AccessLog');
    await archiveLogs('audit_log', 'AuditLog');
    return Response.json({ status: 'ok', message: 'Archiving job completed.' });
  } catch (error) {
    console.error('Archiving job failed:', error);
    return Response.json({ error: 'Archiving failed', details: error.message }, { status: 500 });
  }
});