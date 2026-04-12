import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RequestLogTable({ logs }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Per-key request logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!logs.length ? (
          <div className="text-sm text-[#a3a3a3]">No requests yet. Run a sandbox event to generate traffic.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-[#262626] bg-[#0a0a0a] p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs text-[#00d4ff]">{log.endpoint}</code>
                  <Badge className={log.status_code < 400 ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}>
                    {log.status_code}
                  </Badge>
                  {log.is_rate_limited && <Badge className="bg-[#f59e0b]/20 text-[#f59e0b]">rate limited</Badge>}
                </div>
                <span className="text-xs text-[#6b7280]">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-xs text-[#a3a3a3] flex flex-wrap gap-4 mb-3">
                <span>{log.method}</span>
                <span>{log.latency_ms}ms</span>
                {log.scope_matched && <span>{log.scope_matched}</span>}
                {log.failure_reason && <span>{log.failure_reason}</span>}
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <pre className="rounded bg-[#111111] p-3 overflow-auto text-[#d4d4d4]">{JSON.stringify(log.request_payload_preview || {}, null, 2)}</pre>
                <pre className="rounded bg-[#111111] p-3 overflow-auto text-[#d4d4d4]">{JSON.stringify(log.response_payload_preview || {}, null, 2)}</pre>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}