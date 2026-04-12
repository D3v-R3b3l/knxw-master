import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';

export default function ApiKeyTable({ apiKeys, onRotate, onRevoke }) {
  if (!apiKeys.length) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-6 text-sm text-[#a3a3a3]">
          No API keys yet. Create your first scoped key to start testing.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((key) => (
        <Card key={key.id} className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-white">{key.name}</h3>
                <Badge className={key.status === 'active' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}>
                  {key.status}
                </Badge>
                <code className="text-xs text-[#a3a3a3] bg-[#0a0a0a] px-2 py-1 rounded">{key.key_prefix}••••••••</code>
              </div>
              <div className="flex flex-wrap gap-2">
                {(key.scopes || []).map((scope) => (
                  <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                ))}
              </div>
              <div className="text-xs text-[#6b7280] flex flex-wrap gap-4">
                <span>{key.rate_limit_rpm} req/min</span>
                <span>Burst {key.rate_limit_burst}</span>
                {key.last_used_at && <span>Last used {new Date(key.last_used_at).toLocaleString()}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {key.status === 'active' && (
                <Button size="sm" variant="outline" onClick={() => onRotate(key)} className="border-[#262626] text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />Rotate
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onRevoke(key)} className="text-[#ef4444] hover:bg-[#ef4444]/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}