import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

// Minimal CSV parser — handles quoted fields
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

  return lines.slice(1).map(line => {
    // Split respecting quoted commas
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').replace(/^"|"$/g, ''); });
    return row;
  }).filter(row => Object.values(row).some(v => v));
}

// Resolve a stable user_id from a row: prefer email, then id/user_id column
function resolveUserId(row) {
  return row.email || row.user_id || row.id || row.userid || row.user_email || null;
}

function resolveEmail(row) {
  return row.email || row.user_email || row.e_mail || null;
}

function resolveName(row) {
  return row.name || row.full_name || row.display_name || row.first_name || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const { client_app_id, file_content, file_type, rows } = body;

    if (!client_app_id) return json({ error: 'client_app_id is required' }, 400);

    // Verify this app belongs to the user
    const app = await base44.asServiceRole.entities.ClientApp.get(client_app_id).catch(() => null);
    if (!app) return json({ error: 'App not found' }, 404);
    if (app.owner_id !== user.id && user.role !== 'admin') {
      return json({ error: 'Forbidden' }, 403);
    }

    // Parse rows from file content or pre-parsed rows
    let parsedRows = [];
    if (rows && Array.isArray(rows)) {
      parsedRows = rows;
    } else if (file_content && file_type === 'csv') {
      parsedRows = parseCSV(file_content);
    } else if (file_content && file_type === 'json') {
      const parsed = JSON.parse(file_content);
      parsedRows = Array.isArray(parsed) ? parsed : (parsed.users || parsed.data || []);
    } else {
      return json({ error: 'Provide rows, or file_content + file_type (csv|json)' }, 400);
    }

    if (parsedRows.length === 0) return json({ error: 'No rows found in file' }, 400);
    if (parsedRows.length > 10000) return json({ error: 'Maximum 10,000 users per import' }, 400);

    const batchId = crypto.randomUUID();
    const now = new Date().toISOString();
    let imported = 0;
    let skipped = 0;
    const errors = [];

    // Process in chunks of 50
    const CHUNK = 50;
    for (let i = 0; i < parsedRows.length; i += CHUNK) {
      const chunk = parsedRows.slice(i, i + CHUNK);
      await Promise.all(chunk.map(async (row) => {
        const userId = resolveUserId(row);
        if (!userId) { skipped++; return; }

        const email = resolveEmail(row);
        const displayName = resolveName(row);

        // Build traits from remaining columns
        const reserved = new Set(['email', 'user_id', 'id', 'userid', 'user_email', 'e_mail', 'name', 'full_name', 'display_name', 'first_name']);
        const traits = {};
        for (const [k, v] of Object.entries(row)) {
          if (!reserved.has(k) && v) traits[k] = v;
        }

        // Check if already exists for this app
        const existing = await base44.asServiceRole.entities.ImportedUser.filter(
          { client_app_id, user_id: String(userId) }, null, 1
        ).catch(() => []);

        if (existing.length > 0) { skipped++; return; }

        await base44.asServiceRole.entities.ImportedUser.create({
          client_app_id,
          user_id: String(userId),
          email: email || null,
          display_name: displayName || null,
          traits,
          import_batch_id: batchId,
          tracking_started: false
        });

        // Seed a synthetic "user_imported" event so they appear in the system immediately
        await base44.asServiceRole.entities.CapturedEvent.create({
          client_app_id,
          user_id: String(userId),
          session_id: crypto.randomUUID(),
          event_type: 'page_view',
          event_payload: {
            url: 'imported',
            source: 'user_import',
            import_batch_id: batchId,
            email: email || null,
            display_name: displayName || null
          },
          device_info: {},
          timestamp: now,
          processed: false,
          is_demo: false
        });

        imported++;
      }));
    }

    return json({
      success: true,
      batch_id: batchId,
      imported,
      skipped,
      total: parsedRows.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error('importUsers error:', error);
    return json({ error: error.message }, 500);
  }
});