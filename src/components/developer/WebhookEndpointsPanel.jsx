import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Play, RotateCcw, Plus } from 'lucide-react';

export default function WebhookEndpointsPanel({ endpoints, onAdd, onEdit, onTest, onRetry }) {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Webhook endpoints</CardTitle>
        <Button onClick={onAdd} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
          <Plus className="w-4 h-4 mr-2" />Add endpoint
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!endpoints.length ? (
          <div className="text-sm text-[#a3a3a3]">No webhook endpoints yet.</div>
        ) : (
          endpoints.map((endpoint) => (
            <div key={endpoint.id} className="rounded-lg border border-[#262626] bg-[#0a0a0a] p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{endpoint.name}</h3>
                  <Badge className={endpoint.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#6b7280]/20 text-[#d1d5db]'}>{endpoint.status || 'active'}</Badge>
                </div>
                <code className="text-xs text-[#00d4ff] break-all">{endpoint.url}</code>
                {endpoint.description && <p className="text-sm text-[#a3a3a3]">{endpoint.description}</p>}
                <div className="flex gap-2 flex-wrap">
                  {(endpoint.event_types || []).map((eventType) => (
                    <Badge key={eventType} variant="outline" className="text-xs">{eventType}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => onEdit(endpoint)} className="border-[#262626] text-white">
                  <Edit className="w-4 h-4 mr-2" />Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onTest(endpoint)} className="border-[#262626] text-white">
                  <Play className="w-4 h-4 mr-2" />Test
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onRetry(endpoint)} className="text-[#fbbf24] hover:bg-[#fbbf24]/10">
                  <RotateCcw className="w-4 h-4 mr-2" />Retry
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}