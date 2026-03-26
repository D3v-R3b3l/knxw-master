import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { UploadPrivateFile, CreateFileSignedUrl } from '@/integrations/Core';

// Helper to safely stringify with BigInt support
function safeJSONStringify(obj) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

// Redacts sensitive keys from a JSON object recursively
const SENSITIVE_KEYS = ['token', 'password', 'secret', 'apikey', 'authorization', 'secret_key'];
function redact(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const newObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        newObj[key] = '[REDACTED]';
      } else {
        newObj[key] = redact(obj[key]);
      }
    }
  }
  return newObj;
}

// Converts an array of objects to a CSV string
function toCsv(data, columns) {
  const header = columns.join(',') + '\n';
  const body = data.map(row => 
    columns.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  return header + body;
}

// Calculates SHA-256 checksum
async function getChecksum(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { org_id, from_date, to_date, format = 'jsonl' } = await req.json();
    if (!org_id || !from_date || !to_date) {
      return Response.json({ error: 'org_id, from_date, and to_date are required' }, { status: 400 });
    }

    // 1. Verify user is admin or owner of the org
    const orgUsers = await base44.entities.OrgUser.filter({ org_id, user_email: user.email });
    const orgUser = orgUsers[0];
    if (!orgUser || !['owner', 'admin'].includes(orgUser.role)) {
      return Response.json({ error: 'Forbidden: Insufficient permissions for export' }, { status: 403 });
    }

    // 2. Fetch logs from both tables
    const from = new Date(from_date).toISOString();
    const to = new Date(to_date).toISOString();

    const [accessLogs, auditLogs] = await Promise.all([
      base44.entities.AccessLog.filter({ org_id, created_date: { '$gte': from, '$lte': to } }),
      base44.entities.AuditLog.filter({ org_id, created_date: { '$gte': from, '$lte': to } })
    ]);

    // 3. Redact secrets
    const redactedAccessLogs = accessLogs.map(log => ({ ...log, extra: redact(log.extra) }));
    const redactedAuditLogs = auditLogs.map(log => ({ 
      ...log, 
      before: redact(log.before), 
      after: redact(log.after) 
    }));

    // 4. Format the output
    let fileContent = '';
    const filename = `knxw_export_${org_id}_${new Date().toISOString()}.log.${format}`;

    if (format === 'jsonl') {
      const accessJsonl = redactedAccessLogs.map(log => safeJSONStringify({ log_type: 'access', ...log })).join('\n');
      const auditJsonl = redactedAuditLogs.map(log => safeJSONStringify({ log_type: 'audit', ...log })).join('\n');
      const parts = [];
      if (accessJsonl) parts.push(accessJsonl);
      if (auditJsonl) parts.push(auditJsonl);
      fileContent = parts.join('\n');
    } else if (format === 'csv') {
      const accessColumns = ['id', 'timestamp', 'user_id', 'action', 'resource', 'success', 'ip_address', 'auth_method', 'response_code'];
      const auditColumns = ['id', 'timestamp', 'user_id', 'action', 'table_name', 'record_id', 'ip_address'];
      const parts = [];
      if (redactedAccessLogs.length > 0) parts.push(`--- ACCESS LOGS ---\n${toCsv(redactedAccessLogs, accessColumns)}`);
      if (redactedAuditLogs.length > 0) parts.push(`--- AUDIT LOGS ---\n${toCsv(redactedAuditLogs, auditColumns)}`);
      fileContent = parts.join('\n\n');
    }

    // 5. Calculate checksum
    const checksum = await getChecksum(fileContent);
    
    // 6. Store to temporary secure bucket
    const file = new File([fileContent], filename, { type: 'text/plain' });
    const { file_uri } = await UploadPrivateFile({ file });
    
    // 7. Return pre-signed URL and checksum
    const { signed_url } = await CreateFileSignedUrl({ file_uri, expires_in: 86400 }); // 24 hours

    // Log the export action itself
     await base44.entities.AuditLog.create({
      action: 'read',
      user_id: user.email,
      org_id,
      table_name: 'AccessLog,AuditLog',
      details: { export_format: format, from_date, to_date, record_count: accessLogs.length + auditLogs.length },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString(),
      record_id: 'batch_export',
    });

    return Response.json({ signed_url, checksum, filename });

  } catch (error) {
    console.error('Log export failed:', error);
    return Response.json({ error: 'Log export failed', details: error.message }, { status: 500 });
  }
});