import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAuditLogs } from "@/functions/getAuditLogs";
import { Loader2, ListFilter } from "lucide-react";

export default function AuditLogViewer() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  const load = async () => {
    setLoading(true);
    const { data, status } = await getAuditLogs({ offset: 0, limit: 100, query });
    if (status === 200) {
      setLogs(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="text-white">Audit Logs</CardTitle>
        <CardDescription className="text-[#a3a3a3]">Immutable record of administrator and system actions.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs..." className="bg-[#1a1a1a] border-[#262626] text-white pl-10" />
            <ListFilter className="w-4 h-4 text-[#a3a3a3] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button onClick={load} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-[#a3a3a3]">No logs found.</p>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="p-3 bg-[#0f0f0f] border border-[#262626] rounded-lg">
                <div className="flex justify-between">
                  <div className="text-white text-sm font-medium">{l.action}</div>
                  <div className="text-xs text-[#a3a3a3]">{new Date(l.created_date).toLocaleString()}</div>
                </div>
                <div className="text-xs text-[#a3a3a3]">{l.actor_email} • {l.ip || "N/A"}</div>
                {l.target_type || l.target_id ? (
                  <div className="text-xs text-[#6b7280] mt-1">{l.target_type} {l.target_id ? `• ${l.target_id}` : ""}</div>
                ) : null}
                {l.details ? (
                  <pre className="mt-2 text-xs text-[#a3a3a3] bg-[#111111] border border-[#262626] rounded p-2 overflow-auto">{JSON.stringify(l.details, null, 2)}</pre>
                ) : null}
              </div>
            ))
          )}
        </div>
        <div className="text-xs text-[#a3a3a3] mt-2">Total: {total}</div>
      </CardContent>
    </Card>
  );
}