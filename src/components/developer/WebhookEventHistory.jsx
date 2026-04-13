import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function WebhookEventHistory({ sessions, onRetry }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Fired event history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!sessions.length ? (
          <div className="text-sm text-[#a3a3a3]">No webhook events fired yet.</div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="rounded-lg border border-[#262626] bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-medium text-white">{session.name}</div>
                  <div className="text-xs text-[#6b7280] break-all">{session.endpoint}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={session.status === 'delivered' ? 'bg-[#10b981]/20 text-[#10b981]' : session.status === 'failed' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#6b7280]/20 text-[#d1d5db]'}>
                    {session.status}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => onRetry(session)} className="text-[#fbbf24] hover:bg-[#fbbf24]/10">
                    <RotateCcw className="w-4 h-4 mr-2" />Retry
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <pre className="rounded bg-[#111111] p-3 overflow-auto text-[#d4d4d4]">{JSON.stringify(session.request_payload || {}, null, 2)}</pre>
                <pre className="rounded bg-[#111111] p-3 overflow-auto text-[#d4d4d4]">{JSON.stringify(session.response_payload || {}, null, 2)}</pre>
              </div>
              {session.failure_reason && <div className="text-xs text-[#ef4444]">{session.failure_reason}</div>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}